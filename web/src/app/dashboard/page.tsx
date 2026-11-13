"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TEAMS_LIST } from '@/lib/teams';
import { Task, WorkLog, TeamId, TaskStatus, TaskPriority, ActivityEvent } from '@/lib/types';
import { getMemberByEmail } from '@/lib/members';
import TaskDetailModal from '@/components/TaskDetailModal';
import TaskCompleteModal from '@/components/TaskCompleteModal';
import { usePwaInstall } from '@/components/PwaInstallProvider';
import { useBackgroundSync } from '@/components/BackgroundSyncProvider';
import {
  getOfflineCachedTasks,
  cacheOfflineTasks,
  getOfflineCachedLogs,
  cacheOfflineLogs,
  getOutboxItems,
} from '@/lib/offlineDb';
import { isTaskAssignedToUser } from '@/lib/taskMatching';

// Modular Dashboard Architecture Imports
import { TASKS_STORAGE_KEY, STATUS_COLUMNS } from '@/constants/dashboard';
import { DashboardTab, SpecialDeadlineFilter, MemberCredential, UndoState } from '@/types/dashboard';
import BottomNav from '@/components/navigation/BottomNav';
import DashboardTabBar from '@/components/navigation/DashboardTabBar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ActionableKpiRibbon from '@/components/dashboard/ActionableKpiRibbon';
import DashboardOverviewTab from '@/components/dashboard/DashboardOverviewTab';
import TeamTasksTab from '@/components/dashboard/TeamTasksTab';
import MyWorkbenchTab from '@/components/dashboard/MyWorkbenchTab';
import SubsystemsTab from '@/components/dashboard/SubsystemsTab';
import VideoArchiveTab from '@/components/dashboard/VideoArchiveTab';
import VelocityMetricsTab from '@/components/dashboard/VelocityMetricsTab';
import MaterialsTab from '@/components/dashboard/MaterialsTab';
import CredentialsVaultTab from '@/components/dashboard/CredentialsVaultTab';
import ProfileView from '@/components/profile/ProfileView';
import CreateTaskModal from '@/components/shared/CreateTaskModal';
import DeleteTaskModal from '@/components/shared/DeleteTaskModal';
import BackupSyncModal from '@/components/shared/BackupSyncModal';
import ActivityDrawer from '@/components/shared/ActivityDrawer';
import UndoToast from '@/components/shared/UndoToast';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restrictedNotice = searchParams.get('restricted') === 'log';

  const { user, loading: authLoading, isAdmin, isCore, isLead, tier, logout } = useAuth();
  const { isInstalled, isStandalone, installApp } = usePwaInstall();
  const { enqueueTaskStatusUpdate, isOnline } = useBackgroundSync();
  const isCoreAdmin = Boolean(isCore || isAdmin || (user && user.teamId === 'core'));
  const canApproveCompletion = Boolean(
    isCore ||
    isLead ||
    isAdmin ||
    user?.isCore ||
    user?.isLead ||
    user?.teamId === 'core'
  );

  const [isMounted, setIsMounted] = useState(false);

  // Active view tab (default to 'dashboard' as Item 1)
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');

  // Handle URL query tab parameter (e.g. /dashboard?tab=team_tasks or ?tab=profile)
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      if (tabParam === 'kanban') {
        setActiveTab('team_tasks');
      } else if (
        [
          'dashboard',
          'team_tasks',
          'my_tasks',
          'profile',
          'teams',
          'videos',
          'metrics',
          'materials',
          'accounts',
        ].includes(tabParam)
      ) {
        setActiveTab(tabParam as DashboardTab);
      }
    }
  }, [searchParams]);

  // Handle immediate tab change dispatched from Burger Menu or Global Nav
  useEffect(() => {
    const handleCustomTab = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (
        detail &&
        [
          'dashboard',
          'team_tasks',
          'my_tasks',
          'profile',
          'teams',
          'videos',
          'metrics',
          'materials',
          'accounts',
        ].includes(detail)
      ) {
        setActiveTab(detail as DashboardTab);
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('tab', detail);
          window.history.pushState(null, '', url.toString());
        }
      }
    };
    window.addEventListener('siep_tab_change', handleCustomTab);
    return () => window.removeEventListener('siep_tab_change', handleCustomTab);
  }, []);

  // Browser back and forward button navigation support
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') as DashboardTab;
      if (tab && ['dashboard', 'team_tasks', 'my_tasks', 'profile', 'teams', 'videos', 'metrics', 'materials', 'accounts'].includes(tab)) {
        setActiveTab(tab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global event listeners for desktop navigation and action shortcuts
  useEffect(() => {
    const handleOpenActivity = () => setIsActivityDrawerOpen(true);
    const handleOpenBackup = () => setIsBackupModalOpen(true);
    const handleOpenCreate = () => setIsCreateModalOpen(true);

    window.addEventListener('siep_open_activity_drawer', handleOpenActivity);
    window.addEventListener('siep_open_backup_modal', handleOpenBackup);
    window.addEventListener('siep_open_create_modal', handleOpenCreate);

    return () => {
      window.removeEventListener('siep_open_activity_drawer', handleOpenActivity);
      window.removeEventListener('siep_open_backup_modal', handleOpenBackup);
      window.removeEventListener('siep_open_create_modal', handleOpenCreate);
    };
  }, []);

  // Instagram-style Create Action Sheet for center [+] button
  const [isCreateActionSheetOpen, setIsCreateActionSheetOpen] = useState(false);

  // Domain view scope for Team Tasks ('assigned' = member's squads only; 'all' = all 9 squads)
  const [domainViewScope, setDomainViewScope] = useState<'assigned' | 'all'>('assigned');

  // Member's assigned domain IDs (primary + secondary, verified against roster)
  const memberDomainIds: TeamId[] = useMemo(() => {
    if (!user) return [];
    const list: TeamId[] = [user.teamId];
    if (user.secondaryTeams && Array.isArray(user.secondaryTeams)) {
      user.secondaryTeams.forEach((t) => {
        if (!list.includes(t)) list.push(t);
      });
    }
    const member = getMemberByEmail(user.email);
    if (member) {
      if (!list.includes(member.teamId)) list.push(member.teamId);
      if (member.secondaryTeams && Array.isArray(member.secondaryTeams)) {
        member.secondaryTeams.forEach((t) => {
          if (!list.includes(t)) list.push(t);
        });
      }
    }
    return list;
  }, [user]);

  // Mobile UI & Keyboard states
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  // Main data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [, setLoadingData] = useState(true);

  // Live Activity & Outbox State
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
  const [activitySubsystemFilter, setActivitySubsystemFilter] = useState<string>('all');
  const [lastReadActivityTimestamp, setLastReadActivityTimestamp] = useState<number>(0);
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);

  // Task Board filters & search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubsystemFilter, setSelectedSubsystemFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(false);
  const [specialDeadlineFilter, setSpecialDeadlineFilter] = useState<SpecialDeadlineFilter>('all');

  // Header quick more dropdown state
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Undo Toast state
  const [undoState, setUndoState] = useState<UndoState | null>(null);

  // Personal workbench state
  const [myTasksTabStatusFilter, setMyTasksTabStatusFilter] = useState<'all' | TaskStatus>('all');

  // Task Detail Modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Task Complete with Video Modal state
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Custom Delete Task Confirmation Modal state
  const [cardTaskToDelete, setCardTaskToDelete] = useState<Task | null>(null);
  const [isDeletingCardTask, setIsDeletingCardTask] = useState(false);
  const [cardMenuTaskId, setCardMenuTaskId] = useState<string | null>(null);

  // New task form modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Database Backup / Reset Modal state (Admin)
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [teamCredentials, setTeamCredentials] = useState<Record<string, { password: string; isCustom: boolean }>>({});
  const [memberCredentials, setMemberCredentials] = useState<MemberCredential[]>([]);

  // Fetch updated credentials for Core Leadership from Cloud Database
  const loadCredentials = useCallback(() => {
    if (user && isCoreAdmin) {
      fetch('/api/passwords')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.passwords) setTeamCredentials(data.passwords);
            if (data.memberCredentials) setMemberCredentials(data.memberCredentials);
          }
        })
        .catch(() => {});
    }
  }, [user, isCoreAdmin]);

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials, activeTab]);

  // Authentication protection: all logged-in members can view dashboard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?from=/dashboard');
    }
  }, [user, authLoading, router]);

  // Security guard: If non-core squad is on accounts tab, reset to kanban
  useEffect(() => {
    if (activeTab === 'accounts' && user && user.teamId !== 'core') {
      setActiveTab('team_tasks');
    }
  }, [activeTab, user]);

  // Auto-dismiss undo notification toast after 6 seconds
  useEffect(() => {
    if (!undoState) return;
    const timer = setTimeout(() => {
      setUndoState(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [undoState]);

  useEffect(() => {
    setIsMounted(true);
    // Clear legacy mock caches and hydrate tasks from local cache if available
    try {
      localStorage.removeItem('siep_tasks_cache_v1');
      localStorage.removeItem('siep_tasks_cache_v2');
      localStorage.removeItem('siep_tasks_cache_v3');
      const cached = localStorage.getItem(TASKS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((t: { id?: string }) => !t.id?.startsWith('task-seed'));
          setTasks(cleaned);
          localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(cleaned));
        }
      }
    } catch (e) {
      console.warn('Error reading local tasks cache:', e);
    }
  }, []);

  // Save tasks to localStorage cache on update
  const persistTasksLocal = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
    } catch (e) {
      console.warn('Error saving local tasks cache:', e);
    }
  };

  // Load tasks and logs from API + offline fallback
  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    // Immediately hydrate from offline caches if available
    getOfflineCachedTasks().then((cached) => {
      if (cached && cached.length > 0) setTasks(cached);
    });
    getOfflineCachedLogs().then((cached) => {
      if (cached && cached.length > 0) setLogs(cached);
    });

    try {
      const [tasksRes, logsRes] = await Promise.all([fetch('/api/tasks'), fetch('/api/logs')]);
      const tasksData = await tasksRes.json();
      const logsData = await logsRes.json();

      if (tasksData.success && Array.isArray(tasksData.tasks)) {
        persistTasksLocal(tasksData.tasks);
        cacheOfflineTasks(tasksData.tasks);
      }
      if (tasksData.activities && Array.isArray(tasksData.activities)) {
        setActivities(tasksData.activities);
      }
      if (logsData.success && Array.isArray(logsData.logs)) {
        setLogs(logsData.logs);
        cacheOfflineLogs(logsData.logs);
      }
    } catch (err) {
      console.warn('Network offline or failed, using cached dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  // Listen to background sync updates
  useEffect(() => {
    const handleSync = () => {
      loadDashboardData();
    };
    window.addEventListener('siep_task_synced', handleSync);
    window.addEventListener('siep_log_synced', handleSync);
    return () => {
      window.removeEventListener('siep_task_synced', handleSync);
      window.removeEventListener('siep_log_synced', handleSync);
    };
  }, [loadDashboardData]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  // Initialize last read activity timestamp from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('siep_last_read_activity');
      if (stored) {
        setLastReadActivityTimestamp(Number(stored));
      }
    } catch {}
  }, []);

  // Real-Time 10s Live Sync Engine + Outbox Queue Monitoring
  useEffect(() => {
    const checkQueue = async () => {
      try {
        const items = await getOutboxItems();
        setPendingQueueCount(items.filter((it) => it.status === 'queued').length);
      } catch {}
    };

    checkQueue();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        fetch('/api/tasks')
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.tasks)) {
              setTasks(data.tasks);
              cacheOfflineTasks(data.tasks);
            }
            if (data.activities && Array.isArray(data.activities)) {
              setActivities(data.activities);
            }
          })
          .catch(() => {});
        checkQueue();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const unreadActivitiesCount = useMemo(() => {
    if (!lastReadActivityTimestamp) return activities.length;
    return activities.filter((a) => a.timestamp > lastReadActivityTimestamp).length;
  }, [activities, lastReadActivityTimestamp]);

  const handleOpenActivityDrawer = () => {
    setIsActivityDrawerOpen(true);
    const now = Date.now();
    setLastReadActivityTimestamp(now);
    try {
      localStorage.setItem('siep_last_read_activity', String(now));
    } catch {}
  };

  // Keyboard avoidance for mobile bottom navigation
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')
      ) {
        setIsInputFocused(true);
      }
    };
    const handleFocusOut = () => {
      setIsInputFocused(false);
    };
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  // Manual fast sync trigger for mobile bottom hub
  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      await loadDashboardData();
    } finally {
      setTimeout(() => setIsManualSyncing(false), 600);
    }
  };

  // Dedicated memo for all tasks assigned to the current member within their assigned domain(s)
  const myAssignedTasks = useMemo(() => {
    if (!user) return [];
    return tasks.filter((t) => {
      if (!isTaskAssignedToUser(t, user)) return false;
      // Scoped to member's assigned domain(s)
      if (!isCoreAdmin || domainViewScope === 'assigned') {
        if (!memberDomainIds.includes(t.teamId)) return false;
      }
      return true;
    });
  }, [tasks, user, isCoreAdmin, domainViewScope, memberDomainIds]);

  const myAssignedCount = myAssignedTasks.length;

  const myTasksBreakdown = useMemo(() => {
    const todo = myAssignedTasks.filter((t) => t.status === 'todo').length;
    const inProgress = myAssignedTasks.filter((t) => t.status === 'in_progress').length;
    const review = myAssignedTasks.filter((t) => t.status === 'review').length;
    const done = myAssignedTasks.filter((t) => t.status === 'done').length;
    const total = myAssignedTasks.length;
    const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { todo, inProgress, review, done, total, completionPct };
  }, [myAssignedTasks]);

  // Actionable Deadlines & Review Counts
  const { overdueTasksList, dueThisWeekTasksList, underReviewTasksList } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const overdue: Task[] = [];
    const dueThisWeek: Task[] = [];
    const review: Task[] = [];

    tasks.forEach((t) => {
      if (t.status === 'review') review.push(t);
      if (t.status !== 'done' && t.dueDate) {
        const parts = t.dueDate.split('-');
        if (parts.length === 3) {
          const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 23, 59, 59);
          if (target.getTime() < today.getTime()) {
            overdue.push(t);
          } else if (target.getTime() <= nextWeek.getTime()) {
            dueThisWeek.push(t);
          }
        }
      }
    });

    return {
      overdueTasksList: overdue,
      dueThisWeekTasksList: dueThisWeek,
      underReviewTasksList: review,
    };
  }, [tasks]);

  // Filtered Tasks computation
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Assigned to me filter
      if (assignedToMeOnly && user) {
        if (!isTaskAssignedToUser(task, user)) return false;
      }
      // Domain-scoped filtering for Team Tasks (only assigned domain's tasks visible)
      if ((activeTab === 'team_tasks' || activeTab === 'kanban') && !assignedToMeOnly) {
        if (!isCoreAdmin || domainViewScope === 'assigned') {
          if (!memberDomainIds.includes(task.teamId)) {
            return false;
          }
        }
      }
      // Subsystem filter (only applies if assignedToMeOnly is false)
      if (!assignedToMeOnly && selectedSubsystemFilter !== 'all' && task.teamId !== selectedSubsystemFilter) {
        return false;
      }
      // Priority filter
      if (selectedPriorityFilter !== 'all' && task.priority !== selectedPriorityFilter) {
        return false;
      }
      // Special Deadline / Actionable KPI filter
      if (specialDeadlineFilter === 'overdue') {
        if (task.status === 'done' || !task.dueDate) return false;
        const parts = task.dueDate.split('-');
        if (parts.length !== 3) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 23, 59, 59);
        if (target.getTime() >= today.getTime()) return false;
      } else if (specialDeadlineFilter === 'due_week') {
        if (task.status === 'done' || !task.dueDate) return false;
        const parts = task.dueDate.split('-');
        if (parts.length !== 3) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 23, 59, 59);
        if (target.getTime() < today.getTime() || target.getTime() > nextWeek.getTime()) return false;
      } else if (specialDeadlineFilter === 'review') {
        if (task.status !== 'review') return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = task.title.toLowerCase().includes(q);
        const descMatch = (task.description || '').toLowerCase().includes(q);
        const memberMatch = Array.isArray(task.assignedMembers)
          ? task.assignedMembers.some((m) => m.toLowerCase().includes(q))
          : String(task.assignedMembers || '').toLowerCase().includes(q);
        const teamMatch = (task.teamId || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !memberMatch && !teamMatch) {
          return false;
        }
      }
      return true;
    });
  }, [
    tasks,
    selectedSubsystemFilter,
    selectedPriorityFilter,
    searchQuery,
    assignedToMeOnly,
    specialDeadlineFilter,
    user,
    activeTab,
    isCoreAdmin,
    domainViewScope,
    memberDomainIds,
  ]);

  // Loading skeleton
  if (!isMounted || authLoading || !user) {
    return (
      <div className="min-h-screen bg-alice-blue flex items-center justify-center font-mono text-sm text-grey">
        <span className="w-5 h-5 border-2 border-orange border-t-transparent rounded-full animate-spin mr-3"></span>
        Connecting to SIEP Operations Center...
      </div>
    );
  }

  // Create Task Submission
  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    teamId: TeamId;
    assignedMembers: string[];
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string;
  }) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });

    const data = await res.json();
    if (data.success && data.task) {
      const nextTasks = [data.task, ...tasks];
      persistTasksLocal(nextTasks);
    } else {
      throw new Error(data.error || 'Failed to create task');
    }
  };

  // Move Task Status (Kanban quick advance / rewind with Undo support)
  const handleMoveStatus = async (e: React.MouseEvent, taskId: string, nextStatus: TaskStatus) => {
    e.stopPropagation();

    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask) return;
    const prevStatus = currentTask.status;

    if (nextStatus === 'done') {
      if (!canApproveCompletion) {
        alert('Hierarchy Rule: Only Squad Leads and Core Leadership can approve and mark tasks as Completed.');
        return;
      }
      setTaskToComplete(currentTask);
      setIsCompleteModalOpen(true);
      return;
    }

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: nextStatus, updatedAt: Date.now() } : t
    );
    persistTasksLocal(updatedTasks);
    cacheOfflineTasks(updatedTasks);

    const nextColLabel = STATUS_COLUMNS.find((c) => c.id === nextStatus)?.label || nextStatus;
    setUndoState({
      taskId,
      previousStatus: prevStatus,
      message: `"${currentTask.title.slice(0, 32)}..." moved to ${nextColLabel}`,
    });

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      enqueueTaskStatusUpdate({ taskId, nextStatus });
      return;
    }

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: nextStatus }),
      });
    } catch (err) {
      console.warn('Network offline or update failed, queuing status update:', err);
      enqueueTaskStatusUpdate({ taskId, nextStatus });
    }
  };

  // Revert / Undo status advancement
  const handleUndoMoveStatus = async () => {
    if (!undoState) return;
    const { taskId, previousStatus } = undoState;
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: previousStatus, updatedAt: Date.now() } : t
    );
    persistTasksLocal(updatedTasks);
    cacheOfflineTasks(updatedTasks);
    setUndoState(null);

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: previousStatus }),
      });
    } catch (err) {
      console.warn('Network offline or undo failed:', err);
    }
  };

  const confirmDeleteCardTask = async () => {
    if (!cardTaskToDelete) return;
    const taskId = cardTaskToDelete.id;
    setIsDeletingCardTask(true);

    const remainingTasks = tasks.filter((t) => t.id !== taskId);
    persistTasksLocal(remainingTasks);

    try {
      await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete task:', err);
      loadDashboardData();
    } finally {
      setIsDeletingCardTask(false);
      setCardTaskToDelete(null);
    }
  };

  // Modal Callbacks
  const handleModalTaskUpdated = (updatedTask: Task) => {
    const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    persistTasksLocal(updated);
    setSelectedTask(updatedTask);
  };

  const handleModalTaskDeleted = (taskId: string) => {
    const remaining = tasks.filter((t) => t.id !== taskId);
    persistTasksLocal(remaining);
    setIsDetailModalOpen(false);
    setSelectedTask(null);
  };

  // Open Task Detail
  const handleOpenTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  // Quick 1-click self-assign or toggle
  const handleQuickAssignToMe = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (!user) return;
    const myName = user.displayName;
    const currentMembers = Array.isArray(task.assignedMembers)
      ? [...task.assignedMembers]
      : typeof task.assignedMembers === 'string'
      ? (task.assignedMembers as string).split(',').map((s) => s.trim())
      : [];

    const isAssigned = isTaskAssignedToUser(task, user);
    let updatedMembers: string[];
    if (isAssigned) {
      updatedMembers = currentMembers.filter(
        (m) =>
          m.toLowerCase() !== myName.toLowerCase() &&
          !m.toLowerCase().includes(myName.toLowerCase()) &&
          !myName.toLowerCase().includes(m.toLowerCase())
      );
    } else {
      updatedMembers = [...currentMembers, myName];
    }

    const updatedTask: Task = {
      ...task,
      assignedMembers: updatedMembers,
      updatedAt: Date.now(),
    };

    setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
    persistTasksLocal(tasks.map((t) => (t.id === task.id ? updatedTask : t)));

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          assignedMembers: updatedMembers,
        }),
      });
    } catch (err) {
      console.warn('Failed to update task assignment:', err);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;
    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask || currentTask.status === status) return;

    if (status === 'done') {
      if (!canApproveCompletion) {
        alert('Hierarchy Rule: Only Squad Leads and Core Leadership can approve and mark tasks as Completed.');
        return;
      }
      setTaskToComplete(currentTask);
      setIsCompleteModalOpen(true);
      return;
    }

    const prevStatus = currentTask.status;
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status, updatedAt: Date.now() } : t
    );
    persistTasksLocal(updatedTasks);
    cacheOfflineTasks(updatedTasks);

    const nextColLabel = STATUS_COLUMNS.find((c) => c.id === status)?.label || status;
    setUndoState({
      taskId,
      previousStatus: prevStatus,
      message: `"${currentTask.title.slice(0, 32)}..." moved to ${nextColLabel}`,
    });

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status }),
      });
    } catch (err) {
      console.warn('Network offline or drag update failed:', err);
      enqueueTaskStatusUpdate({ taskId, nextStatus: status });
    }
  };

  // Backup & Reset Handlers (Admin)
  const handleExportBackup = async () => {
    try {
      const res = await fetch('/api/store/backup');
      const data = await res.json();
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `siep_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setBackupStatus('Backup successfully downloaded to your computer!');
      } else {
        setBackupStatus(`Export error: ${data.error}`);
      }
    } catch {
      setBackupStatus('Network error while exporting backup.');
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('CAUTION: This will clear all tasks and logs to an empty state. Proceed?')) return;
    setIsResetting(true);
    setBackupStatus(null);
    try {
      const res = await fetch('/api/store/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem(TASKS_STORAGE_KEY);
        setTasks([]);
        setLogs([]);
        setBackupStatus('Database successfully cleared to clean empty state!');
        loadDashboardData();
      } else {
        setBackupStatus(`Reset error: ${data.error}`);
      }
    } catch {
      setBackupStatus('Network error while resetting database.');
    } finally {
      setIsResetting(false);
    }
  };

  // Switch to Kanban with pre-filtered team
  const handleViewTeamTasksInKanban = (teamId: string) => {
    setSelectedSubsystemFilter(teamId);
    setActiveTab('team_tasks');
  };

  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status !== 'done').length;
  const videoLogsCount = logs.filter((l) => Boolean(l.videoUrl)).length;

  return (
    <main
      className={`min-h-screen bg-alice-blue text-jet-black pt-20 sm:pt-24 ${
        isStandalone ? 'pb-32 sm:pb-24' : 'pb-12 sm:pb-16'
      } px-3 sm:px-6 lg:px-8 font-sans`}
    >
      {/* Background CAD accent */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#2B303A_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-5 sm:space-y-8">
        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <DashboardOverviewTab
            tasks={tasks}
            logs={logs}
            memberDomainIds={memberDomainIds}
            isCore={isCore}
            isLead={isLead}
            setActiveTab={setActiveTab}
            setSelectedSubsystemFilter={setSelectedSubsystemFilter}
          />
        )}

        {/* Tab 2: Team Tasks / Kanban */}
        {(activeTab === 'team_tasks' || activeTab === 'kanban') && (
          <TeamTasksTab
            user={user}
            isCoreAdmin={isCoreAdmin}
            memberDomainIds={memberDomainIds}
            domainViewScope={domainViewScope}
            setDomainViewScope={setDomainViewScope}
            tasks={tasks}
            filteredTasks={filteredTasks}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedPriorityFilter={selectedPriorityFilter}
            setSelectedPriorityFilter={setSelectedPriorityFilter}
            selectedSubsystemFilter={selectedSubsystemFilter}
            setSelectedSubsystemFilter={setSelectedSubsystemFilter}
            assignedToMeOnly={assignedToMeOnly}
            setAssignedToMeOnly={setAssignedToMeOnly}
            myAssignedCount={myAssignedCount}
            specialDeadlineFilter={specialDeadlineFilter}
            setSpecialDeadlineFilter={setSpecialDeadlineFilter}
            handleOpenTaskDetail={handleOpenTaskDetail}
            handleMoveStatus={handleMoveStatus}
            handleQuickAssignToMe={handleQuickAssignToMe}
            setCardTaskToDelete={setCardTaskToDelete}
            cardMenuTaskId={cardMenuTaskId}
            setCardMenuTaskId={setCardMenuTaskId}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            handleDragStart={handleDragStart}
            canApproveCompletion={canApproveCompletion}
          />
        )}

        {/* Tab 3: Dedicated Personal Workbench */}
        {activeTab === 'my_tasks' && (
          <MyWorkbenchTab
            user={user}
            myAssignedTasks={myAssignedTasks}
            myTasksBreakdown={myTasksBreakdown}
            myTasksTabStatusFilter={myTasksTabStatusFilter}
            setMyTasksTabStatusFilter={setMyTasksTabStatusFilter}
            handleOpenTaskDetail={handleOpenTaskDetail}
            handleMoveStatus={handleMoveStatus}
            setActiveTab={setActiveTab}
            memberDomainIds={memberDomainIds}
            isCoreAdmin={isCoreAdmin}
            domainViewScope={domainViewScope}
            canApproveCompletion={canApproveCompletion}
          />
        )}

        {/* Tab 4: Subsystem Overview */}
        {activeTab === 'teams' && (
          <SubsystemsTab
            tasks={tasks}
            logs={logs}
            isCore={isCore}
            isLead={isLead}
            memberDomainIds={memberDomainIds}
            handleOpenTaskDetail={handleOpenTaskDetail}
            handleViewTeamTasksInKanban={handleViewTeamTasksInKanban}
          />
        )}

        {/* Tab 5: Video Archive */}
        {activeTab === 'videos' && <VideoArchiveTab logs={logs} />}

        {/* Tab 6: Metrics & Velocity */}
        {activeTab === 'metrics' && (
          <VelocityMetricsTab
            tasks={tasks}
            logs={logs}
            handleManualSync={handleManualSync}
            isManualSyncing={isManualSyncing}
            handleOpenTaskDetail={handleOpenTaskDetail}
            setSelectedSubsystemFilter={setSelectedSubsystemFilter}
            setActiveTab={setActiveTab}
          />
        )}

        {/* Tab 7: Dedicated Research & Materials Repository */}
        {activeTab === 'materials' && (
          <MaterialsTab user={user} isCore={isCore} isLead={isLead} />
        )}

        {/* Tab 8: Core Admin Credentials Vault */}
        {activeTab === 'accounts' && isCoreAdmin && (
          <CredentialsVaultTab
            memberCredentials={memberCredentials}
            teamCredentials={teamCredentials}
            loadCredentials={loadCredentials}
          />
        )}

        {/* Tab 8: Personal Profile */}
        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            tier={tier}
            logout={logout}
            isInstalled={isInstalled}
            installApp={installApp}
            tasks={tasks}
            logs={logs}
            setActiveTab={setActiveTab}
          />
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedTask(null);
          }}
          task={selectedTask}
          canEdit={Boolean(isCoreAdmin || (user && (user.teamId === selectedTask.teamId || isTaskAssignedToUser(selectedTask, user))))}
          canDelete={Boolean(isCoreAdmin || (user && user.teamId === selectedTask.teamId))}
          isAdmin={isCoreAdmin}
          onTaskUpdated={handleModalTaskUpdated}
          onTaskDeleted={handleModalTaskDeleted}
        />
      )}

      {/* Complete Task with Video Proof Modal */}
      {taskToComplete && (
        <TaskCompleteModal
          isOpen={isCompleteModalOpen}
          onClose={() => {
            setIsCompleteModalOpen(false);
            setTaskToComplete(null);
          }}
          task={taskToComplete}
          onTaskCompleted={(updated: Task, createdLog?: WorkLog) => {
            handleModalTaskUpdated(updated);
            if (createdLog) {
              setLogs((prev) => [createdLog, ...prev]);
            }
            setIsCompleteModalOpen(false);
            setTaskToComplete(null);
          }}
        />
      )}

      {/* Create Deliverable Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        isCoreAdmin={isCoreAdmin}
        defaultTeam={user.teamId !== 'core' ? user.teamId : 'mechanical'}
        onSubmit={handleCreateTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteTaskModal
        task={cardTaskToDelete}
        isDeleting={isDeletingCardTask}
        onCancel={() => setCardTaskToDelete(null)}
        onConfirm={confirmDeleteCardTask}
      />

      {/* Core Admin Database Backup & Reset Modal */}
      <BackupSyncModal
        isOpen={isBackupModalOpen && isCoreAdmin}
        onClose={() => setIsBackupModalOpen(false)}
        backupStatus={backupStatus}
        isResetting={isResetting}
        onExportBackup={handleExportBackup}
        onResetDatabase={handleResetDatabase}
      />

      {/* Real-time Team Moves Activity Drawer */}
      <ActivityDrawer
        isOpen={isActivityDrawerOpen}
        onClose={() => setIsActivityDrawerOpen(false)}
        activities={activities}
        tasks={tasks}
        activitySubsystemFilter={activitySubsystemFilter}
        setActivitySubsystemFilter={setActivitySubsystemFilter}
        onOpenTaskDetail={handleOpenTaskDetail}
        onMarkRead={() => {
          const now = Date.now();
          setLastReadActivityTimestamp(now);
          localStorage.setItem('siep_last_read_activity', String(now));
        }}
      />

      {/* Floating Status Reversal Toast */}
      <UndoToast
        undoState={undoState}
        onUndo={handleUndoMoveStatus}
        onDismiss={() => setUndoState(null)}
      />

      {/* Instagram-Style Bottom Navigation Dock (strictly rendered only for installed Mobile Web App / Standalone mode) */}
      {isStandalone && (
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredTasksCount={filteredTasks.length}
          myAssignedCount={myAssignedCount}
          isCore={isCore}
          isLead={isLead}
          userDisplayName={user.displayName}
          userPhotoUrl={user.photoUrl}
          isInputFocused={isInputFocused}
          isCreateActionSheetOpen={isCreateActionSheetOpen}
          setIsCreateActionSheetOpen={setIsCreateActionSheetOpen}
          setIsActivityDrawerOpen={setIsActivityDrawerOpen}
          openCreateModal={() => setIsCreateModalOpen(true)}
        />
      )}
    </main>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-alice-blue flex items-center justify-center font-mono text-sm text-grey">
          <span className="w-5 h-5 border-2 border-orange border-t-transparent rounded-full animate-spin mr-3"></span>
          Connecting to SIEP Operations Center...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
