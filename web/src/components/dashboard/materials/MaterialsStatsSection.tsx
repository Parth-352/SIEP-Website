"use client";

import React from 'react';
import { ResearchMaterial } from '@/lib/types';
import StatCard from '../StatCard';

interface MaterialsStatsSectionProps {
  materials: ResearchMaterial[];
}

export default function MaterialsStatsSection({ materials }: MaterialsStatsSectionProps) {
  const totalCount = materials.length;
  const researchCount = materials.filter((m) => m.category === 'research').length;
  const specsCount = materials.filter((m) => m.category === 'specs' || m.category === 'cad').length;
  const reportsCount = materials.filter((m) => m.category === 'reports').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Total Documents"
        value={totalCount}
        iconBg="bg-blue-50 text-blue-600 border-blue-100"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        }
      />

      <StatCard
        label="Research Papers"
        value={researchCount}
        iconBg="bg-purple-50 text-purple-600 border-purple-100"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        }
      />

      <StatCard
        label="Technical Specs & CAD"
        value={specsCount}
        iconBg="bg-amber-50 text-amber-600 border-amber-100"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
      />

      <StatCard
        label="Reports & Briefs"
        value={reportsCount}
        iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
    </div>
  );
}
