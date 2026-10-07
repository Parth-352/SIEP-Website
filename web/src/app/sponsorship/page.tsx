import Link from 'next/link';

export default function SponsorshipPage() {
  return (
    <main className="min-h-screen bg-alice-blue py-32 px-6 md:px-12 lg:px-24 font-sans text-jet-black">
      <div className="max-w-6xl mx-auto space-y-24">
        
        {/* Hero Section */}
        <section className="border-b border-jet-black/10 pb-12">
          <Link href="/about" className="inline-block mb-12 text-sm uppercase tracking-widest text-grey hover:text-orange transition-colors">
            &larr; Back to About Us
          </Link>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-8">
            PARTNER<br/><span className="text-orange">WITH US.</span>
          </h1>
          <p className="text-2xl text-grey font-light leading-relaxed max-w-3xl">
            Partner with Riders Bay to drive student innovation and shape the future of electric mobility engineering.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
          
          {/* Support Areas */}
          <section>
            <h2 className="text-[10px] tracking-widest uppercase text-grey font-mono mb-8 block border-b border-grey/20 pb-4">Areas of Support</h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-orange mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-1">Financial Support</h3>
                  <p className="text-grey font-light text-sm">Direct funding for vehicle engineering and team logistics.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-orange mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-1">Components & Technology</h3>
                  <p className="text-grey font-light text-sm">Providing specialized EV components, sensors, and hardware.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-orange mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-1">Manufacturing Support</h3>
                  <p className="text-grey font-light text-sm">Assistance with CNC machining, welding, and advanced fabrication.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-orange mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-1">Mentorship & Technical Guidance</h3>
                  <p className="text-grey font-light text-sm">Industry expertise, software access (CAD/FEA), and testing facilities.</p>
                </div>
              </li>
            </ul>
          </section>

          {/* Value for Sponsors */}
          <section>
            <h2 className="text-[10px] tracking-widest uppercase text-grey font-mono mb-8 block border-b border-grey/20 pb-4">Value for Sponsors</h2>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-jet-black mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-1">Brand Recognition</h3>
                  <p className="text-grey font-light text-sm">Acknowledgement in all team communications, PR events, and official project materials.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-jet-black mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-1">Vehicle Visibility</h3>
                  <p className="text-grey font-light text-sm">Prime logo placement on the finalized Smart Scrambler during the national competition.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-jet-black mt-2 flex-shrink-0"></div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-1">Talent Pipeline</h3>
                  <p className="text-grey font-light text-sm">Direct engagement and recruitment opportunities with top emerging engineering talent.</p>
                </div>
              </li>
            </ul>
          </section>
        </div>

        {/* CTA */}
        <section className="border-t border-jet-black/10 pt-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-2">Let's Build the Future Together.</h2>
            <p className="text-grey font-light">We are in the early development phase and open to tailored sponsorship packages.</p>
          </div>
          <Link href="/contact" className="px-8 py-4 bg-jet-black text-alice-blue text-sm uppercase tracking-widest font-bold hover:bg-orange transition-colors whitespace-nowrap">
            Discuss Sponsorship
          </Link>
        </section>

      </div>
    </main>
  );
}
