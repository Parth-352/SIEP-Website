"use client";

import React from 'react';
import { TEAMS } from '@/lib/teams';
import { Task, TaskStatus } from '@/lib/types';
import { getDomainBadge, getPriorityIndicator, formatMobileDueDate } from './taskBadgeUtils';

interface MobileTeamTasksViewProps {
  filteredTasks: Task[];
  mobileStatusTab: TaskStatus;
  setMobileStatusTab: (status: TaskStatus) => void;
  todoCount: number;
  inProgressCount: number;
  reviewCount: number;
  doneCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSubsystemFilter: string;
  setSelectedSubsystemFilter: (subsystem: string) => void;
  selectedPriorityFilter: string;
  setSelectedPriorityFilter: (priority: string) => void;
  setAssignedToMeOnly: (val: boolean) => void;
  availableSquads: { id: string; shortName: string; name: string }[];
  visibleMobileTasks: Task[];
  handleOpenTaskDetail: (task: Task) => void;
}

export default function MobileTeamTasksView({
  filteredTasks,
  mobileStatusTab,
  setMobileStatusTab,
  todoCount,
  inProgressCount,
  reviewCount,
  doneCount,
  searchQuery,
  setSearchQuery,
  selectedSubsystemFilter,
  setSelectedSubsystemFilter,
  selectedPriorityFilter,
  setSelectedPriorityFilter,
  setAssignedToMeOnly,
  availableSquads,
  visibleMobileTasks,
  handleOpenTaskDetail,
}: MobileTeamTasksViewProps) {
  return (
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
  );
}
