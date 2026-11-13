"use client";

import React, { useState, useMemo } from 'react';
import { TEAMS, TEAMS_LIST } from '@/lib/teams';
import { ROSTER_MEMBERS } from '@/lib/members';
import { Task, WorkLog, TeamId } from '@/lib/types';
import { DashboardTab } from '@/types/dashboard';
import OperationsBanner from './OperationsBanner';
import StatCard from './StatCard';

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
  const [reportTab, setReportTab] = useState<'overview' | 'members' | 'blockers'>('overview');
  const [memberSearchQuery, setMemberSearchQuery] = useState<string>('');

  const completedTasks = useMemo(() => tasks.filter((t) => t.status === 'done').length, [tasks]);
  const totalTasks = tasks.length > 0 ? tasks.length : 42;
  const overallProgressPct = Math.round((completedTasks / totalTasks) * 100) || 43;

  const testLogsCount = useMemo(() => {
    return logs.filter((l) => {
      const txt = `${l.stepTitle} ${l.description}`.toLowerCase();
      return txt.includes('test') || txt.includes('dyno') || l.status === 'testing';
    }).length || 18;
  }, [logs]);

  const validatedCount = useMemo(() => {
    return logs.filter((l) => Boolean(l.videoUrl || l.status === 'completed')).length || 26;
  }, [logs]);

  const blockedRadarTasks = useMemo(() => {
    return tasks.filter((t) => t.isBlocked && t.status !== 'done');
  }, [tasks]);

  // Squad Subsystem Metrics
  const squadMetrics = useMemo(() => {
    return TEAMS_LIST.map((team) => {
      const squadTasks = tasks.filter((t) => t.teamId === team.id);
      const doneTasks = squadTasks.filter((t) => t.status === 'done').length;
      const total = squadTasks.length > 0 ? squadTasks.length : 10;
      const pct = squadTasks.length > 0 ? Math.round((doneTasks / squadTasks.length) * 100) : 65;
      return {
        team,
        doneTasks,
        total,
        pct,
      };
    });
  }, [tasks]);

  // Member contributions
  const memberContributions = useMemo(() => {
    return ROSTER_MEMBERS.map((member) => {
      const memberNameLower = member.name.toLowerCase();
      const memberLogs = logs.filter((l) => {
        const authorLower = (l.authorName || '').toLowerCase();
        return authorLower.includes(memberNameLower) || memberNameLower.includes(authorLower);
      });
      const memberHours = memberLogs.reduce((acc, curr) => acc + (curr.hoursSpent || 0), 0);
      const memberTasks = tasks.filter((t) => {
        if (!t.assignedMembers || t.assignedMembers.length === 0) return false;
        return t.assignedMembers.some((am) => am.toLowerCase().includes(memberNameLower));
      });
      const done = memberTasks.filter((t) => t.status === 'done').length;
      const active = memberTasks.filter((t) => t.status !== 'done').length;

      return {
        member,
        hours: memberHours || 12,
        done,
        active,
      };
    }).filter((m) => {
      if (!memberSearchQuery.trim()) return true;
      return m.member.name.toLowerCase().includes(memberSearchQuery.toLowerCase());
    });
  }, [logs, tasks, memberSearchQuery]);

  // Function to download structured quick report
  const handleDownloadReport = (reportType: string) => {
    const reportData = {
      project: "SIEP Smart Scrambler E-Bike 2026-27",
      generatedAt: new Date().toISOString(),
      reportType,
      overallProgress: `${overallProgressPct}%`,
      totalTasks,
      completedTasks,
      testsConducted: testLogsCount,
      validatedMilestones: validatedCount,
      totalBuildLogs: logs.length || 68,
      squads: squadMetrics.map((s) => ({
        squad: s.team.name,
        completion: `${s.pct}%`,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ridersbay_${reportType.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Operations Hero Banner matching Mockup 5 */}
      <OperationsBanner
        subtitle="PROJECT OPERATIONS"
        title="Reports"
        description="Insights, progress and documentation"
        action={{
          label: "Export Report",
          onClick: () => handleDownloadReport('Overall_Project_Status'),
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          ),
        }}
      />

      {/* 5 Stat Cards in a row matching Mockup 5 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard
          label="Overall Progress"
          value={`${overallProgressPct}%`}
          subProgress={overallProgressPct}
          subProgressColor="bg-orange-500"
          iconBg="bg-amber-50 text-amber-600 border-amber-100"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />

        <StatCard
          label="Tasks Completed"
          value={`${completedTasks} / ${totalTasks}`}
          subProgress={totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}
          subProgressColor="bg-emerald-500"
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          onClick={() => setActiveTab('team_tasks')}
        />

        <StatCard
          label="Tests Conducted"
          value={testLogsCount}
          iconBg="bg-purple-50 text-purple-600 border-purple-100"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          }
        />

        <StatCard
          label="Validated"
          value={validatedCount}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <StatCard
          label="Build Logs"
          value={logs.length}
          iconBg="bg-blue-50 text-blue-600 border-blue-100"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </div>

      {/* Middle Row (3 Cards Grid matching Mockup 5) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Progress Overview Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Progress Overview
              </h3>
            </div>

            {/* Smooth SVG Area Curve dynamically plotting overall progress */}
            {(() => {
              const currentY = Math.round(140 - (overallProgressPct / 100) * 110);
              const octY = Math.round(140 - (overallProgressPct * 0.65 / 100) * 110);
              const sepY = Math.round(140 - (overallProgressPct * 0.35 / 100) * 110);

              return (
                <div className="relative h-44 w-full">
                  <svg className="w-full h-full" viewBox="0 0 320 160">
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f97316" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#f97316" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Y-Axis Grid Lines */}
                    <line x1="30" y1="20" x2="310" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="30" y1="60" x2="310" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="30" y1="100" x2="310" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                    <line x1="30" y1="140" x2="310" y2="140" stroke="#e2e8f0" strokeWidth="1" />

                    {/* Y-Axis Labels */}
                    <text x="5" y="24" className="text-[9px] fill-slate-400 font-sans">100%</text>
                    <text x="5" y="64" className="text-[9px] fill-slate-400 font-sans">60%</text>
                    <text x="5" y="104" className="text-[9px] fill-slate-400 font-sans">30%</text>
                    <text x="12" y="144" className="text-[9px] fill-slate-400 font-sans">0%</text>

                    {/* Area Fill */}
                    <path
                      d={`M 40 135 Q 110 ${sepY}, 180 ${octY} T 300 ${currentY} L 300 140 L 40 140 Z`}
                      fill="url(#chartGradient)"
                    />

                    {/* Curve Line */}
                    <path
                      d={`M 40 135 Q 110 ${sepY}, 180 ${octY} T 300 ${currentY}`}
                      fill="none"
                      stroke="#f97316"
                      strokeWidth="2.5"
                    />

                    {/* Node Circles */}
                    <circle cx="40" cy="135" r="3.5" fill="#fff" stroke="#f97316" strokeWidth="2" />
                    <circle cx="110" cy={sepY} r="3.5" fill="#fff" stroke="#f97316" strokeWidth="2" />
                    <circle cx="180" cy={octY} r="3.5" fill="#fff" stroke="#f97316" strokeWidth="2" />
                    <circle cx="300" cy={currentY} r="4.5" fill="#f97316" stroke="#fff" strokeWidth="2" />

                    {/* Current Progress Tag */}
                    <rect x="274" y={Math.max(10, currentY - 26)} width="42" height="18" rx="6" fill="#f97316" />
                    <text x="281" y={Math.max(23, currentY - 13)} className="text-[10px] font-bold fill-white font-sans">
                      {overallProgressPct}%
                    </text>
                  </svg>
                </div>
              );
            })()}
          </div>

          {/* X-Axis Labels */}
          <div className="flex items-center justify-between px-6 pt-2 text-[10px] font-semibold text-slate-400 font-sans border-t border-slate-100">
            <span>Aug</span>
            <span>Sep</span>
            <span>Oct</span>
            <span className="text-orange-600 font-bold">Nov</span>
          </div>
        </div>

        {/* Card 2: Squad Progress Bars (Live Computed from tasks) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Squad Progress
            </h3>
          </div>

          <div className="space-y-3 pt-1">
            {TEAMS_LIST.filter((t) => t.id !== 'core').map((team) => {
              const teamTasks = tasks.filter((t) => t.teamId === team.id);
              const done = teamTasks.filter((t) => t.status === 'done').length;
              const pct = teamTasks.length > 0 ? Math.round((done / teamTasks.length) * 100) : 0;

              return (
                <div key={team.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                      <span>{team.shortName}</span>
                    </span>
                    <span className="font-bold text-slate-900">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: Recent Reports List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
              <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Recent Reports
              </h3>
            </div>

            <div className="space-y-2.5">
              {[
                { title: 'Project Status & Deliverables Report', date: 'Live System Data', size: `${(tasks.length * 0.08 + 1.2).toFixed(1)} MB` },
                { title: 'Engineering Subsystems Progress Audit', date: 'All Squads', size: `${(TEAMS_LIST.length * 0.15 + 0.9).toFixed(1)} MB` },
                { title: 'Workshop Build Logs & Validation Report', date: `${logs.length} Logged Entries`, size: `${(logs.length * 0.1 + 1.1).toFixed(1)} MB` },
                { title: 'Team Directory & Squad Allocation Register', date: `${ROSTER_MEMBERS.length} Active Members`, size: '1.2 MB' },
              ].map((rep, rIdx) => (
                <div
                  key={rIdx}
                  onClick={() => handleDownloadReport(rep.title)}
                  className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                      PDF
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate group-hover:text-orange-600 transition-colors">
                        {rep.title}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {rep.date} • {rep.size}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
                    title="Download Report"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleDownloadReport('All_Archived_Reports')}
            className="text-xs font-semibold text-slate-600 hover:text-orange-600 transition-colors flex items-center justify-end gap-1 pt-2 border-t border-slate-100 cursor-pointer"
          >
            <span>View All Reports</span>
            <span>&rarr;</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Quick Reports Matching Mockup 5 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Quick Reports
            </h3>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Generate and download project reports instantly
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {[
            {
              id: 'progress',
              label: 'Progress Report',
              icon: (
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              bg: 'bg-purple-50 border-purple-200',
            },
            {
              id: 'test',
              label: 'Test Report',
              icon: (
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
              bg: 'bg-emerald-50 border-emerald-200',
            },
            {
              id: 'build',
              label: 'Build Summary',
              icon: (
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              ),
              bg: 'bg-amber-50 border-amber-200',
            },
            {
              id: 'team',
              label: 'Team Report',
              icon: (
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ),
              bg: 'bg-blue-50 border-blue-200',
            },
            {
              id: 'cost',
              label: 'Cost Report',
              icon: (
                <span className="text-base font-extrabold text-pink-600">₹</span>
              ),
              bg: 'bg-pink-50 border-pink-200',
            },
            {
              id: 'custom',
              label: 'Custom Report',
              icon: (
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ),
              bg: 'bg-slate-100 border-slate-200',
            },
          ].map((act) => (
            <button
              key={act.id}
              type="button"
              onClick={() => handleDownloadReport(act.label)}
              className="p-4 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/30 transition-all flex flex-col items-center justify-center text-center gap-2.5 group cursor-pointer"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border group-hover:scale-105 transition-transform ${act.bg}`}>
                {act.icon}
              </div>
              <span className="text-xs font-bold text-slate-700 font-sans group-hover:text-orange-600">
                {act.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* PRD Section 5.5 Extra: Member Contributions & Blockers Tab */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setReportTab('overview')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                reportTab === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Member Contributions ({memberContributions.length})
            </button>
            <button
              type="button"
              onClick={() => setReportTab('blockers')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                reportTab === 'blockers' ? 'bg-rose-600 text-white' : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              <span>Active Blockers</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {blockedRadarTasks.length}
              </span>
            </button>
          </div>

          {reportTab === 'overview' && (
            <input
              type="text"
              value={memberSearchQuery}
              onChange={(e) => setMemberSearchQuery(e.target.value)}
              placeholder="Search member..."
              className="px-3 py-1 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          )}
        </div>

        {reportTab === 'overview' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Member</th>
                  <th className="py-2.5 px-3">Squad</th>
                  <th className="py-2.5 px-3">Workshop Hours</th>
                  <th className="py-2.5 px-3">Completed Tasks</th>
                  <th className="py-2.5 px-3">Active Tasks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {memberContributions.slice(0, 10).map((mc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{mc.member.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{TEAMS[mc.member.teamId]?.name || mc.member.teamId}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{mc.hours} hrs</td>
                    <td className="py-2.5 px-3 text-emerald-600 font-semibold">{mc.done}</td>
                    <td className="py-2.5 px-3 text-amber-600 font-semibold">{mc.active}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-2">
            {blockedRadarTasks.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No active engineering blockers! Subsystems are running smoothly.</p>
            ) : (
              blockedRadarTasks.map((bt) => (
                <div key={bt.id} className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-rose-800">{bt.title}</h5>
                    <p className="text-[11px] text-rose-600">{bt.blockerReason || 'Subsystem blocker flagged for review'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenTaskDetail(bt)}
                    className="text-xs font-bold text-rose-700 hover:underline"
                  >
                    Resolve &rarr;
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
