"use client";

import React, { useState, useMemo } from 'react';
import { UserProfile, Task, TaskStatus, TeamId } from '@/lib/types';
import { TEAMS, TEAMS_LIST } from '@/lib/teams';
import { STATUS_COLUMNS } from '@/constants/dashboard';
import { DashboardTab } from '@/types/dashboard';
import TaskCard from '@/components/shared/TaskCard';

interface MyWorkbenchTabProps {
  user: UserProfile;
  myAssignedTasks: Task[];
  myTasksBreakdown: { done: number; total: number; completionPct: number };
  myTasksTabStatusFilter: 'all' | TaskStatus;
  setMyTasksTabStatusFilter: (filter: 'all' | TaskStatus) => void;
  handleOpenTaskDetail: (task: Task) => void;
  handleMoveStatus: (e: React.MouseEvent, taskId: string, newStatus: TaskStatus) => void;
  setActiveTab: (tab: DashboardTab) => void;
  memberDomainIds?: TeamId[];
  isCoreAdmin?: boolean;
  domainViewScope?: 'assigned' | 'all';
  canApproveCompletion?: boolean;
}

function getDomainBadge(teamId: string) {
  switch (teamId) {
    case 'mechanical':
    case 'chassis':
      return { code: 'MECH', bg: 'bg-amber-500/10 text-amber-700 border-amber-500/20' };
    case 'powertrain':
      return { code: 'POW', bg: 'bg-sky-500/10 text-sky-700 border-sky-500/20' };
    case 'battery':
      return { code: 'BATT', bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' };
    case 'entc':
    case 'electronics':
      return { code: 'E&E', bg: 'bg-blue-500/10 text-blue-700 border-blue-500/20' };
    case 'software':
    case 'telemetry':
      return { code: 'SOFT', bg: 'bg-purple-500/10 text-purple-700 border-purple-500/20' };
    case 'brakes':
      return { code: 'BRK', bg: 'bg-rose-500/10 text-rose-700 border-rose-500/20' };
    case 'suspension':
      return { code: 'SUSP', bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20' };
    case 'safety':
      return { code: 'SAFE', bg: 'bg-red-500/10 text-red-700 border-red-500/20' };
    case 'design':
      return { code: 'DSGN', bg: 'bg-pink-500/10 text-pink-700 border-pink-500/20' };
    case 'research':
      return { code: 'R&D', bg: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20' };
    case 'sponsorship':
      return { code: 'SPON', bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' };
    case 'socialmedia':
    case 'marketing':
      return { code: 'MKT', bg: 'bg-pink-500/10 text-pink-700 border-pink-500/20' };
    case 'core':
      return { code: 'CORE', bg: 'bg-orange/10 text-orange border-orange/30' };
    case 'documentation':
    default:
      return { code: 'DOCS', bg: 'bg-zinc-100 text-zinc-700 border-zinc-200' };
  }
}

function getPriorityIndicator(priority: string) {
  switch (priority) {
    case 'urgent':
    case 'high':
      return { label: 'High', color: 'bg-rose-50 text-rose-600 border border-rose-200', level: 'high' as const };
    case 'medium':
      return { label: 'Medium', color: 'bg-amber-50 text-amber-600 border border-amber-200', level: 'medium' as const };
    case 'low':
    default:
      return { label: 'Low', color: 'bg-emerald-50 text-emerald-600 border border-emerald-200', level: 'low' as const };
  }
}

function formatMobileDueDate(dateStr?: string) {
  if (!dateStr) return 'No due date';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `Due ${d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}`;
}

export default function MyWorkbenchTab({
  user,
  myAssignedTasks,
  myTasksBreakdown,
  myTasksTabStatusFilter,
  setMyTasksTabStatusFilter,
  handleOpenTaskDetail,
  handleMoveStatus,
  setActiveTab,
  memberDomainIds,
  isCoreAdmin,
  domainViewScope,
  canApproveCompletion = false,
}: MyWorkbenchTabProps) {
  // Mobile-specific state
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [mobileDomainFilter, setMobileDomainFilter] = useState('all');
  const [mobilePriorityFilter, setMobilePriorityFilter] = useState('all');
  const [mobileStatusTab, setMobileStatusTab] = useState<TaskStatus>('todo');

  // Counts for mobile status chips
  const todoCount = useMemo(() => myAssignedTasks.filter((t) => t.status === 'todo').length, [myAssignedTasks]);
  const inProgressCount = useMemo(() => myAssignedTasks.filter((t) => t.status === 'in_progress').length, [myAssignedTasks]);
  const reviewCount = useMemo(() => myAssignedTasks.filter((t) => t.status === 'review').length, [myAssignedTasks]);
  const doneCount = useMemo(() => myAssignedTasks.filter((t) => t.status === 'done').length, [myAssignedTasks]);

  // Unique domains represented in user's assigned tasks
  const userTaskDomains = useMemo(() => {
    if (isCoreAdmin && domainViewScope === 'all') {
      const ids = Array.from(new Set(myAssignedTasks.map((t) => t.teamId)));
      return TEAMS_LIST.filter((team) => ids.includes(team.id));
    }
    const ids = Array.from(new Set(myAssignedTasks.map((t) => t.teamId)));
    if (memberDomainIds && Array.isArray(memberDomainIds)) {
      memberDomainIds.forEach((id) => {
        if (!ids.includes(id)) ids.push(id);
      });
    }
    return TEAMS_LIST.filter((team) => ids.includes(team.id));
  }, [myAssignedTasks, isCoreAdmin, domainViewScope, memberDomainIds]);

  // Mobile filtered personal tasks
  const visibleMobileTasks = useMemo(() => {
    return myAssignedTasks.filter((t) => {
      if (t.status !== mobileStatusTab) return false;
      if (mobileDomainFilter !== 'all' && t.teamId !== mobileDomainFilter) return false;
      if (mobilePriorityFilter !== 'all' && t.priority !== mobilePriorityFilter) return false;
      if (mobileSearchQuery.trim()) {
        const q = mobileSearchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = Boolean(t.description?.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc) return false;
      }
      return true;
    });
  }, [myAssignedTasks, mobileStatusTab, mobileDomainFilter, mobilePriorityFilter, mobileSearchQuery]);

  return (
    <div className="space-y-6">
      {/* =========================================================================
          MOBILE VIEW: ASSIGNED / MY TASKS (Strictly matching PRD & Mockup 7)
          Personal header, 4 KPI tiles, search, filters, status tabs, clean cards.
         ========================================================================= */}
      <div className="md:hidden space-y-4">
        {/* 1. Header */}
        <div className="flex items-center gap-3 bg-white border border-jet-black/10 rounded-3xl p-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-orange shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black font-sans text-jet-black tracking-tight leading-tight">
              My Tasks
            </h2>
            <p className="text-xs font-sans text-zinc-500 mt-0.5">
              Tasks assigned to you.
            </p>
          </div>
        </div>

        {/* 2. Personal Task Summary (4 Tiles in 1 Row) - 100% Uniform */}
        <div className="grid grid-cols-4 gap-2">
          {/* Total */}
          <button
            type="button"
            onClick={() => setMobileStatusTab('todo')}
            className={`bg-white border rounded-2xl p-2.5 shadow-2xs flex flex-col items-center text-center cursor-pointer transition-all active:scale-95 ${
              mobileStatusTab === 'todo' ? 'border-zinc-900 ring-2 ring-zinc-900/20' : 'border-jet-black/10'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 mb-1">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-base font-black font-sans text-jet-black tabular-nums leading-none">
              {myAssignedTasks.length}
            </span>
            <span className="text-[10px] font-sans text-zinc-500 font-medium mt-1 truncate">
              Total
            </span>
          </button>

          {/* In Progress */}
          <button
            type="button"
            onClick={() => setMobileStatusTab('in_progress')}
            className={`bg-white border rounded-2xl p-2.5 shadow-2xs flex flex-col items-center text-center cursor-pointer transition-all active:scale-95 ${
              mobileStatusTab === 'in_progress' ? 'border-orange ring-2 ring-orange/30 bg-orange/5' : 'border-jet-black/10'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-orange/10 border border-orange/20 flex items-center justify-center text-orange mb-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-base font-black font-sans text-jet-black tabular-nums leading-none">
              {inProgressCount}
            </span>
            <span className="text-[10px] font-sans text-zinc-500 font-medium mt-1 truncate">
              In Progress
            </span>
          </button>

          {/* Under Review */}
          <button
            type="button"
            onClick={() => setMobileStatusTab('review')}
            className={`bg-white border rounded-2xl p-2.5 shadow-2xs flex flex-col items-center text-center cursor-pointer transition-all active:scale-95 ${
              mobileStatusTab === 'review' ? 'border-purple-600 ring-2 ring-purple-600/30 bg-purple-50/50' : 'border-jet-black/10'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 mb-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <span className="text-base font-black font-sans text-jet-black tabular-nums leading-none">
              {reviewCount}
            </span>
            <span className="text-[10px] font-sans text-zinc-500 font-medium mt-1 truncate">
              Under Review
            </span>
          </button>

          {/* Completed */}
          <button
            type="button"
            onClick={() => setMobileStatusTab('done')}
            className={`bg-white border rounded-2xl p-2.5 shadow-2xs flex flex-col items-center text-center cursor-pointer transition-all active:scale-95 ${
              mobileStatusTab === 'done' ? 'border-emerald-600 ring-2 ring-emerald-600/30 bg-emerald-50/50' : 'border-jet-black/10'
            }`}
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 mb-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-base font-black font-sans text-jet-black tabular-nums leading-none">
              {doneCount}
            </span>
            <span className="text-[10px] font-sans text-zinc-500 font-medium mt-1 truncate">
              Completed
            </span>
          </button>
        </div>

        {/* 3. Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={mobileSearchQuery}
            onChange={(e) => setMobileSearchQuery(e.target.value)}
            placeholder="Search my tasks (title, keyword...)"
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-jet-black/15 text-xs font-sans text-zinc-800 placeholder:text-zinc-400 focus:ring-2 focus:ring-orange focus:outline-none shadow-2xs"
          />
          <svg
            className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {mobileSearchQuery && (
            <button
              type="button"
              onClick={() => setMobileSearchQuery('')}
              className="absolute right-3.5 top-2.5 text-zinc-400 hover:text-zinc-700 text-xs font-sans cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* 4. Filters Row (Domains, Priority) */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={mobileDomainFilter}
            onChange={(e) => setMobileDomainFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-jet-black/15 text-xs font-sans text-zinc-700 font-semibold focus:ring-2 focus:ring-orange focus:outline-none cursor-pointer truncate shadow-2xs"
          >
            <option value="all">{userTaskDomains.length > 1 ? `All Assigned Squads (${userTaskDomains.length})` : 'All Assigned Squads'}</option>
            {userTaskDomains.map((team) => (
              <option key={team.id} value={team.id}>
                {team.shortName}
              </option>
            ))}
          </select>

          <select
            value={mobilePriorityFilter}
            onChange={(e) => setMobilePriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-jet-black/15 text-xs font-sans text-zinc-700 font-semibold focus:ring-2 focus:ring-orange focus:outline-none cursor-pointer truncate shadow-2xs"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* 5. Status Selector Tabs / Chips (4 Selectable Chips) */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar touch-pan-x py-1">
          {/* To Do Chip */}
          <button
            type="button"
            onClick={() => setMobileStatusTab('todo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              mobileStatusTab === 'todo'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
            }`}
          >
            <span>To Do</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                mobileStatusTab === 'todo' ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-800'
              }`}
            >
              {todoCount}
            </span>
          </button>

          {/* In Progress Chip */}
          <button
            type="button"
            onClick={() => setMobileStatusTab('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              mobileStatusTab === 'in_progress'
                ? 'bg-orange text-white shadow-xs'
                : 'bg-orange/10 hover:bg-orange/20 text-orange'
            }`}
          >
            <span>In Progress</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                mobileStatusTab === 'in_progress' ? 'bg-white/30 text-white' : 'bg-orange/20 text-orange'
              }`}
            >
              {inProgressCount}
            </span>
          </button>

          {/* Under Review Chip */}
          <button
            type="button"
            onClick={() => setMobileStatusTab('review')}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              mobileStatusTab === 'review'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
            }`}
          >
            <span>Under Review</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                mobileStatusTab === 'review' ? 'bg-white/30 text-white' : 'bg-purple-200 text-purple-800'
              }`}
            >
              {reviewCount}
            </span>
          </button>

          {/* Completed Chip */}
          <button
            type="button"
            onClick={() => setMobileStatusTab('done')}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
              mobileStatusTab === 'done'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
            }`}
          >
            <span>Completed</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                mobileStatusTab === 'done' ? 'bg-white/30 text-white' : 'bg-emerald-200 text-emerald-800'
              }`}
            >
              {doneCount}
            </span>
          </button>
        </div>

        {/* 6. Single-Status Task List (Cards matching Mockup 7) */}
        <div className="space-y-2.5">
          {visibleMobileTasks.length === 0 ? (
            <div className="bg-white border border-dashed border-zinc-200 rounded-3xl p-8 text-center space-y-1">
              <p className="text-xs font-sans font-semibold text-zinc-600">
                You&apos;re all caught up!
              </p>
              <p className="text-[11px] font-sans text-zinc-400">
                No active tasks assigned to you in this status.
              </p>
            </div>
          ) : (
            visibleMobileTasks.map((task) => {
              const taskTeam = TEAMS[task.teamId];
              const domainBadge = getDomainBadge(task.teamId);
              const priorityBadge = getPriorityIndicator(task.priority);
              const dueDateText = formatMobileDueDate(task.dueDate);

              return (
                <div
                  key={task.id}
                  onClick={() => handleOpenTaskDetail(task)}
                  className="bg-white border border-jet-black/10 rounded-2xl p-3.5 shadow-2xs hover:border-orange hover:shadow-xs transition-all cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Domain Short Code Tag */}
                    <span className={`px-2 py-1 rounded-xl text-[10px] font-sans font-black uppercase tracking-wider border shrink-0 ${domainBadge.bg}`}>
                      {domainBadge.code}
                    </span>

                    {/* Title & Meta */}
                    <div className="min-w-0">
                      <h4 className="text-sm font-sans font-bold text-jet-black truncate">
                        {task.title}
                      </h4>
                      <p className="text-xs text-zinc-500 font-sans mt-0.5 flex items-center gap-1.5 truncate">
                        <span>{taskTeam?.shortName || task.teamId}</span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{dueDateText}</span>
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Priority & Chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-sans font-bold flex items-center gap-1.5 ${priorityBadge.color}`}>
                      <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                        <rect x="2" y="10" width="2.5" height="5" rx="0.5" />
                        <rect x="6.75" y="6" width="2.5" height="9" rx="0.5" opacity={priorityBadge.level === 'low' ? 0.3 : 1} />
                        <rect x="11.5" y="2" width="2.5" height="13" rx="0.5" opacity={priorityBadge.level === 'low' || priorityBadge.level === 'medium' ? 0.3 : 1} />
                      </svg>
                      <span>{priorityBadge.label}</span>
                    </span>
                    <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* =========================================================================
          DESKTOP VIEW: PERSONAL WORKBENCH (Desktop Layout Preserved 100%)
          Visible on desktop screens (hidden md:block).
         ========================================================================= */}
      <div className="hidden md:block space-y-6">
        {/* Header & Filter Toolbar for My Tasks */}
        <div className="bg-white border border-jet-black/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse" />
                <h3 className="text-base sm:text-lg font-bold font-sans text-jet-black">
                  Personal Action Workbench
                </h3>
              </div>
              <p className="text-xs font-sans text-zinc-600 mt-0.5">
                Managing {myAssignedTasks.length} deliverables assigned to{' '}
                <strong className="text-jet-black font-semibold">{user.displayName}</strong>
              </p>
            </div>

            {/* Personal Completion Metric */}
            <div className="flex items-center gap-3">
              <div className="text-right font-sans">
                <div className="text-xs text-zinc-500">Personal Progress</div>
                <div className="text-sm font-bold text-jet-black">
                  {myTasksBreakdown.done} / {myTasksBreakdown.total} completed ({myTasksBreakdown.completionPct}%)
                </div>
              </div>
              <div className="w-24 h-2.5 bg-alice-blue rounded-full overflow-hidden border border-jet-black/10 hidden sm:block">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${myTasksBreakdown.completionPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Status Filter Pills for My Tasks */}
          <div className="pt-3 border-t border-jet-black/5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-sans text-zinc-500 font-semibold shrink-0">
              Filter Status:
            </span>

            <button
              type="button"
              onClick={() => setMyTasksTabStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                myTasksTabStatusFilter === 'all'
                  ? 'bg-jet-black text-alice-blue font-semibold shadow-sm'
                  : 'bg-alice-blue/60 text-zinc-600 hover:text-jet-black hover:bg-alice-blue'
              }`}
            >
              <span>All Assigned</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  myTasksTabStatusFilter === 'all'
                    ? 'bg-white/20 text-alice-blue'
                    : 'bg-jet-black/10 text-zinc-700'
                }`}
              >
                {myAssignedTasks.length}
              </span>
            </button>

            {STATUS_COLUMNS.map((col) => {
              const count = myAssignedTasks.filter((t) => t.status === col.id).length;
              const isSelected = myTasksTabStatusFilter === col.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setMyTasksTabStatusFilter(col.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-jet-black text-alice-blue font-semibold shadow-sm'
                      : 'bg-alice-blue/60 text-zinc-600 hover:text-jet-black hover:bg-alice-blue'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span>{col.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-white/20 text-alice-blue' : 'bg-jet-black/10 text-zinc-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* My Tasks Cards Layout */}
        {myAssignedTasks.length === 0 ? (
          <div className="bg-white border border-jet-black/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-orange/10 text-orange flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-base font-mono font-bold text-jet-black">
              No Active Tasks Assigned to You
            </h4>
            <p className="text-xs font-mono text-grey max-w-md leading-relaxed">
              You are all caught up! When tasks are assigned to <strong className="text-jet-black">{user.displayName}</strong>, they will be organized here with status flow and drive video attachments.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('team_tasks')}
              className="mt-2 px-5 py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-mono text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm"
            >
              Go to Team Task Board &rarr;
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {STATUS_COLUMNS.map((col) => {
              const columnTasks = myAssignedTasks
                .filter((t) => t.status === col.id)
                .filter((t) => myTasksTabStatusFilter === 'all' || myTasksTabStatusFilter === col.id);

              return (
                <div
                  key={col.id}
                  className="bg-white border border-jet-black/10 rounded-2xl p-4 sm:p-5 flex flex-col min-h-[180px] h-fit shadow-sm"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-jet-black/10">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                      <h4 className="text-sm font-sans font-bold text-zinc-800">
                        {col.label}
                      </h4>
                    </div>
                    <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-alice-blue text-zinc-700 font-bold border border-jet-black/10">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                    {columnTasks.length === 0 ? (
                      <div className="py-6 px-3 border border-dashed border-zinc-200 rounded-xl flex items-center justify-center text-center">
                        <span className="text-xs text-zinc-500 font-sans">
                          No tasks in {col.label}
                        </span>
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          colId={col.id}
                          isAssignedToMe={true}
                          canManage={true}
                          canApproveCompletion={canApproveCompletion}
                          onOpenDetail={handleOpenTaskDetail}
                          onMoveStatus={handleMoveStatus}
                          showLogLink={true}
                        />
                      ))
                    )}
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