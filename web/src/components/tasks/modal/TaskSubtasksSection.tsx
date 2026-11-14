'use client';

import React from 'react';
import { Task } from '@/lib/types';

interface TaskSubtasksSectionProps {
  task: Task;
  canEdit: boolean;
  newSubtaskText: string;
  isAddingSubtask: boolean;
  showBlockerInput: boolean;
  onToggleSubtask: (subtaskId: string, currentCompleted: boolean) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onAddSubtask: (e: React.FormEvent) => void;
  onChangeNewSubtaskText: (val: string) => void;
  onShowBlockerInput: () => void;
}

export default function TaskSubtasksSection({
  task,
  canEdit,
  newSubtaskText,
  isAddingSubtask,
  showBlockerInput,
  onToggleSubtask,
  onDeleteSubtask,
  onAddSubtask,
  onChangeNewSubtaskText,
  onShowBlockerInput,
}: TaskSubtasksSectionProps) {
  const completedCount = task.subtasks?.filter((st) => st.completed).length || 0;
  const totalCount = task.subtasks?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="p-4 bg-white border border-jet-black/10 rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-grey font-bold">
            Checklist &amp; Subtasks
          </span>
          {totalCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-jet-black/5 text-[10px] font-mono font-bold text-jet-black">
              {completedCount}/{totalCount} ({progressPercent}%)
            </span>
          )}
        </div>
        {canEdit && !task.isBlocked && !showBlockerInput && (
          <button
            type="button"
            onClick={onShowBlockerInput}
            className="text-[10px] font-mono text-amber-700 hover:text-amber-800 font-bold hover:underline cursor-pointer"
          >
            Flag Blocker
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="w-full h-2 bg-alice-blue rounded-full overflow-hidden border border-jet-black/5">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}

      {/* Subtasks List */}
      <div className="space-y-1.5 pt-1">
        {totalCount > 0 ? (
          task.subtasks!.map((st) => (
            <div
              key={st.id}
              className={`group p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                st.completed
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-grey'
                  : 'bg-alice-blue/30 border-jet-black/5 hover:border-jet-black/15 text-jet-black'
              }`}
            >
              <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={st.completed}
                  disabled={!canEdit}
                  onChange={() => onToggleSubtask(st.id, st.completed)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-jet-black/20 cursor-pointer shrink-0"
                />
                <span
                  className={`text-xs font-mono select-none break-words ${
                    st.completed ? 'line-through text-grey' : 'font-medium'
                  }`}
                >
                  {st.text}
                </span>
              </label>

              <div className="flex items-center gap-2 shrink-0">
                {st.completedBy && st.completed && (
                  <span className="text-[9px] font-mono text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded font-semibold">
                    Done: {st.completedBy.split(' ')[0]}
                  </span>
                )}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => onDeleteSubtask(st.id)}
                    className="text-grey hover:text-red-500 text-xs px-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Remove item"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs font-mono italic text-grey/60 py-1">
            No checklist items yet. Add subtasks to track step-by-step progress.
          </p>
        )}
      </div>

      {/* Add Subtask Input */}
      {canEdit && (
        <form onSubmit={onAddSubtask} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={newSubtaskText}
            onChange={(e) => onChangeNewSubtaskText(e.target.value)}
            placeholder="+ Add a checklist step (press Enter)..."
            className="flex-1 px-3 py-2 text-xs font-mono bg-alice-blue/50 border border-jet-black/10 rounded-xl focus:outline-none focus:border-orange text-jet-black"
          />
          <button
            type="submit"
            disabled={isAddingSubtask || !newSubtaskText.trim()}
            className="px-3.5 py-2 rounded-xl bg-jet-black text-alice-blue hover:bg-orange text-xs font-mono font-bold transition-all disabled:opacity-40 cursor-pointer shrink-0"
          >
            Add
          </button>
        </form>
      )}
    </div>
  );
}
