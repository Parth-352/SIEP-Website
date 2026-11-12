"use client";

import React from 'react';
import Link from 'next/link';
import { TEAMS_LIST } from '@/lib/teams';
import { UserProfile, Task, ActivityEvent } from '@/lib/types';
import { DashboardTab } from '@/types/dashboard';

interface OperationsHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  isOnline: boolean;
  pendingQueueCount: number;
  isCore: boolean;
  isLead: boolean;
  isCoreAdmin: boolean;
  tasks: Task[];
  myAssignedCount: number;
  videoLogsCount: number;
  activities: ActivityEvent[];
  unreadActivitiesCount: number;
  completedTasks: number;
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  setIsActivityDrawerOpen: (open: boolean) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  setIsBackupModalOpen: (open: boolean) => void;
  handleOpenActivityDrawer: () => void;
  selectedSubsystemFilter: string;
  setSelectedSubsystemFilter: (filter: string) => void;
  isManualSyncing: boolean;
  handleManualSync: () => void;
  isInstalled: boolean;
  installApp: (() => void) | null;
  onSignOut: () => void;
}

export default function OperationsHubModal({
  isOpen,
  onClose,
  user,
  isOnline,
  pendingQueueCount,
  isCore,
  isLead,
  isCoreAdmin,
  tasks,
  myAssignedCount,
  videoLogsCount,
  activities,
  unreadActivitiesCount,
  completedTasks,
  activeTab,
  setActiveTab,
  setIsActivityDrawerOpen,
  setIsCreateModalOpen,
  setIsBackupModalOpen,
  handleOpenActivityDrawer,
  selectedSubsystemFilter,
  setSelectedSubsystemFilter,
  isManualSyncing,
  handleManualSync,
  isInstalled,
  installApp,
  onSignOut,
}: OperationsHubModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-jet-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      {/* Bottom Sheet Modal */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl max-h-[85vh] sm:max-h-[80vh] w-full sm:max-w-lg flex flex-col shadow-2xl border border-jet-black/15 z-10 animate-in slide-in-from-bottom duration-200 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {/* Handle & Header */}
        <div className="pt-3 pb-2.5 px-5 flex flex-col items-center border-b border-jet-black/10">
          <div className="w-12 h-1.5 bg-jet-black/20 rounded-full mb-3" />
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse" />
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-jet-black">
                Operations Hub
              </h3>
              {isOnline ? (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  LIVE
                </span>
              ) : (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold border border-amber-200">
                  OFFLINE ({pendingQueueCount})
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-alice-blue flex items-center justify-center text-grey hover:text-jet-black font-bold text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="w-full mt-2 flex items-center justify-between text-[11px] font-mono text-grey">
            <span>
              Signed in: <strong className="text-jet-black">{user.displayName}</strong>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-jet-black/5 text-jet-black font-bold uppercase">
              {user.teamId}
            </span>
          </div>
        </div>

        {/* Sheet Content Scrollable Area */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(85vh-100px)]">
          {/* Primary Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                setIsCreateModalOpen(true);
              }}
              className="p-3 rounded-2xl bg-orange text-white font-mono text-xs font-bold shadow-md shadow-orange/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Deliverable</span>
            </button>

            {isCore || isLead ? (
              <Link
                href="/log"
                onClick={onClose}
                className="p-3 rounded-2xl bg-jet-black text-alice-blue font-mono text-xs font-bold shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
              >
                <span>Open Build Log</span>
                <span>→</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isManualSyncing}
                className="p-3 rounded-2xl bg-alice-blue border border-jet-black/10 text-jet-black font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
              >
                <svg
                  className={`w-4 h-4 ${isManualSyncing ? 'animate-spin' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isManualSyncing ? 'Syncing...' : 'Sync Database'}</span>
              </button>
            )}
          </div>

          {/* All Views Grid */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-grey font-bold">
              All Portals &amp; Views
            </span>
            <div className="grid grid-cols-2 gap-2">
              {/* Task Board */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('team_tasks');
                  setIsActivityDrawerOpen(false);
                  onClose();
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'team_tasks' || activeTab === 'kanban'
                    ? 'border-orange bg-orange/5 text-jet-black font-bold'
                    : 'border-jet-black/10 bg-white hover:bg-alice-blue/60 text-jet-black'
                }`}
              >
                <svg className="w-5 h-5 text-jet-black shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <div className="truncate">
                  <div className="text-xs font-mono font-bold truncate">Task Board</div>
                  <div className="text-[10px] text-grey font-mono truncate">{tasks.length} deliverables</div>
                </div>
              </button>

              {/* My Tasks */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('my_tasks');
                  setIsActivityDrawerOpen(false);
                  onClose();
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'my_tasks'
                    ? 'border-orange bg-orange/5 text-jet-black font-bold'
                    : 'border-jet-black/10 bg-white hover:bg-alice-blue/60 text-jet-black'
                }`}
              >
                <svg className="w-5 h-5 text-jet-black shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <div className="truncate">
                  <div className="text-xs font-mono font-bold truncate">My Workbench</div>
                  <div className="text-[10px] text-orange font-mono font-bold truncate">
                    {myAssignedCount} assigned
                  </div>
                </div>
              </button>

              {/* Squads */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('teams');
                  setIsActivityDrawerOpen(false);
                  onClose();
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'teams'
                    ? 'border-orange bg-orange/5 text-jet-black font-bold'
                    : 'border-jet-black/10 bg-white hover:bg-alice-blue/60 text-jet-black'
                }`}
              >
                <svg className="w-5 h-5 text-jet-black shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeWidth="2" />
                  <polygon points="16 8 13.5 13.5 8 16 10.5 10.5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="truncate">
                  <div className="text-xs font-mono font-bold truncate">9 Subsystems</div>
                  <div className="text-[10px] text-grey font-mono truncate">Squad leads &amp; tasks</div>
                </div>
              </button>

              {/* Master Video Gallery */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('videos');
                  setIsActivityDrawerOpen(false);
                  onClose();
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'videos'
                    ? 'border-orange bg-orange/5 text-jet-black font-bold'
                    : 'border-jet-black/10 bg-white hover:bg-alice-blue/60 text-jet-black'
                }`}
              >
                <svg className="w-5 h-5 text-jet-black shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <div className="truncate">
                  <div className="text-xs font-mono font-bold truncate">Video Archive</div>
                  <div className="text-[10px] text-grey font-mono truncate">{videoLogsCount} clips stream</div>
                </div>
              </button>

              {/* Live Moves Feed */}
              <button
                type="button"
                onClick={() => {
                  handleOpenActivityDrawer();
                  onClose();
                }}
                className="p-3 rounded-xl border border-jet-black/10 bg-white hover:bg-alice-blue/60 text-jet-black text-left flex items-center gap-2.5 transition-all cursor-pointer"
              >
                <svg className="w-5 h-5 text-jet-black shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="truncate">
                  <div className="text-xs font-mono font-bold truncate">Live Moves Feed</div>
                  <div className="text-[10px] text-grey font-mono truncate">
                    {unreadActivitiesCount > 0 ? `${unreadActivitiesCount} unread` : `${activities.length} moves`}
                  </div>
                </div>
              </button>

              {/* Team Metrics & Velocity */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('metrics');
                  setIsActivityDrawerOpen(false);
                  onClose();
                }}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                  activeTab === 'metrics'
                    ? 'border-orange bg-orange/5 text-jet-black font-bold'
                    : 'border-jet-black/10 bg-white hover:bg-alice-blue/60 text-jet-black'
                }`}
              >
                <svg className="w-5 h-5 text-jet-black shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div className="truncate">
                  <div className="text-xs font-mono font-bold truncate">Velocity &amp; Metrics</div>
                  <div className="text-[10px] text-grey font-mono truncate">
                    {completedTasks}/{tasks.length} done
                  </div>
                </div>
              </button>

              {/* Core Admin Credentials */}
              {isCoreAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('accounts');
                    setIsActivityDrawerOpen(false);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                    activeTab === 'accounts'
                      ? 'border-orange bg-orange/5 text-jet-black font-bold'
                      : 'border-jet-black/10 bg-white hover:bg-alice-blue/60 text-jet-black'
                  }`}
                >
                  <svg className="w-5 h-5 text-jet-black shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  <div className="truncate">
                    <div className="text-xs font-mono font-bold truncate">Team Credentials</div>
                    <div className="text-[10px] text-orange font-mono font-bold truncate">Core Admin Only</div>
                  </div>
                </button>
              )}

              {/* Core Admin Backup & Sync */}
              {isCoreAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    setIsBackupModalOpen(true);
                  }}
                  className="p-3 rounded-xl border border-jet-black/10 bg-white hover:bg-alice-blue/60 text-jet-black text-left flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5 text-jet-black shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                  </svg>
                  <div className="truncate">
                    <div className="text-xs font-mono font-bold truncate">Backup / Sync</div>
                    <div className="text-[10px] text-grey font-mono truncate">JSON export &amp; reset</div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Instant Subsystem Filter Row */}
          <div className="space-y-1.5 pt-1 border-t border-jet-black/10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-grey font-bold">
                Instant Squad Filter on Board
              </span>
              {selectedSubsystemFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubsystemFilter('all');
                    setActiveTab('team_tasks');
                    onClose();
                  }}
                  className="text-[10px] font-mono text-orange font-bold cursor-pointer underline"
                >
                  Clear Filter
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
              <button
                type="button"
                onClick={() => {
                  setSelectedSubsystemFilter('all');
                  setActiveTab('team_tasks');
                  onClose();
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap cursor-pointer transition-all ${
                  selectedSubsystemFilter === 'all'
                    ? 'bg-jet-black text-white font-bold'
                    : 'bg-alice-blue text-jet-black border border-jet-black/10'
                }`}
              >
                All Squads
              </button>
              {TEAMS_LIST.map((tm) => (
                <button
                  key={tm.id}
                  type="button"
                  onClick={() => {
                    setSelectedSubsystemFilter(tm.id);
                    setActiveTab('team_tasks');
                    onClose();
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                    selectedSubsystemFilter === tm.id
                      ? 'bg-orange text-white font-bold'
                      : 'bg-alice-blue text-jet-black border border-jet-black/10'
                  }`}
                >
                  <span>[{tm.code}]</span>
                  <span>{tm.shortName}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Utilities & Sign Out */}
          <div className="pt-2 border-t border-jet-black/10 flex items-center justify-between gap-3 text-xs font-mono">
            {!isInstalled && installApp ? (
              <button
                type="button"
                onClick={() => {
                  installApp();
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-jet-black text-alice-blue font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Install Web App</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isManualSyncing}
                className="text-grey hover:text-jet-black flex items-center gap-1 cursor-pointer"
              >
                <svg className={`w-3.5 h-3.5 ${isManualSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{isManualSyncing ? 'Syncing...' : 'Force Sync'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onSignOut}
              className="text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-rose-50"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
