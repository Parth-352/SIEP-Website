"use client";

import React from 'react';
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

export default function DashboardOverviewTab({
  tasks,
  logs,
  memberDomainIds,
  isCore,
  isLead,
  setActiveTab,
  setSelectedSubsystemFilter,
}: DashboardOverviewTabProps) {
  return (
    <div className="space-y-6">
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
          {TEAMS_LIST.map((team) => {
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
  );
}
