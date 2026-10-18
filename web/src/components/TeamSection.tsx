"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import TeamGallerySlider from './TeamGallerySlider';

export type DomainId = 
  | 'software'
  | 'entc'
  | 'mechanical'
  | 'design'
  | 'research'
  | 'sponsorship'
  | 'socialmedia'
  | 'documentation';

export interface TeamMember {
  id: string;
  name: string;
  isMentor?: boolean;
  department: string;
  domains: DomainId[];
  leadDomains: DomainId[];
  image?: string;
}

export const DOMAIN_LABELS: Record<DomainId, string> = {
  software: 'Software',
  entc: 'EnTC',
  mechanical: 'Mechanical',
  design: 'Design',
  research: 'Research',
  sponsorship: 'Sponsorship',
  socialmedia: 'Social Media',
  documentation: 'Documentation',
};

export const DOMAIN_FILTER_TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Crew' },
  { id: 'software', label: 'Software' },
  { id: 'entc', label: 'EnTC' },
  { id: 'mechanical', label: 'Mechanical' },
  { id: 'design', label: 'Design' },
  { id: 'research', label: 'Research' },
  { id: 'sponsorship', label: 'Sponsorship' },
  { id: 'socialmedia', label: 'Social Media' },
  { id: 'documentation', label: 'Documentation' },
];

/**
 * Official Team Roster:
 * 23 Student Innovators across 8 specialized domains + 1 Faculty Mentor.
 * Official domain leads from college records:
 *  1. Software: Parth Kshirsagar
 *  2. EnTC: Tirthraj Pawale
 *  3. Mechanical: Meet Samdadiya
 *  4. Design: Meet Samdadiya
 *  5. Research: Aditya Fuldeore
 *  6. Sponsorship: Shravani Gadekar
 *  7. Social Media: Nishant Shinde
 *  8. Documentation: Pratik Desarda
 */
const TEAM_MEMBERS_DATA: TeamMember[] = [
  // Faculty Mentor & Advisor
  {
    id: 'deore',
    name: 'Prof. Deore H.S.',
    isMentor: true,
    department: 'Dept. of Mechanical Engineering',
    domains: [],
    leadDomains: [],
    image: '/team/prof_deore.jpg',
  },

  // 1. Meet Nayan Samdadiya (Domain Lead: Mechanical & Design; Member: Research, Sponsorship)
  {
    id: 'meet',
    name: 'Meet Nayan Samdadiya',
    department: 'Mechanical Engineering',
    domains: ['mechanical', 'design', 'research', 'sponsorship'],
    leadDomains: ['mechanical', 'design'],
    image: '/team/meet_jain.jpg',
  },

  // 2. Tirthraj Pawale (Domain Lead: EnTC; Member: Research, Social Media)
  {
    id: 'tirthraj',
    name: 'Tirthraj Pawale',
    department: 'Electronics & Telecommunication',
    domains: ['entc', 'research', 'socialmedia'],
    leadDomains: ['entc'],
    image: '/team/tirthraj_pawale.jpg',
  },

  // 3. Desarda Pratik Sachin (Domain Lead: Documentation; Member: EnTC, Sponsorship)
  {
    id: 'pratik',
    name: 'Desarda Pratik Sachin',
    department: 'Electronics & Telecommunication',
    domains: ['documentation', 'entc', 'sponsorship'],
    leadDomains: ['documentation'],
    image: '/team/pratik_desarda.jpg',
  },

  // 4. Parth Prashant Kshirsagar (Domain Lead: Software; Member: Sponsorship, Documentation)
  {
    id: 'parth',
    name: 'Parth Prashant Kshirsagar',
    department: 'Computer Engineering',
    domains: ['software', 'sponsorship', 'documentation'],
    leadDomains: ['software'],
  },

  // 5. Aditya Namdeo Fuldeore (Domain Lead: Research; Member: Design)
  {
    id: 'aditya',
    name: 'Aditya Namdeo Fuldeore',
    department: 'Mechanical Engineering',
    domains: ['research', 'design'],
    leadDomains: ['research'],
  },

  // 6. Shravani Chaitanya Gadekar (Domain Lead: Sponsorship; Member: Software, Research)
  {
    id: 'shravani',
    name: 'Shravani Chaitanya Gadekar',
    department: 'Computer Engineering',
    domains: ['sponsorship', 'software', 'research'],
    leadDomains: ['sponsorship'],
  },

  // 7. Nishant Rajendra Shinde (Domain Lead: Social Media; Member: Software, Sponsorship)
  {
    id: 'nishant',
    name: 'Nishant Rajendra Shinde',
    department: 'Computer Engineering',
    domains: ['socialmedia', 'software', 'sponsorship'],
    leadDomains: ['socialmedia'],
  },

  // 8. Samiksha Vasant Patole (Software)
  {
    id: 'samiksha',
    name: 'Samiksha Vasant Patole',
    department: 'Computer Engineering',
    domains: ['software'],
    leadDomains: [],
  },

  // 9. Riddhi Niraj Munot (Software, Sponsorship, Documentation)
  {
    id: 'riddhi',
    name: 'Riddhi Niraj Munot',
    department: 'Computer Engineering',
    domains: ['software', 'sponsorship', 'documentation'],
    leadDomains: [],
  },

  // 10. Bachhav Ankita Rakesh (EnTC, Research, Social Media)
  {
    id: 'ankita',
    name: 'Bachhav Ankita Rakesh',
    department: 'Electronics & Telecommunication',
    domains: ['entc', 'research', 'socialmedia'],
    leadDomains: [],
  },

  // 11. Nayan Punamchand Jain (EnTC, Research)
  {
    id: 'nayan',
    name: 'Nayan Punamchand Jain',
    department: 'Electronics & Telecommunication',
    domains: ['entc', 'research'],
    leadDomains: [],
  },

  // 12. Snehal Ravsaheb Shinde (EnTC, Sponsorship, Documentation)
  {
    id: 'snehal',
    name: 'Snehal Ravsaheb Shinde',
    department: 'Electronics & Telecommunication',
    domains: ['entc', 'sponsorship', 'documentation'],
    leadDomains: [],
  },

  // 13. Prathamesh Sanjay Deshmukh (EnTC)
  {
    id: 'prathamesh-d',
    name: 'Prathamesh Sanjay Deshmukh',
    department: 'Electronics & Telecommunication',
    domains: ['entc'],
    leadDomains: [],
  },

  // 14. Prem Manohar Chaudhari (EnTC, Design)
  {
    id: 'prem',
    name: 'Prem Manohar Chaudhari',
    department: 'Electronics & Telecommunication',
    domains: ['entc', 'design'],
    leadDomains: [],
  },

  // 15. Sharvari Prashant Bhambar (EnTC, Documentation)
  {
    id: 'sharvari',
    name: 'Sharvari Prashant Bhambar',
    department: 'Electronics & Telecommunication',
    domains: ['entc', 'documentation'],
    leadDomains: [],
  },

  // 16. Pagar Mohit Yogesh (EnTC, Mechanical)
  {
    id: 'mohit',
    name: 'Pagar Mohit Yogesh',
    department: 'Mechanical Engineering',
    domains: ['entc', 'mechanical'],
    leadDomains: [],
  },

  // 17. Ganesh Santosh Sonawane (Mechanical)
  {
    id: 'ganesh',
    name: 'Ganesh Santosh Sonawane',
    department: 'Mechanical Engineering',
    domains: ['mechanical'],
    leadDomains: [],
  },

  // 18. Prathamesh Vilas Tidake (Mechanical, Design)
  {
    id: 'prathamesh-t',
    name: 'Prathamesh Vilas Tidake',
    department: 'Mechanical Engineering',
    domains: ['mechanical', 'design'],
    leadDomains: [],
  },

  // 19. Siddhesh Raskar (Mechanical, Design)
  {
    id: 'siddhesh',
    name: 'Siddhesh Raskar',
    department: 'Mechanical Engineering',
    domains: ['mechanical', 'design'],
    leadDomains: [],
  },

  // 20. Ajay Dilip Kate (Mechanical, Social Media, Documentation)
  {
    id: 'ajay',
    name: 'Ajay Dilip Kate',
    department: 'Mechanical Engineering',
    domains: ['mechanical', 'socialmedia', 'documentation'],
    leadDomains: [],
  },

  // 21. Nyaharkar Kiran Balasaheb (Mechanical)
  {
    id: 'kiran',
    name: 'Nyaharkar Kiran Balasaheb',
    department: 'Mechanical Engineering',
    domains: ['mechanical'],
    leadDomains: [],
  },

  // 22. Ahire Omshri Shrikant (Research, Sponsorship)
  {
    id: 'omshri',
    name: 'Ahire Omshri Shrikant',
    department: 'Mechanical Engineering',
    domains: ['research', 'sponsorship'],
    leadDomains: [],
  },

  // 23. Nikhil Prabhakar Patil (Social Media, Documentation)
  {
    id: 'nikhil',
    name: 'Nikhil Prabhakar Patil',
    department: 'Computer Engineering',
    domains: ['socialmedia', 'documentation'],
    leadDomains: [],
  },
];

function MemberCard({ 
  member, 
  activeCategory 
}: { 
  member: TeamMember; 
  activeCategory: string; 
}) {
  const [imgError, setImgError] = useState(false);

  // Compute initials for clean CAD monogram fallback
  const initials = member.name
    .split(' ')
    .filter(n => !n.startsWith('Prof.'))
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isDomainLead = activeCategory === 'all'
    ? member.leadDomains.length > 0
    : member.leadDomains.includes(activeCategory as DomainId);

  const roleLabel = member.isMentor
    ? 'Faculty Mentor'
    : isDomainLead
    ? 'Domain Lead'
    : 'Team Member';

  const domainBadgeText = activeCategory === 'all'
    ? (member.isMentor 
        ? 'Faculty Advisor' 
        : member.leadDomains.length > 0 
          ? `Lead: ${member.leadDomains.map(d => DOMAIN_LABELS[d]).join(', ')}` 
          : member.domains.map(d => DOMAIN_LABELS[d]).slice(0, 2).join(', '))
    : (DOMAIN_LABELS[activeCategory as DomainId] || 'Domain Member');

  const domainFullList = member.isMentor
    ? 'Technical Advisory & Guidance'
    : member.domains.map(d => DOMAIN_LABELS[d]).join(' • ');

  return (
    <div className="group relative bg-white border border-jet-black/10 rounded-2xl overflow-hidden hover:border-orange/60 hover:shadow-xl transition-all duration-500 flex flex-col justify-between">
      
      {/* Photo / Avatar Area */}
      <div className="relative aspect-[4/5] w-full bg-gradient-to-b from-[#1b222d] via-jet-black to-[#151a22] overflow-hidden flex items-center justify-center">
        {/* Subtle CAD Crosshair / Grid watermark */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Corner markers */}
        <div className="absolute top-3 left-3 text-[10px] text-white/20 font-mono select-none">+</div>
        <div className="absolute top-3 right-3 text-[10px] text-white/20 font-mono select-none">+</div>
        <div className="absolute bottom-3 left-3 text-[10px] text-white/20 font-mono select-none">+</div>
        <div className="absolute bottom-3 right-3 text-[10px] text-white/20 font-mono select-none">+</div>

        {member.image && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.image}
            alt={member.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center select-none">
            {/* Branded Initials Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-orange/40 group-hover:bg-orange/10 transition-all duration-500 shadow-inner mb-4">
              <span className="font-mono text-2xl font-black text-alice-blue group-hover:text-orange transition-colors">
                {initials || 'RB'}
              </span>
            </div>
            <span className="text-[9px] uppercase font-mono tracking-[0.25em] text-white/40">
              Riders Bay
            </span>
          </div>
        )}

        {/* Domain Badge on Image Bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-10 pointer-events-none">
          <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-alice-blue border border-white/10 shadow-sm truncate max-w-full">
            {domainBadgeText}
          </span>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-5 flex flex-col justify-between flex-1 bg-white">
        <div>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-jet-black group-hover:text-orange transition-colors line-clamp-1" title={member.name}>
            {member.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${
              member.isMentor
                ? 'bg-jet-black text-alice-blue font-bold shadow-sm'
                : isDomainLead
                ? 'bg-orange/15 text-orange border border-orange/30 font-bold'
                : 'bg-jet-black/5 text-jet-black/70'
            }`}>
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-jet-black/5 flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-grey font-medium truncate" title={domainFullList}>
            {domainFullList}
          </span>
          <span className="text-[11px] text-grey/70 font-light truncate">
            {member.department}
          </span>
        </div>
      </div>

    </div>
  );
}

function AccordionMemberItem({
  member,
  activeCategory,
  isExpanded,
  onToggle,
}: {
  member: TeamMember;
  activeCategory: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  const initials = member.name
    .split(' ')
    .filter(n => !n.startsWith('Prof.'))
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const isDomainLead = activeCategory === 'all'
    ? member.leadDomains.length > 0
    : member.leadDomains.includes(activeCategory as DomainId);

  const roleLabel = member.isMentor
    ? 'Faculty Mentor'
    : isDomainLead
    ? 'Domain Lead'
    : 'Team Member';

  const domainFullList = member.isMentor
    ? 'Technical Advisory & Guidance'
    : member.domains.map(d => DOMAIN_LABELS[d]).join(' • ');

  return (
    <div
      className={`bg-white border rounded-xl overflow-hidden transition-all duration-200 ${
        isExpanded ? 'border-orange/60 shadow-md' : 'border-jet-black/10 hover:border-jet-black/30'
      }`}
    >
      {/* Collapsed Header / Toggle Button */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="w-full min-h-[56px] px-4 py-3 flex items-center justify-between text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Initials Avatar */}
          <div className="w-10 h-10 rounded-full bg-jet-black text-alice-blue flex items-center justify-center font-mono text-xs font-bold shrink-0 shadow-sm">
            {initials || 'RB'}
          </div>

          {/* Name & Role */}
          <div className="min-w-0 flex-1 pr-2">
            <h4 className="text-sm font-bold text-jet-black truncate">
              {member.name}
            </h4>
            <p className={`text-xs font-mono uppercase tracking-wider truncate ${
              member.isMentor || isDomainLead ? 'text-orange font-bold' : 'text-grey'
            }`}>
              {roleLabel}
            </p>
          </div>
        </div>

        {/* Chevron Icon */}
        <svg
          className={`w-5 h-5 text-grey transition-transform duration-300 shrink-0 ${
            isExpanded ? 'rotate-180 text-orange' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Details Drawer */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div className="px-4 pb-4 pt-2 border-t border-jet-black/5 bg-jet-black/[0.02]">
            <div className="flex gap-4 items-center">
              <div className="relative w-16 h-16 rounded-xl bg-gradient-to-b from-[#1b222d] via-jet-black to-[#151a22] overflow-hidden shrink-0 flex items-center justify-center border border-jet-black/10 shadow-inner">
                {member.image && !imgError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={member.image}
                    alt={member.name}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover object-center"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center select-none">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-xs font-black text-alice-blue mb-0.5">
                      {initials || 'RB'}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-grey block">
                    Domain
                  </span>
                  <span className="text-xs font-semibold text-jet-black block mt-0.5 truncate">
                    {domainFullList}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-grey block">
                    Department
                  </span>
                  <span className="text-xs text-grey font-light block mt-0.5 truncate">
                    {member.department}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeamSection() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // Filter members strictly based on domain selection without artificial team grouping
  const filteredMembers = useMemo(() => {
    if (activeCategory === 'all') {
      return TEAM_MEMBERS_DATA;
    }

    const domainKey = activeCategory as DomainId;
    const matches = TEAM_MEMBERS_DATA.filter((m) => m.domains.includes(domainKey));

    // Sort Domain Lead to the very top of each domain tab
    return matches.sort((a, b) => {
      const aIsLead = a.leadDomains.includes(domainKey);
      const bIsLead = b.leadDomains.includes(domainKey);
      if (aIsLead && !bIsLead) return -1;
      if (!aIsLead && bIsLead) return 1;
      return 0;
    });
  }, [activeCategory]);

  const uniqueStudentCount = TEAM_MEMBERS_DATA.filter((m) => !m.isMentor).length;

  return (
    <section id="team" className="mb-32 border-t border-jet-black/10 pt-24 font-sans">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-orange animate-pulse"></span>
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-grey font-mono font-bold">
              04 / The Collective
            </h2>
          </div>
          <h3 className="text-4xl md:text-6xl font-black text-jet-black tracking-tight leading-none">
            Meet The Team<span className="text-orange">.</span>
          </h3>
          <p className="text-lg text-grey font-light max-w-2xl mt-4 leading-relaxed">
            {uniqueStudentCount} student engineers guided by 1 dedicated faculty mentor across 8 specialized domains designing, simulating, and fabricating SNJB&apos;s Smart Scrambler E-Bike for the SIEP National Championship 2026–27.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="bg-jet-black text-alice-blue px-4 py-3 sm:px-6 sm:py-4 rounded-xl flex items-center gap-4 sm:gap-6 md:gap-8 shadow-sm shrink-0">
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono text-orange">{uniqueStudentCount}</div>
            <div className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-grey">Students</div>
          </div>
          <div className="w-[1px] h-8 bg-white/10"></div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono text-alice-blue">1</div>
            <div className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-grey">Mentor</div>
          </div>
          <div className="w-[1px] h-8 bg-white/10"></div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono text-orange">8</div>
            <div className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-grey">Domains</div>
          </div>
        </div>
      </div>

      {/* Auto Sliding Team Gallery */}
      <TeamGallerySlider />

      {/* 8 Ungrouped Domain Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-12 hide-scrollbar">
        {DOMAIN_FILTER_TABS.map((tab) => {
          const isActive = activeCategory === tab.id;
          const count = tab.id === 'all' 
            ? TEAM_MEMBERS_DATA.length 
            : TEAM_MEMBERS_DATA.filter(m => m.domains.includes(tab.id as DomainId)).length;

          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveCategory(tab.id);
                setExpandedMemberId(null);
              }}
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

      {/* Mobile Accordion */}
      <div className="md:hidden space-y-2">
        {filteredMembers.map((member) => (
          <AccordionMemberItem 
            key={member.id} 
            member={member} 
            activeCategory={activeCategory}
            isExpanded={expandedMemberId === member.id}
            onToggle={() => setExpandedMemberId(
              expandedMemberId === member.id ? null : member.id
            )}
          />
        ))}
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {filteredMembers.map((member) => (
          <MemberCard key={member.id} member={member} activeCategory={activeCategory} />
        ))}
      </div>

      {/* Collective Banner */}
      <div className="mt-16 bg-gradient-to-r from-jet-black via-[#1c222c] to-jet-black text-alice-blue p-8 md:p-12 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="max-w-2xl text-center md:text-left">
          <span className="text-[10px] uppercase font-mono tracking-widest text-orange font-bold block mb-2">
            Collective Strength
          </span>
          <h4 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
            {uniqueStudentCount} Student Innovators &amp; 1 Faculty Mentor
          </h4>
          <p className="text-sm text-grey font-light leading-relaxed">
            A dedicated collective of {uniqueStudentCount} student engineers guided by 1 faculty mentor across Mechanical, EnTC, and Computer disciplines from SNJB&apos;s KBJ College of Engineering, Chandwad.
          </p>
        </div>
        <Link
          href="/contact"
          className="min-h-[44px] inline-flex items-center justify-center px-6 py-3.5 bg-orange text-jet-black font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-white transition-all shadow-md shrink-0 text-center w-full sm:w-auto"
        >
          Partner With The Team →
        </Link>
      </div>

    </section>
  );
}
