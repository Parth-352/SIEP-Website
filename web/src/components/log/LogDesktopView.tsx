import React from 'react';
import { WorkLog } from '@/lib/types';
import OperationsBanner from '@/components/dashboard/OperationsBanner';
import StatCard from '@/components/dashboard/StatCard';
import LogMediaSidebar from './LogMediaSidebar';
import { getDomainBadge, formatLogDate, getLogWorkStatus } from './logConfig';

interface LogDesktopViewProps {
  logs: WorkLog[];
  desktopFilteredLogs: WorkLog[];
  desktopLogPill: 'all' | 'builds' | 'tests' | 'design' | 'analysis';
  setDesktopLogPill: (pill: 'all' | 'builds' | 'tests' | 'design' | 'analysis') => void;
  desktopLogSearch: string;
  setDesktopLogSearch: (val: string) => void;
  desktopLogTimeFilter: 'all' | '24h' | '7d' | '30d';
  setDesktopLogTimeFilter: (val: 'all' | '24h' | '7d' | '30d') => void;
  desktopLogPage: number;
  setDesktopLogPage: React.Dispatch<React.SetStateAction<number>>;
  canCreateBuildLog: boolean;
  onOpenAddLog: () => void;
  onSelectLog: (log: WorkLog) => void;
  onOpenNewBuildLog: () => void;
  onOpenNewTestLog: () => void;
  onOpenUploadMedia: () => void;
}

export default function LogDesktopView({
  logs,
  desktopFilteredLogs,
  desktopLogPill,
  setDesktopLogPill,
  desktopLogSearch,
  setDesktopLogSearch,
  desktopLogTimeFilter,
  setDesktopLogTimeFilter,
  desktopLogPage,
  setDesktopLogPage,
  canCreateBuildLog,
  onOpenAddLog,
  onSelectLog,
  onOpenNewBuildLog,
  onOpenNewTestLog,
  onOpenUploadMedia,
}: LogDesktopViewProps) {
  return (
    <div className="hidden md:block space-y-6">
      {/* Operations Hero Banner matching Mockup 3 */}
      <OperationsBanner
        subtitle="PROJECT OPERATIONS"
        title="Build Log"
        description="Track builds, experiments, tests and major progress"
        action={
          canCreateBuildLog
            ? {
                label: '+ Add Log',
                onClick: onOpenAddLog,
              }
            : undefined
        }
      />

      {/* 4 Stat Cards in a Row Matching Mockup 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Logs"
          value={logs.length}
          iconBg="bg-blue-50 text-blue-600 border-blue-100"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />

        <StatCard
          label="Builds"
          value={
            logs.filter((l) => {
              const txt = `${l.stepTitle || ''} ${l.description || ''}`.toLowerCase();
              return txt.includes('build') || txt.includes('weld') || txt.includes('fab') || l.status === 'completed';
            }).length
          }
          iconBg="bg-amber-50 text-amber-600 border-amber-100"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />

        <StatCard
          label="Tests"
          value={
            logs.filter((l) => {
              const txt = `${l.stepTitle || ''} ${l.description || ''}`.toLowerCase();
              return txt.includes('test') || txt.includes('dyno') || txt.includes('bench') || l.status === 'testing';
            }).length
          }
          iconBg="bg-purple-50 text-purple-600 border-purple-100"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          }
        />

        <StatCard
          label="Validated"
          value={
            logs.filter((l) => Boolean(l.videoUrl || l.status === 'completed')).length
          }
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Main 2-Column Content Grid (2/3 Left Column, 1/3 Right Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Filter Bar + Table */}
        <div className="lg:col-span-2 space-y-4">
          {/* Standalone Filter Bar Card matching Tasks and Teams exactly */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            {/* Category Pill Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
              {[
                { id: 'all', label: 'All Logs', count: logs.length },
                {
                  id: 'builds',
                  label: 'Builds',
                  count: logs.filter((l) => {
                    const txt = `${l.stepTitle || ''} ${l.description || ''}`.toLowerCase();
                    return txt.includes('weld') || txt.includes('build') || txt.includes('fab') || l.status === 'completed';
                  }).length,
                },
                {
                  id: 'tests',
                  label: 'Tests',
                  count: logs.filter((l) => {
                    const txt = `${l.stepTitle || ''} ${l.description || ''}`.toLowerCase();
                    return txt.includes('test') || txt.includes('dyno') || l.status === 'testing';
                  }).length,
                },
                {
                  id: 'design',
                  label: 'Design',
                  count: logs.filter((l) => {
                    const txt = `${l.stepTitle || ''} ${l.description || ''}`.toLowerCase();
                    return txt.includes('cad') || txt.includes('design') || txt.includes('ui') || l.teamId === 'design' || l.teamId === 'software';
                  }).length,
                },
                {
                  id: 'analysis',
                  label: 'Analysis',
                  count: logs.filter((l) => {
                    const txt = `${l.stepTitle || ''} ${l.description || ''}`.toLowerCase();
                    return txt.includes('analysis') || txt.includes('fea') || l.teamId === 'research';
                  }).length,
                },
              ].map((tab) => {
                const isActive = desktopLogPill === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setDesktopLogPill(tab.id as any);
                      setDesktopLogPage(1);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                      isActive
                        ? 'bg-[#0e131f] text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Time Filter Controls */}
            <div className="flex items-center gap-3">
              {/* Search Input matching Tasks & Teams */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search build logs..."
                  value={desktopLogSearch}
                  onChange={(e) => {
                    setDesktopLogSearch(e.target.value);
                    setDesktopLogPage(1);
                  }}
                  className="w-56 lg:w-64 pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs font-sans text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
                />
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {desktopLogSearch && (
                  <button
                    type="button"
                    onClick={() => setDesktopLogSearch('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label="Clear build log search"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Time Range Filter Selector */}
              <div className="relative">
                <select
                  value={desktopLogTimeFilter}
                  onChange={(e) => {
                    setDesktopLogTimeFilter(e.target.value as any);
                    setDesktopLogPage(1);
                  }}
                  className="appearance-none pl-3 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs cursor-pointer"
                >
                  <option value="all">All Time</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
                <svg
                  className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Logs Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 pl-6 pr-3">Step ID</th>
                    <th className="py-3.5 px-3">Log / Step Title</th>
                    <th className="py-3.5 px-3">Type</th>
                    <th className="py-3.5 px-3">Subsystem</th>
                    <th className="py-3.5 px-3">Date</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 pr-6 pl-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    const startIdx = (desktopLogPage - 1) * 8;
                    const pageLogs = desktopFilteredLogs.slice(startIdx, startIdx + 8);

                    if (pageLogs.length === 0) {
                      return (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                            {logs.length === 0
                              ? "No build logs recorded yet. Click '+ Add Log' above to record the first build step."
                              : 'No build logs match the selected filter or search query.'}
                          </td>
                        </tr>
                      );
                    }

                    return pageLogs.map((log, idx) => {
                      const domainBadge = getDomainBadge(log.teamId);
                      const workStatus = getLogWorkStatus(log);

                      const logType = (() => {
                        const txt = `${log.stepTitle || ''} ${log.description || ''}`.toLowerCase();
                        if (txt.includes('test') || txt.includes('dyno') || workStatus === 'testing') {
                          return {
                            label: 'Test',
                            badge: 'bg-purple-50 text-purple-700 border-purple-200',
                            icon: (
                              <svg className="w-2.5 h-2.5 text-purple-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                              </svg>
                            ),
                          };
                        }
                        if (txt.includes('cad') || txt.includes('ui') || txt.includes('design')) {
                          return {
                            label: 'Design',
                            badge: 'bg-pink-50 text-pink-700 border-pink-200',
                            icon: (
                              <svg className="w-2.5 h-2.5 text-pink-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                              </svg>
                            ),
                          };
                        }
                        return {
                          label: 'Build',
                          badge: 'bg-slate-100 text-slate-700 border-slate-200',
                          icon: (
                            <svg className="w-2.5 h-2.5 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
                            </svg>
                          ),
                        };
                      })();

                      const statusBadge =
                        workStatus === 'completed'
                          ? {
                              label: 'Completed',
                              icon: (
                                <svg className="w-2.5 h-2.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              ),
                              class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                            }
                          : workStatus === 'review'
                          ? {
                              label: 'Under Review',
                              icon: (
                                <svg className="w-2.5 h-2.5 text-purple-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                </svg>
                              ),
                              class: 'bg-purple-50 text-purple-700 border-purple-200',
                            }
                          : {
                              label: 'In Progress',
                              icon: (
                                <svg className="w-2 h-2 text-amber-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              ),
                              class: 'bg-amber-50 text-amber-700 border-amber-200',
                            };

                      const logCode = `BL-${String(log.stepNumber || desktopFilteredLogs.length - idx).padStart(3, '0')}`;

                      return (
                        <tr
                          key={log.id}
                          onClick={() => onSelectLog(log)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 pl-6 pr-3 font-mono text-[11px] font-bold text-slate-500">
                            {logCode}
                          </td>

                          <td className="py-3.5 px-3 font-semibold text-slate-900 group-hover:text-orange-600 transition-colors max-w-xs truncate">
                            {log.stepTitle}
                          </td>

                          <td className="py-3.5 px-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${logType.badge}`}>
                              {logType.icon}
                              <span>{logType.label}</span>
                            </span>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${domainBadge.bg}`}>
                              {domainBadge.code}
                            </span>
                          </td>

                          <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{log.date || formatLogDate(log.createdAt)}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusBadge.class}`}>
                              {statusBadge.icon}
                              <span>{statusBadge.label}</span>
                            </span>
                          </td>

                          <td className="py-3.5 pr-6 pl-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => onSelectLog(log)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="View Step Details"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {desktopFilteredLogs.length > 0 && (
              <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-sans">
                <span>
                  Showing {Math.min((desktopLogPage - 1) * 8 + 1, desktopFilteredLogs.length)}–
                  {Math.min(desktopLogPage * 8, desktopFilteredLogs.length)} of {desktopFilteredLogs.length} logs
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDesktopLogPage((p) => Math.max(1, p - 1))}
                    disabled={desktopLogPage <= 1}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 transition-all ${
                      desktopLogPage <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    &lt;
                  </button>
                  {Array.from(
                    { length: Math.max(1, Math.ceil(desktopFilteredLogs.length / 8)) },
                    (_, i) => i + 1
                  )
                    .slice(0, 5)
                    .map((pg) => (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => setDesktopLogPage(pg)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                          desktopLogPage === pg
                            ? 'bg-[#0e131f] text-white shadow-xs'
                            : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                  <button
                    type="button"
                    onClick={() => setDesktopLogPage((p) => Math.min(Math.ceil(desktopFilteredLogs.length / 8), p + 1))}
                    disabled={desktopLogPage >= Math.ceil(desktopFilteredLogs.length / 8)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 transition-all ${
                      desktopLogPage >= Math.ceil(desktopFilteredLogs.length / 8)
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Build Media & Quick Actions */}
        <LogMediaSidebar
          logs={logs}
          canCreateBuildLog={canCreateBuildLog}
          onSelectLog={onSelectLog}
          onOpenNewBuildLog={onOpenNewBuildLog}
          onOpenNewTestLog={onOpenNewTestLog}
          onOpenUploadMedia={onOpenUploadMedia}
        />
      </div>
    </div>
  );
}
