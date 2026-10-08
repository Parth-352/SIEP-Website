import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen font-sans">
      
      {/* Light Section */}
      <div className="bg-alice-blue pt-32 pb-32 px-6 md:px-12 lg:px-24 text-jet-black">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <section className="mb-32">
            <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tighter leading-[0.85] mb-8 uppercase">
              Riders<br/><span className="text-orange">Bay.</span>
            </h1>
            {/* Identity & Mission (Asymmetric Layout) */}
            <div className="mt-16 border-t border-jet-black/10 pt-16 flex flex-col lg:flex-row justify-between gap-12 lg:gap-24 mb-32">
              <div className="lg:w-2/3">
                <h2 className="text-[10px] tracking-widest uppercase text-grey font-mono mb-6 block">The Identity</h2>
                <p className="text-3xl md:text-5xl font-light leading-[1.2] tracking-tight text-jet-black/80">
                  We are an engineering collective born from <span className="font-bold text-jet-black">SNJB’s KBJ College of Engineering, Chandwad</span>. 
                </p>
              </div>
              <div className="lg:w-1/3 pt-2 lg:pt-12 border-t lg:border-t-0 lg:border-l border-jet-black/10 lg:pl-12">
                <h2 className="text-[10px] tracking-widest uppercase text-grey font-mono mb-4 block">The Mission</h2>
                <p className="text-lg text-jet-black/70 font-light leading-relaxed">
                  United by a singular mission to accelerate the future of electric mobility through student innovation, rigorous testing, and practical, ground-up engineering.
                </p>
              </div>
            </div>
          </section>

          {/* The Project & Methodology (Staggered Layout) */}
          <section className="flex flex-col gap-24">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
              {/* The Project (Large, Left-Aligned) */}
              <div className="md:col-span-7 md:pr-12">
                <h2 className="text-[10px] tracking-widest uppercase text-orange font-mono mb-4 block">01 / The Project</h2>
                <h3 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">The Smart Scrambler.</h3>
                <p className="text-xl text-jet-black/80 font-light leading-relaxed">
                  We are engineering a high-performance electric Scrambler from the ground up for the prestigious SIEP E-Bike Challenge 2026–27. This machine embodies rugged capability, intelligent energy systems, and advanced rider safety dynamics.
                </p>
              </div>
              
              {/* Methodology (Offset, Pushed Down, Right-Aligned Grid) */}
              <div className="md:col-span-5 md:mt-32">
                <div className="bg-white p-8 md:p-10 rounded-xl border border-jet-black/10 shadow-sm relative">
                  <div className="absolute top-0 right-10 w-px h-16 bg-orange -translate-y-full"></div>
                  <h2 className="text-[10px] tracking-widest uppercase text-orange font-mono mb-4 block">02 / Methodology</h2>
                  <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Design. Test. Fabricate.</h3>
                  <p className="text-base text-jet-black/70 font-light leading-relaxed">
                    Every component is rigorously simulated in CAD before manufacturing. Our workflow mandates strict testing standards, ensuring structural integrity, thermal management, and power delivery are flawless before the wheels touch the ground.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Bottom row: The Philosophy */}
            <div className="w-full border-t border-jet-black/10 pt-16 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-3">
                <h2 className="text-[10px] tracking-widest uppercase text-grey font-mono mb-2 block">Engineering Philosophy</h2>
                <p className="text-sm text-grey font-light">The core mandate driving the team forward.</p>
              </div>
              <div className="md:col-span-9">
                <blockquote className="text-2xl md:text-4xl font-light tracking-tight leading-tight text-jet-black border-l-2 border-orange pl-8 md:pl-12 py-2">
                  &quot;Our goal is not just to participate, but to <span className="font-bold text-orange">innovate</span>. We bridge the gap between theoretical knowledge and real-world application.&quot;
                </blockquote>
              </div>
            </div>

          </section>
        </div>
      </div>

      {/* Dark Section */}
      <div className="bg-jet-black pt-32 pb-32 px-6 md:px-12 lg:px-24 text-alice-blue">
        <div className="max-w-7xl mx-auto">
          
          {/* Mentorship & Impact */}
          <section className="mb-32 grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-[10px] tracking-widest uppercase text-orange font-mono mb-4 block">03 / The Team</h2>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Mentorship & Structure</h3>
              <p className="text-lg text-alice-blue/70 font-light leading-relaxed mb-6">
                Guided by experienced faculty and industry mentors, Riders Bay operates like a modern engineering firm. Our cross-disciplinary team spans mechanical design, powertrain engineering, software development, and project logistics.
              </p>
            </div>
            <div>
              <h2 className="text-[10px] tracking-widest uppercase text-orange font-mono mb-4 block">04 / The Impact</h2>
              <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">Why It Matters</h3>
              <p className="text-lg text-alice-blue/70 font-light leading-relaxed">
                We are shaping the next generation of engineers. By designing complex electric vehicle architectures, our students gain invaluable experience that immediately translates to the rapidly evolving EV industry.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center border-t border-alice-blue/10 pt-24">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 uppercase">Support the Vision.</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact" className="px-8 py-4 bg-orange text-jet-black text-sm uppercase tracking-widest font-bold hover:bg-white transition-colors">
                Partner With Us
              </Link>
              <Link href="/bike" className="px-8 py-4 border border-alice-blue text-alice-blue text-sm uppercase tracking-widest font-bold hover:bg-white hover:text-jet-black transition-colors">
                Explore The Bike
              </Link>
            </div>
          </section>

        </div>
      </div>

    </main>
  );
}
