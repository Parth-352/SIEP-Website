"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { TEAMS } from '@/lib/teams';
import { TeamId, TeamConfig } from '@/lib/types';

// All official SIEP divisions including Core Admin
const LOGIN_TEAMS: TeamConfig[] = [
  TEAMS.core,
  TEAMS.software,
  TEAMS.mechanical,
  TEAMS.entc,
  TEAMS.design,
  TEAMS.research,
  TEAMS.sponsorship,
  TEAMS.socialmedia,
  TEAMS.documentation,
];

// ============================================================================
// FORGOT PASSWORD MODAL COMPONENT
// 3-step flow: Select Team → Request & Enter OTP → View Recovered Password
// ============================================================================

type ForgotStep = 'select' | 'otp' | 'revealed';

function ForgotPasswordModal({
  isOpen,
  onClose,
  preSelectedTeamId,
}: {
  isOpen: boolean;
  onClose: () => void;
  preSelectedTeamId: TeamId | null;
}) {
  const [step, setStep] = useState<ForgotStep>('select');
  const [selectedTeamId, setSelectedTeamId] = useState<TeamId | null>(preSelectedTeamId);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [revealedPassword, setRevealedPassword] = useState<string | null>(null);
  const [revealedTeam, setRevealedTeam] = useState<{ code: string; name: string } | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync preSelectedTeamId when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTeamId(preSelectedTeamId);
      if (preSelectedTeamId) {
        setStep('select'); // Still show select but pre-highlighted
      }
    }
  }, [isOpen, preSelectedTeamId]);

  // Countdown timer for cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('select');
        setOtpDigits(['', '', '', '', '', '']);
        setError(null);
        setSuccessMessage(null);
        setRevealedPassword(null);
        setRevealedTeam(null);
        setIsRequesting(false);
        setIsVerifying(false);
        setShowPassword(false);
      }, 300);
    }
  }, [isOpen]);

  // Handle OTP digit input with auto-advance
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1); // Only keep last digit
    setOtpDigits(newDigits);

    // Auto-advance to next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste for OTP
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 0) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setOtpDigits(newDigits);
    // Focus last filled or last input
    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();
  };

  // Step 1 → 2: Request OTP
  const handleRequestOTP = async () => {
    if (!selectedTeamId) {
      setError('Please select a team first.');
      return;
    }

    setError(null);
    setIsRequesting(true);

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', teamId: selectedTeamId }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMessage(data.message);
        setStep('otp');
        setCountdown(120); // 2 minute cooldown
        setTimeout(() => otpRefs.current[0]?.focus(), 200);
      } else {
        setError(data.error || 'Failed to send OTP.');
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setIsRequesting(false);
    }
  };

  // Step 2 → 3: Verify OTP
  const handleVerifyOTP = async () => {
    const otpValue = otpDigits.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    setError(null);
    setIsVerifying(true);

    try {
      const res = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', teamId: selectedTeamId, otp: otpValue }),
      });

      const data = await res.json();

      if (data.success) {
        setRevealedPassword(data.password);
        setRevealedTeam({ code: data.teamCode, name: data.teamName });
        setStep('revealed');
        setError(null);
      } else {
        setError(data.error || 'Verification failed.');
        if (data.expired) {
          // OTP expired, go back to select
          setTimeout(() => {
            setStep('select');
            setOtpDigits(['', '', '', '', '', '']);
          }, 2000);
        }
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const selectedTeam = selectedTeamId ? TEAMS[selectedTeamId] : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-jet-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-jet-black/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-jet-black px-6 py-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-orange font-bold block">
              SIEP Portal Security
            </span>
            <h3 className="text-white font-bold text-sm tracking-tight mt-0.5">
              {step === 'select' && 'Forgot Team Password'}
              {step === 'otp' && 'Enter Verification Code'}
              {step === 'revealed' && 'Password Recovered'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/50 hover:text-white text-lg font-mono cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2 animate-in fade-in">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="leading-relaxed flex-1">{error}</p>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && step === 'otp' && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-start gap-2">
              <svg className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="leading-relaxed flex-1">{successMessage}</p>
            </div>
          )}

          {/* ─── STEP 1: SELECT TEAM ─────────────────────────────────────── */}
          {step === 'select' && (
            <>
              <p className="text-xs text-grey leading-relaxed">
                Select your subsystem team below. A <strong>6-digit OTP</strong> will be sent to the
                SIEP admin inbox for verification. This prevents unauthorized access.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LOGIN_TEAMS.map((t) => {
                  const isSelected = selectedTeamId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTeamId(t.id);
                        setError(null);
                      }}
                      className={`text-left p-2.5 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange/10 border-orange text-jet-black ring-2 ring-orange/30'
                          : 'bg-alice-blue/40 border-jet-black/10 hover:border-jet-black/30 hover:bg-white text-jet-black'
                      }`}
                    >
                      <span
                        className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                          isSelected ? 'bg-orange text-white' : 'bg-jet-black/10 text-jet-black'
                        }`}
                      >
                        {t.code}
                      </span>
                      <span className="block font-bold text-[11px] mt-1 truncate">{t.shortName}</span>
                    </button>
                  );
                })}
              </div>

              {selectedTeam && (
                <div className="p-3 bg-alice-blue/60 border border-orange/20 rounded-xl text-xs font-mono">
                  <span className="text-grey">Requesting reset for:</span>
                  <span className="font-bold text-jet-black ml-1">
                    [{selectedTeam.code}] {selectedTeam.name}
                  </span>
                  <span className="block text-[10px] text-grey mt-0.5">{selectedTeam.email}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleRequestOTP}
                disabled={!selectedTeamId || isRequesting}
                className={`w-full py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                  !selectedTeamId
                    ? 'bg-jet-black/30 text-white/70 cursor-not-allowed'
                    : 'bg-jet-black text-alice-blue hover:bg-orange cursor-pointer'
                } disabled:opacity-60`}
              >
                {isRequesting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sending OTP to Admin...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Send OTP to Admin Email</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* ─── STEP 2: ENTER OTP ───────────────────────────────────────── */}
          {step === 'otp' && (
            <>
              <p className="text-xs text-grey leading-relaxed">
                A 6-digit code was sent to the SIEP admin email for <strong>[{selectedTeam?.code}] {selectedTeam?.name}</strong>.
                Ask your admin to check and share the OTP with you.
              </p>

              {/* OTP Input Boxes */}
              <div className="flex justify-center gap-1.5 sm:gap-2.5" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-10 sm:w-11 h-12 sm:h-13 text-center text-base sm:text-lg font-bold font-mono rounded-xl border-2 border-jet-black/15 bg-alice-blue/40 text-jet-black focus:border-orange focus:ring-2 focus:ring-orange/30 focus:outline-none transition-all"
                  />
                ))}
              </div>

              {/* Verify Button */}
              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={isVerifying || otpDigits.join('').length !== 6}
                className={`w-full py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md ${
                  otpDigits.join('').length !== 6
                    ? 'bg-jet-black/30 text-white/70 cursor-not-allowed'
                    : 'bg-jet-black text-alice-blue hover:bg-orange cursor-pointer'
                } disabled:opacity-60`}
              >
                {isVerifying ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify OTP &amp; Recover Password</span>
                )}
              </button>

              {/* Resend / Back */}
              <div className="flex items-center justify-between text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setStep('select');
                    setOtpDigits(['', '', '', '', '', '']);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  className="text-grey hover:text-jet-black transition-colors cursor-pointer underline"
                >
                  &larr; Change Team
                </button>
                <button
                  type="button"
                  onClick={handleRequestOTP}
                  disabled={countdown > 0 || isRequesting}
                  className={`transition-colors ${
                    countdown > 0 ? 'text-grey/50 cursor-not-allowed' : 'text-orange hover:text-jet-black cursor-pointer underline'
                  }`}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </>
          )}

          {/* ─── STEP 3: PASSWORD REVEALED ───────────────────────────────── */}
          {step === 'revealed' && revealedPassword && revealedTeam && (
            <>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xs text-grey">
                  Password recovered for <strong className="text-jet-black">[{revealedTeam.code}] {revealedTeam.name}</strong>
                </p>
              </div>

              {/* Password Display */}
              <div className="bg-alice-blue border-2 border-orange/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-grey font-bold">
                    Team Password
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[10px] font-mono text-orange hover:text-jet-black cursor-pointer underline font-bold"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <code className="flex-1 text-lg font-bold font-mono text-jet-black tracking-wider select-all">
                    {showPassword ? revealedPassword : '••••••••••'}
                  </code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(revealedPassword);
                    }}
                    className="px-3 py-1.5 bg-jet-black text-white rounded-lg text-[10px] font-mono font-bold hover:bg-orange transition-colors cursor-pointer uppercase"
                    title="Copy to clipboard"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-grey text-center font-mono leading-relaxed">
                Use this password to sign in. Keep it safe — do not share publicly.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Close &amp; Sign In &rarr;
              </button>
            </>
          )}

        </div>
      </div>
    </div>
  );
}


// ============================================================================
// LOGIN FORM COMPONENT
// ============================================================================

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get('from');

  const { user, login } = useAuth();

  const [selectedTeamId, setSelectedTeamId] = useState<TeamId | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Clicking a team ONLY selects it and focuses password - DOES NOT LOG IN DIRECTLY
  const handleSelectTeam = (teamId: TeamId) => {
    setSelectedTeamId(teamId);
    setError(null);
    setPassword('');
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
  };

  // Login only occurs when submitting with the correct password
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedTeamId) {
      setError('Please click your subsystem team from the cards above.');
      return;
    }

    const team = TEAMS[selectedTeamId];
    if (!team) {
      setError('Invalid team selected.');
      return;
    }

    if (!password.trim()) {
      setError('Please enter the password for ' + team.name + '.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await login(team.email, password);
      if (!res.success) {
        setError(res.error || `Invalid password for [${team.code}] ${team.name}. Please enter your authorized team password.`);
        setIsSubmitting(false);
      } else {
        // Successful login: navigate to target page
        if (fromUrl && !fromUrl.startsWith('/login')) {
          router.push(fromUrl);
        } else if (team.role === 'admin' || team.id === 'core') {
          router.push('/dashboard');
        } else {
          router.push('/log');
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsSubmitting(false);
    }
  };

  const selectedTeam = selectedTeamId ? TEAMS[selectedTeamId] : null;

  return (
    <main className="min-h-screen bg-alice-blue text-jet-black pt-20 sm:pt-24 pb-16 px-4 sm:px-6 font-sans flex flex-col justify-center items-center">
      
      {/* Background subtle grid pattern */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#2B303A_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="w-full max-w-xl relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-3xl sm:text-4xl font-black text-jet-black tracking-tighter hover:opacity-90 transition-opacity">
            Riders Bay<span className="text-orange">.</span>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-orange animate-pulse"></span>
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-grey font-bold">
              SIEP Internal Portal
            </span>
          </div>
          <p className="text-sm text-grey mt-2 font-light">
            Engineering build logs, step tracking &amp; subsystem telemetry
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-jet-black/10 rounded-2xl p-6 sm:p-8 shadow-xl">
          
          {/* Active Session Notification (if user already logged in) */}
          {user && (
            <div className="mb-5 p-3.5 bg-amber-500/[0.08] border border-amber-500/30 rounded-xl flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2.5 truncate mr-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                <span className="text-jet-black truncate">
                  Active session: <strong className="font-bold">[{user.teamId.toUpperCase()}] {user.displayName}</strong>
                </span>
              </div>
              <Link
                href={fromUrl && !fromUrl.startsWith('/login') ? fromUrl : (user.role === 'admin' || user.teamId === 'core' ? '/dashboard' : '/log')}
                className="text-orange hover:underline font-bold shrink-0 inline-flex items-center gap-1"
              >
                <span>Continue &rarr;</span>
              </Link>
            </div>
          )}

          <div className="flex items-center justify-between pb-4 mb-5 border-b border-jet-black/5">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-orange font-bold block mb-0.5">
                Step 1 &bull; Click to Select Team
              </span>
              <h2 className="text-lg font-bold tracking-tight text-jet-black">
                Select Your Subsystem Team
              </h2>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-jet-black/5 text-jet-black/70 font-semibold self-start sm:self-auto">
              9 Divisions
            </span>
          </div>

          {/* Team Selection Grid - Clicking ONLY highlights and selects, DOES NOT submit */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-6">
            {LOGIN_TEAMS.map((t) => {
              const isSelected = selectedTeamId === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTeam(t.id)}
                  className={`text-left p-3 rounded-xl border text-xs font-mono transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'bg-orange/10 border-orange text-jet-black ring-2 ring-orange/30 shadow-sm'
                      : 'bg-alice-blue/40 border-jet-black/10 hover:border-jet-black/30 hover:bg-white text-jet-black'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                        isSelected
                          ? 'bg-orange text-white'
                          : 'bg-jet-black/10 text-jet-black'
                      }`}
                    >
                      {t.code}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-orange text-white flex items-center justify-center shrink-0">
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </div>

                  <span className="font-bold text-xs truncate block text-jet-black mt-0.5">
                    {t.shortName}
                  </span>

                  <span className="text-[10px] text-grey truncate opacity-80 mt-1 block">
                    {t.lead || (t.role === 'admin' ? 'Admin' : 'Team')}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2.5 animate-in fade-in">
              <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="leading-relaxed flex-1">{error}</p>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-800 text-xs font-mono font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Password & Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5 pt-4 border-t border-jet-black/10">
            
            {/* Selected Team Badge Ribbon */}
            {selectedTeam ? (
              <div className="p-3.5 bg-alice-blue/70 border border-orange/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange"></span>
                  <div className="truncate">
                    <span className="text-xs font-mono font-bold text-jet-black block truncate">
                      [{selectedTeam.code}] {selectedTeam.name}
                    </span>
                    <span className="text-[10px] font-mono text-grey truncate block">
                      {selectedTeam.email}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTeamId(null);
                    setPassword('');
                  }}
                  className="text-[11px] font-mono text-grey hover:text-orange underline cursor-pointer ml-2 shrink-0"
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="p-3.5 bg-alice-blue/30 border border-dashed border-jet-black/20 rounded-xl text-center text-xs font-mono text-grey">
                Click your subsystem team above to continue &uarr;
              </div>
            )}

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-grey font-medium">
                  Team Password *
                </label>
                {/* Forgot Password Link */}
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-[11px] font-mono text-orange hover:text-jet-black transition-colors cursor-pointer font-bold hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={selectedTeam ? "Enter team password..." : "Select a team first..."}
                  disabled={!selectedTeamId}
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-jet-black/15 bg-alice-blue/40 text-jet-black placeholder:text-grey/40 text-sm focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-grey hover:text-jet-black p-1 text-xs focus:outline-none cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !selectedTeamId}
              className={`w-full min-h-[48px] py-3.5 px-6 rounded-xl transition-all font-bold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 ${
                !selectedTeamId
                  ? 'bg-jet-black/30 text-white/70 cursor-not-allowed'
                  : 'bg-jet-black text-alice-blue hover:bg-orange cursor-pointer'
              } disabled:opacity-60`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Verifying Password...</span>
                </>
              ) : selectedTeam ? (
                <span>Sign In as [{selectedTeam.code}] {selectedTeam.shortName} &rarr;</span>
              ) : (
                <span>Select a Subsystem Team Above</span>
              )}
            </button>
          </form>

        </div>

        {/* Footer info */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-grey hover:text-orange font-mono transition-colors">
            &larr; Back to Riders Bay Public Site
          </Link>
        </div>

      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        preSelectedTeamId={selectedTeamId}
      />

    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-alice-blue flex items-center justify-center font-mono text-sm text-grey">
          <span className="w-5 h-5 border-2 border-orange border-t-transparent rounded-full animate-spin mr-3"></span>
          Loading portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
