'use client';

import React from 'react';
import { Task } from '@/lib/types';
import { PRIORITY_BADGES } from './taskModalConfig';

interface TaskModalHeaderProps {
  task: Task;
  currentTeam?: {
    code: string;
    name: string;
    badgeBg?: string;
  };
  onClose: () => void;
}

export default function TaskModalHeader({ task, currentTeam, onClose }: TaskModalHeaderProps) {
  const priorityInfo = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;

  return (
    <div className="flex items-start justify-between gap-4 pb-4 border-b border-jet-black/10">
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-bold border ${
              currentTeam?.badgeBg || 'bg-jet-black/5 text-jet-black'
            }`}
          >
            [{currentTeam?.code}] {currentTeam?.name}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider font-bold ${priorityInfo.badgeClass}`}
          >
            {priorityInfo.label} Priority
          </span>
          <span className="text-[10px] font-mono text-grey">
            ID: {task.id}
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-jet-black tracking-tight">
          {task.title}
        </h3>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="text-grey hover:text-jet-black text-sm p-2 cursor-pointer rounded-xl hover:bg-alice-blue transition-colors shrink-0"
        aria-label="Close modal"
      >
        ✕
      </button>
    </div>
  );
}
