"use client";

import React, { RefObject } from 'react';

interface ForgotOtpStepProps {
  otpDigits: string[];
  maskedEmail: string;
  memberName: string;
  countdown: number;
  isLoading: boolean;
  otpRefs: RefObject<(HTMLInputElement | null)[]>;
  onDigitChange: (index: number, val: string) => void;
  onKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBackToEmail: () => void;
  onResendOtp: (e: React.FormEvent) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export default function ForgotOtpStep({
  otpDigits,
  maskedEmail,
  memberName,
  countdown,
  isLoading,
  otpRefs,
  onDigitChange,
  onKeyDown,
  onBackToEmail,
  onResendOtp,
  onSubmit,
  onClose,
}: ForgotOtpStepProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="p-3 bg-alice-blue rounded-xl border border-jet-black/10 text-xs">
        <p className="text-jet-black font-medium">Verification Code Sent!</p>
        <p className="text-grey text-[11px] mt-0.5">
          A 6-digit OTP code was sent to <strong className="text-jet-black">{maskedEmail}</strong> ({memberName}).
        </p>
      </div>

      <div>
        <label className="block text-[11px] font-mono uppercase tracking-wider text-jet-black font-bold mb-2 text-center">
          Enter 6-Digit OTP Code
        </label>
        <div className="flex justify-center gap-2 sm:gap-2.5">
          {otpDigits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                if (otpRefs.current) {
                  otpRefs.current[i] = el;
                }
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => onDigitChange(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              className="w-11 h-13 text-center text-xl font-mono font-bold bg-alice-blue border-2 border-jet-black/15 rounded-xl focus:outline-none focus:border-orange focus:bg-white text-jet-black transition-all"
            />
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-grey pt-1">
        <button
          type="button"
          onClick={onBackToEmail}
          className="hover:text-jet-black underline cursor-pointer"
        >
          Change Email
        </button>
        {countdown > 0 ? (
          <span>Resend in {countdown}s</span>
        ) : (
          <button
            type="button"
            onClick={onResendOtp}
            className="text-orange font-bold hover:underline cursor-pointer"
          >
            Resend Code
          </button>
        )}
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
          disabled={isLoading || otpDigits.join('').length !== 6}
          className="px-5 py-2.5 rounded-xl bg-orange text-white hover:bg-jet-black font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <span>Verify Code →</span>
          )}
        </button>
      </div>
    </form>
  );
}
