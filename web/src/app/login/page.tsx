"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getMemberByEmail } from '@/lib/members';

type ForgotStep = 'email' | 'otp' | 'new_pin' | 'success';

function ForgotPinModal({
  isOpen,
  onClose,
  initialEmail,
  onSuccessReset,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialEmail: string;
  onSuccessReset: (email: string, newPin: string) => void;
}) {
  const [step, setStep] = useState<ForgotStep>('email');
  const [emailInput, setEmailInput] = useState(initialEmail);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [memberName, setMemberName] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);

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
      setError('Network error verifying code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Set New PIN
  const handleSavePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanPin = newPin.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setError('PIN must be exactly 6 numeric digits (e.g. 935200).');
      return;
    }

    if (cleanPin !== confirmPin.trim()) {
      setError('The two PINs do not match. Please re-enter.');
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
          newPassword: cleanPin,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep('success');
      } else {
        setError(data.error || 'Could not update PIN. Please request a new code.');
      }
    } catch {
      setError('Network error updating PIN.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-jet-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-3xl border border-jet-black/10 shadow-2xl w-full max-w-md overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="p-6 border-b border-jet-black/10 flex items-center justify-between bg-alice-blue/40">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange font-bold">
              Account Recovery
            </div>
            <h3 className="text-lg font-bold text-jet-black">
              {step === 'email' && 'Reset Your 6-Digit PIN'}
              {step === 'otp' && 'Check Your Gmail'}
              {step === 'new_pin' && 'Create New 6-Digit PIN'}
              {step === 'success' && 'PIN Reset Successful!'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-jet-black/10 flex items-center justify-center text-grey hover:text-jet-black hover:bg-jet-black/5 cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono flex items-center gap-2">
              <span className="text-sm">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 'email' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <p className="text-xs text-grey leading-relaxed">
                Enter your registered personal Gmail address. We will deliver a 6-digit one-time code to your inbox immediately.
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
                  className="w-full px-4 py-3 bg-alice-blue border border-jet-black/15 rounded-xl text-sm font-sans text-jet-black placeholder:text-grey/60 focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-jet-black/15 text-xs font-mono uppercase tracking-wider text-grey hover:text-jet-black cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Sending Code...</span>
                    </>
                  ) : (
                    <span>Send Reset Code →</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Verify OTP */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 font-mono">
                <div>Hello <strong className="font-bold">{memberName}</strong>,</div>
                <div>A 6-digit code was sent to <strong className="font-bold">{maskedEmail}</strong>.</div>
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
                        otpRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-13 text-center text-xl font-mono font-bold bg-alice-blue border-2 border-jet-black/15 rounded-xl focus:outline-none focus:border-orange focus:bg-white text-jet-black transition-all"
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-grey pt-1">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="hover:text-jet-black underline cursor-pointer"
                >
                  Change Email
                </button>
                {countdown > 0 ? (
                  <span>Resend in {countdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
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
          )}

          {/* STEP 3: Set New PIN */}
          {step === 'new_pin' && (
            <form onSubmit={handleSavePin} className="space-y-4">
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-grey hover:text-jet-black text-sm"
                  >
                    {showPin ? '🙈' : '👁️'}
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
          )}

          {/* STEP 4: Success */}
          {step === 'success' && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-2xl font-bold">
                ✓
              </div>
              <div>
                <h4 className="text-base font-bold text-jet-black">PIN Updated!</h4>
                <p className="text-xs text-grey mt-1">
                  Your new 6-digit PIN is active. Click below to sign in immediately.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSuccessReset(emailInput.trim().toLowerCase(), newPin);
                  onClose();
                }}
                className="w-full py-3.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Sign In With New PIN →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get('from');

  const { user, login } = useAuth();

  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (user) {
      if (fromUrl && !fromUrl.startsWith('/login')) {
        router.push(fromUrl);
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, fromUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = pin.trim();

    if (!cleanEmail) {
      setError('Please enter your registered Gmail address.');
      return;
    }

    if (!cleanPin) {
      setError('Please enter your 6-digit PIN (default is 935200).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(cleanEmail, cleanPin);
      if (res.success) {
        if (fromUrl && !fromUrl.startsWith('/login')) {
          router.push(fromUrl);
        } else {
          router.push('/dashboard');
        }
      } else {
        setError(res.error || 'Invalid email or PIN. Default PIN is 935200.');
        setIsSubmitting(false);
      }
    } catch {
      setError('An error occurred during authentication. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handleSuccessReset = async (newEmail: string, newPinCode: string) => {
    setEmail(newEmail);
    setPin(newPinCode);
    setIsSubmitting(true);
    const res = await login(newEmail, newPinCode);
    if (res.success) {
      if (fromUrl && !fromUrl.startsWith('/login')) {
        router.push(fromUrl);
      } else {
        router.push('/dashboard');
      }
    } else {
      setError('PIN updated! Please click Sign In to continue.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-alice-blue flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Brand & Portal Header */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-3xl font-black text-jet-black tracking-tighter hover:opacity-90 transition-opacity"
          >
            Riders Bay<span className="text-orange">.</span>
          </Link>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-jet-black text-alice-blue text-[10px] font-mono uppercase tracking-[0.2em] font-bold">
            SIEP OPERATING PORTAL
          </div>
          <p className="mt-3 text-xs font-sans text-grey">
            Sign in with your registered email and 6-digit PIN
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl border border-jet-black/10 shadow-xl p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono flex items-start gap-3">
              <span className="text-base leading-none">⚠️</span>
              <span className="flex-1 leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Registered Email Input */}
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-jet-black font-bold mb-2">
                Registered Gmail Address
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-alice-blue border border-jet-black/15 rounded-2xl text-sm font-sans text-jet-black placeholder:text-grey/60 focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all"
              />
            </div>

            {/* 6-Digit PIN Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-jet-black font-bold">
                  6-Digit PIN
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-[11px] font-mono text-orange hover:text-jet-black font-bold transition-colors cursor-pointer"
                >
                  Forgot PIN?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={6}
                  required
                  placeholder="••••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3.5 bg-alice-blue border border-jet-black/15 rounded-2xl text-base font-mono font-bold tracking-widest text-jet-black placeholder:text-grey/40 focus:outline-none focus:border-orange focus:ring-2 focus:ring-orange/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-grey hover:text-jet-black text-sm cursor-pointer"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? '🙈' : '👁️'}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-grey">
                <span>Default PIN: <strong className="font-bold text-jet-black">935200</strong></span>
                <span>6 digits numeric</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-jet-black text-alice-blue hover:bg-orange font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">→</span>
                </>
              )}
            </button>
          </form>

          {/* Return to Public Website */}
          <div className="pt-2 text-center border-t border-jet-black/10">
            <Link
              href="/"
              className="text-xs font-mono uppercase tracking-wider text-grey hover:text-jet-black transition-colors inline-flex items-center gap-1.5"
            >
              <span>← Return to Public Website</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot PIN Modal */}
      <ForgotPinModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        initialEmail={email}
        onSuccessReset={handleSuccessReset}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-alice-blue flex items-center justify-center font-mono text-xs text-grey">
          Loading portal authentication...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
