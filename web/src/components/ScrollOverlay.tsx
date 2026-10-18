"use client";

import React, { useState, useEffect } from 'react';
import EngineeringStage from './EngineeringStage';

const STAGES = [
  {
    id: 'chassis',
    number: '01',
    category: 'STRUCTURE',
    title: 'CHASSIS',
    metadata: 'The Foundation',
    description: 'Designed for optimal weight distribution, supporting the core load while maintaining agility and rigidity.',
    align: 'left' as const,
  },
  {
    id: 'powertrain',
    number: '02',
    category: 'ENERGY',
    title: 'POWERTRAIN',
    metadata: 'Motor & Drivetrain',
    description: 'Mounting the heart of the machine. The integration requires precise alignment with custom-fabricated mounts, ensuring immediate torque delivery to the rear wheel.',
    align: 'right' as const,
  },
  {
    id: 'battery',
    number: '03',
    category: 'POWER',
    title: 'BATTERY',
    metadata: 'Energy Storage',
    description: 'High-density cell configuration securely positioned within the frame for lower center of gravity and optimized thermal management.',
    align: 'left' as const,
  },
  {
    id: 'motion',
    number: '04',
    category: 'DYNAMICS',
    title: 'MOTION',
    metadata: 'Suspension & Wheels',
    description: 'Responsive suspension and advanced braking systems provide stability and control in varied terrain conditions.',
    align: 'right' as const,
  },
  {
    id: 'body',
    number: '05',
    category: 'AESTHETICS',
    title: 'BODY',
    metadata: 'Aerodynamics & Fairings',
    description: 'Sculpted lightweight panels optimize airflow while defining the unmistakable Scrambler silhouette.',
    align: 'left' as const,
  },
  {
    id: 'smart',
    number: '06',
    category: 'INTELLIGENCE',
    title: 'SMART SYSTEM',
    metadata: 'Electronics & Sensors',
    description: 'The neural network of the e-bike. Integrating telemetry, battery management, and adaptive performance profiles.',
    align: 'right' as const,
  },
  {
    id: 'ready',
    number: '07',
    category: 'COMPLETION',
    title: 'READY TO RIDE',
    metadata: '',
    description: 'From concept to engineered reality.',
    align: 'center' as const,
  },
];

export default function ScrollOverlay() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    // Check initial scroll position
    handleScroll();
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div id="timeline-container" className="relative z-10 w-full font-sans pointer-events-none">
      
      {/* 1. Hero Section */}
      <section className="relative h-[100dvh] flex flex-col justify-center items-start pt-32 w-full max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 pointer-events-none">
        <div className="bg-alice-blue/85 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-6 md:p-0 rounded-xl border border-jet-black/5 md:border-none shadow-sm md:shadow-none pointer-events-auto w-full md:w-3/5 lg:w-1/2">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-orange font-bold mb-4 block">
            SNJB&apos;s KBJ College of Engineering
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-jet-black tracking-tighter leading-[0.9] mb-6 uppercase">
            Engineering<br />
            <span className="text-orange">The Next Ride.</span>
          </h1>
          <p className="text-lg md:text-xl text-grey font-light leading-relaxed max-w-xl">
            Smart Scrambler E-Bike by SNJB&apos;s KBJ College of Engineering.
          </p>
        </div>
      </section>

      {/* Scroll Indicator */}
      <div 
        id="scroll-indicator" 
        className={`absolute top-[85dvh] left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center z-30 pointer-events-none transition-opacity duration-700 ${isScrolled ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="bg-jet-black px-4 py-2 rounded-full shadow-lg">
          <span className="text-[10px] tracking-[0.2em] uppercase text-alice-blue font-bold font-mono whitespace-nowrap">Scroll to Explore</span>
        </div>
      </div>

      {STAGES.map((stage) => (
        <EngineeringStage key={stage.id} {...stage} />
      ))}
      
    </div>
  );
}
