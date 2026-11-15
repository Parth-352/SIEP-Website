"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LoginHeroHeader,
  LoginFormCard,
  ForgotPinModal,
} from '@/components/login';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get('from');

  const { user, login } = useAuth();

  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
      document.referrer.includes('android-app://');
    setIsStandalone(Boolean(standalone));
  }, []);

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
    <div className="min-h-screen bg-alice-blue flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-10 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10">
        <LoginHeroHeader />

        <LoginFormCard
          email={email}
          setEmail={setEmail}
          pin={pin}
          setPin={setPin}
          error={error}
          isSubmitting={isSubmitting}
          isStandalone={isStandalone}
          onSubmit={handleSubmit}
          onOpenForgotPin={() => setIsForgotOpen(true)}
        />
      </div>

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
