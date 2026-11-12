"use client";

import React from 'react';
import { TEAMS } from '@/lib/teams';
import { UserProfile } from '@/lib/types';

interface DashboardHeaderProps {
  user: UserProfile;
  isCore: boolean;
  isCoreAdmin: boolean;
  isOnline: boolean;
  pendingQueueCount: number;
  unreadActivitiesCount: number;
  isMoreMenuOpen: boolean;
  setIsMoreMenuOpen: (open: boolean) => void;
  handleOpenActivityDrawer: () => void;
  setIsBackupModalOpen: (open: boolean) => void;
  setIsCreateModalOpen: (open: boolean) => void;
  isInstalled: boolean;
  installApp: (() => void) | null;
  restrictedNotice: boolean;
  dismissRestrictedNotice: () => void;
}

export default function DashboardHeader({
  user,
  isCore,
  isCoreAdmin,
  isOnline,
  pendingQueueCount,
  unreadActivitiesCount,
  isMoreMenuOpen,
  setIsMoreMenuOpen,
  handleOpenActivityDrawer,
  setIsBackupModalOpen,
  setIsCreateModalOpen,
  isInstalled,
  installApp,
  restrictedNotice,
  dismissRestrictedNotice,
}: DashboardHeaderProps) {
  return (
    <div className="bg-white border border-jet-black/10 rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
              {isCore ? 'Operations Center • Central Leadership' : `Squad Console • ${TEAMS[user.teamId]?.name || user.teamName}`}
            </span>

            {isOnline ? (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>LIVE</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[9px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Offline ({pendingQueueCount})</span>
              </div>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-jet-black tracking-tight">
            Project Operations Dashboard
          </h1>
          <p className="text-zinc-600 text-xs sm:text-sm font-light">
            SIEP 2026–27 electric scrambler build deliverables, tasks, and telemetry.
          </p>
        </div>

        {/* Quick Header Actions: More Dropdown + Primary Create Task */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* More Actions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="px-3.5 py-2 sm:py-2.5 rounded-xl border border-jet-black/15 bg-white hover:bg-alice-blue text-jet-black text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="More actions"
            >
              <span>More</span>
              <span className="text-[10px] text-zinc-500">▼</span>
              {unreadActivitiesCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-orange text-white text-[9px] font-bold">
                  {unreadActivitiesCount}
                </span>
              )}
            </button>

            {isMoreMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsMoreMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white border border-jet-black/10 rounded-xl shadow-lg z-50 py-1 text-xs divide-y divide-jet-black/5 animate-fade-in">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      handleOpenActivityDrawer();
                    }}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-alice-blue flex items-center justify-between text-jet-black cursor-pointer font-medium"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange" />
                      <span>Squad Activity Feed</span>
                    </span>
                    {unreadActivitiesCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-orange text-white text-[9px] font-bold">
                        {unreadActivitiesCount}
                      </span>
                    )}
                  </button>

                  {isCoreAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        setIsBackupModalOpen(true);
                      }}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-alice-blue flex items-center gap-2 text-jet-black cursor-pointer font-medium"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-jet-black" />
                      <span>Database Backup &amp; Sync</span>
                    </button>
                  )}

                  {!isInstalled && installApp && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        installApp();
                      }}
                      className="w-full px-3.5 py-2.5 text-left hover:bg-alice-blue flex items-center gap-2 text-jet-black cursor-pointer font-medium"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      <span>Install Web App</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Primary Create Task Button */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-semibold text-xs sm:text-sm shadow-sm cursor-pointer flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Access Restriction Notice Banner */}
      {restrictedNotice && (
        <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-amber-900 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>
              The <strong>Engineering Log System (/log)</strong> is reserved for Core Leadership and Domain Leads.
            </span>
          </div>
          <button
            type="button"
            onClick={dismissRestrictedNotice}
            className="text-zinc-500 hover:text-jet-black font-bold text-sm px-2 cursor-pointer"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
