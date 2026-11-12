"use client";

import React, { useState, useMemo } from 'react';
import { TEAMS, TEAMS_LIST } from '@/lib/teams';
import { ROSTER_MEMBERS } from '@/lib/members';
import { Task, WorkLog, TeamId } from '@/lib/types';
import { DashboardTab } from '@/types/dashboard';

interface VelocityMetricsTabProps {
  tasks: Task[];
  logs: WorkLog[];
  handleManualSync: () => void;
  isManualSyncing: boolean;
  handleOpenTaskDetail: (task: Task) => void;
  setSelectedSubsystemFilter: (filter: string) => void;
  setActiveTab: (tab: DashboardTab) => void;
}

export default function VelocityMetricsTab({
  tasks,
  logs,
  handleManualSync,
  isManualSyncing,
  handleOpenTaskDetail,
  setSelectedSubsystemFilter,
  setActiveTab,
}: VelocityMetricsTabProps) {
  const [leaderboardSquadFilter, setLeaderboardSquadFilter] = useState<string>('all');
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');

  const totalHours = useMemo(() => {
    return logs.reduce((acc, curr) => acc + (curr.hoursSpent || 0), 0);
  }, [logs]);

  const completedTasks = useMemo(() => {
    return tasks.filter((t) => t.status === 'done').length;
  }, [tasks]);

  const inProgressTasks = useMemo(() => {
    return tasks.filter((t) => t.status === 'in_progress' || t.status === 'review').length;
  }, [tasks]);

  const blockedRadarTasks = useMemo(() => {
    return tasks.filter((t) => t.isBlocked && t.status !== 'done');
  }, [tasks]);

  // Squad Subsystem Velocity Matrix
  const squadMetrics = useMemo(() => {
    return TEAMS_LIST.map((team) => {
      const squadTasks = tasks.filter((t) => t.teamId === team.id);
      const doneTasks = squadTasks.filter((t) => t.status === 'done').length;
      const activeTasks = squadTasks.filter((t) => t.status === 'in_progress' || t.status === 'review').length;
      const blockedTasks = squadTasks.filter((t) => t.isBlocked).length;

      const squadLogs = logs.filter((l) => l.teamId === team.id);
      const squadHours = Number(squadLogs.reduce((acc, curr) => acc + (curr.hoursSpent || 0), 0).toFixed(1));
      const completionPercent = squadTasks.length > 0 ? Math.round((doneTasks / squadTasks.length) * 100) : 0;
      const lead = ROSTER_MEMBERS.find((m) => m.teamId === team.id && m.isLead);

      return {
        team,
        lead,
        totalTasks: squadTasks.length,
        doneTasks,
        inProgressTasks: activeTasks,
        blockedTasks,
        squadHours,
        completionPercent,
        logsCount: squadLogs.length,
      };
    }).sort((a, b) => b.completionPercent - a.completionPercent);
  }, [tasks, logs]);

  // Member Metrics
  const memberMetrics = useMemo(() => {
    return ROSTER_MEMBERS.map((member) => {
      const memberNameLower = member.name.toLowerCase();
      const memberLogs = logs.filter((l) => {
        const authorLower = (l.authorName || '').toLowerCase();
        return authorLower.includes(memberNameLower) || memberNameLower.includes(authorLower);
      });

      const memberHours = memberLogs.reduce((acc, curr) => acc + (curr.hoursSpent || 0), 0);
      const memberTasks = tasks.filter((t) => {
        if (!t.assignedMembers || t.assignedMembers.length === 0) return false;
        return t.assignedMembers.some((am) => {
          const amLower = am.toLowerCase();
          return amLower.includes(memberNameLower) || memberNameLower.includes(amLower) || am === member.id;
        });
      });

      const completedTasksCount = memberTasks.filter((t) => t.status === 'done').length;
      const activeTasksCount = memberTasks.filter((t) => t.status === 'in_progress' || t.status === 'review').length;

      let subtasksDoneCount = 0;
      memberTasks.forEach((t) => {
        if (t.subtasks) {
          subtasksDoneCount += t.subtasks.filter((st) => st.completed).length;
        }
      });

      const velocityScore = Math.round(
        memberHours * 10 + completedTasksCount * 15 + activeTasksCount * 5 + subtasksDoneCount * 2
      );

      return {
        member,
        totalHours: Number(memberHours.toFixed(1)),
        logsCount: memberLogs.length,
        completedTasksCount,
        activeTasksCount,
        subtasksDoneCount,
        velocityScore,
      };
    }).sort((a, b) => {
      if (b.velocityScore !== a.velocityScore) return b.velocityScore - a.velocityScore;
      if (b.totalHours !== a.totalHours) return b.totalHours - a.totalHours;
      return b.completedTasksCount - a.completedTasksCount;
    });
  }, [logs, tasks]);

  const filteredMemberMetrics = useMemo(() => {
    return memberMetrics.filter((item) => {
      if (leaderboardSquadFilter !== 'all' && item.member.teamId !== leaderboardSquadFilter) {
        return false;
      }
      if (memberSearchQuery.trim()) {
        const q = memberSearchQuery.toLowerCase();
        const matchName = item.member.name.toLowerCase().includes(q);
        const matchRole = item.member.role.toLowerCase().includes(q);
        if (!matchName && !matchRole) return false;
      }
      return true;
    });
  }, [memberMetrics, leaderboardSquadFilter, memberSearchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="bg-white border border-jet-black/10 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse" />
              <span className="text-[11px] font-mono uppercase tracking-widest text-grey font-bold">
                Team Velocity &amp; Accountability
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-jet-black tracking-tight mt-1">
              Engineering Contribution Leaderboard<span className="text-orange">.</span>
            </h3>
            <p className="text-xs sm:text-sm text-grey font-light mt-0.5">
              Real-time performance metrics across all 23 team innovators and 9 engineering subsystems for SIEP 2026–27.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleManualSync}
              disabled={isManualSyncing}
              className="px-3.5 py-2 rounded-xl border border-jet-black/15 bg-alice-blue/60 hover:bg-alice-blue text-jet-black text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isManualSyncing ? 'Syncing...' : 'Refresh Metrics'}</span>
            </button>
          </div>
        </div>

        {/* 4-Stat Metric Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-jet-black/5">
          <div className="p-3.5 rounded-xl bg-alice-blue/40 border border-jet-black/5">
            <div className="text-[10px] font-mono uppercase text-grey font-bold">Workshop Hours</div>
            <div className="text-2xl font-black font-mono text-jet-black mt-1">
              {totalHours.toFixed(1)} <span className="text-xs font-bold text-grey">hrs</span>
            </div>
            <div className="text-[10px] font-mono text-grey mt-0.5">{logs.length} build steps logged</div>
          </div>

          <div className="p-3.5 rounded-xl bg-alice-blue/40 border border-jet-black/5">
            <div className="text-[10px] font-mono uppercase text-grey font-bold">Overall Progress</div>
            <div className="text-2xl font-black font-mono text-emerald-600 mt-1">
              {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
            </div>
            <div className="text-[10px] font-mono text-grey mt-0.5">
              {completedTasks} of {tasks.length} deliverables
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-alice-blue/40 border border-jet-black/5">
            <div className="text-[10px] font-mono uppercase text-grey font-bold">Active Pipeline</div>
            <div className="text-2xl font-black font-mono text-orange mt-1">{inProgressTasks}</div>
            <div className="text-[10px] font-mono text-grey mt-0.5">in progress or review</div>
          </div>

          <div className="p-3.5 rounded-xl bg-alice-blue/40 border border-jet-black/5">
            <div className="text-[10px] font-mono uppercase text-grey font-bold">Blocker Radar</div>
            <div
              className={`text-2xl font-black font-mono mt-1 ${
                blockedRadarTasks.length > 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {blockedRadarTasks.length}
            </div>
            <div className="text-[10px] font-mono text-grey mt-0.5">
              {blockedRadarTasks.length === 0 ? 'All subsystems clear' : 'Attention required'}
            </div>
          </div>
        </div>
      </div>

      {/* Blocker Radar Section */}
      {blockedRadarTasks.length > 0 ? (
        <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-rose-800">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
              <h4 className="text-sm font-mono font-bold uppercase tracking-wider">
                Active Blocker Radar ({blockedRadarTasks.length})
              </h4>
            </div>
            <span className="text-[10px] font-mono text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-bold">
              Action Required
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {blockedRadarTasks.map((bt) => {
              const btTeam = TEAMS[bt.teamId];
              return (
                <div
                  key={bt.id}
                  onClick={() => handleOpenTaskDetail(bt)}
                  className="bg-white border border-rose-200 hover:border-rose-400 rounded-xl p-3.5 shadow-2xs hover:shadow-sm cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                        btTeam?.badgeBg || 'bg-jet-black/5 text-jet-black'
                      }`}
                    >
                      [{btTeam?.code}] {btTeam?.shortName}
                    </span>
                    <span className="text-[10px] font-mono text-rose-600 font-bold">
                      Resolve Blocker ↗
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-jet-black">{bt.title}</h5>
                  {bt.blockerReason && (
                    <div className="p-2 rounded-lg bg-rose-50 border border-rose-100 text-[11px] font-mono text-rose-800">
                      <strong>Reason:</strong> {bt.blockerReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 text-emerald-900 text-xs font-mono shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              <strong>Blocker Radar Clear:</strong> All 9 engineering subsystems are running without active impediments.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
            0 BLOCKED
          </span>
        </div>
      )}

      {/* Subsystem Squad Velocity Matrix */}
      <div className="bg-white border border-jet-black/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-jet-black/10">
          <div>
            <h4 className="text-base font-bold text-jet-black tracking-tight">
              Subsystem Velocity Matrix
            </h4>
            <p className="text-xs text-grey font-mono mt-0.5">
              Completion rate and deliverables status across all 9 technical squads
            </p>
          </div>
          <span className="text-xs font-mono text-grey">Sorted by completion velocity</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {squadMetrics.map((sq) => (
            <div
              key={sq.team.id}
              className="p-4 rounded-xl border border-jet-black/10 bg-alice-blue/20 hover:bg-white hover:border-orange/50 transition-all shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${sq.team.badgeBg}`}>
                    [{sq.team.code}]
                  </span>
                  <span className="text-xs font-bold text-jet-black truncate">{sq.team.shortName}</span>
                </div>
                <span className="text-xs font-mono font-black text-jet-black">{sq.completionPercent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-jet-black/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${sq.completionPercent}%` }}
                />
              </div>

              {/* Details row */}
              <div className="flex items-center justify-between text-[10px] font-mono text-grey pt-1">
                <div>
                  <span className="text-emerald-700 font-bold">{sq.doneTasks} done</span>
                  <span className="mx-1">•</span>
                  <span>{sq.inProgressTasks} active</span>
                  {sq.blockedTasks > 0 && (
                    <>
                      <span className="mx-1">•</span>
                      <span className="text-rose-600 font-bold">{sq.blockedTasks} blocked</span>
                    </>
                  )}
                </div>
                <div className="font-bold text-jet-black">{sq.squadHours} hrs</div>
              </div>

              <div className="pt-2 border-t border-jet-black/5 flex items-center justify-between text-[10px] font-mono">
                <span className="text-grey truncate">
                  Lead: <strong className="text-jet-black">{sq.lead?.name || 'Assigned'}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubsystemFilter(sq.team.id);
                    setActiveTab('team_tasks');
                  }}
                  className="text-orange hover:text-jet-black font-bold cursor-pointer"
                >
                  View Tasks &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Member Contribution Leaderboard */}
      <div className="bg-white border border-jet-black/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-jet-black/10">
          <div>
            <h4 className="text-base sm:text-lg font-bold text-jet-black tracking-tight">
              Member Contribution Leaderboard
            </h4>
            <p className="text-xs text-grey font-mono mt-0.5">
              Rankings based on logged workshop hours, completed deliverables, and active checklist moves
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              placeholder="Search innovator..."
              className="px-3 py-1.5 rounded-xl border border-jet-black/15 bg-alice-blue/40 text-xs font-mono focus:outline-none focus:border-orange w-36 sm:w-44"
            />

            <select
              value={leaderboardSquadFilter}
              onChange={(e) => setLeaderboardSquadFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-jet-black/15 bg-alice-blue/40 text-xs font-mono focus:outline-none focus:border-orange cursor-pointer"
            >
              <option value="all">All Squads ({ROSTER_MEMBERS.length})</option>
              {TEAMS_LIST.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  [{tm.code}] {tm.shortName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Leaderboard Table / Cards */}
        <div className="space-y-2">
          {filteredMemberMetrics.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-grey">
              No team innovators match the current filter.
            </div>
          ) : (
            filteredMemberMetrics.map((item, index) => {
              const memberTeam = TEAMS[item.member.teamId];
              const isTop1 = index === 0 && item.velocityScore > 0;
              const isTop2 = index === 1 && item.velocityScore > 0;
              const isTop3 = index === 2 && item.velocityScore > 0;
              const rankBadge = isTop1 ? '#1' : isTop2 ? '#2' : isTop3 ? '#3' : `#${index + 1}`;

              return (
                <div
                  key={item.member.id}
                  className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isTop1
                      ? 'bg-amber-500/10 border-amber-500/30 shadow-2xs'
                      : isTop2
                      ? 'bg-slate-100/70 border-slate-300'
                      : isTop3
                      ? 'bg-amber-700/5 border-amber-700/20'
                      : 'bg-alice-blue/20 border-jet-black/10 hover:bg-white'
                  }`}
                >
                  {/* Member Identity */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-xl font-mono text-xs font-black flex items-center justify-center shrink-0 ${
                        isTop1
                          ? 'bg-amber-500 text-white shadow-sm'
                          : isTop2
                          ? 'bg-slate-400 text-white shadow-sm'
                          : isTop3
                          ? 'bg-amber-700 text-white shadow-sm'
                          : 'bg-jet-black/5 text-jet-black'
                      }`}
                    >
                      {rankBadge}
                    </span>

                    <div className="w-9 h-9 rounded-full bg-jet-black text-alice-blue font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {item.member.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-jet-black">{item.member.name}</h5>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold border ${memberTeam?.badgeBg}`}
                        >
                          [{memberTeam?.code || item.member.teamId.toUpperCase()}]
                        </span>
                        {item.member.isLead && (
                          <span className="text-[9px] font-mono text-orange font-bold uppercase">Lead</span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-grey truncate max-w-xs sm:max-w-sm">
                        {item.member.role}
                      </p>
                    </div>
                  </div>

                  {/* Metrics Breakdown */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-jet-black/5 text-xs font-mono">
                    <div className="text-center sm:text-right">
                      <span className="text-[10px] text-grey uppercase block">Workshop</span>
                      <strong className="text-jet-black font-black text-sm">{item.totalHours} hrs</strong>
                    </div>

                    <div className="text-center sm:text-right">
                      <span className="text-[10px] text-grey uppercase block">Done</span>
                      <strong className="text-emerald-600 font-black text-sm">{item.completedTasksCount}</strong>
                    </div>

                    <div className="text-center sm:text-right">
                      <span className="text-[10px] text-grey uppercase block">Active</span>
                      <strong className="text-orange font-black text-sm">{item.activeTasksCount}</strong>
                    </div>

                    <div className="text-center sm:text-right">
                      <span className="text-[10px] text-grey uppercase block">Score</span>
                      <span className="px-2 py-0.5 rounded-full bg-jet-black text-alice-blue font-bold text-xs shadow-2xs">
                        {item.velocityScore}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
