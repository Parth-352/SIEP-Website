"use client";

import React from 'react';
import { UserProfile } from '@/lib/types';
import { TEAMS } from '@/lib/teams';
import { getMemberInitials, getAvatarColorClass } from '@/utils/avatarUtils';
import PinChangeForm from './PinChangeForm';

interface ProfileViewProps {
  user: UserProfile;
  tier: number;
  logout: () => void;
  isInstalled: boolean;
  installApp: (() => void) | null;
}

export default function ProfileView({
  user,
  tier,
  logout,
  isInstalled,
  installApp,
}: ProfileViewProps) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Identity Card */}
      <div className="bg-white border border-jet-black/10 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-sm ${getAvatarColorClass(
                user.displayName
              )}`}
            >
              {getMemberInitials(user.displayName)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-jet-black font-sans">
                  {user.displayName}
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-sans font-bold uppercase ${
                    tier === 1
                      ? 'bg-orange/20 text-orange border border-orange/30'
                      : tier === 2
                      ? 'bg-sky-100 text-sky-800 border border-sky-300'
                      : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                  }`}
                >
                  {tier === 1
                    ? 'Tier 1 • Core Leadership'
                    : tier === 2
                    ? 'Tier 2 • Domain Lead'
                    : 'Tier 3 • Team Innovator'}
                </span>
              </div>
              <p className="text-xs font-sans text-zinc-500">{user.email}</p>
              <p className="text-xs font-sans text-zinc-700 font-medium">
                {user.role || 'SIEP Engineering Member'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => logout()}
            className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-sans font-semibold transition-all cursor-pointer self-start sm:self-center"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Domain Affiliations */}
      <div className="bg-white border border-jet-black/10 rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-jet-black font-sans flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange" />
          Assigned Engineering Domains
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Primary Team */}
          <div className="p-4 rounded-xl bg-orange/5 border border-orange/20 space-y-1">
            <span className="text-[10px] font-mono font-bold text-orange uppercase tracking-wider block">
              Primary Domain
            </span>
            <div className="text-sm font-bold text-jet-black font-sans">
              {TEAMS[user.teamId]?.name || user.teamId}
            </div>
            <p className="text-xs text-zinc-500 font-sans">
              {TEAMS[user.teamId]?.description || 'Core engineering division'}
            </p>
          </div>

          {/* Secondary Teams */}
          <div className="p-4 rounded-xl bg-alice-blue/60 border border-jet-black/10 space-y-2">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
              Secondary Domains ({user.secondaryTeams?.length || 0})
            </span>
            {user.secondaryTeams && user.secondaryTeams.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {user.secondaryTeams.map((secId) => (
                  <span
                    key={secId}
                    className={`px-2.5 py-1 rounded-lg text-xs font-sans font-semibold border ${
                      TEAMS[secId]?.badgeBg || 'bg-white text-zinc-800 border-zinc-200'
                    }`}
                  >
                    {TEAMS[secId]?.shortName || secId}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 font-sans italic">
                No secondary domains assigned.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Security & Change PIN Form */}
      <PinChangeForm />

      {/* Device & PWA Status */}
      <div className="bg-white border border-jet-black/10 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-jet-black font-sans">
            SIEP Progressive Web App (PWA)
          </h4>
          <p className="text-xs text-zinc-500 font-sans">
            {isInstalled
              ? 'Installed as standalone app on this device with background synchronization.'
              : 'Install this application to your home screen for offline access and full screen view.'}
          </p>
        </div>

        {!isInstalled && installApp && (
          <button
            type="button"
            onClick={installApp}
            className="px-4 py-2.5 rounded-xl bg-orange text-white hover:bg-amber-500 font-sans text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap"
          >
            Install App ⤓
          </button>
        )}
      </div>
    </div>
  );
}
