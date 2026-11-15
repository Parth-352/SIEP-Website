"use client";

import React from 'react';
import { WorkLog, TeamId, Task, LogWorkStatus } from '@/lib/types';
import CreateLogModal from '@/components/log/CreateLogModal';
import EditLogModal from '@/components/log/EditLogModal';
import DeleteConfirmModal from '@/components/log/DeleteConfirmModal';
import MobileLogDetailDrawer from '@/components/log/MobileLogDetailDrawer';
import TaskCompleteModal from '@/components/TaskCompleteModal';

interface LogModalsHostProps {
  user: any;
  isCoreAdmin: boolean;
  canCreateBuildLog: boolean;
  isFormOpen: boolean;
  setIsFormOpen: (open: boolean) => void;
  formInitialTitle: string;
  formInitialStatus: LogWorkStatus;
  formInitialTeamId?: TeamId;
  onSubmitLog: (
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
  ) => void;
  editingLog: WorkLog | null;
  setEditingLog: (log: WorkLog | null) => void;
  onLogUpdated: (log: WorkLog) => void;
  deleteConfirmLog: WorkLog | null;
  setDeleteConfirmLog: (log: WorkLog | null) => void;
  onLogDeleted: (id: string) => void;
  selectedMobileDetailLog: WorkLog | null;
  setSelectedMobileDetailLog: (log: WorkLog | null) => void;
  taskToComplete: Task | null;
  isCompleteModalOpen: boolean;
  setIsCompleteModalOpen: (open: boolean) => void;
  setTaskToComplete: (task: Task | null) => void;
  onTaskCompleted: (updatedTask: Task, createdLog?: WorkLog) => void;
}

export default function LogModalsHost({
  user,
  isCoreAdmin,
  canCreateBuildLog,
  isFormOpen,
  setIsFormOpen,
  formInitialTitle,
  formInitialStatus,
  formInitialTeamId,
  onSubmitLog,
  editingLog,
  setEditingLog,
  onLogUpdated,
  deleteConfirmLog,
  setDeleteConfirmLog,
  onLogDeleted,
  selectedMobileDetailLog,
  setSelectedMobileDetailLog,
  taskToComplete,
  isCompleteModalOpen,
  setIsCompleteModalOpen,
  setTaskToComplete,
  onTaskCompleted,
}: LogModalsHostProps) {
  return (
    <>
      {/* Add Log Modal */}
      <CreateLogModal
        isOpen={isFormOpen && canCreateBuildLog}
        onClose={() => setIsFormOpen(false)}
        user={user}
        isCoreAdmin={isCoreAdmin}
        initialTitle={formInitialTitle}
        initialStatus={formInitialStatus}
        initialTeamId={formInitialTeamId}
        onSubmitLog={onSubmitLog}
      />

      {/* Edit Log Modal */}
      <EditLogModal
        editingLog={editingLog}
        onClose={() => setEditingLog(null)}
        isCoreAdmin={isCoreAdmin}
        onLogUpdated={onLogUpdated}
      />

      {/* Delete Log Confirmation Modal */}
      <DeleteConfirmModal
        deleteConfirmLog={deleteConfirmLog}
        onClose={() => setDeleteConfirmLog(null)}
        onLogDeleted={onLogDeleted}
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
        onTaskCompleted={onTaskCompleted}
      />
    </>
  );
}
