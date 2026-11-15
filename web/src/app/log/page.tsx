"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { WorkLog, TeamId, Task, LogWorkStatus } from '@/lib/types';
import { useBackgroundSync } from '@/components/BackgroundSyncProvider';
import {
  LogLoadingSkeleton,
  useLogData,
  LogMobileView,
  LogDesktopView,
  LogModalsHost,
} from '@/components/log';

function LogPageContent() {
  const router = useRouter();
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

  // Dynamic log data & filter hooks
  const {
    logs,
    setLogs,
    loadingLogs,
    selectedTeamFilter,
    setSelectedTeamFilter,
    searchQuery,
    setSearchQuery,
    mobileStatusFilter,
    setMobileStatusFilter,
    desktopLogPill,
    setDesktopLogPill,
    desktopLogPage,
    setDesktopLogPage,
    desktopLogTimeFilter,
    setDesktopLogTimeFilter,
    desktopLogSearch,
    setDesktopLogSearch,
    desktopFilteredLogs,
    statusCounts,
    visibleMobileLogs,
  } = useLogData({
    user,
    isCoreAdmin,
    onOpenForm: () => setIsFormOpen(true),
    setFormInitialTitle,
    setFormInitialTeamId,
  });

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
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    const tempId = `temp-log-${Date.now()}`;
    const optimisticLog: WorkLog = {
      id: tempId,
      stepNumber: (logs[0]?.stepNumber || 0) + 1,
      ...logPayload,
      createdAt: Date.now(),
    };
    setLogs((prev) => [optimisticLog, ...prev]);

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
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#2B303A_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-5 sm:space-y-8">
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

      <LogModalsHost
        user={user}
        isCoreAdmin={isCoreAdmin}
        canCreateBuildLog={canCreateBuildLog}
        isFormOpen={isFormOpen}
        setIsFormOpen={setIsFormOpen}
        formInitialTitle={formInitialTitle}
        formInitialStatus={formInitialStatus}
        formInitialTeamId={formInitialTeamId}
        onSubmitLog={handleLogSubmitted}
        editingLog={editingLog}
        setEditingLog={setEditingLog}
        onLogUpdated={(updated) =>
          setLogs((prev) => prev.map((item) => (item.id === updated.id ? updated : item)))
        }
        deleteConfirmLog={deleteConfirmLog}
        setDeleteConfirmLog={setDeleteConfirmLog}
        onLogDeleted={(deletedId) =>
          setLogs((prev) => prev.filter((item) => item.id !== deletedId))
        }
        selectedMobileDetailLog={selectedMobileDetailLog}
        setSelectedMobileDetailLog={setSelectedMobileDetailLog}
        taskToComplete={taskToComplete}
        isCompleteModalOpen={isCompleteModalOpen}
        setIsCompleteModalOpen={setIsCompleteModalOpen}
        setTaskToComplete={setTaskToComplete}
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
