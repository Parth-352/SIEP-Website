'use client';

import React from 'react';
import { SIEP_PROVING_GROUND_TRIALS } from './bikeSpecsData';

export default function ProvingGroundSection() {
  return (
    <section className="mb-16 md:mb-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-jet-black/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-grey font-bold">
              Dynamic Competition Scrutiny
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-jet-black tracking-tight uppercase">
            Proving Ground Trials<span className="text-orange">.</span>
          </h2>
          <p className="text-sm sm:text-base text-grey font-light mt-1 max-w-xl">
            SIEP Season 7.0 dynamic proving ground trials organized by ISIEINDIA to test performance limits.
          </p>
        </div>

        <div className="font-mono text-xs text-grey bg-white px-3.5 py-2 rounded-xl border border-jet-black/10 shrink-0 self-start md:self-auto">
          <span className="text-orange font-bold">4</span> Dynamic Trials
        </div>
      </div>

      {/* 4 Trials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {SIEP_PROVING_GROUND_TRIALS.map((trial) => (
          <div
            key={trial.id}
            className="p-5 sm:p-6 bg-white border border-jet-black/10 rounded-3xl flex flex-col justify-between hover:border-orange/60 hover:shadow-md transition-all duration-300 group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-black text-orange px-2.5 py-0.5 rounded bg-orange/10">
                  {trial.code}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-jet-black/5 text-jet-black uppercase">
                  {trial.status}
                </span>
              </div>

              <h3 className="font-bold text-base sm:text-lg text-jet-black mb-1 group-hover:text-orange transition-colors">
                {trial.title}
              </h3>

              <div className="my-3 p-3 bg-alice-blue rounded-xl border border-jet-black/5">
                <span className="text-[9px] font-mono uppercase tracking-widest text-grey block font-bold mb-0.5">
                  Target Benchmark:
                </span>
                <span className="text-xs font-mono font-bold text-jet-black">
                  {trial.targetMetric}
                </span>
              </div>

              <p className="text-xs text-grey font-light leading-relaxed mb-3">
                {trial.rulebookRequirement}
              </p>
            </div>

            <div className="pt-3 border-t border-jet-black/5">
              <span className="text-[9px] font-mono uppercase tracking-widest text-orange block font-bold mb-1">
                Engineering Approach:
              </span>
              <p className="text-xs text-jet-black/80 font-mono font-medium leading-snug">
                {trial.scramblerApproach}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
