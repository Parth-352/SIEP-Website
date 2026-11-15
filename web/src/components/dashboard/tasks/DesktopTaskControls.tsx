"use client";

import React from 'react';
import { TEAMS_LIST } from '@/lib/teams';
import { Task } from '@/lib/types';

interface DesktopTaskControlsProps {
  desktopFilterPill: 'all' | 'my' | 'assigned' | 'review' | 'completed';
  setDesktopFilterPill: (pill: 'all' | 'my' | 'assigned' | 'review' | 'completed') => void;
  setDesktopTablePage: (page: number) => void;
  totalTasksCount: number;
  myAssignedCount: number;
  desktopAssignedCount: number;
  desktopReviewCount: number;
  desktopDoneCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isFilterDropdownOpen: boolean;
  setIsFilterDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedSubsystemFilter: string;
  setSelectedSubsystemFilter: (val: string) => void;
  selectedPriorityFilter: string;
  setSelectedPriorityFilter: (val: string) => void;
  tasks: Task[];
  desktopViewMode: 'table' | 'kanban';
  setDesktopViewMode: (mode: 'table' | 'kanban') => void;
}

export default function DesktopTaskControls({
  desktopFilterPill,
  setDesktopFilterPill,
  setDesktopTablePage,
  totalTasksCount,
  myAssignedCount,
  desktopAssignedCount,
  desktopReviewCount,
  desktopDoneCount,
  searchQuery,
  setSearchQuery,
  isFilterDropdownOpen,
  setIsFilterDropdownOpen,
  selectedSubsystemFilter,
  setSelectedSubsystemFilter,
  selectedPriorityFilter,
  setSelectedPriorityFilter,
  tasks,
  desktopViewMode,
  setDesktopViewMode,
}: DesktopTaskControlsProps) {
  return (
    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      {/* Filter Pills on the left */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {[
          { id: 'all', label: 'All Tasks', count: totalTasksCount },
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
  );
}
