"use client";

import React, { useState } from 'react';
import { ROSTER_MEMBERS } from '@/lib/members';
import { ALL_TEAMS } from '@/lib/teams';
import { MemberCredential } from '@/types/dashboard';

interface CredentialsVaultTabProps {
  memberCredentials: MemberCredential[];
  teamCredentials: Record<string, { password: string; isCustom: boolean }>;
  loadCredentials: () => void;
}

export default function CredentialsVaultTab({
  memberCredentials,
  teamCredentials,
  loadCredentials,
}: CredentialsVaultTabProps) {
  const [accountsViewMode, setAccountsViewMode] = useState<'members' | 'teams'>('members');
  const [showCredentialsPasswords, setShowCredentialsPasswords] = useState(false);

  return (
    <div className="bg-white border border-jet-black/10 rounded-2xl overflow-hidden shadow-sm space-y-0">
      <div className="p-6 sm:p-8 border-b border-jet-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-jet-black font-sans">
            SIEP Access &amp; Credential Directory
          </h3>
          <p className="text-xs text-zinc-600 font-sans mt-0.5">
            Core Leadership master control: View member 6-digit PINs, roles, and access tiers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="p-1 rounded-xl bg-alice-blue border border-jet-black/10 flex items-center gap-1 text-xs font-sans">
            <button
              type="button"
              onClick={() => setAccountsViewMode('members')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                accountsViewMode === 'members'
                  ? 'bg-jet-black text-alice-blue shadow-sm'
                  : 'text-zinc-600 hover:text-jet-black'
              }`}
            >
              Members ({ROSTER_MEMBERS.length})
            </button>
            <button
              type="button"
              onClick={() => setAccountsViewMode('teams')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                accountsViewMode === 'teams'
                  ? 'bg-jet-black text-alice-blue shadow-sm'
                  : 'text-zinc-600 hover:text-jet-black'
              }`}
            >
              Squads ({ALL_TEAMS.length})
            </button>
          </div>

          <button
            type="button"
            onClick={loadCredentials}
            className="text-xs font-sans px-3 py-2 bg-alice-blue text-jet-black hover:bg-jet-black hover:text-white border border-jet-black/10 rounded-xl font-semibold transition-all cursor-pointer"
            title="Reload from Google Cloud Firestore"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setShowCredentialsPasswords(!showCredentialsPasswords)}
            className="text-xs font-sans px-3.5 py-2 bg-alice-blue text-jet-black hover:bg-jet-black hover:text-white border border-jet-black/10 rounded-xl font-semibold transition-all cursor-pointer"
          >
            {showCredentialsPasswords ? 'Mask PINs' : 'Show PINs'}
          </button>
        </div>
      </div>

      {/* Enterprise Security Notice */}
      <div className="mx-6 sm:mx-8 my-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <div className="w-6 h-6 rounded-lg bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="space-y-1 text-xs font-sans">
          <p className="font-semibold text-jet-black">
            Protected Core Credential Vault (Server-Side Verified)
          </p>
          <p className="text-zinc-600 leading-relaxed">
            Access is strictly authorized server-side on{' '}
            <code className="bg-amber-100/80 px-1 py-0.5 rounded text-[11px] font-mono">/api/passwords</code>.
            Plaintext is never exposed publicly and credentials are encrypted in transit. Recommended practice:
            synchronize shared team credentials with{' '}
            <a
              href="https://bitwarden.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange hover:underline font-semibold"
            >
              Bitwarden Vault
            </a>
            .
          </p>
        </div>
      </div>

      {/* VIEW 1: 23 PERSONAL MEMBER LOGINS */}
      {accountsViewMode === 'members' && (
        <>
          {/* Desktop Member Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-alice-blue border-b border-jet-black/10 text-grey uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Member Name</th>
                  <th className="py-4 px-6">Personal Gmail</th>
                  <th className="py-4 px-6">Role &amp; Domain</th>
                  <th className="py-4 px-6">Access Level</th>
                  <th className="py-4 px-6">6-Digit PIN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-jet-black/5">
                {ROSTER_MEMBERS.map((m) => {
                  const cred = memberCredentials.find((c) => c.email.toLowerCase() === m.email.toLowerCase());
                  const activePin = cred?.password || '935200';
                  const isCustom = Boolean(cred?.isCustom);

                  return (
                    <tr key={m.id} className="hover:bg-alice-blue/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-jet-black font-sans text-sm">{m.name}</td>
                      <td className="py-4 px-6 text-grey font-mono select-all">{m.email}</td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-jet-black">{m.role}</span>
                      </td>
                      <td className="py-4 px-6">
                        {m.isCore ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange/20 text-orange border border-orange/30">
                            Core Leadership
                          </span>
                        ) : m.isLead ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-500/15 text-sky-700 border border-sky-300">
                            Domain Lead
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-jet-black/10 text-grey">
                            Team Member
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-orange font-bold select-all">
                        <div className="flex items-center gap-2">
                          <span className="tracking-widest">
                            {showCredentialsPasswords ? activePin : '••••••'}
                          </span>
                          {isCustom ? (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold">
                              CUSTOM
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded bg-jet-black/5 text-grey text-[9px] font-mono">
                              DEFAULT
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Member Cards */}
          <div className="sm:hidden space-y-3 p-4">
            {ROSTER_MEMBERS.map((m) => {
              const cred = memberCredentials.find((c) => c.email.toLowerCase() === m.email.toLowerCase());
              const activePin = cred?.password || '935200';
              const isCustom = Boolean(cred?.isCustom);

              return (
                <div key={m.id} className="bg-alice-blue/40 border border-jet-black/10 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-jet-black text-sm">{m.name}</span>
                    {m.isCore ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-orange/20 text-orange">
                        Core
                      </span>
                    ) : m.isLead ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-sky-500/15 text-sky-700">
                        Lead
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-jet-black/10 text-grey">
                        Member
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-grey break-all select-all">{m.email}</div>
                  <div className="text-xs text-jet-black">
                    {m.role}
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-jet-black/10">
                    <span className="text-[10px] font-mono uppercase text-grey">6-Digit PIN:</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-bold font-mono text-orange tracking-widest select-all">
                        {showCredentialsPasswords ? activePin : '••••••'}
                      </code>
                      {isCustom ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[8px] font-mono font-bold">
                          CUSTOM
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-jet-black/5 text-grey text-[8px] font-mono">
                          DEFAULT
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* VIEW 2: LEGACY SUBSYSTEM SQUADS */}
      {accountsViewMode === 'teams' && (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-alice-blue border-b border-jet-black/10 text-grey uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Subsystem Team</th>
                  <th className="py-4 px-6">Login Email</th>
                  <th className="py-4 px-6">Password</th>
                  <th className="py-4 px-6">Access Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-jet-black/5">
                {ALL_TEAMS.map((team) => {
                  const cred = teamCredentials[team.id];
                  const activePass = cred?.password || team.defaultPass;
                  const isCustom = Boolean(cred?.isCustom);

                  return (
                    <tr key={team.id} className="hover:bg-alice-blue/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-jet-black">
                        <span className="text-[10px] text-grey mr-2">[{team.code}]</span>
                        <span>{team.name}</span>
                      </td>
                      <td className="py-4 px-6 text-grey font-mono select-all">{team.email}</td>
                      <td className="py-4 px-6 font-mono text-orange font-bold select-all">
                        <div className="flex items-center gap-2">
                          <span>{showCredentialsPasswords ? activePass : '••••••••••••'}</span>
                          {isCustom && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold tracking-wider">
                              UPDATED
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                            team.id === 'core'
                              ? 'bg-orange/20 text-orange'
                              : 'bg-jet-black/10 text-jet-black'
                          }`}
                        >
                          {team.id === 'core' ? 'Core Leadership' : 'Subsystem Squad'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-3 p-4">
            {ALL_TEAMS.map((team) => {
              const cred = teamCredentials[team.id];
              const activePass = cred?.password || team.defaultPass;
              const isCustom = Boolean(cred?.isCustom);

              return (
                <div key={team.id} className="bg-alice-blue/40 border border-jet-black/10 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-jet-black/10 font-bold">
                        [{team.code}]
                      </span>
                      <span className="text-sm font-bold text-jet-black">{team.name}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        team.id === 'core' ? 'bg-orange/20 text-orange' : 'bg-jet-black/10 text-jet-black'
                      }`}
                    >
                      {team.id === 'core' ? 'Admin' : 'Squad'}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-grey break-all select-all">{team.email}</div>
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-jet-black/10">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono uppercase text-grey font-medium">Pass:</span>
                      {isCustom && (
                        <span className="px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[8px] font-mono font-bold">
                          UPDATED
                        </span>
                      )}
                    </div>
                    <code className="text-sm font-bold font-mono text-orange select-all">
                      {showCredentialsPasswords ? activePass : '••••••••'}
                    </code>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
