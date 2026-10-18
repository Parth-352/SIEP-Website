"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import TeamGallerySlider from './TeamGallerySlider';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  subsystem: string;
  category: 'leadership' | 'software_entc' | 'mechanical_design' | 'research' | 'operations';
  department: string;
  image?: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  // Faculty & Leadership
  {
    id: 'deore',
    name: 'Prof. Deore H.S.',
    role: 'Faculty Mentor & Advisor',
    subsystem: 'Technical Advisory',
    category: 'leadership',
    department: 'Dept. of Mechanical Engineering',
    image: '/team/prof_deore.jpg',
  },
  {
    id: 'meet',
    name: 'Meet Samdadiya',
    role: 'Team Captain & Mechanical/Design Lead',
    subsystem: 'Vehicle Architecture',
    category: 'leadership',
    department: 'Mechanical Engineering',
    image: '/team/meet_jain.jpg',
  },
  {
    id: 'tirthraj',
    name: 'Tirthraj Pawale',
    role: 'Vice Captain & EnTC Lead',
    subsystem: 'Powertrain & High Voltage',
    category: 'leadership',
    department: 'Electronics & Telecommunication',
    image: '/team/tirthraj_pawale.jpg',
  },
  {
    id: 'pratik',
    name: 'Pratik Desarda',
    role: 'Documentation Lead & Core Member',
    subsystem: 'Rulebook & Compliance',
    category: 'leadership',
    department: 'Electronics & Telecommunication',
    image: '/team/pratik_desarda.jpg',
  },
  {
    id: 'parth',
    name: 'Parth Kshirsagar',
    role: 'Software Lead & Telemetry Architect',
    subsystem: 'CAN Bus & Cloud Telemetry',
    category: 'leadership',
    department: 'Computer / Software Engineering',
  },
  {
    id: 'aditya',
    name: 'Aditya Fuldeore',
    role: 'Research Lead & Simulation Specialist',
    subsystem: 'FEA Stress & CFD Aerodynamics',
    category: 'leadership',
    department: 'Mechanical Engineering',
  },
  {
    id: 'shravani',
    name: 'Shravani Gadekar',
    role: 'Sponsorship Lead & Outreach Head',
    subsystem: 'Corporate Sponsorship & Finance',
    category: 'leadership',
    department: 'Engineering Collective',
  },
  {
    id: 'nishant',
    name: 'Nishant Shinde',
    role: 'Social Media Lead & Creative Director',
    subsystem: 'Brand Identity & Media Coverage',
    category: 'leadership',
    department: 'Engineering Collective',
  },

  // Software & EnTC
  {
    id: 'samiksha',
    name: 'Samiksha Patole',
    role: 'Frontend & Dashboard Developer',
    subsystem: 'Software & Telemetry',
    category: 'software_entc',
    department: 'Computer Engineering',
  },
  {
    id: 'riddhi',
    name: 'Riddhi Munot',
    role: 'Embedded Software Engineer',
    subsystem: 'Software & Documentation',
    category: 'software_entc',
    department: 'Computer Engineering',
  },
  {
    id: 'ankita',
    name: 'Ankita Bachhav',
    role: 'BMS Architecture Engineer',
    subsystem: 'Electronics & Telecommunication',
    category: 'software_entc',
    department: 'EnTC Engineering',
  },
  {
    id: 'nayan',
    name: 'Nayan Jain',
    role: 'Power Electronics & Inverter',
    subsystem: 'Electronics & Telecommunication',
    category: 'software_entc',
    department: 'EnTC Engineering',
  },
  {
    id: 'snehal',
    name: 'Snehal Shinde',
    role: 'Wire Harness & Interconnects',
    subsystem: 'Electronics & Telecommunication',
    category: 'software_entc',
    department: 'EnTC Engineering',
  },
  {
    id: 'prathamesh-d',
    name: 'Prathamesh Deshmukh',
    role: 'Microcontroller Firmware',
    subsystem: 'Electronics & Telecommunication',
    category: 'software_entc',
    department: 'EnTC Engineering',
  },
  {
    id: 'prem',
    name: 'Prem Chaudhari',
    role: 'Safety Interlocks & Fusing',
    subsystem: 'Electronics & Design',
    category: 'software_entc',
    department: 'EnTC Engineering',
  },
  {
    id: 'sharvari',
    name: 'Sharvari Bhambar',
    role: 'Hardware Testing & QC',
    subsystem: 'Electronics & Compliance',
    category: 'software_entc',
    department: 'EnTC Engineering',
  },
  {
    id: 'mohit',
    name: 'Mohit Pagar',
    role: 'Telemetry Circuits & TIG Welding',
    subsystem: 'EnTC & Mechanical',
    category: 'software_entc',
    department: 'EnTC / Mechanical',
  },

  // Mechanical & Design
  {
    id: 'ganesh',
    name: 'Ganesh Sonawane',
    role: 'Chassis & Spaceframe Fabrication',
    subsystem: 'Mechanical & Chassis',
    category: 'mechanical_design',
    department: 'Mechanical Engineering',
  },
  {
    id: 'prathamesh-t',
    name: 'Prathamesh Tidake',
    role: 'Suspension Kinematics & Tuning',
    subsystem: 'Mechanical & Design',
    category: 'mechanical_design',
    department: 'Mechanical Engineering',
  },
  {
    id: 'siddhesh',
    name: 'Siddhesh Raskar',
    role: 'Braking & Steering Dynamics',
    subsystem: 'Mechanical & Design',
    category: 'mechanical_design',
    department: 'Mechanical Engineering',
  },
  {
    id: 'ajay',
    name: 'Ajay Kate',
    role: 'Drivetrain Machining & Media',
    subsystem: 'Mechanical & Media',
    category: 'mechanical_design',
    department: 'Mechanical Engineering',
  },
  {
    id: 'kiran',
    name: 'Kiran Nyaharkar',
    role: 'Structural Assembly & Fitting',
    subsystem: 'Mechanical & Chassis',
    category: 'mechanical_design',
    department: 'Mechanical Engineering',
  },

  // Research & Simulation
  {
    id: 'omshri',
    name: 'Omshri Ahire',
    role: 'FEA Structural Stress Analysis',
    subsystem: 'Research & Simulation',
    category: 'research',
    department: 'Mechanical / R&D',
  },

  // Operations & Outreach
  {
    id: 'nikhil',
    name: 'Nikhil Patil',
    role: 'Cinematography & Technical Reports',
    subsystem: 'Social Media & Documentation',
    category: 'operations',
    department: 'Engineering Collective',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Crew' },
  { id: 'leadership', label: 'Mentors & Leads' },
  { id: 'software_entc', label: 'Software & EnTC' },
  { id: 'mechanical_design', label: 'Mechanical & Design' },
  { id: 'research', label: 'Research & Simulation' },
  { id: 'operations', label: 'Outreach & Documentation' },
];

function MemberCard({ member }: { member: TeamMember }) {
  const [imgError, setImgError] = useState(false);

  // Get initials for avatar fallback
  const initials = member.name
    .split(' ')
    .filter(n => !n.startsWith('Prof.'))
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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

        {/* Subsystem Tag on image bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center z-10 pointer-events-none">
          <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-black/60 backdrop-blur-md text-alice-blue border border-white/10 shadow-sm">
            {member.subsystem}
          </span>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-5 flex flex-col justify-between flex-1 bg-white">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-jet-black group-hover:text-orange transition-colors">
            {member.name}
          </h3>
          <p className="text-xs font-mono uppercase tracking-wider text-orange font-medium mt-1">
            {member.role}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-jet-black/5 flex items-center justify-between">
          <span className="text-[11px] text-grey font-light truncate max-w-[90%]">
            {member.department}
          </span>
          <span className="text-orange text-xs opacity-0 group-hover:opacity-100 transition-opacity font-mono">
            →
          </span>
        </div>
      </div>

    </div>
  );
}

function AccordionMemberItem({
  member,
  isExpanded,
  onToggle,
}: {
  member: TeamMember;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  // Get initials for avatar fallback
  const initials = member.name
    .split(' ')
    .filter(n => !n.startsWith('Prof.'))
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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
          {/* Initials Avatar (40x40px circle) */}
          <div className="w-10 h-10 rounded-full bg-jet-black text-alice-blue flex items-center justify-center font-mono text-xs font-bold shrink-0 shadow-sm">
            {initials || 'RB'}
          </div>

          {/* Name & Role */}
          <div className="min-w-0 flex-1 pr-2">
            <h4 className="text-sm font-bold text-jet-black truncate">
              {member.name}
            </h4>
            <p className="text-xs font-mono text-orange uppercase tracking-wider truncate">
              {member.role}
            </p>
          </div>
        </div>

        {/* Chevron Icon (rotates when expanded) */}
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
              {/* Image (if available) or larger initials avatar */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-b from-[#1b222d] via-jet-black to-[#151a22] overflow-hidden shrink-0 flex items-center justify-center border border-jet-black/10 shadow-inner">
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
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-mono text-base font-black text-alice-blue mb-1">
                      {initials || 'RB'}
                    </div>
                    <span className="text-[8px] uppercase font-mono tracking-widest text-white/40">
                      Riders Bay
                    </span>
                  </div>
                )}
              </div>

              {/* Full Member Details */}
              <div className="flex-1 min-w-0 space-y-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-grey block">
                    Subsystem
                  </span>
                  <span className="text-xs font-semibold text-jet-black block mt-0.5">
                    {member.subsystem}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-grey block">
                    Department
                  </span>
                  <span className="text-xs text-grey font-light block mt-0.5">
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

  const filteredMembers = activeCategory === 'all'
    ? TEAM_MEMBERS
    : TEAM_MEMBERS.filter(m => m.category === activeCategory);

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
            25 student engineers guided by 1 dedicated faculty mentor designing, simulating, and fabricating SNJB&apos;s Smart Scrambler E-Bike for the SIEP National Championship 2026–27.
          </p>
        </div>

        {/* Stats Pill */}
        <div className="bg-jet-black text-alice-blue px-4 py-3 sm:px-6 sm:py-4 rounded-xl flex items-center gap-4 sm:gap-6 md:gap-8 shadow-sm shrink-0">
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono text-orange">25</div>
            <div className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-grey">Students</div>
          </div>
          <div className="w-[1px] h-8 bg-white/10"></div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono text-alice-blue">1</div>
            <div className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-grey">Mentor</div>
          </div>
          <div className="w-[1px] h-8 bg-white/10"></div>
          <div>
            <div className="text-xl sm:text-2xl font-black font-mono text-orange">1</div>
            <div className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-grey">Mission</div>
          </div>
        </div>
      </div>

      {/* Auto Sliding Team Gallery (framed similarly to the Philosophy quote block) */}
      <TeamGallerySlider />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-12 hide-scrollbar">
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`min-h-[44px] px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-jet-black text-alice-blue shadow-md font-bold'
                  : 'bg-white border border-jet-black/10 text-grey hover:border-jet-black/30 hover:text-jet-black'
              }`}
            >
              {cat.label}
              {cat.id === 'all' && (
                <span className="ml-2 text-[10px] opacity-70">({TEAM_MEMBERS.length})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Mobile Accordion */}
      <div className="md:hidden space-y-2">
        {filteredMembers.map(member => (
          <AccordionMemberItem 
            key={member.id} 
            member={member} 
            isExpanded={expandedMemberId === member.id}
            onToggle={() => setExpandedMemberId(
              expandedMemberId === member.id ? null : member.id
            )}
          />
        ))}
      </div>

      {/* Desktop Grid (existing) */}
      <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {filteredMembers.map(member => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>

      {/* Collective Banner */}
      <div className="mt-16 bg-gradient-to-r from-jet-black via-[#1c222c] to-jet-black text-alice-blue p-8 md:p-12 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="max-w-2xl text-center md:text-left">
          <span className="text-[10px] uppercase font-mono tracking-widest text-orange font-bold block mb-2">
            Collective Strength
          </span>
          <h4 className="text-2xl md:text-3xl font-black tracking-tight mb-2">
            25 Student Innovators &amp; 1 Faculty Mentor
          </h4>
          <p className="text-sm text-grey font-light leading-relaxed">
            A dedicated collective of 25 student engineers guided by 1 faculty mentor across Mechanical, Electrical, and Computer disciplines from SNJB&apos;s KBJ College of Engineering, Chandwad.
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
