'use client';

import React from 'react';
import { Task, TaskStatus } from '@/lib/types';
import { STATUS_OPTIONS } from './taskModalConfig';

interface TaskStatusSwitcherProps {
  task: Task;
  canEdit: boolean;
  isSaving: boolean;
  canApproveCompletion: boolean;
  onQuickStatusChange: (nextStatus: TaskStatus) => void;
}

export default function TaskStatusSwitcher({
  task,
  canEdit,
  isSaving,
  canApproveCompletion,
  onQuickStatusChange,
}: TaskStatusSwitcherProps) {
  return (
    <>
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
            const isCompletionBlocked = status.id === 'done' && !canApproveCompletion;
            return (
              <button
                key={status.id}
                type="button"
                disabled={!canEdit || isSaving || isCompletionBlocked}
                onClick={() => onQuickStatusChange(status.id)}
                title={
                  isCompletionBlocked
                    ? 'Hierarchy Rule: Only Squad Leads and Core Leadership can approve and mark tasks as Completed'
                    : undefined
                }
                className={`py-2 px-3 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  isCompletionBlocked
                    ? 'bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed opacity-60'
                    : isActive
                    ? status.activeClass
                    : 'bg-white border border-jet-black/10 hover:border-orange hover:text-orange text-grey cursor-pointer'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isCompletionBlocked ? (
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>{status.label}</span>
                  </span>
                ) : (
                  <>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                    <span>{status.label}</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Under Review Observation & Hierarchy Banner */}
      {task.status === 'review' && (
        <div className="p-4 rounded-xl bg-purple-50/90 border border-purple-200 text-purple-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <p className="font-sans font-bold text-xs uppercase tracking-wider text-purple-800">
                Under Observation &amp; Review
              </p>
              <p className="text-xs text-purple-900 mt-0.5">
                Deliverable is awaiting official verification. Only Squad Leads and Core Leadership have authority to approve and mark Completed.
              </p>
            </div>
          </div>
          {canApproveCompletion && (
            <button
              type="button"
              onClick={() => onQuickStatusChange('done')}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <span>Approve &amp; Complete</span>
              <span>✓</span>
            </button>
          )}
        </div>
      )}
    </>
  );
}
