import React from 'react';
import { TeamMemberEntry, getMemberDomains } from '@/lib/members';
import { TEAMS } from '@/lib/teams';

interface ExecutiveCommandSidebarProps {
  currentCaptain: TeamMemberEntry | undefined;
  currentViceCaptain: TeamMemberEntry | undefined;
}

export default function ExecutiveCommandSidebar({
  currentCaptain,
  currentViceCaptain,
}: ExecutiveCommandSidebarProps) {
  return (
    <div className="lg:col-span-4 space-y-4">
      {/* Card 1: Executive Command Roster */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Executive Command
            </h3>
            <p className="text-[11px] text-slate-500">Official leadership appointments</p>
          </div>
        </div>

        {/* Captain Tile */}
        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
              Team Captain
            </span>
            {currentCaptain && (
              <div className="flex gap-1">
                {getMemberDomains(currentCaptain).map((d) => (
                  <span key={d} className="text-[9px] font-mono text-amber-800 bg-amber-200/50 px-1 py-0.2 rounded">
                    {TEAMS[d]?.code || d.toUpperCase().slice(0, 4)}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm font-bold text-slate-900">
            {currentCaptain ? currentCaptain.name : 'Unassigned'}
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            {currentCaptain ? currentCaptain.email : 'Click promote to assign Captain'}
          </p>
        </div>

        {/* Vice Captain Tile */}
        <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/70 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 bg-indigo-200/60 px-2 py-0.5 rounded-full">
              Vice Captain
            </span>
            {currentViceCaptain && (
              <div className="flex gap-1">
                {getMemberDomains(currentViceCaptain).map((d) => (
                  <span key={d} className="text-[9px] font-mono text-indigo-800 bg-indigo-200/50 px-1 py-0.2 rounded">
                    {TEAMS[d]?.code || d.toUpperCase().slice(0, 4)}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="text-sm font-bold text-slate-900">
            {currentViceCaptain ? currentViceCaptain.name : 'Unassigned'}
          </p>
          <p className="text-[11px] text-slate-500 font-mono">
            {currentViceCaptain ? currentViceCaptain.email : 'Click promote to assign Vice Captain'}
          </p>
        </div>
      </div>
    </div>
  );
}
