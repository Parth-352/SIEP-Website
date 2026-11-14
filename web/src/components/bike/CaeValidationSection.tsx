'use client';

import React from 'react';
import { CAE_VALIDATION_DATA } from './bikeSpecsData';

export default function CaeValidationSection() {
  return (
    <section className="mb-16 md:mb-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-jet-black/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-grey font-bold">
              Computational Engineering &amp; Simulation
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-jet-black tracking-tight uppercase">
            CAE &amp; Structural Validation<span className="text-orange">.</span>
          </h2>
          <p className="text-sm sm:text-base text-grey font-light mt-1 max-w-xl">
            Finite Element Analysis (FEA) and Computational Fluid Dynamics (CFD) verifying safety margins before physical fabrication.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold shrink-0 self-start md:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>100% FEA Stress Certified</span>
        </div>
      </div>

      {/* 3 Validation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CAE_VALIDATION_DATA.map((item) => (
          <div
            key={item.id}
            className="p-6 bg-white border border-jet-black/10 rounded-3xl flex flex-col justify-between hover:border-orange/50 hover:shadow-md transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-jet-black/5 text-jet-black uppercase tracking-wider">
                  {item.simulationType}
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                  {item.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-jet-black mb-2 leading-tight">
                {item.title}
              </h3>

              <p className="text-xs text-grey font-light leading-relaxed mb-4">
                {item.description}
              </p>
            </div>

            <div className="space-y-2.5 pt-4 border-t border-jet-black/10">
              <div className="p-3 rounded-xl bg-alice-blue border border-jet-black/5 space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-grey block font-bold">
                  Target Criteria:
                </span>
                <p className="text-xs font-mono font-medium text-jet-black">
                  {item.targetCriteria}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-jet-black text-alice-blue space-y-1">
                <span className="text-[9px] font-mono uppercase tracking-widest text-orange block font-bold">
                  Simulation Outcome:
                </span>
                <p className="text-xs font-mono font-bold text-white">
                  {item.achievedValue}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-mono px-1">
                <span className="text-grey font-semibold">Safety Margin:</span>
                <span className="text-emerald-600 font-bold">{item.safetyMargin}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
