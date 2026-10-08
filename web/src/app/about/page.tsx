import Link from 'next/link';

const JOURNEY_STAGES = [
  { num: '01', title: 'RESEARCH', desc: 'Market analysis and baseline metrics definition.' },
  { num: '02', title: 'CONCEPT', desc: 'Initial sketches, packaging studies, and ergonomics.' },
  { num: '03', title: 'CAD', desc: 'Detailed 3D modeling and structural assembly.' },
  { num: '04', title: 'ENGINEERING', desc: 'FEA, CFD, and subsystem simulation.' },
  { num: '05', title: 'FABRICATION', desc: 'Machining, welding, and component manufacturing.' },
  { num: '06', title: 'INTEGRATION', desc: 'Assembling mechanical and electrical systems.' },
  { num: '07', title: 'TESTING', desc: 'Real-world validation, dyno runs, and safety checks.' },
  { num: '08', title: 'COMPETITION', desc: 'SIEP E-Bike Challenge 2026-27.' }
];

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
              <p className="text-lg text-grey font-light leading-relaxed">
                Guided by experienced faculty and industry mentors, Riders Bay operates like a modern engineering firm. Our cross-disciplinary team spans mechanical design, powertrain engineering, software development, and project logistics.
              </p>
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
          <div className="bg-jet-black/5 rounded-sm p-8 md:p-24 flex flex-col items-center justify-center border border-jet-black/10">
            <h2 className="text-[10px] tracking-widest uppercase text-grey font-mono mb-8 block text-center">Engineering Philosophy</h2>
            <blockquote className="text-3xl md:text-5xl font-bold tracking-tight text-center leading-tight max-w-4xl mx-auto">
              &quot;Our goal is not just to participate, but to <span className="text-orange">innovate</span>. We bridge the gap between theoretical knowledge and real-world application.&quot;
            </blockquote>
          </div>
        </section>

        {/* Project Journey */}
        <section className="mb-32 border-t border-jet-black/10 pt-24">
          <div className="mb-16">
            <h2 className="text-[10px] tracking-widest uppercase text-orange font-mono mb-4 block">03 / The Roadmap</h2>
            <h3 className="text-4xl md:text-5xl font-bold text-jet-black tracking-tight mb-4">Project Journey</h3>
            <p className="text-lg text-grey font-light max-w-2xl">
              The roadmap from an empty slate to a competition-ready machine.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto mt-24">
            {/* The Vertical Line */}
            <div className="absolute left-[7px] md:left-1/2 top-0 bottom-0 w-[2px] bg-jet-black/10 md:-translate-x-1/2"></div>
            
            <div className="space-y-16 md:space-y-24">
              {JOURNEY_STAGES.map((stage, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div key={stage.num} className={`relative flex flex-col md:flex-row items-start ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} group`}>
                    
                    {/* The Node */}
                    <div className="absolute left-0 md:left-1/2 top-1.5 w-4 h-4 bg-alice-blue border-2 border-jet-black group-hover:border-orange group-hover:bg-orange/10 rounded-full md:-translate-x-1/2 transition-all duration-300 z-10 group-hover:scale-150"></div>

                    {/* Content Box */}
                    <div className={`w-full md:w-1/2 pl-10 md:pl-0 ${isEven ? 'md:pr-16 md:text-right' : 'md:pl-16 md:text-left'}`}>
                      <span className="text-[10px] font-mono tracking-widest text-orange block mb-2">{stage.num}</span>
                      <h4 className="text-2xl md:text-3xl font-bold uppercase text-jet-black mb-3">{stage.title}</h4>
                      <p className="text-grey font-light text-base md:text-lg">
                        {stage.desc}
                      </p>
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
