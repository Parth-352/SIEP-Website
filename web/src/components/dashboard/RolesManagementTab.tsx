"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { TEAMS, TEAMS_LIST } from '@/lib/teams';
import { TeamMemberEntry, isParthMasterAdmin, ROSTER_MEMBERS, getMemberDomains, getMemberLeadDomains } from '@/lib/members';
import { TeamId, UserProfile } from '@/lib/types';
import OperationsBanner from './OperationsBanner';
import StatCard from './StatCard';

interface RolesManagementTabProps {
  user: UserProfile | null;
  isCore: boolean;
  isLead: boolean;
}

const PRESET_ROLES = [
  { title: 'Core Lead & Captain', tier: 1, isCore: true, isLead: true },
  { title: 'Vice Captain', tier: 1, isCore: true, isLead: true },
  { title: 'Core Member', tier: 1, isCore: true, isLead: false },
  { title: 'Domain Lead', tier: 2, isCore: false, isLead: true },
  { title: 'Lead Engineer', tier: 2, isCore: false, isLead: true },
  { title: 'Team Member', tier: 3, isCore: false, isLead: false },
  { title: 'Research Specialist', tier: 3, isCore: false, isLead: false },
  { title: 'Design Engineer', tier: 3, isCore: false, isLead: false },
];

export default function RolesManagementTab({ user }: RolesManagementTabProps) {
  const isAuthorized = isParthMasterAdmin(user?.email);

  // Initialize with baseline roster so table is NEVER empty
  const [members, setMembers] = useState<TeamMemberEntry[]>(() =>
    ROSTER_MEMBERS.map((m) => ({ ...m, domains: getMemberDomains(m) }))
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filterTab, setFilterTab] = useState<'all' | 'captain' | 'leads' | 'members'>('all');
  const [squadFilter, setSquadFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Password visibility map (memberId -> boolean)
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Modals state
  const [editingMember, setEditingMember] = useState<TeamMemberEntry | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [revokingMember, setRevokingMember] = useState<TeamMemberEntry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Form states for Edit / Add
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formRole, setFormRole] = useState<string>('');
  const [formDomains, setFormDomains] = useState<TeamId[]>([]);
  const [formLeadDomains, setFormLeadDomains] = useState<TeamId[]>([]);
  const [formPassword, setFormPassword] = useState<string>('');
  const [formPhotoUrl, setFormPhotoUrl] = useState<string>('');
  const [formRemovePhoto, setFormRemovePhoto] = useState<boolean>(false);
  const [formIsLead, setFormIsLead] = useState<boolean>(false);
  const [formIsCore, setFormIsCore] = useState<boolean>(false);
  const [formTier, setFormTier] = useState<1 | 2 | 3>(3);
  const [showModalPassword, setShowModalPassword] = useState<boolean>(false);

  // Fetch team members from API
  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/roles');
      const data = await res.json();
      if (data.success && Array.isArray(data.members) && data.members.length > 0) {
        setMembers(data.members);
      }
    } catch (err) {
      console.warn('Error loading members in Roles tab:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      loadMembers();
    }
  }, [isAuthorized]);

  // Toggle password visibility for table row
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Open Edit Modal
  const openEditModal = (member: TeamMemberEntry) => {
    const memberDomains = getMemberDomains(member);
    const memberLeadDomains = getMemberLeadDomains(member);
    setEditingMember(member);
    setFormName(member.name || '');
    setFormEmail(member.email || '');
    setFormRole(member.role || 'Team Member');
    setFormDomains(memberDomains);
    setFormLeadDomains(memberLeadDomains);
    setFormPassword(member.password || '935200');
    setFormPhotoUrl(member.photoUrl || '');
    setFormRemovePhoto(false);
    setFormIsLead(memberLeadDomains.length > 0 || Boolean(member.isLead));
    setFormIsCore(Boolean(member.isCore));
    setFormTier(member.tier || (member.isCore ? 1 : member.isLead ? 2 : 3));
    setShowModalPassword(false);
    setActionError(null);
  };

  // Open Add Modal
  const openAddModal = () => {
    setIsAddModalOpen(true);
    setFormName('');
    setFormEmail('');
    setFormRole('Team Member');
    setFormDomains(['software']);
    setFormLeadDomains([]);
    setFormPassword('935200');
    setFormPhotoUrl('');
    setFormRemovePhoto(false);
    setFormIsLead(false);
    setFormIsCore(false);
    setFormTier(3);
    setShowModalPassword(false);
    setActionError(null);
  };

  // Toggle domain in multi-select (100% equal standing, zero partiality)
  const toggleDomain = (tid: TeamId) => {
    setFormDomains((prev) => {
      if (prev.includes(tid)) {
        if (prev.length === 1) return prev; // Keep at least 1 domain
        const next = prev.filter((d) => d !== tid);
        setFormLeadDomains((leadPrev) => leadPrev.filter((d) => d !== tid));
        return next;
      } else {
        return [...prev, tid];
      }
    });
  };

  // Handle Photo File Upload in Modal
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setActionError('Photo file must be under 2 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setFormPhotoUrl(reader.result);
          setFormRemovePhoto(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Edit Member
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    try {
      setIsSubmitting(true);
      setActionError(null);

      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_member',
          memberId: editingMember.id,
          email: editingMember.email,
          name: formName.trim(),
          role: formRole.trim(),
          domains: formDomains,
          leadDomains: formLeadDomains,
          password: formPassword.trim() || undefined,
          photoUrl: formRemovePhoto ? '' : formPhotoUrl.trim(),
          removePhoto: formRemovePhoto,
          isLead: formLeadDomains.length > 0 || formIsLead,
          isCore: formIsCore,
          tier: formTier,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to update member role.');
      }

      setMembers((prev) =>
        prev.map((m) => (m.id === editingMember.id ? data.member : m))
      );
      setEditingMember(null);
      setActionSuccess(`Updated permissions, password, and domains for ${formName}`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Add Member
  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      setActionError('Name and email are required.');
      return;
    }
    try {
      setIsSubmitting(true);
      setActionError(null);
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_member',
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          role: formRole.trim(),
          domains: formDomains,
          leadDomains: formLeadDomains,
          password: formPassword.trim() || '935200',
          photoUrl: formPhotoUrl.trim(),
          isLead: formLeadDomains.length > 0 || formIsLead,
          isCore: formIsCore,
          tier: formTier,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to add member.');
      }
      setMembers((prev) => [data.member, ...prev]);
      setIsAddModalOpen(false);
      setActionSuccess(`Added ${formName} to team roster.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Action: Assign Captain
  const handleQuickAssignCaptain = async (member: TeamMemberEntry) => {
    if (!confirm(`Promote ${member.name} to Team Captain?`)) return;
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_captain',
          memberId: member.id,
          email: member.email,
          roleTitle: 'Core Lead & Captain',
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setMembers((prev) => prev.map((m) => (m.id === member.id ? data.member : m)));
      setActionSuccess(`Promoted ${member.name} to Team Captain!`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Action: Assign Vice Captain
  const handleQuickAssignViceCaptain = async (member: TeamMemberEntry) => {
    if (!confirm(`Promote ${member.name} to Vice Captain?`)) return;
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_vice_captain',
          memberId: member.id,
          email: member.email,
          roleTitle: 'Vice Captain',
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setMembers((prev) => prev.map((m) => (m.id === member.id ? data.member : m)));
      setActionSuccess(`Promoted ${member.name} to Vice Captain!`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Execute Revoke Permissions
  const handleConfirmRevoke = async () => {
    if (!revokingMember) return;
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revoke_permissions',
          memberId: revokingMember.id,
          email: revokingMember.email,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setMembers((prev) => prev.map((m) => (m.id === revokingMember.id ? data.member : m)));
      setRevokingMember(null);
      setActionSuccess(`Revoked administrative permissions for ${revokingMember.name}.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Member
  const handleDeleteMember = async (member: TeamMemberEntry) => {
    if (!confirm(`Permanently remove ${member.name} from the team directory?`)) return;
    try {
      setIsSubmitting(true);
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_member',
          memberId: member.id,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      setActionSuccess(`Removed ${member.name} from roster.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const memberDomains = getMemberDomains(m);

      // Tab filter
      if (filterTab === 'captain') {
        const lower = (m.role || '').toLowerCase();
        if (!lower.includes('captain') && !lower.includes('vice') && !m.isCore) return false;
      } else if (filterTab === 'leads') {
        const leadDomains = getMemberLeadDomains(m);
        const leadsAny = leadDomains.length > 0 || m.isLead;
        if (!leadsAny) return false;
      } else if (filterTab === 'members') {
        const leadDomains = getMemberLeadDomains(m);
        if (m.isLead || m.isCore || leadDomains.length > 0) return false;
      }

      // Squad filter (matches any of the member's assigned domains)
      if (squadFilter !== 'all' && !memberDomains.includes(squadFilter as TeamId)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = (m.name || '').toLowerCase().includes(q);
        const emailMatch = (m.email || '').toLowerCase().includes(q);
        const roleMatch = (m.role || '').toLowerCase().includes(q);
        const domainMatch = memberDomains.some((d) => d.toLowerCase().includes(q));
        if (!nameMatch && !emailMatch && !roleMatch && !domainMatch) return false;
      }

      return true;
    });
  }, [members, filterTab, squadFilter, searchQuery]);

  // Metrics
  const totalCount = members.length;
  const captainAndCoreCount = members.filter((m) => m.isCore || m.role?.toLowerCase().includes('captain')).length;
  const domainLeadsCount = members.filter((m) => getMemberLeadDomains(m).length > 0 || m.isLead).length;
  const activeSquadsCount = new Set(members.flatMap((m) => getMemberDomains(m))).size;

  // Key Leaders
  const currentCaptain = members.find((m) => m.role?.toLowerCase().includes('captain') && !m.role?.toLowerCase().includes('vice'));
  const currentViceCaptain = members.find((m) => m.role?.toLowerCase().includes('vice'));

  // Pagination
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageMembers = filteredMembers.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // If user is not authorized, block access completely
  if (!isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mb-6 shadow-sm">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
          Master Role Authority Restricted
        </h2>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
          This console is cryptographically restricted to Executive Command (<span className="font-semibold text-slate-900">parthkshirsagrr@gmail.com</span>) for team governance, role assignment, and permission revocation.
        </p>
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = '/dashboard?tab=dashboard';
            }
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0e131f] text-white font-bold text-xs uppercase tracking-wider hover:bg-orange transition-all cursor-pointer shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Return to Dashboard</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn font-sans">
      {/* 1. Hero Operations Banner */}
      <OperationsBanner
        subtitle="EXECUTIVE COMMAND"
        title="Role & Team Authority"
        description="Exclusive master governance console: assign Captain, Vice Captain, domain leads, passwords, and permissions."
        action={{
          label: "+ Add Member",
          onClick: openAddModal,
        }}
      />

      {/* Action Toast Notification */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between shadow-xs animate-slideDown">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span>{actionSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-emerald-600 hover:text-emerald-900 cursor-pointer text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Stat Cards (4 Uniform Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Members"
          value={totalCount}
          icon={
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
          iconBg="bg-blue-50 border border-blue-100"
        />
        <StatCard
          label="Executive Leadership"
          value={captainAndCoreCount}
          icon={
            <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
          iconBg="bg-purple-50 border border-purple-100"
        />
        <StatCard
          label="Domain Leads"
          value={domainLeadsCount}
          icon={
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
          iconBg="bg-amber-50 border border-amber-100"
        />
        <StatCard
          label="Active Squads"
          value={activeSquadsCount}
          icon={
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          iconBg="bg-emerald-50 border border-emerald-100"
        />
      </div>

      {/* 3. Main Workspace: 2 Columns (8 Cols Table / 4 Cols Side Panels) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Standalone Filter Bar + Roster Table */}
        <div className="lg:col-span-8 space-y-4">
          {/* Standalone Filter Card */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-2xs space-y-3">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
              {[
                { id: 'all', label: 'All Members', count: members.length },
                { id: 'captain', label: 'Leadership', count: captainAndCoreCount },
                { id: 'leads', label: 'Domain Leads', count: domainLeadsCount },
                { id: 'members', label: 'Team Members', count: members.filter((m) => !m.isLead && !m.isCore).length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setFilterTab(tab.id as any);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    filterTab === tab.id
                      ? 'bg-[#0e131f] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      filterTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search Input & Squad Selector */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-slate-100">
              <div className="relative flex-1 w-full">
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by name, role, email, domain..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-0.5 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Squad Selector */}
              <div className="w-full sm:w-auto shrink-0">
                <select
                  value={squadFilter}
                  onChange={(e) => {
                    setSquadFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange cursor-pointer"
                >
                  <option value="all">All Domains ({TEAMS_LIST.length})</option>
                  {TEAMS_LIST.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3.5 pl-4">Member Name</th>
                    <th className="py-3 px-3">Role &amp; Title</th>
                    <th className="py-3 px-3">Assigned Domains</th>
                    <th className="py-3 px-3">PIN / Password</th>
                    <th className="py-3 px-3.5 pr-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <svg className="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-sm font-bold text-slate-800">No members match your criteria</p>
                        <p className="text-xs text-slate-500 mt-1">Try resetting your filters or search keywords.</p>
                      </td>
                    </tr>
                  ) : (
                    pageMembers.map((member) => {
                      const isCaptain = member.role?.toLowerCase().includes('captain') && !member.role?.toLowerCase().includes('vice');
                      const isViceCaptain = member.role?.toLowerCase().includes('vice');
                      const memberDomains = getMemberDomains(member);
                      const isPassVisible = Boolean(visiblePasswords[member.id]);

                      return (
                        <tr key={member.id} className="hover:bg-slate-50/70 transition-colors group">
                          {/* Member: [DOMAIN] [DOMAIN] Full Name + Photo */}
                          <td className="py-3 px-3.5 pl-4">
                            <div className="flex items-center gap-2.5">
                              {/* Avatar / Photo */}
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 text-white overflow-hidden ${
                                  isCaptain
                                    ? 'bg-gradient-to-br from-amber-500 to-orange shadow-xs ring-2 ring-amber-300'
                                    : isViceCaptain
                                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xs ring-2 ring-indigo-200'
                                    : member.isCore
                                    ? 'bg-gradient-to-br from-purple-600 to-pink-600 shadow-xs'
                                    : member.isLead
                                    ? 'bg-gradient-to-br from-amber-600 to-orange shadow-xs'
                                    : 'bg-slate-700'
                                }`}
                              >
                                {member.photoUrl ? (
                                  <img
                                    src={member.photoUrl}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  member.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .slice(0, 2)
                                    .toUpperCase()
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate">
                                  {member.name}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">{member.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-3 px-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                isCaptain
                                  ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-2xs font-black'
                                  : isViceCaptain
                                  ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                                  : member.isCore
                                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                                  : member.isLead
                                  ? 'bg-orange-50 text-orange-800 border-orange-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {member.role || 'Team Member'}
                            </span>
                          </td>

                          {/* Assigned Domains: Highlight lead domain(s) for instant visibility */}
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap items-center gap-1">
                              {(() => {
                                const memberLeadDomains = getMemberLeadDomains(member);
                                return memberDomains.map((dom) => {
                                  const tInfo = TEAMS[dom];
                                  const isLeadingThis = memberLeadDomains.includes(dom);
                                  return (
                                    <span
                                      key={dom}
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase shadow-2xs transition-all ${
                                        isLeadingThis
                                          ? 'text-amber-950 bg-gradient-to-r from-amber-300 to-amber-400 ring-2 ring-amber-500/80 font-black shadow-amber-500/20 shadow-xs'
                                          : 'text-white'
                                      }`}
                                      style={!isLeadingThis ? { backgroundColor: tInfo?.color || '#2B303A' } : undefined}
                                      title={isLeadingThis ? `Domain Lead: ${tInfo?.name || dom}` : `Member: ${tInfo?.name || dom}`}
                                    >
                                      {isLeadingThis && (
                                        <svg className="w-2.5 h-2.5 text-amber-950 shrink-0 fill-current" viewBox="0 0 24 24">
                                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                      )}
                                      <span>{tInfo?.code || dom.toUpperCase()}</span>
                                    </span>
                                  );
                                });
                              })()}
                            </div>
                          </td>

                          {/* PIN / Password with Eye Toggle */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5 font-mono text-xs">
                              <span className="text-slate-800 font-semibold tracking-wider">
                                {isPassVisible ? member.password || '935200' : '••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(member.id)}
                                title={isPassVisible ? 'Hide PIN' : 'Reveal PIN'}
                                className="w-5 h-5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                {isPassVisible ? (
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                  </svg>
                                ) : (
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                          </td>

                          {/* Actions: Edit, Promote, Revoke, Delete */}
                          <td className="py-3 px-3.5 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* Quick Captain Button */}
                              {!isCaptain && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickAssignCaptain(member)}
                                  title="Promote to Team Captain"
                                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-700 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                  </svg>
                                </button>
                              )}

                              {/* Quick Vice Captain Button */}
                              {!isViceCaptain && (
                                <button
                                  type="button"
                                  onClick={() => handleQuickAssignViceCaptain(member)}
                                  title="Promote to Vice Captain"
                                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-700 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                </button>
                              )}

                              {/* Full Edit Modal Button */}
                              <button
                                type="button"
                                onClick={() => openEditModal(member)}
                                title="Edit Details, Password & Photo"
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>

                              {/* Revoke Permissions Button */}
                              {(member.isLead || member.isCore) && (
                                <button
                                  type="button"
                                  onClick={() => setRevokingMember(member)}
                                  title="Revoke Lead / Core Permissions"
                                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-amber-100 text-slate-500 hover:text-amber-800 flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                </button>
                              )}

                              {/* Delete Member Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteMember(member)}
                                title="Remove from Roster"
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-700 flex items-center justify-center transition-colors cursor-pointer"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {startIdx + 1}–{Math.min(filteredMembers.length, startIdx + ITEMS_PER_PAGE)} of{' '}
                  {filteredMembers.length} members
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setCurrentPage(pg)}
                      className={`w-7 h-7 rounded-lg font-bold text-xs cursor-pointer ${
                        currentPage === pg ? 'bg-[#0e131f] text-white shadow-2xs' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Command Summary + Authority Cards */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Executive Command Roster */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Executive Command
                </h3>
                <p className="text-[11px] text-slate-500">Official leadership appointments</p>
              </div>
            </div>

            {/* Captain Tile */}
            <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
                  Team Captain
                </span>
                {currentCaptain && (
                  <div className="flex gap-1">
                    {getMemberDomains(currentCaptain).map((d) => (
                      <span key={d} className="text-[9px] font-mono text-amber-800 bg-amber-200/50 px-1 py-0.2 rounded">
                        {TEAMS[d]?.code || d.toUpperCase().slice(0, 4)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm font-bold text-slate-900">
                {currentCaptain ? currentCaptain.name : 'Unassigned'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {currentCaptain ? currentCaptain.email : 'Click promote to assign Captain'}
              </p>
            </div>

            {/* Vice Captain Tile */}
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 bg-indigo-200/60 px-2 py-0.5 rounded-full">
                  Vice Captain
                </span>
                {currentViceCaptain && (
                  <div className="flex gap-1">
                    {getMemberDomains(currentViceCaptain).map((d) => (
                      <span key={d} className="text-[9px] font-mono text-indigo-800 bg-indigo-200/50 px-1 py-0.2 rounded">
                        {TEAMS[d]?.code || d.toUpperCase().slice(0, 4)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-sm font-bold text-slate-900">
                {currentViceCaptain ? currentViceCaptain.name : 'Unassigned'}
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                {currentViceCaptain ? currentViceCaptain.email : 'Click promote to assign Vice Captain'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL 1: EDIT MEMBER ROLE, DOMAINS, PASSWORD & PFP ================= */}
      {editingMember && (
        <div className="fixed inset-0 z-[300] bg-jet-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto hide-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange/10 border border-orange/25 flex items-center justify-center text-orange font-bold text-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Member Profile &amp; Access</h3>
                  <p className="text-xs text-slate-500">{editingMember.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingMember(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Profile Picture Section */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 border-2 border-slate-300 flex items-center justify-center shrink-0">
                    {!formRemovePhoto && formPhotoUrl ? (
                      <img src={formPhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-slate-500 text-sm">
                        {formName
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs">
                        Upload New Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoFileChange}
                          className="hidden"
                        />
                      </label>
                      {(!formRemovePhoto && (formPhotoUrl || editingMember.photoUrl)) && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormRemovePhoto(true);
                            setFormPhotoUrl('');
                          }}
                          className="px-3 py-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                      {formRemovePhoto && (
                        <span className="text-[11px] text-rose-600 font-semibold">
                          Photo will be removed on Save
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Password / PIN Section */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                    Member PIN / Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowModalPassword((prev) => !prev)}
                    className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
                  >
                    {showModalPassword ? 'Hide PIN' : 'Reveal PIN'}
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showModalPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="Enter 6-digit numeric PIN"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
                  />
                </div>
                <p className="text-[10px] text-amber-800/80">
                  Default PIN is 935200. Changing this updates their login credentials immediately.
                </p>
              </div>

              {/* Name & Official Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Official Role Title</label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
                  />
                </div>
              </div>

              {/* Role Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Quick Role Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_ROLES.map((pr) => (
                    <button
                      key={pr.title}
                      type="button"
                      onClick={() => {
                        setFormRole(pr.title);
                        setFormTier(pr.tier as 1 | 2 | 3);
                        setFormIsCore(pr.isCore);
                        setFormIsLead(pr.isLead);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                        formRole === pr.title
                          ? 'bg-orange text-white border-orange shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200/80'
                      }`}
                    >
                      {pr.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Domain Assignments: 100% Equal Standing, Zero Partiality */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">
                    Assigned Domains ({formDomains.length} selected)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    All domains are equal (no primary vs secondary)
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TEAMS_LIST.map((t) => {
                    const isSelected = formDomains.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleDomain(t.id)}
                        className={`p-2 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#0e131f] text-white border-[#0e131f] shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{t.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {t.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Domain Leadership Assignment: Works for Captain, Vice Captain, or any member */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-amber-600 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    Domain Leadership ({formLeadDomains.length} Designated)
                  </label>
                  <span className="text-[10px] text-amber-800 font-semibold">
                    Works for Captain, Vice Captain &amp; Leads
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Select which specific domain(s) this member leads. In domain views, they will appear as Lead; other members will appear as Team Members.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formDomains.map((dom) => {
                    const isLeadOfDom = formLeadDomains.includes(dom);
                    const tInfo = TEAMS[dom];
                    return (
                      <button
                        key={dom}
                        type="button"
                        onClick={() => {
                          setFormLeadDomains((prev) => {
                            const next = prev.includes(dom) ? prev.filter((d) => d !== dom) : [...prev, dom];
                            if (next.length > 0) setFormIsLead(true);
                            return next;
                          });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isLeadOfDom
                            ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs font-black'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isLeadOfDom ? (
                          <svg className="w-3 h-3 text-slate-900 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300" />
                        )}
                        <span>{tInfo?.name || dom}</span>
                        <span className="text-[9px] uppercase font-mono opacity-80">[{tInfo?.code || dom}]</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Master Governance Checkboxes */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Permissions &amp; Authority Flags
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsCore}
                      onChange={(e) => {
                        setFormIsCore(e.target.checked);
                        if (e.target.checked) setFormTier(1);
                      }}
                      className="w-4 h-4 rounded text-orange focus:ring-orange border-slate-300"
                    />
                    <span className="font-bold text-slate-800">Core Admin Authority</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsLead}
                      onChange={(e) => {
                        setFormIsLead(e.target.checked);
                        if (e.target.checked && !formIsCore) setFormTier(2);
                      }}
                      className="w-4 h-4 rounded text-orange focus:ring-orange border-slate-300"
                    />
                    <span className="font-bold text-slate-800">Domain Lead Authority</span>
                  </label>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-orange hover:bg-amber-600 text-white font-bold cursor-pointer transition-all shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Changes...' : 'Save Permissions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: ADD NEW MEMBER ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[300] bg-jet-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto hide-scrollbar">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange/10 border border-orange/25 flex items-center justify-center text-orange font-bold text-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Team Member</h3>
                  <p className="text-xs text-slate-500">Assign role, password, and domains</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {actionError}
              </div>
            )}

            <form onSubmit={handleSaveAdd} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Personal Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul.sharma@gmail.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Official Role Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design Specialist"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Initial PIN / Password</label>
                  <input
                    type="text"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder="935200"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
                  />
                </div>
              </div>

              {/* Domain Multi-Select */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">
                  Assigned Domains ({formDomains.length} selected)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TEAMS_LIST.map((t) => {
                    const isSelected = formDomains.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleDomain(t.id)}
                        className={`p-2 rounded-xl border text-left font-bold text-xs transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#0e131f] text-white border-[#0e131f] shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{t.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {t.code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Domain Leadership Assignment: Works for Captain, Vice Captain, or any member */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-amber-600 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    Domain Leadership ({formLeadDomains.length} Designated)
                  </label>
                  <span className="text-[10px] text-amber-800 font-semibold">
                    Works for Captain, Vice Captain &amp; Leads
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  Select which specific domain(s) this member leads. In domain views, they will appear as Lead; other members will appear as Team Members.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formDomains.map((dom) => {
                    const isLeadOfDom = formLeadDomains.includes(dom);
                    const tInfo = TEAMS[dom];
                    return (
                      <button
                        key={dom}
                        type="button"
                        onClick={() => {
                          setFormLeadDomains((prev) => {
                            const next = prev.includes(dom) ? prev.filter((d) => d !== dom) : [...prev, dom];
                            if (next.length > 0) setFormIsLead(true);
                            return next;
                          });
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border ${
                          isLeadOfDom
                            ? 'bg-amber-400 text-slate-900 border-amber-500 shadow-xs font-black'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isLeadOfDom ? (
                          <svg className="w-3 h-3 text-slate-900 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-300" />
                        )}
                        <span>{tInfo?.name || dom}</span>
                        <span className="text-[9px] uppercase font-mono opacity-80">[{tInfo?.code || dom}]</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Master Governance Checkboxes */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Permissions &amp; Authority Flags
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsCore}
                      onChange={(e) => {
                        setFormIsCore(e.target.checked);
                        if (e.target.checked) setFormTier(1);
                      }}
                      className="w-4 h-4 rounded text-orange focus:ring-orange border-slate-300"
                    />
                    <span className="font-bold text-slate-800">Core Admin Authority</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formIsLead}
                      onChange={(e) => {
                        setFormIsLead(e.target.checked);
                        if (e.target.checked && !formIsCore) setFormTier(2);
                      }}
                      className="w-4 h-4 rounded text-orange focus:ring-orange border-slate-300"
                    />
                    <span className="font-bold text-slate-800">Domain Lead Authority</span>
                  </label>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-orange hover:bg-amber-600 text-white font-bold cursor-pointer transition-all shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Adding Member...' : 'Add to Roster'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: REVOKE PERMISSIONS CONFIRMATION ================= */}
      {revokingMember && (
        <div className="fixed inset-0 z-[300] bg-jet-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">
                Revoke Leadership Authority?
              </h3>
              <p className="text-xs text-slate-600">
                Are you sure you want to revoke Lead and Core administrative permissions for{' '}
                <span className="font-bold text-slate-900">{revokingMember.name}</span>?
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                They will be reverted to standard <strong>Team Member</strong> and will lose administrative approval and review rights.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRevokingMember(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmRevoke}
                className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Revoking...' : 'Confirm Revocation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
