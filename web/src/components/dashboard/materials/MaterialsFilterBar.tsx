"use client";

import React from 'react';
import { TEAMS_LIST } from '@/lib/teams';
import { MaterialCategory, ResearchMaterial } from '@/lib/types';

interface MaterialsFilterBarProps {
  materials: ResearchMaterial[];
  categoryFilter: 'all' | MaterialCategory;
  setCategoryFilter: (cat: 'all' | MaterialCategory) => void;
  setCurrentPage: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  squadFilter: string;
  setSquadFilter: (squad: string) => void;
  popularTags: string[];
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
}

export default function MaterialsFilterBar({
  materials,
  categoryFilter,
  setCategoryFilter,
  setCurrentPage,
  searchQuery,
  setSearchQuery,
  squadFilter,
  setSquadFilter,
  popularTags,
  selectedTag,
  setSelectedTag,
}: MaterialsFilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Main Filter Bar Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Category Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
          {[
            { id: 'all', label: 'All Materials', count: materials.length },
            {
              id: 'research',
              label: 'Research',
              count: materials.filter((m) => m.category === 'research').length,
            },
            {
              id: 'specs',
              label: 'Specs',
              count: materials.filter((m) => m.category === 'specs').length,
            },
            {
              id: 'reports',
              label: 'Reports',
              count: materials.filter((m) => m.category === 'reports').length,
            },
            {
              id: 'datasheets',
              label: 'Datasheets',
              count: materials.filter((m) => m.category === 'datasheets').length,
            },
            {
              id: 'cad',
              label: 'CAD & 3D',
              count: materials.filter((m) => m.category === 'cad').length,
            },
          ].map((tab) => {
            const isActive = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setCategoryFilter(tab.id as any);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                  isActive
                    ? 'bg-[#0e131f] text-white shadow-sm'
                    : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Squad Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Search Input matching other tabs */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search materials, PDFs, tags, BMS, FEA..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-56 lg:w-72 pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs font-sans text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                aria-label="Clear search"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Squad Dropdown Filter */}
          <select
            value={squadFilter}
            onChange={(e) => {
              setSquadFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-sans text-slate-700 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs cursor-pointer"
          >
            <option value="all">All Squads ({TEAMS_LIST.filter((t) => t.id !== 'core').length})</option>
            {TEAMS_LIST.filter((t) => t.id !== 'core').map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* AI-Indexed Tags Filter Bar (Instant Search Acceleration) */}
      {popularTags.length > 0 && (
        <div className="bg-white/80 rounded-2xl border border-slate-200/60 p-3 shadow-2xs flex items-center gap-2 overflow-x-auto hide-scrollbar text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 pl-1">
            <svg className="w-3.5 h-3.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>AI Index:</span>
          </span>

          <button
            type="button"
            onClick={() => {
              setSelectedTag('all');
              setCurrentPage(1);
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedTag === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Tags
          </button>

          {popularTags.map((tag) => {
            const isActive = selectedTag.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSelectedTag(isActive ? 'all' : tag);
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? 'bg-orange-500 text-white border-orange-600 shadow-2xs'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                #{tag}
              </button>
            );
          })}

          <div className="ml-auto pl-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('siep_open_copilot'));
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs"
            >
              <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>Verify with Rulebook AI</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
