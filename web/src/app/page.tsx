"use client";

import ScrollVideo from '@/components/ScrollVideo';
import ScrollOverlay from '@/components/ScrollOverlay';
import TimelineIndicator from '@/components/TimelineIndicator';

export default function Home() {
  return (
    <main className="relative w-full overflow-x-hidden bg-alice-blue min-h-screen">
      {/* Persistent Timeline */}
      <TimelineIndicator />

      {/* The ScrollVideo sets the overall height (e.g. 800vh) and handles scroll sync */}
      <ScrollVideo />

      {/* The overlay is absolute but takes its positioning within the flow relative to the top */}
      <ScrollOverlay />
    </main>
  );
}
