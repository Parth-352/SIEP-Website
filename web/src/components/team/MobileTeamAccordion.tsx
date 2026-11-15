"use client";

import React from 'react';
import { MobileTeamGroup, TeamMember, DomainId } from './teamTypes';
import MobilePlayerCard from './MobilePlayerCard';

interface MobileTeamAccordionProps {
  team: MobileTeamGroup;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  memberLookup: Map<string, TeamMember>;
  getProfileForMember: (m: TeamMember) => { displayName?: string; photoUrl?: string } | undefined;
}

export default function MobileTeamAccordion({
  team,
  index,
  isOpen,
  onToggle,
  memberLookup,
  getProfileForMember,
}: MobileTeamAccordionProps) {
  return (
    <div
      id={`team-accordion-${team.id}`}
      className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
        isOpen
          ? 'border-orange shadow-md ring-1 ring-orange/30'
          : 'border-jet-black/10 hover:border-jet-black/25'
      }`}
    >
      {/* Accordion Toggle Header */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full px-5 py-4 flex items-center justify-between text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange select-none"
      >
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
              isOpen
                ? 'bg-orange text-jet-black shadow-sm'
                : 'bg-jet-black/5 text-jet-black'
            }`}
          >
            {String(index + 1).padStart(2, '0')}
          </div>
          <div className="min-w-0 flex-1 pr-2">
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-jet-black tracking-tight truncate">
                {team.name}
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-jet-black/5 text-grey font-semibold shrink-0">
                {team.memberIds.length}
              </span>
            </div>
            <p className="text-[11px] text-grey font-light truncate mt-0.5">
              {team.subtitle}
            </p>
          </div>
        </div>

        <svg
          className={`w-5 h-5 text-grey transition-transform duration-300 shrink-0 ${
            isOpen ? 'rotate-180 text-orange' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Player List */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div className="px-4 pb-4 pt-2 border-t border-jet-black/5 bg-[#fafbfc] space-y-2.5">
            {team.memberIds.map((item) => {
              const member = memberLookup.get(item.id);
              if (!member) return null;

              const isSpecificLead = team.id === 'core'
                ? Boolean(item.isLead)
                : Boolean(member.leadDomains && member.leadDomains.includes(team.id as DomainId));

              let mobileRole = 'Team Member';
              if (member.isMentor) {
                mobileRole = 'Faculty Mentor & Advisor';
              } else if (team.id === 'core') {
                mobileRole = member.role || item.role;
              } else if (isSpecificLead) {
                mobileRole = 'Domain Lead';
              } else {
                mobileRole = 'Team Member';
              }

              return (
                <MobilePlayerCard
                  key={`${team.id}-${item.id}`}
                  member={member}
                  role={mobileRole}
                  isLead={isSpecificLead}
                  isMentor={member.isMentor}
                  customProfile={getProfileForMember(member)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
