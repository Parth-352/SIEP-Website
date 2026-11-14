'use client';

import React from 'react';
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
