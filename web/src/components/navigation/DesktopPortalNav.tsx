import React from 'react';
import Link from 'next/link';
import UserDropdownMenu from './UserDropdownMenu';

interface DesktopPortalNavProps {
  pathname: string;
  currentTab: string;
  handleNavClick: (tabId?: string) => void;
  user: any;
  isCore: boolean;
  isLead: boolean;
  isAdmin: boolean;
  isParth: boolean;
  currentTeam: any;
  isDashboardActive: boolean;
  isTasksActive: boolean;
  isBuildLogActive: boolean;
  isTeamsActive: boolean;
  isReportsActive: boolean;
  isMaterialsActive: boolean;
  isRolesActive: boolean;
  deckNotificationsCount: number;
  isUserDropdownOpen: boolean;
  setIsUserDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenCopilot: () => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
}

export default function DesktopPortalNav({
  pathname,
  handleNavClick,
  user,
  isCore,
  isLead,
  isAdmin,
  isParth,
  currentTeam,
  isDashboardActive,
  isTasksActive,
  isBuildLogActive,
  isTeamsActive,
  isReportsActive,
  isMaterialsActive,
  isRolesActive,
  deckNotificationsCount,
  isUserDropdownOpen,
  setIsUserDropdownOpen,
  onOpenCopilot,
  onOpenNotifications,
  onLogout,
}: DesktopPortalNavProps) {
  const navigateTab = (tab: string) => {
    handleNavClick(tab);
    if (pathname !== '/dashboard') {
      window.location.href = `/dashboard?tab=${tab}`;
    } else {
      window.history.pushState(null, '', `/dashboard?tab=${tab}`);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {/* Centered Pill Navigation Bar */}
      <div className="inline-flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/70 shadow-xs">
        {/* 1. Dashboard */}
        <button
          type="button"
          onClick={() => navigateTab('dashboard')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            isDashboardActive
              ? 'bg-[#0e131f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Dashboard</span>
        </button>

        {/* 2. Tasks */}
        <button
          type="button"
          onClick={() => navigateTab('team_tasks')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            isTasksActive
              ? 'bg-[#0e131f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span>Tasks</span>
        </button>

        {/* 3. Build Log */}
        <Link
          href="/log"
          className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            isBuildLogActive
              ? 'bg-[#0e131f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>Build Log</span>
        </Link>

        {/* 4. Teams */}
        <button
          type="button"
          onClick={() => navigateTab('teams')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            isTeamsActive
              ? 'bg-[#0e131f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>Teams</span>
        </button>

        {/* 5. Reports */}
        <button
          type="button"
          onClick={() => navigateTab('reports')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            isReportsActive
              ? 'bg-[#0e131f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span>Reports</span>
        </button>

        {/* 6. Materials */}
        <button
          type="button"
          onClick={() => navigateTab('materials')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            isMaterialsActive
              ? 'bg-[#0e131f] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
          }`}
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Materials</span>
        </button>

        {/* 7. Roles Governance (Core/Master Admin only) */}
        {isParth && (
          <button
            type="button"
            onClick={() => navigateTab('roles')}
            title="Master Role & Team Governance"
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isRolesActive
                ? 'bg-[#0e131f] text-white shadow-xs'
                : 'text-amber-700 bg-amber-50/70 hover:bg-amber-100/90 hover:text-amber-900 border border-amber-200/60'
            }`}
          >
            <svg className="w-3.5 h-3.5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>Roles</span>
          </button>
        )}
      </div>

      {/* Right Area: Notifications, Rulebook AI & User Menu */}
      <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
        {/* SIEP Rulebook AI Copilot Button */}
        <button
          type="button"
          onClick={onOpenCopilot}
          title="SIEP Season 7.0 Rulebook & Technical Copilot (Verified Section & Page Citations)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-slate-900 hover:bg-orange-600 text-white transition-all text-xs font-bold cursor-pointer shadow-xs group"
        >
          <svg className="w-3.5 h-3.5 text-amber-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="hidden sm:inline text-[11px] font-sans">Rulebook AI</span>
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={onOpenNotifications}
          title="Personal Deck Alerts & Reminders"
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {deckNotificationsCount > 0 ? (
            <span className="min-w-4 h-4 px-1 rounded-full bg-orange-500 text-white text-[9px] font-bold flex items-center justify-center absolute -top-0.5 -right-0.5 ring-2 ring-white">
              {deckNotificationsCount}
            </span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-2 right-2 ring-2 ring-white" />
          )}
        </button>

        {/* User Profile Dropdown */}
        <div className="relative" id="user-nav-dropdown-container">
          <button
            type="button"
            onClick={() => setIsUserDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            title={user.displayName}
          >
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.displayName}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user.displayName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <svg
              className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                isUserDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <UserDropdownMenu
            isOpen={isUserDropdownOpen}
            onClose={() => setIsUserDropdownOpen(false)}
            user={user}
            isCore={isCore}
            isLead={isLead}
            isAdmin={isAdmin}
            isParth={isParth}
            currentTeam={currentTeam}
            pathname={pathname}
            handleNavClick={handleNavClick}
            onOpenCopilot={onOpenCopilot}
            onOpenNotifications={onOpenNotifications}
            onLogout={onLogout}
          />
        </div>
      </div>
    </div>
  );
}
