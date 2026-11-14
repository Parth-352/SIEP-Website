"use client";

import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { TEAMS } from '@/lib/teams';
import { WorkLog, TeamId, Task, LogWorkStatus } from '@/lib/types';
import TaskCompleteModal from '@/components/TaskCompleteModal';
import { useBackgroundSync } from '@/components/BackgroundSyncProvider';
import { getOfflineCachedLogs, cacheOfflineLogs } from '@/lib/offlineDb';

import {
  getLogWorkStatus,
  LogLoadingSkeleton,
} from '@/components/log/logConfig';
import LogMobileView from '@/components/log/LogMobileView';
import LogDesktopView from '@/components/log/LogDesktopView';
import CreateLogModal from '@/components/log/CreateLogModal';
import EditLogModal from '@/components/log/EditLogModal';
import DeleteConfirmModal from '@/components/log/DeleteConfirmModal';
import MobileLogDetailDrawer from '@/components/log/MobileLogDetailDrawer';

function LogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, isCore, isLead } = useAuth();
  const { enqueueLogUpload } = useBackgroundSync();

  const isCoreAdmin = Boolean(isCore || (user && user.teamId === 'core'));
  const canCreateBuildLog = Boolean(
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

  // Task Complete with Video Modal state
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  // Modal control states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formInitialTitle, setFormInitialTitle] = useState('');
  const [formInitialStatus, setFormInitialStatus] = useState<LogWorkStatus>('in_progress');
  const [formInitialTeamId, setFormInitialTeamId] = useState<TeamId | undefined>(undefined);

  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);
  const [deleteConfirmLog, setDeleteConfirmLog] = useState<WorkLog | null>(null);
  const [selectedMobileDetailLog, setSelectedMobileDetailLog] = useState<WorkLog | null>(null);

  // Desktop filters
  const [mobileStatusFilter, setMobileStatusFilter] = useState<'all' | LogWorkStatus>('all');
  const [desktopLogPill, setDesktopLogPill] = useState<'all' | 'builds' | 'tests' | 'design' | 'analysis'>('all');
  const [desktopLogPage, setDesktopLogPage] = useState<number>(1);
  const [desktopLogTimeFilter, setDesktopLogTimeFilter] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [desktopLogSearch, setDesktopLogSearch] = useState<string>('');

  // Dynamic filtered logs feed for desktop
  const desktopFilteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const txt = `${log.stepTitle || ''} ${log.description || ''}`.toLowerCase();

      // 1. Category Pill Filter
      if (
        desktopLogPill === 'builds' &&
        !(txt.includes('weld') || txt.includes('build') || txt.includes('fab') || log.status === 'completed')
      )
        return false;
      if (
        desktopLogPill === 'tests' &&
        !(txt.includes('test') || txt.includes('dyno') || log.status === 'testing')
      )
        return false;
      if (
        desktopLogPill === 'design' &&
        !(txt.includes('cad') || txt.includes('design') || txt.includes('ui') || log.teamId === 'design' || log.teamId === 'software')
      )
        return false;
      if (
        desktopLogPill === 'analysis' &&
        !(txt.includes('analysis') || txt.includes('fea') || log.teamId === 'research')
      )
        return false;

      // 2. Time Filter
      if (desktopLogTimeFilter === '24h') {
        const logTime = log.createdAt ? new Date(log.createdAt).getTime() : 0;
        if (Date.now() - logTime > 24 * 60 * 60 * 1000) return false;
      } else if (desktopLogTimeFilter === '7d') {
        const logTime = log.createdAt ? new Date(log.createdAt).getTime() : 0;
        if (Date.now() - logTime > 7 * 24 * 60 * 60 * 1000) return false;
      } else if (desktopLogTimeFilter === '30d') {
        const logTime = log.createdAt ? new Date(log.createdAt).getTime() : 0;
        if (Date.now() - logTime > 30 * 24 * 60 * 60 * 1000) return false;
      }

      // 3. Search Query
      if (desktopLogSearch.trim()) {
        const q = desktopLogSearch.toLowerCase().trim();
        const titleMatch = (log.stepTitle || '').toLowerCase().includes(q);
        const descMatch = (log.description || '').toLowerCase().includes(q);
        const memberMatch =
          (log.membersPresent || []).some((m) => m.toLowerCase().includes(q)) ||
          (log.authorName || '').toLowerCase().includes(q);
        const teamMatch = (log.teamName || log.teamId || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !memberMatch && !teamMatch) return false;
      }

      return true;
    });
  }, [logs, desktopLogPill, desktopLogTimeFilter, desktopLogSearch]);

  // Dynamic status counts calculated live from Firestore logs (respects team selection)
  const statusCounts = useMemo(() => {
    const counts: Record<LogWorkStatus, number> = {
      in_progress: 0,
      testing: 0,
      completed: 0,
      on_hold: 0,
      review: 0,
    };
    const pool =
      selectedTeamFilter === 'all'
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
        setFormInitialTeamId(urlTeam as TeamId);
      }
    }
    const taskParam = searchParams.get('task') || searchParams.get('taskTitle');
    if (taskParam) {
      setFormInitialTitle(decodeURIComponent(taskParam));
      setIsFormOpen(true);
    }
    const newParam = searchParams.get('new') === 'true' || searchParams.get('action') === 'new';
    if (newParam) {
      setIsFormOpen(true);
    }
  }, [searchParams]);

  // Listen for direct open log form events
  useEffect(() => {
    const handleOpenFormEvent = () => {
      setIsFormOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('siep_open_log_form', handleOpenFormEvent);
    return () => window.removeEventListener('siep_open_log_form', handleOpenFormEvent);
  }, []);

  // Auth redirect guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?from=/log');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch logs with clean async pattern + offline fallback
  const loadLogs = useCallback(async () => {
    if (!user) return;
    setLoadingLogs(true);

    // Hydrate from offline cache immediately
    getOfflineCachedLogs().then((cached) => {
      if (cached && cached.length > 0) {
        setLogs(cached);
      }
    });

    const teamQuery =
      !isCoreAdmin && user
        ? user.teamId
        : selectedTeamFilter !== 'all'
        ? selectedTeamFilter
        : '';
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
        setLogs((prev) => [
          newLog,
          ...prev.filter((l) => l.id !== newLog.id && !l.id.startsWith('temp-log-')),
        ]);
      }
    };
    window.addEventListener('siep_log_synced', handleLogSynced);
    return () => window.removeEventListener('siep_log_synced', handleLogSynced);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Handle new log submission
  const handleLogSubmitted = (
    logPayload: {
      stepTitle: string;
      status: LogWorkStatus;
      teamId: TeamId;
      teamName: string;
      authorName: string;
      date: string;
      workTime: string;
      membersPresent: string[];
      hoursSpent: number;
      description: string;
      achievements: string;
      blockers: string;
      videoUrl: string;
    },
    videoFile: File | null
  ) => {
    // 1. Optimistic local insertion
    const tempId = `temp-log-${Date.now()}`;
    const optimisticLog: WorkLog = {
      id: tempId,
      stepNumber: (logs[0]?.stepNumber || 0) + 1,
      ...logPayload,
      createdAt: Date.now(),
    };
    setLogs((prev) => [optimisticLog, ...prev]);

    // 2. Enqueue background upload
    enqueueLogUpload({
      logData: logPayload,
      videoFile: videoFile || undefined,
    });
  };

  const handleOpenNewBuildLog = () => {
    setFormInitialTitle('');
    setFormInitialStatus('in_progress');
    setIsFormOpen(true);
  };

  const handleOpenNewTestLog = () => {
    setFormInitialTitle('Test: ');
    setFormInitialStatus('testing');
    setIsFormOpen(true);
  };

  const handleOpenUploadMedia = () => {
    setFormInitialTitle('');
    setFormInitialStatus('in_progress');
    setIsFormOpen(true);
  };

  if (!isMounted || authLoading || !user) {
    return <LogLoadingSkeleton />;
  }

  return (
    <main className="min-h-screen bg-alice-blue text-jet-black pt-20 sm:pt-24 pb-12 sm:pb-16 px-3 sm:px-6 lg:px-8 font-sans">
      {/* Background CAD Accent */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#2B303A_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-5 sm:space-y-8">
        {/* Mobile View */}
        <LogMobileView
          canCreateBuildLog={canCreateBuildLog}
          onOpenAddLog={handleOpenNewBuildLog}
          selectedTeamFilter={selectedTeamFilter}
          setSelectedTeamFilter={setSelectedTeamFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          mobileStatusFilter={mobileStatusFilter}
          setMobileStatusFilter={setMobileStatusFilter}
          statusCounts={statusCounts}
          loadingLogs={loadingLogs}
          visibleMobileLogs={visibleMobileLogs}
          onSelectLog={(log) => setSelectedMobileDetailLog(log)}
        />

        {/* Desktop View */}
        <LogDesktopView
          logs={logs}
          desktopFilteredLogs={desktopFilteredLogs}
          desktopLogPill={desktopLogPill}
          setDesktopLogPill={setDesktopLogPill}
          desktopLogSearch={desktopLogSearch}
          setDesktopLogSearch={setDesktopLogSearch}
          desktopLogTimeFilter={desktopLogTimeFilter}
          setDesktopLogTimeFilter={setDesktopLogTimeFilter}
          desktopLogPage={desktopLogPage}
          setDesktopLogPage={setDesktopLogPage}
          canCreateBuildLog={canCreateBuildLog}
          onOpenAddLog={handleOpenNewBuildLog}
          onSelectLog={(log) => setSelectedMobileDetailLog(log)}
          onOpenNewBuildLog={handleOpenNewBuildLog}
          onOpenNewTestLog={handleOpenNewTestLog}
          onOpenUploadMedia={handleOpenUploadMedia}
        />
      </div>

      {/* Add Log Modal */}
      <CreateLogModal
        isOpen={isFormOpen && canCreateBuildLog}
        onClose={() => setIsFormOpen(false)}
        user={user}
        isCoreAdmin={isCoreAdmin}
        initialTitle={formInitialTitle}
        initialStatus={formInitialStatus}
        initialTeamId={formInitialTeamId}
        onSubmitLog={handleLogSubmitted}
      />

      {/* Edit Log Modal */}
      <EditLogModal
        editingLog={editingLog}
        onClose={() => setEditingLog(null)}
        isCoreAdmin={isCoreAdmin}
        onLogUpdated={(updated) =>
          setLogs((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        }
      />

      {/* Delete Log Confirmation Modal */}
      <DeleteConfirmModal
        deleteConfirmLog={deleteConfirmLog}
        onClose={() => setDeleteConfirmLog(null)}
        onLogDeleted={(deletedId) =>
          setLogs((prev) => prev.filter((item) => item.id !== deletedId))
        }
      />

      {/* Mobile Detail Drawer */}
      <MobileLogDetailDrawer
        selectedLog={selectedMobileDetailLog}
        onClose={() => setSelectedMobileDetailLog(null)}
        isCoreAdmin={isCoreAdmin}
        user={user}
        onEdit={(log) => {
          setSelectedMobileDetailLog(null);
          setEditingLog(log);
        }}
        onDelete={(log) => {
          setSelectedMobileDetailLog(null);
          setDeleteConfirmLog(log);
        }}
      />

      {/* Task Complete Modal */}
      <TaskCompleteModal
        isOpen={isCompleteModalOpen}
        task={taskToComplete}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setTaskToComplete(null);
        }}
        onTaskCompleted={(updatedTask, createdLog) => {
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
