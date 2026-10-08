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
        <section className="bg-jet-black/5 p-8 md:p-16 rounded-sm border border-jet-black/10">
          <h2 className="text-[10px] tracking-widest uppercase text-grey font-mono mb-12 block text-center">Dynamic Performance Tests</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            
            <div>
              <h3 className="font-bold text-lg mb-2">Acceleration Test</h3>
              <p className="text-sm text-grey font-light">Evaluates the vehicle&apos;s acceleration on a straight line over a distance of 50m on flat pavement from a standstill start.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Hill Climb Test</h3>
              <p className="text-sm text-grey font-light">Tests the gradient traveling ability against a 40-degree total inclination, proving powertrain torque and vehicle dynamics.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Off-Road Test</h3>
              <p className="text-sm text-grey font-light">Pushes suspension dynamics to the limit through mud trails, deep potholes (140mm), and severe speed breakers.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Self-Balancing Run</h3>
              <p className="text-sm text-grey font-light">Riders must complete a sharp turning track without using their legs. The bike must not topple and must remain standstill at the finish line.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Driverless Parking</h3>
              <p className="text-sm text-grey font-light">Vehicles must navigate into a narrow patch using voice activation or remote-controlled mechanisms without rider intervention.</p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2 text-orange">Durability Test (The Ultimate Trial)</h3>
              <p className="text-sm text-grey font-light">Vehicles must run continuously for 40-50 Kms on a single charge. Any electrical breakdown or mechanical failure results in severe penalties or elimination.</p>
            </div>

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

        {/* Sponsors Banner */}
        <section className="pt-24 border-t border-jet-black/10 pb-12">
          <div className="flex flex-col items-center w-full max-w-[100rem] mx-auto px-4 md:px-8">
            <h2 className="bg-[#0b1320] text-alice-blue px-8 py-3 text-xs md:text-sm tracking-widest uppercase font-bold mb-8 rounded-sm shadow-lg z-10 -mb-4 relative">
              Sponsors & Partners of SIEP
            </h2>
            
            <div className="flex items-center justify-between w-full bg-white border border-jet-black/10 rounded-xl py-4 md:py-6 px-2 md:px-8 shadow-sm">
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
                <div key={idx} className="flex-1 flex items-center justify-center relative group px-1 md:px-3 h-8 sm:h-12 md:h-16">
                  <div className="relative w-full h-full hover:scale-110 transition-transform duration-300">
                    <Image 
                      src={`/sponsors/${sponsor.file}`} 
                      alt={sponsor.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  {/* Vertical Divider */}
                  {idx !== 9 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[1px] h-2/3 bg-jet-black/10"></div>
                  )}
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
