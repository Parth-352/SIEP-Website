"use client";

import React, { useState } from 'react';
import { TEAMS_LIST } from '@/lib/teams';
import { TeamId, TaskPriority, TaskStatus, Task } from '@/lib/types';
import MemberSelect from '@/components/MemberSelect';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCoreAdmin: boolean;
  defaultTeam: TeamId;
  onSubmit: (taskData: {
    title: string;
    description: string;
    teamId: TeamId;
    assignedMembers: string[];
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string;
  }) => Promise<void>;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  isCoreAdmin,
  defaultTeam,
  onSubmit,
}: CreateTaskModalProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskTeam, setNewTaskTeam] = useState<TeamId>(defaultTeam);
  const [newTaskMembers, setNewTaskMembers] = useState<string[]>([]);
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('todo');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!newTaskTitle.trim()) {
      setCreateError('Please specify a title for the task.');
      return;
    }

    setIsSubmittingTask(true);
    try {
      await onSubmit({
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        teamId: newTaskTeam,
        assignedMembers: newTaskMembers,
        priority: newTaskPriority,
        status: newTaskStatus,
        dueDate: newTaskDueDate || undefined,
      });
      // Reset form
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskMembers([]);
      setNewTaskPriority('medium');
      setNewTaskStatus('todo');
      setNewTaskDueDate('');
      onClose();
    } catch {
      setCreateError('Failed to create task. Please try again.');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-jet-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border-2 border-orange/40 rounded-2xl w-full max-w-lg p-4 sm:p-8 max-h-[90vh] my-auto overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-jet-black/10">
          <div>
            <h3 className="text-lg font-bold text-jet-black">Create New Task</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-grey hover:text-jet-black text-sm p-1.5 cursor-pointer rounded-lg hover:bg-alice-blue"
          >
            ✕
          </button>
        </div>

        {createError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-mono">
            {createError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-base sm:text-sm font-medium focus:ring-2 focus:ring-orange focus:outline-none"
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
              className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none leading-relaxed"
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
                className="w-full px-3 py-2.5 rounded-xl border border-jet-black/15 text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none disabled:bg-zinc-100"
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
                className="w-full px-3 py-2.5 rounded-xl border border-jet-black/15 text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
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
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-jet-black/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-jet-black/20 text-xs font-mono uppercase cursor-pointer hover:bg-alice-blue transition-colors font-medium w-full sm:w-auto text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingTask}
              className="px-6 py-3 sm:py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              {isSubmittingTask ? 'Assigning...' : 'Assign Task →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
