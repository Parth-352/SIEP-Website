"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Task } from '@/lib/types';
import { usePwaInstall } from '@/components/PwaInstallProvider';
import { useBackgroundSync } from '@/components/BackgroundSyncProvider';
import { TASKS_STORAGE_KEY } from '@/constants/dashboard';

import {
  useDashboardData,
  useDashboardNavigation,
  useDashboardFilters,
  useDashboardTaskActions,
  useDashboardBackup,
} from '@/components/dashboard/hooks';
import {
  DashboardTabContent,
  DashboardModalsHost,
} from '@/components/dashboard/layout';

function DashboardContent() {
  const router = useRouter();
  const { user, loading: authLoading, isAdmin, isCore, isLead, tier, logout } = useAuth();
  const { isInstalled, isStandalone, installApp } = usePwaInstall();
  const { enqueueTaskStatusUpdate } = useBackgroundSync();

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

  // Modal visibility states
  const [isCreateActionSheetOpen, setIsCreateActionSheetOpen] = useState(false);
  const [isActivityDrawerOpen, setIsActivityDrawerOpen] = useState(false);
  const [activitySubsystemFilter, setActivitySubsystemFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<Task | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // 1. Navigation & Tab Routing Hook
  const { activeTab, setActiveTab } = useDashboardNavigation({
    user,
    onOpenActivityDrawer: () => setIsActivityDrawerOpen(true),
    onOpenBackupModal: () => setIsBackupModalOpen(true),
    onOpenCreateModal: () => setIsCreateModalOpen(true),
    onSelectTaskById: (taskId: string) => {
      const found = tasks.find((t) => t.id === taskId);
      if (found) {
        setSelectedTask(found);
        setIsDetailModalOpen(true);
      }
    },
  });

  // 2. Data Sync & Offline DB Hook
  const {
    tasks,
    setTasks,
    logs,
    setLogs,
    activities,
    lastReadActivityTimestamp,
    setLastReadActivityTimestamp,
    isManualSyncing,
    teamCredentials,
    memberCredentials,
    loadCredentials,
    loadDashboardData,
    persistTasksLocal,
    handleManualSync,
  } = useDashboardData({
    user,
    isCoreAdmin,
    activeTab,
  });

  // 3. Search & Subsystem Filtering Hook
  const filters = useDashboardFilters({
    user,
    tasks,
    activeTab,
    isCoreAdmin,
  });

  // 4. Task Mutations & Status Action Hook
  const taskActions = useDashboardTaskActions({
    user,
    tasks,
    persistTasksLocal,
    loadDashboardData,
    enqueueTaskStatusUpdate,
    canApproveCompletion,
    onOpenCompleteModal: (task) => {
      setTaskToComplete(task);
      setIsCompleteModalOpen(true);
    },
    setSelectedTask,
    setIsDetailModalOpen,
    setTasks,
  });

  // 5. Database Backup Operations Hook
  const backup = useDashboardBackup({
    loadDashboardData,
    setTasks,
    setLogs,
  });

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

  // Hydrate local cache on mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const cached = localStorage.getItem(TASKS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter((t: { id?: string }) => !t.id?.startsWith('task-seed'));
          setTasks(cleaned);
        }
      }
    } catch (e) {
      console.warn('Error reading local tasks cache:', e);
    }
  }, [setTasks]);

  // Auth protection guard
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?from=/dashboard');
    }
  }, [user, authLoading, router]);

  // Loading skeleton
  if (!isMounted || authLoading || !user) {
    return (
      <div className="min-h-screen bg-alice-blue flex items-center justify-center font-mono text-sm text-grey">
        <span className="w-5 h-5 border-2 border-orange border-t-transparent rounded-full animate-spin mr-3"></span>
        Connecting to SIEP Operations Center...
      </div>
    );
  }

  return (
    <main
      className={`min-h-screen bg-alice-blue text-jet-black pt-20 sm:pt-24 ${
        isStandalone ? 'pb-32 sm:pb-24' : 'pb-12 sm:pb-16'
      } px-3 sm:px-6 lg:px-8 font-sans`}
    >
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#2B303A_1px,transparent_1px)] [background-size:24px_24px]" />

      <DashboardTabContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        tier={tier}
        isCore={isCore}
        isLead={isLead}
        isCoreAdmin={isCoreAdmin}
        canApproveCompletion={canApproveCompletion}
        tasks={tasks}
        logs={logs}
        filters={filters}
        taskActions={taskActions}
        handleOpenTaskDetail={(task) => {
          setSelectedTask(task);
          setIsDetailModalOpen(true);
        }}
        handleManualSync={handleManualSync}
        isManualSyncing={isManualSyncing}
        memberCredentials={memberCredentials}
        teamCredentials={teamCredentials}
        loadCredentials={loadCredentials}
        logout={logout}
        isInstalled={isInstalled}
        installApp={installApp}
      />

      <DashboardModalsHost
        user={user}
        isCoreAdmin={isCoreAdmin}
        isCore={isCore}
        isLead={isLead}
        isStandalone={isStandalone}
        tasks={tasks}
        setLogs={setLogs}
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
        isDetailModalOpen={isDetailModalOpen}
        setIsDetailModalOpen={setIsDetailModalOpen}
        taskToComplete={taskToComplete}
        setTaskToComplete={setTaskToComplete}
        isCompleteModalOpen={isCompleteModalOpen}
        setIsCompleteModalOpen={setIsCompleteModalOpen}
        isCreateModalOpen={isCreateModalOpen}
        setIsCreateModalOpen={setIsCreateModalOpen}
        isBackupModalOpen={isBackupModalOpen}
        setIsBackupModalOpen={setIsBackupModalOpen}
        taskActions={taskActions}
        backup={backup}
        isActivityDrawerOpen={isActivityDrawerOpen}
        setIsActivityDrawerOpen={setIsActivityDrawerOpen}
        activities={activities}
        activitySubsystemFilter={activitySubsystemFilter}
        setActivitySubsystemFilter={setActivitySubsystemFilter}
        handleOpenTaskDetail={(task) => {
          setSelectedTask(task);
          setIsDetailModalOpen(true);
        }}
        setLastReadActivityTimestamp={setLastReadActivityTimestamp}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredTasksCount={filters.filteredTasks.length}
        myAssignedCount={filters.myAssignedCount}
        isInputFocused={isInputFocused}
        isCreateActionSheetOpen={isCreateActionSheetOpen}
        setIsCreateActionSheetOpen={setIsCreateActionSheetOpen}
      />
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
