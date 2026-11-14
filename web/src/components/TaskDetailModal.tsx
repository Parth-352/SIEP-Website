"use client";

import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, TeamId, SubTask, TaskComment } from '@/lib/types';
import { TEAMS } from '@/lib/teams';
import { useAuth } from '@/context/AuthContext';
import { isTaskAssignedToUser } from '@/lib/taskMatching';
import { queueTaskAction } from '@/lib/offlineDb';
import TaskModalHeader from './tasks/modal/TaskModalHeader';
import TaskStatusSwitcher from './tasks/modal/TaskStatusSwitcher';
import TaskBlockerSection from './tasks/modal/TaskBlockerSection';
import TaskMetadataSection from './tasks/modal/TaskMetadataSection';
import TaskSubtasksSection from './tasks/modal/TaskSubtasksSection';
import TaskCommentsSection from './tasks/modal/TaskCommentsSection';
import TaskModalActions from './tasks/modal/TaskModalActions';
import TaskEditForm from './tasks/modal/TaskEditForm';
import TaskDeleteConfirmModal from './tasks/modal/TaskDeleteConfirmModal';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: (updatedTask: Task) => void;
  onTaskDeleted: (taskId: string) => void;
  onCompleteWithVideo?: (task: Task) => void;
  canEdit: boolean;
  canDelete: boolean;
  isAdmin: boolean;
}

export default function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onTaskUpdated,
  onTaskDeleted,
  onCompleteWithVideo,
  canEdit,
  canDelete,
  isAdmin,
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isCore, isLead, isAdmin: isAuthAdmin } = useAuth();
  const canApproveCompletion = Boolean(
    isCore ||
    isLead ||
    isAdmin ||
    isAuthAdmin ||
    user?.isCore ||
    user?.isLead ||
    user?.teamId === 'core'
  );
  const isAssignedToMe = Boolean(task && user && isTaskAssignedToUser(task, user));

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTeamId, setEditTeamId] = useState<TeamId>('mechanical');
  const [editAssignedMembers, setEditAssignedMembers] = useState<string[]>([]);
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>('todo');

  // Sprint Granularity State
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [showBlockerInput, setShowBlockerInput] = useState(false);
  const [blockerReasonDraft, setBlockerReasonDraft] = useState('');
  const [isSavingBlocker, setIsSavingBlocker] = useState(false);
  const [hoursToLog, setHoursToLog] = useState('');
  const [showHoursInput, setShowHoursInput] = useState(false);
  const [isLoggingHours, setIsLoggingHours] = useState(false);

  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setEditTeamId(task.teamId);
      setEditAssignedMembers(task.assignedMembers || []);
      setEditPriority(task.priority);
      setEditDueDate(task.dueDate || '');
      setEditStatus(task.status);
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setError(null);
      setShowBlockerInput(false);
      setBlockerReasonDraft(task.blockerReason || '');
    }
  }, [task]);

  const handleToggleAssignMe = async () => {
    if (!task || !user) return;
    const myName = user.displayName;
    const currentMembers = Array.isArray(task.assignedMembers)
      ? [...task.assignedMembers]
      : typeof task.assignedMembers === 'string'
      ? (task.assignedMembers as string).split(',').map((s) => s.trim())
      : [];

    let updatedMembers: string[];
    if (isAssignedToMe) {
      updatedMembers = currentMembers.filter(
        (m) =>
          m.toLowerCase() !== myName.toLowerCase() &&
          !m.toLowerCase().includes(myName.toLowerCase()) &&
          !myName.toLowerCase().includes(m.toLowerCase())
      );
    } else {
      updatedMembers = [...currentMembers, myName];
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          assignedMembers: updatedMembers,
        }),
      });
      const data = await res.json();
      if (data.success && data.task) {
        onTaskUpdated(data.task);
      }
    } catch (err) {
      console.warn('Failed to toggle assignment:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Subtask Toggle Handler
  const handleToggleSubtask = async (subtaskId: string, currentCompleted: boolean) => {
    if (!task) return;
    const nextCompleted = !currentCompleted;
    const updatedSubtasks = (task.subtasks || []).map((st) =>
      st.id === subtaskId
        ? {
            ...st,
            completed: nextCompleted,
            completedBy: user?.displayName || 'Team Member',
            completedAt: Date.now(),
          }
        : st
    );
    const updatedTask: Task = { ...task, subtasks: updatedSubtasks };
    onTaskUpdated(updatedTask);

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          action: 'TOGGLE_SUBTASK',
          subtaskId,
          completed: nextCompleted,
        }),
      });
      const data = await res.json();
      if (data.success && data.task) {
        onTaskUpdated(data.task);
      }
    } catch {
      await queueTaskAction({
        id: task.id,
        action: 'TOGGLE_SUBTASK',
        subtaskId,
        completed: nextCompleted,
      });
    }
  };

  // Add Subtask Handler
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newSubtaskText.trim()) return;
    const text = newSubtaskText.trim();
    setNewSubtaskText('');
    setIsAddingSubtask(true);

    const tempId = `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newSt: SubTask = { id: tempId, text, completed: false };
    const updatedSubtasks = [...(task.subtasks || []), newSt];
    onTaskUpdated({ ...task, subtasks: updatedSubtasks });

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, action: 'ADD_SUBTASK', text }),
      });
      const data = await res.json();
      if (data.success && data.task) {
        onTaskUpdated(data.task);
      }
    } catch {
      await queueTaskAction({ id: task.id, action: 'ADD_SUBTASK', text });
    } finally {
      setIsAddingSubtask(false);
    }
  };

  // Delete Subtask Handler
  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!task) return;
    const updatedSubtasks = (task.subtasks || []).filter((st) => st.id !== subtaskId);
    onTaskUpdated({ ...task, subtasks: updatedSubtasks });

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, action: 'DELETE_SUBTASK', subtaskId }),
      });
      const data = await res.json();
      if (data.success && data.task) {
        onTaskUpdated(data.task);
      }
    } catch {
      await queueTaskAction({ id: task.id, action: 'DELETE_SUBTASK', subtaskId });
    }
  };

  // Blocker Toggle Handler
  const handleToggleBlocker = async (isBlocked: boolean, reason?: string) => {
    if (!task) return;
    setIsSavingBlocker(true);
    const updatedTask: Task = {
      ...task,
      isBlocked,
      blockerReason: reason || '',
    };
    onTaskUpdated(updatedTask);
    setShowBlockerInput(false);
    setBlockerReasonDraft('');

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          action: 'SET_BLOCKER',
          isBlocked,
          blockerReason: reason || '',
        }),
      });
      const data = await res.json();
      if (data.success && data.task) {
        onTaskUpdated(data.task);
      }
    } catch {
      await queueTaskAction({
        id: task.id,
        action: 'SET_BLOCKER',
        isBlocked,
        blockerReason: reason || '',
      });
    } finally {
      setIsSavingBlocker(false);
    }
  };

  // Log Hours Handler
  const handleLogHours = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !hoursToLog) return;
    const val = parseFloat(hoursToLog);
    if (isNaN(val) || val <= 0) return;
    setIsLoggingHours(true);

    const updatedTask: Task = {
      ...task,
      actualHours: (task.actualHours || 0) + val,
    };
    onTaskUpdated(updatedTask);
    setHoursToLog('');
    setShowHoursInput(false);

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, action: 'LOG_HOURS', hours: val }),
      });
      const data = await res.json();
      if (data.success && data.task) {
        onTaskUpdated(data.task);
      }
    } catch {
      await queueTaskAction({ id: task.id, action: 'LOG_HOURS', hours: val });
    } finally {
      setIsLoggingHours(false);
    }
  };

  // Post Discussion Note Handler
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newCommentText.trim() || !user) return;
    const text = newCommentText.trim();
    setNewCommentText('');
    setIsPostingComment(true);

    const tempId = `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newComment: TaskComment = {
      id: tempId,
      authorId: user.memberId || user.email,
      authorName: user.displayName,
      authorTeam: user.teamId,
      text,
      createdAt: Date.now(),
    };
    const updatedComments = [...(task.comments || []), newComment];
    onTaskUpdated({ ...task, comments: updatedComments });

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, action: 'ADD_COMMENT', text }),
      });
      const data = await res.json();
      if (data.success && data.task) {
        onTaskUpdated(data.task);
      }
    } catch {
      await queueTaskAction({ id: task.id, action: 'ADD_COMMENT', text });
    } finally {
      setIsPostingComment(false);
    }
  };

  // Fast Status Switcher Handler
  const handleQuickStatusChange = async (nextStatus: TaskStatus) => {
    if (!task || task.status === nextStatus) return;

    // Hierarchy Guard: If marking done, only Squad Leads and Core Leadership can approve completion
    if (nextStatus === 'done' && !canApproveCompletion) {
      setError('Hierarchy Rule: Only Squad Leads and Core Leadership can approve and mark tasks as Completed.');
      return;
    }
    
    // If transitioning to 'done', trigger Video Log & Completion Modal!
    if (nextStatus === 'done' && onCompleteWithVideo) {
      onCompleteWithVideo(task);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success && data.task) {
        onTaskUpdated(data.task);
      } else {
        setError(data.error || 'Failed to update task status');
      }
    } catch (err) {
      console.error('Error changing task status:', err);
      setError('Network error while updating task status');
    } finally {
      setIsSaving(false);
    }
  };

  // Full Edit Form Submission
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task) return;
    if (!editTitle.trim()) {
      setError('Task title is required');
      return;
    }

    // Hierarchy Guard: If marked done in edit mode, ensure member is Lead or Core
    if (editStatus === 'done' && task.status !== 'done') {
      if (!canApproveCompletion) {
        setError('Hierarchy Rule: Only Squad Leads and Core Leadership can approve and mark tasks as Completed.');
        return;
      }
      if (onCompleteWithVideo) {
        onCompleteWithVideo({
          ...task,
          title: editTitle.trim(),
          description: editDescription.trim(),
          teamId: editTeamId,
          assignedMembers: editAssignedMembers,
          priority: editPriority,
          dueDate: editDueDate || undefined,
        });
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          title: editTitle.trim(),
          description: editDescription.trim(),
          teamId: editTeamId,
          assignedMembers: editAssignedMembers,
          priority: editPriority,
          status: editStatus,
          dueDate: editDueDate || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.task) {
        onTaskUpdated(data.task);
        setIsEditing(false);
      } else {
        setError(data.error || 'Failed to update task');
      }
    } catch (err) {
      console.error('Error saving task edits:', err);
      setError('Network error while saving task edits');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Handler
  const handleConfirmDelete = async () => {
    if (!task) return;
    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/tasks?id=${task.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onTaskDeleted(task.id);
        setShowDeleteConfirm(false);
        onClose();
      } else {
        setError(data.error || 'Failed to delete task');
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Network error while deleting task');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !task) return null;

  const currentTeam = TEAMS[task.teamId];

  return (
    <div className="fixed inset-0 z-[200] bg-jet-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border-2 border-jet-black/15 rounded-2xl w-full max-w-2xl max-h-[90vh] my-auto overflow-y-auto p-4 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 space-y-6">
        
        {/* Modal Header */}
        <TaskModalHeader
          task={task}
          currentTeam={currentTeam}
          onClose={onClose}
        />

        {/* Error notification */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-mono">
            {error}
          </div>
        )}

        {/* Quick Status Bar & Hierarchy Review Banner */}
        <TaskStatusSwitcher
          task={task}
          canEdit={canEdit}
          isSaving={isSaving}
          canApproveCompletion={canApproveCompletion}
          onQuickStatusChange={handleQuickStatusChange}
        />

        {/* VIEW MODE vs EDIT MODE */}
        {!isEditing ? (
          <div className="space-y-6">
            {/* Blocker Alert Banner */}
            <TaskBlockerSection
              task={task}
              canEdit={canEdit}
              isSavingBlocker={isSavingBlocker}
              showBlockerInput={showBlockerInput}
              blockerReasonDraft={blockerReasonDraft}
              setShowBlockerInput={setShowBlockerInput}
              setBlockerReasonDraft={setBlockerReasonDraft}
              onToggleBlocker={handleToggleBlocker}
            />

            {/* Scope, Assigned Members, Due Date & Time Tracker */}
            <TaskMetadataSection
              task={task}
              user={user}
              isSaving={isSaving}
              isAssignedToMe={isAssignedToMe}
              showHoursInput={showHoursInput}
              hoursToLog={hoursToLog}
              isLoggingHours={isLoggingHours}
              onToggleAssignMe={handleToggleAssignMe}
              onToggleShowHoursInput={() => setShowHoursInput(!showHoursInput)}
              onChangeHoursToLog={setHoursToLog}
              onLogHours={handleLogHours}
            />

            {/* Subtasks Checklist Section */}
            <TaskSubtasksSection
              task={task}
              canEdit={canEdit}
              newSubtaskText={newSubtaskText}
              isAddingSubtask={isAddingSubtask}
              showBlockerInput={showBlockerInput}
              onToggleSubtask={handleToggleSubtask}
              onDeleteSubtask={handleDeleteSubtask}
              onAddSubtask={handleAddSubtask}
              onChangeNewSubtaskText={setNewSubtaskText}
              onShowBlockerInput={() => setShowBlockerInput(true)}
            />

            {/* Team Discussion & Notes Thread */}
            <TaskCommentsSection
              task={task}
              user={user}
              newCommentText={newCommentText}
              isPostingComment={isPostingComment}
              onPostComment={handlePostComment}
              onChangeNewCommentText={setNewCommentText}
            />

            {/* Modal Bottom Actions */}
            <TaskModalActions
              task={task}
              canEdit={canEdit}
              canDelete={canDelete}
              isDeleting={isDeleting}
              canApproveCompletion={canApproveCompletion}
              onCompleteWithVideo={onCompleteWithVideo}
              onOpenDeleteConfirm={() => setShowDeleteConfirm(true)}
              onStartEditing={() => setIsEditing(true)}
              onQuickStatusChange={handleQuickStatusChange}
            />
          </div>
        ) : (
          /* ================= EDIT FORM ================= */
          <TaskEditForm
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editDescription={editDescription}
            setEditDescription={setEditDescription}
            editTeamId={editTeamId}
            setEditTeamId={setEditTeamId}
            editAssignedMembers={editAssignedMembers}
            setEditAssignedMembers={setEditAssignedMembers}
            editPriority={editPriority}
            setEditPriority={setEditPriority}
            editStatus={editStatus}
            setEditStatus={setEditStatus}
            editDueDate={editDueDate}
            setEditDueDate={setEditDueDate}
            isAdmin={isAdmin}
            canApproveCompletion={canApproveCompletion}
            isSaving={isSaving}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={() => setIsEditing(false)}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <TaskDeleteConfirmModal
        isOpen={showDeleteConfirm}
        task={task}
        currentTeam={currentTeam}
        isDeleting={isDeleting}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
