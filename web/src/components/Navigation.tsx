"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePwaInstall } from '@/components/PwaInstallProvider';
import { TEAMS } from '@/lib/teams';

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
      <nav className="fixed top-0 left-0 w-full z-[100] bg-alice-blue/85 backdrop-blur-md border-b border-jet-black/10 shadow-sm pointer-events-auto font-sans transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 py-3.5 flex justify-between items-center w-full">
          {/* Brand Logo & Portal Tag */}
          <div className="flex items-center gap-3">
            <Link 
              href={isStandalone || isPortalPage ? "/log" : "/"} 
              onClick={closeMenu}
              className="text-2xl font-black text-jet-black tracking-tighter hover:opacity-90 transition-opacity"
            >
              Riders Bay<span className="text-orange">.</span>
            </Link>
            {isMounted && user && (
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-jet-black/15">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-jet-black text-alice-blue font-bold">
                  {pathname.startsWith('/log') || isStandalone ? 'LOG SYSTEM' : 'PORTAL'}
                </span>
                <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-jet-black/10 text-grey font-bold">
                  TIER {tier}
                </span>
              </div>
            )}
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {!isMounted ? (
              <div className="w-48 h-9"></div>
            ) : isPortalPage && user ? (
              /* ================= Portal Dedicated View ================= */
              <>
                {/* Dashboard: Primary operational hub accessible to all team members */}
                <Link
                  href="/dashboard"
                  className={`h-9 px-3.5 rounded-xl text-xs font-sans uppercase tracking-wider font-bold transition-all inline-flex items-center justify-center ${
                    pathname === '/dashboard'
                      ? 'bg-jet-black text-alice-blue shadow-sm'
                      : 'text-jet-black hover:text-orange hover:bg-jet-black/5'
                  }`}
                >
                  Dashboard
                </Link>

                {/* Build Log: Exclusively restricted to Core Leadership & Domain Leads */}
                {(isCore || isLead) && (
                  <Link
                    href="/log"
                    className={`h-9 px-3.5 rounded-xl text-xs font-sans uppercase tracking-wider font-bold transition-all inline-flex items-center justify-center ${
                      pathname === '/log'
                        ? 'bg-jet-black text-alice-blue shadow-sm'
                        : 'text-jet-black hover:text-orange hover:bg-jet-black/5'
                    }`}
                  >
                    Build Log
                  </Link>
                )}

                {/* Install Web App Button */}
                {!isInstalled && !isStandalone && (
                  <button
                    type="button"
                    onClick={installApp}
                    title="Install SIEP Log System on your device"
                    className="h-9 px-3 rounded-xl border border-orange/40 bg-orange/10 hover:bg-orange text-jet-black hover:text-white transition-all text-xs font-sans font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span className="hidden xl:inline">Install App</span>
                  </button>
                )}

                {/* User Pill + Logout */}
                <div className="flex items-center gap-2.5 pl-3 border-l border-jet-black/15">
                  {renderUserBadge()}

                  <button
                    type="button"
                    onClick={() => logout()}
                    title="Sign out of portal"
                    className="h-9 px-3 rounded-xl border border-jet-black/15 text-grey hover:text-red-600 hover:border-red-400 hover:bg-red-50 transition-all font-sans font-bold uppercase tracking-wider text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </>
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
          <div className="flex md:hidden items-center gap-3">
            {isMounted && user && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-jet-black text-alice-blue font-bold">
                {currentTeam?.code || user.teamId.toUpperCase()}
              </span>
            )}
            <button
              onClick={toggleMenu}
              className="text-jet-black focus:outline-none p-2 rounded-lg hover:bg-jet-black/5"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      <div 
        className={`md:hidden fixed inset-0 w-full h-[100dvh] bg-alice-blue z-[90] transition-all duration-300 ease-in-out flex flex-col justify-center items-center overflow-y-auto font-sans ${
          isMobileMenuOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex flex-col items-center space-y-4 text-2xl uppercase tracking-widest font-bold text-jet-black w-full px-8 py-20 max-w-sm">
          {!isPortalPage && !isStandalone && (
            <>
              <Link 
                href="/" 
                onClick={closeMenu} 
                className="hover:text-orange transition-colors w-full text-center border-b border-jet-black/10 py-3.5 min-h-[48px] flex items-center justify-center"
              >
                Home
              </Link>
              <Link 
                href="/about" 
                onClick={closeMenu} 
                className="hover:text-orange transition-colors w-full text-center border-b border-jet-black/10 py-3.5 min-h-[48px] flex items-center justify-center"
              >
                About
              </Link>
              <Link 
                href="/competition" 
                onClick={closeMenu} 
                className="hover:text-orange transition-colors w-full text-center border-b border-jet-black/10 py-3.5 min-h-[48px] flex items-center justify-center"
              >
                Competition
              </Link>
              <Link 
                href="/bike" 
                onClick={closeMenu} 
                className="hover:text-orange transition-colors w-full text-center border-b border-jet-black/10 py-3.5 min-h-[48px] flex items-center justify-center"
              >
                The Bike
              </Link>
              <Link 
                href="/contact" 
                onClick={closeMenu} 
                className="hover:text-orange transition-colors w-full text-center border-b border-jet-black/10 py-3.5 min-h-[48px] flex items-center justify-center"
              >
                Contact
              </Link>
            </>
          )}

          {/* Authenticated Links in Mobile */}
          {isMounted && (
            user ? (
              <>
                {/* Dashboard: Accessible to all authenticated members */}
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className={`transition-colors w-full text-center border-b border-jet-black/10 py-3.5 min-h-[48px] flex items-center justify-center font-bold ${
                    pathname === '/dashboard' ? 'text-orange font-bold' : 'hover:text-orange text-jet-black'
                  }`}
                >
                  Dashboard
                </Link>

                {/* Build Log: Restricted strictly to Core Leadership & Domain Leads */}
                {(isCore || isLead) && (
                  <Link
                    href="/log"
                    onClick={closeMenu}
                    className={`transition-colors w-full text-center border-b border-jet-black/10 py-3.5 min-h-[48px] flex items-center justify-center font-bold ${
                      pathname === '/log' ? 'text-orange font-bold' : 'hover:text-orange text-jet-black'
                    }`}
                  >
                    Build Log
                  </Link>
                )}

                <div className="w-full text-center py-2 flex flex-col items-center justify-center gap-2">
                  <div className="text-xs font-mono uppercase px-3 py-1.5 rounded-full bg-jet-black text-alice-blue flex items-center gap-2">
                    <span className="text-orange">{currentTeam?.code || user.teamId.toUpperCase()}</span>
                    <span>{user.displayName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="text-xs font-mono text-red-500 underline min-h-[44px] flex items-center px-2 cursor-pointer"
                  >
                    Logout from Portal
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="text-orange hover:text-jet-black transition-colors w-full text-center border-b border-jet-black/10 py-3.5 min-h-[48px] flex items-center justify-center font-sans font-bold uppercase tracking-wider text-xl"
              >
                Portal Login →
              </Link>
            )
          )}
          
          {!isInstalled && (
            <button
              type="button"
              onClick={() => {
                installApp();
                closeMenu();
              }}
              className="w-full text-center py-3.5 min-h-[48px] flex items-center justify-center gap-2 font-sans font-bold text-sm uppercase tracking-wider text-orange hover:text-jet-black border-b border-jet-black/10 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Install Web App</span>
            </button>
          )}
        </div>
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
