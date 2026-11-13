"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { TEAMS_LIST, TEAMS } from '@/lib/teams';
import { Task, WorkLog, TeamId } from '@/lib/types';
import { ROSTER_MEMBERS, TeamMemberEntry, getMemberDomains } from '@/lib/members';
import { getMemberInitials, getAvatarColorClass } from '@/utils/avatarUtils';
import OperationsBanner from './OperationsBanner';
import StatCard from './StatCard';

interface SubsystemsTabProps {
  tasks: Task[];
  logs: WorkLog[];
  isCore: boolean;
  isLead: boolean;
  memberDomainIds?: TeamId[];
  handleOpenTaskDetail: (task: Task) => void;
  handleViewTeamTasksInKanban: (teamId: TeamId) => void;
}

export default function SubsystemsTab({
  tasks,
  logs,
  isCore,
  isLead,
  memberDomainIds = [],
  handleOpenTaskDetail,
  handleViewTeamTasksInKanban,
}: SubsystemsTabProps) {
  // Desktop filter tab matching Mockup 4
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'squads' | 'core' | 'roles'>('all');
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());
  const [memberPage, setMemberPage] = useState(1);
  const [selectedSquadDetail, setSelectedSquadDetail] = useState<string | null>(null);

  // Dynamic team members fetched from /api/members (with resilient fallback to baseline ROSTER_MEMBERS)
  const [teamMembers, setTeamMembers] = useState<TeamMemberEntry[]>(() =>
    ROSTER_MEMBERS.map((m) => ({ ...m, domains: getMemberDomains(m) }))
  );

  useEffect(() => {
    let isMounted = true;
    fetch('/api/members')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.members) && data.members.length > 0) {
          setTeamMembers(data.members);
        }
      })
      .catch((err) => {
        console.warn('SubsystemsTab: Failed to fetch dynamic members:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter members list
  const filteredMembers = useMemo(() => {
    return teamMembers.filter((m) => {
      if (activeTabFilter === 'core' && !m.isCore) return false;
      if (activeTabFilter === 'roles' && !m.isLead && !m.isCore) return false;

      if (memberSearch.trim()) {
        const query = memberSearch.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(query);
        const matchesEmail = m.email.toLowerCase().includes(query);
        const matchesRole = (m.role || '').toLowerCase().includes(query);
        const memberDomains = getMemberDomains(m);
        const matchesSquad = memberDomains.some(
          (d) => d.toLowerCase().includes(query) || (TEAMS[d]?.name || '').toLowerCase().includes(query)
        );
        return matchesName || matchesEmail || matchesRole || matchesSquad;
      }
      return true;
    });
  }, [teamMembers, activeTabFilter, memberSearch]);

  const MEMBERS_PER_PAGE = 7;
  const totalMemberPages = Math.max(1, Math.ceil(filteredMembers.length / MEMBERS_PER_PAGE));
  const paginatedMembers = useMemo(() => {
    const start = (memberPage - 1) * MEMBERS_PER_PAGE;
    return filteredMembers.slice(start, start + MEMBERS_PER_PAGE);
  }, [filteredMembers, memberPage]);

  // Squad metrics
  const squadProgressList = useMemo(() => {
    return TEAMS_LIST.filter((t) => t.id !== 'core').map((team) => {
      const teamTasks = tasks.filter((t) => t.teamId === team.id);
      const completed = teamTasks.filter((t) => t.status === 'done').length;
      const total = teamTasks.length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      const memberCount = teamMembers.filter((m) => getMemberDomains(m).includes(team.id)).length;
      return {
        ...team,
        memberCount,
        pct,
        completed,
        total,
      };
    });
  }, [tasks, teamMembers]);

  return (
    <div className="space-y-6">
      {/* Operations Hero Banner matching Mockup 4 */}
      <OperationsBanner
        subtitle="PROJECT OPERATIONS"
        title="Teams"
        description="Manage team members, roles and squad progress"
        action={
          isCore || isLead
            ? {
                label: "+ Add Member",
                onClick: () => {
                  alert("To register a new squad member, ensure they are added to the official project roster.");
                },
              }
            : undefined
        }
      />

      {/* 4 Stat Cards in a row matching Mockup 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Members"
          value={teamMembers.length}
          iconBg="bg-blue-50 text-blue-600 border-blue-100"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />

        <StatCard
          label="Squads"
          value={TEAMS_LIST.filter((t) => t.id !== 'core').length}
          iconBg="bg-amber-50 text-amber-600 border-amber-100"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          onClick={() => setActiveTabFilter('squads')}
        />

        <StatCard
          label="Core Committee"
          value={teamMembers.filter((m) => m.isCore).length}
          iconBg="bg-purple-50 text-purple-600 border-purple-100"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
          onClick={() => setActiveTabFilter('core')}
        />

        <StatCard
          label="Active Members"
          value={teamMembers.length}
          iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Main 2-Column Content Grid (2/3 Left Directory, 1/3 Right Squad Overview) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Members Directory Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-0">
          {/* Filter Tabs & Search Header Matching Mockup 4 */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Members', count: teamMembers.length },
                { id: 'squads', label: 'Squads', count: TEAMS_LIST.filter((t) => t.id !== 'core').length },
                { id: 'core', label: 'Core Committee', count: teamMembers.filter((m) => m.isCore).length },
                { id: 'roles', label: 'Roles', count: teamMembers.filter((m) => m.isLead || m.isCore).length },
              ].map((tab) => {
                const isActive = activeTabFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTabFilter(tab.id as any);
                      setMemberPage(1);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                      isActive
                        ? 'bg-[#0e131f] text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2.5">
              <div className="relative w-64 lg:w-72">
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => {
                    setMemberSearch(e.target.value);
                    setMemberPage(1);
                  }}
                  placeholder="Search members..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs font-sans text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
                />
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {memberSearch && (
                  <button
                    type="button"
                    onClick={() => setMemberSearch('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label="Clear member search"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* If Squads Tab is active: Show Squad Details Grid */}
          {activeTabFilter === 'squads' ? (
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEAMS_LIST.map((team) => {
                const teamTasks = tasks.filter((t) => t.teamId === team.id);
                const completedCount = teamTasks.filter((t) => t.status === 'done').length;
                const members = teamMembers.filter((m) => getMemberDomains(m).includes(team.id));
                const pct = teamTasks.length > 0 ? Math.round((completedCount / teamTasks.length) * 100) : 0;

                return (
                  <div
                    key={team.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-orange-400 transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${team.badgeBg}`}>
                          {team.code}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{team.name}</h4>
                      </div>
                      <span className="text-xs font-bold text-slate-900">{pct}%</span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2">{team.description}</p>

                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                      <span>{members.length} members</span>
                      <button
                        type="button"
                        onClick={() => handleViewTeamTasksInKanban(team.id)}
                        className="text-orange-600 font-semibold hover:underline"
                      >
                        Tasks ({teamTasks.length}) &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Members Directory Table Matching Mockup 4 */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                    <th className="py-3.5 pl-6 pr-3 w-10">
                      <input
                        type="checkbox"
                        checked={paginatedMembers.length > 0 && paginatedMembers.every((m) => selectedMemberIds.has(m.id))}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMemberIds(new Set([...Array.from(selectedMemberIds), ...paginatedMembers.map((m) => m.id)]));
                          } else {
                            const next = new Set(selectedMemberIds);
                            paginatedMembers.forEach((m) => next.delete(m.id));
                            setSelectedMemberIds(next);
                          }
                        }}
                        className="rounded text-orange-500 focus:ring-orange-500"
                      />
                    </th>
                    <th className="py-3.5 px-3">Member</th>
                    <th className="py-3.5 px-3">Role</th>
                    <th className="py-3.5 px-3">Assigned Squads</th>
                    <th className="py-3.5 px-3">Status</th>
                    <th className="py-3.5 px-3">Joined</th>
                    <th className="py-3.5 pr-6 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-xs">
                  {paginatedMembers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-sans">
                        No team members found matching this filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedMembers.map((member) => {
                      const isChecked = selectedMemberIds.has(member.id);
                      const memberDomains = getMemberDomains(member);

                      // Dynamic role badge styling based on member.role (zero name hardcoding)
                      const roleLower = (member.role || '').toLowerCase();
                      const isCaptain = roleLower.includes('captain') && !roleLower.includes('vice');
                      const isViceCaptain = roleLower.includes('vice captain');
                      const isManager = roleLower.includes('manager');
                      const isLead = member.isLead || roleLower.includes('lead');

                      const roleBadge = isCaptain
                        ? {
                            label: member.role || 'Captain',
                            icon: (
                              <svg className="w-3 h-3 text-amber-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                              </svg>
                            ),
                            class: 'bg-amber-50 text-amber-800 border-amber-300 font-bold',
                          }
                        : isViceCaptain
                        ? {
                            label: member.role || 'Vice Captain',
                            icon: (
                              <svg className="w-3 h-3 text-indigo-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            ),
                            class: 'bg-indigo-50 text-indigo-800 border-indigo-200 font-bold',
                          }
                        : isManager
                        ? {
                            label: member.role || 'Manager',
                            icon: (
                              <svg className="w-3 h-3 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            ),
                            class: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold',
                          }
                        : isLead
                        ? {
                            label: member.role || 'Squad Lead',
                            icon: (
                              <svg className="w-3 h-3 text-sky-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            ),
                            class: 'bg-sky-50 text-sky-700 border-sky-200 font-semibold',
                          }
                        : {
                            label: member.role || 'Team Member',
                            icon: (
                              <svg className="w-3 h-3 text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            ),
                            class: 'bg-slate-50 text-slate-700 border-slate-200',
                          };

                      return (
                        <tr
                          key={member.id}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 pl-6 pr-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const next = new Set(selectedMemberIds);
                                if (e.target.checked) next.add(member.id);
                                else next.delete(member.id);
                                setSelectedMemberIds(next);
                              }}
                              className="rounded text-orange-500 focus:ring-orange-500"
                            />
                          </td>

                          {/* Member Avatar + Name + Email (clean name without brackets) */}
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-3">
                              {member.photoUrl ? (
                                <img
                                  src={member.photoUrl}
                                  alt={member.name}
                                  className="w-8 h-8 rounded-full object-cover shadow-xs shrink-0"
                                />
                              ) : (
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase shadow-xs shrink-0 ${getAvatarColorClass(member.name)}`}>
                                  {getMemberInitials(member.name)}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                                  {member.name}
                                </p>
                                <p className="text-[11px] text-slate-400 truncate">
                                  {member.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3.5 px-3">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] ${roleBadge.class} border`}>
                              <span>{roleBadge.icon}</span>
                              <span>{roleBadge.label}</span>
                            </span>
                          </td>

                          {/* Assigned Squads: All squads displayed equally with zero partiality */}
                          <td className="py-3.5 px-3">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {memberDomains.map((dom) => {
                                const t = TEAMS[dom];
                                return (
                                  <span
                                    key={dom}
                                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80"
                                    title={t?.name || dom}
                                  >
                                    {t?.name || dom}
                                  </span>
                                );
                              })}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Active</span>
                            </span>
                          </td>

                          {/* Joined Date */}
                          <td className="py-3.5 px-3 text-slate-500 whitespace-nowrap">
                            Sep 15, 2026
                          </td>

                          {/* Action */}
                          <td className="py-3.5 pr-6 pl-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleViewTeamTasksInKanban(memberDomains[0] || 'core')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                              title="View Squad Tasks"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {activeTabFilter !== 'squads' && (
            <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-sans">
              <span>Showing 1–{paginatedMembers.length} of {filteredMembers.length} members</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setMemberPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  &lt;
                </button>
                {Array.from({ length: totalMemberPages }, (_, i) => i + 1).slice(0, 7).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setMemberPage(pg)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      memberPage === pg
                        ? 'bg-[#0e131f] text-white shadow-xs'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setMemberPage((p) => Math.min(totalMemberPages, p + 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Squad Overview Card Matching Mockup 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <svg className="w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Squad Overview
            </h3>
          </div>

          {/* List of Squads with Progress Bars */}
          <div className="space-y-4 pt-1">
            {squadProgressList.slice(0, 6).map((squad) => (
              <div
                key={squad.id}
                onClick={() => handleViewTeamTasksInKanban(squad.id)}
                className="space-y-1.5 hover:bg-slate-50 p-2 rounded-xl transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 group-hover:text-orange-600 transition-colors">
                    {squad.shortName}
                  </span>
                  <span className="font-bold text-slate-900">{squad.pct}%</span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>{squad.memberCount} members</span>
                  <span>{squad.completed}/{squad.total} tasks</span>
                </div>

                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${squad.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
