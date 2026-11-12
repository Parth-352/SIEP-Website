"use client";

import React, { useState, useMemo } from 'react';
import { TEAMS_LIST, TEAMS } from '@/lib/teams';
import { Task, TaskStatus, TeamId, UserProfile } from '@/lib/types';
import { STATUS_COLUMNS, PRIORITY_BADGES } from '@/constants/dashboard';
import { SpecialDeadlineFilter } from '@/types/dashboard';
import { isTaskAssignedToUser } from '@/lib/taskMatching';
import { formatRelativeDueDate } from '@/utils/dateUtils';
import { getMemberInitials, getAvatarColorClass } from '@/utils/avatarUtils';

interface TeamTasksTabProps {
  user: UserProfile;
  isCoreAdmin: boolean;
  memberDomainIds: TeamId[];
  domainViewScope: 'assigned' | 'all';
  setDomainViewScope: (scope: 'assigned' | 'all') => void;
  tasks: Task[];
  filteredTasks: Task[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPriorityFilter: string;
  setSelectedPriorityFilter: (filter: string) => void;
  selectedSubsystemFilter: string;
  setSelectedSubsystemFilter: (filter: string) => void;
  assignedToMeOnly: boolean;
  setAssignedToMeOnly: (val: boolean) => void;
  myAssignedCount: number;
  specialDeadlineFilter: SpecialDeadlineFilter;
  setSpecialDeadlineFilter: (filter: SpecialDeadlineFilter) => void;
  handleOpenTaskDetail: (task: Task) => void;
  handleMoveStatus: (e: React.MouseEvent, taskId: string, newStatus: TaskStatus) => void;
  handleQuickAssignToMe: (e: React.MouseEvent, task: Task) => void;
  setCardTaskToDelete: (task: Task | null) => void;
  cardMenuTaskId: string | null;
  setCardMenuTaskId: (id: string | null) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, status: TaskStatus) => void;
  handleDragStart: (e: React.DragEvent, taskId: string) => void;
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

export default function TeamTasksTab({
  user,
  isCoreAdmin,
  memberDomainIds,
  domainViewScope,
  setDomainViewScope,
  tasks,
  filteredTasks,
  searchQuery,
  setSearchQuery,
  selectedPriorityFilter,
  setSelectedPriorityFilter,
  selectedSubsystemFilter,
  setSelectedSubsystemFilter,
  assignedToMeOnly,
  setAssignedToMeOnly,
  myAssignedCount,
  specialDeadlineFilter,
  setSpecialDeadlineFilter,
  handleOpenTaskDetail,
  handleMoveStatus,
  handleQuickAssignToMe,
  setCardTaskToDelete,
  cardMenuTaskId,
  setCardMenuTaskId,
  handleDragOver,
  handleDrop,
  handleDragStart,
}: TeamTasksTabProps) {
  // Mobile single-status tab selection
  const [mobileStatusTab, setMobileStatusTab] = useState<TaskStatus>('todo');

  // Counts for mobile status chips
  const todoCount = useMemo(() => filteredTasks.filter((t) => t.status === 'todo').length, [filteredTasks]);
  const inProgressCount = useMemo(() => filteredTasks.filter((t) => t.status === 'in_progress').length, [filteredTasks]);
  const reviewCount = useMemo(() => filteredTasks.filter((t) => t.status === 'review').length, [filteredTasks]);
  const doneCount = useMemo(() => filteredTasks.filter((t) => t.status === 'done').length, [filteredTasks]);

  // Squads available to active member (strictly assigned domains unless Core Admin in 'all' view)
  const availableSquads = useMemo(() => {
    if (isCoreAdmin && domainViewScope === 'all') {
      return TEAMS_LIST;
    }
    return TEAMS_LIST.filter((team) => memberDomainIds.includes(team.id));
  }, [isCoreAdmin, domainViewScope, memberDomainIds]);

  // Tasks visible in the selected mobile status tab
  const visibleMobileTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === mobileStatusTab),
    [filteredTasks, mobileStatusTab]
  );

  return (
    <div className="space-y-6">
      {/* =========================================================================
          MOBILE VIEW: TEAM TASKS (Strictly matching PRD & Mockups 4 & 6)
          Single column, 3 KPI pills, search, filters, 4 status chips, clean cards.
         ========================================================================= */}
      <div className="md:hidden space-y-4">
        {/* 1. Header */}
        <div className="flex items-center gap-3 bg-white border border-jet-black/10 rounded-3xl p-4 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-orange shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-black font-sans text-jet-black tracking-tight leading-tight">
              Team Tasks
            </h2>
            <p className="text-xs font-sans text-zinc-500 mt-0.5">
              All project tasks across teams.
            </p>
          </div>
        </div>

        {/* 2. Compact Team Summary (4 Tiles in 1 Row) - 100% Uniform */}
        <div className="grid grid-cols-4 gap-2">
          {/* Tile 1: Total */}
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
              {filteredTasks.length}
            </span>
            <span className="text-[10px] font-sans text-zinc-500 font-medium mt-1 truncate">
              Total
            </span>
          </button>

          {/* Tile 2: In Progress */}
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

          {/* Tile 3: Under Review */}
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

          {/* Tile 4: Completed */}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team tasks (title, keyword...)"
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
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-2.5 text-zinc-400 hover:text-zinc-700 text-xs font-sans cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* 4. Filters Row (Squads, Priority) */}
        <div className="grid grid-cols-2 gap-2">
          <select
            value={selectedSubsystemFilter}
            onChange={(e) => {
              setSelectedSubsystemFilter(e.target.value);
              setAssignedToMeOnly(false);
            }}
            className="px-3 py-2 rounded-xl bg-white border border-jet-black/15 text-xs font-sans text-zinc-700 font-semibold focus:ring-2 focus:ring-orange focus:outline-none cursor-pointer truncate shadow-2xs"
          >
            <option value="all">
              {availableSquads.length > 1 ? `All Assigned Squads (${availableSquads.length})` : 'All Assigned Squads'}
            </option>
            {availableSquads.map((team) => (
              <option key={team.id} value={team.id}>
                {team.shortName}
              </option>
            ))}
          </select>

          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value)}
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

        {/* 6. Single-Status Task List (Cards matching Mockup 4 & 6) */}
        <div className="space-y-2.5">
          {visibleMobileTasks.length === 0 ? (
            <div className="bg-white border border-dashed border-zinc-200 rounded-3xl p-8 text-center space-y-1">
              <p className="text-xs font-sans font-semibold text-zinc-600">
                No tasks in this status.
              </p>
              <p className="text-[11px] font-sans text-zinc-400">
                Tasks matching your search or filters will appear here.
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
          DESKTOP VIEW: KANBAN BOARD (Desktop Layout Preserved 100%)
          Visible on desktop screens (hidden md:block).
         ========================================================================= */}
      <div className="hidden md:block space-y-6">
        {/* Filter & Search Bar */}
        <div className="bg-white border border-jet-black/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks by title, description, or squad..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-jet-black/15 text-xs sm:text-sm font-sans text-zinc-800 placeholder:text-zinc-400 focus:ring-2 focus:ring-orange focus:outline-none"
              />
              <svg
                className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-2.5 text-zinc-400 hover:text-zinc-700 text-xs font-sans cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Priority Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-sans text-zinc-500 font-semibold">Priority:</span>
              <select
                value={selectedPriorityFilter}
                onChange={(e) => setSelectedPriorityFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-jet-black/15 text-xs sm:text-sm font-sans text-zinc-700 font-medium focus:ring-2 focus:ring-orange focus:outline-none bg-white cursor-pointer"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* Subsystem Filter Pills with smooth horizontal scroll and right-edge gradient indicator */}
          <div className="relative">
            <div className="pt-3 border-t border-jet-black/5 flex items-center gap-2 overflow-x-auto hide-scrollbar touch-pan-x scroll-smooth pr-10">
              {/* Core Leadership Scope Switcher */}
              {isCoreAdmin && (
                <div className="flex items-center gap-1 p-0.5 bg-zinc-100 rounded-xl text-xs font-sans font-medium shrink-0 mr-1 border border-zinc-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      setDomainViewScope('assigned');
                      setSelectedSubsystemFilter('all');
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      domainViewScope === 'assigned'
                        ? 'bg-jet-black text-white font-semibold shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    My Domains ({memberDomainIds.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDomainViewScope('all');
                    }}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      domainViewScope === 'all'
                        ? 'bg-jet-black text-white font-semibold shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900'
                    }`}
                  >
                    All Squads (9)
                  </button>
                </div>
              )}

              <span className="text-xs font-sans text-zinc-500 font-semibold shrink-0">
                Subsystem:
              </span>

              <button
                type="button"
                onClick={() => {
                  setSelectedSubsystemFilter('all');
                  setAssignedToMeOnly(false);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedSubsystemFilter === 'all' && !assignedToMeOnly
                    ? 'bg-jet-black text-alice-blue font-semibold shadow-sm'
                    : 'bg-alice-blue/60 text-zinc-600 hover:text-jet-black hover:bg-alice-blue'
                }`}
              >
                {!isCoreAdmin || domainViewScope === 'assigned'
                  ? `All My Squads (${tasks.filter((t) => memberDomainIds.includes(t.teamId)).length})`
                  : `All Tasks (${tasks.length})`}
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextVal = !assignedToMeOnly;
                  setAssignedToMeOnly(nextVal);
                  if (nextVal) {
                    setSelectedSubsystemFilter('all');
                  }
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  assignedToMeOnly
                    ? 'bg-orange text-white font-semibold shadow-md'
                    : 'bg-alice-blue/60 text-zinc-600 hover:text-jet-black hover:bg-alice-blue'
                }`}
              >
                <span>Assigned to Me</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    assignedToMeOnly ? 'bg-white/30 text-white' : 'bg-jet-black/10 text-zinc-700'
                  }`}
                >
                  {myAssignedCount}
                </span>
              </button>

              {availableSquads.map((team) => {
                const count = tasks.filter((t) => t.teamId === team.id).length;
                const isSelected = selectedSubsystemFilter === team.id && !assignedToMeOnly;

                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => {
                      setSelectedSubsystemFilter(team.id);
                      setAssignedToMeOnly(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                      isSelected
                        ? 'bg-jet-black text-alice-blue font-semibold shadow-sm'
                        : 'bg-alice-blue/60 text-zinc-600 hover:text-jet-black hover:bg-alice-blue'
                    }`}
                  >
                    <span className="font-medium">{team.shortName}</span>
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

              {specialDeadlineFilter !== 'all' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange/15 border border-orange/30 text-orange text-xs font-sans font-semibold whitespace-nowrap shrink-0">
                  <span>
                    Filter:{' '}
                    {specialDeadlineFilter === 'due_week'
                      ? 'Due This Week'
                      : specialDeadlineFilter === 'overdue'
                      ? 'Overdue'
                      : 'Review Queue'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSpecialDeadlineFilter('all')}
                    className="hover:text-jet-black font-bold ml-0.5 cursor-pointer"
                    title="Clear deadline filter"
                  >
                    ✕
                  </button>
                </div>
              )}

              {(selectedSubsystemFilter !== 'all' ||
                selectedPriorityFilter !== 'all' ||
                searchQuery ||
                assignedToMeOnly ||
                specialDeadlineFilter !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubsystemFilter('all');
                    setSelectedPriorityFilter('all');
                    setSearchQuery('');
                    setAssignedToMeOnly(false);
                    setSpecialDeadlineFilter('all');
                  }}
                  className="text-xs font-sans text-orange hover:text-jet-black font-semibold whitespace-nowrap shrink-0 cursor-pointer underline"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Kanban Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {STATUS_COLUMNS.map((col) => {
            const columnTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="bg-white border border-jet-black/10 rounded-2xl p-4 sm:p-5 flex flex-col min-h-[200px] h-fit shadow-sm"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-jet-black/10">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                    <h3 className="text-sm font-sans font-bold text-zinc-800">
                      {col.label}
                    </h3>
                  </div>
                  <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-alice-blue text-zinc-700 font-bold border border-jet-black/10">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3.5 flex-1 overflow-y-auto pr-0.5">
                  {columnTasks.length === 0 ? (
                    <div className="py-8 px-4 border border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center text-center">
                      <span className="text-xs font-sans text-zinc-500 font-medium">
                        {filteredTasks.length === 0 &&
                        (selectedSubsystemFilter !== 'all' || searchQuery || specialDeadlineFilter !== 'all')
                          ? 'No matching deliverables'
                          : `No tasks in ${col.label}`}
                      </span>
                      <span className="text-[11px] font-sans text-zinc-400 mt-1">
                        Drag or advance deliverables here
                      </span>
                    </div>
                  ) : (
                    columnTasks.map((task) => {
                      const taskTeam = TEAMS[task.teamId];
                      const priorityInfo = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;
                      const isTaskAssignedToMe = isTaskAssignedToUser(task, user);
                      const canManageThisTask = isCoreAdmin || user.teamId === task.teamId || isTaskAssignedToMe;
                      const dueInfo = formatRelativeDueDate(task.dueDate);

                      return (
                        <div
                          key={task.id}
                          draggable={canManageThisTask}
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => handleOpenTaskDetail(task)}
                          className="group bg-alice-blue/40 hover:bg-white border border-jet-black/10 hover:border-orange/60 rounded-xl p-3.5 sm:p-4 shadow-2xs hover:shadow-md transition-all space-y-3 cursor-pointer relative"
                        >
                          {/* Team & Priority Row */}
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[11px] font-sans font-semibold border whitespace-nowrap flex-shrink-0 ${
                                taskTeam ? taskTeam.badgeBg : 'bg-alice-blue text-jet-black border-jet-black/10'
                              }`}
                            >
                              {taskTeam ? taskTeam.shortName : task.teamId}
                            </span>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              {task.isBlocked && (
                                <span
                                  className="px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-700 text-[10px] font-sans font-bold flex items-center gap-1"
                                  title={task.blockerReason || 'Blocked deliverable'}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Blocked
                                </span>
                              )}
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase tracking-wider ${priorityInfo.bg}`}
                              >
                                {priorityInfo.label}
                              </span>
                            </div>
                          </div>

                          {/* Title & Desc */}
                          <div>
                            <h4 className="text-sm font-sans font-semibold text-jet-black leading-snug group-hover:text-orange transition-colors">
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-xs text-zinc-600 mt-1 font-normal line-clamp-2 leading-relaxed">
                                {task.description}
                              </p>
                            )}
                          </div>

                          {/* Subtasks Progress Bar */}
                          {task.subtasks && task.subtasks.length > 0 && (
                            <div className="space-y-1 pt-0.5">
                              <div className="flex items-center justify-between text-[11px] font-sans text-zinc-500">
                                <span>Checklist</span>
                                <span className="font-semibold text-zinc-800">
                                  {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length}
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-jet-black/10 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 transition-all duration-300"
                                  style={{
                                    width: `${Math.round(
                                      (task.subtasks.filter((st) => st.completed).length / task.subtasks.length) * 100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Assignee & Due Date Row */}
                          <div className="pt-2 border-t border-jet-black/5 flex items-center justify-between text-xs text-zinc-500 gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {task.assignedMembers && task.assignedMembers.length > 0 ? (
                                <div className="flex items-center -space-x-1.5">
                                  {task.assignedMembers.slice(0, 3).map((name) => (
                                    <span
                                      key={name}
                                      title={name}
                                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-sans font-bold border-2 border-white uppercase shadow-xs ${getAvatarColorClass(
                                        name
                                      )}`}
                                    >
                                      {getMemberInitials(name)}
                                    </span>
                                  ))}
                                  {task.assignedMembers.length > 3 && (
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-bold bg-zinc-200 text-zinc-700 border-2 border-white">
                                      +{task.assignedMembers.length - 3}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 italic font-sans">
                                  <span className="w-5 h-5 rounded-full border border-dashed border-zinc-300 flex items-center justify-center text-[9px] text-zinc-400">
                                    ?
                                  </span>
                                  Unassigned
                                </span>
                              )}

                              {task.comments && task.comments.length > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-white border border-jet-black/10 text-zinc-500 font-bold flex items-center gap-0.5 text-[10px]">
                                  💬 {task.comments.length}
                                </span>
                              )}
                              {Boolean(task.actualHours) && (
                                <span className="px-1.5 py-0.5 rounded bg-white border border-jet-black/10 text-zinc-500 font-medium text-[10px]">
                                  {task.actualHours}h
                                </span>
                              )}

                              {!isTaskAssignedToMe && (
                                <button
                                  type="button"
                                  onClick={(e) => handleQuickAssignToMe(e, task)}
                                  className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-orange hover:text-white border border-zinc-200 text-[10px] font-sans font-medium text-zinc-600 transition-all cursor-pointer"
                                  title="Assign this task to yourself"
                                >
                                  + Claim
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {dueInfo && (
                                <span
                                  className={`text-[11px] font-sans font-medium flex items-center gap-1 ${dueInfo.className}`}
                                >
                                  <span>{dueInfo.text}</span>
                                </span>
                              )}

                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCardMenuTaskId(cardMenuTaskId === task.id ? null : task.id);
                                  }}
                                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors"
                                  title="Task Actions"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                    />
                                  </svg>
                                </button>

                                {cardMenuTaskId === task.id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-40"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCardMenuTaskId(null);
                                      }}
                                    />
                                    <div
                                      onClick={(e) => e.stopPropagation()}
                                      className="absolute right-0 bottom-full mb-1 w-44 bg-white border border-jet-black/10 rounded-xl shadow-xl z-50 py-1 text-xs font-sans animate-in fade-in zoom-in-95 duration-100"
                                    >
                                      <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                        Move Status
                                      </div>
                                      {STATUS_COLUMNS.filter((c) => c.id !== task.status).map((c) => (
                                        <button
                                          key={c.id}
                                          type="button"
                                          onClick={(e) => {
                                            handleMoveStatus(e, task.id, c.id);
                                            setCardMenuTaskId(null);
                                          }}
                                          className="w-full px-3 py-1.5 text-left text-zinc-700 hover:bg-alice-blue flex items-center gap-2 cursor-pointer"
                                        >
                                          <span className={`w-1.5 h-1.5 rounded-full ${c.dotColor}`} />
                                          <span>Move to {c.label}</span>
                                        </button>
                                      ))}

                                      {isCoreAdmin && (
                                        <>
                                          <div className="border-t border-jet-black/10 my-1" />
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setCardMenuTaskId(null);
                                              setCardTaskToDelete(task);
                                            }}
                                            className="w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                                          >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                              />
                                            </svg>
                                            <span>Delete Deliverable</span>
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}