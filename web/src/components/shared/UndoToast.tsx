"use client";

import React from 'react';
import { UndoState } from '@/types/dashboard';

interface UndoToastProps {
  undoState: UndoState | null;
  onUndo: () => void;
  onDismiss: () => void;
}

export default function UndoToast({ undoState, onUndo, onDismiss }: UndoToastProps) {
  if (!undoState) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-[300] bg-jet-black text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-3.5 text-xs font-sans animate-in fade-in slide-in-from-bottom-3 duration-200">
      <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
      <span className="max-w-[240px] sm:max-w-md truncate text-zinc-200 font-medium">
        {undoState.message}
      </span>
      <button
        type="button"
        onClick={onUndo}
        className="px-3 py-1.5 rounded-lg bg-orange text-jet-black font-bold hover:bg-amber-400 active:scale-95 transition-all cursor-pointer text-xs"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={onDismiss}
        className="text-zinc-400 hover:text-white p-1 cursor-pointer transition-colors text-xs"
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
