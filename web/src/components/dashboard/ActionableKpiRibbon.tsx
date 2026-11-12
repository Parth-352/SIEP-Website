"use client";

import React from 'react';
import { DashboardTab, SpecialDeadlineFilter } from '@/types/dashboard';

interface ActionableKpiRibbonProps {
  totalTasksCount: number;
  activeTasksCount: number;
  dueThisWeekCount: number;
  overdueCount: number;
  underReviewCount: number;
  setSpecialDeadlineFilter: (filter: SpecialDeadlineFilter) => void;
  setSelectedSubsystemFilter: (filter: string) => void;
  setAssignedToMeOnly: (assigned: boolean) => void;
  setActiveTab: (tab: DashboardTab) => void;
}

export default function ActionableKpiRibbon({
  totalTasksCount,
  activeTasksCount,
  dueThisWeekCount,
  overdueCount,
  underReviewCount,
  setSpecialDeadlineFilter,
  setSelectedSubsystemFilter,
  setAssignedToMeOnly,
  setActiveTab,
}: ActionableKpiRibbonProps) {
  return (
    <div className="bg-white border border-jet-black/10 rounded-2xl shadow-xs overflow-hidden grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 divide-x divide-jet-black/10">
      {/* Card 1: Total Active Deliverables */}
      <div
        onClick={() => {
          setSpecialDeadlineFilter('all');
          setSelectedSubsystemFilter('all');
          setAssignedToMeOnly(false);
          setActiveTab('team_tasks');
        }}
        className="p-3.5 sm:p-4 hover:bg-alice-blue/50 transition-colors cursor-pointer group flex flex-col justify-between"
        title="Click to view all tasks"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
            Deliverables
          </span>
          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 font-bold group-hover:bg-jet-black group-hover:text-white transition-colors">
            {totalTasksCount} Total
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-jet-black">
            {activeTasksCount}
          </span>
          <span className="text-xs text-zinc-600 font-sans">active in flight</span>
        </div>
      </div>

      {/* Card 2: Due This Week */}
      <div
        onClick={() => {
          setSpecialDeadlineFilter('due_week');
          setActiveTab('team_tasks');
        }}
        className="p-3.5 sm:p-4 hover:bg-alice-blue/50 transition-colors cursor-pointer group flex flex-col justify-between"
        title="Click to filter tasks due this week"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
            Due This Week
          </span>
          <span
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
              dueThisWeekCount > 0 ? 'bg-orange/15 text-orange' : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            Next 7 Days
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span
            className={`text-2xl sm:text-3xl font-extrabold font-mono ${
              dueThisWeekCount > 0 ? 'text-orange' : 'text-jet-black'
            }`}
          >
            {dueThisWeekCount}
          </span>
          <span className="text-xs text-zinc-600 font-sans">upcoming deadlines</span>
        </div>
      </div>

      {/* Card 3: Overdue Deliverables */}
      <div
        onClick={() => {
          setSpecialDeadlineFilter('overdue');
          setActiveTab('team_tasks');
        }}
        className="p-3.5 sm:p-4 hover:bg-alice-blue/50 transition-colors cursor-pointer group flex flex-col justify-between"
        title="Click to filter overdue tasks"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
            Overdue
          </span>
          {overdueCount > 0 ? (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold animate-pulse">
              Action Required
            </span>
          ) : (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              On Track
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span
            className={`text-2xl sm:text-3xl font-extrabold font-mono ${
              overdueCount > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {overdueCount}
          </span>
          <span className="text-xs text-zinc-600 font-sans">
            {overdueCount > 0 ? 'past deadline' : 'all on schedule'}
          </span>
        </div>
      </div>

      {/* Card 4: Waiting for Review */}
      <div
        onClick={() => {
          setSpecialDeadlineFilter('review');
          setActiveTab('team_tasks');
        }}
        className="p-3.5 sm:p-4 hover:bg-alice-blue/50 transition-colors cursor-pointer group flex flex-col justify-between"
        title="Click to filter review queue"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
            Review Queue
          </span>
          <span
            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
              underReviewCount > 0 ? 'bg-purple-100 text-purple-700' : 'bg-zinc-100 text-zinc-600'
            }`}
          >
            Lead Sign-off
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span
            className={`text-2xl sm:text-3xl font-extrabold font-mono ${
              underReviewCount > 0 ? 'text-purple-600' : 'text-jet-black'
            }`}
          >
            {underReviewCount}
          </span>
          <span className="text-xs text-zinc-600 font-sans">under verification</span>
        </div>
      </div>
    </div>
  );
}
