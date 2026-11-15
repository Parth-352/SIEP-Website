"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import TeamGallerySlider from './TeamGallerySlider';
import { ROSTER_MEMBERS } from '@/lib/members';
import {
  DomainId,
  TeamMember,
  normalizeDomainId,
  DOMAIN_LABELS,
  DOMAIN_FILTER_TABS,
} from './team/teamTypes';
import { TEAM_MEMBERS_DATA, NINE_MOBILE_TEAMS } from './team/teamRosterData';
import MemberCard from './team/MemberCard';
import MobileTeamAccordion from './team/MobileTeamAccordion';

// Backwards-compatible named re-exports
export type { DomainId, TeamMember };
export { normalizeDomainId, DOMAIN_LABELS, DOMAIN_FILTER_TABS };

export default function TeamSection() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openTeamId, setOpenTeamId] = useState<string | null>(null);
  const [customProfiles, setCustomProfiles] = useState<Record<string, { displayName?: string; photoUrl?: string }>>({});
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(TEAM_MEMBERS_DATA);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch('/api/profile').then((res) => res.json()).catch(() => ({})),
      fetch('/api/members').then((res) => res.json()).catch(() => ({})),
    ]).then(([profileData, membersData]) => {
      if (!isMounted) return;
      if (profileData?.success && profileData.profiles) {
        setCustomProfiles(profileData.profiles);
      }
      if (membersData?.success && Array.isArray(membersData.members) && membersData.members.length > 0) {
        const mentor = TEAM_MEMBERS_DATA.find((m) => m.isMentor);
        const dynamicList: TeamMember[] = [];
        if (mentor) dynamicList.push(mentor);

        membersData.members.forEach((m: any) => {
          const baseline = TEAM_MEMBERS_DATA.find(
            (b) => b.id === m.id || b.name.toLowerCase() === m.name.toLowerCase()
          );

          const rawDomains: string[] = Array.isArray(m.domains) && m.domains.length > 0
            ? m.domains
            : baseline?.domains || ['software'];

          const validDomains: DomainId[] = [];
          rawDomains.forEach((d) => {
            const norm = normalizeDomainId(d);
            if (norm && !validDomains.includes(norm)) validDomains.push(norm);
          });
          if (validDomains.length === 0) validDomains.push('software');

          const rawLeadDomains: string[] = Array.isArray(m.leadDomains) && m.leadDomains.length > 0
            ? m.leadDomains
            : baseline?.leadDomains || [];
          const validLeadDomains: DomainId[] = [];
          rawLeadDomains.forEach((d) => {
            const norm = normalizeDomainId(d);
            if (norm && !validLeadDomains.includes(norm)) validLeadDomains.push(norm);
          });

          dynamicList.push({
            id: m.id,
            name: m.name,
            role: m.role || baseline?.role || (m.isLead ? 'Domain Lead' : 'Team Member'),
            isMentor: false,
            isCore: Boolean(m.isCore || baseline?.isCore),
            department: baseline?.department || 'Engineering Division',
            domains: validDomains,
            leadDomains: validLeadDomains,
            image: m.photoUrl || baseline?.image,
          });
        });

        setTeamMembers(dynamicList);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Quick lookup map for members
  const memberLookup = useMemo(() => {
    const map = new Map<string, TeamMember>();
    teamMembers.forEach((m) => map.set(m.id, m));
    return map;
  }, [teamMembers]);

  const getProfileForMember = (m: TeamMember) => {
    const cleanMemName = m.name.toLowerCase().trim();
    const roster = ROSTER_MEMBERS.find((r) => {
      const rName = r.name.toLowerCase().trim();
      return rName === cleanMemName || cleanMemName.includes(rName) || rName.includes(cleanMemName);
    });
    return roster ? customProfiles[roster.email.toLowerCase()] : undefined;
  };

  // Filter & sort members strictly based on requested hierarchy and domain context
  const filteredMembers = useMemo(() => {
    if (activeCategory === 'all') {
      // Requested All Crew Hierarchy: Mentor (1) -> Captain (2) -> Vice Captain (3) -> Core Members (4) -> Leads (5) -> Members (6)
      return [...teamMembers].sort((a, b) => {
        const getRank = (m: TeamMember) => {
          if (m.isMentor) return 1;
          const r = (m.role || '').toLowerCase();
          if (r.includes('captain') && !r.includes('vice')) return 2;
          if (r.includes('vice captain') || r.includes('vice-captain') || r.includes('vice')) return 3;
          if (m.isCore || r.includes('core')) return 4;
          if ((m.leadDomains && m.leadDomains.length > 0) || r.includes('lead')) return 5;
          return 6;
        };
        const rankA = getRank(a);
        const rankB = getRank(b);
        if (rankA !== rankB) return rankA - rankB;
        return a.name.localeCompare(b.name);
      });
    }

    const domainKey = activeCategory as DomainId;
    const matches = teamMembers.filter((m) => m.domains.includes(domainKey));

    // Sort Domain Lead of this specific domain to the very top, others follow alphabetically
    return matches.sort((a, b) => {
      const aIsLead = a.leadDomains.includes(domainKey);
      const bIsLead = b.leadDomains.includes(domainKey);
      if (aIsLead && !bIsLead) return -1;
      if (!aIsLead && bIsLead) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [teamMembers, activeCategory]);

  const uniqueStudentCount = teamMembers.filter((m) => !m.isMentor).length;

  return (
    <section id="team" className="mb-32 border-t border-jet-black/10 pt-24 font-sans">
      
      {/* Section Header & Centered Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-8 text-center md:text-left">
        <div className="max-w-2xl mx-auto md:mx-0">
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-orange animate-pulse"></span>
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-grey font-mono font-bold">
              04 / The Collective
            </h2>
          </div>
          <h3 className="text-4xl md:text-6xl font-black text-jet-black tracking-tight leading-none">
            Meet The Team<span className="text-orange">.</span>
          </h3>
          <p className="text-base sm:text-lg text-grey font-light mt-4 leading-relaxed">
            {uniqueStudentCount} members guided by 1 dedicated faculty mentor across 8 specialized domains designing, simulating, and fabricating SNJB&apos;s Smart Scrambler E-Bike for the SIEP National Championship 2026–27.
          </p>
        </div>

        {/* Stats Pill - Perfectly Centered on Mobile */}
        <div className="w-full sm:w-auto max-w-sm mx-auto md:mx-0 bg-jet-black text-alice-blue px-6 py-4 rounded-xl flex items-center justify-between shadow-sm shrink-0">
          <div className="flex-1 text-center">
            <div className="text-2xl font-black font-mono text-orange">{uniqueStudentCount}</div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-grey">Members</div>
          </div>
          <div className="w-[1px] h-8 bg-white/10 shrink-0 mx-2"></div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-black font-mono text-alice-blue">1</div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-grey">Mentor</div>
          </div>
          <div className="w-[1px] h-8 bg-white/10 shrink-0 mx-2"></div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-black font-mono text-orange">8</div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-grey">Domains</div>
          </div>
        </div>
      </div>

      {/* Auto Sliding Team Gallery */}
      <TeamGallerySlider />

      {/* 8 Ungrouped Domain Filter Tabs - Desktop Only */}
      <div className="hidden md:flex items-center gap-2 overflow-x-auto pb-4 mb-12 hide-scrollbar">
        {DOMAIN_FILTER_TABS.map((tab) => {
          const isActive = activeCategory === tab.id;
          const count = tab.id === 'all' 
            ? uniqueStudentCount 
            : teamMembers.filter(m => m.domains.includes(tab.id as DomainId)).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`min-h-[44px] px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-jet-black text-alice-blue shadow-md font-bold'
                  : 'bg-white border border-jet-black/10 text-grey hover:border-jet-black/30 hover:text-jet-black'
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Mobile-Only 9 Teams Section (md:hidden) */}
      <div className="md:hidden space-y-4">
        {/* Mobile Dropdown Option for Quick Jump */}
        <div className="bg-white border border-jet-black/10 rounded-2xl p-4 shadow-xs">
          <label
            htmlFor="mobile-team-select"
            className="block text-[10px] font-mono uppercase tracking-widest text-grey font-bold mb-2"
          >
            Select Team (9 Teams):
          </label>
          <div className="relative">
            <select
              id="mobile-team-select"
              value={openTeamId || 'all'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'all') {
                  setOpenTeamId(null);
                } else {
                  setOpenTeamId(val);
                  setTimeout(() => {
                    const el = document.getElementById(`team-accordion-${val}`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                  }, 50);
                }
              }}
              className="w-full bg-[#fafbfc] border border-jet-black/15 rounded-xl px-4 py-3 text-sm font-bold text-jet-black appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-orange cursor-pointer"
            >
              <option value="all">Browse All 9 Teams</option>
              {NINE_MOBILE_TEAMS.map((team, idx) => (
                <option key={team.id} value={team.id}>
                  {idx + 1}. {team.name} ({team.memberIds.length} {team.memberIds.length === 1 ? 'member' : 'members'})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-grey">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* 9 Team Dropdowns */}
        <div className="space-y-3">
          {NINE_MOBILE_TEAMS.map((team, index) => (
            <MobileTeamAccordion
              key={team.id}
              team={team}
              index={index}
              isOpen={openTeamId === team.id}
              onToggle={() =>
                setOpenTeamId(openTeamId === team.id ? null : team.id)
              }
              memberLookup={memberLookup}
              getProfileForMember={getProfileForMember}
            />
          ))}
        </div>
      </div>

      {/* Desktop Grid - Preserved */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {filteredMembers.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            activeCategory={activeCategory}
            customProfile={getProfileForMember(member)}
          />
        ))}
      </div>

      {/* Collective Banner */}
      <div className="mt-16 bg-gradient-to-r from-jet-black via-[#1c222c] to-jet-black text-alice-blue p-8 md:p-12 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="max-w-2xl text-center md:text-left">
          <span className="text-[10px] uppercase font-mono tracking-widest text-orange font-bold block mb-2">
            Collective Strength
          </span>
          <h4 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
            {uniqueStudentCount} Team Members &amp; 1 Faculty Mentor
          </h4>
          <p className="text-sm text-grey font-light leading-relaxed">
            A dedicated collective of {uniqueStudentCount} members guided by 1 faculty mentor across Mechanical, EnTC, and Computer disciplines from SNJB&apos;s KBJ College of Engineering, Chandwad.
          </p>
        </div>
        <Link
          href="/contact"
          className="min-h-[44px] inline-flex items-center justify-center px-6 py-3.5 bg-orange text-jet-black font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-white transition-all shadow-md shrink-0 text-center w-full sm:w-auto"
        >
          Contact The Team →
        </Link>
      </div>

    </section>
  );
}
