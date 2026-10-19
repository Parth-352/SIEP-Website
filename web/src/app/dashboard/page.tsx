"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { TEAMS_LIST, TEAMS } from '@/lib/teams';
import { Task, WorkLog, TeamId, TaskStatus, TaskPriority } from '@/lib/types';
import { getEmbeddableVideoUrl } from '@/lib/driveUpload';
import MemberSelect from '@/components/MemberSelect';
import TaskDetailModal from '@/components/TaskDetailModal';
import TaskCompleteModal from '@/components/TaskCompleteModal';

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

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Active view tab
  const [activeTab, setActiveTab] = useState<'kanban' | 'teams' | 'videos' | 'accounts'>('kanban');

  // Main data state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Kanban filters & search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubsystemFilter, setSelectedSubsystemFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');

  // Task Detail Modal state
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Task Complete with Video Modal state
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

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

  // Authentication protection: all logged-in members can view dashboard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?from=/dashboard');
    }
  }, [user, authLoading, router]);

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

  // Load tasks and logs from API
  const loadDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      const [tasksRes, logsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/logs'),
      ]);
      const tasksData = await tasksRes.json();
      const logsData = await logsRes.json();

      if (tasksData.success && Array.isArray(tasksData.tasks)) {
        persistTasksLocal(tasksData.tasks);
      }
      if (logsData.success && Array.isArray(logsData.logs)) {
        setLogs(logsData.logs);
      }
    } catch (err) {
      console.error('Failed to reload dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  // Handle default new task team selection based on user
  useEffect(() => {
    if (user && user.teamId !== 'core') {
      setNewTaskTeam(user.teamId);
    }
  }, [user]);

  // Filtered Tasks computation (hook called before any early return)
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Subsystem filter
      if (selectedSubsystemFilter !== 'all' && task.teamId !== selectedSubsystemFilter) {
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
        const memberMatch = (task.assignedMembers || []).some((m) => m.toLowerCase().includes(q));
        const teamMatch = (TEAMS[task.teamId]?.name || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !memberMatch && !teamMatch) {
          return false;
        }
      }
      return true;
    });
  }, [tasks, selectedSubsystemFilter, selectedPriorityFilter, searchQuery]);

  // Loading skeleton
  if (!isMounted || authLoading || !user) {
    return (
      <div className="min-h-screen bg-alice-blue flex items-center justify-center font-mono text-sm text-grey">
        <span className="w-5 h-5 border-2 border-orange border-t-transparent rounded-full animate-spin mr-3"></span>
        Connecting to SIEP Operations Center...
      </div>
    );
  }

  // Permissions
  const isCoreAdmin = isAdmin || user.teamId === 'core';

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

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: nextStatus }),
      });
    } catch (err) {
      console.error('Failed to sync status update:', err);
      loadDashboardData();
    }
  };

  // Delete Task
  const handleDeleteTask = async (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this task?')) return;

    const remainingTasks = tasks.filter((t) => t.id !== taskId);
    persistTasksLocal(remainingTasks);

    try {
      await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete task:', err);
      loadDashboardData();
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
    <main className="min-h-screen bg-alice-blue text-jet-black pt-24 pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Background CAD accent */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#2B303A_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-8">

        {/* =========================================================================
            DASHBOARD HEADER
            Spacious, modern project command console with quick actions
           ========================================================================= */}
        <div className="bg-white border border-jet-black/10 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse"></span>
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-grey font-bold">
                  {isCoreAdmin ? 'Operations Center • Full Admin Privileges' : `Squad Console • ${TEAMS[user.teamId]?.name || user.teamName}`}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-jet-black tracking-tight">
                Project Operations Dashboard<span className="text-orange">.</span>
              </h1>
              <p className="text-grey font-light text-sm max-w-2xl leading-relaxed">
                Full-stack engineering pipeline for SIEP 2026–27. Manage subsystem deliverables, review task workflows, audit Google Drive video evidence, and keep all 9 squads aligned.
              </p>
            </div>

            {/* Quick Header Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0 self-start lg:self-center">
              <Link
                href="/log"
                className="px-4 py-2.5 rounded-xl border border-jet-black/15 bg-white hover:bg-alice-blue text-jet-black hover:border-orange hover:text-orange text-xs font-mono uppercase font-bold transition-all shadow-sm"
              >
                Open Build Log →
              </Link>

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

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer flex items-center gap-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>Create Task</span>
              </button>
            </div>

          </div>
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
            ELEVATED VIEW NAVIGATION TABS
            Segmented controller with clean icons and counts
           ========================================================================= */}
        <div className="bg-white border border-jet-black/10 rounded-2xl p-2 shadow-sm flex items-center gap-2 overflow-x-auto hide-scrollbar">
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

          {isCoreAdmin && (
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
                Admin
              </span>
            </button>
          )}
        </div>

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
                    placeholder="Search tasks by title, scope, team, or assigned member..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-jet-black/15 text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
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
                    className="px-3 py-2 rounded-xl border border-jet-black/15 text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none bg-white cursor-pointer"
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
              <div className="pt-3 border-t border-jet-black/5 flex items-center gap-2 overflow-x-auto hide-scrollbar">
                <span className="text-[10px] font-mono uppercase text-grey font-bold shrink-0">
                  Subsystem:
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedSubsystemFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                    selectedSubsystemFilter === 'all'
                      ? 'bg-jet-black text-alice-blue font-bold shadow-sm'
                      : 'bg-alice-blue/60 text-grey hover:text-jet-black hover:bg-alice-blue'
                  }`}
                >
                  All Squads ({tasks.length})
                </button>

                {TEAMS_LIST.map((team) => {
                  const count = tasks.filter((t) => t.teamId === team.id).length;
                  const isSelected = selectedSubsystemFilter === team.id;
                  return (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => setSelectedSubsystemFilter(team.id)}
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

                {(selectedSubsystemFilter !== 'all' || selectedPriorityFilter !== 'all' || searchQuery) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubsystemFilter('all');
                      setSelectedPriorityFilter('all');
                      setSearchQuery('');
                    }}
                    className="ml-auto px-2.5 py-1 text-xs font-mono text-orange hover:underline font-bold whitespace-nowrap"
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
                          const canManageThisTask = isCoreAdmin || user.teamId === task.teamId;

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

                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider font-bold ${priorityInfo.bg}`}>
                                  {priorityInfo.label}
                                </span>
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

                              {/* Assignees & Due Date */}
                              <div className="pt-2.5 border-t border-jet-black/5 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-grey">
                                {task.assignedMembers && task.assignedMembers.length > 0 ? (
                                  <span className="text-jet-black font-semibold truncate max-w-[140px]">
                                    👤 {task.assignedMembers.join(', ')}
                                  </span>
                                ) : (
                                  <span className="italic text-grey/60">Unassigned</span>
                                )}

                                {task.dueDate && (
                                  <span className="bg-white px-2 py-0.5 rounded border border-jet-black/10">
                                    Due: {task.dueDate}
                                  </span>
                                )}
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
                                      className="px-2.5 py-1 text-[10px] font-mono bg-white hover:bg-jet-black/5 rounded-lg border border-jet-black/15 cursor-pointer font-bold transition-colors disabled:opacity-40"
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
                                      className="px-3 py-1 text-[10px] font-mono bg-jet-black text-alice-blue hover:bg-orange rounded-lg font-bold transition-colors cursor-pointer disabled:opacity-40"
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
                                      onClick={(e) => handleDeleteTask(e, task.id)}
                                      title="Delete task"
                                      className="text-xs text-grey hover:text-red-500 font-mono p-1 cursor-pointer transition-colors"
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
                  className="bg-white border border-jet-black/10 rounded-2xl p-6 shadow-sm hover:border-orange/50 transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-jet-black/5 text-jet-black font-bold">
                            [{team.code}]
                          </span>
                          <h4 className="text-base font-bold text-jet-black">{team.name}</h4>
                        </div>
                        {team.lead && (
                          <span className="text-xs font-mono text-orange block mt-1 font-semibold">
                            Lead: {team.lead}
                          </span>
                        )}
                        <span className="text-xs font-mono text-grey block mt-0.5">{team.email}</span>
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

                    {/* Recent task preview */}
                    {teamTasks.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-grey block">
                          Assigned Deliverables:
                        </span>
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                          {teamTasks.slice(0, 2).map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => handleOpenTaskDetail(t)}
                              className="w-full text-left p-2 rounded-lg bg-alice-blue/30 hover:bg-alice-blue border border-jet-black/5 text-xs font-mono text-jet-black truncate flex items-center justify-between cursor-pointer"
                            >
                              <span className="truncate">{t.title}</span>
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ml-1 bg-white border border-jet-black/10">
                                {t.status}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Latest Move Card */}
                    {latestLog ? (
                      <div className="p-3 bg-alice-blue/30 rounded-xl border border-jet-black/5 text-xs space-y-1">
                        <span className="text-[10px] font-mono uppercase tracking-widest text-grey block">
                          Latest Move ({latestLog.date}):
                        </span>
                        <span className="font-semibold text-jet-black line-clamp-1 block">
                          {latestLog.stepTitle}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs text-grey/60 italic font-mono p-2.5 bg-alice-blue/20 rounded-xl border border-dashed border-jet-black/10 text-center">
                        No log entries recorded yet
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-jet-black/5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleViewTeamTasksInKanban(team.id)}
                      className="text-xs font-mono text-jet-black hover:text-orange font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Team Tasks</span>
                      <span>→</span>
                    </button>

                    <Link
                      href={`/log?team=${team.id}`}
                      className="text-xs font-mono text-orange hover:text-jet-black font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <span>Build Log</span>
                      <span>↗</span>
                    </Link>
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
            TAB 4: TEAM CREDENTIALS TABLE (Core/Admin Only)
            Spacious, readable authentication table
           ========================================================================= */}
        {activeTab === 'accounts' && isCoreAdmin && (
          <div className="bg-white border border-jet-black/10 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 sm:p-8 border-b border-jet-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-jet-black">
                  Configured Subsystem Accounts
                </h3>
                <p className="text-xs text-grey mt-0.5">
                  Pre-configured login emails and passwords for the 9 official engineering squads
                </p>
              </div>
              <span className="text-xs font-mono px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold self-start sm:self-auto">
                Pattern: teamName@9352
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-alice-blue border-b border-jet-black/10 text-grey uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Subsystem Team</th>
                    <th className="py-4 px-6">Login Email</th>
                    <th className="py-4 px-6">Default Password</th>
                    <th className="py-4 px-6">Access Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-jet-black/5">
                  {TEAMS_LIST.map((team) => (
                    <tr key={team.id} className="hover:bg-alice-blue/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-jet-black">
                        <span className="text-[10px] text-grey mr-2">[{team.code}]</span>
                        <span>{team.name}</span>
                      </td>
                      <td className="py-4 px-6 text-grey font-mono select-all">
                        {team.email}
                      </td>
                      <td className="py-4 px-6 font-mono text-orange font-bold select-all">
                        {team.defaultPass}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                          team.id === 'core'
                            ? 'bg-orange/20 text-orange'
                            : 'bg-jet-black/10 text-jet-black'
                        }`}>
                          {team.role === 'admin' ? 'Admin / Full Project' : 'Team / Scoped Log'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
        <div className="fixed inset-0 z-50 bg-jet-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-orange/40 rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 space-y-5">
            
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
                  placeholder="e.g. 72V Pack High-Discharge Thermal Analysis"
                  className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-sm font-medium focus:ring-2 focus:ring-orange focus:outline-none"
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
                  placeholder="Specific requirements, testing thresholds, or fabrication steps..."
                  className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-xs focus:ring-2 focus:ring-orange focus:outline-none leading-relaxed"
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
                    className="w-full px-3 py-2.5 rounded-xl border border-jet-black/15 text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none disabled:bg-zinc-100"
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
                    className="w-full px-3 py-2.5 rounded-xl border border-jet-black/15 text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
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
                    className="w-full px-3 py-2.5 rounded-xl border border-jet-black/15 text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-jet-black/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-jet-black/20 text-xs font-mono uppercase cursor-pointer hover:bg-alice-blue transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="px-6 py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-jet-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-jet-black/20 rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 space-y-5">
            
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

    </main>
  );
}
