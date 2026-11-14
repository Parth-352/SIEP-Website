import React, { useState } from 'react';
import { WorkLog } from '@/lib/types';

interface DeleteConfirmModalProps {
  deleteConfirmLog: WorkLog | null;
  onClose: () => void;
  onLogDeleted: (id: string) => void;
}

export default function DeleteConfirmModal({
  deleteConfirmLog,
  onClose,
  onLogDeleted,
}: DeleteConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (!deleteConfirmLog) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/logs?id=${deleteConfirmLog.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        onLogDeleted(deleteConfirmLog.id);
        onClose();
      } else {
        setDeleteError(data.error || 'Failed to delete step log.');
      }
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Network error during log deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-jet-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border-2 border-red-500/40 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-jet-black">Confirm Step Deletion</h3>
            <p className="text-xs text-grey">Step #{deleteConfirmLog.stepNumber}</p>
          </div>
        </div>

        {deleteError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {deleteError}
          </div>
        )}

        <p className="text-xs text-jet-black/80 leading-relaxed">
          Are you sure you want to permanently delete step record: <strong className="text-jet-black">&ldquo;{deleteConfirmLog.stepTitle}&rdquo;</strong>? This action cannot be undone.
        </p>

        <div className="pt-3 border-t border-jet-black/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-jet-black/20 text-xs font-mono uppercase font-semibold hover:bg-jet-black/5 cursor-pointer w-full sm:w-auto text-center"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50 w-full sm:w-auto text-center min-h-[40px] sm:min-h-0 flex items-center justify-center"
          >
            {isDeleting ? 'Deleting...' : 'Delete Step'}
          </button>
        </div>
      </div>
    </div>
  );
}
