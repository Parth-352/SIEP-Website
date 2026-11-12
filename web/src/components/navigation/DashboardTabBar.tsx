"use client";

import React from 'react';
import { DashboardTab } from '@/types/dashboard';

interface DashboardTabBarProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  filteredTasksCount: number;
  myAssignedCount: number;
  teamsCount: number;
  videoLogsCount: number;
  completedTasksCount: number;
  totalTasksCount: number;
  isCore: boolean;
}

export default function DashboardTabBar({
  activeTab,
  setActiveTab,
  filteredTasksCount,
  myAssignedCount,
  teamsCount,
  videoLogsCount,
  completedTasksCount,
  totalTasksCount,
  isCore,
}: DashboardTabBarProps) {
  return (
    <div className="bg-white border border-jet-black/10 rounded-2xl p-1.5 sm:p-2 shadow-xs flex items-center gap-1.5 sm:gap-2 overflow-x-auto hide-scrollbar">
      {/* 1. Dashboard */}
      <button
        type="button"
        onClick={() => setActiveTab('dashboard')}
        className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-sans font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
          activeTab === 'dashboard'
            ? 'bg-jet-black text-alice-blue font-semibold shadow-sm'
            : 'text-zinc-600 hover:text-jet-black hover:bg-alice-blue/70'
        }`}
      >
        <span>Dashboard</span>
      </button>

      {/* 2. Team Tasks */}
      <button
        type="button"
        onClick={() => setActiveTab('team_tasks')}
        className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-sans font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
          activeTab === 'team_tasks' || activeTab === 'kanban'
            ? 'bg-jet-black text-alice-blue font-semibold shadow-sm'
            : 'text-zinc-600 hover:text-jet-black hover:bg-alice-blue/70'
        }`}
      >
        <span>Team Tasks</span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === 'team_tasks' || activeTab === 'kanban'
              ? 'bg-white/20 text-alice-blue'
              : 'bg-jet-black/10 text-zinc-700'
          }`}
        >
          {filteredTasksCount}
        </span>
      </button>

      {/* 3. My Tasks */}
      <button
        type="button"
        onClick={() => setActiveTab('my_tasks')}
        className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-sans font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
          activeTab === 'my_tasks'
            ? 'bg-jet-black text-alice-blue font-semibold shadow-sm'
            : 'text-zinc-600 hover:text-jet-black hover:bg-alice-blue/70'
        }`}
      >
        <span>My Tasks</span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === 'my_tasks'
              ? 'bg-orange text-white'
              : myAssignedCount > 0
              ? 'bg-orange/15 text-orange'
              : 'bg-jet-black/10 text-zinc-700'
          }`}
        >
          {myAssignedCount}
        </span>
      </button>

      {/* 4. Profile */}
      <button
        type="button"
        onClick={() => setActiveTab('profile')}
        className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-sans font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
          activeTab === 'profile'
            ? 'bg-jet-black text-alice-blue font-semibold shadow-sm'
            : 'text-zinc-600 hover:text-jet-black hover:bg-alice-blue/70'
        }`}
      >
        <span>Profile</span>
      </button>

      {/* 5. Subsystems */}
      <button
        type="button"
        onClick={() => setActiveTab('teams')}
        className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-sans font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
          activeTab === 'teams'
            ? 'bg-jet-black text-alice-blue font-semibold shadow-sm'
            : 'text-zinc-600 hover:text-jet-black hover:bg-alice-blue/70'
        }`}
      >
        <span>Subsystems</span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === 'teams' ? 'bg-white/20 text-alice-blue' : 'bg-jet-black/10 text-zinc-700'
          }`}
        >
          {teamsCount}
        </span>
      </button>

      {/* 6. Videos */}
      <button
        type="button"
        onClick={() => setActiveTab('videos')}
        className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-sans font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
          activeTab === 'videos'
            ? 'bg-jet-black text-alice-blue font-semibold shadow-sm'
            : 'text-zinc-600 hover:text-jet-black hover:bg-alice-blue/70'
        }`}
      >
        <span>Videos</span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === 'videos' ? 'bg-white/20 text-alice-blue' : 'bg-jet-black/10 text-zinc-700'
          }`}
        >
          {videoLogsCount}
        </span>
      </button>

      {/* 7. Metrics */}
      <button
        type="button"
        onClick={() => setActiveTab('metrics')}
        className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-sans font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
          activeTab === 'metrics'
            ? 'bg-jet-black text-alice-blue font-semibold shadow-sm'
            : 'text-zinc-600 hover:text-jet-black hover:bg-alice-blue/70'
        }`}
      >
        <span>Metrics</span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            activeTab === 'metrics' ? 'bg-white/20 text-alice-blue' : 'bg-jet-black/10 text-zinc-700'
          }`}
        >
          {completedTasksCount}/{totalTasksCount}
        </span>
      </button>

      {/* 8. Credentials (Core only) */}
      {isCore && (
        <button
          type="button"
          onClick={() => setActiveTab('accounts')}
          className={`px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-sans font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ml-auto ${
            activeTab === 'accounts'
              ? 'bg-jet-black text-alice-blue font-semibold shadow-sm'
              : 'text-zinc-600 hover:text-jet-black hover:bg-alice-blue/70'
          }`}
        >
          <span>Credentials</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange/20 text-orange font-bold uppercase">
            Core
          </span>
        </button>
      )}
    </div>
  );
}
