"use client";

import React from 'react';

interface BackupSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  backupStatus: string | null;
  isResetting: boolean;
  onExportBackup: () => void;
  onResetDatabase: () => void;
}

export default function BackupSyncModal({
  isOpen,
  onClose,
  backupStatus,
  isResetting,
  onExportBackup,
  onResetDatabase,
}: BackupSyncModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-jet-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border-2 border-jet-black/20 rounded-2xl w-full max-w-md p-6 sm:p-8 max-h-[90vh] my-auto overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-jet-black/10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-orange font-bold block">
              Admin Utilities
            </span>
            <h3 className="text-lg font-bold text-jet-black">
              Database Backup &amp; Sync
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-grey hover:text-jet-black text-sm p-1.5 cursor-pointer rounded-lg hover:bg-alice-blue"
          >
            ✕
          </button>
        </div>

        {backupStatus && (
          <div className="p-3 bg-alice-blue border border-jet-black/10 rounded-xl text-xs font-mono text-jet-black">
            {backupStatus}
          </div>
        )}

        <div className="space-y-3">
          <div className="p-4 bg-alice-blue/50 rounded-xl border border-jet-black/5 space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-jet-black">
              1. Download Database Backup
            </h4>
            <p className="text-xs text-grey leading-relaxed">
              Export all current tasks, work logs, and team inquiries into a JSON backup file for safe keeping.
            </p>
            <button
              type="button"
              onClick={onExportBackup}
              className="w-full py-2.5 px-4 bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold text-xs uppercase font-mono rounded-xl shadow-sm cursor-pointer"
            >
              Download .JSON Backup ⤓
            </button>
          </div>

          <div className="p-4 bg-red-50/50 rounded-xl border border-red-200/60 space-y-2">
            <h4 className="text-xs font-mono font-bold uppercase text-red-600">
              2. Clear &amp; Reset Database
            </h4>
            <p className="text-xs text-grey leading-relaxed">
              Reset the database to a clean, empty state with zero tasks and logs.
            </p>
            <button
              type="button"
              disabled={isResetting}
              onClick={onResetDatabase}
              className="w-full py-2.5 px-4 bg-white text-red-600 border border-red-300 hover:bg-red-600 hover:text-white transition-all font-bold text-xs uppercase font-mono rounded-xl cursor-pointer disabled:opacity-50"
            >
              {isResetting ? 'Resetting...' : 'Clear Database ↺'}
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-mono uppercase text-grey hover:text-jet-black cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
