'use client';

import React, { useState } from 'react';
import { SUBSYSTEM_SYSTEMS, SubsystemDetail } from './bikeSpecsData';

export default function SubsystemsExplorer() {
  const [activeSubsystem, setActiveSubsystem] = useState<SubsystemDetail>(SUBSYSTEM_SYSTEMS[0]);

  return (
    <section className="mb-16 md:mb-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-jet-black/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-grey font-bold">
              Subsystems Engineering Matrix
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-jet-black tracking-tight uppercase">
            Systems Architecture<span className="text-orange">.</span>
          </h2>
          <p className="text-sm sm:text-base text-grey font-light mt-1 max-w-xl">
            Ground-up technical breakdowns across all 8 engineering squads and vehicle sub-assemblies.
          </p>
        </div>

        <div className="font-mono text-xs text-grey bg-white px-3.5 py-2 rounded-xl border border-jet-black/10 shrink-0 self-start md:self-auto">
          <span className="text-orange font-bold">8</span> Active Subsystems
        </div>
      </div>

      {/* Horizontal Subsystems Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 hide-scrollbar">
        {SUBSYSTEM_SYSTEMS.map((sub) => {
          const isActive = activeSubsystem.id === sub.id;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setActiveSubsystem(sub)}
              className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                isActive
                  ? 'bg-jet-black text-alice-blue border-jet-black shadow-sm'
                  : 'bg-white border-jet-black/10 text-grey hover:border-orange hover:text-jet-black'
              }`}
            >
              <span className={`text-[10px] ${isActive ? 'text-orange' : 'text-grey'}`}>
                {sub.code.split(' / ')[0]}
              </span>
              <span>{sub.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Subsystem Detail Card (Two Columns) */}
      <div className="bg-white border border-jet-black/10 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm animate-in fade-in duration-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* Left Column: Narrative, Category, Materials */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-xs font-mono font-bold text-orange px-2.5 py-0.5 rounded bg-orange/10 uppercase tracking-widest">
                  {activeSubsystem.code}
                </span>
                <span className="text-xs font-mono text-grey uppercase tracking-wider font-semibold">
                  {activeSubsystem.category}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-jet-black tracking-tight leading-tight">
                {activeSubsystem.headline}
              </h3>
            </div>

            <p className="text-sm sm:text-base text-grey font-light leading-relaxed">
              {activeSubsystem.description}
            </p>

            {/* Materials Used */}
            <div className="pt-4 border-t border-jet-black/10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-grey font-bold block mb-2.5">
                Primary Engineering Materials:
              </span>
              <div className="flex flex-wrap gap-2">
                {activeSubsystem.materials.map((mat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-lg bg-alice-blue border border-jet-black/10 text-xs font-mono font-semibold text-jet-black"
                  >
                    {mat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Key Parameters & Competition Compliance */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 lg:border-l lg:border-jet-black/10 lg:pl-10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-grey font-bold block mb-4">
                Verified Technical Metrics:
              </span>
              
              <div className="grid grid-cols-2 gap-3">
                {activeSubsystem.specs.map((spec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-alice-blue/60 border border-jet-black/10 rounded-xl"
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider text-grey block mb-1">
                      {spec.label}
                    </span>
                    <span className="text-sm sm:text-base font-bold font-mono text-jet-black">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Factor & Compliance Badge */}
            <div className="space-y-3 pt-4 border-t border-jet-black/10">
              {activeSubsystem.safetyFactor && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-800 font-bold uppercase tracking-wider">
                    Safety Margin:
                  </span>
                  <span className="text-emerald-700 font-bold">
                    {activeSubsystem.safetyFactor}
                  </span>
                </div>
              )}

              <div className="p-3.5 bg-jet-black text-alice-blue rounded-xl border border-jet-black/20 text-xs font-mono space-y-1">
                <span className="text-[10px] text-orange font-bold uppercase tracking-widest block">
                  SIEP Proving Ground Compliance:
                </span>
                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  {activeSubsystem.siepCompliance}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
