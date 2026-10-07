"use client";

import ScrollVideo from '@/components/ScrollVideo';
import ScrollOverlay from '@/components/ScrollOverlay';
import TimelineIndicator from '@/components/TimelineIndicator';

export default function Home() {
  return (
    <main className="relative w-full overflow-x-hidden bg-alice-blue min-h-screen">
      {/* Persistent Timeline */}
      <TimelineIndicator />

      {/* The ScrollVideo is fixed to the background and handles scroll sync */}
      <ScrollVideo />

      {/* The overlay is relative and dictates the total scroll height of the page */}
      <ScrollOverlay />
    </main>
  );
}
