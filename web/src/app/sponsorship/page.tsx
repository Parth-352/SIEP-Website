"use client";

import React, { useState } from 'react';

import Image from 'next/image';

const SUPPORT_AREAS = [
  "Financial Aid",
  "Components & Manufacturing",
  "Technical Mentorship",
  "Software & Sensor Support",
  "Testing Access",
  "Logistics & Travel Support"
];

const SPONSORS = [
  { name: 'Altair', logo: '/sponsors/altair.png' },
  { name: 'Ansys', logo: '/sponsors/ansys.png' },
  { name: 'CK Birla', logo: '/sponsors/ck_birla.png' },
  { name: 'EaseMyTrip', logo: '/sponsors/easemytrip.png' },
  { name: 'Hero Electric', logo: '/sponsors/hero_electric.png' },
  { name: 'Luminous', logo: '/sponsors/luminous.png' },
  { name: 'Royal Enfield', logo: '/sponsors/royal_enfield.png' }
];

export default function SponsorshipPage() {
  const [formState, setFormState] = useState<'IDLE' | 'SUBMITTING' | 'SUCCESS'>('IDLE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('SUBMITTING');
    setTimeout(() => setFormState('SUCCESS'), 1000); // Mock submission
  };

  return (
    <main className="min-h-screen pt-24 px-6 md:px-24 max-w-7xl mx-auto pb-24 font-sans">
      <div className="mb-16">
        <h1 className="text-4xl md:text-6xl font-black text-jet-black uppercase tracking-tight mb-4">Partnership</h1>
        <p className="text-lg text-grey font-light max-w-2xl">
          Support the next generation of engineers. Partner with Riders Bay for the SIEP E-Bike Challenge 2026-27.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-jet-black mb-6">Areas of Support</h2>
          <ul className="space-y-4 mb-12">
            {SUPPORT_AREAS.map(area => (
              <li key={area} className="flex items-center text-grey font-light border-b border-jet-black/10 pb-2">
                <span className="w-2 h-2 bg-orange rounded-full mr-4 inline-block"></span>
                {area}
              </li>
            ))}
          </ul>

          <div className="bg-jet-black p-8 rounded-xl text-alice-blue text-center">
            <h3 className="text-xl font-bold uppercase tracking-widest mb-4">Ready to support?</h3>
            <button className="bg-orange text-jet-black font-bold uppercase tracking-widest px-8 py-3 rounded hover:bg-white transition-colors w-full">
              PARTNER WITH RIDERS BAY
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold uppercase tracking-tight text-jet-black mb-6">Resource Request</h2>
          <p className="text-sm font-light text-grey mb-8">
            Request access to our detailed project documentation, including the Sponsorship Proposal, Competition Brochure, Project PPT, and Cost Report. Access is granted after verification.
          </p>

          {formState === 'SUCCESS' ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-6 rounded text-center">
              <h3 className="font-bold uppercase tracking-wider mb-2">Request Received</h3>
              <p className="text-sm font-light">Our team will review your request and securely deliver the requested resources.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-grey mb-1">Organization / Name</label>
                <input required type="text" className="w-full border border-jet-black/20 rounded p-3 bg-white focus:outline-none focus:border-orange transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-grey mb-1">Email</label>
                <input required type="email" className="w-full border border-jet-black/20 rounded p-3 bg-white focus:outline-none focus:border-orange transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-grey mb-1">Requested Resources</label>
                <select className="w-full border border-jet-black/20 rounded p-3 bg-white focus:outline-none focus:border-orange transition-colors">
                  <option>Sponsorship Proposal</option>
                  <option>Competition Brochure</option>
                  <option>Project PPT</option>
                  <option>Cost Report (Controlled Access)</option>
                  <option>All of the above</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={formState === 'SUBMITTING'}
                className="w-full bg-jet-black text-alice-blue font-bold uppercase tracking-widest px-8 py-3 rounded hover:bg-orange transition-colors disabled:opacity-50 mt-4"
              >
                {formState === 'SUBMITTING' ? 'SUBMITTING...' : 'REQUEST RESOURCE'}
              </button>
            </form>
          )}
        </div>
      </div>

      <section className="mt-32 pt-24 border-t border-jet-black/10">
        <h2 className="text-3xl font-bold uppercase tracking-tight text-jet-black mb-12 text-center">Our Current Sponsors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 items-center justify-items-center opacity-80">
          {SPONSORS.map((sponsor) => (
            <div key={sponsor.name} className="relative w-32 h-20 md:w-48 md:h-24 hover:scale-105 transition-transform duration-300 grayscale hover:grayscale-0">
              <Image 
                src={sponsor.logo} 
                alt={`${sponsor.name} Logo`} 
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
