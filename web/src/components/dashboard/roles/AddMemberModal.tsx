import React, { useState, useEffect } from 'react';
import { TeamMemberEntry } from '@/lib/members';
import { TeamId } from '@/lib/types';
import { TEAMS, TEAMS_LIST } from '@/lib/teams';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMemberAdded: (newMember: TeamMemberEntry) => void;
}

export default function AddMemberModal({
  isOpen,
  onClose,
  onMemberAdded,
}: AddMemberModalProps) {
  const [formName, setFormName] = useState<string>('');
  const [formEmail, setFormEmail] = useState<string>('');
  const [formRole, setFormRole] = useState<string>('Team Member');
  const [formDomains, setFormDomains] = useState<TeamId[]>(['software']);
  const [formLeadDomains, setFormLeadDomains] = useState<TeamId[]>([]);
  const [formPassword, setFormPassword] = useState<string>('935200');
  const [formIsLead, setFormIsLead] = useState<boolean>(false);
  const [formIsCore, setFormIsCore] = useState<boolean>(false);
  const [formTier, setFormTier] = useState<1 | 2 | 3>(3);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormName('');
      setFormEmail('');
      setFormRole('Team Member');
      setFormDomains(['software']);
      setFormLeadDomains([]);
      setFormPassword('935200');
      setFormIsLead(false);
      setFormIsCore(false);
      setFormTier(3);
      setActionError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleDomain = (tid: TeamId) => {
    setFormDomains((prev) => {
      const exists = prev.includes(tid);
      const next = exists ? prev.filter((d) => d !== tid) : [...prev, tid];
      if (next.length === 0) return prev;
      return next;
    });
    setFormLeadDomains((prev) => prev.filter((d) => d !== tid));
  };

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
          photoUrl: '',
          isLead: formLeadDomains.length > 0 || formIsLead,
          isCore: formIsCore,
          tier: formTier,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to add member.');
      }
      onMemberAdded(data.member);
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
              {isSubmitting ? 'Adding Member...' : 'Add to Roster'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
