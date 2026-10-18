"use client";

import React, { useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { TEAMS } from '@/lib/teams';
import { TeamId, TeamConfig } from '@/lib/types';

// All official SIEP divisions including Core Admin
const LOGIN_TEAMS: TeamConfig[] = [
  TEAMS.core,
  TEAMS.software,
  TEAMS.mechanical,
  TEAMS.entc,
  TEAMS.design,
  TEAMS.research,
  TEAMS.sponsorship,
  TEAMS.socialmedia,
  TEAMS.documentation,
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get('from');

  const { user, login } = useAuth();

  const [selectedTeamId, setSelectedTeamId] = useState<TeamId | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Clicking a team ONLY selects it and focuses password - DOES NOT LOG IN DIRECTLY
  const handleSelectTeam = (teamId: TeamId) => {
    setSelectedTeamId(teamId);
    setError(null);
    setPassword('');
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
  };

  // Login only occurs when submitting with the correct password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedTeamId) {
      setError('Please click your subsystem team from the cards above.');
      return;
    }

    const team = TEAMS[selectedTeamId];
    if (!team) {
      setError('Invalid team selected.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter the password for ' + team.name + '.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(team.email, password);
      if (!res.success) {
        setError(res.error || `Invalid password for [${team.code}] ${team.name}. Please enter your authorized team password.`);
        setIsSubmitting(false);
      } else {
        // Successful login: navigate to target page
        if (fromUrl && !fromUrl.startsWith('/login')) {
          router.push(fromUrl);
        } else if (team.role === 'admin' || team.id === 'core') {
          router.push('/dashboard');
        } else {
          router.push('/log');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsSubmitting(false);
    }
  };

  const selectedTeam = selectedTeamId ? TEAMS[selectedTeamId] : null;

  return (
    <main className="min-h-screen bg-alice-blue text-jet-black pt-24 pb-16 px-4 sm:px-6 font-sans flex flex-col justify-center items-center">
      
      {/* Background subtle grid pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#2B303A_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="w-full max-w-xl relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl sm:text-4xl font-black text-jet-black tracking-tighter hover:opacity-90 transition-opacity">
            Riders Bay<span className="text-orange">.</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-orange animate-pulse"></span>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-grey font-bold">
              SIEP Internal Portal
            </span>
          </div>
          <p className="text-sm text-grey mt-2 font-light">
            Engineering build logs, step tracking &amp; subsystem telemetry
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-jet-black/10 rounded-2xl p-6 sm:p-8 shadow-xl">
          
          {/* Active Session Notification (if user already logged in) */}
          {user && (
            <div className="mb-5 p-3.5 bg-amber-500/[0.08] border border-amber-500/30 rounded-xl flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2.5 truncate mr-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-jet-black truncate">
                  Active session: <strong className="font-bold">[{user.teamId.toUpperCase()}] {user.displayName}</strong>
                </span>
              </div>
              <Link
                href={fromUrl && !fromUrl.startsWith('/login') ? fromUrl : (user.role === 'admin' || user.teamId === 'core' ? '/dashboard' : '/log')}
                className="text-orange hover:underline font-bold shrink-0 inline-flex items-center gap-1"
              >
                <span>Continue &rarr;</span>
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between pb-4 mb-5 border-b border-jet-black/5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-orange font-bold block mb-0.5">
                Step 1 &bull; Click to Select Team
              </span>
              <h2 className="text-lg font-bold tracking-tight text-jet-black">
                Select Your Subsystem Team
              </h2>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-jet-black/5 text-jet-black/70 font-semibold self-start sm:self-auto">
              9 Divisions
            </span>
          </div>

          {/* Team Selection Grid - Clicking ONLY highlights and selects, DOES NOT submit */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
            {LOGIN_TEAMS.map((t) => {
              const isSelected = selectedTeamId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTeam(t.id)}
                  className={`text-left p-3 rounded-xl border text-xs font-mono transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'bg-orange/10 border-orange text-jet-black ring-2 ring-orange/30 shadow-sm'
                      : 'bg-alice-blue/40 border-jet-black/10 hover:border-jet-black/30 hover:bg-white text-jet-black'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        isSelected
                          ? 'bg-orange text-white'
                          : 'bg-jet-black/10 text-jet-black'
                      }`}
                    >
                      {t.code}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-orange text-white flex items-center justify-center shrink-0">
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>

                  <span className="font-bold text-xs truncate block text-jet-black mt-0.5">
                    {t.shortName}
                  </span>

                  <span className="text-[10px] text-grey truncate opacity-80 mt-1 block">
                    {t.lead || (t.role === 'admin' ? 'Admin' : 'Team')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="leading-relaxed flex-1">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-800 text-xs font-mono font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Password & Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5 pt-4 border-t border-jet-black/10">
            
            {/* Selected Team Badge Ribbon */}
            {selectedTeam ? (
              <div className="p-3.5 bg-alice-blue/70 border border-orange/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange"></span>
                  <div className="truncate">
                    <span className="text-xs font-mono font-bold text-jet-black block truncate">
                      [{selectedTeam.code}] {selectedTeam.name}
                    </span>
                    <span className="text-[10px] font-mono text-grey truncate block">
                      {selectedTeam.email}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeamId(null);
                    setPassword('');
                  }}
                  className="text-[11px] font-mono text-grey hover:text-orange underline cursor-pointer ml-2 shrink-0"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-alice-blue/30 border border-dashed border-jet-black/20 rounded-xl text-center text-xs font-mono text-grey">
                Click your subsystem team above to continue &uarr;
              </div>
            )}

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-grey font-medium">
                  Team Password *
                </label>
              </div>
              <div className="relative">
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={selectedTeam ? "Enter team password..." : "Select a team first..."}
                  disabled={!selectedTeamId}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-jet-black/15 bg-alice-blue/40 text-jet-black placeholder:text-grey/40 text-sm focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-grey hover:text-jet-black p-1 text-xs focus:outline-none cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedTeamId}
              className={`w-full min-h-[48px] py-3.5 px-6 rounded-xl transition-all font-bold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 ${
                !selectedTeamId
                  ? 'bg-jet-black/30 text-white/70 cursor-not-allowed'
                  : 'bg-jet-black text-alice-blue hover:bg-orange cursor-pointer'
              } disabled:opacity-60`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Verifying Password...</span>
                </>
              ) : selectedTeam ? (
                <span>Sign In as [{selectedTeam.code}] {selectedTeam.shortName} &rarr;</span>
              ) : (
                <span>Select a Subsystem Team Above</span>
              )}
            </button>
          </form>

        </div>

        {/* Footer info */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-grey hover:text-orange font-mono transition-colors">
            &larr; Back to Riders Bay Public Site
          </Link>
        </div>

      </div>

    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-alice-blue flex items-center justify-center font-mono text-sm text-grey">
          <span className="w-5 h-5 border-2 border-orange border-t-transparent rounded-full animate-spin mr-3"></span>
          Loading portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
