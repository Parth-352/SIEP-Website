'use client';

import React from 'react';
import Link from 'next/link';
import { Task } from '@/lib/types';

interface TaskModalActionsProps {
  task: Task;
  canEdit: boolean;
  canDelete: boolean;
  isDeleting: boolean;
  canApproveCompletion: boolean;
  onCompleteWithVideo?: (task: Task) => void;
  onOpenDeleteConfirm: () => void;
  onStartEditing: () => void;
  onQuickStatusChange: (status: 'review') => void;
}

export default function TaskModalActions({
  task,
  canEdit,
  canDelete,
  isDeleting,
  canApproveCompletion,
  onCompleteWithVideo,
  onOpenDeleteConfirm,
  onStartEditing,
  onQuickStatusChange,
}: TaskModalActionsProps) {
  return (
    <div className="pt-5 border-t border-jet-black/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {/* Left Group: Task Management (Delete & Edit) */}
      <div className="flex items-center gap-2 order-2 sm:order-1">
        {canDelete && (
          <button
            type="button"
            disabled={isDeleting}
            onClick={onOpenDeleteConfirm}
            className="flex-1 sm:flex-none h-10 px-3.5 rounded-xl text-xs font-mono font-bold text-red-600 hover:text-red-700 bg-red-50/60 hover:bg-red-50 border border-red-200/80 hover:border-red-300 transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap shadow-xs"
          >
            <span>✕ Delete</span>
          </button>
        )}

        {canEdit && (
          <button
            type="button"
            onClick={onStartEditing}
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

        {task.status !== 'done' &&
          canEdit &&
          (canApproveCompletion ? (
            onCompleteWithVideo && (
              <button
                type="button"
                onClick={() => onCompleteWithVideo(task)}
                className="h-10 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase font-mono tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>Complete &amp; Attach Video</span>
              </button>
            )
          ) : task.status === 'review' ? (
            <div
              title="Under Review: Only Squad Leads and Core Leadership can approve and complete deliverables"
              className="h-10 px-4 rounded-xl bg-purple-100/80 border border-purple-200 text-purple-800 font-bold text-xs font-sans flex items-center justify-center gap-1.5 whitespace-nowrap select-none"
            >
              <svg className="w-3.5 h-3.5 text-purple-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Awaiting Lead Approval</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onQuickStatusChange('review')}
              className="h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase font-mono tracking-wider shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span>Submit for Review &rarr;</span>
            </button>
          ))}
      </div>
    </div>
  );
}
