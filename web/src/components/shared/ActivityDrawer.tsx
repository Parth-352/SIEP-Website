"use client";

import React from 'react';
import { TEAMS, TEAMS_LIST } from '@/lib/teams';
import { ActivityEvent, Task } from '@/lib/types';

interface ActivityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activities: ActivityEvent[];
  tasks: Task[];
  activitySubsystemFilter: string;
  setActivitySubsystemFilter: (filter: string) => void;
  onOpenTaskDetail: (task: Task) => void;
  onMarkRead: () => void;
}

export default function ActivityDrawer({
  isOpen,
  onClose,
  activities,
  tasks,
  activitySubsystemFilter,
  setActivitySubsystemFilter,
  onOpenTaskDetail,
  onMarkRead,
}: ActivityDrawerProps) {
  if (!isOpen) return null;

  const filteredActivities = activities.filter((act) => {
    if (activitySubsystemFilter !== 'all' && act.teamId !== activitySubsystemFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-[250] flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-jet-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-white border-l-2 border-jet-black/15 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-jet-black/10 bg-alice-blue/60 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse" />
              <h3 className="text-base font-black text-jet-black tracking-tight">
                Squad Moves &amp; Live Activity
              </h3>
            </div>
            <p className="text-[11px] font-mono text-grey mt-0.5">
              Real-time audit log across all 8 squads + Core
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-grey hover:text-jet-black hover:bg-jet-black/5 text-sm cursor-pointer"
            aria-label="Close activity feed"
          >
            ✕
          </button>
        </div>

        {/* Subsystem Filter Pills */}
        <div className="p-3 border-b border-jet-black/5 bg-white flex items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => setActivitySubsystemFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase transition-all cursor-pointer shrink-0 ${
              activitySubsystemFilter === 'all'
                ? 'bg-jet-black text-white'
                : 'bg-alice-blue/60 text-grey hover:text-jet-black'
            }`}
          >
            All Squads
          </button>
          {TEAMS_LIST.map((team) => (
            <button
              key={team.id}
              type="button"
              onClick={() => setActivitySubsystemFilter(team.id)}
              className={`px-2 py-1 rounded-lg font-bold text-[10px] uppercase transition-all cursor-pointer shrink-0 ${
                activitySubsystemFilter === team.id
                  ? 'bg-orange text-white'
                  : 'bg-alice-blue/60 text-grey hover:text-jet-black'
              }`}
            >
              [{team.code}]
            </button>
          ))}
        </div>

        {/* Activity Events List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-16 text-grey text-xs font-mono space-y-2">
              <div className="w-10 h-10 mx-auto rounded-xl bg-jet-black/5 text-jet-black flex items-center justify-center font-bold text-xs tracking-wider border border-jet-black/10">
                FEED
              </div>
              <p className="font-semibold text-jet-black">No recent moves found</p>
              <p className="text-[11px] text-grey/70">
                Activity events automatically stream in as members check off deliverables and log work.
              </p>
            </div>
          ) : (
            filteredActivities.map((act) => {
              const actTeam = TEAMS[act.teamId];
              const typeTagMap: Record<string, { label: string; color: string }> = {
                subtask_toggled: { label: 'CHECK', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                comment_added: { label: 'NOTE', color: 'bg-sky-50 text-sky-700 border-sky-200' },
                task_blocked: { label: 'BLOCKED', color: 'bg-red-50 text-red-700 border-red-200' },
                task_status: { label: 'STATUS', color: 'bg-purple-50 text-purple-700 border-purple-200' },
                task_created: { label: 'NEW', color: 'bg-orange/10 text-orange border-orange/20' },
                hours_logged: { label: 'HOURS', color: 'bg-amber-50 text-amber-700 border-amber-200' },
                log_submitted: { label: 'REPORT', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
              };
              const tag = typeTagMap[act.type] || {
                label: 'LOG',
                color: 'bg-alice-blue text-jet-black border-jet-black/10',
              };

              return (
                <div
                  key={act.id}
                  onClick={() => {
                    if (act.taskId) {
                      const target = tasks.find((t) => t.id === act.taskId);
                      if (target) {
                        onClose();
                        onOpenTaskDetail(target);
                      }
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition-all text-xs font-mono space-y-1.5 ${
                    act.taskId
                      ? 'bg-alice-blue/30 border-jet-black/5 hover:border-orange/50 hover:bg-white cursor-pointer shadow-2xs'
                      : 'bg-white border-jet-black/5'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold flex items-center gap-1.5">
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded border font-mono tracking-wider font-semibold ${tag.color}`}
                      >
                        {tag.label}
                      </span>
                      <span className="text-orange">[{actTeam?.code || act.teamId.toUpperCase()}]</span>
                      <span className="text-jet-black">{act.memberName}</span>
                    </span>
                    <span className="text-grey/70">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="pl-1 text-jet-black/90 font-medium">
                    {act.detail || act.title}
                  </div>

                  {act.title && act.detail !== act.title && (
                    <div className="pl-1 text-[10px] text-grey truncate">
                      Task: <strong>{act.title}</strong>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-jet-black/10 bg-alice-blue/30 flex items-center justify-between text-[11px] font-mono text-grey">
          <span>{filteredActivities.length} recent moves</span>
          <button
            type="button"
            onClick={onMarkRead}
            className="text-orange hover:text-jet-black font-bold cursor-pointer"
          >
            Mark Read
          </button>
        </div>
      </div>
    </div>
  );
}
