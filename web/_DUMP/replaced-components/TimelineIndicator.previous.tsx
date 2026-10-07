"use client";

import { useEffect, useState } from 'react';

const steps = [
  { id: 1, name: 'HERO' },
  { id: 2, name: 'CHASSIS' },
  { id: 3, name: 'POWERTRAIN' },
  { id: 4, name: 'SYSTEMS' },
  { id: 5, name: 'FINAL' },
];

export default function TimelineIndicator() {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      // The actual scroll container is .overflow-y-auto
      const container = document.querySelector('.overflow-y-auto');
      if (!container) return;

      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight - container.clientHeight;
      const scrollPercentage = scrollTop / scrollHeight;

      // 5 steps, meaning 5 segments.
      const stepIndex = Math.min(
        Math.floor(scrollPercentage * steps.length),
        steps.length - 1
      );
      
      setActiveStep(stepIndex + 1);
    };

    const container = document.querySelector('.overflow-y-auto');
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <div className="fixed right-6 md:right-12 top-1/2 -translate-y-1/2 flex flex-col items-end space-y-6 z-50 mix-blend-difference pointer-events-auto hidden md:flex">
      {steps.map((step) => {
        const isActive = activeStep >= step.id;
        const isCurrent = activeStep === step.id;

        return (
          <div key={step.id} className="flex items-center space-x-4 group cursor-pointer">
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
  );
}
