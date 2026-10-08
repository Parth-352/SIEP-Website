import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-alice-blue pt-32 pb-24 px-6 md:px-12 lg:px-24 font-sans text-jet-black">
      <div className="max-w-7xl mx-auto">
        
        {/* Hero Section */}
        <section className="mb-32">
          <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tighter leading-[0.85] mb-8 uppercase">
            Riders<br/><span className="text-orange">Bay.</span>
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16 border-t border-jet-black/10 pt-12">
            <div>
              <h2 className="text-sm font-mono tracking-widest text-grey uppercase mb-4">The Identity</h2>
              <p className="text-2xl font-light leading-relaxed">
                We are an engineering collective born from <span className="font-semibold">SNJB’s KBJ College of Engineering, Chandwad</span>. 
              </p>
            </div>
            <div>
              <h2 className="text-sm font-mono tracking-widest text-grey uppercase mb-4">The Mission</h2>
              <p className="text-xl text-grey font-light leading-relaxed">
                United by a singular mission to accelerate the future of electric mobility through student innovation, rigorous testing, and practical, ground-up engineering.
              </p>
            </div>
          </div>
        </section>

        {/* The Project & Methodology */}
        <section className="mb-32 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-16">
            <div>
              <h2 className="text-[10px] tracking-widest uppercase text-orange font-mono mb-4 block">01 / The Project</h2>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">The Smart Scrambler.</h3>
              <p className="text-lg text-grey font-light leading-relaxed">
                We are engineering a high-performance electric Scrambler from the ground up for the prestigious SIEP E-Bike Challenge 2026–27. This machine embodies rugged capability, intelligent energy systems, and advanced rider safety dynamics.
              </p>
            </div>
            <div>
              <h2 className="text-[10px] tracking-widest uppercase text-orange font-mono mb-4 block">02 / Methodology</h2>
              <h3 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Design. Test. Fabricate.</h3>
              <p className="text-lg text-grey font-light leading-relaxed">
                Every component is rigorously simulated in CAD before manufacturing. Our workflow mandates strict testing standards, ensuring structural integrity, thermal management, and power delivery are flawless before the wheels touch the ground.
              </p>
            </div>
          </div>
          
          <div className="lg:col-span-7 flex flex-col justify-center">
            <div className="pl-8 md:pl-16 border-l-[3px] border-orange">
              <h2 className="text-[10px] tracking-widest uppercase text-grey font-mono mb-8 block">Engineering Philosophy</h2>
              <blockquote className="text-3xl md:text-5xl font-bold tracking-tighter leading-[1.1] text-jet-black">
                &quot;Our goal is not just to participate, but to <span className="text-orange">innovate</span>. We bridge the gap between theoretical knowledge and real-world application.&quot;
              </blockquote>
            </div>
          </div>
        </section>

        {/* Mentorship & Impact */}
        <section className="mb-32 grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-jet-black/10 pt-24">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-6">Mentorship & Team</h2>
            <p className="text-lg text-grey font-light leading-relaxed mb-6">
              Guided by experienced faculty and industry mentors, Riders Bay operates like a modern engineering firm. Our cross-disciplinary team spans mechanical design, powertrain engineering, software development, and project logistics.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-6">Why It Matters</h2>
            <p className="text-lg text-grey font-light leading-relaxed">
              We are shaping the next generation of engineers. By designing complex electric vehicle architectures, our students gain invaluable experience that immediately translates to the rapidly evolving EV industry.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center border-t border-jet-black/10 pt-24">
          <h2 className="text-4xl font-bold tracking-tight mb-8">Support the Vision.</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact" className="px-8 py-4 bg-jet-black text-alice-blue text-sm uppercase tracking-widest font-bold hover:bg-orange transition-colors">
              Partner With Us
            </Link>
            <Link href="/bike" className="px-8 py-4 border border-jet-black text-jet-black text-sm uppercase tracking-widest font-bold hover:bg-jet-black hover:text-alice-blue transition-colors">
              Explore The Bike
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
