"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface LoginFormCardProps {
  email: string;
  setEmail: (email: string) => void;
  pin: string;
  setPin: (pin: string) => void;
  error: string | null;
  isSubmitting: boolean;
  isStandalone: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onOpenForgotPin: () => void;
}

export default function LoginFormCard({
  email,
  setEmail,
  pin,
  setPin,
  error,
  isSubmitting,
  isStandalone,
  onSubmit,
  onOpenForgotPin,
}: LoginFormCardProps) {
  const [showPin, setShowPin] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-jet-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6 sm:p-8 space-y-5">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono flex items-start gap-2.5">
          <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0 mt-1"></span>
          <span className="flex-1 leading-relaxed">{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Registered Email Input */}
        <div>
          <label className="block text-[11px] font-mono uppercase tracking-wider text-jet-black font-bold mb-1.5">
            Registered Gmail Address
          </label>
          <div className="relative">
            <input
              type="email"
              required
              autoFocus
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-alice-blue/60 border border-jet-black/15 rounded-xl text-sm font-sans text-jet-black placeholder:text-grey/40 focus:outline-none focus:bg-white focus:border-orange focus:ring-4 focus:ring-orange/15 transition-all"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey/60 pointer-events-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
          </div>
        </div>

        {/* 6-Digit PIN Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-jet-black font-bold">
              6-Digit PIN
            </label>
            <button
              type="button"
              onClick={onOpenForgotPin}
              className="text-[11px] font-mono text-orange hover:text-jet-black font-bold transition-colors cursor-pointer"
            >
              Forgot PIN?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              maxLength={6}
              required
              placeholder="••••••"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full pl-10 pr-10 py-3 bg-alice-blue/60 border border-jet-black/15 rounded-xl text-base font-mono font-bold tracking-[0.3em] text-jet-black placeholder:text-grey/40 focus:outline-none focus:bg-white focus:border-orange focus:ring-4 focus:ring-orange/15 transition-all"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-grey/60 pointer-events-none">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-grey hover:text-jet-black transition-colors cursor-pointer"
              title={showPin ? 'Hide PIN' : 'Show PIN'}
            >
              {showPin ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Default PIN info chip */}
          <div className="mt-2.5 px-3 py-2 rounded-xl bg-alice-blue border border-jet-black/10 flex items-center justify-between text-[11px] font-mono">
            <span className="text-jet-black/80 flex items-center gap-1.5">
              <span className="text-grey">Default PIN:</span>
              <span className="px-1.5 py-0.5 rounded bg-orange/15 text-orange font-bold font-mono">935200</span>
            </span>
            <span className="text-grey/70 text-[10px]">Changeable inside</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange hover:text-jet-black font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-50 mt-1"
        >
          {isSubmitting ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing In...</span>
            </>
          ) : (
            <>
              <span>Sign In to Portal</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </>
          )}
        </button>
      </form>

      {/* Return to Public Website (Hidden when inside standalone app mode) */}
      {!isStandalone && (
        <div className="pt-3 text-center border-t border-jet-black/10">
          <Link
            href="/"
            className="text-xs font-mono uppercase tracking-wider text-grey hover:text-jet-black transition-colors inline-flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Return to Public Website</span>
          </Link>
        </div>
      )}
    </div>
  );
}
