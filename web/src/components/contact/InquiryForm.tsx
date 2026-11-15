"use client";

import React, { useState } from 'react';

export default function InquiryForm() {
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
    formData.set("subject", `Partner Inquiry: ${name} (${organization || "Individual"})`);
    formData.set("from_name", "Riders Bay Partner Portal");
    formData.set("replyto", email);

    // Save backup to internal server store in background
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, organization, phone, message }),
    }).catch((err) => console.warn("Internal backup error:", err));

    try {
      // 1. Primary: Direct submission to FormSubmit (verified active for ebikeclubcoe@snjb.org)
      const fsRes = await fetch("https://formsubmit.co/ajax/1fdf7ecce72981c4ea938c45aeb47357", {
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
          _subject: `New Partner Inquiry: ${name} (${organization || "Individual"})`,
          _template: "table",
          _captcha: "false",
          _replyto: email,
        }),
      });

      if (fsRes.ok) {
        setFormState('success');
        form.reset();
        return;
      }

      // 2. Secondary fallback: Web3Forms
      const web3Res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      if (web3Res.ok) {
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
    <div className="lg:col-span-6 bg-white border border-jet-black/10 rounded-2xl p-6 sm:p-8 md:p-10 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-6 border-b border-jet-black/10">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-orange font-bold block mb-1">
              Direct Submission
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-jet-black tracking-tight uppercase">
              Send an Inquiry<span className="text-orange">.</span>
            </h2>
          </div>
        </div>

        {formState === 'success' ? (
          <div className="text-center py-10 px-4 space-y-4">
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
              <span className="font-bold text-jet-black block mb-0.5">Inbox Notice:</span>
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
                  className="w-full px-4 py-3 bg-alice-blue/40 border border-jet-black/15 focus:border-orange focus:ring-2 focus:ring-orange/20 focus:outline-none transition-all rounded-xl text-jet-black text-sm font-sans" 
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
                  className="w-full px-4 py-3 bg-alice-blue/40 border border-jet-black/15 focus:border-orange focus:ring-2 focus:ring-orange/20 focus:outline-none transition-all rounded-xl text-jet-black text-sm font-sans" 
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
                  className="w-full px-4 py-3 bg-alice-blue/40 border border-jet-black/15 focus:border-orange focus:ring-2 focus:ring-orange/20 focus:outline-none transition-all rounded-xl text-jet-black text-sm font-sans font-mono" 
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
                  className="w-full px-4 py-3 bg-alice-blue/40 border border-jet-black/15 focus:border-orange focus:ring-2 focus:ring-orange/20 focus:outline-none transition-all rounded-xl text-jet-black text-sm font-sans font-mono" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-grey font-bold mb-1.5">
                Message / Collaboration Inquiry <span className="text-orange">*</span>
              </label>
              <textarea 
                name="message" 
                rows={4} 
                required 
                className="w-full p-4 bg-alice-blue/40 border border-jet-black/15 focus:border-orange focus:ring-2 focus:ring-orange/20 focus:outline-none transition-all rounded-xl text-jet-black text-sm font-sans resize-none leading-relaxed" 
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
                className="w-full min-h-[48px] py-3 bg-jet-black text-alice-blue font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-orange hover:text-jet-black transition-all disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-sm gap-2"
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
              <p className="text-[11px] text-grey/60 font-mono text-center mt-2">
                Direct notification dispatched to ebikeclubcoe@snjb.org
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
