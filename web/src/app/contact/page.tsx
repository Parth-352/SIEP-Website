"use client";

import { useState } from "react";

const SUPPORT_AREAS = [
  { label: "Financial Aid", desc: "Direct funding for components, testing, and competition fees" },
  { label: "Components & Manufacturing", desc: "Raw materials, CNC machining, 3D printing, welding support" },
  { label: "Technical Mentorship", desc: "Industry guidance on EV design, battery systems, and dynamics" },
  { label: "Software & Sensor Support", desc: "Simulation licenses, IoT sensors, telemetry hardware" },
  { label: "Testing Access", desc: "Dynamometer, track access, environmental testing chambers" },
  { label: "Logistics & Travel", desc: "Transport for the vehicle and team to the national competition" },
];

export default function ContactPage() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [inquiryType, setInquiryType] = useState('sponsorship');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setTimeout(() => setFormState('success'), 1500);
  };

  return (
    <main className="min-h-screen bg-alice-blue pt-28 pb-24 px-6 md:px-12 lg:px-24 font-sans text-jet-black">
      <div className="max-w-7xl mx-auto">

        {/* Hero Header */}
        <div className="mb-20 md:mb-28">
          <h2 className="text-[10px] tracking-[0.3em] uppercase text-grey font-mono mb-4 block">Get Involved</h2>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
            PARTNER WITH<br/><span className="text-orange">RIDERS BAY.</span>
          </h1>
          <p className="text-lg md:text-xl text-grey font-light leading-relaxed max-w-2xl">
            Whether you&apos;re looking to sponsor the project, request official documentation, or discuss technical collaboration — our team is ready to connect.
          </p>
        </div>

        {/* Two Column: Support Areas + Contact Info */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 mb-24">
          
          {/* Areas of Support - Takes 3 cols */}
          <div className="lg:col-span-3">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-grey font-mono mb-10 block border-b border-jet-black/10 pb-3">How You Can Support</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SUPPORT_AREAS.map((area, idx) => (
                <div key={idx} className="group p-6 bg-white border border-jet-black/5 rounded-xl hover:border-orange/30 hover:shadow-md transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-orange/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-orange/20 transition-colors">
                      <span className="text-orange font-mono font-bold text-xs">0{idx + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-base mb-1">{area.label}</h3>
                      <p className="text-sm text-grey font-light leading-relaxed">{area.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Info - Takes 2 cols */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h2 className="text-[10px] tracking-[0.3em] uppercase text-grey font-mono mb-6 block border-b border-jet-black/10 pb-3">Direct Contact</h2>
              <a href="mailto:ebikeclubcoe@snjb.org" className="inline-block px-6 py-3 bg-jet-black text-alice-blue font-semibold hover:bg-orange transition-colors uppercase tracking-widest text-sm rounded-sm mb-8">
                ebikeclubcoe@snjb.org
              </a>
            </div>

            <div>
              <h2 className="text-[10px] tracking-[0.3em] uppercase text-grey font-mono mb-6 block border-b border-jet-black/10 pb-3">Team Contacts</h2>
              <div className="space-y-5">
                {[
                  { name: "Meet Jain", role: "Team Captain", phone: "+91 7058471449" },
                  { name: "Prof. Deore H.S.", role: "Mentor", phone: null },
                  { name: "Tirthraj Pawale", role: null, phone: "+91 9271647536" },
                  { name: "Pratik Desarda", role: null, phone: "+91 9307740350" },
                ].map((person, idx) => (
                  <div key={idx} className="flex items-center gap-4 group">
                    <div className="w-10 h-10 bg-jet-black/5 rounded-full flex items-center justify-center shrink-0 group-hover:bg-orange/10 transition-colors">
                      <span className="text-sm font-bold text-jet-black/40">{person.name.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{person.name}</h3>
                      {person.role && <p className="text-[10px] text-orange font-mono uppercase tracking-widest">{person.role}</p>}
                      {person.phone && <p className="text-xs text-grey font-light">{person.phone}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Form Section */}
        <section className="bg-jet-black text-alice-blue p-8 md:p-16 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-grey font-mono mb-4 block">Reach Out</h2>
            <h3 className="text-3xl md:text-5xl font-bold tracking-tighter mb-4">Send Us a Request</h3>
            <p className="text-sm text-grey font-light mb-12 max-w-xl">
              Submit your details below to request controlled project documents, discuss sponsorship, or start a technical collaboration.
            </p>

            {formState === 'success' ? (
              <div className="bg-white/5 border border-white/10 p-8 rounded-2xl text-center">
                <div className="w-16 h-16 bg-orange/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="font-bold text-2xl mb-3">Request Received</h3>
                {inquiryType === 'cost_report' ? (
                  <p className="text-grey font-light text-sm max-w-md mx-auto">
                    Your request for the Estimated Cost Report has been submitted for manual review. Due to the sensitive nature of these documents, they are not available for public download. We will contact you shortly.
                  </p>
                ) : (
                  <p className="text-grey font-light text-sm max-w-md mx-auto">
                    Thank you for reaching out. A team member will follow up with you regarding your request shortly.
                  </p>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-grey mb-2">I&apos;m Interested In *</label>
                  <select 
                    required
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full p-4 bg-white/5 border border-white/10 focus:border-orange focus:outline-none transition-colors rounded-xl text-alice-blue"
                  >
                    <option value="sponsorship" className="text-jet-black">Sponsorship / Partnership</option>
                    <option value="collaboration" className="text-jet-black">Technical Collaboration</option>
                    <option value="project_ppt" className="text-jet-black">Project PPT</option>
                    <option value="competition_brochure" className="text-jet-black">Competition Brochure</option>
                    <option value="cost_report" className="text-jet-black">Cost Report (Manual Review Required)</option>
                    <option value="general" className="text-jet-black">General Inquiry</option>
                  </select>
                  {inquiryType === 'cost_report' && (
                    <p className="text-xs text-orange mt-2 italic">* This document requires manual approval and is not publicly downloadable.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-grey mb-2">Full Name *</label>
                    <input type="text" required className="w-full p-4 bg-white/5 border border-white/10 focus:border-orange focus:outline-none transition-colors rounded-xl text-alice-blue placeholder-grey/50" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-grey mb-2">Organization / Role *</label>
                    <input type="text" required className="w-full p-4 bg-white/5 border border-white/10 focus:border-orange focus:outline-none transition-colors rounded-xl text-alice-blue placeholder-grey/50" placeholder="Company or college" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-grey mb-2">Email *</label>
                    <input type="email" required className="w-full p-4 bg-white/5 border border-white/10 focus:border-orange focus:outline-none transition-colors rounded-xl text-alice-blue placeholder-grey/50" placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-grey mb-2">WhatsApp / Phone</label>
                    <input type="tel" className="w-full p-4 bg-white/5 border border-white/10 focus:border-orange focus:outline-none transition-colors rounded-xl text-alice-blue placeholder-grey/50" placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-grey mb-2">Message</label>
                  <textarea rows={4} className="w-full p-4 bg-white/5 border border-white/10 focus:border-orange focus:outline-none transition-colors rounded-xl text-alice-blue placeholder-grey/50 resize-none" placeholder="Tell us how you'd like to get involved..."></textarea>
                </div>

                <div className="flex items-center gap-3">
                  <input type="checkbox" id="consent" required className="accent-orange w-4 h-4" />
                  <label htmlFor="consent" className="text-xs text-grey font-light">I consent to being contacted regarding this request.</label>
                </div>

                <button 
                  type="submit" 
                  disabled={formState === 'submitting'}
                  className="w-full py-4 bg-orange text-jet-black font-bold uppercase tracking-widest text-sm hover:bg-white transition-colors disabled:opacity-50 rounded-xl"
                >
                  {formState === 'submitting' ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
