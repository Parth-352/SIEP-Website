"use client";

import React, { useRef, useEffect, useState } from 'react';

export default function ScrollVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasVideo, setHasVideo] = useState(true); // Assuming video exists initially, fallback to false if error

  useEffect(() => {
    let animationFrameId: number;
    const video = videoRef.current;
    const container = containerRef.current;

    const updateVideoProgress = () => {
      if (!video || !container) return;

      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate scroll progress relative to the container
      let progress = -rect.top / (rect.height - viewportHeight);
      progress = Math.max(0, Math.min(1, progress)); // Clamp between 0 and 1

      if (video.duration && !isNaN(video.duration)) {
        video.currentTime = progress * video.duration;
      }

      animationFrameId = requestAnimationFrame(updateVideoProgress);
    };

    animationFrameId = requestAnimationFrame(updateVideoProgress);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleError = () => {
    setHasVideo(false);
  };

  return (
    <div ref={containerRef} className="w-full h-[800vh] relative">
      <div className="sticky top-0 left-0 w-full h-screen bg-alice-blue flex justify-center items-center overflow-hidden z-0">
        {hasVideo ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            preload="auto"
            poster="/images/ebike-poster.webp"
            onError={handleError}
          >
            <source src="/video/ebike-story.webm" type="video/webm" />
            <source src="/video/ebike-story.mp4" type="video/mp4" />
          </video>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-jet-black text-alice-blue">
            <h2 className="text-2xl font-bold font-mono tracking-widest text-grey">VIDEO ASSET PENDING</h2>
            <p className="text-sm text-grey mt-2">Cinematic render will be placed here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
