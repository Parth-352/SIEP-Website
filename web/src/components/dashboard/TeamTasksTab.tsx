"use client";

import React, { useState, useMemo } from 'react';
import { TEAMS_LIST, TEAMS } from '@/lib/teams';
import { Task, TaskStatus, TeamId, UserProfile } from '@/lib/types';
import { STATUS_COLUMNS, PRIORITY_BADGES } from '@/constants/dashboard';
import { SpecialDeadlineFilter } from '@/types/dashboard';
import { isTaskAssignedToUser } from '@/lib/taskMatching';
import { formatRelativeDueDate } from '@/utils/dateUtils';
import { getMemberInitials, getAvatarColorClass } from '@/utils/avatarUtils';
import OperationsBanner from './OperationsBanner';

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
  canApproveCompletion?: boolean;
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
  canApproveCompletion = false,
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

  // Desktop state matching Mockup 2
  const [desktopFilterPill, setDesktopFilterPill] = useState<'all' | 'my' | 'assigned' | 'review' | 'completed'>('all');
  const [desktopViewMode, setDesktopViewMode] = useState<'table' | 'kanban'>('table');
  const [desktopTablePage, setDesktopTablePage] = useState<number>(1);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  const desktopAssignedCount = useMemo(() => tasks.filter((t) => t.assignedMembers && t.assignedMembers.length > 0).length, [tasks]);
  const desktopReviewCount = useMemo(() => tasks.filter((t) => t.status === 'review').length, [tasks]);
  const desktopDoneCount = useMemo(() => tasks.filter((t) => t.status === 'done').length, [tasks]);

  const desktopFilteredTasks = useMemo(() => {
    return filteredTasks.filter((t) => {
      if (desktopFilterPill === 'my') {
        return isTaskAssignedToUser(t, user);
      }
      if (desktopFilterPill === 'assigned') {
        return t.assignedMembers && t.assignedMembers.length > 0;
      }
      if (desktopFilterPill === 'review') {
        return t.status === 'review';
      }
      if (desktopFilterPill === 'completed') {
        return t.status === 'done';
      }
      return true;
    });
  }, [filteredTasks, desktopFilterPill, user]);

  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.max(1, Math.ceil(desktopFilteredTasks.length / ITEMS_PER_PAGE));
  const paginatedTasks = useMemo(() => {
    const start = (desktopTablePage - 1) * ITEMS_PER_PAGE;
    return desktopFilteredTasks.slice(start, start + ITEMS_PER_PAGE);
  }, [desktopFilteredTasks, desktopTablePage]);

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
          DESKTOP VIEW: TASKS WORKSPACE (Strictly matching Mockup 2 & PRD v1.0)
          Visible on desktop screens (hidden md:block).
         ========================================================================= */}
      <div className="hidden md:block space-y-6">
        {/* Sleek Operations Hero Banner with + New Task CTA */}
        <OperationsBanner
          subtitle="PROJECT OPERATIONS"
          title="Tasks"
          description="Create, assign and track work across all teams"
          action={{
            label: "+ New Task",
            onClick: () => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('siep_open_create_modal'));
              }
            },
          }}
        />

        {/* Filter Tabs & Search Controls Row Matching Mockup 2 */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          {/* Filter Pills on the left */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Tasks', count: tasks.length },
              { id: 'my', label: 'My Tasks', count: myAssignedCount },
              { id: 'assigned', label: 'Assigned', count: desktopAssignedCount },
              { id: 'review', label: 'Review', count: desktopReviewCount },
              { id: 'completed', label: 'Completed', count: desktopDoneCount },
            ].map((pill) => {
              const isActive = desktopFilterPill === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => {
                    setDesktopFilterPill(pill.id as any);
                    setDesktopTablePage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                    isActive
                      ? 'bg-[#0e131f] text-white shadow-sm'
                      : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <span>{pill.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {pill.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search, Filters Dropdown, and View Mode Switcher on the right */}
          <div className="flex items-center gap-2.5 self-start xl:self-auto shrink-0">
            {/* Search Input */}
            <div className="relative w-64 lg:w-72">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDesktopTablePage(1);
                }}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs font-sans text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
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
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                  aria-label="Clear search"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filters Trigger with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border shadow-xs ${
                  isFilterDropdownOpen || selectedSubsystemFilter !== 'all' || selectedPriorityFilter !== 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>Filters</span>
                {(selectedSubsystemFilter !== 'all' || selectedPriorityFilter !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                )}
              </button>

              {/* Filters Dropdown Card */}
              {isFilterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 text-slate-800 space-y-3 font-sans animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-bold text-slate-900">Task Filters</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedSubsystemFilter('all');
                        setSelectedPriorityFilter('all');
                        setIsFilterDropdownOpen(false);
                      }}
                      className="text-[11px] text-orange-600 hover:underline cursor-pointer font-medium"
                    >
                      Reset All
                    </button>
                  </div>

                  {/* Subsystem filter */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">Squad / Subsystem</label>
                    <select
                      value={selectedSubsystemFilter}
                      onChange={(e) => {
                        setSelectedSubsystemFilter(e.target.value);
                        setDesktopTablePage(1);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    >
                      <option value="all">All Squads ({tasks.length})</option>
                      {TEAMS_LIST.map((tm) => (
                        <option key={tm.id} value={tm.id}>
                          {tm.shortName} ({tasks.filter((t) => t.teamId === tm.id).length})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Priority filter */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 uppercase">Priority</label>
                    <select
                      value={selectedPriorityFilter}
                      onChange={(e) => {
                        setSelectedPriorityFilter(e.target.value);
                        setDesktopTablePage(1);
                      }}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:ring-1 focus:ring-orange-500 focus:outline-none"
                    >
                      <option value="all">All Priorities</option>
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* View Mode Switcher (Table vs Kanban) */}
            <div className="p-1 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => setDesktopViewMode('table')}
                title="Table View (Mockup 2)"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  desktopViewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setDesktopViewMode('kanban')}
                title="Kanban Board View"
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  desktopViewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* View Mode 1: Uniform Tasks Table Matching Mockup 2 */}
        {desktopViewMode === 'table' ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                    <th className="py-3.5 pl-6 pr-3 w-10">
                      <input
                        type="checkbox"
                        checked={paginatedTasks.length > 0 && paginatedTasks.every((t) => selectedTaskIds.has(t.id))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTaskIds(new Set([...Array.from(selectedTaskIds), ...paginatedTasks.map((t) => t.id)]));
                          } else {
                            const next = new Set(selectedTaskIds);
                            paginatedTasks.forEach((t) => next.delete(t.id));
                            setSelectedTaskIds(next);
                          }
                        }}
                        className="rounded text-orange-500 focus:ring-orange-500"
                      />
                    </th>
                    <th className="py-3.5 px-3">Task</th>
                    <th className="py-3.5 px-3">Team</th>
                    <th className="py-3.5 px-3">Priority</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Assignee</th>
                    <th className="py-3.5 px-3">Due Date</th>
                    <th className="py-3.5 pr-6 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-xs">
                  {paginatedTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                        No tasks match the active filters.
                      </td>
                    </tr>
                  ) : (
                    paginatedTasks.map((task) => {
                      const isChecked = selectedTaskIds.has(task.id);
                      const domainInfo = getDomainBadge(task.teamId);

                      // Priority styling matching Mockup 2 with clean SVG vector icons (no emojis)
                      const priorityPill =
                        task.priority === 'urgent' || task.priority === 'high'
                          ? {
                              label: 'High',
                              icon: (
                                <svg className="w-2.5 h-2.5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                                </svg>
                              ),
                              class: 'bg-rose-50 text-rose-600 border-rose-200',
                            }
                          : task.priority === 'medium'
                          ? {
                              label: 'Medium',
                              icon: (
                                <svg className="w-2.5 h-2.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14" />
                                </svg>
                              ),
                              class: 'bg-amber-50 text-amber-600 border-amber-200',
                            }
                          : {
                              label: 'Low',
                              icon: (
                                <svg className="w-2.5 h-2.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                </svg>
                              ),
                              class: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                            };

                      // Status pill matching Mockup 2 with clean SVG vector icons (no emojis)
                      const statusPill =
                        task.status === 'done'
                          ? {
                              label: 'Completed',
                              icon: (
                                <svg className="w-2.5 h-2.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              ),
                              class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                            }
                          : task.status === 'in_progress'
                          ? {
                              label: 'In Progress',
                              icon: (
                                <svg className="w-2 h-2 text-amber-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              ),
                              class: 'bg-amber-50 text-amber-700 border-amber-200',
                            }
                          : task.status === 'review'
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
                              label: 'To Do',
                              icon: (
                                <span className="w-1.5 h-1.5 rounded-full border border-slate-400 shrink-0" />
                              ),
                              class: 'bg-slate-50 text-slate-700 border-slate-200',
                            };

                      // Due date formatted
                      const dueDateFormatted = task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—';

                      return (
                        <tr
                          key={task.id}
                          onClick={() => handleOpenTaskDetail(task)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          {/* Checkbox */}
                          <td className="py-3.5 pl-6 pr-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const next = new Set(selectedTaskIds);
                                if (e.target.checked) next.add(task.id);
                                else next.delete(task.id);
                                setSelectedTaskIds(next);
                              }}
                              className="rounded text-orange-500 focus:ring-orange-500"
                            />
                          </td>

                          {/* Task Title */}
                          <td className="py-3.5 px-3 font-semibold text-slate-900 group-hover:text-orange-600 transition-colors max-w-xs truncate">
                            {task.title}
                          </td>

                          {/* Team */}
                          <td className="py-3.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${domainInfo.bg}`}>
                              {domainInfo.code}
                            </span>
                          </td>

                          {/* Priority */}
                          <td className="py-3.5 px-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${priorityPill.class}`}>
                              {priorityPill.icon}
                              <span>{priorityPill.label}</span>
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusPill.class}`}>
                              {statusPill.icon}
                              <span>{statusPill.label}</span>
                            </span>
                          </td>

                          {/* Assignees */}
                          <td className="py-3.5 px-3">
                            {task.assignedMembers && task.assignedMembers.length > 0 ? (
                              <div className="flex items-center -space-x-1.5">
                                {task.assignedMembers.slice(0, 3).map((name) => (
                                  <span
                                    key={name}
                                    title={name}
                                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-bold border-2 border-white uppercase shadow-xs ${getAvatarColorClass(name)}`}
                                  >
                                    {getMemberInitials(name)}
                                  </span>
                                ))}
                                {task.assignedMembers.length > 3 && (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-bold bg-slate-200 text-slate-700 border-2 border-white">
                                    +{task.assignedMembers.length - 3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Unassigned</span>
                            )}
                          </td>

                          {/* Due Date */}
                          <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>{dueDateFormatted}</span>
                            </div>
                          </td>

                          {/* Action */}
                          <td className="py-3.5 pr-6 pl-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleOpenTaskDetail(task)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="View Task Details"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer Matching Mockup 2 */}
            <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-sans">
              <span>
                Showing {desktopFilteredTasks.length > 0 ? (desktopTablePage - 1) * ITEMS_PER_PAGE + 1 : 0}–
                {Math.min(desktopTablePage * ITEMS_PER_PAGE, desktopFilteredTasks.length)} of {desktopFilteredTasks.length} tasks
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={desktopTablePage <= 1}
                  onClick={() => setDesktopTablePage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  &lt;
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setDesktopTablePage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      desktopTablePage === pg
                        ? 'bg-[#0e131f] text-white shadow-xs'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pg}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={desktopTablePage >= totalPages}
                  onClick={() => setDesktopTablePage((p) => Math.min(totalPages, p + 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* View Mode 2: Kanban Columns Drag and Drop */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {STATUS_COLUMNS.map((col) => {
              const columnTasks = desktopFilteredTasks.filter((t) => t.status === col.id);

              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col min-h-[200px] h-fit shadow-xs"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                      <h3 className="text-sm font-sans font-bold text-slate-800">
                        {col.label}
                      </h3>
                    </div>
                    <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-3.5 flex-1 overflow-y-auto pr-0.5">
                    {columnTasks.length === 0 ? (
                      <div className="py-8 px-4 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-sans text-slate-500 font-medium">
                          No tasks in {col.label}
                        </span>
                        <span className="text-[11px] font-sans text-slate-400 mt-1">
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
                            className="group bg-slate-50/50 hover:bg-white border border-slate-200 hover:border-orange-500 rounded-xl p-3.5 sm:p-4 shadow-2xs hover:shadow-md transition-all space-y-3 cursor-pointer relative"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[11px] font-sans font-semibold border whitespace-nowrap flex-shrink-0 ${
                                  taskTeam ? taskTeam.badgeBg : 'bg-slate-100 text-slate-800 border-slate-200'
                                }`}
                              >
                                {taskTeam ? taskTeam.shortName : task.teamId}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase tracking-wider ${priorityInfo.bg}`}>
                                {priorityInfo.label}
                              </span>
                            </div>

                            <h4 className="text-sm font-sans font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                              {task.title}
                            </h4>

                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-2">
                              {dueInfo && <span className={`text-[11px] ${dueInfo.className}`}>{dueInfo.text}</span>}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenTaskDetail(task);
                                }}
                                className="text-xs text-slate-500 hover:text-slate-900"
                              >
                                Details &rarr;
                              </button>
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
        )}
      </div>
    </div>
  );
}