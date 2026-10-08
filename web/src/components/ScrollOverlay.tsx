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
      <section className="relative h-[100dvh] flex flex-col justify-center items-start p-6 pt-32 md:p-24 w-full md:w-1/2">
        <div className="bg-alice-blue/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-6 md:p-0 rounded-xl pointer-events-auto w-full">
          <h1 className="text-5xl md:text-8xl font-black text-jet-black tracking-tighter leading-none mb-4 md:mb-6">
            ENGINEERING THE <br/> <span className="text-orange">NEXT RIDE.</span>
          </h1>
          <p className="text-lg md:text-2xl text-grey font-light">
            Smart Scrambler E-Bike by SNJB&apos;s KBJ College of Engineering.
          </p>
        </div>
      </section>

      {/* Scroll Indicator */}
      <div 
        id="scroll-indicator" 
        className={`absolute top-[85vh] left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center z-50 pointer-events-none transition-opacity duration-700 ${isScrolled ? 'opacity-0' : 'opacity-100'}`}
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
