"use client";

import React, { useState, useEffect, useCallback } from 'react';

export interface GallerySlide {
  id: string;
  image: string;
}

export const GALLERY_SLIDES: GallerySlide[] = [
  { id: 'slide-1', image: '/team/team_workshop_1.jpg' },
  { id: 'slide-2', image: '/team/team_workshop_2.jpg' },
  { id: 'slide-3', image: '/team/team_workshop_3.jpg' },
  { id: 'slide-4', image: '/team/team_collective.jpg' },
];

export default function TeamGallerySlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % GALLERY_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + GALLERY_SLIDES.length) % GALLERY_SLIDES.length);
  }, []);

  // Normal smooth auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="mb-16 relative rounded-2xl overflow-hidden border border-jet-black/10 bg-jet-black shadow-sm group select-none">
      
      {/* Slider Window */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] w-full overflow-hidden">
        {GALLERY_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          const hasError = imageErrors[slide.id];

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Clean Minimal Placeholder is always rendered underneath */}
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-[#18202d] via-jet-black to-[#0f141c]">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 shadow-inner">
                  <span className="font-mono text-2xl font-black text-orange">
                    RB
                  </span>
                </div>
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-white/40">
                  Riders Bay Workshop Slide {idx + 1}
                </span>
              </div>

              {!hasError && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.image}
                  alt={`Team photo ${idx + 1}`}
                  onLoad={(e) => {
                    (e.currentTarget as HTMLElement).classList.remove('opacity-0');
                  }}
                  onError={() => handleImageError(slide.id)}
                  className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-500"
                />
              )}
            </div>
          );
        })}

        {/* Navigation Arrow Left */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-orange hover:text-jet-black text-white border border-white/20 transition-all flex items-center justify-center cursor-pointer backdrop-blur-md shadow-md sm:opacity-0 group-hover:opacity-100 duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Navigation Arrow Right */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-orange hover:text-jet-black text-white border border-white/20 transition-all flex items-center justify-center cursor-pointer backdrop-blur-md shadow-md sm:opacity-0 group-hover:opacity-100 duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Subtle Dots Pagination inside the bottom of the photo */}
        <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2 pointer-events-auto">
          {GALLERY_SLIDES.map((slide, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full cursor-pointer h-2 min-h-[8px] ${
                  isActive ? 'w-8 bg-orange shadow-md' : 'w-2 bg-white/40 hover:bg-white/80'
                }`}
              />
            );
          })}
        </div>

      </div>

    </div>
  );
}
