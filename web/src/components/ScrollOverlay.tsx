export default function ScrollOverlay() {
  return (
    <div id="timeline-container" className="absolute top-0 left-0 w-full h-[500vh] pointer-events-none font-sans">
      
      {/* 1. Hero Section */}
      <section className="relative h-[100vh] flex flex-col justify-center md:justify-center items-start p-6 pt-32 md:p-24 w-full md:w-1/2">
        <h1 className="text-5xl md:text-8xl font-black text-jet-black tracking-tighter leading-none mb-4 md:mb-6">
          ENGINEERING THE <br/> <span className="text-orange">NEXT RIDE.</span>
        </h1>
        <p className="text-lg md:text-2xl text-grey font-light">
          Build the SIEP E-Bike from concept to machine.
        </p>
      </section>

      {/* Scroll Indicator (Centered perfectly on entire screen) */}
      <div id="scroll-indicator" className="absolute top-[85vh] left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center z-50">
        <div className="bg-jet-black px-4 md:px-6 py-2 rounded-full mb-3 shadow-lg">
          <span className="text-[8px] md:text-[10px] tracking-[0.2em] uppercase text-alice-blue font-bold font-mono whitespace-nowrap">Scroll to Explore</span>
        </div>
        <div className="w-[2px] h-8 md:h-12 bg-jet-black"></div>
      </div>

      {/* 2. Chassis */}
      <section className="h-[100vh] flex flex-col justify-end md:justify-center items-start p-6 pb-24 md:p-24 w-full md:w-1/2">
        <div className="pointer-events-auto bg-alice-blue/60 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-6 md:p-0 rounded-xl">
          <span className="text-[10px] tracking-widest uppercase text-grey font-mono mb-2 block">01 / Structure</span>
          <h2 className="text-4xl md:text-7xl font-bold text-jet-black tracking-tight mb-1 md:mb-2 uppercase">Chassis</h2>
          <h3 className="text-lg md:text-xl text-orange font-medium mb-4 md:mb-6 uppercase tracking-wider">The Foundation</h3>
          <p className="text-grey text-sm md:text-lg font-light max-w-sm">
            Designed in Fusion 360, the chassis defines the structural architecture of the SIEP E-Bike. It supports the core load while maintaining optimal weight distribution.
          </p>
        </div>
      </section>

      {/* 3. Powertrain & Battery */}
      <section className="h-[100vh] flex flex-col justify-end md:justify-center items-start md:items-end text-left md:text-right p-6 pb-24 md:p-24 w-full">
        <div className="pointer-events-auto w-full md:w-1/2 flex flex-col items-start md:items-end bg-alice-blue/60 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-6 md:p-0 rounded-xl">
          <span className="text-[10px] tracking-widest uppercase text-grey font-mono mb-2 block">02 / Energy</span>
          <h2 className="text-4xl md:text-7xl font-bold text-jet-black tracking-tight mb-1 md:mb-2 uppercase">Powertrain</h2>
          <h3 className="text-lg md:text-xl text-orange font-medium mb-4 md:mb-6 uppercase tracking-wider">Motor & Drivetrain</h3>
          <p className="text-grey text-sm md:text-lg font-light max-w-sm">
            Mounting the heart of the machine. The integration requires precise alignment with custom-fabricated mounts, ensuring immediate torque delivery to the rear wheel.
          </p>
        </div>
      </section>

      {/* 4. Systems Integration */}
      <section className="h-[100vh] flex flex-col justify-end md:justify-center items-start p-6 pb-24 md:p-24 w-full md:w-1/2">
        <div className="pointer-events-auto bg-alice-blue/60 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-6 md:p-0 rounded-xl">
          <span className="text-[10px] tracking-widest uppercase text-grey font-mono mb-2 block">03 / Control</span>
          <h2 className="text-4xl md:text-7xl font-bold text-jet-black tracking-tight mb-1 md:mb-2 uppercase">Systems</h2>
          <h3 className="text-lg md:text-xl text-orange font-medium mb-4 md:mb-6 uppercase tracking-wider">Electronics & Braking</h3>
          <p className="text-grey text-sm md:text-lg font-light max-w-sm">
            Suspension, braking, and the electronic controller are introduced. This is where mechanical engineering meets intelligent control systems.
          </p>
        </div>
      </section>

      {/* 5. Final Reveal */}
      <section className="h-[100vh] flex flex-col justify-end md:justify-center items-center text-center p-6 pb-32 md:p-24 w-full">
        <div className="pointer-events-auto mt-0 md:mt-96 bg-alice-blue/60 md:bg-transparent backdrop-blur-md md:backdrop-blur-none p-6 md:p-0 rounded-xl">
          <span className="text-[10px] tracking-widest uppercase text-grey font-mono mb-2 block">04 / Completion</span>
          <h2 className="text-3xl md:text-6xl font-bold text-jet-black tracking-tight mb-2 md:mb-4 uppercase">The Machine is Complete.</h2>
          <p className="text-grey text-sm md:text-xl font-light mb-6 md:mb-8 max-w-lg mx-auto">
            From concept to engineered reality.
          </p>
          <div className="flex justify-center">
            <button className="px-6 md:px-8 py-3 bg-jet-black text-alice-blue text-xs md:text-sm uppercase tracking-wider font-semibold hover:bg-orange transition-colors shadow-lg">
              Explore The Bike
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
