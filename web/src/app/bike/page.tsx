import Link from 'next/link';

export default function BikePage() {
  return (
    <main className="min-h-screen bg-alice-blue py-32 px-6 md:px-12 lg:px-24 font-sans text-jet-black">
      <div className="max-w-5xl mx-auto space-y-24">
        
        {/* Hero Section */}
        <section className="border-b border-jet-black/10 pb-12">
          <Link href="/" className="inline-block mb-12 text-sm uppercase tracking-widest text-grey hover:text-orange transition-colors">
            &larr; Back to 3D Experience
          </Link>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-8">
            ENGINEERING<br/><span className="text-orange">DEEP DIVE.</span>
          </h1>
          <p className="text-2xl text-grey font-light leading-relaxed">
            The Smart Scrambler E-Bike. Currently in the Design & Engineering Phase.
          </p>
        </section>

        {/* Feature Grid */}
        <section>
          <h2 className="text-[10px] tracking-widest uppercase text-grey font-mono mb-12 block border-b border-grey/20 pb-4">System Architecture & Smart Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            
            {/* PROPOSED FEATURES */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-orange/20 text-orange text-[10px] uppercase font-bold tracking-widest rounded-sm">Proposed</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Self-Balancing System</h3>
              <p className="text-grey font-light text-sm leading-relaxed">Advanced vehicle stability control utilizing gyroscopic arrays. This system dynamically adjusts the center of mass to maintain equilibrium at zero or low speeds, practically eliminating the risk of toppling.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-orange/20 text-orange text-[10px] uppercase font-bold tracking-widest rounded-sm">Proposed</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Smart Security</h3>
              <p className="text-grey font-light text-sm leading-relaxed">Multi-layered anti-theft architecture featuring real-time geofencing and active vehicle tracking. Any unauthorized movement triggers immediate immobilization protocols and alerts the owner.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-orange/20 text-orange text-[10px] uppercase font-bold tracking-widest rounded-sm">Proposed</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Voice Control</h3>
              <p className="text-grey font-light text-sm leading-relaxed">Seamless hands-free interaction environment. Riders can execute navigation commands, adjust driving modes, and control the dashboard interface entirely via natural language processing.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-orange/20 text-orange text-[10px] uppercase font-bold tracking-widest rounded-sm">Proposed</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Autonomous Assistance</h3>
              <p className="text-grey font-light text-sm leading-relaxed">An intelligent co-pilot system that intervenes during challenging maneuvers. Features include precision hill climb assist to prevent rollback, and low-speed autonomous maneuvering capabilities.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-orange/20 text-orange text-[10px] uppercase font-bold tracking-widest rounded-sm">Proposed</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Energy Intelligence</h3>
              <p className="text-grey font-light text-sm leading-relaxed">A modular, liquid-cooled battery architecture paired with an aggressive Battery Management System (BMS). It optimizes cellular power distribution in real-time for maximum range and thermal safety.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-orange/20 text-orange text-[10px] uppercase font-bold tracking-widest rounded-sm">Proposed</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Remote Control</h3>
              <p className="text-grey font-light text-sm leading-relaxed">Complete vehicle management from your smartphone. Securely lock, unlock, pre-condition the battery temperature, and adjust riding parameters remotely before you even touch the handlebars.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-orange/20 text-orange text-[10px] uppercase font-bold tracking-widest rounded-sm">Proposed</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Driverless Parking</h3>
              <p className="text-grey font-light text-sm leading-relaxed">Fully automated parking assistance. The onboard sensors map the immediate environment, allowing the bike to autonomously maneuver and reverse into tight spaces without rider intervention.</p>
            </div>

            {/* UNDER DEVELOPMENT FEATURES */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-jet-black/10 text-jet-black text-[10px] uppercase font-bold tracking-widest rounded-sm">Under Development</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Predictive Intelligence</h3>
              <p className="text-grey font-light text-sm leading-relaxed">Machine learning algorithms dedicated to predictive maintenance. The system analyzes component wear and tear, providing real-time fault diagnostics before a mechanical failure actually occurs.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-jet-black/10 text-jet-black text-[10px] uppercase font-bold tracking-widest rounded-sm">Under Development</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Connected Mobility</h3>
              <p className="text-grey font-light text-sm leading-relaxed">Cloud-integrated telemetry streaming. Riders gain access to high-fidelity GPS tracking, route optimization, and deep post-ride performance analytics mapping throttle response and energy usage.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-jet-black/10 text-jet-black text-[10px] uppercase font-bold tracking-widest rounded-sm">Under Development</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Vehicle Intelligence</h3>
              <p className="text-grey font-light text-sm leading-relaxed">Comprehensive health monitoring of the core powertrain. It continuously evaluates thermal thresholds, motor RPM efficiency, and voltage sag to ensure peak operational safety.</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-jet-black/10 text-jet-black text-[10px] uppercase font-bold tracking-widest rounded-sm">Under Development</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight">Advanced Dynamics</h3>
              <p className="text-grey font-light text-sm leading-relaxed">A suite of active safety interventions including adaptive cruise control, dynamic traction control for varying road conditions, and an anti-lock braking system (ABS) tailored for electric torque delivery.</p>
            </div>

          </div>
        </section>

        {/* Future Scope / Engineering Roadmap */}
        <section className="border-t border-jet-black/10 pt-16">
          <h2 className="text-[10px] tracking-widest uppercase text-grey font-mono mb-16 block border-b border-grey/20 pb-4 text-center">Engineering Roadmap (Future Scope)</h2>
          
          {/* Mobile Fallback (Simple Vertical) */}
          <div className="md:hidden relative border-l border-jet-black/20 ml-6 space-y-12 pb-8">
            <div className="relative pl-8">
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-orange ring-4 ring-alice-blue"></div>
              <span className="text-[10px] uppercase text-orange font-mono mb-2 block">Phase 01</span>
              <h3 className="text-xl font-bold mb-2">Product Development</h3>
              <p className="text-grey font-light text-sm">Transitioning from CAD to physical reality.</p>
            </div>
            <div className="relative pl-8">
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-jet-black/20 ring-4 ring-alice-blue"></div>
              <span className="text-[10px] uppercase text-grey font-mono mb-2 block">Phase 02</span>
              <h3 className="text-xl font-bold mb-2">System Integration</h3>
              <p className="text-grey font-light text-sm">Mounting and integrating the core high-voltage systems.</p>
            </div>
            <div className="relative pl-8">
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-jet-black/20 ring-4 ring-alice-blue"></div>
              <span className="text-[10px] uppercase text-grey font-mono mb-2 block">Phase 03</span>
              <h3 className="text-xl font-bold mb-2">Testing & Validation</h3>
              <p className="text-grey font-light text-sm">Subjecting the rolling chassis to rigorous physical trials.</p>
            </div>
            <div className="relative pl-8">
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-jet-black/20 ring-4 ring-alice-blue"></div>
              <span className="text-[10px] uppercase text-grey font-mono mb-2 block">Phase 04</span>
              <h3 className="text-xl font-bold mb-2">Design Optimization</h3>
              <p className="text-grey font-light text-sm">Iterative engineering based on telemetry and testing.</p>
            </div>
            <div className="relative pl-8">
              <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-jet-black/20 ring-4 ring-alice-blue"></div>
              <span className="text-[10px] uppercase text-grey font-mono mb-2 block">Phase 05</span>
              <h3 className="text-xl font-bold mb-2">Feature Integration</h3>
              <p className="text-grey font-light text-sm">Implementing the high-level smart features and AI.</p>
            </div>
            <div className="relative pl-8">
              <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-jet-black ring-4 ring-alice-blue"></div>
              <span className="text-[10px] uppercase text-grey font-mono mb-2 block">Phase 06</span>
              <h3 className="text-xl font-bold mb-2">Final Homologation</h3>
              <p className="text-grey font-light text-sm">Final assembly and exhaustive safety validation.</p>
            </div>
          </div>

          {/* Desktop Straight-Line U-Turn "Snake" Timeline */}
          <div className="hidden md:flex relative max-w-4xl mx-auto flex-col items-center pb-12">
            
            {/* ROW 1: Text Left, Curve Right */}
            <div className="w-full flex h-40">
              <div className="w-1/2 relative pr-12 text-right">
                {/* Phase 1 Node */}
                <div className="absolute right-[-6px] top-[-6px] w-3 h-3 bg-orange rounded-full z-10 ring-4 ring-alice-blue shadow-sm"></div>
                <span className="text-[10px] tracking-widest uppercase text-orange font-mono mb-2 block -mt-4">Phase 01</span>
                <h3 className="text-xl font-bold tracking-tight mb-2">Product Development</h3>
                <p className="text-grey font-light text-sm leading-relaxed ml-auto max-w-xs">Transitioning from CAD to physical reality. Developing the functional prototype.</p>
              </div>
              <div className="w-1/2 relative">
                {/* Right U-Turn */}
                <div className="absolute top-0 bottom-0 left-0 w-full border-t-2 border-r-2 border-b-2 border-jet-black/20 rounded-r-full"></div>
              </div>
            </div>

            {/* ROW 2: Curve Left, Text Right */}
            <div className="w-full flex h-40">
              <div className="w-1/2 relative">
                {/* Left U-Turn */}
                <div className="absolute top-0 bottom-0 right-0 w-full border-t-2 border-l-2 border-b-2 border-jet-black/20 rounded-l-full"></div>
              </div>
              <div className="w-1/2 relative pl-12 text-left">
                {/* Phase 2 Node */}
                <div className="absolute left-[-6px] top-[-6px] w-3 h-3 bg-jet-black/20 rounded-full z-10 ring-4 ring-alice-blue shadow-sm"></div>
                <span className="text-[10px] tracking-widest uppercase text-grey font-mono mb-2 block -mt-4">Phase 02</span>
                <h3 className="text-xl font-bold tracking-tight mb-2">System Integration</h3>
                <p className="text-grey font-light text-sm leading-relaxed max-w-xs">Mounting and integrating the core high-voltage systems and battery pack.</p>
              </div>
            </div>

            {/* ROW 3: Text Left, Curve Right */}
            <div className="w-full flex h-40">
              <div className="w-1/2 relative pr-12 text-right">
                {/* Phase 3 Node */}
                <div className="absolute right-[-6px] top-[-6px] w-3 h-3 bg-jet-black/20 rounded-full z-10 ring-4 ring-alice-blue shadow-sm"></div>
                <span className="text-[10px] tracking-widest uppercase text-grey font-mono mb-2 block -mt-4">Phase 03</span>
                <h3 className="text-xl font-bold tracking-tight mb-2">Testing & Validation</h3>
                <p className="text-grey font-light text-sm leading-relaxed ml-auto max-w-xs">Subjecting the chassis to rigorous physical trials and durability runs.</p>
              </div>
              <div className="w-1/2 relative">
                {/* Right U-Turn */}
                <div className="absolute top-0 bottom-0 left-0 w-full border-t-2 border-r-2 border-b-2 border-jet-black/20 rounded-r-full"></div>
              </div>
            </div>

            {/* ROW 4: Curve Left, Text Right */}
            <div className="w-full flex h-40">
              <div className="w-1/2 relative">
                {/* Left U-Turn */}
                <div className="absolute top-0 bottom-0 right-0 w-full border-t-2 border-l-2 border-b-2 border-jet-black/20 rounded-l-full"></div>
              </div>
              <div className="w-1/2 relative pl-12 text-left">
                {/* Phase 4 Node */}
                <div className="absolute left-[-6px] top-[-6px] w-3 h-3 bg-jet-black/20 rounded-full z-10 ring-4 ring-alice-blue shadow-sm"></div>
                <span className="text-[10px] tracking-widest uppercase text-grey font-mono mb-2 block -mt-4">Phase 04</span>
                <h3 className="text-xl font-bold tracking-tight mb-2">Design Optimization</h3>
                <p className="text-grey font-light text-sm leading-relaxed max-w-xs">Iterative engineering based on telemetry and physical testing feedback.</p>
              </div>
            </div>

            {/* ROW 5: Text Left, Curve Right */}
            <div className="w-full flex h-40">
              <div className="w-1/2 relative pr-12 text-right">
                {/* Phase 5 Node */}
                <div className="absolute right-[-6px] top-[-6px] w-3 h-3 bg-jet-black/20 rounded-full z-10 ring-4 ring-alice-blue shadow-sm"></div>
                <span className="text-[10px] tracking-widest uppercase text-grey font-mono mb-2 block -mt-4">Phase 05</span>
                <h3 className="text-xl font-bold tracking-tight mb-2">Feature Integration</h3>
                <p className="text-grey font-light text-sm leading-relaxed ml-auto max-w-xs">Implementing the high-level smart features and gyroscopic balancing.</p>
              </div>
              <div className="w-1/2 relative">
                {/* Right U-Turn */}
                <div className="absolute top-0 bottom-0 left-0 w-full border-t-2 border-r-2 border-b-2 border-jet-black/20 rounded-r-full"></div>
              </div>
            </div>

            {/* ROW 6: Final End Point */}
            <div className="w-full flex">
              <div className="w-1/2"></div>
              <div className="w-1/2 relative pl-12 text-left pt-0">
                {/* Phase 6 Node */}
                <div className="absolute left-[-8px] top-[-8px] w-4 h-4 bg-jet-black rounded-full z-10 ring-4 ring-alice-blue shadow-md"></div>
                <span className="text-[10px] tracking-widest uppercase text-grey font-mono mb-2 block -mt-4">Phase 06</span>
                <h3 className="text-xl font-bold tracking-tight mb-2">Final Homologation</h3>
                <p className="text-grey font-light text-sm leading-relaxed max-w-xs">Final assembly, polishing, and exhaustive safety validation to produce the ultimate E-Bike.</p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </main>
  );
}
