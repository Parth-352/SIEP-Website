"use client";

import React from 'react';
import Link from 'next/link';
import { TEAMS_LIST } from '@/lib/teams';
import { Task, WorkLog, TeamId } from '@/lib/types';

interface SubsystemsTabProps {
  tasks: Task[];
  logs: WorkLog[];
  isCore: boolean;
  isLead: boolean;
  memberDomainIds?: TeamId[];
  handleOpenTaskDetail: (task: Task) => void;
  handleViewTeamTasksInKanban: (teamId: TeamId) => void;
}

export default function SubsystemsTab({
  tasks,
  logs,
  isCore,
  isLead,
  memberDomainIds = [],
  handleOpenTaskDetail,
  handleViewTeamTasksInKanban,
}: SubsystemsTabProps) {
  // Sort squads so that all domains assigned to the active user ([My Squad]) appear at the very top
  const prioritizedTeams = React.useMemo(() => {
    if (!memberDomainIds || memberDomainIds.length === 0) return TEAMS_LIST;
    return [...TEAMS_LIST].sort((a, b) => {
      const aIsMySquad = memberDomainIds.includes(a.id);
      const bIsMySquad = memberDomainIds.includes(b.id);
      if (aIsMySquad && !bIsMySquad) return -1;
      if (!aIsMySquad && bIsMySquad) return 1;
      return 0;
    });
  }, [memberDomainIds]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {prioritizedTeams.map((team) => {
        const teamTasks = tasks.filter((t) => t.teamId === team.id);
        const teamLogs = logs.filter((l) => l.teamId === team.id);
        const completedCount = teamTasks.filter((t) => t.status === 'done').length;
        const inProgressCount = teamTasks.filter((t) => t.status === 'in_progress').length;
        const hours = teamLogs.reduce((acc, l) => acc + (l.hoursSpent || 0), 0);
        const latestLog = teamLogs[0];
        const progressPct =
          teamTasks.length > 0 ? Math.round((completedCount / teamTasks.length) * 100) : 0;
        const isUserDomain = memberDomainIds.includes(team.id);

        return (
          <div
            key={team.id}
            className={`bg-white border rounded-2xl p-6 shadow-sm transition-all flex flex-col justify-between h-full ${
              isUserDomain
                ? 'border-orange/40 hover:border-orange bg-orange/2'
                : 'border-jet-black/10 hover:border-orange/50'
            }`}
          >
            <div className="space-y-4 flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 min-h-[52px]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-jet-black/5 text-jet-black font-bold">
                      {team.code}
                    </span>
                    <h4 className="text-base font-bold text-jet-black leading-tight">{team.name}</h4>
                  </div>
                  {team.lead && (
                    <span className="text-xs font-mono text-orange block mt-1 font-semibold">
                      Lead: {team.lead}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {isUserDomain && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold bg-orange text-white">
                      My Squad
                    </span>
                  )}
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold shrink-0 ${
                      team.role === 'admin' ? 'bg-orange/20 text-orange' : 'bg-jet-black/5 text-jet-black'
                    }`}
                  >
                    {team.role}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-grey">Deliverables Progress</span>
                  <span className="font-bold text-jet-black">{progressPct}%</span>
                </div>
                <div className="w-full h-2 bg-alice-blue rounded-full overflow-hidden border border-jet-black/5">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Stats bar */}
              <div className="grid grid-cols-4 gap-2 p-3 bg-alice-blue/60 rounded-xl text-center font-mono text-xs border border-jet-black/5">
                <div>
                  <div className="font-black text-jet-black text-sm">{teamTasks.length}</div>
                  <div className="text-[9px] text-grey uppercase tracking-wider">Total</div>
                </div>
                <div>
                  <div className="font-black text-orange text-sm">{inProgressCount}</div>
                  <div className="text-[9px] text-grey uppercase tracking-wider">Active</div>
                </div>
                <div>
                  <div className="font-black text-emerald-600 text-sm">{completedCount}</div>
                  <div className="text-[9px] text-grey uppercase tracking-wider">Done</div>
                </div>
                <div>
                  <div className="font-black text-jet-black text-sm">{hours.toFixed(0)}h</div>
                  <div className="text-[9px] text-grey uppercase tracking-wider">Hours</div>
                </div>
              </div>

              {/* Assigned Deliverables Section */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-grey block">
                  Assigned Deliverables:
                </span>
                {teamTasks.length > 0 ? (
                  <div className="space-y-1.5 h-[68px] overflow-y-auto pr-1">
                    {teamTasks.slice(0, 2).map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleOpenTaskDetail(t)}
                        className="w-full text-left p-2 rounded-lg bg-alice-blue/30 hover:bg-alice-blue border border-jet-black/5 text-xs font-mono text-jet-black truncate flex items-center justify-between cursor-pointer"
                      >
                        <span className="truncate">{t.title}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ml-1.5 shrink-0 bg-white border border-jet-black/10">
                          {t.status}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-grey/60 italic font-mono p-2 bg-alice-blue/20 rounded-xl border border-dashed border-jet-black/10 text-center h-[68px] flex items-center justify-center">
                    No active deliverables
                  </div>
                )}
              </div>

              {/* Latest Move Card */}
              {latestLog ? (
                <div className="p-3 bg-alice-blue/30 rounded-xl border border-jet-black/5 text-xs space-y-1 h-[58px] flex flex-col justify-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-grey block">
                    Latest Move ({latestLog.date}):
                  </span>
                  <span className="font-semibold text-jet-black line-clamp-1 block">
                    {latestLog.stepTitle}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-grey/60 italic font-mono p-3 bg-alice-blue/20 rounded-xl border border-dashed border-jet-black/10 text-center h-[58px] flex items-center justify-center">
                  No log entries recorded yet
                </div>
              )}
            </div>

            {/* Card Bottom Actions */}
            <div className="pt-4 border-t border-jet-black/5 flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={() => handleViewTeamTasksInKanban(team.id)}
                className="text-xs font-mono text-jet-black hover:text-orange font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <span>View Team Tasks</span>
                <span>→</span>
              </button>

              {isCore || isLead ? (
                <Link
                  href={`/log?team=${team.id}`}
                  className="text-xs font-mono text-orange hover:text-jet-black font-bold transition-colors inline-flex items-center gap-1"
                >
                  <span>Build Log</span>
                  <span>↗</span>
                </Link>
              ) : (
                <span className="text-[10px] font-mono uppercase text-grey">
                  Squad View
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
