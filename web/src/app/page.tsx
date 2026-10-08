"use client";

import { Canvas } from '@react-three/fiber';
import { Suspense, useState } from 'react';
import Experience from '@/components/Experience';
import ScrollOverlay from '@/components/ScrollOverlay';
import TimelineIndicator from '@/components/TimelineIndicator';

export default function Home() {
  const [is3DEnabled, setIs3DEnabled] = useState(true);

  return (
    <main className="relative w-full overflow-x-hidden bg-alice-blue min-h-screen">
      {/* Persistent Timeline */}
      <TimelineIndicator />

      {/* 3D Canvas (Fixed in background) */}
      {is3DEnabled && (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
          <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
            <Suspense fallback={null}>
              <Experience />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* The overlay is relative and dictates the total scroll height of the page */}
      <div className="relative z-10 w-full h-full">
        <ScrollOverlay />
      </div>

      {/* 3D Engine Toggle for Resource Optimization */}
      <button 
        onClick={() => setIs3DEnabled(!is3DEnabled)}
        className="fixed bottom-6 right-6 z-50 bg-jet-black text-alice-blue text-[10px] uppercase font-mono tracking-widest px-4 py-3 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 border border-white/10"
      >
        <div className={`w-2 h-2 rounded-full ${is3DEnabled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]' : 'bg-red-500 opacity-50'}`}></div>
        {is3DEnabled ? '3D Render: ON' : '3D Render: OFF'}
      </button>
    </main>
  );
}
