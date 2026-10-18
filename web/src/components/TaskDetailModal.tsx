"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Task, TaskStatus, TaskPriority, TeamId } from '@/lib/types';
import { TEAMS, TEAMS_LIST } from '@/lib/teams';
import MemberSelect from './MemberSelect';

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated: (updatedTask: Task) => void;
  onTaskDeleted: (taskId: string) => void;
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
  canEdit,
  canDelete,
  isAdmin,
}: TaskDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
    }
  }, [task]);

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
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete task "${task.title}"?`)) return;

    setIsDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/tasks?id=${task.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onTaskDeleted(task.id);
        onClose();
      } else {
        setError(data.error || 'Failed to delete task');
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Network error while deleting task');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-jet-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border-2 border-jet-black/15 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 space-y-6">
        
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
            ⚠️ {error}
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
                <span className="text-[11px] font-mono uppercase tracking-wider text-grey font-bold block">
                  Assigned Team Members:
                </span>
                {task.assignedMembers && task.assignedMembers.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {task.assignedMembers.map((member) => (
                      <span
                        key={member}
                        className="px-2.5 py-1 bg-alice-blue border border-jet-black/10 rounded-lg text-xs font-mono font-bold text-jet-black inline-flex items-center gap-1.5"
                      >
                        <span className="w-2 h-2 rounded-full bg-orange"></span>
                        <span>{member}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs font-mono italic text-grey">No specific members assigned</span>
                )}
              </div>

              {/* Due Date & Activity */}
              <div className="p-4 bg-white border border-jet-black/10 rounded-xl space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-grey font-bold block">
                  Target Due Date:
                </span>
                <div className="text-xs font-mono font-bold text-jet-black">
                  {formatDueDate(task.dueDate)}
                </div>
                <div className="pt-2 border-t border-jet-black/5 text-[10px] font-mono text-grey space-y-0.5">
                  <div>Created: {new Date(task.createdAt).toLocaleString()}</div>
                  {task.updatedAt && (
                    <div>Updated: {new Date(task.updatedAt).toLocaleString()}</div>
                  )}
                </div>
              </div>

            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-jet-black/10 flex flex-wrap items-center justify-between gap-3">
              
              <div className="flex items-center gap-2">
                {canDelete && (
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="px-3.5 py-2 text-xs font-mono text-red-600 hover:bg-red-50 border border-red-200 rounded-xl font-bold cursor-pointer transition-colors"
                  >
                    {isDeleting ? 'Deleting...' : '✕ Delete Task'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Pre-fill Log Entry */}
                <Link
                  href={`/log?team=${task.teamId}&task=${encodeURIComponent(task.title)}`}
                  className="px-4 py-2.5 rounded-xl border border-orange text-orange hover:bg-orange hover:text-white text-xs font-mono uppercase font-bold transition-all shadow-sm inline-flex items-center gap-1.5"
                >
                  <span>Log Work for this Task</span>
                  <span>→</span>
                </Link>

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer"
                  >
                    Edit Task ✎
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
                className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-sm font-medium focus:ring-2 focus:ring-orange focus:outline-none"
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
                placeholder="Detailed engineering scope, tolerances, or test standards..."
                className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-xs focus:ring-2 focus:ring-orange focus:outline-none leading-relaxed"
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
                  className="w-full px-3 py-2.5 rounded-xl border border-jet-black/15 text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none disabled:bg-zinc-100 disabled:cursor-not-allowed"
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
                  className="w-full px-3 py-2.5 rounded-xl border border-jet-black/15 text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
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
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-jet-black/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 rounded-xl border border-jet-black/20 text-xs font-mono uppercase cursor-pointer hover:bg-alice-blue transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Saving Changes...' : 'Save Changes ✓'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
