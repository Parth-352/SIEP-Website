'use client';

import React from 'react';
import Link from 'next/link';

export default function BikeCtaHub() {
  return (
    <section className="border-t border-jet-black/10 pt-16">
      <div className="bg-jet-black text-alice-blue rounded-3xl p-8 sm:p-12 border border-jet-black/20 shadow-xl">
        <div className="max-w-3xl">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-orange font-bold block mb-2">
            Collegiate Electric Mobility Proving Ground
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-tight mb-4">
            Explore Vehicle Data &amp; Fabrication<span className="text-orange">.</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed mb-8">
            Access CAD engineering documents, review our day-by-day workshop fabrication proof, or query the official SIEP Season 7.0 rulebook AI copilot.
          </p>
        </div>

        {/* 4 Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/materials"
            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-orange hover:bg-white/10 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-orange font-bold">[ 01 ]</span>
              <span className="text-slate-400 group-hover:text-orange group-hover:translate-x-1 transition-all">↗</span>
            </div>
            <h3 className="font-bold text-base text-white mb-1 group-hover:text-orange transition-colors">
              Research Hub
            </h3>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              CAD spaceframe drawings, technical datasheets, and calculation sheets.
            </p>
          </Link>

          <Link
            href="/log"
            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-orange hover:bg-white/10 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-orange font-bold">[ 02 ]</span>
              <span className="text-slate-400 group-hover:text-orange group-hover:translate-x-1 transition-all">↗</span>
            </div>
            <h3 className="font-bold text-base text-white mb-1 group-hover:text-orange transition-colors">
              Build Log &amp; Video
            </h3>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Step-by-step physical fabrication updates and video proof.
            </p>
          </Link>

          <Link
            href="/copilot"
            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-orange hover:bg-white/10 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-orange font-bold">[ 03 ]</span>
              <span className="text-slate-400 group-hover:text-orange group-hover:translate-x-1 transition-all">↗</span>
            </div>
            <h3 className="font-bold text-base text-white mb-1 group-hover:text-orange transition-colors">
              Rulebook Copilot
            </h3>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              AI verification against official SIEP Season 7.0 technical rules.
            </p>
          </Link>

          <Link
            href="/contact"
            className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-orange hover:bg-white/10 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-orange font-bold">[ 04 ]</span>
              <span className="text-slate-400 group-hover:text-orange group-hover:translate-x-1 transition-all">↗</span>
            </div>
            <h3 className="font-bold text-base text-white mb-1 group-hover:text-orange transition-colors">
              Partner With Us
            </h3>
            <p className="text-xs text-slate-400 font-light leading-relaxed">
              Direct liaison with faculty mentor and student leadership.
            </p>
          </Link>
        </div>
      </div>

      {/* Return Home Link */}
      <div className="text-center mt-12 pt-6">
        <Link href="/" className="text-xs text-grey hover:text-orange font-mono transition-colors">
          ← Return to Riders Bay Home
        </Link>
      </div>
    </section>
  );
}
