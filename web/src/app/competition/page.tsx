"use client";

import Link from 'next/link';
import Image from 'next/image';

export default function CompetitionPage() {
  return (
    <main className="min-h-screen bg-alice-blue pt-32 pb-24 font-sans text-jet-black overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-12 lg:px-16 space-y-20 md:space-y-32">
        
        {/* Hero Section */}
        <section className="border-b border-jet-black/10 pb-12">
          <span className="text-xs font-mono uppercase tracking-[0.25em] text-orange font-bold mb-4 block">
            SIEP E-Bike Challenge Season 7.0 (2026–27)
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-jet-black tracking-tighter leading-[0.9] mb-6 uppercase">
            The Proving<br /><span className="text-orange">Ground.</span>
          </h1>
          <p className="text-lg md:text-xl text-grey font-light leading-relaxed max-w-2xl mb-8">
            India’s leading student electric bike design competition organized by the Imperial Society of Innovative Engineers (ISIEINDIA). A platform to design, manufacture, and test a fully functional self-manufactured electric bike.
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <span className="px-3 py-1.5 sm:py-1 bg-jet-black text-alice-blue text-xs uppercase font-bold tracking-widest">Self-Manufactured Class</span>
            <span className="px-3 py-1.5 sm:py-1 bg-orange/20 text-orange text-xs uppercase font-bold tracking-widest">National Level</span>
          </div>
        </section>

        {/* Evaluation Criteria */}
        <section>
          <h2 className="text-[10px] tracking-widest uppercase text-grey font-mono mb-8 md:mb-12 block border-b border-grey/20 pb-4">How The Machine is Evaluated</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            <div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-3 sm:mb-4 text-orange">01. Engineering Design</h3>
              <ul className="space-y-2 text-sm text-grey font-light">
                <li>• Design Concept & CAD</li>
                <li>• Chassis & Structure</li>
                <li>• Ergonomics & Safety</li>
                <li>• Suspension & Steering</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-3 sm:mb-4 text-orange">02. Electric Powertrain</h3>
              <ul className="space-y-2 text-sm text-grey font-light">
                <li>• Motor Selection & Tuning</li>
                <li>• Battery & BMS Architecture</li>
                <li>• Wiring Integrity</li>
                <li>• Energy Efficiency</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-3 sm:mb-4 text-orange">03. Fabrication</h3>
              <ul className="space-y-2 text-sm text-grey font-light">
                <li>• Build Quality & Methods</li>
                <li>• Component Integration</li>
                <li>• Finishing & Aesthetics</li>
                <li>• Overall Reliability</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-3 sm:mb-4 text-orange">04. Cost & Business</h3>
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
        <section className="border-b border-jet-black/10 pb-16 md:pb-24">
          <div className="mb-10 md:mb-14">
            <span className="text-xs font-mono uppercase tracking-[0.25em] text-orange font-bold mb-3 block">
              The Proving Ground // Dynamic Rounds
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-jet-black tracking-tight mb-4">
              Dynamic Performance <span className="text-orange">Tests.</span>
            </h2>
            <p className="text-base sm:text-lg text-grey font-light leading-relaxed max-w-2xl">
              Six mandatory track evaluations testing raw acceleration, gradeability, autonomous balance, and single-charge endurance under extreme competition scrutiny.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: "01",
                category: "SPRINT DYNAMICS",
                title: "Acceleration Test",
                desc: "Evaluates the vehicle's acceleration on a straight line over a distance of 50m on flat pavement from a standstill start.",
                metricLabel: "Course Distance",
                metricValue: "50m Flat Track"
              },
              {
                id: "02",
                category: "GRADEABILITY",
                title: "Hill Climb Test",
                desc: "Tests the gradient traveling ability against a 40-degree total inclination, proving powertrain torque and vehicle dynamics under extreme load.",
                metricLabel: "Maximum Incline",
                metricValue: "40° Total Grade"
              },
              {
                id: "03",
                category: "SUSPENSION & CHASSIS",
                title: "Off-Road Test",
                desc: "Pushes suspension dynamics to the limit through mud trails, deep potholes (140mm), and severe speed breakers without structural compromise.",
                metricLabel: "Obstacle Spec",
                metricValue: "140mm Potholes"
              },
              {
                id: "04",
                category: "GYRO & STABILITY",
                title: "Self-Balancing Run",
                desc: "Riders must complete a sharp turning track without using their legs. The bike must not topple and must remain standstill at the finish line.",
                metricLabel: "Footfall Rule",
                metricValue: "0 Touch (Strict)"
              },
              {
                id: "05",
                category: "AUTONOMOUS LOGIC",
                title: "Driverless Parking",
                desc: "Vehicles must navigate into a narrow patch using voice activation or remote-controlled mechanisms without rider intervention.",
                metricLabel: "Control Mode",
                metricValue: "Voice / Remote VCU"
              },
              {
                id: "06",
                category: "ENDURANCE // FINAL",
                title: "Durability Test",
                subtitle: "The Ultimate Trial",
                desc: "Vehicles must run continuously for 40-50 Kms on a single charge. Any electrical breakdown or mechanical failure results in severe penalties or elimination.",
                metricLabel: "Target Range",
                metricValue: "40–50 Km Run",
                isUltimate: true
              }
            ].map((test) => (
              <div 
                key={test.id} 
                className={`relative group bg-white border rounded-2xl p-6 sm:p-7 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 ${
                  test.isUltimate 
                    ? 'border-orange/50 shadow-md hover:shadow-2xl hover:border-orange bg-gradient-to-br from-white via-orange/[0.02] to-orange/[0.06]' 
                    : 'border-jet-black/10 hover:border-orange/60 hover:shadow-xl'
                }`}
              >
                {/* Top Header Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 pb-4 mb-4 border-b border-jet-black/5">
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md tracking-wider ${
                      test.isUltimate ? 'bg-orange text-alice-blue shadow-sm' : 'bg-orange/10 text-orange'
                    }`}>
                      ROUND {test.id}
                    </span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-grey font-semibold">
                      {test.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-xl text-jet-black tracking-tight mb-2 group-hover:text-orange transition-colors">
                    {test.title}
                  </h3>

                  {test.subtitle && (
                    <span className="inline-block text-[11px] font-mono uppercase font-bold text-orange tracking-widest mb-3">
                      [{test.subtitle}]
                    </span>
                  )}

                  <p className="text-sm text-grey font-light leading-relaxed mb-6">
                    {test.desc}
                  </p>
                </div>

                {/* Bottom Metric Pill */}
                <div className="pt-4 border-t border-jet-black/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-grey font-medium">{test.metricLabel}</span>
                  <span className={`font-bold ${test.isUltimate ? 'text-orange' : 'text-jet-black'}`}>
                    {test.metricValue}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Detailed Timeline */}
        <section className="overflow-hidden">
          <h2 className="text-[10px] tracking-widest uppercase text-grey font-mono mb-8 md:mb-12 block border-b border-grey/20 pb-4">Roadmap to Season 7.0</h2>
          <div className="space-y-10 md:space-y-12 border-l-2 border-orange pl-6 md:pl-8 ml-3 sm:ml-4 md:ml-0 relative">
            
            <div className="relative">
              <div className="absolute -left-[33px] md:-left-[41px] top-1 w-4 h-4 bg-alice-blue border-[3px] border-orange rounded-full"></div>
              <p className="text-orange font-mono text-xs uppercase tracking-widest mb-1">15 July 2026</p>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2">Phase 2 Registration Opens</h3>
              <p className="text-grey font-light text-sm md:text-base">Official entry into the competition. Team formation and rulebook analysis begins.</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[33px] md:-left-[41px] top-1 w-4 h-4 bg-alice-blue border-[3px] border-orange rounded-full"></div>
              <p className="text-orange font-mono text-xs uppercase tracking-widest mb-1">10 August 2026</p>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2">Registration Deadline</h3>
            </div>

            <div className="relative">
              <div className="absolute -left-[33px] md:-left-[41px] top-1 w-4 h-4 bg-alice-blue border-[3px] border-orange rounded-full"></div>
              <p className="text-orange font-mono text-xs uppercase tracking-widest mb-1">October & November 2026</p>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2">Design & Technical Report Submissions</h3>
              <p className="text-grey font-light text-sm md:text-base">Submission of critical engineering documents: CAD Models, Thermal Analysis, DFMEA, Electrical System Forms (ESF), and Cost Reports.</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[33px] md:-left-[41px] top-1 w-4 h-4 bg-alice-blue border-[3px] border-orange rounded-full"></div>
              <p className="text-orange font-mono text-xs uppercase tracking-widest mb-1">December 2026</p>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2">Video Submission & Scrutiny</h3>
              <p className="text-grey font-light text-sm md:text-base">Mandatory video proof of chassis manufacturing, part mounting, and preliminary testing.</p>
            </div>

            <div className="relative">
              <div className="absolute -left-[33px] md:-left-[41px] top-1 w-4 h-4 bg-alice-blue border-[3px] border-orange rounded-full"></div>
              <p className="text-orange font-mono text-xs uppercase tracking-widest mb-1">January 2027</p>
              <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2">College Level Technical Inspection</h3>
            </div>

            <div className="relative">
              <div className="absolute -left-[33px] md:-left-[41px] top-1 w-4 h-4 bg-orange rounded-full shadow-[0_0_12px_rgba(255,179,71,0.8)]"></div>
              <p className="text-orange font-mono text-xs uppercase tracking-widest mb-1 break-words">Jan – Feb 2027 // Galgotias University, Greater Noida</p>
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">The Final Event</h3>
              <p className="text-grey font-light text-sm md:text-base">The physical manifestation of engineering. Dynamic testing, endurance runs, business presentations, and final awards.</p>
            </div>
            
          </div>
        </section>

        {/* Sponsors */}
        <section className="pt-20 md:pt-32 pb-12 md:pb-16 border-t border-jet-black/10 overflow-hidden">
          <div className="max-w-[90rem] mx-auto px-4 sm:px-6 flex flex-col items-center">
            
            <div className="flex items-center gap-3 sm:gap-6 mb-12 md:mb-16 w-full max-w-4xl">
              <div className="h-[1px] bg-jet-black/10 flex-1 min-w-[12px]"></div>
              <h2 className="text-[10px] tracking-[0.2em] sm:tracking-[0.3em] uppercase text-grey font-mono font-bold text-center shrink-0">
                Official SIEP Sponsors & Partners
              </h2>
              <div className="h-[1px] bg-jet-black/10 flex-1 min-w-[12px]"></div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-8 sm:gap-x-12 sm:gap-y-16 md:gap-x-20 md:gap-y-24 w-full">
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
                <div key={idx} className="relative w-20 sm:w-28 md:w-40 lg:w-48 h-10 sm:h-12 md:h-16 lg:h-20 group">
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
        <section className="pt-12 md:pt-16 text-center">
          <Link href="/contact" className="inline-flex items-center justify-center w-full sm:w-auto text-center px-8 py-4 min-h-[44px] bg-jet-black text-alice-blue font-bold hover:bg-orange transition-colors uppercase tracking-widest text-sm shadow-xl">
            Request Competition Brochure
          </Link>
        </section>

      </div>
    </main>
  );
}
