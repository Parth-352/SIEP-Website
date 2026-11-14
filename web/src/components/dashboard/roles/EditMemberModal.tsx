import React, { useState, useEffect } from 'react';
import { TeamMemberEntry, getMemberDomains, getMemberLeadDomains } from '@/lib/members';
import { TeamId } from '@/lib/types';
import { TEAMS, TEAMS_LIST } from '@/lib/teams';
import { PRESET_ROLES } from './rolesConfig';

interface EditMemberModalProps {
  editingMember: TeamMemberEntry | null;
  onClose: () => void;
  onMemberUpdated: (updatedMember: TeamMemberEntry) => void;
}

export default function EditMemberModal({
  editingMember,
  onClose,
  onMemberUpdated,
}: EditMemberModalProps) {
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (editingMember) {
      const memberDomains = getMemberDomains(editingMember);
      const memberLeadDomains = getMemberLeadDomains(editingMember);
      setFormName(editingMember.name || '');
      setFormEmail(editingMember.email || '');
      setFormRole(editingMember.role || 'Team Member');
      setFormDomains(memberDomains);
      setFormLeadDomains(memberLeadDomains);
      setFormPassword(editingMember.password || '935200');
      setFormPhotoUrl(editingMember.photoUrl || '');
      setFormRemovePhoto(false);
      setFormIsLead(memberLeadDomains.length > 0 || Boolean(editingMember.isLead));
      setFormIsCore(Boolean(editingMember.isCore));
      setFormTier(editingMember.tier || (editingMember.isCore ? 1 : editingMember.isLead ? 2 : 3));
      setShowModalPassword(false);
      setActionError(null);
    }
  }, [editingMember]);

  if (!editingMember) return null;

  const toggleDomain = (tid: TeamId) => {
    setFormDomains((prev) => {
      const exists = prev.includes(tid);
      const next = exists ? prev.filter((d) => d !== tid) : [...prev, tid];
      if (next.length === 0) return prev; // Keep at least one domain
      return next;
    });
    setFormLeadDomains((prev) => prev.filter((d) => d !== tid));
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setActionError('Photo size exceeds 2MB limit. Please upload a compressed image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setFormPhotoUrl(reader.result);
        setFormRemovePhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      onMemberUpdated(data.member);
      onClose();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            onClick={onClose}
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
                  {!formRemovePhoto && (formPhotoUrl || editingMember.photoUrl) && (
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

          {/* Domain Assignments */}
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

          {/* Domain Leadership Assignment */}
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
              onClick={onClose}
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
  );
}
