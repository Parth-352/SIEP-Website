"use client";

import React from 'react';
import { SUPPORT_AREAS } from './types';

export default function SupportAreasGrid() {
  return (
    <div className="lg:col-span-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-jet-black/10">
          <h2 className="text-[11px] tracking-[0.3em] uppercase text-grey font-mono font-bold">
            How You Can Support
          </h2>
          <span className="text-[11px] font-mono text-orange font-bold">6 Focus Areas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {SUPPORT_AREAS.map((area, idx) => (
            <div 
              key={idx} 
              className="p-4 sm:p-5 bg-white border border-jet-black/10 rounded-2xl hover:border-orange/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-jet-black/5 text-jet-black">
                    [ 0{idx + 1} ]
                  </span>
                  <span className="text-xs text-orange font-mono">→</span>
                </div>
                <h3 className="font-bold text-sm sm:text-base text-jet-black mb-1">{area.label}</h3>
                <p className="text-xs text-grey font-light leading-relaxed">{area.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Email Banner */}
      <div className="mt-6 p-5 rounded-2xl bg-jet-black text-alice-blue flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10 shadow-sm">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-orange font-bold block mb-1">
            Official Communication Channel
          </span>
          <span className="font-mono text-sm sm:text-base font-bold text-white">
            ebikeclubcoe@snjb.org
          </span>
        </div>
        <a
          href="mailto:ebikeclubcoe@snjb.org"
          className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 bg-orange text-jet-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-white transition-colors text-center shrink-0"
        >
          Direct Email ↗
        </a>
      </div>
    </div>
  );
}
