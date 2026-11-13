"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePwaInstall } from '@/components/PwaInstallProvider';
import { TEAMS } from '@/lib/teams';
import { isParthMasterAdmin } from '@/lib/members';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { user, isAdmin, isCore, isLead, tier, logout } = useAuth();
  const { isInstalled, isStandalone, installApp } = usePwaInstall();
  const currentTeam = user ? TEAMS[user.teamId] : null;
  const isPortalOnly = process.env.NEXT_PUBLIC_PORTAL_ONLY === 'true';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isPortalPage = isPortalOnly || isStandalone || pathname.startsWith('/log') || pathname.startsWith('/dashboard');

  // Track active dashboard tab from URL search parameters for active pill highlight
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateTabFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') || 'dashboard';
      setCurrentTab(tab);
    };
    updateTabFromUrl();
    window.addEventListener('popstate', updateTabFromUrl);
    return () => window.removeEventListener('popstate', updateTabFromUrl);
  }, [pathname]);

  const handleNavClick = (tabId?: string) => {
    closeMenu();
    if (tabId) {
      setCurrentTab(tabId);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('siep_tab_change', { detail: tabId }));
      }
    }
  };

  const isDashboard = pathname === '/dashboard';
  const isLog = pathname.startsWith('/log');

  const isDashboardActive = isDashboard && (currentTab === 'dashboard' || !currentTab);
  const isTasksActive = isDashboard && (currentTab === 'team_tasks' || currentTab === 'my_tasks' || currentTab === 'kanban' || currentTab === 'tasks');
  const isTeamTasksActive = isTasksActive;
  const isBuildLogActive = isLog || (isDashboard && currentTab === 'build_log');
  const isTeamsActive = isDashboard && currentTab === 'teams';
  const isReportsActive = isDashboard && (currentTab === 'metrics' || currentTab === 'reports');
  const isMaterialsActive = isDashboard && currentTab === 'materials';
  const isRolesActive = isDashboard && currentTab === 'roles';
  const isAssignedActive = isDashboard && currentTab === 'my_tasks';
  const isProfileActive = isDashboard && currentTab === 'profile';
  const isParth = isParthMasterAdmin(user?.email);

  // User Dropdown State for Desktop Nav
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  useEffect(() => {
    if (!isUserDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#user-nav-dropdown-container')) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserDropdownOpen]);

  // Close mobile menu on route change
  const [prevPath, setPrevPath] = useState(pathname);
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setIsMobileMenuOpen(false);
  }

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const toggleMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMenu = () => setIsMobileMenuOpen(false);

  // User badge formatting
  const renderUserBadge = () => {
    if (!user) return null;
    const name = user.displayName;
    const teamCode = currentTeam?.code || user.teamId.toUpperCase();

    if (isCore) {
      const isCaptain = name.toLowerCase().includes('tirthraj');
      return (
        <span className="h-9 px-3.5 text-xs font-sans font-semibold rounded-xl bg-jet-black text-alice-blue inline-flex items-center gap-2 shadow-sm border border-orange/30">
          <span>{name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange/20 text-orange font-mono font-bold uppercase">
            {isCaptain ? 'CAPTAIN' : 'CORE'}
          </span>
        </span>
      );
    }

    if (isLead) {
      return (
        <span className="h-9 px-3.5 text-xs font-sans font-semibold rounded-xl bg-jet-black text-alice-blue inline-flex items-center gap-2 shadow-sm border border-jet-black/20">
          <span className="text-[10px] text-sky-400 font-mono font-bold">{teamCode}</span>
          <span>{name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold uppercase">
            LEAD
          </span>
        </span>
      );
    }

    // Tier 3: Team Member
    return (
      <span className="h-9 px-3.5 text-xs font-sans font-semibold rounded-xl bg-jet-black text-alice-blue inline-flex items-center gap-2 shadow-sm border border-jet-black/20">
        <span className="text-[10px] text-grey font-mono font-bold">{teamCode}</span>
        <span>{name}</span>
      </span>
    );
  };

  if (pathname === '/login') {
    return null;
  }

  return (
    <>
      {/* Top Nav Bar — always visible */}
      <nav className="fixed top-0 left-0 w-full z-[100] bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs pointer-events-auto font-sans transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-2.5 flex justify-between items-center w-full">
          {/* Brand Logo & Portal Tag */}
          <div className="flex items-center gap-3">
            <Link 
              href={isPortalPage ? "/dashboard" : "/"} 
              onClick={closeMenu}
              className="text-2xl font-black text-slate-900 tracking-tight hover:opacity-90 transition-opacity flex items-center"
            >
              Riders Bay<span className="text-orange-500">.</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {!isMounted ? (
              <div className="w-48 h-9"></div>
            ) : isPortalPage && user ? (
              /* ================= Portal Dedicated View Matching Mockup ================= */
              <div className="flex items-center gap-4">
                {/* Centered Pill Navigation Bar */}
                <div className="inline-flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/70 shadow-xs">
                  {/* 1. Dashboard */}
                  <button
                    type="button"
                    onClick={() => {
                      handleNavClick('dashboard');
                      if (pathname !== '/dashboard') {
                        window.location.href = '/dashboard?tab=dashboard';
                      } else {
                        window.history.pushState(null, '', '/dashboard?tab=dashboard');
                      }
                    }}
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
                    onClick={() => {
                      handleNavClick('team_tasks');
                      if (pathname !== '/dashboard') {
                        window.location.href = '/dashboard?tab=team_tasks';
                      } else {
                        window.history.pushState(null, '', '/dashboard?tab=team_tasks');
                      }
                    }}
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
                    onClick={() => {
                      handleNavClick('teams');
                      if (pathname !== '/dashboard') {
                        window.location.href = '/dashboard?tab=teams';
                      } else {
                        window.history.pushState(null, '', '/dashboard?tab=teams');
                      }
                    }}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isTeamsActive
                        ? 'bg-[#0e131f] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Teams</span>
                  </button>

                  {/* 5. Reports */}
                  <button
                    type="button"
                    onClick={() => {
                      handleNavClick('metrics');
                      if (pathname !== '/dashboard') {
                        window.location.href = '/dashboard?tab=metrics';
                      } else {
                        window.history.pushState(null, '', '/dashboard?tab=metrics');
                      }
                    }}
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
                    onClick={() => {
                      handleNavClick('materials');
                      if (pathname !== '/dashboard') {
                        window.location.href = '/dashboard?tab=materials';
                      } else {
                        window.history.pushState(null, '', '/dashboard?tab=materials');
                      }
                    }}
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

                  {/* 7. Roles (Parth Only) */}
                  {isParth && (
                    <button
                      type="button"
                      onClick={() => {
                        handleNavClick('roles');
                        if (pathname !== '/dashboard') {
                          window.location.href = '/dashboard?tab=roles';
                        } else {
                          window.history.pushState(null, '', '/dashboard?tab=roles');
                        }
                      }}
                      title="Master Role & Team Authority (Parth Only)"
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

                {/* Right Area: Notifications & User Menu */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  {/* Notification Bell */}
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('siep_open_activity_drawer'));
                      }
                    }}
                    title="Real-time Team Activity"
                    className="w-9 h-9 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors relative cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="w-2 h-2 rounded-full bg-orange-500 absolute top-2 right-2 ring-2 ring-white" />
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
                          {user.displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
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

                    {/* Dropdown Menu */}
                    {isUserDropdownOpen && (
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
                            setIsUserDropdownOpen(false);
                            handleNavClick('profile');
                            if (pathname !== '/dashboard') {
                              window.location.href = '/dashboard?tab=profile';
                            } else {
                              window.history.pushState(null, '', '/dashboard?tab=profile');
                            }
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors text-left cursor-pointer"
                        >
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>My Profile</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            handleNavClick('profile');
                            if (pathname !== '/dashboard') {
                              window.location.href = '/dashboard?tab=profile';
                            } else {
                              window.history.pushState(null, '', '/dashboard?tab=profile');
                            }
                          }}
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
                            onClick={() => {
                              setIsUserDropdownOpen(false);
                              handleNavClick('accounts');
                              if (pathname !== '/dashboard') {
                                window.location.href = '/dashboard?tab=accounts';
                              } else {
                                window.history.pushState(null, '', '/dashboard?tab=accounts');
                              }
                            }}
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
                            onClick={() => {
                              setIsUserDropdownOpen(false);
                              handleNavClick('roles');
                              if (pathname !== '/dashboard') {
                                window.location.href = '/dashboard?tab=roles';
                              } else {
                                window.history.pushState(null, '', '/dashboard?tab=roles');
                              }
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100/80 transition-colors text-left cursor-pointer border border-amber-200/50"
                          >
                            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            <span>Role Management (Parth Only)</span>
                          </button>
                        )}

                        <div className="my-1 border-t border-slate-100" />

                        <button
                          type="button"
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* ================= Public Website View ================= */
              <>
                <Link 
                  href="/" 
                  className={`uppercase tracking-wider text-xs transition-colors ${
                    pathname === '/' ? 'text-orange font-bold' : 'text-jet-black/80 font-semibold hover:text-orange'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  href="/about" 
                  className={`uppercase tracking-wider text-xs transition-colors ${
                    pathname === '/about' ? 'text-orange font-bold' : 'text-jet-black/80 font-semibold hover:text-orange'
                  }`}
                >
                  About
                </Link>
                <Link 
                  href="/competition" 
                  className={`uppercase tracking-wider text-xs transition-colors ${
                    pathname === '/competition' ? 'text-orange font-bold' : 'text-jet-black/80 font-semibold hover:text-orange'
                  }`}
                >
                  Competition
                </Link>
                <Link 
                  href="/bike" 
                  className={`uppercase tracking-wider text-xs transition-colors ${
                    pathname === '/bike' ? 'text-orange font-bold' : 'text-jet-black/80 font-semibold hover:text-orange'
                  }`}
                >
                  The Bike
                </Link>
                <Link 
                  href="/contact" 
                  className={`uppercase tracking-wider text-xs transition-colors ${
                    pathname === '/contact' ? 'text-orange font-bold' : 'text-jet-black/80 font-semibold hover:text-orange'
                  }`}
                >
                  Contact
                </Link>

                {/* Action Buttons Section */}
                <div className="flex items-center gap-3 pl-3 border-l border-jet-black/15">
                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="h-9 px-3.5 rounded-xl bg-jet-black text-alice-blue text-xs font-sans font-bold uppercase tracking-wider hover:bg-orange transition-all inline-flex items-center gap-2 shadow-sm"
                      >
                        <span className="text-[10px] text-orange font-mono font-bold">{currentTeam?.code || user.teamId.toUpperCase()}</span>
                        <span>Portal →</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => logout()}
                        title="Sign Out"
                        className="h-9 px-3 rounded-xl border border-jet-black/15 text-grey hover:text-red-600 hover:border-red-400 hover:bg-red-50 text-xs font-sans font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className={`h-9 px-4 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all inline-flex items-center justify-center gap-1.5 border ${
                        pathname === '/login'
                          ? 'bg-orange/10 text-orange border-orange/40 shadow-sm'
                          : 'bg-white/70 border-jet-black/15 text-jet-black hover:border-orange hover:text-orange hover:bg-orange/5'
                      }`}
                    >
                      <span>Portal Login</span>
                      <svg className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  )}

                  {!isInstalled && (
                    <button
                      type="button"
                      onClick={installApp}
                      title="Install Web App on your phone or computer"
                      className="h-9 px-3 rounded-xl border border-orange/40 bg-orange/10 hover:bg-orange text-jet-black hover:text-white transition-all text-xs font-sans font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span className="hidden xl:inline">Install App</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center gap-2.5">
            {isMounted && user && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-jet-black text-alice-blue font-bold uppercase tracking-wider">
                {currentTeam?.code || user.teamId.toUpperCase()}
              </span>
            )}
            <button
              onClick={toggleMenu}
              className="w-10 h-10 rounded-xl bg-zinc-100/90 hover:bg-zinc-200 text-jet-black focus:outline-none flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-2xs"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* =========================================================================
          SLIDE-OVER BURGER MENU (Matching Reference Design)
          - Sliding in smoothly from right
          - Crisp white card with rounded left edge (rounded-l-3xl)
          - Dimmed blurred backdrop overlay
          - Riders Bay. logo + Close button (✕)
          - 4 uniform card items: Dashboard, Team Tasks, Build Log, Assigned
          - Profile item (if authenticated)
          - Soft red Log Out card at bottom
         ========================================================================= */}
      <div 
        className={`fixed inset-0 z-[250] font-sans transition-all duration-300 ${
          isMobileMenuOpen 
            ? 'opacity-100 pointer-events-auto visible' 
            : 'opacity-0 pointer-events-none invisible'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Dark Frosted Glass Backdrop Overlay */}
        <div 
          onClick={closeMenu}
          className={`absolute inset-0 bg-jet-black/50 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Slide-over Drawer Card */}
        <aside
          className={`absolute top-0 right-0 h-full w-[85%] max-w-[360px] sm:max-w-[400px] bg-white rounded-l-[32px] sm:rounded-l-[40px] shadow-2xl z-10 flex flex-col justify-between p-6 sm:p-7 overflow-y-auto hide-scrollbar transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Top Section */}
          <div className="space-y-6">
            {/* Header: Brand Logo & Close Button */}
            <div className="flex items-center justify-between pb-2">
              <Link
                href={isPortalPage ? "/dashboard" : "/"}
                onClick={closeMenu}
                className="text-2xl font-black text-jet-black tracking-tighter"
              >
                Riders Bay<span className="text-orange">.</span>
              </Link>

              <button
                type="button"
                onClick={closeMenu}
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

                {/* 3. Build Log (Accessible to all members with direct Add Log action) */}
                <div
                  className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 transition-all text-left ${
                    isBuildLogActive
                      ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                      : 'bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80'
                  }`}
                >
                  <Link
                    href="/log"
                    onClick={closeMenu}
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
                        closeMenu();
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
                      onClick={closeMenu}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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

                {/* 6. Roles (Parth Only) */}
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
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[15px] sm:text-base font-bold text-zinc-900 tracking-tight block">
                          Role Management
                        </span>
                        <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">
                          Parth Only
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Public Website Navigation */}
                <Link
                  href="/"
                  onClick={closeMenu}
                  className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left ${
                    pathname === '/'
                      ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                      : 'bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-zinc-100/80 border border-zinc-200/50 flex items-center justify-center shrink-0 text-zinc-700">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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
                  onClick={closeMenu}
                  className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left ${
                    pathname === '/bike'
                      ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                      : 'bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-zinc-100/80 border border-zinc-200/50 flex items-center justify-center shrink-0 text-zinc-700">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
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
                  onClick={closeMenu}
                  className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left ${
                    pathname === '/competition'
                      ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                      : 'bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-zinc-100/80 border border-zinc-200/50 flex items-center justify-center shrink-0 text-zinc-700">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
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
                  onClick={closeMenu}
                  className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left ${
                    pathname === '/about'
                      ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                      : 'bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-zinc-100/80 border border-zinc-200/50 flex items-center justify-center shrink-0 text-zinc-700">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
                  onClick={closeMenu}
                  className={`w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 transition-all text-left ${
                    pathname === '/contact'
                      ? 'bg-amber-50/90 border border-amber-200/80 shadow-2xs'
                      : 'bg-white hover:bg-zinc-50 border border-zinc-100/90 hover:border-zinc-200/80'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-zinc-100/80 border border-zinc-200/50 flex items-center justify-center shrink-0 text-zinc-700">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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

          {/* Bottom Actions: Log Out / Login & Install */}
          <div className="pt-4 mt-4 border-t border-zinc-100 space-y-2.5">
            {user ? (
              <>
                {/* Log Out Button (Matching Reference Photo) */}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="w-full rounded-2xl p-3 sm:p-3.5 flex items-center gap-3.5 bg-red-50/80 hover:bg-red-100/80 border border-red-100 text-red-600 transition-all cursor-pointer active:scale-[0.99] shadow-2xs"
                >
                  <div className="w-11 h-11 rounded-xl bg-red-100/70 border border-red-200/40 flex items-center justify-center shrink-0 text-red-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span className="text-[15px] sm:text-base font-bold text-red-600 font-sans tracking-tight">
                    Log Out
                  </span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="w-full rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3.5 bg-orange/10 hover:bg-orange/20 border border-orange/30 text-orange font-bold transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-orange/20 flex items-center justify-center text-orange">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span className="text-[15px] sm:text-base font-bold text-orange">Portal Login</span>
                </div>
                <svg className="w-5 h-5 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}

            {/* Install Web App Button */}
            {!isInstalled && (
              <button
                type="button"
                onClick={() => {
                  installApp();
                  closeMenu();
                }}
                className="w-full rounded-2xl p-2.5 sm:p-3 flex items-center justify-center gap-2 text-xs font-sans font-bold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Install Web App</span>
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* =========================================================================
          GLOBAL INSTAGRAM-STYLE BOTTOM NAVIGATION BAR
          Rendered EXCLUSIVELY when running as an installed Mobile Web App (standalone).
          Never loaded in standard web browsers (mobile Chrome, Safari, desktop).
         ========================================================================= */}
      {isMounted && isStandalone && pathname !== '/dashboard' && pathname !== '/login' && (
        <nav
          aria-label="Global Instagram Bottom Navigation"
          className="fixed bottom-0 left-0 right-0 sm:bottom-5 sm:left-1/2 sm:-translate-x-1/2 sm:w-[94%] sm:max-w-md sm:rounded-2xl sm:shadow-[0_12px_45px_rgba(0,0,0,0.18)] sm:border sm:border-jet-black/15 bg-white/95 backdrop-blur-xl border-t border-jet-black/10 px-3 pt-2 sm:py-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-50 transition-all duration-300"
        >
          <div className="flex items-center justify-between max-w-md mx-auto px-1 sm:px-2">
            {user ? (
              /* Authenticated Member Instagram Bottom Bar */
              <>
                {/* 1. Dashboard */}
                <Link
                  href="/dashboard?tab=dashboard"
                  title="Executive Dashboard"
                  className={`flex flex-col items-center justify-center py-1 px-2.5 transition-all group ${
                    pathname === '/dashboard' ? 'text-jet-black font-bold scale-105' : 'text-grey hover:text-jet-black'
                  }`}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                  </svg>
                  <span className={`text-[10px] font-mono tracking-tight mt-0.5 ${
                    pathname === '/dashboard' ? 'font-bold text-jet-black' : 'font-medium'
                  }`}>
                    Dashboard
                  </span>
                </Link>

                {/* 2. Team Tasks (Scoped to User's Domains) */}
                <Link
                  href="/dashboard?tab=team_tasks"
                  title="Team Deliverables & Tasks"
                  className="flex flex-col items-center justify-center py-1 px-2.5 transition-all text-grey hover:text-jet-black group"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <span className="text-[10px] font-mono tracking-tight mt-0.5">Team Tasks</span>
                </Link>

                {/* 3. Center Create [+] (VISIBLE ONLY FOR LEADS & CORE - NEVER FOR NORMAL USERS) */}
                {(isCore || isLead) && (
                  <Link
                    href="/log"
                    title="Log Build Step & Video Proof"
                    className="flex flex-col items-center justify-center py-0.5 px-2 group active:scale-95 transition-transform"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all shadow-2xs ${
                        pathname === '/log'
                          ? 'border-orange bg-orange text-white shadow-md shadow-orange/30 scale-105'
                          : 'border-jet-black bg-jet-black text-alice-blue hover:bg-orange hover:border-orange'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span
                      className={`text-[10px] font-mono tracking-tight mt-0.5 ${
                        pathname === '/log' ? 'font-bold text-jet-black' : 'font-medium text-grey'
                      }`}
                    >
                      Log
                    </span>
                  </Link>
                )}

                {/* 4. Assigned to Me */}
                <Link
                  href="/dashboard?tab=my_tasks"
                  title="Tasks Assigned to Me"
                  className="flex flex-col items-center justify-center py-1 px-2.5 transition-all group text-grey hover:text-jet-black"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-[10px] font-mono tracking-tight mt-0.5">Assigned</span>
                </Link>

                {/* 5. Personal Profile */}
                <Link
                  href="/dashboard?tab=profile"
                  title="My Profile & Security"
                  className="flex flex-col items-center justify-center py-1 px-2.5 transition-all group text-grey hover:text-jet-black"
                >
                  <div className="w-7 h-7 rounded-full border-2 border-jet-black/40 group-hover:border-jet-black bg-alice-blue/80 flex items-center justify-center overflow-hidden">
                    {user.photoUrl ? (
                      <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-mono font-bold uppercase text-jet-black">
                        {user.displayName ? user.displayName.slice(0, 2).toUpperCase() : 'ME'}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono tracking-tight mt-0.5">Profile</span>
                </Link>
              </>
            ) : (
              /* Public Visitor Instagram Bottom Bar */
              <>
                {/* 1. Home */}
                <Link
                  href="/"
                  title="Home"
                  className={`flex flex-col items-center justify-center py-1 px-2.5 transition-all group ${
                    pathname === '/' ? 'text-jet-black font-bold scale-105' : 'text-grey hover:text-jet-black'
                  }`}
                >
                  <svg className="w-6 h-6" fill={pathname === '/' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span className="text-[10px] font-mono tracking-tight mt-0.5">Home</span>
                </Link>

                {/* 2. About */}
                <Link
                  href="/about"
                  title="About"
                  className={`flex flex-col items-center justify-center py-1 px-2.5 transition-all group ${
                    pathname === '/about' ? 'text-orange font-bold' : 'text-grey hover:text-jet-black'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-[10px] font-mono tracking-tight mt-0.5">About</span>
                </Link>

                {/* 3. The Bike */}
                <Link
                  href="/bike"
                  title="The Bike"
                  className="flex flex-col items-center justify-center py-0.5 px-2 group active:scale-95 transition-transform"
                >
                  <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center font-bold transition-all shadow-2xs ${
                    pathname === '/bike'
                      ? 'border-orange bg-orange text-white'
                      : 'border-jet-black bg-white text-jet-black group-hover:border-orange group-hover:text-orange'
                  }`}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono tracking-tight mt-0.5 font-bold text-jet-black">Bike</span>
                </Link>

                {/* 4. Competition */}
                <Link
                  href="/competition"
                  title="Competition"
                  className={`flex flex-col items-center justify-center py-1 px-2.5 transition-all group ${
                    pathname === '/competition' ? 'text-orange font-bold' : 'text-grey hover:text-jet-black'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span className="text-[10px] font-mono tracking-tight mt-0.5">Comp</span>
                </Link>

                {/* 5. Portal Login */}
                <Link
                  href="/login"
                  title="Portal Login"
                  className={`flex flex-col items-center justify-center py-1 px-2.5 transition-all group ${
                    pathname === '/login' ? 'text-orange font-bold' : 'text-grey hover:text-jet-black'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full border-2 border-jet-black/40 group-hover:border-jet-black bg-alice-blue/80 flex items-center justify-center">
                    <svg className="w-4 h-4 text-jet-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono tracking-tight mt-0.5">Login</span>
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </>
  );
}
