'use client';

import React, { useState } from 'react';
import { SCHEMATIC_HOTSPOTS, SchematicHotspot } from './bikeSpecsData';

export default function BikeSchematicViewer() {
  const [activeHotspot, setActiveHotspot] = useState<SchematicHotspot>(SCHEMATIC_HOTSPOTS[0]);

  return (
    <section className="mb-16 md:mb-24">
      {/* Blueprint Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-orange animate-pulse"></span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-jet-black">
            System Architecture Blueprint
          </span>
          <span className="text-[10px] font-mono text-grey bg-white px-2 py-0.5 rounded border border-jet-black/10">
            Scale 1:1 Engineering CAD
          </span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-mono font-semibold self-start sm:self-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
          <span>CAD Digital Twin: Pre-Competition Scrutiny Refinement</span>
        </div>
      </div>

      {/* Blueprint Container */}
      <div className="relative bg-[#0d1117] text-white rounded-3xl border border-jet-black/20 overflow-hidden shadow-2xl">
        {/* Subtle CAD Grid Background */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Blueprint Top Header Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-orange tracking-widest uppercase">
              [ DRAWING NO. RB-SIEP-70-01 ]
            </span>
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
              Smart Scrambler General Assembly Blueprint
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Interactive Hotspots:
            </span>
            <div className="flex items-center gap-1">
              {SCHEMATIC_HOTSPOTS.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => setActiveHotspot(h)}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center ${
                    activeHotspot.id === h.id
                      ? 'bg-orange text-jet-black font-black scale-105 shadow-md shadow-orange/30'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                  title={`${h.number}: ${h.title}`}
                >
                  {h.number}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Central Blueprint Canvas & Vector Silhouette */}
        <div className="relative z-10 px-4 sm:px-8 py-8 md:py-12 min-h-[360px] md:min-h-[460px] flex items-center justify-center">
          
          {/* Detailed Engineering Vector Graphic */}
          <div className="relative w-full max-w-4xl mx-auto aspect-[16/9]">
            <svg
              viewBox="0 0 1000 560"
              className="w-full h-full text-slate-200 select-none"
              fill="none"
              stroke="currentColor"
            >
              <defs>
                {/* Precision Glowing Line Gradient */}
                <linearGradient id="blueprintGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#ffb347" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="chassisFill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffb347" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.05" />
                </linearGradient>
              </defs>

              {/* Ground Reference Plane */}
              <line x1="80" y1="480" x2="920" y2="480" stroke="#334155" strokeWidth="1.5" strokeDasharray="6 4" />
              <text x="90" y="500" fill="#64748b" fontSize="11" fontFamily="monospace">DATUM: GROUND LEVEL [0.00 mm]</text>

              {/* Dimension: Wheelbase (1,340 mm) */}
              <line x1="240" y1="520" x2="760" y2="520" stroke="#ffb347" strokeWidth="1.5" />
              <line x1="240" y1="510" x2="240" y2="530" stroke="#ffb347" strokeWidth="1.5" />
              <line x1="760" y1="510" x2="760" y2="530" stroke="#ffb347" strokeWidth="1.5" />
              <text x="500" y="515" fill="#ffb347" fontSize="12" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                WHEELBASE: 1,340 mm
              </text>

              {/* Dimension: Ground Clearance (180 mm) */}
              <line x1="500" y1="480" x2="500" y2="400" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
              <text x="510" y="445" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                CLEARANCE: 180 mm
              </text>

              {/* Dimension: Seat Height (810 mm) */}
              <line x1="160" y1="480" x2="160" y2="230" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="4 4" />
              <line x1="150" y1="230" x2="430" y2="230" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
              <text x="170" y="360" fill="#94a3b8" fontSize="10" fontFamily="monospace" transform="rotate(-90 170 360)">
                SEAT HEIGHT: 810 mm
              </text>

              {/* Rear Wheel (Spoked Scrambler Disc) */}
              <circle cx="240" cy="400" r="85" stroke="#475569" strokeWidth="6" />
              <circle cx="240" cy="400" r="70" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />
              <circle cx="240" cy="400" r="28" stroke="#ffb347" strokeWidth="2.5" fill="#1e293b" />
              {/* Rear Disc Brake */}
              <circle cx="240" cy="400" r="45" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 3" />

              {/* Front Wheel (Spoked Scrambler Disc) */}
              <circle cx="760" cy="400" r="95" stroke="#475569" strokeWidth="6" />
              <circle cx="760" cy="400" r="80" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />
              <circle cx="760" cy="400" r="30" stroke="#ffb347" strokeWidth="2.5" fill="#1e293b" />
              {/* Front Floating Rotor */}
              <circle cx="760" cy="400" r="55" stroke="#ef4444" strokeWidth="2" strokeDasharray="6 3" />

              {/* Inverted Front Telescopic Forks (USD) */}
              <line x1="760" y1="400" x2="680" y2="150" stroke="#ffb347" strokeWidth="7" strokeLinecap="round" />
              <line x1="745" y1="360" x2="670" y2="155" stroke="#38bdf8" strokeWidth="3" />
              {/* Triple Tree Clamps & Headstock */}
              <rect x="660" y="140" width="35" height="28" rx="4" fill="#334155" stroke="#ffb347" strokeWidth="2" />

              {/* Handlebars & Cockpit Control Node */}
              <path d="M665 140 L645 110 L685 110" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="645" cy="110" r="4" fill="#ffb347" />

              {/* Swingarm Rear Assembly */}
              <polygon points="240,400 440,380 430,420" stroke="#64748b" strokeWidth="3" fill="#1e293b" />
              {/* Rear Progressive Monoshock Linkage */}
              <line x1="410" y1="380" x2="445" y2="290" stroke="#f43f5e" strokeWidth="5" strokeLinecap="round" />
              <line x1="410" y1="380" x2="445" y2="290" stroke="#fecdd3" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* 4130 Chromoly Spaceframe Tubular Lattice */}
              <path
                d="
                  M675 160 
                  L520 220 
                  L430 230 
                  L380 280 
                  L440 380 
                  L500 400 
                  L540 320 
                  L675 160
                  Z
                "
                stroke="url(#blueprintGlow)"
                strokeWidth="3.5"
                fill="url(#chassisFill)"
              />
              {/* Spaceframe Cross Triangulation Tubes */}
              <line x1="520" y1="220" x2="500" y2="400" stroke="#ffb347" strokeWidth="2" strokeDasharray="5 3" />
              <line x1="430" y1="230" x2="540" y2="320" stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 3" />
              <line x1="540" y1="320" x2="630" y2="240" stroke="#ffb347" strokeWidth="2" />
              <line x1="500" y1="400" x2="630" y2="240" stroke="#38bdf8" strokeWidth="2" />

              {/* 72V 40Ah Central Battery Pack Monocoque */}
              <rect x="440" y="270" width="115" height="110" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
              {/* Battery Pack Internal Cell Architecture Markings */}
              <line x1="440" y1="305" x2="555" y2="305" stroke="#334155" strokeWidth="1" strokeDasharray="3 2" />
              <line x1="440" y1="340" x2="555" y2="340" stroke="#334155" strokeWidth="1" strokeDasharray="3 2" />
              <text x="497" y="325" fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                72V 40Ah CORE
              </text>
              <text x="497" y="338" fill="#94a3b8" fontSize="8" fontFamily="monospace" textAnchor="middle">
                [2.88 kWh LI-ION]
              </text>

              {/* 5.0 kW Mid-Drive BLDC Motor */}
              <circle cx="490" cy="400" r="38" fill="#0f172a" stroke="#ffb347" strokeWidth="3" />
              <circle cx="490" cy="400" r="22" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
              <circle cx="490" cy="400" r="8" fill="#ffb347" />
              <text x="490" y="404" fill="#ffffff" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                5 kW
              </text>

              {/* 428-Pitch Drive Chain */}
              <line x1="240" y1="400" x2="490" y2="400" stroke="#ffb347" strokeWidth="2" strokeDasharray="4 3" />
              <line x1="240" y1="405" x2="490" y2="405" stroke="#64748b" strokeWidth="1" />

              {/* Scrambler Seat & Fuel Tank Shroud Silhouette */}
              <path
                d="M420 230 C460 228 500 220 540 190 C580 160 620 165 660 170 L650 210 L520 235 L420 235 Z"
                stroke="#64748b"
                strokeWidth="2"
                fill="#1e293b"
                fillOpacity="0.8"
              />
              {/* Scrambler Ribbed Saddle */}
              <path d="M370 235 C400 230 430 230 470 230" stroke="#ffb347" strokeWidth="6" strokeLinecap="round" />

              {/* Front Headlight (Round Scrambler Lens) */}
              <circle cx="705" cy="180" r="16" fill="#38bdf8" fillOpacity="0.2" stroke="#38bdf8" strokeWidth="2" />
              <path d="M720 170 L760 150 M720 180 L770 180 M720 190 L760 210" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" />
            </svg>

            {/* Clickable Hotspot Callout Markers (01-06) */}
            {SCHEMATIC_HOTSPOTS.map((h) => {
              const isActive = activeHotspot.id === h.id;
              return (
                <div
                  key={h.id}
                  style={{ top: `${h.y}%`, left: `${h.x}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                >
                  <button
                    type="button"
                    onClick={() => setActiveHotspot(h)}
                    className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono font-bold text-xs transition-all cursor-pointer ${
                      isActive
                        ? 'border-orange bg-orange text-jet-black scale-125 shadow-[0_0_20px_rgba(255,179,71,0.8)] ring-4 ring-orange/30'
                        : 'border-white/80 bg-jet-black/90 text-white hover:border-orange hover:text-orange hover:scale-110'
                    }`}
                  >
                    <span>{h.number}</span>
                    {isActive && (
                      <span className="absolute inset-0 rounded-full bg-orange animate-ping opacity-40"></span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Component Inspection Drawer (Bottom of Blueprint) */}
        <div className="relative z-10 p-5 sm:p-7 border-t border-white/10 bg-white/5 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange text-jet-black font-mono font-black text-lg flex items-center justify-center shrink-0 shadow-md shadow-orange/30">
                {activeHotspot.number}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-orange uppercase tracking-wider">
                    {activeHotspot.subsystem}
                  </span>
                  <span className="text-[11px] font-mono text-slate-300">
                    {activeHotspot.specs}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {activeHotspot.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-light mt-1 max-w-3xl leading-relaxed">
                  {activeHotspot.description}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 self-start md:self-center">
              <span className="text-[10px] font-mono text-slate-400">
                Click any numbered node [01-06] on blueprint
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
