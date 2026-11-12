"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { TEAMS, TEAMS_LIST } from '@/lib/teams';
import { Task, WorkLog, TeamId } from '@/lib/types';
import { DashboardTab } from '@/types/dashboard';

interface DashboardOverviewTabProps {
  tasks: Task[];
  logs: WorkLog[];
  memberDomainIds: TeamId[];
  isCore: boolean;
  isLead: boolean;
  setActiveTab: (tab: DashboardTab) => void;
  setSelectedSubsystemFilter: (filter: string) => void;
}

function getRelativeTime(timestamp?: string | number): string {
  if (!timestamp) return 'recently';
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / (1000 * 60));
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getSubsystemSymbol(teamId: string): string {
  switch (teamId) {
    case 'telemetry':
    case 'software':
      return '</>';
    case 'chassis':
    case 'suspension':
    case 'brakes':
      return '⚙';
    case 'electronics':
    case 'powertrain':
    case 'battery':
      return '⚡';
    default:
      return '📄';
  }
}

export default function DashboardOverviewTab({
  tasks,
  logs,
  memberDomainIds,
  isCore,
  isLead,
  setActiveTab,
  setSelectedSubsystemFilter,
}: DashboardOverviewTabProps) {
  // Sort squads so that all domains assigned to the active user ([My Squad]) appear at the very top
  const prioritizedTeams = useMemo(() => {
    return [...TEAMS_LIST].sort((a, b) => {
      const aIsMySquad = memberDomainIds.includes(a.id);
      const bIsMySquad = memberDomainIds.includes(b.id);
      if (aIsMySquad && !bIsMySquad) return -1;
      if (!aIsMySquad && bIsMySquad) return 1;
      return 0;
    });
  }, [memberDomainIds]);

  // Real dynamic KPI calculations
  const totalTasksCount = tasks.length;
  const completedTasksCount = useMemo(() => tasks.filter((t) => t.status === 'done').length, [tasks]);
  const now = useMemo(() => Date.now(), []);
  const sevenDaysFromNow = useMemo(() => now + 7 * 24 * 60 * 60 * 1000, [now]);

  const dueSoonCount = useMemo(
    () =>
      tasks.filter((t) => {
        if (t.status === 'done' || !t.dueDate) return false;
        const due = new Date(t.dueDate).getTime();
        return due >= now && due <= sevenDaysFromNow;
      }).length,
    [tasks, now, sevenDaysFromNow]
  );

  const overdueCount = useMemo(
    () =>
      tasks.filter((t) => {
        if (t.status === 'done' || !t.dueDate) return false;
        const due = new Date(t.dueDate).getTime();
        return due < now;
      }).length,
    [tasks, now]
  );

  return (
    <div className="space-y-6">
      {/* =========================================================================
          MOBILE-FIRST DASHBOARD VIEW (Strictly matching PRD & Design Mockups 3 & 5)
          Visible on mobile viewports (md:hidden).
         ========================================================================= */}
      <div className="md:hidden space-y-4">
        {/* 1. Project Dashboard Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange/5 to-white border border-amber-200/60 p-5 shadow-xs">
          {/* Motorcycle Silhouette Watermark */}
          <svg className="absolute -right-3 -bottom-2 w-44 h-28 text-orange/15 pointer-events-none" viewBox="0 0 100 60" fill="currentColor">
            <circle cx="20" cy="42" r="14" fill="none" stroke="currentColor" strokeWidth="4"/>
            <circle cx="80" cy="42" r="14" fill="none" stroke="currentColor" strokeWidth="4"/>
            <path d="M20 42 L42 42 L55 24 L35 24 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
            <path d="M42 42 L65 24 L80 42" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/>
            <path d="M55 24 L72 14 L78 14" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            <path d="M45 18 L60 18" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
          </svg>

          <div className="relative z-10 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-zinc-500">
                Project Dashboard
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 text-[10px] font-sans font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            </div>
            <h2 className="text-xl font-black font-sans text-jet-black tracking-tight">
              SIEP E-Bike 2026–27
            </h2>
            <p className="text-xs font-sans text-zinc-500 leading-relaxed pr-16">
              Overall progress and project health at a glance.
            </p>
          </div>
        </div>

        {/* 2. 2x2 Project KPI Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Tile 1: Total Tasks */}
          <div
            onClick={() => setActiveTab('team_tasks')}
            className="bg-white border border-jet-black/10 rounded-2xl p-4 shadow-2xs space-y-2 cursor-pointer active:scale-98 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="text-2xl font-black font-sans text-jet-black tabular-nums">
                {totalTasksCount}
              </div>
              <div className="text-xs font-sans text-zinc-500 font-medium">
                Total Tasks
              </div>
            </div>
          </div>

          {/* Tile 2: Completed */}
          <div
            onClick={() => setActiveTab('team_tasks')}
            className="bg-white border border-jet-black/10 rounded-2xl p-4 shadow-2xs space-y-2 cursor-pointer active:scale-98 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-black font-sans text-jet-black tabular-nums">
                {completedTasksCount}
              </div>
              <div className="text-xs font-sans text-zinc-500 font-medium">
                Completed
              </div>
            </div>
          </div>

          {/* Tile 3: Due Soon */}
          <div
            onClick={() => setActiveTab('team_tasks')}
            className="bg-white border border-jet-black/10 rounded-2xl p-4 shadow-2xs space-y-2 cursor-pointer active:scale-98 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-orange/10 border border-orange/20 flex items-center justify-center text-orange">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-black font-sans text-jet-black tabular-nums">
                {dueSoonCount}
              </div>
              <div className="text-xs font-sans text-zinc-500 font-medium">
                Due Soon
              </div>
            </div>
          </div>

          {/* Tile 4: Overdue */}
          <div
            onClick={() => setActiveTab('team_tasks')}
            className="bg-white border border-jet-black/10 rounded-2xl p-4 shadow-2xs space-y-2 cursor-pointer active:scale-98 transition-transform"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-black font-sans text-jet-black tabular-nums">
                {overdueCount}
              </div>
              <div className="text-xs font-sans text-zinc-500 font-medium">
                Overdue
              </div>
            </div>
          </div>
        </div>

        {/* 3. Subsystem Progress Section */}
        <div className="bg-white border border-jet-black/10 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-base font-bold font-sans text-jet-black">
                Subsystem Progress
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('teams')}
              className="text-xs font-sans font-bold text-orange hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>

          <div className="space-y-3.5 pt-1">
            {prioritizedTeams.slice(0, 5).map((team) => {
              const teamTasks = tasks.filter((t) => t.teamId === team.id);
              const completed = teamTasks.filter((t) => t.status === 'done').length;
              const total = teamTasks.length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              const symbol = getSubsystemSymbol(team.id);

              return (
                <div
                  key={team.id}
                  onClick={() => {
                    setSelectedSubsystemFilter(team.id);
                    setActiveTab('team_tasks');
                  }}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <div className="flex items-center justify-between text-xs font-sans">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-alice-blue border border-jet-black/10 flex items-center justify-center text-xs font-mono font-bold text-zinc-700">
                        {symbol}
                      </span>
                      <span className="font-bold text-jet-black group-hover:text-orange transition-colors">
                        {team.shortName}
                      </span>
                    </div>
                    <span className="font-bold text-jet-black tabular-nums">
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 group-hover:bg-orange rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Recent Activity Section */}
        <div className="bg-white border border-jet-black/10 rounded-3xl p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <h3 className="text-base font-bold font-sans text-jet-black">
                  Recent Activity
                </h3>
              </div>
              <p className="text-xs font-sans text-zinc-400 mt-0.5">
                Latest build logs, submissions and updates.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('videos')}
              className="text-xs font-sans font-bold text-orange hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>View All</span>
              <span>→</span>
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-400 font-sans">
              No recent build updates recorded yet.
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 pt-1">
              {/* Timeline track line */}
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-zinc-200" />

              {logs.slice(0, 3).map((log) => {
                const logTeam = TEAMS[log.teamId];
                const relativeTime = getRelativeTime(log.createdAt);

                return (
                  <div key={log.id} className="relative flex items-start gap-3">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[19px] top-1.5 w-2.5 h-2.5 rounded-full bg-orange ring-4 ring-white" />

                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-orange shrink-0 mt-0.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-bold font-sans text-jet-black truncate">
                          Build Step Logged
                        </h4>
                        <span className="text-[11px] font-sans text-zinc-400 shrink-0">
                          {relativeTime}
                        </span>
                      </div>
                      <p className="text-xs font-sans text-zinc-500 truncate mt-0.5">
                        {log.stepTitle} &bull; {logTeam?.shortName || log.teamName}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          DESKTOP SUBSYSTEM & ACTIVITY VIEW (Desktop Layout Preserved 100%)
          Visible on desktop screens (hidden md:block).
         ========================================================================= */}
      <div className="hidden md:block space-y-6">
        {/* Subsystem Health & Velocity Overview */}
        <div className="bg-white border border-jet-black/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-jet-black/10 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-sans text-jet-black flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange" />
                Engineering Subsystems Velocity
              </h3>
              <p className="text-xs font-sans text-zinc-500 mt-0.5">
                Live delivery status across all 9 competition engineering squads
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('team_tasks')}
              className="px-3.5 py-1.5 rounded-xl bg-jet-black text-white hover:bg-orange text-xs font-sans font-semibold transition-all cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
            >
              <span>Open Team Board</span>
              <span>&rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {prioritizedTeams.map((team) => {
              const teamTasks = tasks.filter((t) => t.teamId === team.id);
              const completed = teamTasks.filter((t) => t.status === 'done').length;
              const total = teamTasks.length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              const isUserDomain = memberDomainIds.includes(team.id);

              return (
                <div
                  key={team.id}
                  onClick={() => {
                    setSelectedSubsystemFilter(team.id);
                    setActiveTab('team_tasks');
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                    isUserDomain
                      ? 'bg-orange/5 border-orange/30 hover:border-orange hover:shadow-sm'
                      : 'bg-alice-blue/40 border-jet-black/10 hover:border-zinc-300 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold border ${team.badgeBg}`}>
                        {team.code}
                      </span>
                      <h4 className="text-xs font-sans font-bold text-jet-black group-hover:text-orange transition-colors">
                        {team.shortName}
                      </h4>
                    </div>
                    {isUserDomain && (
                      <span className="text-[9px] font-sans font-bold px-1.5 py-0.2 rounded bg-orange text-white">
                        My Squad
                      </span>
                    )}
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="text-zinc-500">
                        {completed} / {total} done
                      </span>
                      <span className="font-bold text-jet-black font-sans">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-jet-black/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Live Team Build Logs & Evidence Stream */}
        <div className="bg-white border border-jet-black/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-jet-black/10 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-sans text-jet-black flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Recent Workshop Logs &amp; Evidence
              </h3>
              <p className="text-xs font-sans text-zinc-500 mt-0.5">
                Latest engineering steps, milestone testing, and Google Drive video proofs
              </p>
            </div>
            {(isCore || isLead) && (
              <Link
                href="/log"
                className="px-3.5 py-1.5 rounded-xl border border-orange text-orange hover:bg-orange hover:text-white text-xs font-sans font-semibold transition-all cursor-pointer self-start sm:self-auto flex items-center gap-1.5"
              >
                <span>+ Log Build Step</span>
              </Link>
            )}
          </div>

          {logs.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-400 font-sans">
              No workshop steps recorded yet. Build logs with video evidence will stream here.
            </div>
          ) : (
            <div className="space-y-2.5 divide-y divide-jet-black/5">
              {logs.slice(0, 6).map((log) => {
                const logTeam = TEAMS[log.teamId];
                return (
                  <div key={log.id} className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-jet-black text-white flex items-center justify-center text-xs font-mono font-bold shrink-0">
                        #{log.stepNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold border ${logTeam?.badgeBg || 'bg-zinc-100 text-zinc-700'}`}>
                            {logTeam?.shortName || log.teamName}
                          </span>
                          <h4 className="text-sm font-semibold text-jet-black font-sans">
                            {log.stepTitle}
                          </h4>
                        </div>
                        <p className="text-xs text-zinc-500 font-sans mt-0.5">
                          By <strong className="text-zinc-700 font-medium">{log.authorName}</strong> • {log.hoursSpent || 0} hrs logged
                          {log.createdAt && ` • ${new Date(log.createdAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {log.videoUrl && (
                        <a
                          href={log.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-orange/10 border border-orange/30 text-orange hover:bg-orange hover:text-white text-xs font-sans font-semibold transition-all inline-flex items-center gap-1.5"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Video</span>
                        </a>
                      )}
                      <Link
                        href={`/log?view=${log.id}`}
                        className="px-2.5 py-1 rounded-lg border border-zinc-200 hover:bg-zinc-100 text-zinc-600 text-xs font-sans font-medium transition-all"
                      >
                        Details &rarr;
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
