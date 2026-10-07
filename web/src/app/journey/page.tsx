"use client";

import React from 'react';

const JOURNEY_STAGES = [
  { num: '01', title: 'RESEARCH', desc: 'Market analysis and baseline metrics definition.' },
  { num: '02', title: 'CONCEPT', desc: 'Initial sketches, packaging studies, and ergonomics.' },
  { num: '03', title: 'CAD', desc: 'Detailed 3D modeling and structural assembly.' },
  { num: '04', title: 'ENGINEERING', desc: 'FEA, CFD, and subsystem simulation.' },
  { num: '05', title: 'FABRICATION', desc: 'Machining, welding, and component manufacturing.' },
  { num: '06', title: 'INTEGRATION', desc: 'Assembling mechanical and electrical systems.' },
  { num: '07', title: 'TESTING', desc: 'Real-world validation, dyno runs, and safety checks.' },
  { num: '08', title: 'COMPETITION', desc: 'SIEP E-Bike Challenge 2026-27.' }
];

export default function JourneyPage() {
  return (
    <main className="min-h-screen pt-24 px-6 md:px-24 max-w-7xl mx-auto pb-24">
      <div className="mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-jet-black uppercase tracking-tight mb-4">Project Journey</h1>
        <p className="text-lg text-grey font-light max-w-2xl">
          The roadmap from an empty slate to a competition-ready machine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        {JOURNEY_STAGES.map((stage, i) => (
          <div key={stage.num} className="relative border-l-2 border-jet-black/10 pl-6 group hover:border-orange transition-colors">
            <div className="absolute w-3 h-3 bg-alice-blue border-2 border-jet-black group-hover:border-orange rounded-full -left-[7px] top-1 transition-colors"></div>
            <span className="text-xs font-mono tracking-widest text-orange block mb-2">{stage.num}</span>
            <h2 className="text-2xl font-bold uppercase text-jet-black mb-2">{stage.title}</h2>
            <p className="text-grey font-light text-sm md:text-base">
              {stage.desc}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
