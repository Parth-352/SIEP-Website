"use client";

import React from 'react';
import Link from 'next/link';
import { Task, TaskStatus } from '@/lib/types';
import { TEAMS } from '@/lib/teams';
import { PRIORITY_BADGES, STATUS_COLUMNS } from '@/constants/dashboard';
import { formatRelativeDueDate } from '@/utils/dateUtils';
import { getMemberInitials, getAvatarColorClass } from '@/utils/avatarUtils';

interface TaskCardProps {
  task: Task;
  colId: TaskStatus;
  isAssignedToMe: boolean;
  canManage: boolean;
  cardMenuTaskId?: string | null;
  setCardMenuTaskId?: (id: string | null) => void;
  onOpenDetail: (task: Task) => void;
  onMoveStatus: (e: React.MouseEvent, taskId: string, newStatus: TaskStatus) => void;
  onQuickClaim?: (e: React.MouseEvent, task: Task) => void;
  onRequestDelete?: (task: Task) => void;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  showLogLink?: boolean;
}

export default function TaskCard({
  task,
  colId,
  isAssignedToMe,
  canManage,
  cardMenuTaskId,
  setCardMenuTaskId,
  onOpenDetail,
  onMoveStatus,
  onQuickClaim,
  onRequestDelete,
  onDragStart,
  showLogLink,
}: TaskCardProps) {
  const taskTeam = TEAMS[task.teamId];
  const priorityInfo = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;
  const dueInfo = formatRelativeDueDate(task.dueDate);

  return (
    <div
      draggable={Boolean(onDragStart && canManage)}
      onDragStart={(e) => onDragStart && onDragStart(e, task.id)}
      onClick={() => onOpenDetail(task)}
      className="group bg-white hover:bg-zinc-50/70 border border-zinc-200/90 hover:border-orange/60 rounded-xl p-3.5 sm:p-4 shadow-2xs hover:shadow-md transition-all space-y-3 cursor-pointer"
    >
      {/* Header: Subsystem Badge + Priority */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`px-2 py-0.5 rounded-md text-[11px] font-sans font-semibold border whitespace-nowrap flex-shrink-0 ${
            taskTeam?.badgeBg || 'bg-zinc-100 text-zinc-800 border-zinc-200'
          }`}
        >
          {taskTeam?.shortName || task.teamId}
        </span>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0 ${priorityInfo.bg}`}
        >
          {priorityInfo.label}
        </span>
      </div>

      {/* Title & Description */}
      <div>
        <h5 className="text-sm font-sans font-semibold text-zinc-900 leading-snug group-hover:text-orange transition-colors">
          {task.title}
        </h5>
        {task.description && (
          <p className="text-xs text-zinc-600 mt-1 font-normal line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* Assignees & Due Date */}
      <div className="pt-2 border-t border-jet-black/5 flex items-center justify-between gap-2">
        {/* Assignees */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.assignedMembers && task.assignedMembers.length > 0 ? (
            <div className="flex items-center -space-x-1.5">
              {task.assignedMembers.slice(0, 3).map((name) => (
                <span
                  key={name}
                  title={name}
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-sans font-bold border-2 border-white uppercase shadow-xs ${getAvatarColorClass(
                    name
                  )}`}
                >
                  {getMemberInitials(name)}
                </span>
              ))}
              {task.assignedMembers.length > 3 && (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-bold bg-zinc-200 text-zinc-700 border-2 border-white">
                  +{task.assignedMembers.length - 3}
                </span>
              )}
            </div>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 italic font-sans">
              <span className="w-5 h-5 rounded-full border border-dashed border-zinc-300 flex items-center justify-center text-[9px] text-zinc-400">
                ?
              </span>
              Unassigned
            </span>
          )}

          {/* Comments & Hours */}
          {task.comments && task.comments.length > 0 && (
            <span className="px-1.5 py-0.5 rounded bg-white border border-jet-black/10 text-zinc-500 font-bold flex items-center gap-0.5 text-[10px]">
              💬 {task.comments.length}
            </span>
          )}
          {Boolean(task.actualHours) && (
            <span className="px-1.5 py-0.5 rounded bg-white border border-jet-black/10 text-zinc-500 font-medium text-[10px]">
              {task.actualHours}h
            </span>
          )}

          {!isAssignedToMe && onQuickClaim && (
            <button
              type="button"
              onClick={(e) => onQuickClaim(e, task)}
              className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-orange hover:text-white border border-zinc-200 text-[10px] font-sans font-medium text-zinc-600 transition-all cursor-pointer"
              title="Assign this task to yourself"
            >
              + Claim
            </button>
          )}
        </div>

        {/* Due Date badge */}
        <div>
          {dueInfo ? (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-sans ${dueInfo.className}`}
            >
              {dueInfo.isOverdue && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />}
              {dueInfo.text}
            </span>
          ) : (
            <span className="text-[11px] font-sans text-zinc-400 italic">No deadline</span>
          )}
        </div>
      </div>

      {/* Quick Move Status Controls & Open Details / More Menu */}
      <div className="pt-2.5 border-t border-jet-black/5 flex items-center justify-between">
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {colId !== 'todo' && (
            <button
              type="button"
              disabled={!canManage}
              onClick={(e) => {
                const prevIdx = STATUS_COLUMNS.findIndex((c) => c.id === colId) - 1;
                if (prevIdx >= 0) onMoveStatus(e, task.id, STATUS_COLUMNS[prevIdx].id);
              }}
              title="Move back"
              className="px-2 py-1 text-xs font-sans font-medium bg-white hover:bg-zinc-100 rounded-lg border border-zinc-200 text-zinc-600 cursor-pointer transition-colors disabled:opacity-40"
            >
              ←
            </button>
          )}
          {colId !== 'done' && (
            <button
              type="button"
              disabled={!canManage}
              onClick={(e) => {
                const nextIdx = STATUS_COLUMNS.findIndex((c) => c.id === colId) + 1;
                if (nextIdx < STATUS_COLUMNS.length) onMoveStatus(e, task.id, STATUS_COLUMNS[nextIdx].id);
              }}
              title="Move forward"
              className="px-2.5 py-1 text-xs font-sans font-medium border border-zinc-300 hover:border-orange hover:bg-orange/10 hover:text-orange text-zinc-700 bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-40"
            >
              Advance →
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {showLogLink && (
            <Link
              href={`/log?team=${task.teamId}&task=${encodeURIComponent(task.title)}`}
              className="text-xs font-sans px-2 py-1 rounded-lg border border-orange/40 text-orange hover:bg-orange hover:text-white transition-all font-semibold"
            >
              Log
            </Link>
          )}

          <button
            type="button"
            onClick={() => onOpenDetail(task)}
            className="text-xs font-sans text-zinc-500 hover:text-orange font-semibold transition-colors px-1.5 py-1 cursor-pointer"
          >
            Details ↗
          </button>

          {canManage && onRequestDelete && setCardMenuTaskId && (
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCardMenuTaskId(cardMenuTaskId === task.id ? null : task.id);
                }}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 transition-colors text-xs cursor-pointer font-bold"
                title="Task options"
              >
                ···
              </button>

              {cardMenuTaskId === task.id && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCardMenuTaskId(null);
                    }}
                  />
                  <div className="absolute right-0 bottom-full mb-1 w-40 bg-white border border-zinc-200 rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCardMenuTaskId(null);
                        onRequestDelete(task);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <span>🗑</span>
                      <span>Delete Task...</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
