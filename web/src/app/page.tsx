"use client";

import ScrollOverlay from '@/components/ScrollOverlay';
import TimelineIndicator from '@/components/TimelineIndicator';

export default function Home() {
  return (
    <main className="relative w-full overflow-x-hidden bg-alice-blue min-h-screen">
      {/* Persistent Timeline */}
      <TimelineIndicator />

      {/* The overlay is relative and dictates the total scroll height of the page */}
      <div className="relative z-10 w-full h-full">
        <ScrollOverlay />
      </div>
    </main>
  );
}
