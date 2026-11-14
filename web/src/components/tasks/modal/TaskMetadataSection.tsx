'use client';

import React from 'react';
import { Task, UserProfile } from '@/lib/types';
import { formatDueDate } from './taskModalConfig';

interface TaskMetadataSectionProps {
  task: Task;
  user: UserProfile | null;
  isSaving: boolean;
  isAssignedToMe: boolean;
  showHoursInput: boolean;
  hoursToLog: string;
  isLoggingHours: boolean;
  onToggleAssignMe: () => void;
  onToggleShowHoursInput: () => void;
  onChangeHoursToLog: (val: string) => void;
  onLogHours: (e: React.FormEvent) => void;
}

export default function TaskMetadataSection({
  task,
  user,
  isSaving,
  isAssignedToMe,
  showHoursInput,
  hoursToLog,
  isLoggingHours,
  onToggleAssignMe,
  onToggleShowHoursInput,
  onChangeHoursToLog,
  onLogHours,
}: TaskMetadataSectionProps) {
  return (
    <>
      {/* Description */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-mono uppercase tracking-wider text-grey font-bold block">
          Deliverables &amp; Scope:
        </span>
        <div className="p-4 bg-alice-blue/40 rounded-xl border border-jet-black/5 text-sm text-jet-black whitespace-pre-wrap leading-relaxed font-light">
          {task.description ? (
            task.description
          ) : (
            <span className="italic text-grey">No deliverables description entered.</span>
          )}
        </div>
      </div>

      {/* Metadata Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Assigned Members */}
        <div className="p-4 bg-white border border-jet-black/10 rounded-xl space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-grey font-bold block">
              Assigned Team Members:
            </span>
            {user && (
              <button
                type="button"
                disabled={isSaving}
                onClick={onToggleAssignMe}
                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                  isAssignedToMe
                    ? 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                    : 'border-orange/40 bg-orange/10 text-orange hover:bg-orange hover:text-white'
                }`}
              >
                {isAssignedToMe ? '✕ Unassign Me' : '+ Assign to Me'}
              </button>
            )}
          </div>
          {task.assignedMembers && task.assignedMembers.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {task.assignedMembers.map((member) => {
                const isMe =
                  user &&
                  (member.toLowerCase() === user.displayName.toLowerCase() ||
                    user.displayName.toLowerCase().includes(member.toLowerCase()) ||
                    member.toLowerCase().includes(user.displayName.toLowerCase()));
                return (
                  <span
                    key={member}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold inline-flex items-center gap-1.5 border ${
                      isMe
                        ? 'bg-orange/15 text-orange border-orange/30'
                        : 'bg-alice-blue border-jet-black/10 text-jet-black'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isMe ? 'bg-orange animate-pulse' : 'bg-jet-black/40'}`}></span>
                    <span>{member}</span>
                    {isMe && (
                      <span className="text-[9px] text-orange uppercase font-bold">(You)</span>
                    )}
                  </span>
                );
              })}
            </div>
          ) : (
            <span className="text-xs font-mono italic text-grey">No specific members assigned yet</span>
          )}
        </div>

        {/* Due Date & Hours */}
        <div className="p-4 bg-white border border-jet-black/10 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-grey font-bold block">
              Target Due Date:
            </span>
            <button
              type="button"
              onClick={onToggleShowHoursInput}
              className="text-[10px] font-mono text-orange hover:underline font-bold cursor-pointer"
            >
              + Log Time ({task.actualHours || 0}h)
            </button>
          </div>
          <div className="text-xs font-mono font-bold text-jet-black">
            {formatDueDate(task.dueDate)}
          </div>

          {showHoursInput && (
            <form onSubmit={onLogHours} className="p-2.5 rounded-lg bg-alice-blue/60 border border-jet-black/10 space-y-2">
              <span className="text-[10px] font-mono uppercase text-grey block">
                Record Workshop Hours on Deliverable:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="24"
                  value={hoursToLog}
                  onChange={(e) => onChangeHoursToLog(e.target.value)}
                  placeholder="e.g. 2.0"
                  className="w-24 px-2 py-1 text-xs font-mono bg-white border border-jet-black/15 rounded"
                />
                <button
                  type="submit"
                  disabled={isLoggingHours || !hoursToLog}
                  className="px-2.5 py-1 rounded bg-orange text-white font-mono text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  Save Hours
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 border-t border-jet-black/5 text-[10px] font-mono text-grey space-y-0.5">
            <div>Created: {new Date(task.createdAt).toLocaleString()}</div>
            {task.updatedAt && (
              <div>Updated: {new Date(task.updatedAt).toLocaleString()}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
