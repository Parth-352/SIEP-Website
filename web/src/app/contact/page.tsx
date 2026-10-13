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
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState('submitting');

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      formData.append("access_key", "1cfe077b-7899-43da-9049-69680003cb32");
      formData.append("subject", "New Inquiry — Riders Bay SIEP Website");
      formData.append("from_name", "SIEP Website Contact Form");

      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setFormState('success');
        form.reset();
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
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
            Whether you&apos;re looking to sponsor the project, request official documentation, or discuss technical collaboration — drop us a message and we&apos;ll get back to you.
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

        {/* Form Section */}
        <section className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-jet-black mb-2">Send a Message</h2>
          <div className="w-12 h-1 bg-orange rounded-full mb-8"></div>

          {formState === 'success' ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-7 h-7 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="font-bold text-2xl mb-2 text-jet-black">Message Sent!</h3>
              <p className="text-grey font-light text-sm">We&apos;ll get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 pt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" type="text" required className="w-full p-3 bg-white border border-jet-black/10 focus:border-orange focus:outline-none transition-colors rounded-lg text-jet-black placeholder-grey/40 text-sm" placeholder="Full Name *" />
                <input name="organization" type="text" className="w-full p-3 bg-white border border-jet-black/10 focus:border-orange focus:outline-none transition-colors rounded-lg text-jet-black placeholder-grey/40 text-sm" placeholder="Organization / Role" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="email" type="email" required className="w-full p-3 bg-white border border-jet-black/10 focus:border-orange focus:outline-none transition-colors rounded-lg text-jet-black placeholder-grey/40 text-sm" placeholder="Email *" />
                <input name="phone" type="tel" className="w-full p-3 bg-white border border-jet-black/10 focus:border-orange focus:outline-none transition-colors rounded-lg text-jet-black placeholder-grey/40 text-sm" placeholder="WhatsApp / Phone" />
              </div>
              <textarea name="message" rows={4} required className="w-full p-3 bg-white border border-jet-black/10 focus:border-orange focus:outline-none transition-colors rounded-lg text-jet-black placeholder-grey/40 text-sm resize-none" placeholder="Your message..."></textarea>

              {formState === 'error' && (
                <p className="text-red-500 text-sm">Something went wrong. Please try again or email us directly.</p>
              )}

              <button 
                type="submit" 
                disabled={formState === 'submitting'}
                className="w-full py-3 bg-jet-black text-alice-blue font-bold uppercase tracking-widest text-xs hover:bg-orange transition-colors disabled:opacity-50 rounded-lg"
              >
                {formState === 'submitting' ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </section>

      </div>
    </main>
  );
}
