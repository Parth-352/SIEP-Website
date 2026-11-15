"use client";

import React, { useState } from 'react';
import { TeamMember, DomainId, DOMAIN_LABELS } from './teamTypes';

interface MemberCardProps {
  member: TeamMember;
  activeCategory: string;
  customProfile?: { displayName?: string; photoUrl?: string };
}

export default function MemberCard({
  member,
  activeCategory,
  customProfile,
}: MemberCardProps) {
  const [imgError, setImgError] = useState(false);
  const displayName = customProfile?.displayName || member.name;
  const displayImage = customProfile?.photoUrl || member.image;

  // Compute initials for clean CAD monogram fallback
  const initials = displayName
    .split(' ')
    .filter(n => !n.startsWith('Prof.'))
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleLower = (member.role || '').toLowerCase();
  const isCaptain = roleLower.includes('captain') && !roleLower.includes('vice');
  const isViceCaptain = roleLower.includes('vice captain') || roleLower.includes('vice-captain') || roleLower.includes('vice');
  const isCore = member.isCore || roleLower.includes('core');

  // Compute specific domain role vs global all-crew hierarchy:
  let roleLabel = 'Team Member';
  let badgeClass = 'bg-jet-black/5 text-jet-black/70';

  if (activeCategory === 'all') {
    if (member.isMentor) {
      roleLabel = 'Faculty Mentor';
      badgeClass = 'bg-jet-black text-alice-blue font-bold shadow-sm';
    } else if (isCaptain) {
      roleLabel = member.role || 'Team Captain';
      badgeClass = 'bg-amber-100 text-amber-900 border border-amber-300 font-bold';
    } else if (isViceCaptain) {
      roleLabel = member.role || 'Vice Captain';
      badgeClass = 'bg-indigo-100 text-indigo-900 border border-indigo-300 font-bold';
    } else if (isCore) {
      roleLabel = member.role || 'Core Member';
      badgeClass = 'bg-purple-100 text-purple-900 border border-purple-300 font-bold';
    } else if (member.leadDomains && member.leadDomains.length > 0) {
      roleLabel = member.role || 'Domain Lead';
      badgeClass = 'bg-orange/15 text-orange border border-orange/30 font-bold';
    } else {
      roleLabel = member.role || 'Team Member';
      badgeClass = 'bg-jet-black/5 text-jet-black/70';
    }
  } else {
    // Specific domain selected (e.g. software, entc, mechanical, etc.)
    const isLeadOfThisDomain = member.leadDomains && member.leadDomains.includes(activeCategory as DomainId);
    if (member.isMentor) {
      roleLabel = 'Faculty Mentor';
      badgeClass = 'bg-jet-black text-alice-blue font-bold shadow-sm';
    } else if (isLeadOfThisDomain) {
      roleLabel = 'Domain Lead';
      badgeClass = 'bg-orange/15 text-orange border border-orange/30 font-bold';
    } else {
      // STRICT INVARIANT: All other members in this specific domain are displayed strictly as Team Member
      roleLabel = 'Team Member';
      badgeClass = 'bg-jet-black/5 text-jet-black/70';
    }
  }

  const domainBadgeText = activeCategory === 'all'
    ? (member.isMentor 
        ? 'Faculty Advisor' 
        : member.domains.map(d => DOMAIN_LABELS[d] || d).join(', '))
    : (DOMAIN_LABELS[activeCategory as DomainId] || 'Domain Member');

  const domainFullList = member.isMentor
    ? 'Technical Advisory & Guidance'
    : member.domains.map(d => DOMAIN_LABELS[d] || d).join(' • ');

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

        {displayImage && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayImage}
            alt={displayName}
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
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-jet-black group-hover:text-orange transition-colors line-clamp-1" title={displayName}>
            {displayName}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${badgeClass}`}>
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
