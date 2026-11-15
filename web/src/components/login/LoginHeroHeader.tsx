"use client";

import React from 'react';
import Link from 'next/link';

export default function LoginHeroHeader() {
  return (
    <div className="text-center mb-6">
      <div className="flex justify-center mb-3">
        <Link href="/" className="inline-block group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange/40 to-amber-500/40 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition duration-300" />
            <div className="relative w-14 h-14 rounded-2xl bg-jet-black border border-white/10 shadow-xl overflow-hidden flex items-center justify-center p-0.5">
              <img src="/icons/icon-192.png" alt="Riders Bay" className="w-full h-full object-contain rounded-xl" />
            </div>
          </div>
        </Link>
      </div>

      <Link
        href="/"
        className="inline-block text-2xl sm:text-3xl font-black text-jet-black tracking-tight hover:opacity-90 transition-opacity"
      >
        Riders Bay<span className="text-orange">.</span>
      </Link>
      <div className="mt-2 flex items-center justify-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-jet-black text-alice-blue text-[10px] font-mono uppercase tracking-[0.2em] font-bold shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
          SIEP OPERATIONS PORTAL
        </span>
      </div>
      <p className="mt-2 text-xs font-sans text-grey">
        Sign in with your registered email and 6-digit PIN
      </p>
    </div>
  );
}
