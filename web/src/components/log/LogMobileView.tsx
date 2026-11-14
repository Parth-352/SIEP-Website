import React from 'react';
import Link from 'next/link';
import { WorkLog, LogWorkStatus } from '@/lib/types';
import { TEAMS_LIST } from '@/lib/teams';
import { getDomainBadge, formatLogDate, WORK_STATUS_CONFIG, getLogWorkStatus } from './logConfig';
import { getEmbeddableVideoUrl } from '@/lib/driveUpload';

interface LogMobileViewProps {
  canCreateBuildLog: boolean;
  onOpenAddLog: () => void;
  selectedTeamFilter: string;
  setSelectedTeamFilter: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  mobileStatusFilter: 'all' | LogWorkStatus;
  setMobileStatusFilter: (val: 'all' | LogWorkStatus) => void;
  statusCounts: Record<LogWorkStatus, number>;
  loadingLogs: boolean;
  visibleMobileLogs: WorkLog[];
  onSelectLog: (log: WorkLog) => void;
}

export default function LogMobileView({
  canCreateBuildLog,
  onOpenAddLog,
  selectedTeamFilter,
  setSelectedTeamFilter,
  searchQuery,
  setSearchQuery,
  mobileStatusFilter,
  setMobileStatusFilter,
  statusCounts,
  loadingLogs,
  visibleMobileLogs,
  onSelectLog,
}: LogMobileViewProps) {
  return (
    <div className="md:hidden space-y-4 max-w-lg mx-auto">
      {/* 1. Mobile Hero Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-orange/5 to-white border border-amber-200/60 p-5 shadow-xs">
        {/* Motorcycle Silhouette Watermark */}
        <svg className="absolute -right-2 -bottom-2 w-44 h-28 text-orange/15 pointer-events-none" viewBox="0 0 100 60" fill="currentColor">
          <circle cx="20" cy="42" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
          <circle cx="80" cy="42" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
          <path d="M20 42 L42 42 L55 24 L35 24 Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
          <path d="M42 42 L65 24 L80 42" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
          <path d="M55 24 L72 14 L78 14" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
          <path d="M45 18 L60 18" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        </svg>

        <div className="relative z-10 flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-orange shrink-0 mt-0.5 shadow-2xs">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="space-y-1 min-w-0 pr-12">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-zinc-500 block">
              SIEP 2026–27
            </span>
            <h2 className="text-xl font-black font-sans text-jet-black tracking-tight leading-tight">
              Build Log
            </h2>
            <p className="text-xs font-sans text-zinc-500 leading-relaxed">
              Record team work, tests and progress with photos or videos.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Prominent "+ Add Build Log" Button (Gated to Leads & Core Only) */}
      {canCreateBuildLog ? (
        <button
          type="button"
          onClick={onOpenAddLog}
          className="w-full py-3.5 px-5 rounded-2xl bg-[#1e232d] hover:bg-jet-black text-white font-sans font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          <span>Add Build Log</span>
        </button>
      ) : (
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
          <p className="text-xs font-bold text-slate-700">Official Build Logs Gated</p>
          <p className="text-[11px] text-slate-500">
            Build logs are published by Squad Leads &amp; Core Leadership. To submit technical research and reports, use{' '}
            <Link href="/materials" className="text-orange font-bold hover:underline">Materials &rarr;</Link>
          </p>
        </div>
      )}

      {/* 3. Five Work Status Tiles / Metric Cards (Responsive Grid Layout - Zero Horizontal Scroll) */}
      <div className="grid grid-cols-6 sm:grid-cols-5 gap-2">
        {(['in_progress', 'testing', 'completed', 'on_hold', 'review'] as LogWorkStatus[]).map((st, idx) => {
          const cfg = WORK_STATUS_CONFIG[st];
          const count = statusCounts[st] || 0;
          const isSelected = mobileStatusFilter === st;
          const colSpan = idx < 3 ? 'col-span-2 sm:col-span-1' : 'col-span-3 sm:col-span-1';

          return (
            <button
              key={st}
              type="button"
              onClick={() => setMobileStatusFilter(isSelected ? 'all' : st)}
              className={`${colSpan} bg-white border rounded-2xl p-2.5 shadow-2xs flex flex-col justify-between cursor-pointer transition-all active:scale-95 text-left min-w-0 ${
                isSelected
                  ? 'border-orange ring-2 ring-orange/30 bg-orange/5'
                  : 'border-jet-black/10 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cfg.tileIconBg} ${cfg.tileIconColor}`}>
                  {cfg.icon}
                </div>
                <div className="text-base font-black font-sans text-jet-black tabular-nums leading-none">
                  {count}
                </div>
              </div>
              <div className={`text-[11px] font-sans font-medium truncate mt-2 ${isSelected ? 'text-orange font-bold' : 'text-zinc-500'}`}>
                {cfg.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Section Header: Recent Logs & Team Selector Dropdown */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <h3 className="text-lg font-bold font-sans text-jet-black tracking-tight">
          Recent Logs
        </h3>

        {/* Team selection through one dropdown per PRD */}
        <div className="relative">
          <select
            value={selectedTeamFilter}
            onChange={(e) => setSelectedTeamFilter(e.target.value)}
            className="appearance-none bg-white border border-jet-black/15 text-jet-black text-xs font-sans font-bold py-1.5 pl-3 pr-7 rounded-xl shadow-2xs focus:ring-2 focus:ring-orange focus:outline-none cursor-pointer"
          >
            <option value="all">All Teams</option>
            {TEAMS_LIST.map((t) => (
              <option key={t.id} value={t.id}>
                {t.shortName}
              </option>
            ))}
          </select>
          <svg className="w-3.5 h-3.5 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* 5. Search & Status Filter Chips Together */}
      <div className="space-y-2">
        {/* Search Input */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search logs (title, description, member)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 rounded-xl border border-jet-black/15 bg-white text-xs font-sans text-jet-black placeholder:text-zinc-400 focus:ring-2 focus:ring-orange focus:outline-none shadow-2xs transition-all"
          />
          <svg className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-jet-black text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Chips Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
          <button
            type="button"
            onClick={() => setMobileStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold whitespace-nowrap cursor-pointer transition-all ${
              mobileStatusFilter === 'all'
                ? 'bg-jet-black text-white shadow-2xs'
                : 'bg-white border border-jet-black/10 text-zinc-600 hover:text-jet-black'
            }`}
          >
            All
          </button>
          {(['in_progress', 'testing', 'completed', 'on_hold', 'review'] as LogWorkStatus[]).map((st) => {
            const cfg = WORK_STATUS_CONFIG[st];
            const isSelected = mobileStatusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setMobileStatusFilter(isSelected ? 'all' : st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-jet-black text-white shadow-2xs'
                    : 'bg-white border border-jet-black/10 text-zinc-600 hover:text-jet-black'
                }`}
              >
                <span>{cfg.filterLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Chronological Activity Feed with Video Previews */}
      <div className="space-y-3 pt-1">
        {loadingLogs ? (
          <div className="bg-white border border-jet-black/10 rounded-2xl p-8 text-center text-xs font-mono text-zinc-400">
            Loading chronological activity feed...
          </div>
        ) : visibleMobileLogs.length === 0 ? (
          <div className="bg-white border border-jet-black/10 rounded-2xl p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-sm font-sans font-bold text-jet-black">No build logs match</p>
            <p className="text-xs font-sans text-zinc-500">Try adjusting your squad or work status filters.</p>
          </div>
        ) : (
          <div className="relative pl-4 space-y-3">
            {/* Timeline Track Guide */}
            <div className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-orange/40 via-zinc-200 to-transparent pointer-events-none" />

            {visibleMobileLogs.map((log) => {
              const statusKey = getLogWorkStatus(log);
              const statusCfg = WORK_STATUS_CONFIG[statusKey];
              const domainBadge = getDomainBadge(log.teamId);
              const dateFormatted = formatLogDate(log.date || log.createdAt);

              // Auto-generate drive thumbnail or fallback poster
              let thumbUrl: string | null = null;
              if (log.videoUrl) {
                const fileMatch = log.videoUrl.match(/[-\w]{25,}/);
                if (fileMatch) {
                  thumbUrl = `https://lh3.googleusercontent.com/d/${fileMatch[0]}=w320`;
                }
              }

              return (
                <div key={log.id} className="relative flex items-center">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-orange ring-4 ring-white shadow-2xs z-10" />

                  {/* Compact Card */}
                  <div
                    onClick={() => onSelectLog(log)}
                    className="w-full bg-white border border-jet-black/10 hover:border-orange/60 rounded-2xl p-2.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3"
                  >
                    {/* Left: Thumbnail Preview */}
                    <div className="relative w-20 h-14 sm:w-24 sm:h-16 rounded-xl overflow-hidden bg-zinc-900 shrink-0 border border-black/10 flex items-center justify-center">
                      {thumbUrl ? (
                        <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 flex items-center justify-center relative">
                          <svg className="w-8 h-8 text-white/10" viewBox="0 0 100 60" fill="currentColor">
                            <circle cx="20" cy="42" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
                            <circle cx="80" cy="42" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
                            <path d="M20 42 L42 42 L55 24 L35 24 Z" fill="none" stroke="currentColor" strokeWidth="4" />
                          </svg>
                        </div>
                      )}
                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                        <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-xs flex items-center justify-center text-white shadow-xs">
                          <svg className="w-3 h-3 translate-x-0.5 fill-current" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      {/* Timestamp Pill */}
                      <span className="absolute bottom-1 right-1 px-1 py-0.2 bg-black/80 text-white text-[8px] font-mono rounded">
                        {log.workTime || 'VIDEO'}
                      </span>
                    </div>

                    {/* Middle: Title, Description, Domain, Status */}
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-sans font-bold text-jet-black truncate">
                        {log.stepTitle}
                      </h4>
                      <p className="text-xs text-zinc-500 font-sans truncate mt-0.5">
                        {log.description}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {/* Domain Short Code */}
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-sans font-black uppercase tracking-wider border shrink-0 ${domainBadge.bg}`}>
                          {domainBadge.code}
                        </span>
                        {/* Work Status Pill */}
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-sans font-bold flex items-center gap-1 shrink-0 ${statusCfg.badgeBg}`}>
                          {statusCfg.icon}
                          <span>{statusCfg.label}</span>
                        </span>
                      </div>
                    </div>

                    {/* Right: Date & Chevron */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-zinc-400 font-sans font-medium whitespace-nowrap">
                        {dateFormatted}
                      </span>
                      <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
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
