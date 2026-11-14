import React from 'react';
import { TEAMS_LIST } from '@/lib/teams';

interface RolesFilterBarProps {
  filterTab: 'all' | 'captain' | 'leads' | 'members';
  setFilterTab: (tab: 'all' | 'captain' | 'leads' | 'members') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  squadFilter: string;
  setSquadFilter: (s: string) => void;
  totalMembers: number;
  captainAndCoreCount: number;
  domainLeadsCount: number;
  regularMembersCount: number;
  onPageReset: () => void;
}

export default function RolesFilterBar({
  filterTab,
  setFilterTab,
  searchQuery,
  setSearchQuery,
  squadFilter,
  setSquadFilter,
  totalMembers,
  captainAndCoreCount,
  domainLeadsCount,
  regularMembersCount,
  onPageReset,
}: RolesFilterBarProps) {
  return (
    <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-3">
      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
        {[
          { id: 'all', label: 'All Members', count: totalMembers },
          { id: 'captain', label: 'Leadership', count: captainAndCoreCount },
          { id: 'leads', label: 'Domain Leads', count: domainLeadsCount },
          { id: 'members', label: 'Team Members', count: regularMembersCount },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setFilterTab(tab.id as any);
              onPageReset();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === tab.id
                ? 'bg-[#0e131f] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search Input & Squad Selector */}
      <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-slate-100">
        <div className="relative flex-1 w-full">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, role, email, domain..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onPageReset();
            }}
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onPageReset();
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-0.5 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Squad Selector */}
        <div className="w-full sm:w-auto shrink-0">
          <select
            value={squadFilter}
            onChange={(e) => {
              setSquadFilter(e.target.value);
              onPageReset();
            }}
            className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange cursor-pointer"
          >
            <option value="all">All Domains ({TEAMS_LIST.length})</option>
            {TEAMS_LIST.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
