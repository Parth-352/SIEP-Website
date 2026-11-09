"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { TEAMS_LIST, TEAMS, ALL_TEAMS } from '@/lib/teams';
import { ROSTER_MEMBERS } from '@/lib/members';
import { Task, WorkLog, TeamId, TaskStatus, TaskPriority, ActivityEvent } from '@/lib/types';
import { getEmbeddableVideoUrl } from '@/lib/driveUpload';
import MemberSelect from '@/components/MemberSelect';
import TaskDetailModal from '@/components/TaskDetailModal';
import TaskCompleteModal from '@/components/TaskCompleteModal';
import { usePwaInstall } from '@/components/PwaInstallProvider';
import { useBackgroundSync } from '@/components/BackgroundSyncProvider';
import { getOfflineCachedTasks, cacheOfflineTasks, getOfflineCachedLogs, cacheOfflineLogs, getOutboxItems } from '@/lib/offlineDb';
import { isTaskAssignedToUser } from '@/lib/taskMatching';

const STATUS_COLUMNS: { id: TaskStatus; label: string; color: string; dotColor: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-zinc-100 text-zinc-700', dotColor: 'bg-zinc-400' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-orange/15 text-orange font-bold', dotColor: 'bg-orange' },
  { id: 'review', label: 'Under Review', color: 'bg-purple-100 text-purple-700 font-bold', dotColor: 'bg-purple-500' },
  { id: 'done', label: 'Completed', color: 'bg-emerald-100 text-emerald-800 font-bold', dotColor: 'bg-emerald-500' },
];

const PRIORITY_BADGES: Record<TaskPriority, { label: string; bg: string }> = {
  urgent: { label: 'Urgent', bg: 'bg-red-500 text-white' },
  high: { label: 'High', bg: 'bg-orange text-jet-black font-bold' },
  medium: { label: 'Medium', bg: 'bg-amber-100 text-amber-800' },
  low: { label: 'Low', bg: 'bg-zinc-100 text-zinc-600' },
};

const TASKS_STORAGE_KEY = 'siep_tasks_cache_v3';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restrictedNotice = searchParams.get('restricted') === 'log';

  const { user, loading: authLoading, isAdmin, isCore, isLead, tier, logout } = useAuth();
  const { isInstalled, installApp } = usePwaInstall();
  const { enqueueTaskStatusUpdate, isOnline } = useBackgroundSync();
  const isCoreAdmin = Boolean(isCore || isAdmin || (user && user.teamId === 'core'));

  const [isMounted, setIsMounted] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'my_tasks' | 'kanban' | 'teams' | 'videos' | 'accounts'>('kanban');

  // Mobile All-in-One Bottom Menu & Keyboard states
  const [isMobileQuickMenuOpen, setIsMobileQuickMenuOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  // Main data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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

  // Personal workbench state
  const [isMyTasksCollapsed, setIsMyTasksCollapsed] = useState(false);
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

  // New task form modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskTeam, setNewTaskTeam] = useState<TeamId>('mechanical');
  const [newTaskMembers, setNewTaskMembers] = useState<string[]>([]);
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Database Backup / Reset Modal state (Admin)
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showCredentialsPasswords, setShowCredentialsPasswords] = useState(false);
  const [teamCredentials, setTeamCredentials] = useState<Record<string, { password: string; isCustom: boolean }>>({});
  const [memberCredentials, setMemberCredentials] = useState<
    Array<{
      id: string;
      name: string;
      email: string;
      role: string;
      teamId: TeamId;
      isCore: boolean;
      isLead: boolean;
      tier: number;
      password: string;
      isCustom: boolean;
    }>
  >([]);
  const [accountsViewMode, setAccountsViewMode] = useState<'members' | 'teams'>('members');

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
      setActiveTab('kanban');
    }
  }, [activeTab, user]);

  useEffect(() => {
    setIsMounted(true);
    // Clear legacy mock caches and hydrate tasks from local cache if available
    try {
      localStorage.removeItem('siep_tasks_cache_v1');
      localStorage.removeItem('siep_tasks_cache_v2');
      const cached = localStorage.getItem(TASKS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
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
      const [tasksRes, logsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/logs'),
      ]);
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

  const filteredActivities = useMemo(() => {
    if (activitySubsystemFilter === 'all') return activities;
    return activities.filter((a) => a.teamId === activitySubsystemFilter);
  }, [activities, activitySubsystemFilter]);

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
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
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

  // Handle default new task team selection based on user
  useEffect(() => {
    if (user && user.teamId !== 'core') {
      setNewTaskTeam(user.teamId);
    }
  }, [user]);

  // Dedicated memo for all tasks assigned to the current member
  const myAssignedTasks = useMemo(() => {
    if (!user) return [];
    return tasks.filter((t) => isTaskAssignedToUser(t, user));
  }, [tasks, user]);

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

  // Filtered Tasks computation (hook called before any early return)
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Assigned to me filter
      if (assignedToMeOnly && user) {
        if (!isTaskAssignedToUser(task, user)) return false;
      }
      // Subsystem filter (only applies if assignedToMeOnly is false)
      if (!assignedToMeOnly && selectedSubsystemFilter !== 'all' && task.teamId !== selectedSubsystemFilter) {
        return false;
      }
      // Priority filter
      if (selectedPriorityFilter !== 'all' && task.priority !== selectedPriorityFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = task.title.toLowerCase().includes(q);
        const descMatch = (task.description || '').toLowerCase().includes(q);
        const memberMatch = Array.isArray(task.assignedMembers)
          ? task.assignedMembers.some((m) => m.toLowerCase().includes(q))
          : String(task.assignedMembers || '').toLowerCase().includes(q);
        const teamMatch = (TEAMS[task.teamId]?.name || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !memberMatch && !teamMatch) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, selectedSubsystemFilter, selectedPriorityFilter, searchQuery, assignedToMeOnly, user]);

  // Loading skeleton
  if (!isMounted || authLoading || !user) {
    return (
      <div className="min-h-screen bg-alice-blue flex items-center justify-center font-mono text-sm text-grey">
        <span className="w-5 h-5 border-2 border-orange border-t-transparent rounded-full animate-spin mr-3"></span>
        Connecting to SIEP Operations Center...
      </div>
    );
  }

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    if (!newTaskTitle.trim()) {
      setCreateError('Task title is required');
      return;
    }

    setIsSubmittingTask(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: newTaskDesc.trim(),
          teamId: newTaskTeam,
          assignedMembers: newTaskMembers,
          priority: newTaskPriority,
          status: newTaskStatus,
          dueDate: newTaskDueDate || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.task) {
        const nextTasks = [data.task, ...tasks];
        persistTasksLocal(nextTasks);
        setNewTaskTitle('');
        setNewTaskDesc('');
        setNewTaskMembers([]);
        setNewTaskDueDate('');
        setNewTaskStatus('todo');
        setIsCreateModalOpen(false);
      } else {
        setCreateError(data.error || 'Failed to create task');
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setCreateError('Network error while creating task');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Move Task Status (Kanban quick advance / rewind)
  const handleMoveStatus = async (e: React.MouseEvent, taskId: string, nextStatus: TaskStatus) => {
    e.stopPropagation(); // Don't open detail modal

    if (nextStatus === 'done') {
      const task = tasks.find((t) => t.id === taskId);
      if (task) {
        setTaskToComplete(task);
        setIsCompleteModalOpen(true);
        return;
      }
    }

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: nextStatus, updatedAt: Date.now() } : t
    );
    persistTasksLocal(updatedTasks);
    cacheOfflineTasks(updatedTasks);

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

  // Prompt Delete Task
  const promptDeleteTask = (e: React.MouseEvent, taskItem: Task) => {
    e.stopPropagation();
    setCardTaskToDelete(taskItem);
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
    } catch (err) {
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
    } catch (err) {
      setBackupStatus('Network error while resetting database.');
    } finally {
      setIsResetting(false);
    }
  };

  // Switch to Kanban with pre-filtered team
  const handleViewTeamTasksInKanban = (teamId: string) => {
    setSelectedSubsystemFilter(teamId);
    setActiveTab('kanban');
  };

  // Overall Metrics
  const totalHours = logs.reduce((acc, curr) => acc + (curr.hoursSpent || 0), 0);
  const completedTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const videoLogsCount = logs.filter((l) => Boolean(l.videoUrl)).length;

  return (
    <main className="min-h-screen bg-alice-blue text-jet-black pt-20 sm:pt-24 pb-32 sm:pb-24 px-3 sm:px-6 lg:px-8 font-sans">
      
      {/* Background CAD accent */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#2B303A_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-5 sm:space-y-8">

        {/* =========================================================================
            DASHBOARD HEADER
            Spacious, modern project command console with quick actions
           ========================================================================= */}
        <div className="bg-white border border-jet-black/10 rounded-2xl p-4 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse"></span>
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-grey font-bold">
                  {isCore ? 'Operations Center • Central Leadership Privileges' : `Squad Console • ${TEAMS[user.teamId]?.name || user.teamName}`}
                </span>

                {/* Real-time Network & Sync Status Pill */}
                {isOnline ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 font-mono text-[9px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>LIVE SYNC</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 font-mono text-[9px] font-bold">
                    <span>📡</span>
                    <span>OFFLINE ({pendingQueueCount} QUEUED)</span>
                  </div>
                )}
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-jet-black tracking-tight">
                Project Operations Dashboard<span className="text-orange">.</span>
              </h1>
              <p className="text-grey font-light text-sm max-w-2xl leading-relaxed">
                Full-stack engineering pipeline for SIEP 2026–27. Manage subsystem deliverables, review task workflows, audit Google Drive video evidence, and keep all 9 squads aligned.
              </p>
            </div>

            {/* Quick Header Actions */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              {/* Squad Moves Activity Button */}
              <button
                type="button"
                onClick={handleOpenActivityDrawer}
                className="px-3.5 py-2.5 rounded-xl border border-jet-black/15 bg-white hover:bg-alice-blue text-jet-black hover:border-orange hover:text-orange text-xs font-mono font-bold uppercase transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 relative"
                title="View recent squad moves & activity feed"
              >
                <span>⚡ Squad Moves</span>
                {unreadActivitiesCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-orange text-white text-[9px] font-bold animate-pulse">
                    {unreadActivitiesCount}
                  </span>
                )}
              </button>

              {(isCore || isLead) && (
                <Link
                  href="/log"
                  className="px-4 py-2.5 rounded-xl border border-jet-black/15 bg-white hover:bg-alice-blue text-jet-black hover:border-orange hover:text-orange text-xs font-mono uppercase font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>Open Build Log</span>
                  <span>→</span>
                </Link>
              )}

              {isCoreAdmin && (
                <button
                  type="button"
                  onClick={() => setIsBackupModalOpen(true)}
                  className="px-3.5 py-2.5 rounded-xl border border-jet-black/15 bg-alice-blue/60 hover:bg-alice-blue text-jet-black text-xs font-mono font-bold uppercase transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                  title="Database Backup & Sync"
                >
                  <span>💾 Backup / Sync</span>
                </button>
              )}

              {!isInstalled && (
                <button
                  type="button"
                  onClick={installApp}
                  className="px-3.5 py-2.5 rounded-xl border border-orange/40 bg-orange/10 hover:bg-orange text-jet-black hover:text-white text-xs font-mono font-bold uppercase transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                  title="Install Web App on your phone or computer"
                >
                  <span>📲 Download App</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Task</span>
              </button>
            </div>

          </div>

          {/* Access Restriction Notice Banner */}
          {restrictedNotice && (
            <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-900 text-xs font-mono">
              <div className="flex items-center gap-2.5">
                <span className="text-base">🔒</span>
                <span>
                  The <strong>Engineering Log System (/log)</strong> is reserved for Core Leadership and Domain Leads. Your assigned deliverables are active on the Task Board below.
                </span>
              </div>
              <button
                type="button"
                onClick={() => router.replace('/dashboard')}
                className="text-grey hover:text-jet-black font-bold text-sm px-2 cursor-pointer"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* =========================================================================
            KPI METRICS BAR
            Spacious, 4-column metric cards with clean typography and breathing room
           ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white border border-jet-black/10 rounded-2xl p-6 shadow-sm hover:border-jet-black/20 transition-all space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-grey block">
              Subsystem Teams
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-black font-mono text-jet-black">{TEAMS_LIST.length}</span>
              <span className="text-xs text-emerald-600 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Connected
              </span>
            </div>
            <p className="text-[11px] font-mono text-grey">All 9 engineering squads live</p>
          </div>

          <div className="bg-white border border-jet-black/10 rounded-2xl p-6 shadow-sm hover:border-jet-black/20 transition-all space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-grey block">
              Active Pipeline Tasks
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-black font-mono text-orange">{inProgressTasks}</span>
              <span className="text-xs text-grey font-mono">
                in progress ({tasks.length} total)
              </span>
            </div>
            <p className="text-[11px] font-mono text-grey">
              {completedTasks} completed • {tasks.filter(t => t.status === 'todo').length} pending
            </p>
          </div>

          <div className="bg-white border border-jet-black/10 rounded-2xl p-6 shadow-sm hover:border-jet-black/20 transition-all space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-grey block">
              Video Evidence Clips
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-black font-mono text-sky-600">{videoLogsCount}</span>
              <span className="text-xs text-sky-700 font-mono font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                Drive 5 GB
              </span>
            </div>
            <p className="text-[11px] font-mono text-grey">Streaming from Google Drive</p>
          </div>

          <div className="bg-white border border-jet-black/10 rounded-2xl p-6 shadow-sm hover:border-jet-black/20 transition-all space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest text-grey block">
              Workshop Hours Logged
            </span>
            <div className="flex items-baseline gap-2.5">
              <span className="text-3xl sm:text-4xl font-black font-mono text-jet-black">{totalHours.toFixed(1)}</span>
              <span className="text-xs text-grey font-mono font-bold">hrs</span>
            </div>
            <p className="text-[11px] font-mono text-grey">{logs.length} step moves recorded</p>
          </div>

        </div>

        {/* =========================================================================
            PERSONAL ACTION WORKBENCH: TASKS ASSIGNED TO YOU
            Prominently displays all deliverables assigned to the currently logged-in member
           ========================================================================= */}
        <div className="bg-white border border-jet-black/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-jet-black/10">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-orange/15 text-orange flex items-center justify-center text-lg font-bold">
                📌
              </span>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-base sm:text-lg font-bold text-jet-black tracking-tight">
                    Tasks Assigned to You
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                    myAssignedCount > 0 ? 'bg-orange text-white' : 'bg-jet-black/10 text-grey'
                  }`}>
                    {myAssignedCount} {myAssignedCount === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
                <p className="text-xs text-grey font-mono mt-0.5">
                  Assigned to <strong className="text-jet-black">{user.displayName}</strong> across all engineering subsystems
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {myAssignedCount > 0 && (
                <div className="hidden md:flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-xl bg-alice-blue/60 border border-jet-black/5">
                  <span className="text-grey font-bold">Progress:</span>
                  <span className="text-orange font-bold">{myTasksBreakdown.inProgress} active</span>
                  <span className="text-grey">•</span>
                  <span className="text-emerald-600 font-bold">{myTasksBreakdown.done} done</span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsMyTasksCollapsed(!isMyTasksCollapsed)}
                className="text-xs font-mono px-3 py-1.5 rounded-xl border border-jet-black/15 bg-alice-blue/40 hover:bg-alice-blue text-jet-black font-bold transition-all cursor-pointer flex items-center gap-1"
                title={isMyTasksCollapsed ? "Expand assigned tasks" : "Collapse assigned tasks"}
              >
                <span>{isMyTasksCollapsed ? 'Expand ▼' : 'Collapse ▲'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAssignedToMeOnly(true);
                  setActiveTab('kanban');
                }}
                className="text-xs font-mono px-3.5 py-1.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold cursor-pointer whitespace-nowrap"
              >
                Filter on Board &rarr;
              </button>
            </div>
          </div>

          {/* Collapsible Content */}
          {!isMyTasksCollapsed && (
            <>
              {myAssignedTasks.length === 0 ? (
                <div className="py-8 px-4 rounded-xl bg-alice-blue/40 border border-dashed border-jet-black/15 text-center flex flex-col items-center justify-center space-y-2">
                  <span className="text-2xl">✨</span>
                  <p className="text-xs sm:text-sm font-mono font-bold text-jet-black">
                    No active tasks assigned to you right now. You're all caught up!
                  </p>
                  <p className="text-xs font-mono text-grey max-w-md">
                    Tasks assigned to {user.displayName} will appear here with one-click status advancement and work logging.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setAssignedToMeOnly(false);
                      setActiveTab('kanban');
                    }}
                    className="mt-1 px-3 py-1.5 rounded-lg border border-jet-black/20 bg-white hover:bg-jet-black hover:text-white text-xs font-mono font-bold transition-all cursor-pointer"
                  >
                    Browse All Squad Tasks &rarr;
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {myAssignedTasks.map((task) => {
                    const taskTeam = TEAMS[task.teamId];
                    const priorityInfo = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;
                    const canManageThisTask = true; // Assigned member has authority over their assigned deliverable

                    const statusBadge: Record<TaskStatus, { label: string; dot: string; bg: string; text: string }> = {
                      todo: { label: 'To Do', dot: 'bg-zinc-400', bg: 'bg-zinc-100', text: 'text-zinc-700' },
                      in_progress: { label: 'In Progress', dot: 'bg-orange animate-pulse', bg: 'bg-orange/10', text: 'text-orange font-bold' },
                      review: { label: 'Under Review', dot: 'bg-sky-500', bg: 'bg-sky-50', text: 'text-sky-700 font-bold' },
                      done: { label: 'Completed', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700 font-bold' },
                    };
                    const curStatus = statusBadge[task.status] || statusBadge.todo;

                    return (
                      <div
                        key={task.id}
                        onClick={() => handleOpenTaskDetail(task)}
                        className="group bg-alice-blue/30 hover:bg-white border border-jet-black/10 hover:border-orange/60 rounded-xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer space-y-3"
                      >
                        <div className="space-y-2.5">
                          {/* Subsystem & Priority */}
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${taskTeam?.badgeBg || 'bg-jet-black/5 text-jet-black'}`}>
                              [{taskTeam?.code}] {taskTeam?.shortName}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {task.isBlocked && (
                                <span className="px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-700 text-[9px] font-mono font-bold flex items-center gap-0.5" title={task.blockerReason || 'Blocked deliverable'}>
                                  <span>⚠️</span> Blocked
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold ${priorityInfo.bg}`}>
                                {priorityInfo.label}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider flex items-center gap-1 ${curStatus.bg} ${curStatus.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${curStatus.dot}`}></span>
                                {curStatus.label}
                              </span>
                            </div>
                          </div>

                          {/* Deliverable Title */}
                          <div>
                            <h4 className="text-sm font-bold text-jet-black leading-snug group-hover:text-orange transition-colors">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-xs text-grey mt-1 font-light line-clamp-2 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Subtasks Progress Bar */}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="space-y-1 pt-0.5">
                              <div className="flex items-center justify-between text-[10px] font-mono text-grey">
                                <span>☑ Checklist</span>
                                <span className="font-semibold text-jet-black">
                                  {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-jet-black/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 transition-all duration-300"
                                  style={{
                                    width: `${Math.round((task.subtasks.filter((st) => st.completed).length / task.subtasks.length) * 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Due date & co-assignees */}
                          <div className="pt-2 border-t border-jet-black/5 flex flex-wrap items-center justify-between gap-1.5 text-[10px] font-mono text-grey">
                            <div className="flex items-center gap-1.5">
                              {task.dueDate ? (
                                <span className="bg-white px-2 py-0.5 rounded border border-jet-black/10 text-jet-black font-semibold flex items-center gap-1">
                                  <span>📅</span> Due: {task.dueDate}
                                </span>
                              ) : (
                                <span className="italic text-grey/60">No due date</span>
                              )}
                              {task.comments && task.comments.length > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-white border border-jet-black/10 text-grey font-bold flex items-center gap-0.5 text-[9px]">
                                  <span>💬</span> {task.comments.length}
                                </span>
                              )}
                            </div>

                            {task.assignedMembers && task.assignedMembers.length > 1 && (
                              <span className="text-[10px] text-grey">
                                +{task.assignedMembers.length - 1} co-assigned
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Progression & Actions Footer */}
                        <div className="pt-2.5 border-t border-jet-black/5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {task.status !== 'todo' && (
                              <button
                                type="button"
                                disabled={!canManageThisTask}
                                onClick={(e) => {
                                  const prevIdx = STATUS_COLUMNS.findIndex((c) => c.id === task.status) - 1;
                                  if (prevIdx >= 0) handleMoveStatus(e, task.id, STATUS_COLUMNS[prevIdx].id);
                                }}
                                title="Move back"
                                className="px-2 py-1 text-[10px] font-mono bg-white hover:bg-jet-black/5 rounded-lg border border-jet-black/15 cursor-pointer font-bold transition-colors disabled:opacity-40"
                              >
                                ←
                              </button>
                            )}

                            {task.status !== 'done' && (
                              <button
                                type="button"
                                disabled={!canManageThisTask}
                                onClick={(e) => {
                                  const nextIdx = STATUS_COLUMNS.findIndex((c) => c.id === task.status) + 1;
                                  if (nextIdx < STATUS_COLUMNS.length) handleMoveStatus(e, task.id, STATUS_COLUMNS[nextIdx].id);
                                }}
                                title="Advance status"
                                className="px-2.5 py-1 text-[10px] font-mono bg-jet-black text-alice-blue hover:bg-orange rounded-lg font-bold transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1"
                              >
                                <span>Advance →</span>
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <Link
                              href={`/log?team=${task.teamId}&task=${encodeURIComponent(task.title)}`}
                              className="text-[10px] font-mono px-2 py-1 rounded-lg border border-orange/40 text-orange hover:bg-orange hover:text-white transition-all font-bold"
                            >
                              Log Work
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleOpenTaskDetail(task)}
                              className="text-[10px] font-mono text-grey hover:text-orange font-bold transition-colors cursor-pointer"
                            >
                              Details ↗
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* =========================================================================
            ELEVATED VIEW NAVIGATION TABS
            Segmented controller with clean icons and counts
           ========================================================================= */}
        <div className="bg-white border border-jet-black/10 rounded-2xl p-2 shadow-sm flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('my_tasks')}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'my_tasks'
                ? 'bg-jet-black text-alice-blue font-bold shadow-sm'
                : 'text-grey hover:text-jet-black hover:bg-alice-blue/60'
            }`}
          >
            <span>📌 My Tasks</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'my_tasks'
                ? 'bg-orange text-white'
                : myAssignedCount > 0
                ? 'bg-orange/15 text-orange'
                : 'bg-jet-black/10 text-jet-black'
            }`}>
              {myAssignedCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kanban')}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'kanban'
                ? 'bg-jet-black text-alice-blue font-bold shadow-sm'
                : 'text-grey hover:text-jet-black hover:bg-alice-blue/60'
            }`}
          >
            <span>Task Board</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'kanban' ? 'bg-white/20 text-alice-blue' : 'bg-jet-black/10 text-jet-black'
            }`}>
              {tasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'teams'
                ? 'bg-jet-black text-alice-blue font-bold shadow-sm'
                : 'text-grey hover:text-jet-black hover:bg-alice-blue/60'
            }`}
          >
            <span>Subsystems</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'teams' ? 'bg-white/20 text-alice-blue' : 'bg-jet-black/10 text-jet-black'
            }`}>
              {TEAMS_LIST.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('videos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'videos'
                ? 'bg-jet-black text-alice-blue font-bold shadow-sm'
                : 'text-grey hover:text-jet-black hover:bg-alice-blue/60'
            }`}
          >
            <span>Master Video Gallery</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === 'videos' ? 'bg-white/20 text-alice-blue' : 'bg-jet-black/10 text-jet-black'
            }`}>
              {videoLogsCount}
            </span>
          </button>

          {isCore && (
            <button
              type="button"
              onClick={() => setActiveTab('accounts')}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                activeTab === 'accounts'
                  ? 'bg-jet-black text-alice-blue font-bold shadow-sm'
                  : 'text-grey hover:text-jet-black hover:bg-alice-blue/60'
              }`}
            >
              <span>Team Credentials</span>
              <span className="text-[10px] text-orange font-bold uppercase font-mono px-1.5 py-0.5 rounded bg-orange/15">
                Core Only
              </span>
            </button>
          )}
        </div>

        {/* =========================================================================
            TAB 0: DEDICATED PERSONAL WORKBENCH (MY TASKS)
            Personal focus space for all deliverables assigned to the authenticated user
           ========================================================================= */}
        {activeTab === 'my_tasks' && (
          <div className="space-y-6">
            
            {/* Header & Filter Toolbar for My Tasks */}
            <div className="bg-white border border-jet-black/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse"></span>
                    <h3 className="text-base sm:text-lg font-bold text-jet-black">
                      Personal Action Workbench
                    </h3>
                  </div>
                  <p className="text-xs font-mono text-grey mt-0.5">
                    Managing {myAssignedCount} deliverables assigned to <strong className="text-jet-black">{user.displayName}</strong>
                  </p>
                </div>

                {/* Personal Completion Metric */}
                <div className="flex items-center gap-3">
                  <div className="text-right font-mono">
                    <div className="text-xs text-grey">Personal Progress</div>
                    <div className="text-sm font-bold text-jet-black">
                      {myTasksBreakdown.done} / {myTasksBreakdown.total} completed ({myTasksBreakdown.completionPct}%)
                    </div>
                  </div>
                  <div className="w-24 h-2.5 bg-alice-blue rounded-full overflow-hidden border border-jet-black/10 hidden sm:block">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${myTasksBreakdown.completionPct}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Status Filter Pills for My Tasks */}
              <div className="pt-3 border-t border-jet-black/5 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-grey font-bold shrink-0">
                  Filter Status:
                </span>

                <button
                  type="button"
                  onClick={() => setMyTasksTabStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    myTasksTabStatusFilter === 'all'
                      ? 'bg-jet-black text-alice-blue font-bold shadow-sm'
                      : 'bg-alice-blue/60 text-grey hover:text-jet-black hover:bg-alice-blue'
                  }`}
                >
                  <span>All Assigned</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    myTasksTabStatusFilter === 'all' ? 'bg-white/20 text-alice-blue' : 'bg-jet-black/10 text-jet-black'
                  }`}>
                    {myAssignedTasks.length}
                  </span>
                </button>

                {STATUS_COLUMNS.map((col) => {
                  const count = myAssignedTasks.filter((t) => t.status === col.id).length;
                  const isSelected = myTasksTabStatusFilter === col.id;
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => setMyTasksTabStatusFilter(col.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-jet-black text-alice-blue font-bold shadow-sm'
                          : 'bg-alice-blue/60 text-grey hover:text-jet-black hover:bg-alice-blue'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${col.dotColor}`}></span>
                      <span>{col.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isSelected ? 'bg-white/20 text-alice-blue' : 'bg-jet-black/10 text-jet-black'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* My Tasks Cards Layout */}
            {myAssignedTasks.length === 0 ? (
              <div className="bg-white border border-jet-black/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-orange/10 text-orange flex items-center justify-center text-2xl">
                  ✨
                </div>
                <h4 className="text-base font-mono font-bold text-jet-black">
                  No Active Tasks Assigned to You
                </h4>
                <p className="text-xs font-mono text-grey max-w-md leading-relaxed">
                  You are all caught up! When tasks are assigned to <strong className="text-jet-black">{user.displayName}</strong>, they will be organized here with status flow and drive video attachments.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('kanban')}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-mono text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm"
                >
                  Go to Team Task Board &rarr;
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {STATUS_COLUMNS.map((col) => {
                  const columnTasks = myAssignedTasks
                    .filter((t) => t.status === col.id)
                    .filter((t) => myTasksTabStatusFilter === 'all' || myTasksTabStatusFilter === col.id);

                  return (
                    <div
                      key={col.id}
                      className="bg-white border border-jet-black/10 rounded-2xl p-5 flex flex-col min-h-[400px] shadow-sm"
                    >
                      {/* Column Header */}
                      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-jet-black/10">
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`}></span>
                          <h4 className="text-xs font-mono uppercase font-black tracking-wider text-jet-black">
                            {col.label}
                          </h4>
                        </div>
                        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-alice-blue text-jet-black font-bold border border-jet-black/10">
                          {columnTasks.length}
                        </span>
                      </div>

                      {/* Cards */}
                      <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
                        {columnTasks.length === 0 ? (
                          <div className="h-32 border-2 border-dashed border-jet-black/10 rounded-xl flex items-center justify-center text-center p-3">
                            <span className="text-[11px] text-grey font-mono">
                              No tasks in {col.label}
                            </span>
                          </div>
                        ) : (
                          columnTasks.map((task) => {
                            const taskTeam = TEAMS[task.teamId];
                            const priorityInfo = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;

                            return (
                              <div
                                key={task.id}
                                onClick={() => handleOpenTaskDetail(task)}
                                className="group bg-alice-blue/40 hover:bg-white border border-jet-black/10 hover:border-orange/60 rounded-xl p-4 shadow-2xs hover:shadow-md transition-all space-y-3 cursor-pointer"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${taskTeam?.badgeBg || 'bg-jet-black/5 text-jet-black'}`}>
                                    [{taskTeam?.code}] {taskTeam?.shortName}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold ${priorityInfo.bg}`}>
                                    {priorityInfo.label}
                                  </span>
                                </div>

                                <div>
                                  <h5 className="text-sm font-bold text-jet-black leading-snug group-hover:text-orange transition-colors">
                                    {task.title}
                                  </h5>
                                  {task.description && (
                                    <p className="text-xs text-grey mt-1 font-light line-clamp-2 leading-relaxed">
                                      {task.description}
                                    </p>
                                  )}
                                </div>

                                <div className="pt-2 border-t border-jet-black/5 flex items-center justify-between text-[10px] font-mono text-grey">
                                  {task.dueDate ? (
                                    <span className="bg-white px-2 py-0.5 rounded border border-jet-black/10 text-jet-black font-semibold">
                                      📅 {task.dueDate}
                                    </span>
                                  ) : (
                                    <span className="italic text-grey/60">No due date</span>
                                  )}
                                </div>

                                <div className="pt-2.5 border-t border-jet-black/5 flex items-center justify-between">
                                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                    {col.id !== 'todo' && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          const prevIdx = STATUS_COLUMNS.findIndex((c) => c.id === col.id) - 1;
                                          if (prevIdx >= 0) handleMoveStatus(e, task.id, STATUS_COLUMNS[prevIdx].id);
                                        }}
                                        title="Move back"
                                        className="px-2 py-1 text-[10px] font-mono bg-white hover:bg-jet-black/5 rounded-lg border border-jet-black/15 cursor-pointer font-bold transition-colors"
                                      >
                                        ←
                                      </button>
                                    )}
                                    {col.id !== 'done' && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          const nextIdx = STATUS_COLUMNS.findIndex((c) => c.id === col.id) + 1;
                                          if (nextIdx < STATUS_COLUMNS.length) handleMoveStatus(e, task.id, STATUS_COLUMNS[nextIdx].id);
                                        }}
                                        title="Advance status"
                                        className="px-2.5 py-1 text-[10px] font-mono bg-jet-black text-alice-blue hover:bg-orange rounded-lg font-bold transition-colors cursor-pointer"
                                      >
                                        Advance →
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Link
                                      href={`/log?team=${task.teamId}&task=${encodeURIComponent(task.title)}`}
                                      className="text-[10px] font-mono px-2 py-1 rounded-lg border border-orange/40 text-orange hover:bg-orange hover:text-white transition-all font-bold"
                                    >
                                      Log
                                    </Link>
                                    <span className="text-[10px] font-mono text-grey group-hover:text-orange font-bold transition-colors">
                                      Details ↗
                                    </span>
                                  </div>
                                </div>

                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            TAB 1: KANBAN TASK BOARD
            Interactive board with Live Search, Subsystem Pills, and Task Click-to-Edit
           ========================================================================= */}
        {activeTab === 'kanban' && (
          <div className="space-y-6">
            
            {/* Filter & Search Bar */}
            <div className="bg-white border border-jet-black/10 rounded-2xl p-5 shadow-sm space-y-4">
              
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                
                {/* Search Input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-jet-black/15 text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                  />
                  <svg className="w-4 h-4 text-grey absolute left-3.5 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-2.5 text-grey hover:text-jet-black text-xs font-mono"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Priority Selector */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-grey uppercase font-bold">Priority:</span>
                  <select
                    value={selectedPriorityFilter}
                    onChange={(e) => setSelectedPriorityFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-jet-black/15 text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="all">All Priorities</option>
                    <option value="urgent">🔴 Urgent</option>
                    <option value="high">🟠 High Priority</option>
                    <option value="medium">🟡 Medium Priority</option>
                    <option value="low">⚪ Low Priority</option>
                  </select>
                </div>

              </div>

              {/* Subsystem Filter Pills */}
              <div className="pt-3 border-t border-jet-black/5 flex items-center gap-2 overflow-x-auto hide-scrollbar touch-pan-x overscroll-x-contain scroll-smooth">
                <span className="text-[10px] font-mono uppercase text-grey font-bold shrink-0">
                  Subsystem:
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubsystemFilter('all');
                    setAssignedToMeOnly(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    selectedSubsystemFilter === 'all' && !assignedToMeOnly
                      ? 'bg-jet-black text-alice-blue font-bold shadow-sm'
                      : 'bg-alice-blue/60 text-grey hover:text-jet-black hover:bg-alice-blue'
                  }`}
                >
                  All Tasks ({tasks.length})
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const nextVal = !assignedToMeOnly;
                    setAssignedToMeOnly(nextVal);
                    if (nextVal) {
                      setSelectedSubsystemFilter('all');
                    }
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    assignedToMeOnly
                      ? 'bg-orange text-white font-bold shadow-md'
                      : 'bg-alice-blue/60 text-grey hover:text-jet-black hover:bg-alice-blue'
                  }`}
                >
                  <span>📌 Assigned to Me</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    assignedToMeOnly ? 'bg-white/30 text-white' : 'bg-jet-black/10 text-jet-black'
                  }`}>
                    {myAssignedCount}
                  </span>
                </button>

                {TEAMS_LIST.map((team) => {
                  const count = tasks.filter((t) => t.teamId === team.id).length;
                  const isSelected = selectedSubsystemFilter === team.id && !assignedToMeOnly;
                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => {
                        setSelectedSubsystemFilter(team.id);
                        setAssignedToMeOnly(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-jet-black text-alice-blue font-bold shadow-sm'
                          : 'bg-alice-blue/60 text-grey hover:text-jet-black hover:bg-alice-blue'
                      }`}
                    >
                      <span>[{team.code}]</span>
                      <span>{team.shortName}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isSelected ? 'bg-white/20 text-alice-blue' : 'bg-jet-black/10 text-jet-black'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}

                {(selectedSubsystemFilter !== 'all' || selectedPriorityFilter !== 'all' || searchQuery || assignedToMeOnly) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubsystemFilter('all');
                      setSelectedPriorityFilter('all');
                      setSearchQuery('');
                      setAssignedToMeOnly(false);
                    }}
                    className="ml-auto px-2.5 py-1 text-xs font-mono text-orange hover:underline font-bold whitespace-nowrap cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {STATUS_COLUMNS.map((col) => {
                const columnTasks = filteredTasks.filter((t) => t.status === col.id);

                return (
                  <div
                    key={col.id}
                    className="bg-white border border-jet-black/10 rounded-2xl p-5 flex flex-col min-h-[500px] shadow-sm"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-4 mb-4 border-b border-jet-black/10">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`}></span>
                        <h3 className="text-xs font-mono uppercase font-black tracking-wider text-jet-black">
                          {col.label}
                        </h3>
                      </div>
                      <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-alice-blue text-jet-black font-bold border border-jet-black/10">
                        {columnTasks.length}
                      </span>
                    </div>

                    {/* Cards List */}
                    <div className="space-y-4 flex-1 overflow-y-auto pr-1">
                      {columnTasks.length === 0 ? (
                        <div className="h-44 border-2 border-dashed border-jet-black/10 rounded-xl flex items-center justify-center text-center p-4">
                          <span className="text-xs text-grey font-mono">
                            {filteredTasks.length === 0 && (selectedSubsystemFilter !== 'all' || searchQuery)
                              ? 'No tasks match filter'
                              : `No tasks in ${col.label}`}
                          </span>
                        </div>
                      ) : (
                        columnTasks.map((task) => {
                          const taskTeam = TEAMS[task.teamId];
                          const priorityInfo = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;
                          const isTaskAssignedToMe = isTaskAssignedToUser(task, user);
                          const canManageThisTask = isCoreAdmin || user.teamId === task.teamId || isTaskAssignedToMe;

                          return (
                            <div
                              key={task.id}
                              onClick={() => handleOpenTaskDetail(task)}
                              className="group bg-alice-blue/40 hover:bg-white border border-jet-black/10 hover:border-orange/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-all space-y-3 cursor-pointer"
                            >
                              {/* Team & Priority Row */}
                              <div className="flex items-center justify-between gap-2">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${taskTeam?.badgeBg || 'bg-jet-black/5 text-jet-black'}`}>
                                  [{taskTeam?.code}] {taskTeam?.shortName}
                                </span>

                                <div className="flex items-center gap-1.5">
                                  {task.isBlocked && (
                                    <span className="px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-700 text-[9px] font-mono font-bold flex items-center gap-0.5" title={task.blockerReason || 'Blocked deliverable'}>
                                      <span>⚠️</span> Blocked
                                    </span>
                                  )}
                                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold ${priorityInfo.bg}`}>
                                    {priorityInfo.label}
                                  </span>
                                </div>
                              </div>

                              {/* Title & Desc */}
                              <div>
                                <h4 className="text-sm font-bold text-jet-black leading-snug group-hover:text-orange transition-colors">
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-xs text-grey mt-1.5 font-light line-clamp-2 leading-relaxed">
                                    {task.description}
                                  </p>
                                )}
                              </div>

                              {/* Subtasks Progress Bar */}
                              {task.subtasks && task.subtasks.length > 0 && (
                                <div className="space-y-1 pt-0.5">
                                  <div className="flex items-center justify-between text-[10px] font-mono text-grey">
                                    <span>☑ Checklist</span>
                                    <span className="font-semibold text-jet-black">
                                      {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length}
                                    </span>
                                  </div>
                                  <div className="w-full h-1.5 bg-jet-black/10 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-emerald-500 transition-all duration-300"
                                      style={{
                                        width: `${Math.round((task.subtasks.filter((st) => st.completed).length / task.subtasks.length) * 100)}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Assignees & Due Date + Quick Self-Assign Button */}
                              <div className="pt-2.5 border-t border-jet-black/5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-grey">
                                <div className="flex items-center gap-2 max-w-[170px] truncate">
                                  {task.assignedMembers && task.assignedMembers.length > 0 ? (
                                    <span className="text-jet-black font-semibold truncate">
                                      👤 {Array.isArray(task.assignedMembers) ? task.assignedMembers.join(', ') : task.assignedMembers}
                                    </span>
                                  ) : (
                                    <span className="italic text-grey/60">Unassigned</span>
                                  )}
                                  {task.comments && task.comments.length > 0 && (
                                    <span className="px-1.5 py-0.5 rounded bg-white border border-jet-black/10 text-grey font-bold flex items-center gap-0.5 text-[9px]">
                                      <span>💬</span> {task.comments.length}
                                    </span>
                                  )}
                                  {Boolean(task.actualHours) && (
                                    <span className="px-1.5 py-0.5 rounded bg-white border border-jet-black/10 text-grey font-bold flex items-center gap-0.5 text-[9px]">
                                      <span>⏱</span> {task.actualHours}h
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                  {isTaskAssignedToMe ? (
                                    <span className="px-1.5 py-0.5 rounded bg-orange/15 text-orange font-bold text-[9px] flex items-center gap-0.5">
                                      <span>✓</span> Assigned
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => handleQuickAssignToMe(e, task)}
                                      className="px-2 py-0.5 rounded bg-jet-black/5 hover:bg-orange hover:text-white border border-jet-black/10 text-[9px] font-mono font-bold transition-all cursor-pointer"
                                      title="Assign this task to yourself"
                                    >
                                      + Claim
                                    </button>
                                  )}

                                  {task.dueDate && (
                                    <span className="bg-white px-2 py-0.5 rounded border border-jet-black/10">
                                      Due: {task.dueDate}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Quick Move Status Controls & Open Details */}
                              <div className="pt-2.5 border-t border-jet-black/5 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  {col.id !== 'todo' && (
                                    <button
                                      type="button"
                                      disabled={!canManageThisTask}
                                      onClick={(e) => {
                                        const prevIdx = STATUS_COLUMNS.findIndex((c) => c.id === col.id) - 1;
                                        if (prevIdx >= 0) handleMoveStatus(e, task.id, STATUS_COLUMNS[prevIdx].id);
                                      }}
                                      title="Move back"
                                      className="px-2.5 py-2 sm:py-1 text-[10px] font-mono bg-white hover:bg-jet-black/5 rounded-lg border border-jet-black/15 cursor-pointer font-bold transition-colors disabled:opacity-40"
                                    >
                                      ←
                                    </button>
                                  )}
                                  {col.id !== 'done' && (
                                    <button
                                      type="button"
                                      disabled={!canManageThisTask}
                                      onClick={(e) => {
                                        const nextIdx = STATUS_COLUMNS.findIndex((c) => c.id === col.id) + 1;
                                        if (nextIdx < STATUS_COLUMNS.length) handleMoveStatus(e, task.id, STATUS_COLUMNS[nextIdx].id);
                                      }}
                                      title="Move forward"
                                      className="px-3 py-2 sm:py-1 text-[10px] font-mono bg-jet-black text-alice-blue hover:bg-orange rounded-lg font-bold transition-colors cursor-pointer disabled:opacity-40"
                                    >
                                      Advance →
                                    </button>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono text-grey group-hover:text-orange font-bold transition-colors">
                                    Details ↗
                                  </span>
                                  {canManageThisTask && (
                                    <button
                                      type="button"
                                      onClick={(e) => promptDeleteTask(e, task)}
                                      title="Delete task"
                                      className="text-xs text-grey hover:text-red-500 font-mono p-2 sm:p-1 cursor-pointer transition-colors"
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </div>

                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* =========================================================================
            TAB 2: 9-TEAM SUBSYSTEM OVERVIEW
            Interactive subsystem cards with live task breakdown & jump to tasks
           ========================================================================= */}
        {activeTab === 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAMS_LIST.map((team) => {
              const teamTasks = tasks.filter((t) => t.teamId === team.id);
              const teamLogs = logs.filter((l) => l.teamId === team.id);
              const completedCount = teamTasks.filter((t) => t.status === 'done').length;
              const inProgressCount = teamTasks.filter((t) => t.status === 'in_progress').length;
              const hours = teamLogs.reduce((acc, l) => acc + (l.hoursSpent || 0), 0);
              const latestLog = teamLogs[0];
              const progressPct = teamTasks.length > 0 ? Math.round((completedCount / teamTasks.length) * 100) : 0;

              return (
                <div
                  key={team.id}
                  className="bg-white border border-jet-black/10 rounded-2xl p-6 shadow-sm hover:border-orange/50 transition-all flex flex-col justify-between h-full"
                >
                  <div className="space-y-4 flex-1 flex flex-col">
                    {/* Header — uniform height */}
                    <div className="flex items-start justify-between gap-3 min-h-[52px]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-jet-black/5 text-jet-black font-bold">
                            [{team.code}]
                          </span>
                          <h4 className="text-base font-bold text-jet-black leading-tight">{team.name}</h4>
                        </div>
                        {team.lead && (
                          <span className="text-xs font-mono text-orange block mt-1 font-semibold">
                            Lead: {team.lead}
                          </span>
                        )}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ${
                        team.role === 'admin' ? 'bg-orange/20 text-orange' : 'bg-jet-black/5 text-jet-black'
                      }`}>
                        {team.role}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-grey">Deliverables Progress</span>
                        <span className="font-bold text-jet-black">{progressPct}%</span>
                      </div>
                      <div className="w-full h-2 bg-alice-blue rounded-full overflow-hidden border border-jet-black/5">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stats bar */}
                    <div className="grid grid-cols-4 gap-2 p-3 bg-alice-blue/60 rounded-xl text-center font-mono text-xs border border-jet-black/5">
                      <div>
                        <div className="font-black text-jet-black text-sm">{teamTasks.length}</div>
                        <div className="text-[9px] text-grey uppercase tracking-wider">Total</div>
                      </div>
                      <div>
                        <div className="font-black text-orange text-sm">{inProgressCount}</div>
                        <div className="text-[9px] text-grey uppercase tracking-wider">Active</div>
                      </div>
                      <div>
                        <div className="font-black text-emerald-600 text-sm">{completedCount}</div>
                        <div className="text-[9px] text-grey uppercase tracking-wider">Done</div>
                      </div>
                      <div>
                        <div className="font-black text-jet-black text-sm">{hours.toFixed(0)}h</div>
                        <div className="text-[9px] text-grey uppercase tracking-wider">Hours</div>
                      </div>
                    </div>

                    {/* Assigned Deliverables Section — uniform height across all cards */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-grey block">
                        Assigned Deliverables:
                      </span>
                      {teamTasks.length > 0 ? (
                        <div className="space-y-1.5 h-[68px] overflow-y-auto pr-1">
                          {teamTasks.slice(0, 2).map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleOpenTaskDetail(t)}
                              className="w-full text-left p-2 rounded-lg bg-alice-blue/30 hover:bg-alice-blue border border-jet-black/5 text-xs font-mono text-jet-black truncate flex items-center justify-between cursor-pointer"
                            >
                              <span className="truncate">{t.title}</span>
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ml-1.5 shrink-0 bg-white border border-jet-black/10">
                                {t.status}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-xs text-grey/60 italic font-mono p-2 bg-alice-blue/20 rounded-xl border border-dashed border-jet-black/10 text-center h-[68px] flex items-center justify-center">
                          No active deliverables
                        </div>
                      )}
                    </div>

                    {/* Latest Move Card — uniform height across all cards */}
                    {latestLog ? (
                      <div className="p-3 bg-alice-blue/30 rounded-xl border border-jet-black/5 text-xs space-y-1 h-[58px] flex flex-col justify-center">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-grey block">
                          Latest Move ({latestLog.date}):
                        </span>
                        <span className="font-semibold text-jet-black line-clamp-1 block">
                          {latestLog.stepTitle}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-grey/60 italic font-mono p-3 bg-alice-blue/20 rounded-xl border border-dashed border-jet-black/10 text-center h-[58px] flex items-center justify-center">
                        No log entries recorded yet
                      </div>
                    )}
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="pt-4 border-t border-jet-black/5 flex items-center justify-between mt-4">
                    <button
                      type="button"
                      onClick={() => handleViewTeamTasksInKanban(team.id)}
                      className="text-xs font-mono text-jet-black hover:text-orange font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Team Tasks</span>
                      <span>→</span>
                    </button>

                    {(isCore || isLead) ? (
                      <Link
                        href={`/log?team=${team.id}`}
                        className="text-xs font-mono text-orange hover:text-jet-black font-bold transition-colors inline-flex items-center gap-1"
                      >
                        <span>Build Log</span>
                        <span>↗</span>
                      </Link>
                    ) : (
                      <span className="text-[10px] font-mono uppercase text-grey">
                        Squad View
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================================
            TAB 3: MASTER VIDEO GALLERY
            Spacious media cards with inline players and filtering
           ========================================================================= */}
        {activeTab === 'videos' && (
          <div className="space-y-6">
            
            {videoLogsCount === 0 ? (
              <div className="bg-white border border-jet-black/10 rounded-2xl p-16 text-center text-grey shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-full bg-alice-blue flex items-center justify-center mx-auto text-grey">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-jet-black">No Videos Uploaded Yet</h4>
                <p className="text-xs max-w-md mx-auto leading-relaxed">
                  When teams record daily engineering moves and attach video evidence, they will stream directly here from your personal Google Drive!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {logs
                  .filter((l) => Boolean(l.videoUrl))
                  .map((log) => {
                    const embedInfo = getEmbeddableVideoUrl(log.videoUrl);
                    const teamInfo = TEAMS[log.teamId];

                    return (
                      <div
                        key={log.id}
                        className="bg-white border border-jet-black/10 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-orange/50 transition-all"
                      >
                        <div>
                          {/* Video player embed */}
                          <div className="aspect-video w-full bg-black relative">
                            {embedInfo ? (
                              embedInfo.source === 'drive' || embedInfo.source === 'youtube' ? (
                                <iframe
                                  src={embedInfo.embedUrl}
                                  className="w-full h-full border-0"
                                  allow="autoplay; encrypted-media; fullscreen"
                                  allowFullScreen
                                  title={log.stepTitle}
                                ></iframe>
                              ) : (
                                <video
                                  controls
                                  src={embedInfo.embedUrl}
                                  className="w-full h-full object-contain"
                                />
                              )
                            ) : null}
                          </div>

                          <div className="p-5 space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${teamInfo?.badgeBg || 'bg-jet-black/5 text-jet-black'}`}>
                                [{teamInfo?.code}] {log.teamName}
                              </span>
                              <span className="text-[10px] font-mono text-grey">
                                {log.date}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-jet-black line-clamp-1">
                              {log.stepTitle}
                            </h4>

                            <p className="text-xs text-grey font-light line-clamp-2 leading-relaxed">
                              {log.description}
                            </p>
                          </div>
                        </div>

                        <div className="px-5 py-3 bg-alice-blue/60 border-t border-jet-black/5 flex items-center justify-between text-xs font-mono">
                          <span className="text-grey font-bold">STEP #{log.stepNumber}</span>
                          <a
                            href={log.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange hover:underline font-bold"
                          >
                            Open in Google Drive ↗
                          </a>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 4: CREDENTIALS & ACCESS DIRECTORY (Core Leadership Only)
            Exclusively restricted to Core Leadership (Tier 1)
           ========================================================================= */}
        {activeTab === 'accounts' && isCoreAdmin && (
          <div className="bg-white border border-jet-black/10 rounded-2xl overflow-hidden shadow-sm space-y-0">
            <div className="p-6 sm:p-8 border-b border-jet-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-jet-black">
                  SIEP Access &amp; Credential Directory
                </h3>
                <p className="text-xs text-grey mt-0.5">
                  Core Leadership master control: View member 6-digit PINs, roles, and access tiers
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                {/* View Mode Toggle */}
                <div className="p-1 rounded-xl bg-alice-blue border border-jet-black/10 flex items-center gap-1 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setAccountsViewMode('members')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      accountsViewMode === 'members'
                        ? 'bg-jet-black text-alice-blue shadow-sm'
                        : 'text-grey hover:text-jet-black'
                    }`}
                  >
                    👤 Members ({ROSTER_MEMBERS.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountsViewMode('teams')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      accountsViewMode === 'teams'
                        ? 'bg-jet-black text-alice-blue shadow-sm'
                        : 'text-grey hover:text-jet-black'
                    }`}
                  >
                    👥 Squads ({ALL_TEAMS.length})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={loadCredentials}
                  className="text-xs font-mono px-3 py-2 bg-alice-blue text-jet-black hover:bg-jet-black hover:text-white border border-jet-black/10 rounded-xl font-bold transition-all cursor-pointer"
                  title="Reload from Google Cloud Firestore"
                >
                  ⟳ Refresh
                </button>
                <button
                  type="button"
                  onClick={() => setShowCredentialsPasswords(!showCredentialsPasswords)}
                  className="text-xs font-mono px-3.5 py-2 bg-alice-blue text-jet-black hover:bg-jet-black hover:text-white border border-jet-black/10 rounded-xl font-bold transition-all cursor-pointer"
                >
                  {showCredentialsPasswords ? '🔒 Mask PINs' : '👁 Show PINs'}
                </button>
              </div>
            </div>

            {/* ─── VIEW 1: 23 PERSONAL MEMBER LOGINS ─────────────────────────── */}
            {accountsViewMode === 'members' && (
              <>
                {/* Desktop Member Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-alice-blue border-b border-jet-black/10 text-grey uppercase tracking-wider">
                      <tr>
                        <th className="py-4 px-6">Member Name</th>
                        <th className="py-4 px-6">Personal Gmail</th>
                        <th className="py-4 px-6">Role &amp; Domain</th>
                        <th className="py-4 px-6">Access Tier</th>
                        <th className="py-4 px-6">6-Digit PIN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-jet-black/5">
                      {ROSTER_MEMBERS.map((m) => {
                        const cred = memberCredentials.find((c) => c.email.toLowerCase() === m.email.toLowerCase());
                        const activePin = cred?.password || '935200';
                        const isCustom = Boolean(cred?.isCustom);

                        return (
                          <tr key={m.id} className="hover:bg-alice-blue/40 transition-colors">
                            <td className="py-4 px-6 font-bold text-jet-black font-sans text-sm">
                              {m.name}
                            </td>
                            <td className="py-4 px-6 text-grey font-mono select-all">
                              {m.email}
                            </td>
                            <td className="py-4 px-6">
                              <span className="font-semibold text-jet-black">{m.role}</span>
                              <span className="text-[10px] text-grey ml-1.5 font-mono">[{m.teamId.toUpperCase()}]</span>
                            </td>
                            <td className="py-4 px-6">
                              {m.isCore ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange/20 text-orange border border-orange/30">
                                  Tier 1 • Core Master
                                </span>
                              ) : m.isLead ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-500/15 text-sky-700 border border-sky-300">
                                  Tier 2 • Domain Lead
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-jet-black/10 text-grey">
                                  Tier 3 • Member
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 font-mono text-orange font-bold select-all">
                              <div className="flex items-center gap-2">
                                <span className="tracking-widest">
                                  {showCredentialsPasswords ? activePin : '••••••'}
                                </span>
                                {isCustom ? (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold">
                                    CUSTOM
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 rounded bg-jet-black/5 text-grey text-[9px] font-mono">
                                    DEFAULT
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Member Cards */}
                <div className="sm:hidden space-y-3 p-4">
                  {ROSTER_MEMBERS.map((m) => {
                    const cred = memberCredentials.find((c) => c.email.toLowerCase() === m.email.toLowerCase());
                    const activePin = cred?.password || '935200';
                    const isCustom = Boolean(cred?.isCustom);

                    return (
                      <div key={m.id} className="bg-alice-blue/40 border border-jet-black/10 rounded-2xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-jet-black text-sm">{m.name}</span>
                          {m.isCore ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-orange/20 text-orange">
                              Tier 1 • Core
                            </span>
                          ) : m.isLead ? (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-sky-500/15 text-sky-700">
                              Tier 2 • Lead
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-jet-black/10 text-grey">
                              Tier 3
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-mono text-grey break-all select-all">{m.email}</div>
                        <div className="text-xs text-jet-black">
                          {m.role} <span className="text-grey font-mono">[{m.teamId.toUpperCase()}]</span>
                        </div>
                        <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-jet-black/10">
                          <span className="text-[10px] font-mono uppercase text-grey">6-Digit PIN:</span>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-bold font-mono text-orange tracking-widest select-all">
                              {showCredentialsPasswords ? activePin : '••••••'}
                            </code>
                            {isCustom ? (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[8px] font-mono font-bold">
                                CUSTOM
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded bg-jet-black/5 text-grey text-[8px] font-mono">
                                DEFAULT
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ─── VIEW 2: LEGACY SUBSYSTEM SQUADS ───────────────────────────── */}
            {accountsViewMode === 'teams' && (
              <>
                {/* Desktop Table View */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-alice-blue border-b border-jet-black/10 text-grey uppercase tracking-wider">
                      <tr>
                        <th className="py-4 px-6">Subsystem Team</th>
                        <th className="py-4 px-6">Login Email</th>
                        <th className="py-4 px-6">Password</th>
                        <th className="py-4 px-6">Access Level</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-jet-black/5">
                      {ALL_TEAMS.map((team) => {
                        const cred = teamCredentials[team.id];
                        const activePass = cred?.password || team.defaultPass;
                        const isCustom = Boolean(cred?.isCustom);

                        return (
                          <tr key={team.id} className="hover:bg-alice-blue/40 transition-colors">
                            <td className="py-4 px-6 font-bold text-jet-black">
                              <span className="text-[10px] text-grey mr-2">[{team.code}]</span>
                              <span>{team.name}</span>
                            </td>
                            <td className="py-4 px-6 text-grey font-mono select-all">
                              {team.email}
                            </td>
                            <td className="py-4 px-6 font-mono text-orange font-bold select-all">
                              <div className="flex items-center gap-2">
                                <span>{showCredentialsPasswords ? activePass : '••••••••••••'}</span>
                                {isCustom && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold tracking-wider">
                                    UPDATED
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                                team.id === 'core'
                                  ? 'bg-orange/20 text-orange'
                                  : 'bg-jet-black/10 text-jet-black'
                              }`}>
                                {team.id === 'core' ? 'Core Leadership' : 'Subsystem Squad'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="sm:hidden space-y-3 p-4">
                  {ALL_TEAMS.map((team) => {
                    const cred = teamCredentials[team.id];
                    const activePass = cred?.password || team.defaultPass;
                    const isCustom = Boolean(cred?.isCustom);

                    return (
                      <div key={team.id} className="bg-alice-blue/40 border border-jet-black/10 rounded-xl p-4 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-jet-black/10 font-bold">[{team.code}]</span>
                            <span className="text-sm font-bold text-jet-black">{team.name}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            team.id === 'core' ? 'bg-orange/20 text-orange' : 'bg-jet-black/10 text-jet-black'
                          }`}>
                            {team.id === 'core' ? 'Admin' : 'Squad'}
                          </span>
                        </div>
                        <div className="text-xs font-mono text-grey break-all select-all">{team.email}</div>
                        <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-jet-black/10">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono uppercase text-grey font-medium">Pass:</span>
                            {isCustom && (
                              <span className="px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[8px] font-mono font-bold">
                                UPDATED
                              </span>
                            )}
                          </div>
                          <code className="text-sm font-bold font-mono text-orange select-all">
                            {showCredentialsPasswords ? activePass : '••••••••'}
                          </code>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* =========================================================================
          TASK DETAIL MODAL
          View deliverables, change status, edit details, or log work
         ========================================================================= */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdated={handleModalTaskUpdated}
        onTaskDeleted={handleModalTaskDeleted}
        canEdit={isCoreAdmin || (selectedTask ? user.teamId === selectedTask.teamId : false)}
        canDelete={isCoreAdmin || (selectedTask ? user.teamId === selectedTask.teamId : false)}
        isAdmin={isCoreAdmin}
        onCompleteWithVideo={(task) => {
          setIsDetailModalOpen(false);
          setSelectedTask(null);
          setTaskToComplete(task);
          setIsCompleteModalOpen(true);
        }}
      />

      {/* =========================================================================
          TASK COMPLETE WITH VIDEO EVIDENCE MODAL
          When marking a task done, allows uploading video or pasting link,
          with all metadata carried forward into the work log!
         ========================================================================= */}
      <TaskCompleteModal
        task={taskToComplete}
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setTaskToComplete(null);
        }}
        onTaskCompleted={(updatedTask, createdLog) => {
          const nextTasks = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
          persistTasksLocal(nextTasks);
          if (createdLog) {
            setLogs((prev) => [createdLog, ...prev]);
          }
          setIsCompleteModalOpen(false);
          setTaskToComplete(null);
        }}
      />

      {/* =========================================================================
          CREATE TASK MODAL
          Clean modal with validation, member checkbox list, and due date
         ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[200] bg-jet-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border-2 border-orange/40 rounded-2xl w-full max-w-lg p-4 sm:p-8 max-h-[90vh] my-auto overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 space-y-5">
            
            <div className="flex items-center justify-between pb-4 border-b border-jet-black/10">
              <div>
                <h3 className="text-lg font-bold text-jet-black">
                  Create New Task
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-grey hover:text-jet-black text-sm p-1.5 cursor-pointer rounded-lg hover:bg-alice-blue"
              >
                ✕
              </button>
            </div>

            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-mono">
                ⚠️ {createError}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              
              <div>
                <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-base sm:text-sm font-medium focus:ring-2 focus:ring-orange focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
                  Task Scope / Deliverables
                </label>
                <textarea
                  rows={2}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
                    Assign Subsystem Team
                  </label>
                  <select
                    disabled={!isCoreAdmin}
                    value={newTaskTeam}
                    onChange={(e) => {
                      setNewTaskTeam(e.target.value as TeamId);
                      setNewTaskMembers([]);
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-jet-black/15 text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none disabled:bg-zinc-100"
                  >
                    {TEAMS_LIST.map((t) => (
                      <option key={t.id} value={t.id}>
                        [{t.code}] {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
                    Priority Level
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2.5 rounded-xl border border-jet-black/15 text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Checkbox member selector */}
              <div>
                <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
                  Assigned Members (Tick from list)
                </label>
                <MemberSelect
                  teamId={newTaskTeam}
                  selectedMembers={newTaskMembers}
                  onChange={setNewTaskMembers}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
                    Initial Status
                  </label>
                  <select
                    value={newTaskStatus}
                    onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2.5 rounded-xl border border-jet-black/15 text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Under Review</option>
                    <option value="done">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
                    Target Due Date
                  </label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-jet-black/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-jet-black/20 text-xs font-mono uppercase cursor-pointer hover:bg-alice-blue transition-colors font-medium w-full sm:w-auto text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="px-6 py-3 sm:py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  {isSubmittingTask ? 'Assigning...' : 'Assign Task →'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* =========================================================================
          DATABASE BACKUP / RESTORE MODAL (Core/Admin Only)
         ========================================================================= */}
      {isBackupModalOpen && isCoreAdmin && (
        <div className="fixed inset-0 z-[200] bg-jet-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border-2 border-jet-black/20 rounded-2xl w-full max-w-md p-6 sm:p-8 max-h-[90vh] my-auto overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 space-y-5">
            
            <div className="flex items-center justify-between pb-4 border-b border-jet-black/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-orange font-bold block">
                  Admin Utilities
                </span>
                <h3 className="text-lg font-bold text-jet-black">
                  Database Backup &amp; Sync
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBackupModalOpen(false)}
                className="text-grey hover:text-jet-black text-sm p-1.5 cursor-pointer rounded-lg hover:bg-alice-blue"
              >
                ✕
              </button>
            </div>

            {backupStatus && (
              <div className="p-3 bg-alice-blue border border-jet-black/10 rounded-xl text-xs font-mono text-jet-black">
                {backupStatus}
              </div>
            )}

            <div className="space-y-3">
              <div className="p-4 bg-alice-blue/50 rounded-xl border border-jet-black/5 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-jet-black">
                  1. Download Database Backup
                </h4>
                <p className="text-xs text-grey leading-relaxed">
                  Export all current tasks, work logs, and team inquiries into a JSON backup file for safe keeping.
                </p>
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="w-full py-2.5 px-4 bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold text-xs uppercase font-mono rounded-xl shadow-sm cursor-pointer"
                >
                  Download .JSON Backup ⤓
                </button>
              </div>

              <div className="p-4 bg-red-50/50 rounded-xl border border-red-200/60 space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase text-red-600">
                  2. Clear &amp; Reset Database
                </h4>
                <p className="text-xs text-grey leading-relaxed">
                  Reset the database to a clean, empty state with zero tasks and logs.
                </p>
                <button
                  type="button"
                  disabled={isResetting}
                  onClick={handleResetDatabase}
                  className="w-full py-2.5 px-4 bg-white text-red-600 border border-red-300 hover:bg-red-600 hover:text-white transition-all font-bold text-xs uppercase font-mono rounded-xl cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? 'Resetting...' : 'Clear Database ↺'}
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsBackupModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono uppercase text-grey hover:text-jet-black cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          CUSTOM DELETE TASK CONFIRMATION MODAL (Board Cards)
         ========================================================================= */}
      {cardTaskToDelete && (
        <div className="fixed inset-0 z-[250] bg-jet-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border-2 border-red-500/30 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4">
            
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-red-50 border border-red-200/80 text-red-600 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-jet-black tracking-tight">
                  Delete Task Permanently?
                </h4>
                <p className="text-xs text-grey leading-relaxed">
                  Are you sure you want to delete this task? This action cannot be undone and will remove it from Cloud Firestore.
                </p>
              </div>
            </div>

            <div className="p-3 bg-alice-blue/70 rounded-xl border border-jet-black/10 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-grey block font-bold">Task:</span>
              <p className="text-sm font-bold text-jet-black line-clamp-2 leading-snug">{cardTaskToDelete.title}</p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-jet-black/5 text-jet-black border border-jet-black/10">
                  Team: {cardTaskToDelete.teamId}
                </span>
                <span className="text-[10px] font-mono text-grey">ID: {cardTaskToDelete.id}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-jet-black/10">
              <button
                type="button"
                disabled={isDeletingCardTask}
                onClick={() => setCardTaskToDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-jet-black/15 text-xs font-mono font-bold text-grey hover:text-jet-black hover:bg-alice-blue transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingCardTask}
                onClick={confirmDeleteCardTask}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeletingCardTask ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <span>✕ Confirm Delete</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          SLIDE-OVER TEAM ACTIVITY DRAWER
          Real-time chronological audit trail of all squad moves
         ========================================================================= */}
      {isActivityDrawerOpen && (
        <div className="fixed inset-0 z-[250] flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-jet-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsActivityDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-md h-full bg-white border-l-2 border-jet-black/15 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-5 border-b border-jet-black/10 bg-alice-blue/60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse"></span>
                  <h3 className="text-base font-black text-jet-black tracking-tight">
                    Squad Moves &amp; Live Activity
                  </h3>
                </div>
                <p className="text-[11px] font-mono text-grey mt-0.5">
                  Real-time audit log across all 8 squads + Core
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsActivityDrawerOpen(false)}
                className="p-2 rounded-xl text-grey hover:text-jet-black hover:bg-jet-black/5 text-sm cursor-pointer"
                aria-label="Close activity feed"
              >
                ✕
              </button>
            </div>

            {/* Subsystem Filter Pills */}
            <div className="p-3 border-b border-jet-black/5 bg-white flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
              <button
                type="button"
                onClick={() => setActivitySubsystemFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase transition-all cursor-pointer shrink-0 ${
                  activitySubsystemFilter === 'all'
                    ? 'bg-jet-black text-white'
                    : 'bg-alice-blue/60 text-grey hover:text-jet-black'
                }`}
              >
                All Squads
              </button>
              {TEAMS_LIST.map((team) => (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => setActivitySubsystemFilter(team.id)}
                  className={`px-2 py-1 rounded-lg font-bold text-[10px] uppercase transition-all cursor-pointer shrink-0 ${
                    activitySubsystemFilter === team.id
                      ? 'bg-orange text-white'
                      : 'bg-alice-blue/60 text-grey hover:text-jet-black'
                  }`}
                >
                  [{team.code}]
                </button>
              ))}
            </div>

            {/* Activity Events List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-16 text-grey text-xs font-mono space-y-2">
                  <span className="text-2xl block">📡</span>
                  <p className="font-semibold text-jet-black">No recent moves found</p>
                  <p className="text-[11px] text-grey/70">
                    Activity events automatically stream in as members check off deliverables and log work.
                  </p>
                </div>
              ) : (
                filteredActivities.map((act) => {
                  const actTeam = TEAMS[act.teamId];
                  const iconMap: Record<string, string> = {
                    subtask_toggled: '☑️',
                    comment_added: '💬',
                    task_blocked: '⚠️',
                    task_status: '🔄',
                    task_created: '➕',
                    hours_logged: '⏱️',
                    log_submitted: '📝',
                  };
                  const icon = iconMap[act.type] || '⚡';

                  return (
                    <div
                      key={act.id}
                      onClick={() => {
                        if (act.taskId) {
                          const target = tasks.find((t) => t.id === act.taskId);
                          if (target) {
                            setIsActivityDrawerOpen(false);
                            handleOpenTaskDetail(target);
                          }
                        }
                      }}
                      className={`p-3.5 rounded-xl border transition-all text-xs font-mono space-y-1.5 ${
                        act.taskId
                          ? 'bg-alice-blue/30 border-jet-black/5 hover:border-orange/50 hover:bg-white cursor-pointer shadow-2xs'
                          : 'bg-white border-jet-black/5'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold flex items-center gap-1.5">
                          <span className="text-xs">{icon}</span>
                          <span className="text-orange">[{actTeam?.code || act.teamId.toUpperCase()}]</span>
                          <span className="text-jet-black">{act.memberName}</span>
                        </span>
                        <span className="text-grey/70">
                          {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="pl-5 text-jet-black/90 font-medium">
                        {act.detail || act.title}
                      </div>

                      {act.title && act.detail !== act.title && (
                        <div className="pl-5 text-[10px] text-grey truncate">
                          Task: <strong>{act.title}</strong>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-jet-black/10 bg-alice-blue/30 flex items-center justify-between text-[11px] font-mono text-grey">
              <span>{filteredActivities.length} recent moves</span>
              <button
                type="button"
                onClick={() => {
                  const now = Date.now();
                  setLastReadActivityTimestamp(now);
                  localStorage.setItem('siep_last_read_activity', String(now));
                }}
                className="text-orange hover:text-jet-black font-bold cursor-pointer"
              >
                Mark Read ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          FLOATING QUICK FILTER PILL: MY TASKS (Mobile Kanban view only)
         ========================================================================= */}
      {activeTab === 'kanban' && !isMobileQuickMenuOpen && !isActivityDrawerOpen && !isInputFocused && user && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-30 md:hidden pointer-events-auto">
          <button
            type="button"
            onClick={() => setAssignedToMeOnly(!assignedToMeOnly)}
            className={`px-4 py-2 rounded-full text-xs font-mono font-bold shadow-lg transition-all flex items-center gap-2 border active:scale-95 cursor-pointer ${
              assignedToMeOnly
                ? 'bg-orange text-white border-orange shadow-orange/30'
                : 'bg-white/95 backdrop-blur-md text-jet-black border-jet-black/15 shadow-black/10 hover:border-orange'
            }`}
          >
            <span>{assignedToMeOnly ? '✓' : '👤'}</span>
            <span>{assignedToMeOnly ? 'Showing: My Deliverables' : `Filter: My Tasks (${myAssignedCount})`}</span>
            {assignedToMeOnly && (
              <span className="text-[10px] opacity-90 underline ml-0.5">Show All</span>
            )}
          </button>
        </div>
      )}

      {/* =========================================================================
          MOBILE ALL-IN-ONE BOTTOM APP BAR (md:hidden)
          Persistent, ergonomic 1-thumb operations bar fixed at bottom
         ========================================================================= */}
      {user && (
        <nav
          aria-label="Mobile Navigation"
          className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-jet-black/10 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 ${
            isInputFocused ? 'translate-y-full pointer-events-none' : 'translate-y-0'
          }`}
        >
          <div className="flex items-center justify-around max-w-lg mx-auto relative">
            
            {/* Tab 1: Board */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('kanban');
                setIsActivityDrawerOpen(false);
                setIsMobileQuickMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
                activeTab === 'kanban' && !isActivityDrawerOpen && !isMobileQuickMenuOpen
                  ? 'text-orange font-bold'
                  : 'text-grey hover:text-jet-black'
              }`}
            >
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                {tasks.length > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-jet-black/10 text-jet-black text-[9px] font-mono rounded-full font-bold">
                    {tasks.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono tracking-tight mt-1">Board</span>
            </button>

            {/* Tab 2: My Tasks */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('my_tasks');
                setIsActivityDrawerOpen(false);
                setIsMobileQuickMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
                activeTab === 'my_tasks' && !isActivityDrawerOpen && !isMobileQuickMenuOpen
                  ? 'text-orange font-bold'
                  : 'text-grey hover:text-jet-black'
              }`}
            >
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {myAssignedCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-orange text-white text-[9px] font-mono rounded-full font-bold">
                    {myAssignedCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono tracking-tight mt-1">My Tasks</span>
            </button>

            {/* Center Action Hub Button [ + ] */}
            <div className="flex flex-col items-center justify-center flex-1 -mt-6">
              <button
                type="button"
                onClick={() => setIsMobileQuickMenuOpen(!isMobileQuickMenuOpen)}
                className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer border-3 border-white ${
                  isMobileQuickMenuOpen
                    ? 'bg-jet-black text-white shadow-jet-black/30 rotate-45'
                    : 'bg-gradient-to-tr from-orange to-amber-500 text-white shadow-orange/40 hover:brightness-105'
                }`}
                title="Quick Operations & Hub"
              >
                <svg className="w-6 h-6 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <span className="text-[9px] font-mono font-bold tracking-tight mt-1 text-jet-black">
                {isMobileQuickMenuOpen ? 'Close' : 'Hub'}
              </span>
            </div>

            {/* Tab 3: Squads */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('teams');
                setIsActivityDrawerOpen(false);
                setIsMobileQuickMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
                activeTab === 'teams' && !isActivityDrawerOpen && !isMobileQuickMenuOpen
                  ? 'text-orange font-bold'
                  : 'text-grey hover:text-jet-black'
              }`}
            >
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-[10px] font-mono tracking-tight mt-1">Squads</span>
            </button>

            {/* Tab 4: Moves (Activity Drawer) */}
            <button
              type="button"
              onClick={() => {
                handleOpenActivityDrawer();
                setIsMobileQuickMenuOpen(false);
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
                isActivityDrawerOpen
                  ? 'text-orange font-bold'
                  : 'text-grey hover:text-jet-black'
              }`}
            >
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {unreadActivitiesCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-orange text-white text-[9px] font-mono rounded-full font-bold animate-pulse">
                    {unreadActivitiesCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-mono tracking-tight mt-1">Moves</span>
            </button>

          </div>
        </nav>
      )}

      {/* =========================================================================
          MOBILE ALL-IN-ONE OPERATIONS HUB BOTTOM SHEET (md:hidden)
          Every dashboard feature and action accessible directly in 1 thumb sheet
         ========================================================================= */}
      {isMobileQuickMenuOpen && user && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileQuickMenuOpen(false)}
            className="fixed inset-0 bg-jet-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Bottom Sheet Modal */}
          <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl border-t border-jet-black/10 z-10 animate-in slide-in-from-bottom duration-200 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {/* Handle & Header */}
            <div className="pt-3 pb-2.5 px-5 flex flex-col items-center border-b border-jet-black/10">
              <div className="w-12 h-1.5 bg-jet-black/20 rounded-full mb-3" />
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse" />
                  <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-jet-black">
                    Operations Hub
                  </h3>
                  {isOnline ? (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      LIVE
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                      OFFLINE ({pendingQueueCount})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileQuickMenuOpen(false)}
                  className="w-7 h-7 rounded-full bg-alice-blue flex items-center justify-center text-grey hover:text-jet-black font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="w-full mt-2 flex items-center justify-between text-[11px] font-mono text-grey">
                <span>Signed in: <strong className="text-jet-black">{user.displayName}</strong></span>
                <span className="px-1.5 py-0.5 rounded bg-jet-black/5 text-jet-black font-bold uppercase">
                  {user.teamId}
                </span>
              </div>
            </div>

            {/* Sheet Content Scrollable Area */}
            <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(85vh-100px)]">

              {/* Primary Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileQuickMenuOpen(false);
                    setIsCreateModalOpen(true);
                  }}
                  className="p-3 rounded-2xl bg-orange text-white font-mono text-xs font-bold shadow-md shadow-orange/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
                >
                  <span className="text-base leading-none">➕</span>
                  <span>New Deliverable</span>
                </button>

                {(isCore || isLead) ? (
                  <Link
                    href="/log"
                    onClick={() => setIsMobileQuickMenuOpen(false)}
                    className="p-3 rounded-2xl bg-jet-black text-alice-blue font-mono text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
                  >
                    <span>📝 Open Build Log</span>
                    <span>→</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isManualSyncing}
                    className="p-3 rounded-2xl bg-alice-blue border border-jet-black/10 text-jet-black font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
                  >
                    <span className={isManualSyncing ? 'animate-spin' : ''}>🔄</span>
                    <span>{isManualSyncing ? 'Syncing...' : 'Sync Database'}</span>
                  </button>
                )}
              </div>

              {/* All Views Grid */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-grey font-bold">
                  All Portals & Views
                </span>
                <div className="grid grid-cols-2 gap-2">
                  
                  {/* Task Board */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('kanban');
                      setIsActivityDrawerOpen(false);
                      setIsMobileQuickMenuOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeTab === 'kanban' && !isActivityDrawerOpen
                        ? 'border-orange bg-orange/5 text-jet-black font-bold'
                        : 'border-jet-black/10 bg-white hover:bg-alice-blue/60 text-jet-black'
                    }`}
                  >
                    <span className="text-base">📋</span>
                    <div className="truncate">
                      <div className="text-xs font-mono font-bold truncate">Task Board</div>
                      <div className="text-[10px] text-grey font-mono truncate">{tasks.length} deliverables</div>
                    </div>
                  </button>

                  {/* My Tasks */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('my_tasks');
                      setIsActivityDrawerOpen(false);
                      setIsMobileQuickMenuOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeTab === 'my_tasks' && !isActivityDrawerOpen
                        ? 'border-orange bg-orange/5 text-jet-black font-bold'
                        : 'border-jet-black/10 bg-white hover:bg-alice-blue/60 text-jet-black'
                    }`}
                  >
                    <span className="text-base">📌</span>
                    <div className="truncate">
                      <div className="text-xs font-mono font-bold truncate">My Workbench</div>
                      <div className="text-[10px] text-orange font-mono font-bold truncate">{myAssignedCount} assigned</div>
                    </div>
                  </button>

                  {/* Squads */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('teams');
                      setIsActivityDrawerOpen(false);
                      setIsMobileQuickMenuOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeTab === 'teams' && !isActivityDrawerOpen
                        ? 'border-orange bg-orange/5 text-jet-black font-bold'
                        : 'border-jet-black/10 bg-white hover:bg-alice-blue/60 text-jet-black'
                    }`}
                  >
                    <span className="text-base">🏎️</span>
                    <div className="truncate">
                      <div className="text-xs font-mono font-bold truncate">9 Subsystems</div>
                      <div className="text-[10px] text-grey font-mono truncate">Squad leads & tasks</div>
                    </div>
                  </button>

                  {/* Master Video Gallery */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('videos');
                      setIsActivityDrawerOpen(false);
                      setIsMobileQuickMenuOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      activeTab === 'videos' && !isActivityDrawerOpen
                        ? 'border-orange bg-orange/5 text-jet-black font-bold'
                        : 'border-jet-black/10 bg-white hover:bg-alice-blue/60 text-jet-black'
                    }`}
                  >
                    <span className="text-base">🎥</span>
                    <div className="truncate">
                      <div className="text-xs font-mono font-bold truncate">Video Archive</div>
                      <div className="text-[10px] text-grey font-mono truncate">{videoLogsCount} clips stream</div>
                    </div>
                  </button>

                  {/* Live Moves Feed */}
                  <button
                    type="button"
                    onClick={() => {
                      handleOpenActivityDrawer();
                      setIsMobileQuickMenuOpen(false);
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      isActivityDrawerOpen
                        ? 'border-orange bg-orange/5 text-jet-black font-bold'
                        : 'border-jet-black/10 bg-white hover:bg-alice-blue/60 text-jet-black'
                    }`}
                  >
                    <span className="text-base">⚡</span>
                    <div className="truncate">
                      <div className="text-xs font-mono font-bold truncate">Live Moves Feed</div>
                      <div className="text-[10px] text-grey font-mono truncate">
                        {unreadActivitiesCount > 0 ? `${unreadActivitiesCount} unread` : `${activities.length} moves`}
                      </div>
                    </div>
                  </button>

                  {/* Core Admin Credentials */}
                  {isCoreAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('accounts');
                        setIsActivityDrawerOpen(false);
                        setIsMobileQuickMenuOpen(false);
                      }}
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                        activeTab === 'accounts' && !isActivityDrawerOpen
                          ? 'border-orange bg-orange/5 text-jet-black font-bold'
                          : 'border-jet-black/10 bg-white hover:bg-alice-blue/60 text-jet-black'
                      }`}
                    >
                      <span className="text-base">🔑</span>
                      <div className="truncate">
                        <div className="text-xs font-mono font-bold truncate">Team Credentials</div>
                        <div className="text-[10px] text-orange font-mono font-bold truncate">Core Admin Only</div>
                      </div>
                    </button>
                  )}

                  {/* Core Admin Backup & Sync */}
                  {isCoreAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileQuickMenuOpen(false);
                        setIsBackupModalOpen(true);
                      }}
                      className="p-3 rounded-xl border border-jet-black/10 bg-white hover:bg-alice-blue/60 text-jet-black text-left flex items-center gap-2.5 transition-all cursor-pointer"
                    >
                      <span className="text-base">💾</span>
                      <div className="truncate">
                        <div className="text-xs font-mono font-bold truncate">Backup / Sync</div>
                        <div className="text-[10px] text-grey font-mono truncate">JSON export & reset</div>
                      </div>
                    </button>
                  )}

                </div>
              </div>

              {/* Instant Subsystem Filter Row */}
              <div className="space-y-1.5 pt-1 border-t border-jet-black/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-grey font-bold">
                    Instant Squad Filter on Board
                  </span>
                  {selectedSubsystemFilter !== 'all' && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubsystemFilter('all');
                        setActiveTab('kanban');
                        setIsMobileQuickMenuOpen(false);
                      }}
                      className="text-[10px] font-mono text-orange font-bold cursor-pointer underline"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubsystemFilter('all');
                      setActiveTab('kanban');
                      setIsMobileQuickMenuOpen(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap cursor-pointer transition-all ${
                      selectedSubsystemFilter === 'all'
                        ? 'bg-jet-black text-white font-bold'
                        : 'bg-alice-blue text-jet-black border border-jet-black/10'
                    }`}
                  >
                    All Squads
                  </button>
                  {TEAMS_LIST.map((tm) => (
                    <button
                      key={tm.id}
                      type="button"
                      onClick={() => {
                        setSelectedSubsystemFilter(tm.id);
                        setActiveTab('kanban');
                        setIsMobileQuickMenuOpen(false);
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                        selectedSubsystemFilter === tm.id
                          ? 'bg-orange text-white font-bold'
                          : 'bg-alice-blue text-jet-black border border-jet-black/10'
                      }`}
                    >
                      <span>[{tm.code}]</span>
                      <span>{tm.shortName}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Utilities & Sign Out */}
              <div className="pt-2 border-t border-jet-black/10 flex items-center justify-between gap-3 text-xs font-mono">
                {!isInstalled && installApp ? (
                  <button
                    type="button"
                    onClick={() => {
                      installApp();
                      setIsMobileQuickMenuOpen(false);
                    }}
                    className="px-3 py-2 rounded-xl bg-jet-black text-alice-blue font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>📲</span>
                    <span>Install Web App</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isManualSyncing}
                    className="text-grey hover:text-jet-black flex items-center gap-1 cursor-pointer"
                  >
                    <span className={isManualSyncing ? 'animate-spin' : ''}>🔄</span>
                    <span>{isManualSyncing ? 'Syncing...' : 'Force Sync'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={async () => {
                    setIsMobileQuickMenuOpen(false);
                    await logout();
                    router.push('/login');
                  }}
                  className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer py-1 px-2 rounded-lg hover:bg-rose-50"
                >
                  <span>🚪</span>
                  <span>Sign Out</span>
                </button>
              </div>

            </div>
          </div>
        </div>
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
