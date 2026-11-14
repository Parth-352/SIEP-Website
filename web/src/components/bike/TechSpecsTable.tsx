'use client';

import React, { useState, useMemo } from 'react';
import { SPECIFICATION_CATEGORIES, FULL_SPECIFICATIONS_TABLE, TechSpecRow } from './bikeSpecsData';

export default function TechSpecsTable() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredSpecs: TechSpecRow[] = useMemo(() => {
    return FULL_SPECIFICATIONS_TABLE.filter((row) => {
      const matchesCategory =
        selectedCategory === 'All' || row.category === selectedCategory;
      const matchesQuery =
        !searchQuery.trim() ||
        row.parameter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.targetSpec.toLowerCase().includes(searchQuery.toLowerCase()) ||
        row.rulebookRef.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <section className="mb-16 md:mb-24">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-jet-black/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse"></span>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-grey font-bold">
              Full Technical Inventory
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-jet-black tracking-tight uppercase">
            Specifications Matrix<span className="text-orange">.</span>
          </h2>
          <p className="text-sm sm:text-base text-grey font-light mt-1 max-w-xl">
            Detailed engineering benchmarks and rulebook parameters across all competition scrutiny disciplines.
          </p>
        </div>

        <div className="font-mono text-xs text-grey bg-white px-3.5 py-2 rounded-xl border border-jet-black/10 shrink-0 self-start md:self-auto">
          <span className="text-orange font-bold">{filteredSpecs.length}</span> Parameters Shown
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {SPECIFICATION_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-jet-black text-alice-blue shadow-xs'
                    : 'bg-white border border-jet-black/10 text-grey hover:border-orange hover:text-jet-black'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter specs..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-jet-black/15 rounded-xl text-xs font-mono text-jet-black focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange/30 shadow-2xs"
          />
          <svg
            className="w-4 h-4 text-grey absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* High-Density Specification Table */}
      <div className="bg-white border border-jet-black/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-alice-blue/80 border-b border-jet-black/10 text-[10px] font-mono uppercase tracking-widest text-grey font-bold">
                <th className="py-3 px-4 sm:px-6">Engineering Parameter</th>
                <th className="py-3 px-4 hidden md:table-cell">Subsystem Discipline</th>
                <th className="py-3 px-4 sm:px-6">Target Specification</th>
                <th className="py-3 px-4 text-center">Unit / Type</th>
                <th className="py-3 px-4 sm:px-6 text-right">Rulebook Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jet-black/5 text-xs font-mono">
              {filteredSpecs.length > 0 ? (
                filteredSpecs.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-alice-blue/40 transition-colors"
                  >
                    <td className="py-3 px-4 sm:px-6 font-bold text-jet-black">
                      {row.parameter}
                    </td>
                    <td className="py-3 px-4 text-grey hidden md:table-cell">
                      {row.category}
                    </td>
                    <td className="py-3 px-4 sm:px-6 font-bold text-jet-black">
                      <span className="px-2 py-0.5 rounded bg-jet-black/5">
                        {row.targetSpec}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-grey">
                      {row.unit}
                    </td>
                    <td className="py-3 px-4 sm:px-6 text-right text-orange font-bold">
                      {row.rulebookRef}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-grey font-mono italic">
                    No matching parameters found for &quot;{searchQuery}&quot;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
