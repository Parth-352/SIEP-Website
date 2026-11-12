"use client";

import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '@/lib/types';

interface PinChangeFormProps {
  user?: UserProfile;
  embedded?: boolean;
}

type OtpStep = 'request' | 'verify' | 'new_pin' | 'done';

export default function PinChangeForm({ user, embedded = false }: PinChangeFormProps) {
  // Direct PIN Change state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPinInput, setShowPinInput] = useState(false);

  // Email OTP Modal state
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [otpStep, setOtpStep] = useState<OtpStep>('request');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [modalNewPin, setModalNewPin] = useState('');
  const [modalConfirmPin, setModalConfirmPin] = useState('');
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  // Handle Direct PIN submit (with known Current PIN)
  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!/^\d{6}$/.test(currentPin)) {
      setError('Current PIN must be exactly 6 digits.');
      return;
    }
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

  // OTP Step 1: Send OTP to Email
  const handleRequestOtp = async () => {
    if (!user?.email) return;
    setModalError(null);
    setIsModalLoading(true);

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', email: user.email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOtpStep('verify');
        setCountdown(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      } else {
        setModalError(data.error || 'Failed to dispatch OTP. Please try again.');
      }
    } catch {
      setModalError('Network error reaching OTP mail relay.');
    } finally {
      setIsModalLoading(false);
    }
  };

  // OTP Digits change handler
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

  // OTP Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email) return;
    setModalError(null);
    const code = otpDigits.join('');

    if (code.length !== 6) {
      setModalError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsModalLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email: user.email,
          otp: code,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.resetToken) {
        setResetToken(data.resetToken);
        setOtpStep('new_pin');
      } else {
        setModalError(data.error || 'Invalid or expired OTP code.');
      }
    } catch {
      setModalError('Network error verifying OTP.');
    } finally {
      setIsModalLoading(false);
    }
  };

  // OTP Step 3: Reset to New PIN
  const handleResetPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.email || !resetToken) return;
    setModalError(null);

    const cleanPin = modalNewPin.trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      setModalError('New PIN must be exactly 6 numeric digits.');
      return;
    }
    if (cleanPin !== modalConfirmPin.trim()) {
      setModalError('The two PINs do not match. Please re-enter.');
      return;
    }

    setIsModalLoading(true);
    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reset',
          email: user.email,
          resetToken,
          newPassword: cleanPin,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setModalSuccess('PIN successfully reset! You can now use your new PIN.');
        setOtpStep('done');
      } else {
        setModalError(data.error || 'Failed to reset PIN.');
      }
    } catch {
      setModalError('Network error saving new PIN.');
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeOtpModal = () => {
    setIsOtpModalOpen(false);
    setOtpStep('request');
    setOtpDigits(['', '', '', '', '', '']);
    setModalNewPin('');
    setModalConfirmPin('');
    setModalError(null);
    setModalSuccess(null);
  };

  return (
    <div className={embedded ? "space-y-4 pt-1" : "bg-white border border-jet-black/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4"}>
      {!embedded && (
        <div>
          <h3 className="text-sm font-bold text-jet-black font-sans flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Security &amp; 6-Digit PIN
          </h3>
          <p className="text-xs text-zinc-500 font-sans mt-0.5">
            Change your 6-digit numeric sign-in PIN directly. If you don&apos;t remember your current PIN, you can reset it via email OTP.
          </p>
        </div>
      )}

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

      {/* Direct PIN Change Form */}
      <form onSubmit={handleDirectSubmit} className="space-y-4 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-sans font-semibold text-zinc-700 block">
                Current PIN
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsOtpModalOpen(true);
                  setOtpStep('request');
                }}
                className="text-[11px] font-sans font-semibold text-orange hover:text-jet-black transition-colors cursor-pointer"
              >
                Forgot PIN?
              </button>
            </div>
            <input
              type={showPinInput ? 'text' : 'password'}
              maxLength={6}
              inputMode="numeric"
              value={currentPin}
              onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
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
              inputMode="numeric"
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
              inputMode="numeric"
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

      {/* =========================================================================
          FORGOT PIN VIA EMAIL OTP MODAL
         ========================================================================= */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-jet-black/15 shadow-2xl max-w-md w-full p-6 space-y-4 relative animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h4 className="text-base font-bold font-sans text-jet-black flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange animate-pulse" />
                  Reset PIN via Email OTP
                </h4>
                <p className="text-xs text-zinc-500 font-sans">
                  Official verification directly to your registered Gmail
                </p>
              </div>
              <button
                type="button"
                onClick={closeOtpModal}
                className="text-zinc-400 hover:text-jet-black text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-sans">
                {modalError}
              </div>
            )}

            {modalSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-sans">
                {modalSuccess}
              </div>
            )}

            {/* STEP 1: Request OTP */}
            {otpStep === 'request' && (
              <div className="space-y-4 pt-1">
                <p className="text-xs text-zinc-600 font-sans leading-relaxed">
                  We will dispatch a secure 6-digit OTP code to your registered Gmail address:
                </p>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono font-bold text-jet-black">
                  {user?.email}
                </div>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={isModalLoading}
                  className="w-full py-2.5 rounded-xl bg-orange hover:bg-orange/90 text-white font-sans text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isModalLoading ? 'Dispatching OTP...' : 'Send Verification OTP →'}
                </button>
              </div>
            )}

            {/* STEP 2: Verify 6-Digit OTP */}
            {otpStep === 'verify' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1">
                <p className="text-xs text-zinc-600 font-sans">
                  Enter the 6-digit verification code sent to <strong className="text-jet-black">{user?.email}</strong>:
                </p>

                <div className="flex items-center justify-between gap-2">
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
                      className="w-11 h-12 text-center text-lg font-mono font-bold rounded-xl border border-zinc-300 bg-zinc-50 focus:bg-white focus:border-orange focus:ring-2 focus:ring-orange/20 focus:outline-none"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="text-zinc-500">
                    {countdown > 0 ? `Resend code in ${countdown}s` : "Didn't receive code?"}
                  </span>
                  <button
                    type="button"
                    disabled={countdown > 0 || isModalLoading}
                    onClick={handleRequestOtp}
                    className="text-orange hover:underline font-semibold disabled:opacity-40 cursor-pointer"
                  >
                    Resend OTP
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isModalLoading || otpDigits.join('').length !== 6}
                  className="w-full py-2.5 rounded-xl bg-jet-black text-white hover:bg-orange font-sans text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  {isModalLoading ? 'Verifying...' : 'Verify OTP Code →'}
                </button>
              </form>
            )}

            {/* STEP 3: Set New 6-Digit PIN */}
            {otpStep === 'new_pin' && (
              <form onSubmit={handleResetPin} className="space-y-3.5 pt-1">
                <p className="text-xs text-zinc-600 font-sans">
                  OTP verified! Create your new 6-digit numeric PIN:
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-semibold text-zinc-700 block">
                    New 6-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    inputMode="numeric"
                    required
                    value={modalNewPin}
                    onChange={(e) => setModalNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="6 numeric digits"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-sm tracking-widest focus:ring-2 focus:ring-orange focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-sans font-semibold text-zinc-700 block">
                    Confirm New PIN
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    inputMode="numeric"
                    required
                    value={modalConfirmPin}
                    onChange={(e) => setModalConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Re-enter 6 digits"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-sm tracking-widest focus:ring-2 focus:ring-orange focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isModalLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-sans text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isModalLoading ? 'Saving...' : 'Update &amp; Lock PIN ✓'}
                </button>
              </form>
            )}

            {/* STEP 4: Done */}
            {otpStep === 'done' && (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h5 className="text-base font-bold text-jet-black font-sans">PIN Updated!</h5>
                <p className="text-xs text-zinc-500 font-sans">
                  Your new 6-digit numeric PIN is now active and synchronized to Cloud Firestore.
                </p>
                <button
                  type="button"
                  onClick={closeOtpModal}
                  className="px-6 py-2 rounded-xl bg-jet-black text-white text-xs font-sans font-semibold hover:bg-orange transition-all cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
