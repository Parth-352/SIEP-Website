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
        <span className="h-9 px-3.5 text-xs font-sans font-bold uppercase tracking-wider rounded-xl bg-jet-black text-alice-blue inline-flex items-center gap-2 shadow-sm border border-orange/30">
          <span className="text-[10px] text-orange font-mono font-bold">[CORE]</span>
          <span>{name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange/20 text-orange font-mono font-bold">
            {isCaptain ? 'CAPTAIN' : 'CORE'}
          </span>
        </span>
      );
    }

    if (isLead) {
      return (
        <span className="h-9 px-3.5 text-xs font-sans font-bold uppercase tracking-wider rounded-xl bg-jet-black text-alice-blue inline-flex items-center gap-2 shadow-sm border border-jet-black/20">
          <span className="text-[10px] text-sky-400 font-mono font-bold">[{teamCode}]</span>
          <span>{name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono font-bold">
            LEAD
          </span>
        </span>
      );
    }

    // Tier 3: Team Member
    return (
      <span className="h-9 px-3.5 text-xs font-sans font-bold uppercase tracking-wider rounded-xl bg-jet-black text-alice-blue inline-flex items-center gap-2 shadow-sm border border-jet-black/20">
        <span className="text-[10px] text-grey font-mono font-bold">[{teamCode}]</span>
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
                {/* Build Log: Primary route accessible to all users */}
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

                {/* Dashboard: Visible to Core & Leads */}
                {(isCore || isLead) && (
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
                )}

                {/* Install Web App Button */}
                {!isInstalled && !isStandalone && (
                  <button
                    type="button"
                    onClick={installApp}
                    title="Install SIEP Log System on your device"
                    className="h-9 px-3 rounded-xl border border-orange/40 bg-orange/10 hover:bg-orange text-jet-black hover:text-white transition-all text-xs font-sans font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>📲</span>
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

                {/* Action Buttons Section */}
                <div className="flex items-center gap-3 pl-3 border-l border-jet-black/15">
                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        className="h-9 px-3.5 rounded-xl bg-jet-black text-alice-blue text-xs font-sans font-bold uppercase tracking-wider hover:bg-orange transition-all inline-flex items-center gap-2 shadow-sm"
                      >
                        <span className="text-[10px] text-orange font-mono font-bold">[{currentTeam?.code || user.teamId.toUpperCase()}]</span>
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

                  <Link 
                    href="/contact" 
                    className="h-9 px-4 bg-jet-black text-alice-blue hover:bg-orange transition-all rounded-xl font-bold shadow-sm text-xs font-sans uppercase tracking-wider inline-flex items-center justify-center"
                  >
                    Partner With Us
                  </Link>

                  {!isInstalled && (
                    <button
                      type="button"
                      onClick={installApp}
                      title="Install Web App on your phone or computer"
                      className="h-9 px-3 rounded-xl border border-orange/40 bg-orange/10 hover:bg-orange text-jet-black hover:text-white transition-all text-xs font-sans font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>📲</span>
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
                [{currentTeam?.code || user.teamId.toUpperCase()}]
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
            </>
          )}

          {/* Authenticated Links in Mobile */}
          {isMounted && (
            user ? (
              <>
                {/* Build Log: Accessible to all members */}
                <Link
                  href="/log"
                  onClick={closeMenu}
                  className={`transition-colors w-full text-center border-b border-jet-black/10 py-3.5 min-h-[48px] flex items-center justify-center font-bold ${
                    pathname === '/log' ? 'text-orange font-bold' : 'hover:text-orange text-jet-black'
                  }`}
                >
                  Build Log
                </Link>

                {/* Dashboard: Visible to Core & Leads */}
                {(isCore || isLead) && (
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className={`transition-colors w-full text-center border-b border-jet-black/10 py-3.5 min-h-[48px] flex items-center justify-center font-bold ${
                      pathname === '/dashboard' ? 'text-orange font-bold' : 'hover:text-orange text-jet-black'
                    }`}
                  >
                    Dashboard
                  </Link>
                )}

                <div className="w-full text-center py-2 flex flex-col items-center justify-center gap-2">
                  <div className="text-xs font-mono uppercase px-3 py-1.5 rounded-full bg-jet-black text-alice-blue flex items-center gap-2">
                    <span className="text-orange">[{currentTeam?.code || user.teamId.toUpperCase()}]</span>
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
              <span>📲</span>
              <span>Install Web App</span>
            </button>
          )}

          {!isPortalOnly && (
            <Link 
              href="/contact" 
              onClick={closeMenu} 
              className="w-full text-center px-6 py-4 bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold mt-2 rounded-xl min-h-[48px] flex items-center justify-center text-sm tracking-widest uppercase shadow-md"
            >
              Partner With Us
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
