import React from 'react';
import Link from 'next/link';

interface UserDropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isCore: boolean;
  isLead: boolean;
  isAdmin: boolean;
  isParth: boolean;
  currentTeam: any;
  pathname: string;
  handleNavClick: (tabId?: string) => void;
  onOpenCopilot: () => void;
  onOpenNotifications: () => void;
  onLogout: () => void;
}

export default function UserDropdownMenu({
  isOpen,
  onClose,
  user,
  isCore,
  isLead,
  isAdmin,
  isParth,
  currentTeam,
  pathname,
  handleNavClick,
  onOpenCopilot,
  onOpenNotifications,
  onLogout,
}: UserDropdownMenuProps) {
  if (!isOpen || !user) return null;

  const navigateToTab = (tab: string) => {
    onClose();
    handleNavClick(tab);
    if (pathname !== '/dashboard') {
      window.location.href = `/dashboard?tab=${tab}`;
    } else {
      window.history.pushState(null, '', `/dashboard?tab=${tab}`);
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
      {/* Member Header */}
      <div className="p-3 bg-slate-50 rounded-xl mb-1.5">
        <p className="text-xs font-bold text-slate-900 truncate">{user.displayName}</p>
        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
        <div className="mt-1.5 flex items-center gap-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white uppercase tracking-wider">
            {isCore ? 'CAPTAIN / CORE' : isLead ? 'SQUAD LEAD' : 'MEMBER'}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 uppercase">
            {currentTeam?.shortName || user.teamId}
          </span>
        </div>
      </div>

      {/* Navigation Items */}
      <button
        type="button"
        onClick={() => {
          onClose();
          onOpenCopilot();
        }}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100/80 transition-colors text-left cursor-pointer border border-amber-200/50"
      >
        <div className="flex items-center gap-2.5">
          <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>SIEP Rulebook Copilot</span>
        </div>
        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 font-bold">
          AI
        </span>
      </button>

      <button
        type="button"
        onClick={() => {
          onClose();
          onOpenNotifications();
        }}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span>Notifications &amp; Activity</span>
        </div>
      </button>

      <button
        type="button"
        onClick={() => navigateToTab('my_tasks')}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer"
      >
        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>My Personal Workbench</span>
      </button>

      <button
        type="button"
        onClick={() => navigateToTab('assigned')}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer"
      >
        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <span>My Assigned Tasks</span>
      </button>

      <Link
        href="/log"
        onClick={onClose}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors text-left"
      >
        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <span>Workshop Activity Log</span>
      </Link>

      <button
        type="button"
        onClick={() => navigateToTab('materials')}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer"
      >
        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Research &amp; Materials Hub</span>
      </button>

      <button
        type="button"
        onClick={() => navigateToTab('profile')}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer"
      >
        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <span>Account &amp; Security</span>
      </button>

      {(isCore || isAdmin) && (
        <button
          type="button"
          onClick={() => navigateToTab('accounts')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <span>Access Settings (Core Admin)</span>
        </button>
      )}

      {isParth && (
        <button
          type="button"
          onClick={() => navigateToTab('roles')}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100/80 transition-colors text-left cursor-pointer border border-amber-200/50"
        >
          <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          <span>Role Management</span>
        </button>
      )}

      <div className="my-1 border-t border-slate-100" />

      <button
        type="button"
        onClick={() => {
          onClose();
          onLogout();
        }}
        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>Sign Out</span>
      </button>
    </div>
  );
}
