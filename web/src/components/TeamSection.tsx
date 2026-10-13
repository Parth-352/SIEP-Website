"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  subsystem: string;
  category: 'leadership' | 'powertrain' | 'mechanical' | 'electronics' | 'operations';
  department: string;
  image?: string;
}

const TEAM_MEMBERS: TeamMember[] = [
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
    name: 'Meet Jain',
    role: 'Team Captain & Project Head',
    subsystem: 'Overall Vehicle Integration',
    category: 'leadership',
    department: 'Mechanical Engineering',
    image: '/team/meet_jain.jpg',
  },
  {
    id: 'pratik',
    name: 'Pratik Desarda',
    role: 'Vice Captain & Operations Lead',
    subsystem: 'Logistics & Compliance',
    category: 'leadership',
    department: 'Mechanical Engineering',
    image: '/team/pratik_desarda.jpg',
  },
  {
    id: 'tirthraj',
    name: 'Tirthraj Pawale',
    role: 'Technical Lead',
    subsystem: 'Powertrain & Dynamics',
    category: 'leadership',
    department: 'Mechanical Engineering',
    image: '/team/tirthraj_pawale.jpg',
  },
  {
    id: 'chassis-lead',
    name: 'Chassis & Frame Lead',
    role: 'CAD & Spaceframe Specialist',
    subsystem: 'Chassis & Ergonomics',
    category: 'mechanical',
    department: 'Mechanical Engineering',
    image: '/team/chassis_lead.jpg',
  },
  {
    id: 'powertrain-lead',
    name: 'Powertrain Engineer',
    role: 'Mid-Drive BLDC & Transmission',
    subsystem: 'Drivetrain Architecture',
    category: 'powertrain',
    department: 'Electrical Engineering',
    image: '/team/powertrain_lead.jpg',
  },
  {
    id: 'bms-lead',
    name: 'Battery Systems Lead',
    role: '72V Pack Architecture & BMS',
    subsystem: 'Energy Storage & Safety',
    category: 'powertrain',
    department: 'Electrical Engineering',
    image: '/team/bms_lead.jpg',
  },
  {
    id: 'suspension-lead',
    name: 'Suspension & Steering Lead',
    role: 'Kinematics & Dynamics Tuning',
    subsystem: 'Suspension & Braking',
    category: 'mechanical',
    department: 'Mechanical Engineering',
    image: '/team/suspension_lead.jpg',
  },
  {
    id: 'electronics-lead',
    name: 'Telemetry & Firmware Lead',
    role: 'CAN Bus & Sensor Fusion',
    subsystem: 'Smart Systems & VCU',
    category: 'electronics',
    department: 'Computer / Electronics',
    image: '/team/electronics_lead.jpg',
  },
  {
    id: 'simulation-lead',
    name: 'Simulation & CAE Engineer',
    role: 'FEA Stress & CFD Aerodynamics',
    subsystem: 'Computational Analysis',
    category: 'mechanical',
    department: 'Mechanical Engineering',
    image: '/team/simulation_lead.jpg',
  },
  {
    id: 'fab-lead',
    name: 'Fabrication & Machining Lead',
    role: 'TIG Welding & CNC Prototyping',
    subsystem: 'Manufacturing',
    category: 'mechanical',
    department: 'Mechanical Engineering',
    image: '/team/fab_lead.jpg',
  },
  {
    id: 'operations-lead',
    name: 'Documentation & Media Lead',
    role: 'Rulebook Compliance & Media',
    subsystem: 'Management & Outreach',
    category: 'operations',
    department: 'Engineering Collective',
    image: '/team/operations_lead.jpg',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All Crew' },
  { id: 'leadership', label: 'Mentors & Leads' },
  { id: 'mechanical', label: 'Mechanical & Chassis' },
  { id: 'powertrain', label: 'Powertrain & Battery' },
  { id: 'electronics', label: 'Electronics & Firmware' },
  { id: 'operations', label: 'Operations' },
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

export default function TeamSection() {
  const [activeCategory, setActiveCategory] = useState<string>('all');

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
        <div className="bg-jet-black text-alice-blue px-6 py-4 rounded-xl flex items-center gap-6 md:gap-8 shadow-sm shrink-0">
          <div>
            <div className="text-2xl font-black font-mono text-orange">25</div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-grey">Students</div>
          </div>
          <div className="w-[1px] h-8 bg-white/10"></div>
          <div>
            <div className="text-2xl font-black font-mono text-alice-blue">1</div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-grey">Mentor</div>
          </div>
          <div className="w-[1px] h-8 bg-white/10"></div>
          <div>
            <div className="text-2xl font-black font-mono text-orange">1</div>
            <div className="text-[10px] uppercase font-mono tracking-widest text-grey">Mission</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-12 hide-scrollbar">
        {CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-mono uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
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

      {/* Team Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
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
          className="px-6 py-3.5 bg-orange text-jet-black font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-white transition-all shadow-md shrink-0 text-center"
        >
          Partner With The Team →
        </Link>
      </div>

    </section>
  );
}
