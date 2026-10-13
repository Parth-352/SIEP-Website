"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [resourceType, setResourceType] = useState('collaboration');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    
    // Mock backend delay
    setTimeout(() => {
      setFormState('success');
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-alice-blue py-32 px-6 md:px-12 lg:px-24 font-sans text-jet-black">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
        
        {/* Contact Info */}
        <div className="space-y-16">
          <section>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-8">
              START A<br/><span className="text-orange">CONVERSATION.</span>
            </h1>
            <p className="text-xl text-grey font-light leading-relaxed mb-8">
              Whether you are looking to sponsor the project, request official documentation, or discuss technical collaboration, our team is ready to connect.
            </p>
            <a href="mailto:ebikeclubcoe@snjb.org" className="inline-block px-6 py-3 bg-jet-black text-alice-blue font-semibold hover:bg-orange transition-colors uppercase tracking-widest text-sm">
              ebikeclubcoe@snjb.org
            </a>
          </section>

          <section>
            <h2 className="text-[10px] tracking-widest uppercase text-grey font-mono mb-6 block border-b border-grey/20 pb-2">Verified Team Contacts</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-lg">Meet Jain</h3>
                <p className="text-sm text-orange font-mono uppercase tracking-widest mb-1">Team Captain</p>
                <p className="text-grey font-light">+91 7058471449</p>
              </div>
              <div>
                <h3 className="font-bold text-lg">Prof. Deore H.S.</h3>
                <p className="text-sm text-orange font-mono uppercase tracking-widest mb-1">Mentor</p>
              </div>
              <div>
                <h3 className="font-bold text-lg">Tirthraj Pawale</h3>
                <p className="text-grey font-light">+91 9271647536</p>
              </div>
              <div>
                <h3 className="font-bold text-lg">Pratik Desarda</h3>
                <p className="text-grey font-light">+91 9307740350</p>
              </div>
            </div>
          </section>
        </div>

        {/* Resource Request Form */}
        <div className="bg-white p-8 md:p-12 shadow-sm border border-grey/10 rounded-sm">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Request Resources & Information</h2>
          <p className="text-sm text-grey font-light mb-8">Submit your details below to request controlled project documents or discuss sponsorship.</p>

          {formState === 'success' ? (
            <div className="bg-alice-blue p-6 border-l-4 border-orange">
              <h3 className="font-bold text-lg mb-2">Request Received.</h3>
              {resourceType === 'cost_report' ? (
                <p className="text-grey font-light text-sm">
                  Your request for the Estimated Cost Report has been submitted for manual review by the team. Due to the sensitive nature of these documents, they are not available for public download. We will contact you shortly.
                </p>
              ) : (
                <p className="text-grey font-light text-sm">
                  Thank you for reaching out. A team member will follow up with you regarding your request shortly.
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-grey mb-1">Resource Requested *</label>
                  <select 
                    required
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value)}
                    className="w-full p-3 bg-alice-blue/50 border border-grey/20 focus:border-orange focus:outline-none transition-colors rounded-sm"
                  >
                    <option value="collaboration">Technical Collaboration</option>
                    <option value="project_ppt">Project PPT</option>
                    <option value="competition_brochure">Competition Brochure</option>
                    <option value="cost_report">Sponsorship Cost Details (Manual Review)</option>
                  </select>
                  {resourceType === 'cost_report' && (
                    <p className="text-xs text-orange mt-2 italic">* This document requires manual approval and is not publicly downloadable.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-grey mb-1">Full Name *</label>
                    <input type="text" required className="w-full p-3 bg-alice-blue/50 border border-grey/20 focus:border-orange focus:outline-none transition-colors rounded-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-grey mb-1">Organization / Role *</label>
                    <input type="text" required className="w-full p-3 bg-alice-blue/50 border border-grey/20 focus:border-orange focus:outline-none transition-colors rounded-sm" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-grey mb-1">Email *</label>
                    <input type="email" required className="w-full p-3 bg-alice-blue/50 border border-grey/20 focus:border-orange focus:outline-none transition-colors rounded-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-widest text-grey mb-1">WhatsApp / Phone</label>
                    <input type="tel" className="w-full p-3 bg-alice-blue/50 border border-grey/20 focus:border-orange focus:outline-none transition-colors rounded-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-widest text-grey mb-1">Message</label>
                  <textarea rows={4} className="w-full p-3 bg-alice-blue/50 border border-grey/20 focus:border-orange focus:outline-none transition-colors rounded-sm resize-none"></textarea>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="consent" required className="accent-orange" />
                <label htmlFor="consent" className="text-xs text-grey font-light">I consent to being contacted regarding this request.</label>
              </div>

              <button 
                type="submit" 
                disabled={formState === 'submitting'}
                className="w-full py-4 bg-jet-black text-alice-blue font-bold uppercase tracking-widest text-sm hover:bg-orange transition-colors disabled:opacity-50"
              >
                {formState === 'submitting' ? 'Submitting...' : 'Submit Request'}
              </button>

            </form>
          )}
        </div>

      </div>
    </main>
  );
}
