"use client";

import dynamic from 'next/dynamic';
import React from 'react';

// Lazy load the 3D explorer
const BikeExplorer = dynamic(() => import('@/components/BikeExplorer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[60vh] bg-alice-blue flex items-center justify-center border border-jet-black/10 rounded-xl">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-8 h-8 border-2 border-orange border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs uppercase font-mono tracking-widest text-grey mt-4">Initializing WebGL</span>
      </div>
    </div>
  )
});

export default function BikePage() {
  return (
    <main className="min-h-screen pt-24 px-6 md:px-24 max-w-7xl mx-auto">
      <div className="mb-12">
        <h1 className="text-4xl md:text-6xl font-black text-jet-black uppercase tracking-tight mb-4">The Machine</h1>
        <p className="text-lg text-grey font-light max-w-2xl">
          An interactive deep-dive into the SIEP Smart Scrambler E-Bike systems and architecture.
        </p>
      </div>

      <BikeExplorer />

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 text-jet-black">Systems Architecture</h2>
          <ul className="space-y-4 font-light text-grey text-sm md:text-base">
            <li className="flex justify-between border-b border-jet-black/10 pb-2">
              <span className="font-medium text-jet-black uppercase">Chassis</span>
              <span>Lightweight Tubular Steel</span>
            </li>
            <li className="flex justify-between border-b border-jet-black/10 pb-2">
              <span className="font-medium text-jet-black uppercase">Powertrain</span>
              <span>Mid-drive BLDC 5kW Peak</span>
            </li>
            <li className="flex justify-between border-b border-jet-black/10 pb-2">
              <span className="font-medium text-jet-black uppercase">Battery</span>
              <span>72V 40Ah Li-Ion Pack</span>
            </li>
            <li className="flex justify-between border-b border-jet-black/10 pb-2">
              <span className="font-medium text-jet-black uppercase">Smart System</span>
              <span>Custom Telemetry & VCU</span>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight mb-4 text-jet-black">Development Status</h2>
          <div className="space-y-4">
             <div className="bg-jet-black p-4 rounded text-alice-blue">
                <h3 className="text-xs font-mono uppercase tracking-widest text-orange mb-1">Current Phase</h3>
                <p className="font-bold">SYSTEMS INTEGRATION</p>
             </div>
             <p className="text-sm font-light text-grey">
               The digital twin is currently undergoing thermal and structural analysis validation. Physical fabrication of the chassis is complete.
             </p>
          </div>
        </div>
      </div>
    </main>
  );
}
