"use client";

import React, { useState } from 'react';
import { TeamMember } from './teamTypes';

interface MobilePlayerCardProps {
  member: TeamMember;
  role: string;
  isLead?: boolean;
  isMentor?: boolean;
  customProfile?: { displayName?: string; photoUrl?: string };
}

export default function MobilePlayerCard({
  member,
  role,
  isLead,
  isMentor,
  customProfile,
}: MobilePlayerCardProps) {
  const [imgError, setImgError] = useState(false);
  const displayName = customProfile?.displayName || member.name;
  const displayImage = customProfile?.photoUrl || member.image;

  const initials = displayName
    .split(' ')
    .filter((n) => !n.startsWith('Prof.'))
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3.5 p-3 rounded-xl bg-white border border-jet-black/5 hover:border-orange/30 transition-all shadow-xs">
      {/* Avatar / Monogram */}
      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-b from-[#1b222d] via-jet-black to-[#151a22] overflow-hidden shrink-0 flex items-center justify-center border border-jet-black/10 shadow-xs">
        {displayImage && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayImage}
            alt={displayName}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center"
          />
        ) : (
          <div className="font-mono text-sm font-black text-alice-blue">
            {initials || 'RB'}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-jet-black truncate">
            {displayName}
          </h4>
          <span
            className={`text-[9px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded shrink-0 ${
              isMentor
                ? 'bg-jet-black text-alice-blue'
                : isLead
                ? 'bg-orange/15 text-orange border border-orange/30'
                : 'bg-jet-black/5 text-jet-black/70'
            }`}
          >
            {role}
          </span>
        </div>
        <p className="text-[11px] text-grey font-light truncate mt-0.5">
          {member.department}
        </p>
      </div>
    </div>
  );
}
