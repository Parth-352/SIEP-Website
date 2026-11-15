"use client";

import React from 'react';
import { Task, WorkLog, ActivityEvent, TeamId, TaskPriority, TaskStatus } from '@/lib/types';
import { DashboardTab } from '@/types/dashboard';
import TaskDetailModal from '@/components/TaskDetailModal';
import TaskCompleteModal from '@/components/TaskCompleteModal';
import CreateTaskModal from '@/components/shared/CreateTaskModal';
import DeleteTaskModal from '@/components/shared/DeleteTaskModal';
import BackupSyncModal from '@/components/shared/BackupSyncModal';
import ActivityDrawer from '@/components/shared/ActivityDrawer';
import UndoToast from '@/components/shared/UndoToast';
import BottomNav from '@/components/navigation/BottomNav';
import { isTaskAssignedToUser } from '@/lib/taskMatching';
import { useDashboardTaskActions, useDashboardBackup } from '@/components/dashboard/hooks';

export interface DashboardModalsHostProps {
  user: any;
  isCoreAdmin: boolean;
  isCore: boolean;
  isLead: boolean;
  isStandalone: boolean;
  tasks: Task[];
  setLogs: React.Dispatch<React.SetStateAction<WorkLog[]>>;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  isDetailModalOpen: boolean;
  setIsDetailModalOpen: (open: boolean) => void;
  taskToComplete: Task | null;
  setTaskToComplete: (task: Task | null) => void;
  isCompleteModalOpen: boolean;
  setIsCompleteModalOpen: (open: boolean) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isBackupModalOpen: boolean;
  setIsBackupModalOpen: (open: boolean) => void;
  taskActions: ReturnType<typeof useDashboardTaskActions>;
  backup: ReturnType<typeof useDashboardBackup>;
  isActivityDrawerOpen: boolean;
  setIsActivityDrawerOpen: (open: boolean) => void;
  activities: ActivityEvent[];
  activitySubsystemFilter: string;
  setActivitySubsystemFilter: (filter: string) => void;
  handleOpenTaskDetail: (task: Task) => void;
  setLastReadActivityTimestamp: (timestamp: number) => void;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  filteredTasksCount: number;
  myAssignedCount: number;
  isInputFocused: boolean;
  isCreateActionSheetOpen: boolean;
  setIsCreateActionSheetOpen: (open: boolean) => void;
}

export default function DashboardModalsHost({
  user,
  isCoreAdmin,
  isCore,
  isLead,
  isStandalone,
  tasks,
  setLogs,
  selectedTask,
  setSelectedTask,
  isDetailModalOpen,
  setIsDetailModalOpen,
  taskToComplete,
  setTaskToComplete,
  isCompleteModalOpen,
  setIsCompleteModalOpen,
  isCreateModalOpen,
  setIsCreateModalOpen,
  isBackupModalOpen,
  setIsBackupModalOpen,
  taskActions,
  backup,
  isActivityDrawerOpen,
  setIsActivityDrawerOpen,
  activities,
  activitySubsystemFilter,
  setActivitySubsystemFilter,
  handleOpenTaskDetail,
  setLastReadActivityTimestamp,
  activeTab,
  setActiveTab,
  filteredTasksCount,
  myAssignedCount,
  isInputFocused,
  isCreateActionSheetOpen,
  setIsCreateActionSheetOpen,
}: DashboardModalsHostProps) {
  return (
    <>
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
          onTaskUpdated={taskActions.handleModalTaskUpdated}
          onTaskDeleted={taskActions.handleModalTaskDeleted}
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
            taskActions.handleModalTaskUpdated(updated);
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
        defaultTeam={user?.teamId !== 'core' ? user?.teamId : 'mechanical'}
        onSubmit={taskActions.handleCreateTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteTaskModal
        task={taskActions.cardTaskToDelete}
        isDeleting={taskActions.isDeletingCardTask}
        onCancel={() => taskActions.setCardTaskToDelete(null)}
        onConfirm={taskActions.confirmDeleteCardTask}
      />

      {/* Core Admin Database Backup & Reset Modal */}
      <BackupSyncModal
        isOpen={isBackupModalOpen && isCoreAdmin}
        onClose={() => setIsBackupModalOpen(false)}
        backupStatus={backup.backupStatus}
        isResetting={backup.isResetting}
        onExportBackup={backup.handleExportBackup}
        onResetDatabase={backup.handleResetDatabase}
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
          try {
            localStorage.setItem('siep_last_read_activity', String(now));
          } catch {}
        }}
      />

      {/* Floating Status Reversal Toast */}
      <UndoToast
        undoState={taskActions.undoState}
        onUndo={taskActions.handleUndoMoveStatus}
        onDismiss={() => taskActions.setUndoState(null)}
      />

      {/* Instagram-Style Bottom Navigation Dock (strictly rendered only for installed Mobile Web App / Standalone mode) */}
      {isStandalone && (
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredTasksCount={filteredTasksCount}
          myAssignedCount={myAssignedCount}
          isCore={isCore}
          isLead={isLead}
          userDisplayName={user?.displayName}
          userPhotoUrl={user?.photoUrl}
          isInputFocused={isInputFocused}
          isCreateActionSheetOpen={isCreateActionSheetOpen}
          setIsCreateActionSheetOpen={setIsCreateActionSheetOpen}
          setIsActivityDrawerOpen={setIsActivityDrawerOpen}
          openCreateModal={() => setIsCreateModalOpen(true)}
        />
      )}
    </>
  );
}
