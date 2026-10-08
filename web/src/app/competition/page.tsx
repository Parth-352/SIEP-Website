"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function CompetitionPage() {
  return (
    <main className="min-h-screen bg-alice-blue py-32 px-6 md:px-12 lg:px-24 font-sans text-jet-black">
      <div className="max-w-6xl mx-auto space-y-32">
        
        {/* Hero Section */}
        <section className="border-b border-jet-black/10 pb-12">
          <span className="text-[10px] tracking-widest uppercase text-orange font-mono mb-6 block">SIEP E-Bike Challenge Season 7.0 (2026–27)</span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-8">
            THE<br/><span className="text-orange">PROVING GROUND.</span>
          </h1>
          <p className="text-2xl text-grey font-light leading-relaxed max-w-3xl mb-8">
            India’s leading student electric bike design competition organized by the Imperial Society of Innovative Engineers (ISIEINDIA). A platform to design, manufacture, and test a fully functional self-manufactured electric bike.
          </p>
          <div className="flex gap-4">
            <span className="px-3 py-1 bg-jet-black text-alice-blue text-xs uppercase font-bold tracking-widest">Self-Manufactured Class</span>
            <span className="px-3 py-1 bg-orange/20 text-orange text-xs uppercase font-bold tracking-widest">National Level</span>
          </div>
        </section>

        {/* Evaluation Criteria */}
        <section>
          <h2 className="text-[10px] tracking-widest uppercase text-grey font-mono mb-12 block border-b border-grey/20 pb-4">How The Machine is Evaluated</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-4 text-orange">01. Engineering Design</h3>
              <ul className="space-y-2 text-sm text-grey font-light">
                <li>• Design Concept & CAD</li>
                <li>• Chassis & Structure</li>
                <li>• Ergonomics & Safety</li>
                <li>• Suspension & Steering</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-4 text-orange">02. Electric Powertrain</h3>
              <ul className="space-y-2 text-sm text-grey font-light">
                <li>• Motor Selection & Tuning</li>
                <li>• Battery & BMS Architecture</li>
                <li>• Wiring Integrity</li>
                <li>• Energy Efficiency</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-4 text-orange">03. Fabrication</h3>
              <ul className="space-y-2 text-sm text-grey font-light">
                <li>• Build Quality & Methods</li>
                <li>• Component Integration</li>
                <li>• Finishing & Aesthetics</li>
                <li>• Overall Reliability</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight mb-4 text-orange">04. Cost & Business</h3>
              <ul className="space-y-2 text-sm text-grey font-light">
                <li>• Cost Estimation Report</li>
                <li>• Manufacturing Feasibility</li>
                <li>• Marketability Strategy</li>
                <li>• Innovation Approach</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Dynamic Testing Rounds */}
        <section className="bg-jet-black text-alice-blue p-8 md:p-12 lg:p-20 rounded-3xl shadow-2xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-pearl-aqua/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          
          <div className="mb-16 md:mb-24 relative z-10">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-grey font-mono mb-4 block">The Proving Ground</h2>
            <h3 className="text-3xl md:text-5xl font-bold tracking-tighter">Dynamic Performance Tests</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {[
              { title: "Acceleration Test", desc: "Evaluates the vehicle's acceleration on a straight line over a distance of 50m on flat pavement from a standstill start." },
              { title: "Hill Climb Test", desc: "Tests the gradient traveling ability against a 40-degree total inclination, proving powertrain torque and vehicle dynamics." },
              { title: "Off-Road Test", desc: "Pushes suspension dynamics to the limit through mud trails, deep potholes (140mm), and severe speed breakers." },
              { title: "Self-Balancing Run", desc: "Riders must complete a sharp turning track without using their legs. The bike must not topple and must remain standstill at the finish line." },
              { title: "Driverless Parking", desc: "Vehicles must navigate into a narrow patch using voice activation or remote-controlled mechanisms without rider intervention." },
              { title: "Durability Test", subtitle: "(The Ultimate Trial)", desc: "Vehicles must run continuously for 40-50 Kms on a single charge. Any electrical breakdown or mechanical failure results in severe penalties or elimination.", isUltimate: true }
            ].map((test, idx) => (
              <div key={idx} className="relative group cursor-default bg-white/[0.02] border border-white/[0.05] p-8 md:p-10 rounded-2xl hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500 overflow-hidden flex flex-col justify-between h-full min-h-[280px]">
                
                {/* Content */}
                <div className="relative z-10">
                  <div className={`w-8 h-1 mb-6 rounded-full transition-colors duration-500 ${test.isUltimate ? 'bg-orange' : 'bg-white/20 group-hover:bg-white/60'}`}></div>
                  <h3 className={`font-bold text-2xl mb-4 tracking-tight ${test.isUltimate ? 'text-orange' : 'text-alice-blue'}`}>
                    {test.title} {test.subtitle && <span className="block text-sm opacity-80 mt-1 font-mono font-normal tracking-widest">{test.subtitle}</span>}
                  </h3>
                  <p className="text-sm text-grey font-light leading-relaxed">
                    {test.desc}
                  </p>
                </div>

                {/* Massive Number Background */}
                <div className="text-8xl md:text-9xl font-black text-white/[0.02] font-mono absolute -bottom-6 -right-2 group-hover:text-white/[0.06] transition-colors duration-500 pointer-events-none select-none leading-none tracking-tighter">
                  0{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Timeline */}
        <section>
          <h2 className="text-[10px] tracking-widest uppercase text-grey font-mono mb-12 block border-b border-grey/20 pb-4">Roadmap to Season 7.0</h2>
          <div className="space-y-12 border-l-2 border-orange pl-8 relative">
            
            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-4 h-4 bg-alice-blue border-[3px] border-orange rounded-full"></div>
              <p className="text-orange font-mono text-xs uppercase tracking-widest mb-1">15 July 2026</p>
              <h3 className="text-2xl font-bold tracking-tight mb-2">Phase 2 Registration Opens</h3>
              <p className="text-grey font-light">Official entry into the competition. Team formation and rulebook analysis begins.</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-4 h-4 bg-alice-blue border-[3px] border-orange rounded-full"></div>
              <p className="text-orange font-mono text-xs uppercase tracking-widest mb-1">10 August 2026</p>
              <h3 className="text-2xl font-bold tracking-tight mb-2">Registration Deadline</h3>
            </div>

            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-4 h-4 bg-alice-blue border-[3px] border-orange rounded-full"></div>
              <p className="text-orange font-mono text-xs uppercase tracking-widest mb-1">October & November 2026</p>
              <h3 className="text-2xl font-bold tracking-tight mb-2">Design & Technical Report Submissions</h3>
              <p className="text-grey font-light">Submission of critical engineering documents: CAD Models, Thermal Analysis, DFMEA, Electrical System Forms (ESF), and Cost Reports.</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-4 h-4 bg-alice-blue border-[3px] border-orange rounded-full"></div>
              <p className="text-orange font-mono text-xs uppercase tracking-widest mb-1">December 2026</p>
              <h3 className="text-2xl font-bold tracking-tight mb-2">Video Submission & Scrutiny</h3>
              <p className="text-grey font-light">Mandatory video proof of chassis manufacturing, part mounting, and preliminary testing.</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-4 h-4 bg-alice-blue border-[3px] border-orange rounded-full"></div>
              <p className="text-orange font-mono text-xs uppercase tracking-widest mb-1">January 2027</p>
              <h3 className="text-2xl font-bold tracking-tight mb-2">College Level Technical Inspection</h3>
            </div>

            <div className="relative">
              <div className="absolute -left-[41px] top-1 w-4 h-4 bg-orange rounded-full shadow-[0_0_12px_rgba(255,179,71,0.8)]"></div>
              <p className="text-orange font-mono text-xs uppercase tracking-widest mb-1">Jan – Feb 2027 // Galgotias University, Greater Noida</p>
              <h3 className="text-3xl font-bold tracking-tight mb-2">The Final Event</h3>
              <p className="text-grey font-light">The physical manifestation of engineering. Dynamic testing, endurance runs, business presentations, and final awards.</p>
            </div>
            
          </div>
        </section>

        {/* Sponsors */}
        <section className="pt-32 pb-16 border-t border-jet-black/10">
          <div className="max-w-[90rem] mx-auto px-6 flex flex-col items-center">
            
            <div className="flex items-center gap-6 mb-16 w-full max-w-4xl">
              <div className="h-[1px] bg-jet-black/10 flex-1"></div>
              <h2 className="text-[10px] tracking-[0.3em] uppercase text-grey font-mono font-bold">
                Official SIEP Sponsors & Partners
              </h2>
              <div className="h-[1px] bg-jet-black/10 flex-1"></div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-16 md:gap-x-20 md:gap-y-24 w-full">
              {[
                { name: "Royal Enfield", file: "royal_enfield.png" },
                { name: "Ansys", file: "ansys.png" },
                { name: "EaseMyTrip", file: "easemytrip.png" },
                { name: "Skill AP", file: "skill_ap.png" },
                { name: "SMEV", file: "smev.png" },
                { name: "CK Birla Group", file: "ck_birla.png" },
                { name: "Luminous", file: "luminous.png" },
                { name: "Hero Electric", file: "hero_electric.png" },
                { name: "Roshi Motors", file: "roshi_motors.png" },
                { name: "Altair", file: "altair.png" }
              ].map((sponsor, idx) => (
                <div key={idx} className="relative w-28 md:w-40 lg:w-48 h-12 md:h-16 lg:h-20 group">
                  <Image 
                    src={`/sponsors/${sponsor.file}`} 
                    alt={sponsor.name}
                    fill
                    className="object-contain opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 origin-center"
                  />
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="pt-16 text-center">
          <Link href="/contact" className="inline-block px-8 py-4 bg-jet-black text-alice-blue font-bold hover:bg-orange transition-colors uppercase tracking-widest text-sm shadow-xl">
            Request Competition Brochure
          </Link>
        </section>

      </div>
    </main>
  );
}
