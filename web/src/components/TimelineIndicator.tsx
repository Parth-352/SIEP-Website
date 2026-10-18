"use client";

import { useEffect, useState } from 'react';

const steps = [
  { id: 1, name: 'HERO' },
  { id: 2, name: 'CHASSIS' },
  { id: 3, name: 'POWERTRAIN' },
  { id: 4, name: 'BATTERY' },
  { id: 5, name: 'MOTION' },
  { id: 6, name: 'BODY' },
  { id: 7, name: 'SMART' },
  { id: 8, name: 'READY' },
];

export default function TimelineIndicator() {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      if (scrollHeight <= 0) return;
      const scrollPercentage = scrollTop / scrollHeight;

      const stepIndex = Math.min(
        Math.floor(scrollPercentage * steps.length),
        steps.length - 1
      );
      
      setActiveStep(stepIndex + 1);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Mobile Horizontal Timeline Indicator */}
      <div className="fixed bottom-0 left-0 w-full z-40 bg-white/90 backdrop-blur-xl border-t border-jet-black/10 safe-area-pad-bottom flex flex-col items-center justify-center pt-2 pb-2.5 md:hidden pointer-events-auto shadow-md">
        {/* Active Stage Label */}
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span className="text-[9px] font-mono tracking-widest uppercase text-grey font-semibold">
            {steps[activeStep - 1]?.id.toString().padStart(2, '0')} /
          </span>
          <span className="text-[10px] font-mono tracking-widest uppercase text-orange font-bold">
            {steps[activeStep - 1]?.name}
          </span>
        </div>

        {/* Horizontal Dots */}
        <div className="flex items-center justify-between w-full max-w-[280px] px-2">
          {steps.map((step) => {
            const isActive = activeStep >= step.id;
            const isCurrent = activeStep === step.id;

            return (
              <button
                key={step.id}
                onClick={() =>
                  window.scrollTo({
                    top: (step.id - 1) * (document.documentElement.scrollHeight / steps.length),
                    behavior: 'smooth',
                  })
                }
                className="flex-1 max-w-[34px] h-8 min-h-[32px] flex items-center justify-center group cursor-pointer focus:outline-none"
                aria-label={`Go to stage ${step.name}`}
              >
                <div
                  className={`rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-orange shadow-[0_0_8px_rgba(255,179,71,0.6)]'
                      : 'bg-grey/30 border border-grey/50'
                  } ${isCurrent ? 'w-2.5 h-2.5 scale-125' : 'w-1.5 h-1.5 scale-100'}`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop Vertical Timeline Indicator */}
      <div className="fixed right-6 md:right-12 top-1/2 -translate-y-1/2 flex flex-col items-end space-y-6 z-50 mix-blend-difference pointer-events-auto hidden md:flex">
        {steps.map((step) => {
          const isActive = activeStep >= step.id;
          const isCurrent = activeStep === step.id;

          return (
            <div key={step.id} className="flex items-center space-x-4 group cursor-pointer" onClick={() => window.scrollTo({ top: (step.id - 1) * (document.documentElement.scrollHeight / steps.length), behavior: 'smooth' })}>
              <span 
                className={`text-[10px] font-mono tracking-widest uppercase transition-colors duration-300 ${
                  isCurrent ? 'text-orange' : 'text-grey opacity-0 group-hover:opacity-100'
                }`}
              >
                {step.name}
              </span>
              <div 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-orange shadow-[0_0_8px_rgba(255,179,71,0.6)]' 
                    : 'bg-grey/30 border border-grey/50'
                } ${isCurrent ? 'scale-150' : 'scale-100'}`}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}
