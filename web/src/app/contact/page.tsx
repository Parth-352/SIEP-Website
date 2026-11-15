"use client";

import React from 'react';
import Link from 'next/link';
import {
  SupportAreasGrid,
  InquiryForm,
  KeyTeamContacts,
  CampusLocationBanner,
} from '@/components/contact';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-alice-blue pt-32 pb-24 font-sans text-jet-black">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">

        {/* Hero Header */}
        <div className="mb-16 md:mb-20">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-2 h-2 rounded-full bg-orange animate-pulse"></span>
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-grey font-bold">
              05 / Collaboration &amp; Outreach
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-jet-black tracking-tighter leading-[0.9] mb-6 uppercase">
            Contact<br /><span className="text-orange">Riders Bay.</span>
          </h1>

          <p className="text-lg md:text-xl text-grey font-light leading-relaxed max-w-2xl">
            Whether you&apos;re looking to sponsor the electric scrambler project, provide testing and fabrication support, or discuss institutional partnership — drop us a message and our team will get back to you.
          </p>
        </div>

        {/* Top Grid: Support Areas (Left) & Inquiry Form (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10 mb-16 md:mb-24">
          <SupportAreasGrid />
          <InquiryForm />
        </div>

        {/* Teammates / Key Contacts Section (Bottom) */}
        <KeyTeamContacts />

        {/* Campus Location Banner */}
        <div className="mt-8">
          <CampusLocationBanner />
        </div>

        {/* Footer Navigation Back Link */}
        <div className="text-center mt-16 pt-8 border-t border-jet-black/10">
          <Link href="/" className="text-xs text-grey hover:text-orange font-mono transition-colors">
            ← Return to Riders Bay Home
          </Link>
        </div>

      </div>
    </main>
  );
}
