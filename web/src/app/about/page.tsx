import Link from 'next/link';
import TeamSection from '@/components/TeamSection';

const JOURNEY_STAGES = [
  { num: '01', title: 'RESEARCH', desc: 'Market analysis and baseline metrics definition.' },
  { num: '02', title: 'CONCEPT', desc: 'Initial sketches, packaging studies, and ergonomics.' },
  { num: '03', title: 'CAD', desc: 'Detailed 3D modeling and structural assembly.' },
  { num: '04', title: 'ENGINEERING', desc: 'FEA, CFD, and subsystem simulation.' },
  { num: '05', title: 'FABRICATION', desc: 'Machining, welding, and component manufacturing.' },
  { num: '06', title: 'INTEGRATION', desc: 'Assembling mechanical and vehicle systems.' },
  { num: '07', title: 'TESTING', desc: 'Real-world validation, dyno runs, and safety checks.' },
  { num: '08', title: 'COMPETITION', desc: 'SIEP E-Bike Challenge 2026-27.' }
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-alice-blue pt-32 pb-24 font-sans text-jet-black">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16">
        
        {/* Hero Section */}
        <section className="mb-24 md:mb-32">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-orange font-bold mb-4 block">
            The Collective &amp; Mission
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-jet-black tracking-tighter leading-[0.9] mb-6 uppercase">
            Riders<br /><span className="text-orange">Bay.</span>
          </h1>
          <p className="text-lg md:text-xl text-grey font-light leading-relaxed max-w-2xl mb-8">
            An engineering collective born from SNJB’s KBJ College of Engineering, Chandwad, dedicated to accelerating electric mobility through practical, ground-up engineering.
          </p>
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

        {/* The 4 Pillars */}
        <section className="mb-32 border-t border-jet-black/10 pt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16">
            
            {/* 01 */}
            <div>
              <h2 className="text-[10px] tracking-widest uppercase text-orange font-mono mb-4 block">01 / The Project</h2>
              <h3 className="text-3xl font-bold tracking-tight mb-6">The Smart Scrambler.</h3>
              <p className="text-lg text-grey font-light leading-relaxed">
                We are engineering a high-performance electric Scrambler from the ground up for the prestigious SIEP E-Bike Challenge 2026–27. This machine embodies rugged capability, intelligent energy systems, and advanced rider safety dynamics.
              </p>
            </div>
            
            {/* 02 */}
            <div>
              <h2 className="text-[10px] tracking-widest uppercase text-orange font-mono mb-4 block">02 / Methodology</h2>
              <h3 className="text-3xl font-bold tracking-tight mb-6">Design. Test. Fabricate.</h3>
              <p className="text-lg text-grey font-light leading-relaxed">
                Every component is rigorously simulated in CAD before manufacturing. Our workflow mandates strict testing standards, ensuring structural integrity, thermal management, and power delivery are flawless before the wheels touch the ground.
              </p>
            </div>

            {/* 03 */}
            <div>
              <h2 className="text-[10px] tracking-widest uppercase text-orange font-mono mb-4 block">03 / The Team</h2>
              <h3 className="text-3xl font-bold tracking-tight mb-6">Guided by Experts.</h3>
              <p className="text-lg text-grey font-light leading-relaxed mb-4">
                Guided by experienced faculty and industry mentors, Riders Bay operates like a modern engineering firm. Our cross-disciplinary team spans mechanical design, powertrain engineering, software development, and project logistics.
              </p>
              <a href="#team" className="inline-flex items-center min-h-[44px] gap-2 text-xs font-mono uppercase tracking-widest text-orange hover:text-jet-black transition-colors font-semibold">
                Explore Roster <span>↓</span>
              </a>
            </div>

            {/* 04 */}
            <div>
              <h2 className="text-[10px] tracking-widest uppercase text-orange font-mono mb-4 block">04 / Impact</h2>
              <h3 className="text-3xl font-bold tracking-tight mb-6">Why It Matters.</h3>
              <p className="text-lg text-grey font-light leading-relaxed">
                We are shaping the next generation of engineers. By designing complex electric vehicle architectures, our students gain invaluable experience that immediately translates to the rapidly evolving EV industry.
              </p>
            </div>

          </div>
        </section>
        
        {/* Philosophy Block */}
        <section className="mb-32">
          <div className="bg-jet-black/5 rounded-sm p-6 md:p-8 md:p-24 flex flex-col items-center justify-center border border-jet-black/10">
            <h2 className="text-[10px] tracking-widest uppercase text-grey font-mono mb-8 block text-center">Engineering Philosophy</h2>
            <blockquote className="text-2xl md:text-3xl md:text-5xl font-bold tracking-tight text-center leading-tight max-w-4xl mx-auto">
              &quot;Our goal is not just to participate, but to <span className="text-orange">innovate</span>. We bridge the gap between theoretical knowledge and real-world application.&quot;
            </blockquote>
          </div>
        </section>

        {/* The Team */}
        <TeamSection />

        {/* Project Journey */}
        <section className="mb-32 border-t border-jet-black/10 pt-24">
          <div className="mb-16">
            <h2 className="text-[10px] tracking-widest uppercase text-orange font-mono mb-4 block">05 / The Roadmap</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-jet-black tracking-tight mb-4">Project Journey</h3>
            <p className="text-lg text-grey font-light max-w-2xl">
              The roadmap from an empty slate to a competition-ready machine.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto mt-24">
            {/* The Vertical Line */}
            <div className="absolute left-[7px] md:left-1/2 top-0 bottom-0 w-[2px] bg-jet-black/10 md:-translate-x-1/2"></div>
            
            <div className="space-y-12 md:space-y-0">
              {JOURNEY_STAGES.map((stage, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div key={stage.num} className="relative flex flex-col md:flex-row md:items-center group py-4 md:py-16">
                    
                    {/* The Node */}
                    <div className="absolute left-[-1px] md:left-1/2 top-6 md:top-1/2 w-4 h-4 bg-alice-blue border-2 border-jet-black group-hover:border-orange group-hover:bg-orange/10 rounded-full md:-translate-x-1/2 md:-translate-y-1/2 transition-all duration-300 z-10 group-hover:scale-150"></div>

                    {/* Mobile Content (Always Left-Aligned) */}
                    <div className="md:hidden w-full pl-10">
                      <span className="text-[10px] font-mono tracking-widest text-orange block mb-1">{stage.num}</span>
                      <h4 className="text-2xl font-bold uppercase text-jet-black mb-2">{stage.title}</h4>
                      <p className="text-grey font-light text-base">
                        {stage.desc}
                      </p>
                    </div>

                    {/* Desktop Content (Alternating) */}
                    <div className="hidden md:flex w-full">
                      {isEven ? (
                        <>
                          <div className="w-1/2 pr-16 text-right flex flex-col justify-center">
                            <span className="text-[10px] font-mono tracking-widest text-orange block mb-2">{stage.num}</span>
                            <h4 className="text-3xl font-bold uppercase text-jet-black mb-3">{stage.title}</h4>
                            <p className="text-grey font-light text-lg">
                              {stage.desc}
                            </p>
                          </div>
                          <div className="w-1/2"></div>
                        </>
                      ) : (
                        <>
                          <div className="w-1/2"></div>
                          <div className="w-1/2 pl-16 text-left flex flex-col justify-center">
                            <span className="text-[10px] font-mono tracking-widest text-orange block mb-2">{stage.num}</span>
                            <h4 className="text-3xl font-bold uppercase text-jet-black mb-3">{stage.title}</h4>
                            <p className="text-grey font-light text-lg">
                              {stage.desc}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center border-t border-jet-black/10 pt-24">
          <h2 className="text-4xl font-bold tracking-tight mb-8">Support the Vision.</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/contact" className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-8 py-4 bg-jet-black text-alice-blue text-sm uppercase tracking-widest font-bold hover:bg-orange transition-colors text-center">
              Partner With Us
            </Link>
            <Link href="/bike" className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-8 py-4 border border-jet-black text-jet-black text-sm uppercase tracking-widest font-bold hover:bg-jet-black hover:text-alice-blue transition-colors text-center">
              Explore The Bike
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}
