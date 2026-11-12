"use client";

import React, { useState } from 'react';

export default function PinChangeForm() {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPinInput, setShowPinInput] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!/^\d{6}$/.test(newPin)) {
      setError('New PIN must be exactly 6 numeric digits (0-9).');
      return;
    }
    if (newPin !== confirmPin) {
      setError('Confirmation PIN does not match new PIN.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPin, newPin, confirmPin }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to update PIN. Please verify your current PIN.');
      } else {
        setSuccess('6-digit PIN successfully updated and synchronized to Cloud Firestore!');
        setCurrentPin('');
        setNewPin('');
        setConfirmPin('');
      }
    } catch {
      setError('Network error while updating PIN. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-jet-black/10 rounded-2xl p-6 shadow-sm space-y-4">
      <div>
        <h3 className="text-sm font-bold text-jet-black font-sans flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          Security &amp; 6-Digit PIN
        </h3>
        <p className="text-xs text-zinc-500 font-sans mt-0.5">
          Update your personal numeric PIN used for logging into the portal and signing off deliverables.
        </p>
      </div>

      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans flex items-center gap-2 animate-in fade-in">
          <span className="text-emerald-600 font-bold">✓</span>
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-sans flex items-center gap-2 animate-in fade-in">
          <span className="text-red-500 font-bold">✕</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-sans font-semibold text-zinc-700 block">
              Current PIN
            </label>
            <input
              type={showPinInput ? 'text' : 'password'}
              maxLength={6}
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value)}
              placeholder="e.g. 935200"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-sm tracking-widest focus:ring-2 focus:ring-orange focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans font-semibold text-zinc-700 block">
              New 6-Digit PIN
            </label>
            <input
              type={showPinInput ? 'text' : 'password'}
              maxLength={6}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
              placeholder="6 numeric digits"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-sm tracking-widest focus:ring-2 focus:ring-orange focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-sans font-semibold text-zinc-700 block">
              Confirm New PIN
            </label>
            <input
              type={showPinInput ? 'text' : 'password'}
              maxLength={6}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Re-enter 6 digits"
              className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-sm tracking-widest focus:ring-2 focus:ring-orange focus:outline-none"
              required
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-zinc-600 select-none">
            <input
              type="checkbox"
              checked={showPinInput}
              onChange={(e) => setShowPinInput(e.target.checked)}
              className="rounded border-zinc-300 text-orange focus:ring-orange"
            />
            <span>Show PIN characters</span>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-jet-black text-white hover:bg-orange transition-all font-sans text-xs font-semibold shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Saving PIN...</span>
              </>
            ) : (
              <span>Save New PIN</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
