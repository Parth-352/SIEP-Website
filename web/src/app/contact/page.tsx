"use client";

import { useState } from "react";
import Link from "next/link";

const SUPPORT_AREAS = [
  { label: "Financial Aid", desc: "Direct funding for raw materials, competition registration, and high-voltage components." },
  { label: "Components & Manufacturing", desc: "Raw AISI 4130 steel, 4-axis CNC machining, composite fairings, and precision welding." },
  { label: "Technical Mentorship", desc: "Engineering consultation on powertrain dynamics, BMS cell balancing, and telemetry." },
  { label: "Software & Sensor Hardware", desc: "Simulation software licenses (FEA/CFD), CAN bus transceivers, and IoT telemetry sensors." },
  { label: "Testing Track & Dyno Access", desc: "Dynamometer chassis dyno runs, closed-track endurance trials, and thermal stress testing." },
  { label: "Logistics & Competition Transit", desc: "Safe transport and pit infrastructure for the electric scrambler to national competition." },
];

interface ContactPerson {
  name: string;
  role: string;
  phone?: string | null;
}

const TEAM_CONTACTS: ContactPerson[] = [
  { name: "Prof. Deore H.S.", role: "Faculty Mentor & Advisor", phone: null },
  { name: "Meet Samdadiya", role: "Team Captain", phone: "+91 7058471449" },
  { name: "Tirthraj Pawale", role: "Vice Captain", phone: "+91 9271647536" },
  { name: "Pratik Desarda", role: "Core member", phone: "+91 9307740350" },
];

export default function ContactPage() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('submitting');
    setErrorMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const organization = String(formData.get("organization") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const message = String(formData.get("message") || "").trim();

    // Prepare Web3Forms payload
    formData.set("access_key", "1cfe077b-7899-43da-9049-69680003cb32");
    formData.set("subject", `⚡ Partner Inquiry: ${name} (${organization || "Individual"})`);
    formData.set("from_name", "Riders Bay Partner Portal");
    formData.set("replyto", email);

    // Save backup to internal server store in background
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, organization, phone, message }),
    }).catch((err) => console.warn("Internal backup error:", err));

    try {
      // 1. Submit directly to Web3Forms (delivers immediately to ebikeclubcoe@snjb.org)
      const web3Res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      if (web3Res.ok) {
        setFormState('success');
        form.reset();
        return;
      }

      // 2. Secondary fallback: FormSubmit API
      const fsRes = await fetch("https://formsubmit.co/ajax/ebikeclubcoe@snjb.org", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          organization: organization || "Not specified",
          phone: phone || "Not specified",
          message,
          _subject: `⚡ Partner Inquiry: ${name} (${organization || "Individual"})`,
          _template: "table",
        }),
      });

      if (fsRes.ok) {
        setFormState('success');
        form.reset();
        return;
      }

      throw new Error("Automated dispatch failed.");
    } catch {
      setErrorMessage("Could not dispatch inquiry email automatically. Please email ebikeclubcoe@snjb.org directly.");
      setFormState('error');
    }
  };

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
            Partner With<br /><span className="text-orange">Riders Bay.</span>
          </h1>

          <p className="text-lg md:text-xl text-grey font-light leading-relaxed max-w-2xl">
            Whether you&apos;re looking to sponsor the electric scrambler project, provide testing and fabrication support, or discuss institutional partnership — drop us a message and our team will get back to you.
          </p>
        </div>

        {/* Top Grid: Support Areas & Direct Contacts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mb-16 md:mb-24">
          
          {/* Areas of Support - 7 Cols */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-jet-black/10">
                <h2 className="text-[11px] tracking-[0.3em] uppercase text-grey font-mono font-bold">
                  How You Can Support
                </h2>
                <span className="text-[11px] font-mono text-orange font-bold">6 Focus Areas</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SUPPORT_AREAS.map((area, idx) => (
                  <div 
                    key={idx} 
                    className="p-5 bg-white border border-jet-black/10 rounded-2xl hover:border-orange/50 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-jet-black/5 text-jet-black">
                          [ 0{idx + 1} ]
                        </span>
                        <span className="text-xs text-orange font-mono">→</span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-jet-black mb-1.5">{area.label}</h3>
                      <p className="text-xs text-grey font-light leading-relaxed">{area.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Email Banner */}
            <div className="mt-6 p-5 rounded-2xl bg-jet-black text-alice-blue flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10 shadow-sm">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-orange font-bold block mb-1">
                  Official Communication Channel
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-white">
                  ebikeclubcoe@snjb.org
                </span>
              </div>
              <a
                href="mailto:ebikeclubcoe@snjb.org"
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 bg-orange text-jet-black font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-white transition-colors text-center shrink-0"
              >
                Direct Email ↗
              </a>
            </div>
          </div>

          {/* Team Contacts - 5 Cols */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-6 border-b border-jet-black/10">
                <h2 className="text-[11px] tracking-[0.3em] uppercase text-grey font-mono font-bold">
                  Key Contacts
                </h2>
                <span className="text-[11px] font-mono text-grey font-bold">SNJB COE</span>
              </div>

              <div className="space-y-3.5">
                {TEAM_CONTACTS.map((person, idx) => {
                  const initials = person.name
                    .split(' ')
                    .filter(n => !n.startsWith('Prof.'))
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <div 
                      key={idx} 
                      className="p-4 bg-white border border-jet-black/10 rounded-2xl flex items-center justify-between gap-4 hover:border-jet-black/30 transition-all shadow-sm"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-jet-black text-alice-blue flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm">
                          {initials || "RB"}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-jet-black truncate">{person.name}</h3>
                          <p className="text-[11px] text-orange font-mono uppercase tracking-wider font-semibold mt-0.5 truncate">
                            {person.role}
                          </p>
                        </div>
                      </div>

                      {person.phone ? (
                        <a 
                          href={`tel:${person.phone.replace(/\s+/g, '')}`} 
                          className="px-3 py-1.5 rounded-lg bg-alice-blue border border-jet-black/10 text-xs font-mono text-jet-black font-bold hover:bg-orange hover:border-orange hover:text-jet-black transition-all shrink-0 min-h-[36px] flex items-center"
                          title={`Call ${person.name}`}
                        >
                          {person.phone}
                        </a>
                      ) : (
                        <span className="text-[10px] font-mono text-grey px-2.5 py-1 rounded bg-jet-black/5 shrink-0">
                          Advisory
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Institutional Backing note */}
            <div className="mt-6 p-4 rounded-xl border border-jet-black/10 bg-white/60 text-xs font-mono text-grey leading-relaxed">
              <span className="font-bold text-jet-black block mb-0.5">Campus Location:</span>
              SNJB&apos;s  Late Sau. Kantabai Bhavarlalji Jain College of Engineering, Neminagar, Chandwad, Nashik - 423101.
            </div>

          </div>

        </div>

        {/* Send a Message Form Section */}
        <section className="border-t border-jet-black/10 pt-16">
          <div className="max-w-3xl mx-auto bg-white border border-jet-black/10 rounded-2xl p-6 sm:p-10 md:p-12 shadow-sm">
            
            <div className="mb-8">
              <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-orange font-bold block mb-1">
                Direct Submission
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-jet-black tracking-tight">
                Send an Inquiry<span className="text-orange">.</span>
              </h2>
              <p className="text-sm text-grey font-light mt-1">
                Your message is routed directly to <span className="font-mono text-jet-black font-semibold">ebikeclubcoe@snjb.org</span>.
              </p>
            </div>

            {formState === 'success' ? (
              <div className="text-center py-12 px-4 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-bold text-2xl text-jet-black">Inquiry Transmitted!</h3>
                <p className="text-grey font-light text-sm max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. Your message has been dispatched directly to <strong className="text-jet-black">ebikeclubcoe@snjb.org</strong>. Our leadership team will review and reply shortly.
                </p>
                <div className="p-3.5 bg-alice-blue border border-jet-black/10 rounded-xl text-xs font-mono text-grey max-w-md mx-auto text-left leading-relaxed">
                  <span className="font-bold text-jet-black block mb-0.5">📬 Inbox Notice:</span>
                  If you are checking the recipient inbox (<code className="text-orange">ebikeclubcoe@snjb.org</code>), automated inquiries may take 1–2 minutes to appear or may filter into your <strong>Spam / Junk</strong> folder.
                </div>
                <button
                  type="button"
                  onClick={() => setFormState('idle')}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-jet-black text-alice-blue text-xs font-mono font-bold uppercase tracking-wider hover:bg-orange hover:text-jet-black transition-colors cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-grey font-bold mb-1.5">
                      Full Name <span className="text-orange">*</span>
                    </label>
                    <input 
                      name="name" 
                      type="text" 
                      required 
                      autoComplete="name"
                      className="w-full px-4 py-3 bg-alice-blue/40 border border-jet-black/15 focus:border-orange focus:ring-2 focus:ring-orange/20 focus:outline-none transition-all rounded-xl text-jet-black placeholder-grey/40 text-sm font-sans" 
                      placeholder="e.g. Anand Mahindra" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-grey font-bold mb-1.5">
                      Organization / Company
                    </label>
                    <input 
                      name="organization" 
                      type="text" 
                      autoComplete="organization"
                      className="w-full px-4 py-3 bg-alice-blue/40 border border-jet-black/15 focus:border-orange focus:ring-2 focus:ring-orange/20 focus:outline-none transition-all rounded-xl text-jet-black placeholder-grey/40 text-sm font-sans" 
                      placeholder="e.g. Tech Sponsor / EV Components" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-grey font-bold mb-1.5">
                      Email Address <span className="text-orange">*</span>
                    </label>
                    <input 
                      name="email" 
                      type="email" 
                      required 
                      autoComplete="email"
                      inputMode="email"
                      className="w-full px-4 py-3 bg-alice-blue/40 border border-jet-black/15 focus:border-orange focus:ring-2 focus:ring-orange/20 focus:outline-none transition-all rounded-xl text-jet-black placeholder-grey/40 text-sm font-sans font-mono" 
                      placeholder="name@company.com" 
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-grey font-bold mb-1.5">
                      Phone / WhatsApp
                    </label>
                    <input 
                      name="phone" 
                      type="tel" 
                      autoComplete="tel"
                      inputMode="tel"
                      className="w-full px-4 py-3 bg-alice-blue/40 border border-jet-black/15 focus:border-orange focus:ring-2 focus:ring-orange/20 focus:outline-none transition-all rounded-xl text-jet-black placeholder-grey/40 text-sm font-sans font-mono" 
                      placeholder="+91 98765 43210" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-grey font-bold mb-1.5">
                    Message / Collaboration Inquiry <span className="text-orange">*</span>
                  </label>
                  <textarea 
                    name="message" 
                    rows={5} 
                    required 
                    className="w-full p-4 bg-alice-blue/40 border border-jet-black/15 focus:border-orange focus:ring-2 focus:ring-orange/20 focus:outline-none transition-all rounded-xl text-jet-black placeholder-grey/40 text-sm font-sans resize-none leading-relaxed" 
                    placeholder="Describe how you would like to support or collaborate with the Riders Bay engineering collective..."
                  ></textarea>
                </div>

                {formState === 'error' && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs font-mono">
                    {errorMessage || "Submission failed. Please try again or write directly to ebikeclubcoe@snjb.org."}
                  </div>
                )}

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={formState === 'submitting'}
                    className="w-full min-h-[50px] py-3.5 bg-jet-black text-alice-blue font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-orange hover:text-jet-black transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-sm gap-2"
                  >
                    {formState === 'submitting' ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></span>
                        <span>Transmitting Inquiry...</span>
                      </>
                    ) : (
                      <span>Send Inquiry to Team →</span>
                    )}
                  </button>
                  <p className="text-[11px] text-grey/60 font-mono text-center mt-2.5">
                    Direct notification dispatched to ebikeclubcoe@snjb.org with reply-to configuration
                  </p>
                </div>
              </form>
            )}

          </div>
        </section>

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
