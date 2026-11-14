import React from 'react';
import { TeamMemberEntry, getMemberDomains, getMemberLeadDomains } from '@/lib/members';
import { TEAMS } from '@/lib/teams';

interface RolesTableProps {
  pageMembers: TeamMemberEntry[];
  visiblePasswords: Record<string, boolean>;
  togglePasswordVisibility: (id: string) => void;
  onQuickAssignCaptain: (member: TeamMemberEntry) => void;
  onQuickAssignViceCaptain: (member: TeamMemberEntry) => void;
  onEditMember: (member: TeamMemberEntry) => void;
  onRevokeMember: (member: TeamMemberEntry) => void;
  onDeleteMember: (member: TeamMemberEntry) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalFilteredMembers: number;
  itemsPerPage: number;
}

export default function RolesTable({
  pageMembers,
  visiblePasswords,
  togglePasswordVisibility,
  onQuickAssignCaptain,
  onQuickAssignViceCaptain,
  onEditMember,
  onRevokeMember,
  onDeleteMember,
  currentPage,
  totalPages,
  setCurrentPage,
  totalFilteredMembers,
  itemsPerPage,
}: RolesTableProps) {
  const startIdx = (currentPage - 1) * itemsPerPage;

  return (
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
                const isCaptain =
                  member.role?.toLowerCase().includes('captain') &&
                  !member.role?.toLowerCase().includes('vice');
                const isViceCaptain = member.role?.toLowerCase().includes('vice');
                const memberDomains = getMemberDomains(member);
                const isPassVisible = Boolean(visiblePasswords[member.id]);

                return (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Member Avatar + Name */}
                    <td className="py-3 px-3.5 pl-4">
                      <div className="flex items-center gap-2.5">
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
                          <p className="font-bold text-slate-900 truncate">{member.name}</p>
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

                    {/* Assigned Domains */}
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

                    {/* Actions */}
                    <td className="py-3 px-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Captain Button */}
                        {!isCaptain && (
                          <button
                            type="button"
                            onClick={() => onQuickAssignCaptain(member)}
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
                            onClick={() => onQuickAssignViceCaptain(member)}
                            title="Promote to Vice Captain"
                            className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-500 hover:text-indigo-700 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </button>
                        )}

                        {/* Edit Modal Button */}
                        <button
                          type="button"
                          onClick={() => onEditMember(member)}
                          title="Edit Roles, Domains, Password & PFP"
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
                            onClick={() => onRevokeMember(member)}
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
                          onClick={() => onDeleteMember(member)}
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
            Showing {startIdx + 1}–{Math.min(totalFilteredMembers, startIdx + itemsPerPage)} of{' '}
            {totalFilteredMembers} members
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
  );
}
