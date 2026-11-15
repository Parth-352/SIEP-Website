"use client";

import React from 'react';

interface ForgotEmailStepProps {
  emailInput: string;
  setEmailInput: (email: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function ForgotEmailStep({
  emailInput,
  setEmailInput,
  isLoading,
  onSubmit,
  onClose,
}: ForgotEmailStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-xs text-grey leading-relaxed">
        Enter your registered team email address. We will send a secure 6-digit verification code to reset your PIN.
      </p>

      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-jet-black font-bold mb-1.5">
          Registered Gmail Address *
        </label>
        <input
          type="email"
          required
          autoFocus
          placeholder="name@gmail.com"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          className="w-full px-4 py-3 bg-alice-blue border border-jet-black/15 rounded-xl text-sm font-sans text-jet-black focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 rounded-xl border border-jet-black/15 text-xs font-mono uppercase tracking-wider text-grey hover:text-jet-black cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !emailInput.trim()}
          className="px-5 py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange hover:text-jet-black font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sending OTP...</span>
            </>
          ) : (
            <span>Send Verification Code →</span>
          )}
        </button>
      </div>
    </form>
  );
}
