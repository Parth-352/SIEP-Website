'use client';

import React from 'react';
import { TaskPriority, TaskStatus, TeamId } from '@/lib/types';
import { TEAMS_LIST } from '@/lib/teams';
import MemberSelect from '@/components/MemberSelect';

interface TaskEditFormProps {
  editTitle: string;
  setEditTitle: (val: string) => void;
  editDescription: string;
  setEditDescription: (val: string) => void;
  editTeamId: TeamId;
  setEditTeamId: (team: TeamId) => void;
  editAssignedMembers: string[];
  setEditAssignedMembers: (members: string[]) => void;
  editPriority: TaskPriority;
  setEditPriority: (priority: TaskPriority) => void;
  editStatus: TaskStatus;
  setEditStatus: (status: TaskStatus) => void;
  editDueDate: string;
  setEditDueDate: (date: string) => void;
  isAdmin: boolean;
  canApproveCompletion: boolean;
  isSaving: boolean;
  onSaveEdit: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
}

export default function TaskEditForm({
  editTitle,
  setEditTitle,
  editDescription,
  setEditDescription,
  editTeamId,
  setEditTeamId,
  editAssignedMembers,
  setEditAssignedMembers,
  editPriority,
  setEditPriority,
  editStatus,
  setEditStatus,
  editDueDate,
  setEditDueDate,
  isAdmin,
  canApproveCompletion,
  isSaving,
  onSaveEdit,
  onCancelEdit,
}: TaskEditFormProps) {
  return (
    <form onSubmit={onSaveEdit} className="space-y-4">
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
            <option value="done" disabled={!canApproveCompletion}>
              {canApproveCompletion ? 'Completed' : 'Completed (Leads & Core only)'}
            </option>
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
          onClick={onCancelEdit}
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
  );
}
