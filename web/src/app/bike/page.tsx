'use client';

import React from 'react';
import Link from 'next/link';
import BikeHeroSection from '@/components/bike/BikeHeroSection';
import BikeSchematicViewer from '@/components/bike/BikeSchematicViewer';
import SubsystemsExplorer from '@/components/bike/SubsystemsExplorer';
import TechSpecsTable from '@/components/bike/TechSpecsTable';
import CaeValidationSection from '@/components/bike/CaeValidationSection';
import ProvingGroundSection from '@/components/bike/ProvingGroundSection';
import BikeCtaHub from '@/components/bike/BikeCtaHub';

export default function BikePage() {
  return (
    <main className="min-h-screen bg-alice-blue pt-32 pb-24 font-sans text-jet-black">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        
        {/* Pre-Release Testing Phase Banner */}
        <div className="mb-12 rounded-2xl border-2 border-amber-400/80 bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 sm:p-6 shadow-sm backdrop-blur-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-900 border border-amber-500/30 font-mono text-[11px] font-bold uppercase tracking-wider">
                    Engineering Prototype // Testing Phase
                  </span>
                  <span className="text-[11px] font-mono text-amber-800/80">
                    Pre-Release Staging
                  </span>
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed max-w-3xl">
                  This scrambler vehicle architecture and technical dossier are currently in physical fabrication &amp; dynamic track testing for <strong className="text-zinc-900 font-semibold">SIEP Season 7.0</strong>. This page is detached from the public navigation until physical vehicle scrutiny and official track unveiling.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 pl-13 md:pl-0">
              <Link
                href="/"
                className="px-4 py-2 rounded-xl border border-zinc-300 bg-white hover:bg-zinc-50 text-xs font-mono font-bold uppercase tracking-wider text-zinc-700 transition-colors shadow-2xs"
              >
                &larr; Public Home
              </Link>
              <Link
                href="/competition"
                className="px-4 py-2 rounded-xl bg-jet-black hover:bg-orange text-white text-xs font-mono font-bold uppercase tracking-wider transition-colors shadow-2xs"
              >
                Track Status &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* 1. Hero Section & Live Telemetry Stat Ribbon */}
        <BikeHeroSection />

        {/* 2. Interactive CAD Technical Blueprint & Dimension Schematic */}
        <BikeSchematicViewer />

        {/* 3. 8-Subsystem Architecture Deep-Dive */}
        <SubsystemsExplorer />

        {/* 4. Filterable & Searchable Technical Specifications Table */}
        <TechSpecsTable />

        {/* 5. CAE & Finite Element Analysis Structural/Thermal Validation */}
        <CaeValidationSection />

        {/* 6. SIEP Season 7.0 Proving Ground Trials Compliance */}
        <ProvingGroundSection />

        {/* 7. Technical Cross-Linking CTA Hub */}
        <BikeCtaHub />

      </div>
    </main>
  );
}
