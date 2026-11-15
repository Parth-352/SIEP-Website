"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  ForgotEmailStep,
  ForgotOtpStep,
  ForgotNewPinStep,
  ForgotSuccessStep,
} from './forgot';

type ForgotStep = 'email' | 'otp' | 'new_pin' | 'success';

interface ForgotPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail: string;
  onSuccessReset: (email: string, newPin: string) => void;
}

export default function ForgotPinModal({
  isOpen,
  onClose,
  initialEmail,
  onSuccessReset,
}: ForgotPinModalProps) {
  const [step, setStep] = useState<ForgotStep>('email');
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [memberName, setMemberName] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isOpen) {
      setEmailInput(initialEmail);
      setStep('email');
      setError(null);
      setOtpDigits(['', '', '', '', '', '']);
      setNewPin('');
      setConfirmPin('');
    }
  }, [isOpen, initialEmail]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otpDigits];
    next[index] = val.slice(-1);
    setOtpDigits(next);
    if (val && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Step 1: Request OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', email: cleanEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMaskedEmail(data.maskedEmail || cleanEmail);
        setMemberName(data.recipientName || 'Member');
        setCountdown(60);
        setStep('otp');
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      } else {
        setError(data.error || 'Failed to send OTP code. Please check your email.');
      }
    } catch {
      setError('Network error contacting verification relay. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError('Please enter the full 6-digit code received in your email.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email: emailInput.trim().toLowerCase(),
          otp: code,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.resetToken) {
        setResetToken(data.resetToken);
        setStep('new_pin');
      } else {
        setError(data.error || 'Invalid or expired OTP code.');
      }
    } catch {
      setError('Network error verifying code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Save New PIN
  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPin.length !== 6 || !/^\d{6}$/.test(newPin)) {
      setError('PIN must be exactly 6 numeric digits.');
      return;
    }
    if (newPin !== confirmPin) {
      setError('PINs do not match.');
      return;
    }
    if (!resetToken) {
      setError('Verification expired. Please restart the process.');
      setStep('email');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          email: emailInput.trim().toLowerCase(),
          resetToken,
          newPin,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep('success');
      } else {
        setError(data.error || 'Failed to update PIN.');
      }
    } catch {
      setError('Network error updating PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-jet-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl border border-jet-black/10 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-jet-black to-jet-black/95 text-alice-blue flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange/20 border border-orange/40 flex items-center justify-center text-orange">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white tracking-tight">
                Reset Member PIN
              </h3>
              <p className="text-[11px] text-grey/80 font-mono">
                {step === 'email' && 'Step 1 of 3: Identity Verification'}
                {step === 'otp' && 'Step 2 of 3: Enter Email Code'}
                {step === 'new_pin' && 'Step 3 of 3: Set New 6-Digit PIN'}
                {step === 'success' && 'Reset Complete'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0 mt-1.5"></span>
              <span className="flex-1">{error}</span>
            </div>
          )}

          {step === 'email' && (
            <ForgotEmailStep
              emailInput={emailInput}
              setEmailInput={setEmailInput}
              isLoading={isLoading}
              onSubmit={handleRequestOtp}
              onClose={onClose}
            />
          )}

          {step === 'otp' && (
            <ForgotOtpStep
              otpDigits={otpDigits}
              maskedEmail={maskedEmail}
              memberName={memberName}
              countdown={countdown}
              isLoading={isLoading}
              otpRefs={otpRefs}
              onDigitChange={handleOtpDigitChange}
              onKeyDown={handleOtpKeyDown}
              onBackToEmail={() => setStep('email')}
              onResendOtp={handleRequestOtp}
              onSubmit={handleVerifyOtp}
              onClose={onClose}
            />
          )}

          {step === 'new_pin' && (
            <ForgotNewPinStep
              newPin={newPin}
              setNewPin={setNewPin}
              confirmPin={confirmPin}
              setConfirmPin={setConfirmPin}
              isLoading={isLoading}
              onSubmit={handleSavePin}
            />
          )}

          {step === 'success' && (
            <ForgotSuccessStep
              onSignInWithNewPin={() => {
                onSuccessReset(emailInput.trim().toLowerCase(), newPin);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
