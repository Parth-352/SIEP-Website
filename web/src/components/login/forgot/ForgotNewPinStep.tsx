"use client";

import React, { useState } from 'react';

interface ForgotNewPinStepProps {
  newPin: string;
  setNewPin: (pin: string) => void;
  confirmPin: string;
  setConfirmPin: (pin: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ForgotNewPinStep({
  newPin,
  setNewPin,
  confirmPin,
  setConfirmPin,
  isLoading,
  onSubmit,
}: ForgotNewPinStepProps) {
  const [showPin, setShowPin] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-xs text-grey">
        Create your new personal 6-digit numeric PIN. You will use this to sign into the portal.
      </p>

      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-jet-black font-bold mb-1.5">
          New 6-Digit PIN *
        </label>
        <div className="relative">
          <input
            type={showPin ? 'text' : 'password'}
            inputMode="numeric"
            maxLength={6}
            required
            autoFocus
            placeholder="e.g. 935200"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-4 py-3 bg-alice-blue border border-jet-black/15 rounded-xl text-base font-mono font-bold tracking-widest text-jet-black focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
          />
          <button
            type="button"
            onClick={() => setShowPin(!showPin)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-grey hover:text-jet-black text-xs font-mono font-bold"
          >
            {showPin ? 'HIDE' : 'SHOW'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-jet-black font-bold mb-1.5">
          Confirm 6-Digit PIN *
        </label>
        <input
          type={showPin ? 'text' : 'password'}
          inputMode="numeric"
          maxLength={6}
          required
          placeholder="Re-enter 6-digit PIN"
          value={confirmPin}
          onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full px-4 py-3 bg-alice-blue border border-jet-black/15 rounded-xl text-base font-mono font-bold tracking-widest text-jet-black focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3">
        <button
          type="submit"
          disabled={isLoading || newPin.length !== 6 || newPin !== confirmPin}
          className="w-full py-3 rounded-xl bg-orange text-white hover:bg-jet-black font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving PIN...</span>
            </>
          ) : (
            <span>Save New PIN & Continue →</span>
          )}
        </button>
      </div>
    </form>
  );
}
