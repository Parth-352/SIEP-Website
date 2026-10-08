"use client";

import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import Experience from '@/components/Experience';
import ScrollOverlay from '@/components/ScrollOverlay';
import TimelineIndicator from '@/components/TimelineIndicator';

export default function Home() {
  return (
    <main className="relative w-full overflow-x-hidden bg-alice-blue min-h-screen">
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

      {/* The overlay is relative and dictates the total scroll height of the page */}
      <div className="relative z-10 w-full h-full">
        <ScrollOverlay />
      </div>
    </main>
  );
}
