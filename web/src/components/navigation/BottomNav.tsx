"use client";

import React from 'react';
import Link from 'next/link';
import { DashboardTab } from '@/types/dashboard';

interface BottomNavProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  filteredTasksCount: number;
  myAssignedCount: number;
  isCore: boolean;
  isLead: boolean;
  userDisplayName?: string;
  userPhotoUrl?: string;
  isInputFocused: boolean;
  isCreateActionSheetOpen: boolean;
  setIsCreateActionSheetOpen: (open: boolean) => void;
  setIsActivityDrawerOpen: (open: boolean) => void;
  openCreateModal: () => void;
}

export default function BottomNav({
  activeTab,
  setActiveTab,
  filteredTasksCount,
  myAssignedCount,
  isCore,
  isLead,
  userDisplayName,
  userPhotoUrl,
  isInputFocused,
  isCreateActionSheetOpen,
  setIsCreateActionSheetOpen,
  setIsActivityDrawerOpen,
  openCreateModal,
}: BottomNavProps) {
  const canCreate = Boolean(isCore || isLead);

  return (
    <>
      {/* =========================================================================
          INSTAGRAM-STYLE BOTTOM NAVIGATION DOCK
          Rendered EXCLUSIVELY in the installed Mobile Web App (standalone PWA mode).
          Never loaded or rendered in standard web browsers (mobile Chrome, Safari, etc.).
          Item 1: Dashboard (General Info & Executive Overview)
          Item 2: Team Tasks (To-do list scoped strictly to user's assigned teams)
          Item 3: Center [+] Button (Instagram style - ONLY for Leads & Core leadership)
          Item 4: Assigned to Me (Personal Workbench)
          Item 5: Personal Profile (Identity, Assigned Domains & PIN change)
         ========================================================================= */}
      <nav
        aria-label="Instagram Bottom Navigation"
        className={`fixed z-50 transition-all duration-300 ${
          isInputFocused ? 'translate-y-32 pointer-events-none opacity-0' : 'translate-y-0 opacity-100'
        } bottom-0 left-0 right-0 sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 sm:w-[94%] sm:max-w-md sm:rounded-2xl sm:shadow-[0_12px_45px_rgba(0,0,0,0.18)] sm:border sm:border-jet-black/15 bg-white/95 backdrop-blur-xl border-t border-jet-black/10 px-3 pt-2 sm:py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))]`}
      >
        <div className="flex items-center justify-between max-w-md mx-auto px-1 sm:px-2">
          {/* 1. Dashboard */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('dashboard');
              setIsActivityDrawerOpen(false);
              setIsCreateActionSheetOpen(false);
            }}
            title="Dashboard Overview"
            className={`flex flex-col items-center justify-center py-1 px-2.5 transition-all cursor-pointer group ${
              activeTab === 'dashboard' && !isCreateActionSheetOpen
                ? 'text-jet-black scale-105'
                : 'text-grey hover:text-jet-black'
            }`}
          >
            <div className="relative">
              {activeTab === 'dashboard' && !isCreateActionSheetOpen ? (
                <svg className="w-6 h-6 text-jet-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              )}
            </div>
            <span
              className={`text-[10px] font-mono tracking-tight mt-0.5 ${
                activeTab === 'dashboard' && !isCreateActionSheetOpen ? 'font-bold text-jet-black' : 'font-medium'
              }`}
            >
              Dashboard
            </span>
          </button>

          {/* 2. Team Tasks */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('team_tasks');
              setIsActivityDrawerOpen(false);
              setIsCreateActionSheetOpen(false);
            }}
            title="Team Deliverables & Tasks"
            className={`flex flex-col items-center justify-center py-1 px-2.5 transition-all cursor-pointer group ${
              (activeTab === 'team_tasks' || activeTab === 'kanban') && !isCreateActionSheetOpen
                ? 'text-jet-black scale-105'
                : 'text-grey hover:text-jet-black'
            }`}
          >
            <div className="relative">
              {(activeTab === 'team_tasks' || activeTab === 'kanban') && !isCreateActionSheetOpen ? (
                <svg className="w-6 h-6 text-jet-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              )}
              {filteredTasksCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-jet-black/10 text-jet-black text-[9px] font-mono rounded-full font-bold">
                  {filteredTasksCount}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-mono tracking-tight mt-0.5 ${
                (activeTab === 'team_tasks' || activeTab === 'kanban') && !isCreateActionSheetOpen
                  ? 'font-bold text-jet-black'
                  : 'font-medium'
              }`}
            >
              Team Tasks
            </span>
          </button>

          {/* 3. Center [+] Action Button (CRITICAL: RENDERED EXCLUSIVELY FOR LEADS & CORE - HIDDEN FOR NORMAL USERS) */}
          {canCreate && (
            <button
              type="button"
              onClick={() => {
                setIsCreateActionSheetOpen(!isCreateActionSheetOpen);
              }}
              title="Log Step or Create Deliverable"
              className="flex flex-col items-center justify-center py-0.5 px-2 cursor-pointer group active:scale-95 transition-transform"
            >
              <div
                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                  isCreateActionSheetOpen
                    ? 'border-orange bg-orange text-white rotate-45 shadow-md shadow-orange/30 scale-105'
                    : 'border-jet-black bg-jet-black text-alice-blue group-hover:border-orange group-hover:bg-orange group-hover:scale-105 shadow-2xs'
                }`}
              >
                <svg className="w-5 h-5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-[10px] font-mono tracking-tight mt-0.5 font-bold text-jet-black">
                {isCreateActionSheetOpen ? 'Close' : 'Create'}
              </span>
            </button>
          )}

          {/* 4. Assigned to Me */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('my_tasks');
              setIsActivityDrawerOpen(false);
              setIsCreateActionSheetOpen(false);
            }}
            title="Tasks Assigned to Me"
            className={`flex flex-col items-center justify-center py-1 px-2.5 transition-all cursor-pointer group ${
              activeTab === 'my_tasks' && !isCreateActionSheetOpen ? 'text-jet-black scale-105' : 'text-grey hover:text-jet-black'
            }`}
          >
            <div className="relative">
              {activeTab === 'my_tasks' && !isCreateActionSheetOpen ? (
                <svg className="w-6 h-6 text-jet-black" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
              {myAssignedCount > 0 && (
                <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-orange text-white text-[9px] font-mono rounded-full font-bold">
                  {myAssignedCount}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] font-mono tracking-tight mt-0.5 ${
                activeTab === 'my_tasks' && !isCreateActionSheetOpen ? 'font-bold text-jet-black' : 'font-medium'
              }`}
            >
              Assigned
            </span>
          </button>

          {/* 5. Personal Profile */}
          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setIsActivityDrawerOpen(false);
              setIsCreateActionSheetOpen(false);
            }}
            title="My Profile & Security"
            className={`flex flex-col items-center justify-center py-1 px-2.5 transition-all cursor-pointer group ${
              activeTab === 'profile' && !isCreateActionSheetOpen ? 'scale-105' : 'text-grey hover:text-jet-black'
            }`}
          >
            <div className="relative">
              <div
                className={`w-7 h-7 rounded-full border-2 overflow-hidden flex items-center justify-center transition-all ${
                  activeTab === 'profile' && !isCreateActionSheetOpen
                    ? 'border-orange ring-2 ring-orange/30 bg-orange/10'
                    : 'border-jet-black/40 group-hover:border-jet-black bg-alice-blue/80'
                }`}
              >
                {userPhotoUrl ? (
                  <img src={userPhotoUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-mono font-bold uppercase text-jet-black">
                    {userDisplayName ? userDisplayName.slice(0, 2).toUpperCase() : 'ME'}
                  </span>
                )}
              </div>
            </div>
            <span
              className={`text-[10px] font-mono tracking-tight mt-0.5 ${
                activeTab === 'profile' && !isCreateActionSheetOpen ? 'font-bold text-jet-black' : 'font-medium'
              }`}
            >
              Profile
            </span>
          </button>
        </div>
      </nav>

      {/* =========================================================================
          INSTAGRAM CREATE ACTION SHEET (Leads & Core Only)
          Smooth slide-up sheet triggered by the center [+] button.
          Matching action cards with equal height, icon containers, and typography.
         ========================================================================= */}
      {isCreateActionSheetOpen && canCreate && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div
            onClick={() => setIsCreateActionSheetOpen(false)}
            className="fixed inset-0 bg-jet-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          />

          {/* Action Sheet Card */}
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md flex flex-col shadow-2xl border border-jet-black/15 z-10 animate-in slide-in-from-bottom duration-200 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            {/* Header */}
            <div className="pt-3 pb-3 px-5 flex flex-col items-center border-b border-jet-black/10">
              <div className="w-12 h-1.5 bg-zinc-300 rounded-full mb-3" />
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange/10 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-sans font-bold text-jet-black leading-tight">
                      Create
                    </h3>
                    <p className="text-xs font-sans text-zinc-500">
                      Choose what you want to add
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateActionSheetOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 hover:text-jet-black font-bold text-xs transition-colors cursor-pointer"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Actions List (Unified Matching Action Cards) */}
            <div className="p-4 space-y-3">
              {/* Option 1: Log Build Step */}
              <Link
                href="/log"
                onClick={() => setIsCreateActionSheetOpen(false)}
                className="group flex items-center justify-between p-4 rounded-2xl border border-amber-200/80 bg-amber-50/30 hover:bg-amber-50/70 hover:border-amber-400 transition-all active:scale-[0.98] cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-sans font-bold text-jet-black">
                      Log Build Step
                    </div>
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">
                      Upload video proof
                    </p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-orange shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              {/* Option 2: New Deliverable */}
              <button
                type="button"
                onClick={() => {
                  setIsCreateActionSheetOpen(false);
                  openCreateModal();
                }}
                className="w-full group flex items-center justify-between p-4 rounded-2xl border border-amber-200/80 bg-amber-50/30 hover:bg-amber-50/70 hover:border-amber-400 transition-all text-left active:scale-[0.98] cursor-pointer shadow-xs"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-6 h-6 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v12m6-6H6" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-sans font-bold text-jet-black">
                      New Deliverable
                    </div>
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">
                      Add to subsystem board
                    </p>
                  </div>
                </div>
                <svg className="w-5 h-5 text-orange shrink-0 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={() => setIsCreateActionSheetOpen(false)}
                className="w-full py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-sans text-sm font-semibold text-center transition-colors cursor-pointer mt-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
