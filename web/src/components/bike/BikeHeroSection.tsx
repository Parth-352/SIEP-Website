'use client';

import React from 'react';
import { HERO_TELEMETRY_STATS } from './bikeSpecsData';

export default function BikeHeroSection() {
  return (
    <section className="mb-14 md:mb-20">
      {/* Eyebrow & Category */}
      <div className="flex items-center gap-3 mb-4">
        <span className="w-2 h-2 rounded-full bg-orange animate-pulse"></span>
        <span className="text-xs font-mono uppercase tracking-[0.25em] text-grey font-bold">
          02 / Hardware &amp; Subsystems Architecture
        </span>
      </div>

      {/* Main Display Headline */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-8 border-b border-jet-black/10">
        <div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-jet-black tracking-tighter leading-[0.9] uppercase">
            The Smart<br />
            <span className="text-orange">Scrambler.</span>
          </h1>
        </div>
        <p className="text-base sm:text-lg md:text-xl text-grey font-light leading-relaxed max-w-xl">
          Engineered from raw 4130 chromoly steel, mid-drive BLDC electric powertrain, 72V 40Ah monocoque battery, and real-time 500kbps CAN bus telemetry for the national <strong className="text-jet-black font-semibold">SIEP E-Bike Challenge Season 7.0</strong>.
        </p>
      </div>

      {/* 6-Card Telemetry Stat Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {HERO_TELEMETRY_STATS.map((stat, idx) => (
          <div
            key={idx}
            className="p-4 sm:p-5 bg-white border border-jet-black/10 rounded-2xl flex flex-col justify-between hover:border-orange/60 hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-jet-black/5 text-grey uppercase tracking-wider">
                {stat.tag}
              </span>
              <span className="text-xs text-orange font-mono group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>

            <div className="mb-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-jet-black">
                  {stat.value}
                </span>
                <span className="text-xs font-mono font-bold text-orange uppercase">
                  {stat.unit}
                </span>
              </div>
              <h3 className="text-xs font-bold text-jet-black mt-1 leading-snug">
                {stat.label}
              </h3>
            </div>

            <p className="text-[11px] font-light text-grey leading-tight border-t border-jet-black/5 pt-2">
              {stat.subtext}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
