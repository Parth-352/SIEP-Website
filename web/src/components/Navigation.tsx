"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TEAMS } from '@/lib/teams';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const currentTeam = user ? TEAMS[user.teamId] : null;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isPortalPage = pathname.startsWith('/log') || pathname.startsWith('/dashboard');

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

  return (
    <>
      {/* Top Nav Bar — always visible */}
      <nav className="fixed top-0 left-0 w-full z-[100] bg-alice-blue/85 backdrop-blur-md border-b border-jet-black/10 shadow-sm pointer-events-auto font-sans transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 py-3.5 flex justify-between items-center w-full">
          {/* Brand Logo & Portal Tag */}
          <div className="flex items-center gap-3">
          <Link 
            href="/" 
            onClick={closeMenu}
            className="text-2xl font-black text-jet-black tracking-tighter hover:opacity-90 transition-opacity"
          >
            Riders Bay<span className="text-orange">.</span>
          </Link>
          {isMounted && user && (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-jet-black/15">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-jet-black text-alice-blue font-bold">
                PORTAL
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
              <Link
                href="/log"
                className={`h-9 px-3.5 rounded-xl text-xs font-sans uppercase tracking-wider font-bold transition-all inline-flex items-center justify-center ${
                  pathname === '/log'
                    ? 'bg-jet-black text-alice-blue shadow-sm'
                    : 'text-jet-black hover:text-orange hover:bg-jet-black/5'
                }`}
              >
                {isAdmin ? 'Build Log' : 'Team Log'}
              </Link>

              <Link
                href="/"
                target="_blank"
                className="h-9 px-3 rounded-xl text-grey hover:text-jet-black text-xs font-sans font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors hover:bg-jet-black/5"
              >
                <span>Public Site</span>
                <svg className="w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>

              {/* User Team Pill + Logout */}
              <div className="flex items-center gap-2 pl-3 border-l border-jet-black/15">
                <span className="h-9 px-3.5 text-xs font-sans font-bold uppercase tracking-wider rounded-xl bg-jet-black text-alice-blue inline-flex items-center gap-2 shadow-sm">
                  <span className="text-[10px] text-orange font-mono font-bold">[{currentTeam?.code || user.teamId.toUpperCase()}]</span>
                  <span>{user.displayName || user.teamName}</span>
                </span>
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
                      href={isAdmin ? "/dashboard" : "/log"}
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
              </div>
            </>
          )}
        </div>

        {/* Mobile Hamburger / X — ONLY uses onClick (no onTouchEnd to avoid double-fire) */}
        <button 
          type="button"
          className="md:hidden text-jet-black w-12 h-12 min-w-[48px] min-h-[48px] flex items-center justify-center focus:outline-none cursor-pointer touch-manipulation"
          onClick={toggleMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <svg className="w-7 h-7 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-7 h-7 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay — z-[90] so it's BELOW the nav bar (z-[100]) */}
      <div 
        className={`md:hidden fixed inset-0 w-full h-[100dvh] bg-alice-blue z-[90] transition-all duration-300 ease-in-out flex flex-col justify-center items-center overflow-y-auto font-sans ${
          isMobileMenuOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex flex-col items-center space-y-5 text-2xl uppercase tracking-widest font-bold text-jet-black w-full px-8 py-20 max-w-sm">
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

          {/* Authenticated Links in Mobile */}
          {isMounted && (
            user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="hover:text-orange text-orange transition-colors w-full text-center border-b border-jet-black/10 py-3.5 min-h-[48px] flex items-center justify-center font-bold"
                >
                  Dashboard
                </Link>
                <Link
                  href="/log"
                  onClick={closeMenu}
                  className="hover:text-orange transition-colors w-full text-center border-b border-jet-black/10 py-3.5 min-h-[48px] flex items-center justify-center font-bold"
                >
                  {isAdmin ? 'Build Log' : 'Team Log'}
                </Link>
                <div className="w-full text-center py-2 flex items-center justify-center gap-3">
                  <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-jet-black text-alice-blue">
                    [{currentTeam?.code || user.teamId.toUpperCase()}] {user.teamName}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="text-xs font-mono text-red-500 underline"
                  >
                    Logout
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
          
          <Link 
            href="/contact" 
            onClick={closeMenu} 
            className="w-full text-center px-6 py-4 bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold mt-2 rounded-xl min-h-[48px] flex items-center justify-center text-sm tracking-widest uppercase shadow-md"
          >
            Partner With Us
          </Link>
        </div>
      </div>
    </>
  );
}
