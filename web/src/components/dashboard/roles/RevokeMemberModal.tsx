import React, { useState } from 'react';
import { TeamMemberEntry } from '@/lib/members';

interface RevokeMemberModalProps {
  revokingMember: TeamMemberEntry | null;
  onClose: () => void;
  onMemberRevoked: (updatedMember: TeamMemberEntry) => void;
}

export default function RevokeMemberModal({
  revokingMember,
  onClose,
  onMemberRevoked,
}: RevokeMemberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!revokingMember) return null;

  const handleConfirmRevoke = async () => {
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

      onMemberRevoked(data.member);
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            onClick={onClose}
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
  );
}
