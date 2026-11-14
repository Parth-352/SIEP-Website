"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  TeamMemberEntry,
  isParthMasterAdmin,
  ROSTER_MEMBERS,
  getMemberDomains,
  getMemberLeadDomains,
} from '@/lib/members';
import { TeamId } from '@/lib/types';
import OperationsBanner from './OperationsBanner';

import { RolesManagementTabProps } from './roles/rolesConfig';
import RolesStatCards from './roles/RolesStatCards';
import RolesFilterBar from './roles/RolesFilterBar';
import RolesTable from './roles/RolesTable';
import ExecutiveCommandSidebar from './roles/ExecutiveCommandSidebar';
import EditMemberModal from './roles/EditMemberModal';
import AddMemberModal from './roles/AddMemberModal';
import RevokeMemberModal from './roles/RevokeMemberModal';

export default function RolesManagementTab({ user }: RolesManagementTabProps) {
  const isAuthorized = isParthMasterAdmin(user?.email);

  // Initialize with baseline roster so table is NEVER empty
  const [members, setMembers] = useState<TeamMemberEntry[]>(() =>
    ROSTER_MEMBERS.map((m) => ({ ...m, domains: getMemberDomains(m) }))
  );
  const [, setIsLoading] = useState<boolean>(true);
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
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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

  // Quick Action: Assign Captain
  const handleQuickAssignCaptain = async (member: TeamMemberEntry) => {
    if (!confirm(`Promote ${member.name} to Team Captain?`)) return;
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_captain',
          memberId: member.id,
          email: member.email,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setMembers((prev) =>
        prev.map((m) => {
          if (m.id === member.id) {
            return {
              ...m,
              role: 'Team Captain & Project Lead',
              isCore: true,
              isLead: true,
              tier: 1,
            };
          }
          if (m.role?.toLowerCase().includes('captain') && !m.role?.toLowerCase().includes('vice')) {
            return {
              ...m,
              role: 'Core Member',
            };
          }
          return m;
        })
      );
      setActionSuccess(`Appointed ${member.name} as Team Captain.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  // Quick Action: Assign Vice Captain
  const handleQuickAssignViceCaptain = async (member: TeamMemberEntry) => {
    if (!confirm(`Promote ${member.name} to Vice Captain?`)) return;
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'assign_vice_captain',
          memberId: member.id,
          email: member.email,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      setMembers((prev) =>
        prev.map((m) => {
          if (m.id === member.id) {
            return {
              ...m,
              role: 'Vice Captain',
              isCore: true,
              isLead: true,
              tier: 1,
            };
          }
          if (m.role?.toLowerCase().includes('vice')) {
            return {
              ...m,
              role: 'Core Member',
            };
          }
          return m;
        })
      );
      setActionSuccess(`Appointed ${member.name} as Vice Captain.`);
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  // Delete Member from Roster
  const handleDeleteMember = async (member: TeamMemberEntry) => {
    if (!confirm(`Are you sure you want to permanently remove ${member.name} from the team roster?`)) return;
    try {
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

      // Squad filter
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
  const currentCaptain = members.find(
    (m) => m.role?.toLowerCase().includes('captain') && !m.role?.toLowerCase().includes('vice')
  );
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
          label: '+ Add Member',
          onClick: () => setIsAddModalOpen(true),
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
      <RolesStatCards
        totalCount={totalCount}
        captainAndCoreCount={captainAndCoreCount}
        domainLeadsCount={domainLeadsCount}
        activeSquadsCount={activeSquadsCount}
      />

      {/* 3. Main Workspace: 2 Columns (8 Cols Table / 4 Cols Side Panels) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Standalone Filter Bar + Roster Table */}
        <div className="lg:col-span-8 space-y-4">
          <RolesFilterBar
            filterTab={filterTab}
            setFilterTab={setFilterTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            squadFilter={squadFilter}
            setSquadFilter={setSquadFilter}
            totalMembers={members.length}
            captainAndCoreCount={captainAndCoreCount}
            domainLeadsCount={domainLeadsCount}
            regularMembersCount={members.filter((m) => !m.isLead && !m.isCore).length}
            onPageReset={() => setCurrentPage(1)}
          />

          <RolesTable
            pageMembers={pageMembers}
            visiblePasswords={visiblePasswords}
            togglePasswordVisibility={togglePasswordVisibility}
            onQuickAssignCaptain={handleQuickAssignCaptain}
            onQuickAssignViceCaptain={handleQuickAssignViceCaptain}
            onEditMember={(m) => setEditingMember(m)}
            onRevokeMember={(m) => setRevokingMember(m)}
            onDeleteMember={handleDeleteMember}
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            totalFilteredMembers={filteredMembers.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>

        {/* Right Column (4 cols): Command Summary + Authority Cards */}
        <ExecutiveCommandSidebar
          currentCaptain={currentCaptain}
          currentViceCaptain={currentViceCaptain}
        />
      </div>

      {/* Modals */}
      <EditMemberModal
        editingMember={editingMember}
        onClose={() => setEditingMember(null)}
        onMemberUpdated={(updated) => {
          setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
          setActionSuccess(`Updated permissions, password, and domains for ${updated.name}`);
          setTimeout(() => setActionSuccess(null), 4000);
        }}
      />

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onMemberAdded={(newMember) => {
          setMembers((prev) => [newMember, ...prev]);
          setActionSuccess(`Added ${newMember.name} to team roster.`);
          setTimeout(() => setActionSuccess(null), 4000);
        }}
      />

      <RevokeMemberModal
        revokingMember={revokingMember}
        onClose={() => setRevokingMember(null)}
        onMemberRevoked={(updated) => {
          setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
          setActionSuccess(`Revoked leadership permissions for ${updated.name}.`);
          setTimeout(() => setActionSuccess(null), 4000);
        }}
      />
    </div>
  );
}
