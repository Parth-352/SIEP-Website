"use client";

import React from 'react';

interface ForgotSuccessStepProps {
  onSignInWithNewPin: () => void;
}

export default function ForgotSuccessStep({ onSignInWithNewPin }: ForgotSuccessStepProps) {
  return (
    <div className="space-y-4 text-center py-2">
      <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <h4 className="text-base font-bold text-jet-black">PIN Updated!</h4>
        <p className="text-xs text-grey mt-1">
          Your new 6-digit PIN is active. Click below to sign in immediately.
        </p>
      </div>

      <button
        type="button"
        onClick={onSignInWithNewPin}
        className="w-full py-3.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
      >
        Sign In With New PIN →
      </button>
    </div>
  );
}
