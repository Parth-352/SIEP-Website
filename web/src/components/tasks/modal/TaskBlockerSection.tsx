'use client';

import React from 'react';
import { Task } from '@/lib/types';

interface TaskBlockerSectionProps {
  task: Task;
  canEdit: boolean;
  isSavingBlocker: boolean;
  showBlockerInput: boolean;
  blockerReasonDraft: string;
  setShowBlockerInput: (show: boolean) => void;
  setBlockerReasonDraft: (reason: string) => void;
  onToggleBlocker: (isBlocked: boolean, reason?: string) => void;
}

export default function TaskBlockerSection({
  task,
  canEdit,
  isSavingBlocker,
  showBlockerInput,
  blockerReasonDraft,
  setShowBlockerInput,
  setBlockerReasonDraft,
  onToggleBlocker,
}: TaskBlockerSectionProps) {
  if (task.isBlocked) {
    return (
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
              onClick={() => onToggleBlocker(false)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shrink-0 shadow-xs"
            >
              Resolve Blocker
            </button>
          )}
        </div>
      </div>
    );
  }

  if (showBlockerInput) {
    return (
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
          onClick={() => onToggleBlocker(true, blockerReasonDraft)}
          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
        >
          Confirm Blocker Alert
        </button>
      </div>
    );
  }

  return null;
}
