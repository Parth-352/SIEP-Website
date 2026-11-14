import React from 'react';
import Link from 'next/link';

interface MobileSlideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isCore: boolean;
  isLead: boolean;
  isParth: boolean;
  currentTeam: any;
  isPortalPage: boolean;
  pathname: string;
  isDashboardActive: boolean;
  isTeamTasksActive: boolean;
  isBuildLogActive: boolean;
  isAssignedActive: boolean;
  isMaterialsActive: boolean;
  isRolesActive: boolean;
  isProfileActive: boolean;
  deckNotificationsCount: number;
  isInstalled: boolean;
  installApp: () => void;
  handleNavClick: (tabId?: string) => void;
  onOpenCopilot: () => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
}

export default function MobileSlideDrawer({
  isOpen,
  onClose,
  user,
  isCore,
  isLead,
  isParth,
  currentTeam,
  isPortalPage,
  pathname,
  isDashboardActive,
  isTeamTasksActive,
  isBuildLogActive,
  isAssignedActive,
  isMaterialsActive,
  isRolesActive,
  isProfileActive,
  deckNotificationsCount,
  isInstalled,
  installApp,
  handleNavClick,
  onOpenCopilot,
  onOpenNotifications,
  onLogout,
}: MobileSlideDrawerProps) {
  return (
    <div 
      className={`fixed inset-0 z-[250] font-sans transition-all duration-300 ${
        isOpen 
          ? 'opacity-100 pointer-events-auto visible' 
          : 'opacity-0 pointer-events-none invisible'
      }`}
      aria-hidden={!isOpen}
    >
      {/* Dark Frosted Glass Backdrop Overlay */}
      <div 
        onClick={onClose}
        className={`absolute inset-0 bg-jet-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Slide-over Drawer Card */}
      <aside
        className={`absolute top-0 right-0 h-full w-[85%] max-w-[360px] sm:max-w-[400px] bg-white rounded-l-[32px] sm:rounded-l-[40px] shadow-2xl z-10 flex flex-col justify-between p-6 sm:p-7 overflow-y-auto hide-scrollbar transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Top Section */}
        <div className="space-y-6">
          {/* Header: Brand Logo & Close Button */}
          <div className="flex items-center justify-between pb-2">
            <Link
              href={isPortalPage ? "/dashboard" : "/"}
              onClick={onClose}
              className="text-2xl font-black text-jet-black tracking-tighter"
            >
              Riders Bay<span className="text-orange">.</span>
            </Link>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
              aria-label="Close menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Navigation Items */}
          {user ? (
            <div className="space-y-2.5">
              {/* 1. Dashboard */}
              <Link
                href="/dashboard?tab=dashboard"
                onClick={() => handleNavClick('dashboard')}
                className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left ${
                  isDashboardActive
                    ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                    : 'bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isDashboardActive
                        ? 'bg-amber-100/80 border border-amber-200/70 text-amber-500'
                        : 'bg-zinc-100/80 border border-zinc-200/50 text-zinc-700'
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="3" y="3" width="7.5" height="7.5" rx="2" />
                      <rect x="13.5" y="3" width="7.5" height="7.5" rx="2" />
                      <rect x="3" y="13.5" width="7.5" height="7.5" rx="2" />
                      <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="2" />
                    </svg>
                  </div>
                  <span className="text-[15px] sm:text-base font-bold text-zinc-900 tracking-tight">
                    Dashboard
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 shrink-0 transition-transform ${
                    isDashboardActive ? 'text-amber-500' : 'text-zinc-400'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* 2. Team Tasks */}
              <Link
                href="/dashboard?tab=team_tasks"
                onClick={() => handleNavClick('team_tasks')}
                className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left ${
                  isTeamTasksActive
                    ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                    : 'bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isTeamTasksActive
                        ? 'bg-amber-100/80 border border-amber-200/70 text-amber-500'
                        : 'bg-zinc-100/80 border border-zinc-200/50 text-zinc-700'
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <span className="text-[15px] sm:text-base font-bold text-zinc-900 tracking-tight">
                    Team Tasks
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 shrink-0 transition-transform ${
                    isTeamTasksActive ? 'text-amber-500' : 'text-zinc-400'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* 3. Build Log */}
              <div
                className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-all text-left ${
                  isBuildLogActive
                    ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                    : 'bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80'
                }`}
              >
                <Link
                  href="/log"
                  onClick={onClose}
                  className="flex items-center gap-3.5 min-w-0 flex-1 group"
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isBuildLogActive
                        ? 'bg-amber-100/80 border border-amber-200/70 text-amber-500'
                        : 'bg-zinc-100/80 border border-zinc-200/50 text-zinc-700 group-hover:text-amber-500'
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" strokeWidth="2" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8m-4-4h8" />
                    </svg>
                  </div>
                  <span className="text-[15px] sm:text-base font-bold text-zinc-900 tracking-tight">
                    Build Log
                  </span>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href="/log?new=true"
                    onClick={() => {
                      onClose();
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('siep_open_log_form'));
                      }
                    }}
                    title="Add a new build step log"
                    className="px-2.5 py-1 rounded-xl bg-orange/10 hover:bg-orange text-orange hover:text-white border border-orange/25 font-bold text-xs font-sans tracking-wide transition-all flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Add</span>
                  </Link>

                  <Link
                    href="/log"
                    onClick={onClose}
                    className="p-1 text-zinc-400 hover:text-zinc-600 transition-colors"
                    aria-label="View Build Logs"
                  >
                    <svg
                      className={`w-5 h-5 shrink-0 transition-transform ${
                        isBuildLogActive ? 'text-amber-500' : 'text-zinc-400'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>

              {/* 4. Assigned */}
              <Link
                href="/dashboard?tab=my_tasks"
                onClick={() => handleNavClick('my_tasks')}
                className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left ${
                  isAssignedActive
                    ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                    : 'bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isAssignedActive
                        ? 'bg-amber-100/80 border border-amber-200/70 text-amber-500'
                        : 'bg-zinc-100/80 border border-zinc-200/50 text-zinc-700'
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-[15px] sm:text-base font-bold text-zinc-900 tracking-tight">
                    Assigned
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 shrink-0 transition-transform ${
                    isAssignedActive ? 'text-amber-500' : 'text-zinc-400'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* 5. Materials */}
              <Link
                href="/dashboard?tab=materials"
                onClick={() => handleNavClick('materials')}
                className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left ${
                  isMaterialsActive
                    ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                    : 'bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isMaterialsActive
                        ? 'bg-amber-100/80 border border-amber-200/70 text-amber-500'
                        : 'bg-zinc-100/80 border border-zinc-200/50 text-zinc-700'
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="text-[15px] sm:text-base font-bold text-zinc-900 tracking-tight">
                    Materials
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 shrink-0 transition-transform ${
                    isMaterialsActive ? 'text-amber-500' : 'text-zinc-400'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* 6. Roles Governance */}
              {isParth && (
                <Link
                  href="/dashboard?tab=roles"
                  onClick={() => handleNavClick('roles')}
                  className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left ${
                    isRolesActive
                      ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                      : 'bg-white hover:bg-zinc-50 border border-amber-200/40 hover:border-amber-300/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isRolesActive
                          ? 'bg-amber-100/80 border border-amber-200/70 text-amber-600'
                          : 'bg-amber-50 border border-amber-200/50 text-amber-600'
                      }`}
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[15px] sm:text-base font-bold text-zinc-900 tracking-tight block">
                        Role Management
                      </span>
                      <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">
                        Executive Authority
                      </span>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 shrink-0 transition-transform ${
                      isRolesActive ? 'text-amber-500' : 'text-zinc-400'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}

              {/* 7. Profile */}
              <Link
                href="/dashboard?tab=profile"
                onClick={() => handleNavClick('profile')}
                className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left ${
                  isProfileActive
                    ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                    : 'bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isProfileActive
                        ? 'bg-amber-100/80 border border-amber-200/70 text-amber-500'
                        : 'bg-zinc-100/80 border border-zinc-200/50 text-zinc-700'
                    }`}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-[15px] sm:text-base font-bold text-zinc-900 tracking-tight">
                    Profile
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 shrink-0 transition-transform ${
                    isProfileActive ? 'text-amber-500' : 'text-zinc-400'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* 8. Personal Deck Alerts */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNotifications();
                }}
                className="w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80 shadow-2xs cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[15px] sm:text-base font-bold text-zinc-900 tracking-tight block">
                      Deck Alerts
                    </span>
                    <span className="text-[10px] text-zinc-500 font-medium block">
                      Tasks, deadlines &amp; review notices
                    </span>
                  </div>
                </div>
                {deckNotificationsCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white font-mono text-xs font-bold shadow-2xs">
                    {deckNotificationsCount}
                  </span>
                ) : (
                  <svg className="w-5 h-5 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>

              {/* 9. Rulebook Copilot */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCopilot();
                }}
                className="w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/80 shadow-2xs cursor-pointer group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-900 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[15px] sm:text-base font-bold text-amber-950 tracking-tight block">
                      SIEP Rulebook Copilot
                    </span>
                    <span className="text-[10px] text-amber-800 font-medium block">
                      Instant rulebook citations &amp; vehicle limits
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 font-mono text-[10px] font-bold">
                  AI
                </span>
              </button>
            </div>
          ) : (
            /* Public Website Navigation */
            <div className="space-y-2.5">
              <Link
                href="/"
                onClick={onClose}
                className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left ${
                  pathname === '/'
                    ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                    : 'bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-zinc-100/80 border border-zinc-200/50 flex items-center justify-center shrink-0 text-zinc-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <span className="text-[15px] sm:text-base font-bold text-zinc-900 tracking-tight">Home</span>
                </div>
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/bike"
                onClick={onClose}
                className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left ${
                  pathname === '/bike'
                    ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                    : 'bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-zinc-100/80 border border-zinc-200/50 flex items-center justify-center shrink-0 text-zinc-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <span className="text-[15px] sm:text-base font-bold text-zinc-900 tracking-tight">The Bike</span>
                </div>
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/competition"
                onClick={onClose}
                className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left ${
                  pathname === '/competition'
                    ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                    : 'bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-zinc-100/80 border border-zinc-200/50 flex items-center justify-center shrink-0 text-zinc-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                  </div>
                  <span className="text-[15px] sm:text-base font-bold text-zinc-900 tracking-tight">Competition</span>
                </div>
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/about"
                onClick={onClose}
                className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left ${
                  pathname === '/about'
                    ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                    : 'bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-zinc-100/80 border border-zinc-200/50 flex items-center justify-center shrink-0 text-zinc-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="text-[15px] sm:text-base font-bold text-zinc-900 tracking-tight">About Us</span>
                </div>
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              <Link
                href="/contact"
                onClick={onClose}
                className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left ${
                  pathname === '/contact'
                    ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                    : 'bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-zinc-100/80 border border-zinc-200/50 flex items-center justify-center shrink-0 text-zinc-700">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-[15px] sm:text-base font-bold text-zinc-900 tracking-tight">Contact</span>
                </div>
                <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="pt-6 border-t border-zinc-100 space-y-3">
          {user ? (
            <div className="space-y-3">
              {/* User Profile Card */}
              <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0">
                  {user.photoUrl ? (
                    <img src={user.photoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    user.displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-900 truncate">{user.displayName}</p>
                  <p className="text-[10px] text-zinc-500 font-mono truncate">{currentTeam?.name || user.teamId}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-bold uppercase shrink-0">
                  {isCore ? 'Core' : isLead ? 'Lead' : 'Member'}
                </span>
              </div>

              {/* Log Out Button */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-200/60"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#0e131f] hover:bg-orange text-white font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Portal Login</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          )}

          {!isInstalled && (
            <button
              type="button"
              onClick={() => {
                onClose();
                installApp();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Install Web App</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}
