'use client';

import React from 'react';
import Link from 'next/link';
import { UserProfile } from '@/lib/types';

interface GlobalMobileBottomBarProps {
  isMounted: boolean;
  isStandalone: boolean;
  pathname: string;
  user: UserProfile | null;
  isCore: boolean;
  isLead: boolean;
}

export default function GlobalMobileBottomBar({
  isMounted,
  isStandalone,
  pathname,
  user,
  isCore,
  isLead,
}: GlobalMobileBottomBarProps) {
  if (!isMounted || !isStandalone || pathname === '/dashboard' || pathname === '/login') {
    return null;
  }

  return (
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
              <span
                className={`text-[10px] font-mono tracking-tight mt-0.5 ${
                  pathname === '/dashboard' ? 'font-bold text-jet-black' : 'font-medium'
                }`}
              >
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
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
              <svg
                className="w-6 h-6"
                fill={pathname === '/' ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="text-[10px] font-mono tracking-tight mt-0.5">About</span>
            </Link>

            {/* 3. The Bike */}
            <Link
              href="/bike"
              title="The Bike"
              className="flex flex-col items-center justify-center py-0.5 px-2 group active:scale-95 transition-transform"
            >
              <div
                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center font-bold transition-all shadow-2xs ${
                  pathname === '/bike'
                    ? 'border-orange bg-orange text-white'
                    : 'border-jet-black bg-white text-jet-black group-hover:border-orange group-hover:text-orange'
                }`}
              >
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <span className="text-[10px] font-mono tracking-tight mt-0.5">Login</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
