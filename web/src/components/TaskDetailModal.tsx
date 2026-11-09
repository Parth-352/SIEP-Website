"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Task, TaskStatus, TaskPriority, TeamId, SubTask, TaskComment } from '@/lib/types';
import { TEAMS, TEAMS_LIST } from '@/lib/teams';
import MemberSelect from './MemberSelect';
import { useAuth } from '@/context/AuthContext';
import { isTaskAssignedToUser } from '@/lib/taskMatching';
import { queueTaskAction } from '@/lib/offlineDb';

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

const STATUS_OPTIONS: { id: TaskStatus; label: string; bg: string; activeClass: string }[] = [
  { id: 'todo', label: 'To Do', bg: 'bg-zinc-100 text-zinc-700', activeClass: 'bg-zinc-700 text-white ring-2 ring-zinc-400' },
  { id: 'in_progress', label: 'In Progress', bg: 'bg-orange/15 text-orange', activeClass: 'bg-orange text-white ring-2 ring-orange/60' },
  { id: 'review', label: 'Under Review', bg: 'bg-purple-100 text-purple-700', activeClass: 'bg-purple-600 text-white ring-2 ring-purple-400' },
  { id: 'done', label: 'Completed', bg: 'bg-emerald-100 text-emerald-800', activeClass: 'bg-emerald-600 text-white ring-2 ring-emerald-400' },
];

const PRIORITY_BADGES: Record<TaskPriority, { label: string; badgeClass: string }> = {
  urgent: { label: 'Urgent', badgeClass: 'bg-red-500 text-white' },
  high: { label: 'High', badgeClass: 'bg-orange text-jet-black font-bold' },
  medium: { label: 'Medium', badgeClass: 'bg-amber-100 text-amber-800' },
  low: { label: 'Low', badgeClass: 'bg-zinc-100 text-zinc-600' },
};

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

  const { user } = useAuth();
  const isAssignedToMe = Boolean(task && user && isTaskAssignedToUser(task, user));

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

  // Edit form state
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTeamId, setEditTeamId] = useState<TeamId>('mechanical');
  const [editAssignedMembers, setEditAssignedMembers] = useState<string[]>([]);
  const [editPriority, setEditPriority] = useState<TaskPriority>('medium');
  const [editDueDate, setEditDueDate] = useState('');
  const [editStatus, setEditStatus] = useState<TaskStatus>('todo');

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

  if (!isOpen || !task) return null;

  const currentTeam = TEAMS[task.teamId];
  const priorityInfo = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;

  // Format Due Date with relative hint
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return 'No due date set';
    try {
      const due = new Date(dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) return `${dateStr} (${Math.abs(diffDays)}d overdue)`;
      if (diffDays === 0) return `${dateStr} (Due today!)`;
      if (diffDays === 1) return `${dateStr} (Due tomorrow)`;
      return `${dateStr} (in ${diffDays} days)`;
    } catch {
      return dateStr;
    }
  };

  // Fast Status Switcher Handler
  const handleQuickStatusChange = async (nextStatus: TaskStatus) => {
    if (task.status === nextStatus) return;
    
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
    if (!editTitle.trim()) {
      setError('Task title is required');
      return;
    }

    // If marked done in edit mode, prompt for video log!
    if (editStatus === 'done' && task.status !== 'done' && onCompleteWithVideo) {
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

  return (
    <div className="fixed inset-0 z-[200] bg-jet-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border-2 border-jet-black/15 rounded-2xl w-full max-w-2xl max-h-[90vh] my-auto overflow-y-auto p-4 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-jet-black/10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold border ${currentTeam?.badgeBg || 'bg-jet-black/5 text-jet-black'}`}>
                [{currentTeam?.code}] {currentTeam?.name}
              </span>
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold ${priorityInfo.badgeClass}`}>
                {priorityInfo.label} Priority
              </span>
              <span className="text-[10px] font-mono text-grey">
                ID: {task.id}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-jet-black tracking-tight">
              {task.title}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-grey hover:text-jet-black text-sm p-2 cursor-pointer rounded-xl hover:bg-alice-blue transition-colors shrink-0"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-mono">
            {error}
          </div>
        )}

        {/* Quick Status Bar */}
        <div className="bg-alice-blue/60 p-4 rounded-xl border border-jet-black/5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-grey font-bold">
              Current Status:
            </span>
            <span className="text-xs font-mono font-bold text-jet-black">
              {STATUS_OPTIONS.find((s) => s.id === task.status)?.label}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {STATUS_OPTIONS.map((status) => {
              const isActive = task.status === status.id;
              return (
                <button
                  key={status.id}
                  type="button"
                  disabled={!canEdit || isSaving}
                  onClick={() => handleQuickStatusChange(status.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed ${
                    isActive ? status.activeClass : 'bg-white border border-jet-black/10 hover:border-orange hover:text-orange text-grey'
                  }`}
                >
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                  <span>{status.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* VIEW MODE vs EDIT MODE */}
        {!isEditing ? (
          <div className="space-y-6">
            
            {/* Blocker Alert Banner */}
            {task.isBlocked ? (
              <div className="p-4 rounded-xl bg-rose-500/10 border-2 border-rose-500/40 text-rose-800 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
                    <div>
                      <span className="font-mono text-xs font-black uppercase tracking-wider text-rose-600 block">
                        Deliverable Blocked
                      </span>
                      <p className="text-sm font-semibold text-rose-950 mt-0.5">
                        {task.blockerReason || 'Waiting on critical dependencies or workshop clearance.'}
                      </p>
                    </div>
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      disabled={isSavingBlocker}
                      onClick={() => handleToggleBlocker(false)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs"
                    >
                      Resolve Blocker
                    </button>
                  )}
                </div>
              </div>
            ) : showBlockerInput ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-900">
                    Flag Blocker for Leadership:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBlockerInput(false)}
                    className="text-grey hover:text-jet-black text-xs font-mono"
                  >
                    Cancel
                  </button>
                </div>
                <input
                  type="text"
                  value={blockerReasonDraft}
                  onChange={(e) => setBlockerReasonDraft(e.target.value)}
                  placeholder="e.g. Waiting on 4130 chromoly tubes delivery or lathe tooling..."
                  className="w-full px-3 py-2 text-xs font-mono bg-white border border-jet-black/15 rounded-lg focus:outline-none focus:border-orange text-jet-black"
                />
                <button
                  type="button"
                  disabled={isSavingBlocker || !blockerReasonDraft.trim()}
                  onClick={() => handleToggleBlocker(true, blockerReasonDraft)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Confirm Blocker Alert
                </button>
              </div>
            ) : null}

            {/* Description */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-grey font-bold block">
                Deliverables &amp; Scope:
              </span>
              <div className="p-4 bg-alice-blue/40 rounded-xl border border-jet-black/5 text-sm text-jet-black whitespace-pre-wrap leading-relaxed font-light">
                {task.description ? task.description : <span className="italic text-grey">No deliverables description entered.</span>}
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Assigned Members */}
              <div className="p-4 bg-white border border-jet-black/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-grey font-bold block">
                    Assigned Team Members:
                  </span>
                  {user && (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleToggleAssignMe}
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        isAssignedToMe
                          ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                          : 'border-orange/40 bg-orange/10 text-orange hover:bg-orange hover:text-white'
                      }`}
                    >
                      {isAssignedToMe ? '✕ Unassign Me' : '+ Assign to Me'}
                    </button>
                  )}
                </div>
                {task.assignedMembers && task.assignedMembers.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {task.assignedMembers.map((member) => {
                      const isMe = user && (
                        member.toLowerCase() === user.displayName.toLowerCase() ||
                        user.displayName.toLowerCase().includes(member.toLowerCase()) ||
                        member.toLowerCase().includes(user.displayName.toLowerCase())
                      );
                      return (
                        <span
                          key={member}
                          className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold inline-flex items-center gap-1.5 border ${
                            isMe
                              ? 'bg-orange/15 text-orange border-orange/30'
                              : 'bg-alice-blue border-jet-black/10 text-jet-black'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${isMe ? 'bg-orange animate-pulse' : 'bg-jet-black/40'}`}></span>
                          <span>{member}</span>
                          {isMe && (
                            <span className="text-[9px] text-orange uppercase font-bold">(You)</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-xs font-mono italic text-grey">No specific members assigned yet</span>
                )}
              </div>

              {/* Due Date & Hours */}
              <div className="p-4 bg-white border border-jet-black/10 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-grey font-bold block">
                    Target Due Date:
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowHoursInput(!showHoursInput)}
                    className="text-[10px] font-mono text-orange hover:underline font-bold cursor-pointer"
                  >
                    + Log Time ({task.actualHours || 0}h)
                  </button>
                </div>
                <div className="text-xs font-mono font-bold text-jet-black">
                  {formatDueDate(task.dueDate)}
                </div>

                {showHoursInput && (
                  <form onSubmit={handleLogHours} className="p-2.5 rounded-lg bg-alice-blue/60 border border-jet-black/10 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-grey block">
                      Record Workshop Hours on Deliverable:
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="24"
                        value={hoursToLog}
                        onChange={(e) => setHoursToLog(e.target.value)}
                        placeholder="e.g. 2.0"
                        className="w-24 px-2 py-1 text-xs font-mono bg-white border border-jet-black/15 rounded"
                      />
                      <button
                        type="submit"
                        disabled={isLoggingHours || !hoursToLog}
                        className="px-2.5 py-1 rounded bg-orange text-white font-mono text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                      >
                        Save Hours
                      </button>
                    </div>
                  </form>
                )}

                <div className="pt-2 border-t border-jet-black/5 text-[10px] font-mono text-grey space-y-0.5">
                  <div>Created: {new Date(task.createdAt).toLocaleString()}</div>
                  {task.updatedAt && (
                    <div>Updated: {new Date(task.updatedAt).toLocaleString()}</div>
                  )}
                </div>
              </div>

            </div>

            {/* Subtasks Checklist Section */}
            <div className="p-4 bg-white border border-jet-black/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-grey font-bold">
                    Checklist &amp; Subtasks
                  </span>
                  {task.subtasks && task.subtasks.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-jet-black/5 text-[10px] font-mono font-bold text-jet-black">
                      {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length} ({Math.round((task.subtasks.filter((st) => st.completed).length / task.subtasks.length) * 100)}%)
                    </span>
                  )}
                </div>
                {canEdit && !task.isBlocked && !showBlockerInput && (
                  <button
                    type="button"
                    onClick={() => setShowBlockerInput(true)}
                    className="text-[10px] font-mono text-amber-700 hover:text-amber-800 font-bold hover:underline cursor-pointer"
                  >
                    Flag Blocker
                  </button>
                )}
              </div>

              {/* Progress Bar */}
              {task.subtasks && task.subtasks.length > 0 && (
                <div className="w-full h-2 bg-alice-blue rounded-full overflow-hidden border border-jet-black/5">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${Math.round((task.subtasks.filter((st) => st.completed).length / task.subtasks.length) * 100)}%` }}
                  />
                </div>
              )}

              {/* Subtasks List */}
              <div className="space-y-1.5 pt-1">
                {task.subtasks && task.subtasks.length > 0 ? (
                  task.subtasks.map((st) => (
                    <div
                      key={st.id}
                      className={`group p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        st.completed
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-grey'
                          : 'bg-alice-blue/30 border-jet-black/5 hover:border-jet-black/15 text-jet-black'
                      }`}
                    >
                      <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={st.completed}
                          disabled={!canEdit}
                          onChange={() => handleToggleSubtask(st.id, st.completed)}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-jet-black/20 cursor-pointer shrink-0"
                        />
                        <span className={`text-xs font-mono select-none break-words ${st.completed ? 'line-through text-grey' : 'font-medium'}`}>
                          {st.text}
                        </span>
                      </label>

                      <div className="flex items-center gap-2 shrink-0">
                        {st.completedBy && st.completed && (
                          <span className="text-[9px] font-mono text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded font-semibold">
                            Done: {st.completedBy.split(' ')[0]}
                          </span>
                        )}
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSubtask(st.id)}
                            className="text-grey hover:text-red-500 text-xs px-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="Remove item"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-mono italic text-grey/60 py-1">
                    No checklist items yet. Add subtasks to track step-by-step progress.
                  </p>
                )}
              </div>

              {/* Add Subtask Input */}
              {canEdit && (
                <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    placeholder="+ Add a checklist step (press Enter)..."
                    className="flex-1 px-3 py-2 text-xs font-mono bg-alice-blue/50 border border-jet-black/10 rounded-xl focus:outline-none focus:border-orange text-jet-black"
                  />
                  <button
                    type="submit"
                    disabled={isAddingSubtask || !newSubtaskText.trim()}
                    className="px-3.5 py-2 rounded-xl bg-jet-black text-alice-blue hover:bg-orange text-xs font-mono font-bold transition-all disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    Add
                  </button>
                </form>
              )}
            </div>

            {/* Team Discussion & Notes Thread */}
            <div className="p-4 bg-white border border-jet-black/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-grey font-bold">
                  Discussion &amp; Workshop Notes ({task.comments?.length || 0})
                </span>
                <span className="text-[10px] font-mono text-grey">
                  Internal Squad Thread
                </span>
              </div>

              {/* Comments Feed */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {task.comments && task.comments.length > 0 ? (
                  task.comments.map((comment) => (
                    <div key={comment.id} className="p-3 rounded-xl bg-alice-blue/40 border border-jet-black/5 text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-jet-black flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-jet-black text-white flex items-center justify-center text-[9px] font-bold">
                            {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : 'M'}
                          </span>
                          <span>{comment.authorName}</span>
                          {comment.authorTeam && (
                            <span className="text-orange uppercase">[{comment.authorTeam}]</span>
                          )}
                        </span>
                        <span className="text-grey/70">
                          {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-jet-black/90 whitespace-pre-wrap leading-relaxed pl-6">
                        {comment.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-mono italic text-grey/60 py-1">
                    No notes recorded yet. Post fabrication notes, tool requirements, or blockers here.
                  </p>
                )}
              </div>

              {/* Add Comment Input */}
              {user && (
                <form onSubmit={handlePostComment} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Write a quick update or note..."
                    className="flex-1 px-3 py-2 text-xs font-mono bg-alice-blue/50 border border-jet-black/10 rounded-xl focus:outline-none focus:border-orange text-jet-black"
                  />
                  <button
                    type="submit"
                    disabled={isPostingComment || !newCommentText.trim()}
                    className="px-3.5 py-2 rounded-xl bg-jet-black text-alice-blue hover:bg-orange text-xs font-mono font-bold transition-all disabled:opacity-40 cursor-pointer shrink-0"
                  >
                    Post Note
                  </button>
                </form>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-5 border-t border-jet-black/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              
              {/* Left Group: Task Management (Delete & Edit) */}
              <div className="flex items-center gap-2 order-2 sm:order-1">
                {canDelete && (
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 sm:flex-none h-10 px-3.5 rounded-xl text-xs font-mono font-bold text-red-600 hover:text-red-700 bg-red-50/60 hover:bg-red-50 border border-red-200/80 hover:border-red-300 transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs"
                  >
                    <span>✕ Delete</span>
                  </button>
                )}

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex-1 sm:flex-none h-10 px-3.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold text-xs uppercase font-mono tracking-wider shadow-sm cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <span>Edit Task</span>
                  </button>
                )}
              </div>

              {/* Right Group: Workflow Progression (Log Work & Complete) */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 order-1 sm:order-2">
                {/* Pre-fill Log Entry */}
                <Link
                  href={`/log?team=${task.teamId}&task=${encodeURIComponent(task.title)}`}
                  className="h-10 px-3.5 rounded-xl border border-orange/80 text-orange hover:bg-orange hover:text-white text-xs font-mono uppercase font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 whitespace-nowrap text-center"
                >
                  <span>Log Work &rarr;</span>
                </Link>

                {task.status !== 'done' && canEdit && onCompleteWithVideo && (
                  <button
                    type="button"
                    onClick={() => onCompleteWithVideo(task)}
                    className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase font-mono tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <span>Complete &amp; Attach Video</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        ) : (
          /* ================= EDIT FORM ================= */
          <form onSubmit={handleSaveEdit} className="space-y-4">
            
            <div>
              <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
                Task Title *
              </label>
              <input
                type="text"
                required
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-base sm:text-sm font-medium focus:ring-2 focus:ring-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
                Deliverables &amp; Scope
              </label>
              <textarea
                rows={3}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
                  Subsystem Team
                </label>
                <select
                  disabled={!isAdmin}
                  value={editTeamId}
                  onChange={(e) => {
                    setEditTeamId(e.target.value as TeamId);
                    setEditAssignedMembers([]);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-jet-black/15 text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none disabled:bg-zinc-100 disabled:cursor-not-allowed"
                >
                  {TEAMS_LIST.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.code}] {t.name}
                    </option>
                  ))}
                </select>
                {!isAdmin && (
                  <span className="text-[10px] font-mono text-grey block mt-1">
                    Only administrators can reassign team ownership.
                  </span>
                )}
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
                  Priority Level
                </label>
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as TaskPriority)}
                  className="w-full px-3 py-2.5 rounded-xl border border-jet-black/15 text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Member Checklist Selection */}
            <div>
              <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
                Assigned Team Members (Check from list)
              </label>
              <MemberSelect
                teamId={editTeamId}
                selectedMembers={editAssignedMembers}
                onChange={setEditAssignedMembers}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
                  Task Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
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
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-jet-black/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl border border-jet-black/20 text-xs font-mono uppercase cursor-pointer hover:bg-alice-blue transition-colors font-medium min-h-[40px] sm:min-h-0 text-center w-full sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 sm:py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center w-full sm:w-auto min-h-[44px] sm:min-h-0"
              >
                {isSaving ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>

          </form>
        )}

      </div>

      {/* =========================================================================
          CUSTOM DELETE CONFIRMATION MODAL
         ========================================================================= */}
      {showDeleteConfirm && (
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
              <p className="text-sm font-bold text-jet-black line-clamp-2 leading-snug">{task.title}</p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${currentTeam?.badgeBg || 'bg-jet-black/5 text-jet-black'}`}>
                  [{currentTeam?.code}] {currentTeam?.name}
                </span>
                <span className="text-[10px] font-mono text-grey">ID: {task.id}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-jet-black/10">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-jet-black/15 text-xs font-mono font-bold text-grey hover:text-jet-black hover:bg-alice-blue transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
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
    </div>
  );
}
