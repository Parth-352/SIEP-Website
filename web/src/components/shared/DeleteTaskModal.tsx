"use client";

import React from 'react';
import { Task } from '@/lib/types';

interface DeleteTaskModalProps {
  task: Task | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteTaskModal({
  task,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteTaskModalProps) {
  if (!task) return null;

  return (
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
          <span className="text-[10px] font-mono uppercase tracking-wider text-grey block font-bold">
            Task:
          </span>
          <p className="text-sm font-bold text-jet-black line-clamp-2 leading-snug">{task.title}</p>
          <div className="flex items-center gap-2 pt-0.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-jet-black/5 text-jet-black border border-jet-black/10">
              Team: {task.teamId}
            </span>
            <span className="text-[10px] font-mono text-grey">ID: {task.id}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-jet-black/10">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-jet-black/15 text-xs font-mono font-bold text-grey hover:text-jet-black hover:bg-alice-blue transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
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
              <span>Confirm Delete</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
