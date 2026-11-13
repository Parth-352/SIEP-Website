"use client";

import React, { useMemo } from 'react';
import Link from 'next/link';
import { TEAMS, TEAMS_LIST } from '@/lib/teams';
import { Task, WorkLog, TeamId } from '@/lib/types';
import { DashboardTab } from '@/types/dashboard';

import OperationsBanner from './OperationsBanner';
import StatCard from './StatCard';

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

interface SubsystemVisual {
  containerClass: string;
  icon: React.ReactNode;
}

function getSubsystemVisual(teamId: string): SubsystemVisual {
  switch (teamId) {
    case 'software':
    case 'telemetry':
      return {
        containerClass: 'bg-purple-50 text-purple-600 border border-purple-200/60',
        icon: (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
        ),
      };
    case 'mechanical':
    case 'chassis':
    case 'suspension':
    case 'brakes':
      return {
        containerClass: 'bg-zinc-100 text-zinc-700 border border-zinc-200/80',
        icon: (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      };
    case 'entc':
    case 'electronics':
    case 'powertrain':
    case 'battery':
      return {
        containerClass: 'bg-sky-50 text-sky-600 border border-sky-200/60',
        icon: (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
      };
    case 'documentation':
      return {
        containerClass: 'bg-amber-50 text-amber-600 border border-amber-200/60',
        icon: (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      };
    case 'design':
      return {
        containerClass: 'bg-pink-50 text-pink-600 border border-pink-200/60',
        icon: (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        ),
      };
    case 'research':
      return {
        containerClass: 'bg-cyan-50 text-cyan-600 border border-cyan-200/60',
        icon: (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        ),
      };
    case 'sponsorship':
      return {
        containerClass: 'bg-emerald-50 text-emerald-600 border border-emerald-200/60',
        icon: (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
      };
    case 'socialmedia':
    case 'marketing':
      return {
        containerClass: 'bg-rose-50 text-rose-600 border border-rose-200/60',
        icon: (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
        ),
      };
    case 'core':
    case 'safety':
      return {
        containerClass: 'bg-amber-50 text-amber-700 border border-amber-300/60',
        icon: (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
      };
    default:
      return {
        containerClass: 'bg-zinc-100 text-zinc-600 border border-zinc-200/60',
        icon: (
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
      };
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

          <div className="space-y-4 pt-1">
            {prioritizedTeams.slice(0, 5).map((team) => {
              const teamTasks = tasks.filter((t) => t.teamId === team.id);
              const completed = teamTasks.filter((t) => t.status === 'done').length;
              const total = teamTasks.length;
              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
              const visual = getSubsystemVisual(team.id);

              return (
                <div
                  key={team.id}
                  onClick={() => {
                    setSelectedSubsystemFilter(team.id);
                    setActiveTab('team_tasks');
                  }}
                  className="space-y-2 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Uniform SVG Icon Container */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${visual.containerClass}`}>
                        {visual.icon}
                      </div>
                      {/* Uniform Subsystem Name */}
                      <span className="text-sm font-bold font-sans text-jet-black group-hover:text-orange transition-colors truncate">
                        {team.shortName}
                      </span>
                    </div>
                    {/* Uniform Percentage Label */}
                    <span className="text-sm font-bold font-sans text-jet-black tabular-nums shrink-0">
                      {pct}%
                    </span>
                  </div>
                  {/* Uniform Calibrated Progress Bar */}
                  <div className="w-full h-2 bg-amber-100/70 rounded-full overflow-hidden">
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
          DESKTOP OPERATIONS DASHBOARD VIEW (Strictly matching Design Mockup 1)
          Visible on desktop screens (hidden md:block).
         ========================================================================= */}
      <div className="hidden md:block space-y-6">
        {/* Sleek Operations Hero Banner */}
        <OperationsBanner
          subtitle="PROJECT OPERATIONS"
          title="Dashboard"
          description="Monitor vehicle engineering progress, subsystem telemetry, and recent activities"
        />

        {/* 4 Stat Cards Grid Matching Mockup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Tasks"
            value={totalTasksCount}
            iconBg="bg-blue-50 text-blue-500 border-blue-100"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
            onClick={() => setActiveTab('team_tasks')}
          />

          <StatCard
            label="In Progress"
            value={tasks.filter((t) => t.status === 'in_progress' || t.status === 'review').length}
            iconBg="bg-amber-50 text-amber-500 border-amber-100"
            icon={
              <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            }
            onClick={() => setActiveTab('team_tasks')}
          />

          <StatCard
            label="Completed"
            value={completedTasksCount}
            iconBg="bg-emerald-50 text-emerald-500 border-emerald-100"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            }
            onClick={() => setActiveTab('team_tasks')}
          />

          <StatCard
            label="Overdue"
            value={overdueCount}
            iconBg="bg-rose-50 text-rose-500 border-rose-100"
            valueColor="text-rose-600 font-extrabold"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
            onClick={() => setActiveTab('team_tasks')}
          />
        </div>

        {/* Two Columns Grid: Team Progress & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Team Progress Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-sans">
                    Team Progress
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Completion across all engineering squads
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('teams')}
                className="text-xs font-semibold text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View Teams</span>
                <span className="text-sm font-normal">&rarr;</span>
              </button>
            </div>

            {/* Squads Progress Rows Computed from Real Tasks */}
            <div className="space-y-3 pt-1">
              {TEAMS_LIST.filter((t) => t.id !== 'core').map((squad) => {
                const squadTasks = tasks.filter((t) => t.teamId === squad.id);
                const squadCompleted = squadTasks.filter((t) => t.status === 'done').length;
                const squadTotal = squadTasks.length;
                const pct = squadTotal > 0 ? Math.round((squadCompleted / squadTotal) * 100) : 0;

                return (
                  <div
                    key={squad.id}
                    onClick={() => {
                      setSelectedSubsystemFilter(squad.id);
                      setActiveTab('team_tasks');
                    }}
                    className="flex items-center gap-3.5 hover:bg-slate-50/80 p-2 rounded-xl transition-colors cursor-pointer group"
                  >
                    {/* Squad Code Pill */}
                    <span className={`w-14 text-center py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border shrink-0 ${squad.badgeBg}`}>
                      {squad.code}
                    </span>

                    {/* Squad Name */}
                    <span className="text-xs font-semibold text-slate-800 font-sans w-36 sm:w-44 truncate shrink-0 group-hover:text-orange-600 transition-colors">
                      {squad.name}
                    </span>

                    {/* Orange Progress Bar */}
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Percentage */}
                    <span className="text-xs font-bold text-slate-900 font-sans w-10 text-right shrink-0">
                      {pct}%
                    </span>

                    {/* Fraction */}
                    <span className="text-xs text-slate-400 font-medium font-sans w-12 text-right shrink-0">
                      {squadCompleted} / {squadTotal}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Recent Activity Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-sans">
                    Recent Activity
                  </h3>
                  <p className="text-xs text-slate-500 font-sans">
                    Latest tasks, build logs and updates
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('siep_open_activity_drawer'));
                  }
                }}
                className="text-xs font-semibold text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <span className="text-sm font-normal">&rarr;</span>
              </button>
            </div>

            {/* Connected Timeline List Computed from Real Logs and Tasks */}
            {(() => {
              const realActivities = [
                ...logs.map((log) => ({
                  id: `log-${log.id}`,
                  title: log.stepTitle,
                  desc: log.description || `Build step completed for ${TEAMS[log.teamId]?.shortName || log.teamName}.`,
                  teamCode: TEAMS[log.teamId]?.code || 'LOG',
                  teamBadge: TEAMS[log.teamId]?.badgeBg || 'bg-amber-100 text-amber-800 border-amber-200',
                  status: log.status === 'completed' ? 'Completed' : log.status === 'testing' ? 'Testing' : 'In Progress',
                  statusClass: log.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200',
                  statusIcon: log.status === 'completed' ? (
                    <svg className="w-3 h-3 text-emerald-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-2.5 h-2.5 text-amber-600 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ),
                  time: getRelativeTime(log.createdAt),
                  rawTime: log.createdAt ? new Date(log.createdAt).getTime() : 0,
                  icon: (
                    <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  ),
                  iconBg: 'bg-amber-50 border-amber-200',
                })),
                ...tasks.map((task) => ({
                  id: `task-${task.id}`,
                  title: task.title,
                  desc: task.description || `Deliverable managed in ${TEAMS[task.teamId]?.shortName || task.teamId}.`,
                  teamCode: TEAMS[task.teamId]?.code || 'TASK',
                  teamBadge: TEAMS[task.teamId]?.badgeBg || 'bg-blue-100 text-blue-800 border-blue-200',
                  status: task.status === 'done' ? 'Completed' : task.status === 'review' ? 'Under Review' : task.status === 'in_progress' ? 'In Progress' : 'To Do',
                  statusClass: task.status === 'done' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : task.status === 'review' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-amber-50 text-amber-700 border-amber-200',
                  statusIcon: task.status === 'done' ? (
                    <svg className="w-3 h-3 text-emerald-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-2.5 h-2.5 text-amber-600 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  ),
                  time: getRelativeTime(task.createdAt || task.dueDate),
                  rawTime: task.createdAt ? new Date(task.createdAt).getTime() : 0,
                  icon: (
                    <svg className="w-4 h-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  ),
                  iconBg: 'bg-sky-50 border-sky-200',
                })),
              ]
                .sort((a, b) => b.rawTime - a.rawTime)
                .slice(0, 5);

              if (realActivities.length === 0) {
                return (
                  <div className="py-12 text-center text-xs text-slate-400 font-sans">
                    No recent activity recorded yet.
                  </div>
                );
              }

              return (
                <div className="relative pl-6 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-200">
                  {realActivities.map((item) => (
                    <div key={item.id} className="relative flex items-start gap-3.5 group">
                      {/* Circular Node Dot on the timeline */}
                      <span className="absolute -left-[19px] top-4 w-3.5 h-3.5 rounded-full bg-slate-900 ring-4 ring-white" />

                      {/* Icon squircle */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${item.iconBg}`}>
                        {item.icon}
                      </div>

                      {/* Item Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 font-sans group-hover:text-orange-600 transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-sans shrink-0">
                            {item.time}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 font-sans mt-0.5 line-clamp-1">
                          {item.desc}
                        </p>

                        {/* Meta Badges */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${item.teamBadge}`}>
                            {item.teamCode}
                          </span>

                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${item.statusClass}`}>
                            {item.statusIcon}
                            <span>{item.status}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
