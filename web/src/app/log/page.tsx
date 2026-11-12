"use client";

import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { TEAMS, TEAMS_LIST } from '@/lib/teams';
import { WorkLog, TeamId, Task, TaskStatus, TaskPriority, LogWorkStatus } from '@/lib/types';
import { uploadFileToGoogleDrive, getEmbeddableVideoUrl } from '@/lib/driveUpload';
import MemberSelect from '@/components/MemberSelect';
import TaskCompleteModal from '@/components/TaskCompleteModal';
import { useBackgroundSync } from '@/components/BackgroundSyncProvider';
import { getOfflineCachedLogs, cacheOfflineLogs } from '@/lib/offlineDb';
import { isTaskAssignedToUser } from '@/lib/taskMatching';

function getLogWorkStatus(log: WorkLog): LogWorkStatus {
  if (log.status) return log.status;
  const text = `${log.stepTitle || ''} ${log.description || ''} ${log.achievements || ''}`.toLowerCase();
  if (text.includes('test') || text.includes('dyno') || text.includes('benchmark') || text.includes('trial')) {
    return 'testing';
  }
  if ((log.blockers && log.blockers.trim().length > 0) || text.includes('on hold') || text.includes('waiting') || text.includes('delay') || text.includes('blocked')) {
    return 'on_hold';
  }
  if (text.includes('review') || text.includes('audit') || text.includes('inspect') || text.includes('verification')) {
    return 'review';
  }
  if (log.videoUrl && (text.includes('weld') || text.includes('completed') || text.includes('done') || text.includes('finished') || text.includes('fabricated'))) {
    return 'completed';
  }
  return 'in_progress';
}

function getDomainBadge(teamId: string) {
  switch (teamId) {
    case 'mechanical':
    case 'chassis':
      return { code: 'MECH', bg: 'bg-amber-500/10 text-amber-700 border-amber-500/20' };
    case 'powertrain':
      return { code: 'POW', bg: 'bg-sky-500/10 text-sky-700 border-sky-500/20' };
    case 'battery':
      return { code: 'BATT', bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' };
    case 'entc':
    case 'electronics':
      return { code: 'E&E', bg: 'bg-blue-500/10 text-blue-700 border-blue-500/20' };
    case 'software':
    case 'telemetry':
      return { code: 'SOFT', bg: 'bg-purple-500/10 text-purple-700 border-purple-500/20' };
    case 'brakes':
      return { code: 'BRK', bg: 'bg-rose-500/10 text-rose-700 border-rose-500/20' };
    case 'suspension':
      return { code: 'SUSP', bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20' };
    case 'safety':
      return { code: 'SAFE', bg: 'bg-red-500/10 text-red-700 border-red-500/20' };
    case 'design':
      return { code: 'DSGN', bg: 'bg-pink-500/10 text-pink-700 border-pink-500/20' };
    case 'research':
      return { code: 'R&D', bg: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20' };
    case 'sponsorship':
      return { code: 'SPON', bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' };
    case 'socialmedia':
    case 'marketing':
      return { code: 'MKT', bg: 'bg-pink-500/10 text-pink-700 border-pink-500/20' };
    case 'core':
      return { code: 'CORE', bg: 'bg-orange/10 text-orange border-orange/30' };
    case 'documentation':
    default:
      return { code: 'DOCS', bg: 'bg-zinc-100 text-zinc-700 border-zinc-200' };
  }
}

function formatLogDate(dateVal?: string | number): string {
  if (!dateVal) return 'Recently';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

const WORK_STATUS_CONFIG: Record<
  LogWorkStatus,
  {
    label: string;
    filterLabel: string;
    icon: React.ReactNode;
    badgeBg: string;
    tileIconBg: string;
    tileIconColor: string;
  }
> = {
  in_progress: {
    label: 'In Progress',
    filterLabel: 'In Progress',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    ),
    badgeBg: 'bg-amber-500/10 text-amber-700 border border-amber-500/20',
    tileIconBg: 'bg-amber-500/10 border border-amber-500/20',
    tileIconColor: 'text-amber-600',
  },
  testing: {
    label: 'Testing',
    filterLabel: 'Testing',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    badgeBg: 'bg-purple-500/10 text-purple-700 border border-purple-500/20',
    tileIconBg: 'bg-purple-500/10 border border-purple-500/20',
    tileIconColor: 'text-purple-600',
  },
  completed: {
    label: 'Completed',
    filterLabel: 'Completed',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    badgeBg: 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20',
    tileIconBg: 'bg-emerald-500/10 border border-emerald-500/20',
    tileIconColor: 'text-emerald-600',
  },
  on_hold: {
    label: 'On Hold',
    filterLabel: 'On Hold',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
      </svg>
    ),
    badgeBg: 'bg-rose-500/10 text-rose-700 border border-rose-500/20',
    tileIconBg: 'bg-rose-500/10 border border-rose-500/20',
    tileIconColor: 'text-rose-600',
  },
  review: {
    label: 'Needs Review',
    filterLabel: 'Review',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    badgeBg: 'bg-sky-500/10 text-sky-700 border border-sky-500/20',
    tileIconBg: 'bg-sky-500/10 border border-sky-500/20',
    tileIconColor: 'text-sky-600',
  },
};

function LogLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-alice-blue flex flex-col items-center justify-center font-mono text-sm text-grey space-y-3">
      <span className="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin"></span>
      <p className="tracking-wider uppercase text-xs">Authenticating SIEP session &amp; logs...</p>
    </div>
  );
}

function LogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, isCore, isLead } = useAuth();
  const { enqueueLogUpload, isOnline } = useBackgroundSync();
  // Master administrative access for Core Leadership (Tier 1)
  const isCoreAdmin = Boolean(isCore || (user && user.teamId === 'core'));
  const canApproveCompletion = Boolean(
    isCore ||
    isLead ||
    user?.isCore ||
    user?.isLead ||
    user?.teamId === 'core'
  );

  const [isMounted, setIsMounted] = useState(false);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active tasks for squad context & personal deliverables
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [teamTasks, setTeamTasks] = useState<Task[]>([]);
  const [taskViewMode, setTaskViewMode] = useState<'assigned' | 'subsystem'>('assigned');
  const [loadingTasks, setLoadingTasks] = useState(false);

  const myAssignedTasks = useMemo(() => {
    if (!user) return [];
    return allTasks.filter((t) => isTaskAssignedToUser(t, user));
  }, [allTasks, user]);

  // Task Complete with Video Modal state
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Form state (Create)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [stepTitle, setStepTitle] = useState('');
  const [targetTeamId, setTargetTeamId] = useState<TeamId>('core');
  const [authorName, setAuthorName] = useState('');
  const [date, setDate] = useState('');
  const [workTime, setWorkTime] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [hoursSpent, setHoursSpent] = useState('4');
  const [description, setDescription] = useState('');
  const [achievements, setAchievements] = useState('');
  const [blockers, setBlockers] = useState('');

  // Video upload state (Create)
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [largeFileNotice, setLargeFileNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit modal state
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);
  const [editStepTitle, setEditStepTitle] = useState('');
  const [editTeamId, setEditTeamId] = useState<TeamId>('core');
  const [editAuthorName, setEditAuthorName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editWorkTime, setEditWorkTime] = useState('');
  const [editMembers, setEditMembers] = useState<string[]>([]);
  const [editHoursSpent, setEditHoursSpent] = useState('4');
  const [editDescription, setEditDescription] = useState('');
  const [editAchievements, setEditAchievements] = useState('');
  const [editBlockers, setEditBlockers] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Delete confirmation modal state
  const [deleteConfirmLog, setDeleteConfirmLog] = useState<WorkLog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Mobile UI Redesign States (per PRD v1.0 & Mockup media_1794510271459_0a6999fe.jpg)
  const [mobileStatusFilter, setMobileStatusFilter] = useState<'all' | LogWorkStatus>('all');
  const [selectedMobileDetailLog, setSelectedMobileDetailLog] = useState<WorkLog | null>(null);
  const [targetStatus, setTargetStatus] = useState<LogWorkStatus>('in_progress');
  const [editStatus, setEditStatus] = useState<LogWorkStatus>('in_progress');

  // Dynamic status counts calculated live from Firestore logs (respects team selection)
  const statusCounts = useMemo(() => {
    const counts: Record<LogWorkStatus, number> = {
      in_progress: 0,
      testing: 0,
      completed: 0,
      on_hold: 0,
      review: 0,
    };
    const pool = selectedTeamFilter === 'all'
      ? logs
      : logs.filter((l) => l.teamId === selectedTeamFilter);

    pool.forEach((l) => {
      const st = getLogWorkStatus(l);
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }, [logs, selectedTeamFilter]);

  // Dynamic filtered logs feed for mobile
  const visibleMobileLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Team filter
      if (selectedTeamFilter !== 'all' && log.teamId !== selectedTeamFilter) {
        return false;
      }
      // 2. Status filter
      if (mobileStatusFilter !== 'all') {
        const st = getLogWorkStatus(log);
        if (st !== mobileStatusFilter) return false;
      }
      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (log.stepTitle || '').toLowerCase().includes(q) ||
          (log.description || '').toLowerCase().includes(q) ||
          (log.teamName || '').toLowerCase().includes(q) ||
          (log.membersPresent || []).some((m) => m.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [logs, selectedTeamFilter, mobileStatusFilter, searchQuery]);

  // Handle URL query parameter for team filter and task pre-filling
  useEffect(() => {
    const urlTeam = searchParams.get('team') || searchParams.get('teamId');
    if (urlTeam && (urlTeam === 'all' || TEAMS[urlTeam as TeamId])) {
      setSelectedTeamFilter(urlTeam);
      if (urlTeam !== 'all') {
        setTargetTeamId(urlTeam as TeamId);
      }
    }
    const taskParam = searchParams.get('task') || searchParams.get('taskTitle');
    if (taskParam) {
      setStepTitle(decodeURIComponent(taskParam));
      setIsFormOpen(true);
    }
  }, [searchParams]);

  // Auth redirect guard & tier access check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?from=/log');
      return;
    }

    if (!authLoading && user) {
      // Tier 3 Team Members are strictly blocked from /log and redirected to /dashboard
      if (!isCore && !isLead && user.teamId !== 'core') {
        router.push('/dashboard?restricted=log');
        return;
      }

      const urlTeam = searchParams.get('team') || searchParams.get('teamId');
      if (isCoreAdmin && urlTeam && urlTeam !== 'all' && TEAMS[urlTeam as TeamId]) {
        setTargetTeamId(urlTeam as TeamId);
      } else {
        setTargetTeamId(user.teamId);
      }
      setAuthorName(user.displayName);
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setWorkTime(`${hours}:${mins}`);
    }
  }, [user, authLoading, isCore, isLead, isCoreAdmin, router, searchParams]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch logs with clean async pattern + offline fallback
  const loadLogs = useCallback(async () => {
    if (!user) return;
    setLoadingLogs(true);

    // 1. Immediately hydrate from offline cache if available
    getOfflineCachedLogs().then((cached) => {
      if (cached && cached.length > 0) {
        setLogs(cached);
      }
    });

    const teamQuery = !isCoreAdmin && user ? user.teamId : (selectedTeamFilter !== 'all' ? selectedTeamFilter : '');
    const url = teamQuery ? `/api/logs?teamId=${teamQuery}` : '/api/logs';

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
        cacheOfflineLogs(data.logs);
      }
    } catch (err) {
      console.warn('Network offline or failed, using cached logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, [user, isCoreAdmin, selectedTeamFilter]);

  // Listen to background sync completion events
  useEffect(() => {
    const handleLogSynced = (e: any) => {
      const newLog = e.detail;
      if (newLog) {
        setLogs((prev) => [newLog, ...prev.filter((l) => l.id !== newLog.id && !l.id.startsWith('temp-log-'))]);
      }
    };
    window.addEventListener('siep_log_synced', handleLogSynced);
    return () => window.removeEventListener('siep_log_synced', handleLogSynced);
  }, []);

  // Fetch tasks for deliverables pipeline & personal assignments
  const loadTeamTasks = useCallback(async () => {
    if (!user) return;
    setLoadingTasks(true);

    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        setAllTasks(data.tasks);
        const filtered = data.tasks.filter((t: Task) =>
          selectedTeamFilter === 'all'
            ? (isCoreAdmin ? true : t.teamId === user.teamId)
            : t.teamId === selectedTeamFilter
        );
        setTeamTasks(filtered);
      }
    } catch (err) {
      console.warn('Failed to load team tasks on log page:', err);
    } finally {
      setLoadingTasks(false);
    }
  }, [user, isCoreAdmin, selectedTeamFilter]);

  // Quick 1-click self-assign or toggle on log page
  const handleQuickAssignToMe = async (task: Task) => {
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

    setAllTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
    setTeamTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));

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
      console.warn('Failed to assign task on log page:', err);
    }
  };

  useEffect(() => {
    loadLogs();
    loadTeamTasks();
  }, [loadLogs, loadTeamTasks]);

  // Quick Advance Task from Log Page
  const handleQuickAdvanceTask = async (task: Task) => {
    const nextStatusMap: Record<TaskStatus, TaskStatus | null> = {
      todo: 'in_progress',
      in_progress: 'review',
      review: 'done',
      done: null,
    };
    const nextStatus = nextStatusMap[task.status];
    if (!nextStatus) return;

    if (nextStatus === 'done') {
      if (!canApproveCompletion) {
        alert('Hierarchy Rule: Only Squad Leads and Core Leadership can approve and mark tasks as Completed.');
        return;
      }
      setTaskToComplete(task);
      setIsCompleteModalOpen(true);
      return;
    }

    setTeamTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus, updatedAt: Date.now() } : t))
    );

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: nextStatus }),
      });
    } catch (err) {
      console.error('Error advancing task status:', err);
      loadTeamTasks();
    }
  };

  // Prefill new step log from task
  const handleSelectTaskForLog = (task: Task) => {
    setStepTitle(task.title);
    if (task.description) {
      setDescription((prev) => prev ? prev : `Working on deliverable: ${task.description}`);
    }
    setIsFormOpen(true);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  if (!isMounted || authLoading || !user) {
    return <LogLoadingSkeleton />;
  }

  const currentTeam = TEAMS[user.teamId];

  // Handle Video File Selection with 5 GB resumable upload detection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    setLargeFileNotice(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const mb = file.size / (1024 * 1024);
      setVideoFile(file);
      if (mb > 5000) {
        setLargeFileNotice(
          `This video is ${(mb / 1024).toFixed(2)} GB, which exceeds the 5 GB direct upload ceiling. Please upload it directly to your Google Drive and paste the share link on the right for 0s instant embedding.`
        );
      }
    }
  };

  // Submit new log handler (Background Queue & Offline Compatible)
  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!stepTitle.trim() || !description.trim()) {
      setFormError('Please enter a Step Title and Description of what was worked on.');
      return;
    }

    const effectiveTeamId: TeamId = isCoreAdmin ? targetTeamId : user.teamId;
    const effectiveTeamConfig = TEAMS[effectiveTeamId];

    const logPayload = {
      stepTitle: stepTitle.trim(),
      status: targetStatus,
      teamId: effectiveTeamId,
      teamName: effectiveTeamConfig?.name || effectiveTeamId,
      authorName: authorName.trim() || user.displayName,
      date: date || new Date().toISOString().split('T')[0],
      workTime: workTime.trim() || '12:00 PM',
      membersPresent: selectedMembers,
      hoursSpent: parseFloat(hoursSpent) || 0,
      description: description.trim(),
      achievements: achievements.trim(),
      blockers: blockers.trim(),
      videoUrl: videoUrlInput.trim(),
    };

    // 1. Instantly create optimistic preview log so user sees it right away!
    const tempId = `temp-log-${Date.now()}`;
    const optimisticLog: WorkLog = {
      id: tempId,
      stepNumber: (logs[0]?.stepNumber || 0) + 1,
      ...logPayload,
      createdAt: Date.now(),
    };
    setLogs((prev) => [optimisticLog, ...prev]);

    // 2. Reset form immediately — user is never blocked!
    setStepTitle('');
    setDescription('');
    setAchievements('');
    setBlockers('');
    setVideoFile(null);
    setVideoUrlInput('');
    setSelectedMembers([]);
    setUploadProgress(0);
    setUploadStatus(null);
    setLargeFileNotice(null);
    setIsFormOpen(false);

    // 3. Initiate background upload queue (handles streaming video to Drive & cloud sync)
    enqueueLogUpload({
      logData: logPayload,
      videoFile: videoFile || undefined,
    });

    setTimeout(() => {
      document.getElementById('engineering-feed')?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  // Open Edit Modal
  const openEditModal = (log: WorkLog) => {
    setEditingLog(log);
    setEditStepTitle(log.stepTitle);
    setEditStatus(log.status || getLogWorkStatus(log));
    setEditTeamId(log.teamId);
    setEditAuthorName(log.authorName);
    setEditDate(log.date);
    setEditWorkTime(log.workTime || '');
    setEditMembers(log.membersPresent || []);
    setEditHoursSpent(String(log.hoursSpent || 0));
    setEditDescription(log.description);
    setEditAchievements(log.achievements || '');
    setEditBlockers(log.blockers || '');
    setEditVideoUrl(log.videoUrl || '');
    setEditError(null);
  };

  // Submit Edit Handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;
    setEditError(null);

    if (!editStepTitle.trim() || !editDescription.trim()) {
      setEditError('Step Title and Description are required.');
      return;
    }

    setIsEditSubmitting(true);
    try {
      const res = await fetch('/api/logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingLog.id,
          stepTitle: editStepTitle.trim(),
          status: editStatus,
          teamId: isCoreAdmin ? editTeamId : editingLog.teamId,
          authorName: editAuthorName.trim() || editingLog.authorName,
          date: editDate || editingLog.date,
          workTime: editWorkTime.trim() || editingLog.workTime,
          membersPresent: editMembers,
          hoursSpent: parseFloat(editHoursSpent) || 0,
          description: editDescription.trim(),
          achievements: editAchievements.trim(),
          blockers: editBlockers.trim(),
          videoUrl: editVideoUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.log) {
        setLogs((prev) => prev.map((item) => (item.id === editingLog.id ? data.log : item)));
        setEditingLog(null);
      } else {
        setEditError(data.error || 'Failed to update step log.');
      }
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to update step log.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Delete Handler
  const handleDeleteLog = async () => {
    if (!deleteConfirmLog) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/logs?id=${deleteConfirmLog.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setLogs((prev) => prev.filter((item) => item.id !== deleteConfirmLog.id));
        setDeleteConfirmLog(null);
      } else {
        setDeleteError(data.error || 'Failed to delete step log.');
      }
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Network error during log deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Safe Filter logs for search
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.stepTitle || '').toLowerCase().includes(q) ||
      (log.description || '').toLowerCase().includes(q) ||
      (log.teamName || '').toLowerCase().includes(q) ||
      (log.membersPresent || []).some((m) => m.toLowerCase().includes(q))
    );
  });

  return (
    <main className="min-h-screen bg-alice-blue text-jet-black pt-20 sm:pt-24 pb-16 sm:pb-24 px-3 sm:px-6 lg:px-8 font-sans">
      
      {/* Background CAD Accent */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#2B303A_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-5 sm:space-y-8">

        {/* =========================================================================
            MOBILE BUILD LOG VIEW (PRD v1.0 & Mockup media_1794510271459_0a6999fe.jpg)
            Visible strictly on mobile screens (md:hidden).
            Desktop screens are completely isolated in (hidden md:block).
           ========================================================================= */}
        <div className="md:hidden space-y-4 max-w-lg mx-auto">
          {/* 1. Mobile Hero Header Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange/5 to-white border border-amber-200/60 p-5 shadow-xs">
            {/* Motorcycle Silhouette Watermark */}
            <svg className="absolute -right-2 -bottom-2 w-44 h-28 text-orange/15 pointer-events-none" viewBox="0 0 100 60" fill="currentColor">
              <circle cx="20" cy="42" r="14" fill="none" stroke="currentColor" strokeWidth="4"/>
              <circle cx="80" cy="42" r="14" fill="none" stroke="currentColor" strokeWidth="4"/>
              <path d="M20 42 L42 42 L55 24 L35 24 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
              <path d="M42 42 L65 24 L80 42" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
              <path d="M55 24 L72 14 L78 14" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              <path d="M45 18 L60 18" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
            </svg>

            <div className="relative z-10 flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-orange shrink-0 mt-0.5 shadow-2xs">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="space-y-1 min-w-0 pr-12">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-zinc-500 block">
                  SIEP 2026–27
                </span>
                <h2 className="text-xl font-black font-sans text-jet-black tracking-tight leading-tight">
                  Build Log
                </h2>
                <p className="text-xs font-sans text-zinc-500 leading-relaxed">
                  Record team work, tests and progress with photos or videos.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Prominent "+ Add Build Log" Button */}
          <button
            type="button"
            onClick={() => {
              setIsFormOpen(true);
              setFormError(null);
            }}
            className="w-full py-3.5 px-5 rounded-2xl bg-[#1e232d] hover:bg-jet-black text-white font-sans font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Build Log</span>
          </button>

          {/* 3. Five Work Status Tiles / Metric Cards (Responsive Grid Layout - Zero Horizontal Scroll) */}
          <div className="grid grid-cols-6 sm:grid-cols-5 gap-2">
            {(['in_progress', 'testing', 'completed', 'on_hold', 'review'] as LogWorkStatus[]).map((st, idx) => {
              const cfg = WORK_STATUS_CONFIG[st];
              const count = statusCounts[st] || 0;
              const isSelected = mobileStatusFilter === st;
              const colSpan = idx < 3 ? 'col-span-2 sm:col-span-1' : 'col-span-3 sm:col-span-1';

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setMobileStatusFilter(isSelected ? 'all' : st)}
                  className={`${colSpan} bg-white border rounded-2xl p-2.5 shadow-2xs flex flex-col justify-between cursor-pointer transition-all active:scale-95 text-left min-w-0 ${
                    isSelected
                      ? 'border-orange ring-2 ring-orange/30 bg-orange/5'
                      : 'border-jet-black/10 hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.tileIconBg} ${cfg.tileIconColor}`}>
                      {cfg.icon}
                    </div>
                    <div className="text-base font-black font-sans text-jet-black tabular-nums leading-none">
                      {count}
                    </div>
                  </div>
                  <div className={`text-[11px] font-sans font-medium truncate mt-2 ${isSelected ? 'text-orange font-bold' : 'text-zinc-500'}`}>
                    {cfg.label}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 4. Section Header: Recent Logs & Team Selector Dropdown */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <h3 className="text-lg font-bold font-sans text-jet-black tracking-tight">
              Recent Logs
            </h3>

            {/* Team selection through one dropdown per PRD */}
            <div className="relative">
              <select
                value={selectedTeamFilter}
                onChange={(e) => setSelectedTeamFilter(e.target.value)}
                className="appearance-none bg-white border border-jet-black/15 text-jet-black text-xs font-sans font-bold py-1.5 pl-3 pr-7 rounded-xl shadow-2xs focus:ring-2 focus:ring-orange focus:outline-none cursor-pointer"
              >
                <option value="all">All Teams</option>
                {TEAMS_LIST.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.shortName}
                  </option>
                ))}
              </select>
              <svg className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* 5. Search & Status Filter Chips Together */}
          <div className="space-y-2">
            {/* Search Input */}
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search logs (title, description, member)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-jet-black/15 bg-white text-xs font-sans text-jet-black placeholder:text-zinc-400 focus:ring-2 focus:ring-orange focus:outline-none shadow-2xs transition-all"
              />
              <svg className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-jet-black text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Filter Chips Row */}
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setMobileStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold whitespace-nowrap cursor-pointer transition-all ${
                  mobileStatusFilter === 'all'
                    ? 'bg-jet-black text-white shadow-2xs'
                    : 'bg-white border border-jet-black/10 text-zinc-600 hover:text-jet-black'
                }`}
              >
                All
              </button>
              {(['in_progress', 'testing', 'completed', 'on_hold', 'review'] as LogWorkStatus[]).map((st) => {
                const cfg = WORK_STATUS_CONFIG[st];
                const isSelected = mobileStatusFilter === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setMobileStatusFilter(isSelected ? 'all' : st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-jet-black text-white shadow-2xs'
                        : 'bg-white border border-jet-black/10 text-zinc-600 hover:text-jet-black'
                    }`}
                  >
                    <span>{cfg.filterLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Chronological Activity Feed with Video Previews */}
          <div className="space-y-3 pt-1">
            {loadingLogs ? (
              <div className="bg-white border border-jet-black/10 rounded-2xl p-8 text-center text-xs font-mono text-zinc-500 space-y-2">
                <span className="w-5 h-5 border-2 border-orange border-t-transparent rounded-full animate-spin inline-block"></span>
                <p>Syncing build logs...</p>
              </div>
            ) : visibleMobileLogs.length === 0 ? (
              <div className="bg-white border border-dashed border-zinc-200 rounded-3xl p-8 text-center space-y-1">
                <p className="text-xs font-sans font-semibold text-zinc-600">
                  No build logs match the selected filters.
                </p>
                <p className="text-[11px] font-sans text-zinc-400">
                  Try switching teams, clearing search, or tap &ldquo;+ Add Build Log&rdquo; above!
                </p>
              </div>
            ) : (
              <div className="relative pl-5 space-y-3">
                {/* Timeline Track Guide */}
                <div className="absolute left-2 top-3 bottom-3 w-0.5 bg-zinc-200" />

                {visibleMobileLogs.map((log) => {
                  const workStatus = getLogWorkStatus(log);
                  const statusCfg = WORK_STATUS_CONFIG[workStatus];
                  const domainBadge = getDomainBadge(log.teamId);
                  const dateFormatted = formatLogDate(log.date || log.createdAt);

                  // Extract YouTube thumbnail or fallback
                  let thumbUrl: string | null = null;
                  if (log.videoUrl) {
                    const ytMatch = log.videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                    if (ytMatch && ytMatch[1]) {
                      thumbUrl = `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
                    }
                  }

                  return (
                    <div key={log.id} className="relative flex items-center">
                      {/* Timeline Dot */}
                      <div className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange ring-4 ring-white shadow-2xs z-10" />

                      {/* Compact Card */}
                      <div
                        onClick={() => setSelectedMobileDetailLog(log)}
                        className="w-full bg-white border border-jet-black/10 hover:border-orange/60 rounded-2xl p-2.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3"
                      >
                        {/* Left: Thumbnail Preview */}
                        <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-black/10 flex items-center justify-center">
                          {thumbUrl ? (
                            <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center relative">
                              <svg className="w-8 h-8 text-white/10" viewBox="0 0 100 60" fill="currentColor">
                                <circle cx="20" cy="42" r="14" fill="none" stroke="currentColor" strokeWidth="4"/>
                                <circle cx="80" cy="42" r="14" fill="none" stroke="currentColor" strokeWidth="4"/>
                                <path d="M20 42 L42 42 L55 24 L35 24 Z" fill="none" stroke="currentColor" strokeWidth="4"/>
                              </svg>
                            </div>
                          )}
                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                            <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
                              <svg className="w-3 h-3 translate-x-0.5 fill-current" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                          {/* Timestamp Pill */}
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 text-white text-[8px] font-mono rounded">
                            {log.workTime || 'VIDEO'}
                          </span>
                        </div>

                        {/* Middle: Title, Description, Domain, Status */}
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-sans font-bold text-jet-black truncate">
                            {log.stepTitle}
                          </h4>
                          <p className="text-xs text-zinc-500 font-sans truncate mt-0.5">
                            {log.description}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {/* Domain Short Code */}
                            <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-sans font-black uppercase tracking-wider border shrink-0 ${domainBadge.bg}`}>
                              {domainBadge.code}
                            </span>
                            {/* Work Status Pill */}
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-sans font-bold flex items-center gap-1 shrink-0 ${statusCfg.badgeBg}`}>
                              {statusCfg.icon}
                              <span>{statusCfg.label}</span>
                            </span>
                          </div>
                        </div>

                        {/* Right: Date & Chevron */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-zinc-400 font-sans font-medium whitespace-nowrap">
                            {dateFormatted}
                          </span>
                          <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* =========================================================================
            DESKTOP BUILD LOG VIEW (Desktop Layout Preserved 100%)
            Visible strictly on desktop screens (hidden md:block).
           ========================================================================= */}
        <div className="hidden md:block space-y-8">

        {/* =========================================================================
            HEADER & SCOPE CONSOLE
           ========================================================================= */}
        <div className="bg-white border border-jet-black/10 rounded-2xl p-4 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Title & Metadata */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse"></span>
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-grey font-bold">
                  SIEP 2026–27 • Engineering Logbook
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-jet-black tracking-tight">
                Build Log &amp; Step Tracker<span className="text-orange">.</span>
              </h1>
              <p className="text-grey font-light text-sm max-w-2xl leading-relaxed">
                Recording and tracking every fabrication move, powertrain test, firmware flash, and design milestone with video evidence.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => loadLogs()}
                title="Sync logs with cloud storage"
                className="px-4 py-2.5 rounded-xl border border-jet-black/15 bg-white hover:bg-alice-blue text-jet-black transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-xs font-mono font-medium"
              >
                <svg className={`w-3.5 h-3.5 text-grey ${loadingLogs ? 'animate-spin text-orange' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Sync</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(!isFormOpen);
                  setFormError(null);
                }}
                className={`px-4 sm:px-5 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
                  isFormOpen
                    ? 'bg-jet-black/10 text-jet-black hover:bg-jet-black/20'
                    : 'bg-jet-black text-alice-blue hover:bg-orange'
                }`}
              >
                <svg className={`w-3.5 h-3.5 transition-transform ${isFormOpen ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>{isFormOpen ? 'Close' : 'Record Step'}</span>
              </button>
            </div>

          </div>

          {/* Scope Indicator Ribbon */}
          <div className="mt-6 pt-5 border-t border-jet-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5 text-grey">
              <span className={`w-2 h-2 rounded-full ${isCoreAdmin ? 'bg-orange' : 'bg-emerald-500'}`}></span>
              {isCoreAdmin ? (
                <span>
                  <strong className="text-jet-black">Master Admin Access:</strong> Viewing and logging across all 8 subsystem teams.
                </span>
              ) : (
                <span>
                  <strong className="text-jet-black">Team Scoped:</strong> Viewing exclusively for <strong className="text-jet-black">[{currentTeam?.code}] {currentTeam?.name}</strong>.
                </span>
              )}
            </div>

            <Link
              href="/dashboard"
              className="text-orange hover:text-jet-black font-bold transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
            >
              Open Project Dashboard →
            </Link>
          </div>
        </div>

        {/* =========================================================================
            SQUAD & PERSONAL DELIVERABLES WIDGET
            Shows assigned deliverables for the member and team with 1-click step prefill
           ========================================================================= */}
        {(teamTasks.length > 0 || myAssignedTasks.length > 0) && (
          <div className="bg-white border border-jet-black/10 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-jet-black/10">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTaskViewMode('assigned')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    taskViewMode === 'assigned'
                      ? 'bg-orange text-white shadow-sm'
                      : 'bg-alice-blue/70 text-grey hover:text-jet-black'
                  }`}
                >
                  <span>Assigned to Me</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    taskViewMode === 'assigned' ? 'bg-white/25 text-white' : 'bg-jet-black/10 text-jet-black'
                  }`}>
                    {myAssignedTasks.filter((t: Task) => t.status !== 'done').length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setTaskViewMode('subsystem')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    taskViewMode === 'subsystem'
                      ? 'bg-jet-black text-alice-blue shadow-sm'
                      : 'bg-alice-blue/70 text-grey hover:text-jet-black'
                  }`}
                >
                  <span>Subsystem Deliverables</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    taskViewMode === 'subsystem' ? 'bg-white/20 text-alice-blue' : 'bg-jet-black/10 text-jet-black'
                  }`}>
                    {teamTasks.filter((t: Task) => t.status !== 'done').length}
                  </span>
                </button>
              </div>

              <Link
                href="/dashboard"
                className="text-xs font-mono text-orange hover:text-jet-black font-bold transition-colors inline-flex items-center gap-1"
              >
                <span>Full Task Board</span>
                <span>→</span>
              </Link>
            </div>

            {/* Tasks list */}
            {(() => {
              const displayTasks: Task[] = (taskViewMode === 'assigned' ? myAssignedTasks : teamTasks)
                .filter((t: Task) => t.status !== 'done')
                .slice(0, 6);

              if (displayTasks.length === 0) {
                return (
                  <div className="py-6 px-4 bg-alice-blue/40 border border-dashed border-jet-black/10 rounded-xl text-center space-y-1.5 font-mono text-xs">
                    <p className="text-jet-black font-semibold">
                      {taskViewMode === 'assigned'
                        ? `No active deliverables currently assigned to ${user.displayName}.`
                        : 'No active subsystem deliverables in this view.'}
                    </p>
                    <p className="text-grey text-[11px]">
                      {taskViewMode === 'assigned'
                        ? 'Click "Subsystem Deliverables" above to browse and claim tasks for your squad!'
                        : 'New tasks can be created from the Project Dashboard.'}
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {displayTasks.map((task: Task) => {
                    const taskTeam = TEAMS[task.teamId];
                    const isAssigned = isTaskAssignedToUser(task, user);

                    return (
                      <div
                        key={task.id}
                        className="bg-alice-blue/40 border border-jet-black/10 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-orange/60 hover:bg-white transition-all shadow-sm"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              task.status === 'in_progress'
                                ? 'bg-orange/15 text-orange'
                                : task.status === 'review'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-zinc-100 text-zinc-700'
                            }`}>
                              {task.status.replace('_', ' ')}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-jet-black/5 text-jet-black">
                                [{taskTeam?.code || task.teamId.toUpperCase()}]
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                                task.priority === 'urgent'
                                  ? 'bg-red-500 text-white'
                                  : task.priority === 'high'
                                  ? 'bg-orange text-jet-black'
                                  : 'bg-zinc-100 text-zinc-600'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                          <h4 className="text-xs font-bold text-jet-black line-clamp-2">
                            {task.title}
                          </h4>
                          <div className="flex items-center justify-between gap-2 text-[10px] font-mono text-grey pt-0.5">
                            {task.dueDate ? (
                              <span>Due: {task.dueDate}</span>
                            ) : (
                              <span className="italic text-grey/60">No due date</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleQuickAssignToMe(task)}
                              className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer ${
                                isAssigned
                                  ? 'bg-orange/15 text-orange border border-orange/30'
                                  : 'bg-jet-black/5 hover:bg-orange hover:text-white border border-jet-black/10'
                              }`}
                            >
                              {isAssigned ? 'Assigned' : '+ Claim'}
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-jet-black/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSelectTaskForLog(task)}
                            className="px-2.5 py-1.5 sm:py-1 bg-jet-black text-alice-blue hover:bg-orange rounded-lg text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer w-full sm:w-auto min-h-[36px] sm:min-h-0 flex items-center justify-center"
                          >
                            Log Work
                          </button>
                          <div className="flex items-center gap-1.5 w-full sm:w-auto">
                            {task.status === 'review' ? (
                              canApproveCompletion ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTaskToComplete(task);
                                      setIsCompleteModalOpen(true);
                                    }}
                                    className="px-2.5 py-1.5 sm:py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-300 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer flex-1 sm:flex-initial min-h-[36px] sm:min-h-0 flex items-center justify-center text-center"
                                    title="Approve deliverable with video evidence"
                                  >
                                    Approve + Video
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleQuickAdvanceTask(task)}
                                    className="px-2.5 py-1.5 sm:py-1 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer flex-1 sm:flex-initial min-h-[36px] sm:min-h-0 flex items-center justify-center text-center shadow-2xs"
                                    title="Approve deliverable as Completed"
                                  >
                                    Approve ✓
                                  </button>
                                </>
                              ) : (
                                <span
                                  title="Under Review: Only Squad Leads and Core Leadership can approve and complete deliverables"
                                  className="px-2.5 py-1.5 sm:py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center gap-1 select-none flex-1 sm:flex-initial min-h-[36px] sm:min-h-0"
                                >
                                  <span>🔒</span>
                                  <span>Awaiting Lead Approval</span>
                                </span>
                              )
                            ) : (
                              <>
                                {canApproveCompletion && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setTaskToComplete(task);
                                      setIsCompleteModalOpen(true);
                                    }}
                                    className="px-2.5 py-1.5 sm:py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-300 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer flex-1 sm:flex-initial min-h-[36px] sm:min-h-0 flex items-center justify-center text-center"
                                    title="Mark completed with video evidence"
                                  >
                                    Done + Video
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleQuickAdvanceTask(task)}
                                  className="px-2.5 py-1.5 sm:py-1 bg-white hover:bg-jet-black/5 border border-jet-black/15 rounded-lg text-[10px] font-mono font-bold text-jet-black transition-colors cursor-pointer flex-1 sm:flex-initial min-h-[36px] sm:min-h-0 flex items-center justify-center text-center"
                                  title="Advance task status"
                                >
                                  Advance →
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* =========================================================================
            RECORD NEW STEP FORM DRAWER / MODAL
           ========================================================================= */}
        {isFormOpen && (
          <div className="fixed inset-0 z-[200] bg-jet-black/70 backdrop-blur-xs flex flex-col justify-end p-0 sm:items-center sm:justify-center sm:p-4 overflow-y-auto animate-in fade-in duration-200">
            <div
              onClick={() => setIsFormOpen(false)}
              className="fixed inset-0"
            />
            <div className="relative bg-white border-2 border-orange/40 rounded-t-3xl sm:rounded-2xl p-4 sm:p-8 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto z-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-8 my-0 sm:my-auto">
              
              {/* Form Top Title */}
              <div className="flex items-center justify-between pb-3 border-b border-jet-black/10">
                <h3 className="text-lg font-bold text-jet-black tracking-tight">
                  Add Build Log
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Error Banner */}
              {formError && (
                <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-3">
                  <span className="font-bold text-xs uppercase tracking-wider shrink-0 bg-red-200 px-1.5 py-0.5 rounded">Error</span>
                  <p className="leading-relaxed flex-1">{formError}</p>
                  <button
                    type="button"
                    onClick={() => setFormError(null)}
                    className="text-red-500 hover:text-red-800 text-xs font-mono font-bold"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <form onSubmit={handleLogSubmit} className="mt-5 space-y-5">
                
                {/* Step Title */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                    Step Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={stepTitle}
                    onChange={(e) => setStepTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-sm font-medium focus:ring-2 focus:ring-orange focus:outline-none transition-all"
                  />
                </div>

                {/* Work Status */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                    Work Status
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(['in_progress', 'testing', 'completed', 'on_hold', 'review'] as LogWorkStatus[]).map((st) => {
                      const cfg = WORK_STATUS_CONFIG[st];
                      const isSelected = targetStatus === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setTargetStatus(st)}
                          className={`p-2 rounded-xl border text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-orange bg-orange/10 text-orange shadow-2xs ring-1 ring-orange'
                              : 'border-jet-black/15 bg-white text-zinc-700 hover:bg-zinc-50'
                          }`}
                        >
                          {cfg.icon}
                          <span className="truncate">{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              {/* Subsystem, Date, Time & Hours */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                
                {/* Team Scope */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                    Subsystem Team
                  </label>
                  {isCoreAdmin ? (
                    <select
                      value={targetTeamId}
                      onChange={(e) => {
                        setTargetTeamId(e.target.value as TeamId);
                        setSelectedMembers([]);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none transition-all"
                    >
                      {TEAMS_LIST.map((t) => (
                        <option key={t.id} value={t.id}>
                          [{t.code}] {t.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full px-3 py-2 rounded-xl border border-jet-black/10 bg-jet-black/5 text-jet-black text-xs font-mono font-bold flex items-center justify-between">
                      <span>[{currentTeam?.code}] {currentTeam?.name}</span>
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-jet-black/10 text-grey">Locked</span>
                    </div>
                  )}
                </div>

                {/* Work Date */}
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none font-mono transition-all"
                  />
                </div>

                {/* Time */}
                <div className="col-span-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                    Time
                  </label>
                  <input
                    type="text"
                    value={workTime}
                    onChange={(e) => setWorkTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none font-mono transition-all"
                  />
                </div>

                {/* Hours */}
                <div className="col-span-1">
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                    Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="24"
                    value={hoursSpent}
                    onChange={(e) => setHoursSpent(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none font-mono transition-all"
                  />
                </div>

              </div>

              {/* Members */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                  Assigned Members
                </label>
                <MemberSelect
                  teamId={isCoreAdmin ? targetTeamId : user.teamId}
                  selectedMembers={selectedMembers}
                  onChange={setSelectedMembers}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none leading-relaxed transition-all"
                />
              </div>

              {/* Achievements & Blockers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                    Key Achievements (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={achievements}
                    onChange={(e) => setAchievements(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                    Blockers / Issues (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none"
                  />
                </div>
              </div>

              {/* Video Attachment */}
              <div className="space-y-3 pt-2 border-t border-jet-black/10">
                <label className="block text-xs font-mono uppercase text-grey font-medium">
                  Video (Upload File or Paste Link)
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option A: File Upload */}
                  <div className="p-4 bg-alice-blue/40 border border-jet-black/10 rounded-xl space-y-2">
                    <label className="block text-xs font-mono uppercase text-jet-black font-semibold">
                      Upload Video File
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="w-full text-xs font-mono file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-mono file:font-bold file:bg-jet-black file:text-alice-blue hover:file:bg-orange file:cursor-pointer cursor-pointer border border-jet-black/15 bg-white p-2 rounded-xl"
                    />

                    {videoFile && (
                      <div className="mt-2 flex items-center justify-between bg-white p-2.5 rounded-xl border border-emerald-200 shadow-2xs">
                        <span className="text-xs font-mono text-emerald-700 font-bold truncate max-w-[200px]">
                          {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoFile(null);
                            setLargeFileNotice(null);
                          }}
                          className="text-xs font-mono text-red-500 hover:underline cursor-pointer shrink-0 ml-2"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {largeFileNotice && (
                      <div className="mt-2 p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900">
                        {largeFileNotice}
                      </div>
                    )}
                  </div>

                  {/* Option B: Direct Link */}
                  <div className="p-4 bg-alice-blue/40 border border-jet-black/10 rounded-xl space-y-2">
                    <label className="block text-xs font-mono uppercase text-jet-black font-semibold">
                      Or Paste Video Link
                    </label>
                    <input
                      type="url"
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                    />

                    {videoUrlInput && (
                      <div className="text-xs font-mono">
                        {getEmbeddableVideoUrl(videoUrlInput) ? (
                          <span className="text-emerald-600 font-medium">Valid video link</span>
                        ) : (
                          <span className="text-amber-600">Please enter a valid Google Drive or YouTube link</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {isUploading && (
                  <div className="mt-3 p-3 bg-alice-blue/60 border border-orange/20 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono text-jet-black">
                      <span className="font-medium">{uploadStatus}</span>
                      <span className="font-bold text-orange">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-jet-black/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-jet-black/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-jet-black/20 text-jet-black text-xs font-mono uppercase font-semibold hover:bg-jet-black/5 cursor-pointer transition-colors w-full sm:w-auto text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 sm:py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] sm:min-h-0"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Step →</span>
                  )}
                </button>
              </div>

            </form>

          </div>
          </div>
        )}

        {/* =========================================================================
            EDIT STEP MODAL DIALOG
           ========================================================================= */}
        {editingLog && (
          <div className="fixed inset-0 z-[200] bg-jet-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white border-2 border-orange/50 rounded-2xl max-w-3xl w-full p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between pb-4 border-b border-jet-black/10">
                <div>
                  <h3 className="text-lg font-bold text-jet-black tracking-tight">
                    Edit Step #{editingLog.stepNumber}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="text-grey hover:text-jet-black p-1.5 rounded-lg border border-jet-black/10 hover:bg-alice-blue cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {editError}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                    Step Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editStepTitle}
                    onChange={(e) => setEditStepTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-jet-black text-base sm:text-sm focus:ring-2 focus:ring-orange focus:outline-none"
                  />
                </div>

                {/* Work Status Selector */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                    Work Status
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {(['in_progress', 'testing', 'completed', 'on_hold', 'review'] as LogWorkStatus[]).map((st) => {
                      const cfg = WORK_STATUS_CONFIG[st];
                      const isSelected = editStatus === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setEditStatus(st)}
                          className={`p-2 rounded-xl border text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                            isSelected
                              ? 'border-orange bg-orange/10 text-orange shadow-2xs ring-1 ring-orange'
                              : 'border-jet-black/15 bg-white text-zinc-700 hover:bg-zinc-50'
                          }`}
                        >
                          {cfg.icon}
                          <span className="truncate">{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                      Subsystem Team
                    </label>
                    {isCoreAdmin ? (
                      <select
                        value={editTeamId}
                        onChange={(e) => setEditTeamId(e.target.value as TeamId)}
                        className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                      >
                        {TEAMS_LIST.map((t) => (
                          <option key={t.id} value={t.id}>
                            [{t.code}] {t.shortName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="px-3 py-2 rounded-xl bg-jet-black/5 text-xs font-mono font-bold text-jet-black">
                        {editingLog.teamName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                      Work Date
                    </label>
                    <input
                      type="date"
                      required
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                      Hours Spent
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      value={editHoursSpent}
                      onChange={(e) => setEditHoursSpent(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                    Contributors
                  </label>
                  <MemberSelect
                    teamId={isCoreAdmin ? editTeamId : editingLog.teamId}
                    selectedMembers={editMembers}
                    onChange={setEditMembers}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                    Operations Performed *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-emerald-700 font-bold mb-1.5">
                      Key Achievement
                    </label>
                    <textarea
                      rows={2}
                      value={editAchievements}
                      onChange={(e) => setEditAchievements(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/20 text-base sm:text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-amber-700 font-bold mb-1.5">
                      Blocker / Challenge
                    </label>
                    <textarea
                      rows={2}
                      value={editBlockers}
                      onChange={(e) => setEditBlockers(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/20 text-base sm:text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                    Video URL (Google Drive / YouTube)
                  </label>
                  <input
                    type="url"
                    value={editVideoUrl}
                    onChange={(e) => setEditVideoUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-jet-black/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingLog(null)}
                    className="px-5 py-2.5 rounded-xl border border-jet-black/20 text-xs font-mono uppercase font-semibold hover:bg-jet-black/5 cursor-pointer w-full sm:w-auto text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEditSubmitting}
                    className="px-6 py-3 sm:py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] sm:min-h-0"
                  >
                    {isEditSubmitting ? 'Saving Changes...' : 'Save Revisions'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* =========================================================================
            DELETE CONFIRMATION MODAL
           ========================================================================= */}
        {deleteConfirmLog && (
          <div className="fixed inset-0 z-[200] bg-jet-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white border-2 border-red-500/40 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-jet-black">Confirm Step Deletion</h3>
                  <p className="text-xs text-grey">Step #{deleteConfirmLog.stepNumber}</p>
                </div>
              </div>

              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {deleteError}
                </div>
              )}

              <p className="text-xs text-jet-black/80 leading-relaxed">
                Are you sure you want to permanently delete step record: <strong className="text-jet-black">&ldquo;{deleteConfirmLog.stepTitle}&rdquo;</strong>? This action cannot be undone.
              </p>

              <div className="pt-3 border-t border-jet-black/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmLog(null);
                    setDeleteError(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-jet-black/20 text-xs font-mono uppercase font-semibold hover:bg-jet-black/5 cursor-pointer w-full sm:w-auto text-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteLog}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50 w-full sm:w-auto text-center min-h-[40px] sm:min-h-0 flex items-center justify-center"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Step'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ENGINEERING FEED HEADER & FILTER BAR
           ========================================================================= */}
        <div id="engineering-feed" className="bg-white border border-jet-black/10 rounded-2xl p-4 sm:p-7 shadow-sm scroll-mt-20 sm:scroll-mt-24 space-y-4 sm:space-y-5">
          
          {/* Top Row: Title & Counter + Search Input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-jet-black tracking-tight">
                Engineering Timeline Feed
              </h2>
              <span className="px-3 py-1 rounded-full bg-jet-black/10 text-jet-black font-mono text-xs font-bold">
                {filteredLogs.length} {filteredLogs.length === 1 ? 'record' : 'records'}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-12 py-2.5 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none shadow-sm"
              />
              <svg className="w-4 h-4 text-grey absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-grey hover:text-jet-black text-xs font-mono font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Subsystem Filter Tabs */}
          {isCoreAdmin ? (
            <div className="pt-2 border-t border-jet-black/5 flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar touch-pan-x overscroll-x-contain scroll-smooth">
              <button
                type="button"
                onClick={() => setSelectedTeamFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                  selectedTeamFilter === 'all'
                    ? 'bg-jet-black text-alice-blue font-bold shadow-sm'
                    : 'bg-alice-blue/60 text-grey hover:text-jet-black hover:bg-alice-blue border border-jet-black/10'
                }`}
              >
                All Teams ({logs.length})
              </button>
              {TEAMS_LIST.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTeamFilter(t.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                    selectedTeamFilter === t.id
                      ? 'bg-jet-black text-alice-blue font-bold shadow-sm'
                      : 'bg-alice-blue/60 text-grey hover:text-jet-black hover:bg-alice-blue border border-jet-black/10'
                  }`}
                >
                  <span className="text-[10px] opacity-70">[{t.code}]</span>
                  <span>{t.shortName}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="pt-2 border-t border-jet-black/5 flex items-center gap-2 text-xs font-mono">
              <span className="text-grey">Filtered exclusively for:</span>
              <span className="px-3 py-1 rounded-full bg-jet-black text-alice-blue font-bold">
                [{currentTeam?.code}] {currentTeam?.name}
              </span>
            </div>
          )}

        </div>

        {/* =========================================================================
            TIMELINE FEED CARDS
           ========================================================================= */}
        <div className="space-y-6">
          {loadingLogs ? (
            <div className="bg-white border border-jet-black/10 rounded-2xl p-8 sm:p-16 text-center text-sm font-mono text-grey shadow-sm">
              <span className="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin inline-block mb-3"></span>
              <p>Syncing engineering logbook...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="bg-white border border-jet-black/10 rounded-2xl p-8 sm:p-16 text-center text-grey shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-alice-blue flex items-center justify-center mx-auto text-grey">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-jet-black">No Step Records Found</h4>
              <p className="text-xs text-grey max-w-md mx-auto leading-relaxed">
                No entries match your search criteria. Click &ldquo;+ Record New Step&rdquo; at the top to log your team&apos;s latest moves!
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const teamInfo = TEAMS[log.teamId] || currentTeam;
              const embedInfo = getEmbeddableVideoUrl(log.videoUrl);
              const canModify = isCoreAdmin || user.teamId === log.teamId;

              const videoActionLabel =
                embedInfo?.source === 'youtube'
                  ? 'Watch on YouTube ↗'
                  : embedInfo?.source === 'drive'
                  ? 'Open in Google Drive ↗'
                  : 'Open Video ↗';

              return (
                <article
                  key={log.id}
                  className="bg-white border border-jet-black/10 hover:border-orange/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  
                  {/* Card Header Bar */}
                  <div className="px-4 sm:px-8 py-3.5 sm:py-4 bg-jet-black/[0.02] border-b border-jet-black/5 space-y-2.5 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:gap-3">
                    {/* Top Row on Mobile: Badges Left, Edit/Delete Right */}
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <span className="px-2 sm:px-2.5 py-1 rounded bg-jet-black text-alice-blue font-mono font-black text-[11px] sm:text-xs tracking-wider shrink-0">
                          STEP #{String(log.stepNumber).padStart(2, '0')}
                        </span>
                        <span className={`px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold border flex items-center gap-1 sm:gap-1.5 truncate ${teamInfo?.badgeBg || 'bg-jet-black/10 text-jet-black'}`}>
                          <span className="text-[10px] opacity-70">[{teamInfo?.code}]</span>
                          <span className="truncate">{log.teamName}</span>
                        </span>
                      </div>

                      {/* Edit & Delete Action Buttons (Mobile inline right) */}
                      {canModify && (
                        <div className="flex sm:hidden items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditModal(log)}
                            title="Edit this step record"
                            className="p-2 rounded-lg border border-jet-black/15 bg-white hover:border-orange hover:text-orange text-grey transition-colors cursor-pointer shadow-2xs min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmLog(log)}
                            title="Delete this step record"
                            className="p-2 rounded-lg border border-jet-black/15 bg-white hover:border-red-400 hover:text-red-600 text-grey transition-colors cursor-pointer shadow-2xs min-h-[36px] min-w-[36px] flex items-center justify-center"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Sub Row: Date, Time, Hours + Desktop Action Buttons */}
                    <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-2.5 text-xs font-mono text-grey">
                      <div className="flex items-center gap-2">
                        <span className="bg-alice-blue px-2 sm:px-2.5 py-1 rounded border border-jet-black/10 text-[11px] sm:text-xs">
                          {log.date} {log.workTime ? `• ${log.workTime}` : ''}
                        </span>
                        <span className="bg-alice-blue px-2 sm:px-2.5 py-1 rounded border border-jet-black/10 font-bold text-jet-black text-[11px] sm:text-xs">
                          {log.hoursSpent} hrs
                        </span>
                      </div>

                      {/* Edit & Delete Action Buttons (Desktop) */}
                      {canModify && (
                        <div className="hidden sm:flex items-center gap-1.5 ml-2 pl-2 border-l border-jet-black/15">
                          <button
                            type="button"
                            onClick={() => openEditModal(log)}
                            title="Edit this step record"
                            className="p-1.5 rounded-lg border border-jet-black/15 bg-white hover:border-orange hover:text-orange text-grey transition-colors cursor-pointer shadow-2xs"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmLog(log)}
                            title="Delete this step record"
                            className="p-1.5 rounded-lg border border-jet-black/15 bg-white hover:border-red-400 hover:text-red-600 text-grey transition-colors cursor-pointer shadow-2xs"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
                    
                    {/* Step Title */}
                    <div>
                      <h3 className="text-lg sm:text-2xl font-black text-jet-black tracking-tight leading-snug">
                        {log.stepTitle}
                      </h3>
                    </div>

                    {/* Members List */}
                    {log.membersPresent && log.membersPresent.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-grey font-bold">
                          Contributors:
                        </span>
                        {log.membersPresent.map((m, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-mono bg-alice-blue text-jet-black px-2.5 py-0.5 rounded-full border border-jet-black/10 font-medium"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Detailed Description */}
                    <p className="text-sm text-jet-black/90 font-light leading-relaxed whitespace-pre-line">
                      {log.description}
                    </p>

                    {/* Video Player Embed */}
                    {embedInfo && (
                      <div className="rounded-xl overflow-hidden border border-jet-black/15 bg-black shadow-sm">
                        <div className="px-4 py-2.5 bg-jet-black/95 text-alice-blue text-xs font-mono flex items-center justify-between border-b border-white/10">
                          <span className="text-[11px] uppercase tracking-wider font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange animate-pulse"></span>
                            Video Proof &amp; Engineering Evidence
                          </span>
                          <a
                            href={log.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange hover:underline text-[11px] font-bold"
                          >
                            {videoActionLabel}
                          </a>
                        </div>
                        <div className="aspect-video w-full bg-black flex items-center justify-center">
                          {embedInfo.source === 'drive' || embedInfo.source === 'youtube' ? (
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
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Achievements & Blockers Grid */}
                    {(log.achievements || log.blockers) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-jet-black/5">
                        {log.achievements && (
                          <div className="p-4 bg-emerald-500/[0.04] rounded-xl border border-emerald-500/20 space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-bold block">
                              Key Achievement / Result
                            </span>
                            <p className="text-xs text-jet-black font-light leading-relaxed">
                              {log.achievements}
                            </p>
                          </div>
                        )}

                        {log.blockers && (
                          <div className="p-4 bg-amber-500/[0.05] rounded-xl border border-amber-500/20 space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-bold block">
                              Blocker / Challenge
                            </span>
                            <p className="text-xs text-jet-black font-light leading-relaxed">
                              {log.blockers}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                </article>
              );
            })
          )}
        </div>

        {/* End of Desktop View */}
        </div>

      </div>

      {/* =========================================================================
          MOBILE LOG DETAILS & VIDEO DRAWER
          Slide-up sheet triggered when tapping any compact card on mobile.
         ========================================================================= */}
      {selectedMobileDetailLog && (
        <div className="fixed inset-0 z-[200] flex flex-col justify-end p-0 sm:items-center sm:justify-center sm:p-4 animate-in fade-in duration-200">
          <div
            onClick={() => setSelectedMobileDetailLog(null)}
            className="fixed inset-0 bg-jet-black/60 backdrop-blur-xs"
          />

          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto z-10 shadow-2xl border border-jet-black/15 p-5 space-y-4 animate-in slide-in-from-bottom duration-200 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
            {/* Top Handle & Close */}
            <div className="flex items-center justify-between border-b border-jet-black/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-jet-black text-white font-mono text-[10px] font-bold">
                  STEP #{String(selectedMobileDetailLog.stepNumber).padStart(2, '0')}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getDomainBadge(selectedMobileDetailLog.teamId).bg}`}>
                  {getDomainBadge(selectedMobileDetailLog.teamId).code}
                </span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${WORK_STATUS_CONFIG[getLogWorkStatus(selectedMobileDetailLog)].badgeBg}`}>
                  {WORK_STATUS_CONFIG[getLogWorkStatus(selectedMobileDetailLog)].icon}
                  <span>{WORK_STATUS_CONFIG[getLogWorkStatus(selectedMobileDetailLog)].label}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMobileDetailLog(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Video Player Embed */}
            {selectedMobileDetailLog.videoUrl && (() => {
              const embed = getEmbeddableVideoUrl(selectedMobileDetailLog.videoUrl);
              if (!embed) return null;
              return (
                <div className="rounded-2xl overflow-hidden bg-black aspect-video border border-black/10 shadow-xs relative">
                  {embed.source === 'drive' || embed.source === 'youtube' ? (
                    <iframe
                      src={embed.embedUrl}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media; fullscreen"
                      allowFullScreen
                      title={selectedMobileDetailLog.stepTitle}
                    />
                  ) : (
                    <video
                      controls
                      src={embed.embedUrl}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              );
            })()}

            {/* Title & Metadata */}
            <div className="space-y-1">
              <h3 className="text-base font-bold font-sans text-jet-black">
                {selectedMobileDetailLog.stepTitle}
              </h3>
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-sans flex-wrap">
                <span>{selectedMobileDetailLog.teamName}</span>
                <span>&bull;</span>
                <span>{formatLogDate(selectedMobileDetailLog.date)}</span>
                {selectedMobileDetailLog.workTime && (
                  <>
                    <span>&bull;</span>
                    <span>{selectedMobileDetailLog.workTime}</span>
                  </>
                )}
                <span>&bull;</span>
                <span className="font-bold text-jet-black">{selectedMobileDetailLog.hoursSpent} hrs</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-alice-blue/50 rounded-xl p-3 border border-jet-black/5 text-xs text-zinc-700 font-sans leading-relaxed whitespace-pre-line">
              {selectedMobileDetailLog.description}
            </div>

            {/* Achievements & Blockers */}
            {(selectedMobileDetailLog.achievements || selectedMobileDetailLog.blockers) && (
              <div className="space-y-2 pt-1 text-xs">
                {selectedMobileDetailLog.achievements && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200/60 rounded-xl text-emerald-900">
                    <span className="font-bold block mb-0.5 text-[10px] uppercase font-mono tracking-wider">
                      Key Achievements
                    </span>
                    <p>{selectedMobileDetailLog.achievements}</p>
                  </div>
                )}
                {selectedMobileDetailLog.blockers && (
                  <div className="p-3 bg-rose-50 border border-rose-200/60 rounded-xl text-rose-900">
                    <span className="font-bold block mb-0.5 text-[10px] uppercase font-mono tracking-wider">
                      Blockers / Issues
                    </span>
                    <p>{selectedMobileDetailLog.blockers}</p>
                  </div>
                )}
              </div>
            )}

            {/* Contributors */}
            {selectedMobileDetailLog.membersPresent && selectedMobileDetailLog.membersPresent.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                  Contributors
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedMobileDetailLog.membersPresent.map((m, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-lg bg-zinc-100 text-zinc-700 text-[11px] font-sans">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions for Author / Admin */}
            {(isCoreAdmin || user.teamId === selectedMobileDetailLog.teamId) && (
              <div className="pt-3 border-t border-jet-black/10 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const log = selectedMobileDetailLog;
                    setSelectedMobileDetailLog(null);
                    openEditModal(log);
                  }}
                  className="px-4 py-2 rounded-xl border border-jet-black/20 text-xs font-sans font-bold hover:bg-zinc-100 text-jet-black cursor-pointer"
                >
                  Edit Step
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const log = selectedMobileDetailLog;
                    setSelectedMobileDetailLog(null);
                    setDeleteConfirmLog(log);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-sans font-bold cursor-pointer"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
          setTeamTasks((prev) =>
            prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
          );
          if (createdLog) {
            setLogs((prev) => [createdLog, ...prev]);
          }
          setIsCompleteModalOpen(false);
          setTaskToComplete(null);
        }}
      />

    </main>
  );
}

export default function LogPage() {
  return (
    <Suspense fallback={<LogLoadingSkeleton />}>
      <LogPageContent />
    </Suspense>
  );
}
