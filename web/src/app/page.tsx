"use client";

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Experience from '@/components/Experience';
import ScrollOverlay from '@/components/ScrollOverlay';
import TimelineIndicator from '@/components/TimelineIndicator';

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-alice-blue">


      {/* Persistent Timeline */}
      <TimelineIndicator />

      {/* 3D Canvas (Fixed in background) */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <Suspense fallback={null}>
            <Experience />
          </Suspense>
        </Canvas>
      </div>

      {/* Scrollable Timeline Overlay */}
      <div className="absolute top-0 left-0 w-full h-full overflow-y-auto overflow-x-hidden z-10" style={{ perspective: '1px' }}>
        <ScrollOverlay />
      </div>

      {/* Loading Screen (Simple fallback if 3D takes a moment) */}
      <div id="loader" className="fixed top-0 left-0 w-full h-full bg-alice-blue z-40 flex justify-center items-center pointer-events-none transition-opacity duration-1000 opacity-0">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange"></div>
      </div>
    </main>
  );
}
