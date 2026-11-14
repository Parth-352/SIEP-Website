export interface TelemetryStat {
  label: string;
  value: string;
  unit: string;
  subtext: string;
  tag: string;
}

export interface SchematicHotspot {
  id: string;
  number: string;
  title: string;
  subsystem: string;
  specs: string;
  description: string;
  x: number; // percentage coordinate 0-100 on schematic
  y: number; // percentage coordinate 0-100 on schematic
}

export interface SubsystemDetail {
  id: string;
  code: string;
  name: string;
  category: string;
  headline: string;
  description: string;
  materials: string[];
  specs: { label: string; value: string }[];
  safetyFactor?: string;
  siepCompliance: string;
}

export interface TechSpecRow {
  category: string;
  parameter: string;
  targetSpec: string;
  unit: string;
  rulebookRef: string;
}

export interface CaeValidationItem {
  id: string;
  title: string;
  simulationType: string;
  targetCriteria: string;
  achievedValue: string;
  safetyMargin: string;
  status: 'validated' | 'in_progress';
  description: string;
}

export interface ProvingGroundTrial {
  id: string;
  code: string;
  title: string;
  targetMetric: string;
  rulebookRequirement: string;
  scramblerApproach: string;
  status: 'Ready' | 'Bench Validated' | 'Track Scheduled';
}

// =========================================================================
// 1. HERO TELEMETRY STATS
// =========================================================================
export const HERO_TELEMETRY_STATS: TelemetryStat[] = [
  {
    label: "Peak Motor Power",
    value: "5.0",
    unit: "kW",
    subtext: "Mid-Drive BLDC with linear torque curve",
    tag: "POWERTRAIN",
  },
  {
    label: "Pack Energy",
    value: "2.88",
    unit: "kWh",
    subtext: "72V 40Ah active-balanced Li-Ion",
    tag: "ENERGY STORAGE",
  },
  {
    label: "Torsional Rigidity",
    value: "1,420",
    unit: "Nm/deg",
    subtext: "AISC 4130 chromoly tubular spaceframe",
    tag: "CHASSIS",
  },
  {
    label: "Max Gradeability",
    value: "40",
    unit: "deg",
    subtext: "ISIE Hill Climb Proving Ground rating",
    tag: "DYNAMICS",
  },
  {
    label: "Obstacle Clearance",
    value: "140",
    unit: "mm",
    subtext: "Torture track pothole & obstacle clearance",
    tag: "SUSPENSION",
  },
  {
    label: "CAN Bus Frequency",
    value: "500",
    unit: "kbps",
    subtext: "CAN 2.0B dual-core ESP32 telemetry node",
    tag: "TELEMETRY",
  },
];

// =========================================================================
// 2. SCHEMATIC HOTSPOTS (Interactive 2D Architecture Blueprint)
// =========================================================================
export const SCHEMATIC_HOTSPOTS: SchematicHotspot[] = [
  {
    id: "hotspot-powertrain",
    number: "01",
    title: "Mid-Drive BLDC Motor",
    subsystem: "Powertrain",
    specs: "5.0 kW Peak | 72V DC | CNC 6061 Mounts",
    description: "Centrally positioned mid-drive BLDC motor delivering high launch torque to the rear wheel through a 428-pitch reinforced roller chain.",
    x: 48,
    y: 62,
  },
  {
    id: "hotspot-battery",
    number: "02",
    title: "72V 40Ah Battery Core",
    subsystem: "Energy Storage",
    specs: "2.88 kWh | Smart Active BMS | IP67 Sealed",
    description: "Low-slung central monocoque enclosure keeping center-of-gravity low for high-speed stability and rapid direction transitions.",
    x: 44,
    y: 44,
  },
  {
    id: "hotspot-chassis",
    number: "03",
    title: "4130 Spaceframe Chassis",
    subsystem: "Structure",
    specs: "1,420 Nm/deg | TIG Welded | >2.3 Safety Factor",
    description: "Lightweight tubular spaceframe fabricated from aircraft-grade AISI 4130 chromoly steel with fishmouth node points.",
    x: 52,
    y: 35,
  },
  {
    id: "hotspot-suspension",
    number: "04",
    title: "Inverted Hydraulic Forks",
    subsystem: "Suspension",
    specs: "High-Travel USD | Pre-Load Adjustable",
    description: "Upside-down telescopic front forks designed to absorb extreme 140mm pothole impacts and rough off-road terrain.",
    x: 74,
    y: 48,
  },
  {
    id: "hotspot-vcu",
    number: "05",
    title: "Central VCU & Telemetry",
    subsystem: "Electronics",
    specs: "ESP32 Dual-Core | 500kbps CAN 2.0B | 50Hz Loop",
    description: "Vehicle Control Unit orchestrating real-time motor throttle curves, BMS thermal loops, and pit-wall cloud data logging.",
    x: 58,
    y: 28,
  },
  {
    id: "hotspot-brakes",
    number: "06",
    title: "Dual Hydraulic & Regen Discs",
    subsystem: "Braking",
    specs: "240mm Front / 220mm Rear | Electronic Regen",
    description: "Dual-circuit hydraulic disc calipers paired with programmable electronic regenerative braking for kinetic energy recapture.",
    x: 24,
    y: 66,
  },
];

// =========================================================================
// 3. SUBSYSTEM ARCHITECTURE DEEP-DIVE (8 Squads)
// =========================================================================
export const SUBSYSTEM_SYSTEMS: SubsystemDetail[] = [
  {
    id: "chassis",
    code: "01 / CHS",
    name: "Chassis & Spaceframe",
    category: "Structural Architecture",
    headline: "AISC 4130 Chromoly Tubular Spaceframe with 1,420 Nm/deg Torsional Rigidity",
    description: "Engineered from raw AISI 4130 aircraft-grade chromoly steel tubes. Every tube intersection is precision-notched with fishmouth joints and TIG welded in an argon-purged atmosphere to maximize penetration. Structural FEA validates a safety factor >2.3 under 20g frontal and 15g lateral impact vectors.",
    materials: ["AISI 4130 Chromoly Steel", "ER70S-6 TIG Filler", "6061-T6 Billet Aluminum Plates"],
    specs: [
      { label: "Torsional Stiffness", value: "1,420 Nm/deg" },
      { label: "Structural Safety Factor", value: "> 2.3 (FEA Validated)" },
      { label: "Front Impact Resistance", value: "20g Frontal Deceleration" },
      { label: "Frame Mass", value: "14.8 kg" },
    ],
    safetyFactor: "2.35x against yield",
    siepCompliance: "Complies with SIEP Rulebook Section 3.2 (Structural Equivalency & Node Triangulation)",
  },
  {
    id: "powertrain",
    code: "02 / PWR",
    name: "Powertrain & Drivetrain",
    category: "Electric Propulsion",
    headline: "5.0 kW Peak Mid-Drive Brushless DC Motor with Custom CNC Reduction",
    description: "High-efficiency Mid-Drive BLDC motor with custom-machined 6061-T6 CNC mounting plates. Direct high-torque transfer to the rear spoked wheel through a heavy-duty 428 pitch chain. Optimized for instant standing-start acceleration in the 0–50m sprint.",
    materials: ["Neodymium Magnet BLDC Stator", "6061-T6 CNC Aluminum", "Hardened Alloy Steel Sprockets"],
    specs: [
      { label: "Peak Power Output", value: "5.0 kW @ 72V" },
      { label: "Motor Efficiency", value: "> 91% Peak" },
      { label: "Final Drive", value: "428 Roller Chain" },
      { label: "Cooling Method", value: "Passive High-Fin Heat Sink" },
    ],
    safetyFactor: "2.1x thermal overload margin",
    siepCompliance: "SIEP Rulebook Section 4.1 (Powertrain Mounting & Drive Shielding)",
  },
  {
    id: "battery",
    code: "03 / BAT",
    name: "72V Battery Monocoque",
    category: "High-Voltage Energy",
    headline: "2.88 kWh Lithium-Ion Pack with Active Cell Balancing & Thermal Containment",
    description: "72V 40Ah high-density lithium-ion battery pack mounted as low as possible inside the primary spaceframe cradle. Minimizes polar moment of inertia for agile scrambler flickability. Protected inside an IP67-rated enclosure with active cell balancing and fire-retardant barriers.",
    materials: ["High-Drain Li-Ion Cells", "Pure Nickel Busbars", "Flame-Retardant Polycarbonate", "IP67 Enclosure"],
    specs: [
      { label: "Nominal Voltage", value: "72 V DC" },
      { label: "Total Pack Energy", value: "2.88 kWh (40 Ah)" },
      { label: "Balancing Current", value: "1.2 A Active Inductive" },
      { label: "Isolation Resistance", value: "> 500 kΩ (Exceeds >500Ω/V)" },
    ],
    safetyFactor: "Meets UN 38.3 & SIEP Rule 4.4",
    siepCompliance: "SIEP Rulebook Section 4.4 (Tractive System Accumulator Isolation & Fusing)",
  },
  {
    id: "telemetry",
    code: "04 / TEL",
    name: "VCU & CAN Telemetry",
    category: "Smart Electronics",
    headline: "Dual-Core ESP32 Central Control Unit with 500 kbps CAN 2.0B Bus",
    description: "Custom Vehicle Control Unit (VCU) developed in-house. Reads hall-effect throttle inputs, applies traction control algorithms, and communicates with the motor inverter and BMS over a high-speed 500 kbps CAN 2.0B bus. Telemetry telemetry packets are broadcast at 50 Hz to both the rider cockpit and the cloud workbench.",
    materials: ["ESP32-S3 Microcontroller", "SN65HVD230 CAN Transceivers", "Shielded Twisted-Pair Loom"],
    specs: [
      { label: "CAN Protocol", value: "CAN 2.0B @ 500 kbps" },
      { label: "Loop Execution Rate", value: "50 Hz (20 ms Cycle)" },
      { label: "Cockpit Interface", value: "High-Contrast OLED Matrix" },
      { label: "Cloud Sync", value: "Real-Time Pit Telemetry" },
    ],
    safetyFactor: "Fail-safe dual return springs on throttle",
    siepCompliance: "SIEP Rulebook Section 5.1 (Electronic Throttle Control & APPS Sensor Disconnect)",
  },
  {
    id: "suspension",
    code: "05 / SUS",
    name: "Suspension & Dynamics",
    category: "Kinematics & Terrain",
    headline: "Inverted Front Telescopic Forks & Progressive Linkage Rear Monoshock",
    description: "Built to handle the demanding SIEP obstacle torture test track. Features inverted hydraulic front forks with high torsional resistance and 160mm of travel, coupled with a progressive rear monoshock capable of absorbing 140mm deep potholes without chassis bottoming.",
    materials: ["Hard Chrome Fork Tubes", "Aluminum Alloy Sliders", "Progressive Spring Steel"],
    specs: [
      { label: "Front Travel", value: "160 mm" },
      { label: "Rear Travel", value: "135 mm (Progressive)" },
      { label: "Ground Clearance", value: "180 mm Unladen" },
      { label: "Pothole Tolerance", value: "140 mm Deep Obstacle" },
    ],
    safetyFactor: "2.4x dynamic bottom-out load",
    siepCompliance: "SIEP Rulebook Section 3.4 (Suspension Travel & Bump Stop Requirements)",
  },
  {
    id: "brakes",
    code: "06 / BRK",
    name: "Braking & Regeneration",
    category: "Hydraulic Dynamics",
    headline: "Dual-Circuit Hydraulic Disc Brakes Paired with Programmable Regenerative Braking",
    description: "Dual independent hydraulic disc brakes (240mm front, 220mm rear) providing safe stopping distances on both asphalt and loose gravel. Electronic regenerative braking engages dynamically during brake lever travel, recycling deceleration energy back into the 72V pack.",
    materials: ["Stainless Steel Drilled Rotors", "Sintered Metallic Pads", "Braided Stainless Steel Lines"],
    specs: [
      { label: "Front Rotor Diameter", value: "240 mm (Floating)" },
      { label: "Rear Rotor Diameter", value: "220 mm (Fixed)" },
      { label: "Stopping Distance (40-0)", value: "< 7.5 meters" },
      { label: "Regen Energy Return", value: "Up to 8% Range Extension" },
    ],
    safetyFactor: "Dual separate hydraulic circuits",
    siepCompliance: "SIEP Rulebook Section 3.6 (Dual Independent Braking System Verification)",
  },
  {
    id: "safety",
    code: "07 / SFT",
    name: "Safety & HVIL Interlocks",
    category: "High-Voltage Safety",
    headline: "Dual Master Disconnect Switches with <100ms High-Voltage Cut-Off",
    description: "Redundant safety architecture featuring emergency Master Disconnect Switches (MDS) accessible from both sides of the vehicle. A hardware High-Voltage Interlock Loop (HVIL) continuously verifies circuit continuity and immediately isolates the 72V contactors in under 100 milliseconds upon any fault.",
    materials: ["Rotary MDS Disconnects", "Hermetic HV Contactors", "Silicone Insulated Loom"],
    specs: [
      { label: "Power Cut Actuation", value: "< 100 ms" },
      { label: "MDS Redundancy", value: "Dual Lateral Disconnects" },
      { label: "Insulation Monitoring", value: "Continuous Ground Fault Detection" },
      { label: "Wiring Loom", value: "Flame-Retardant Braided Sleeve" },
    ],
    safetyFactor: "Dual mechanical & software failsafes",
    siepCompliance: "SIEP Rulebook Section 4.5 (Emergency Shut-Off Buttons & HVIL Circuit)",
  },
  {
    id: "aerodynamics",
    code: "08 / AER",
    name: "Aerodynamics & Ergonomics",
    category: "Body & Thermal",
    headline: "CAD Sculpted Scrambler Composite Fairings with Internal Ram-Air Cooling Ducts",
    description: "Custom CAD-modeled aerodynamic body panels crafted from lightweight composites. Retains classic rugged scrambler ergonomics while channeling oncoming airflow through sculpted ducts directly over the battery pack and motor inverter heatsinks.",
    materials: ["Glass-Fiber Reinforced Composite", "ABS Tank Shroud", "Water-Resistant Ribbed Seat"],
    specs: [
      { label: "Seat Height", value: "810 mm" },
      { label: "Wheelbase", value: "1,340 mm" },
      { label: "Overall Length", value: "2,050 mm" },
      { label: "Body Mass", value: "4.2 kg (All Fairings)" },
    ],
    safetyFactor: "Shatter-resistant composite construction",
    siepCompliance: "SIEP Rulebook Section 3.1 (Vehicle Enclosure & Sharp Edge Mitigation)",
  },
];

// =========================================================================
// 4. FULL TECHNICAL SPECIFICATIONS MATRIX
// =========================================================================
export const SPECIFICATION_CATEGORIES = [
  "All",
  "Powertrain & Electrical",
  "Chassis & Structure",
  "Suspension & Brakes",
  "Dimensions & Weights",
  "Telemetry & Controls",
];

export const FULL_SPECIFICATIONS_TABLE: TechSpecRow[] = [
  // Powertrain & Electrical
  { category: "Powertrain & Electrical", parameter: "Motor Architecture", targetSpec: "Mid-Drive Brushless DC (BLDC)", unit: "Type", rulebookRef: "Rule 4.1" },
  { category: "Powertrain & Electrical", parameter: "Peak Motor Output", targetSpec: "5.0", unit: "kW", rulebookRef: "Rule 4.1" },
  { category: "Powertrain & Electrical", parameter: "Nominal System Voltage", targetSpec: "72", unit: "V DC", rulebookRef: "Rule 4.2" },
  { category: "Powertrain & Electrical", parameter: "Battery Capacity", targetSpec: "40", unit: "Ah", rulebookRef: "Rule 4.4" },
  { category: "Powertrain & Electrical", parameter: "Total Stored Energy", targetSpec: "2.88", unit: "kWh", rulebookRef: "Rule 4.4" },
  { category: "Powertrain & Electrical", parameter: "BMS Balancing Protocol", targetSpec: "Active Inductive Balancing (1.2A)", unit: "Protocol", rulebookRef: "Rule 4.4" },
  { category: "Powertrain & Electrical", parameter: "High-Voltage Isolation", targetSpec: "> 500", unit: "kΩ", rulebookRef: "Rule 4.3" },
  { category: "Powertrain & Electrical", parameter: "Shut-Off Cut Actuation", targetSpec: "< 100", unit: "ms", rulebookRef: "Rule 4.5" },

  // Chassis & Structure
  { category: "Chassis & Structure", parameter: "Chassis Material", targetSpec: "AISI 4130 Aircraft-Grade Chromoly", unit: "Material", rulebookRef: "Rule 3.2" },
  { category: "Chassis & Structure", parameter: "Fabrication Process", targetSpec: "Precision Notched & TIG Welded", unit: "Process", rulebookRef: "Rule 3.2" },
  { category: "Chassis & Structure", parameter: "Torsional Rigidity", targetSpec: "1,420", unit: "Nm/deg", rulebookRef: "Rule 3.2" },
  { category: "Chassis & Structure", parameter: "Frontal Impact Design", targetSpec: "20g Deceleration Vector", unit: "Design Load", rulebookRef: "Rule 3.2" },
  { category: "Chassis & Structure", parameter: "Lateral Impact Design", targetSpec: "15g Lateral Vector", unit: "Design Load", rulebookRef: "Rule 3.2" },
  { category: "Chassis & Structure", parameter: "Structural Safety Factor", targetSpec: "> 2.3", unit: "FS Ratio", rulebookRef: "Rule 3.2" },

  // Suspension & Brakes
  { category: "Suspension & Brakes", parameter: "Front Suspension", targetSpec: "Inverted Telescopic Hydraulic Forks", unit: "Type", rulebookRef: "Rule 3.4" },
  { category: "Suspension & Brakes", parameter: "Front Travel", targetSpec: "160", unit: "mm", rulebookRef: "Rule 3.4" },
  { category: "Suspension & Brakes", parameter: "Rear Suspension", targetSpec: "Progressive Linkage Monoshock", unit: "Type", rulebookRef: "Rule 3.4" },
  { category: "Suspension & Brakes", parameter: "Rear Travel", targetSpec: "135", unit: "mm", rulebookRef: "Rule 3.4" },
  { category: "Suspension & Brakes", parameter: "Front Brake Rotor", targetSpec: "240 mm Hydraulic Disc (Floating)", unit: "Hardware", rulebookRef: "Rule 3.6" },
  { category: "Suspension & Brakes", parameter: "Rear Brake Rotor", targetSpec: "220 mm Hydraulic Disc + Electronic Regen", unit: "Hardware", rulebookRef: "Rule 3.6" },
  { category: "Suspension & Brakes", parameter: "Stopping Distance (40–0 km/h)", targetSpec: "< 7.5", unit: "m", rulebookRef: "Rule 3.6" },

  // Dimensions & Weights
  { category: "Dimensions & Weights", parameter: "Wheelbase", targetSpec: "1,340", unit: "mm", rulebookRef: "Rule 3.1" },
  { category: "Dimensions & Weights", parameter: "Overall Length", targetSpec: "2,050", unit: "mm", rulebookRef: "Rule 3.1" },
  { category: "Dimensions & Weights", parameter: "Seat Height", targetSpec: "810", unit: "mm", rulebookRef: "Rule 3.1" },
  { category: "Dimensions & Weights", parameter: "Unladen Ground Clearance", targetSpec: "180", unit: "mm", rulebookRef: "Rule 3.1" },
  { category: "Dimensions & Weights", parameter: "Pothole Obstacle Clearance", targetSpec: "140", unit: "mm", rulebookRef: "Rule 3.1" },
  { category: "Dimensions & Weights", parameter: "Total Frame Mass", targetSpec: "14.8", unit: "kg", rulebookRef: "Rule 3.2" },

  // Telemetry & Controls
  { category: "Telemetry & Controls", parameter: "Central Processor", targetSpec: "Dual-Core ESP32 Microcontroller", unit: "Architecture", rulebookRef: "Rule 5.1" },
  { category: "Telemetry & Controls", parameter: "CAN Bus Protocol", targetSpec: "CAN 2.0B", unit: "Standard", rulebookRef: "Rule 5.1" },
  { category: "Telemetry & Controls", parameter: "CAN Bus Speed", targetSpec: "500", unit: "kbps", rulebookRef: "Rule 5.1" },
  { category: "Telemetry & Controls", parameter: "Telemetry Broadcast Rate", targetSpec: "50", unit: "Hz", rulebookRef: "Rule 5.2" },
  { category: "Telemetry & Controls", parameter: "Cockpit Instrument Cluster", targetSpec: "Custom High-Contrast OLED", unit: "Hardware", rulebookRef: "Rule 5.2" },
];

// =========================================================================
// 5. CAE & STRUCTURAL VALIDATION DATA
// =========================================================================
export const CAE_VALIDATION_DATA: CaeValidationItem[] = [
  {
    id: "fea-frontal",
    title: "20g Frontal Impact Simulation",
    simulationType: "Non-Linear Explicit Dynamic FEA",
    targetCriteria: "No catastrophic weld failure under 20g deceleration",
    achievedValue: "Peak Von Mises Stress: 312 MPa (Yield: 460 MPa)",
    safetyMargin: "1.47x safety factor at weld roots",
    status: "validated",
    description: "SolidWorks and Ansys FEA meshed at 1.5mm quad elements. Demonstrates progressive crumple protection for the high-voltage battery cradle.",
  },
  {
    id: "fea-torsional",
    title: "Torsional Frame Stiffness Analysis",
    simulationType: "Static Structural Torsional Load",
    targetCriteria: "> 1,200 Nm/deg torsional resistance",
    achievedValue: "1,420 Nm/deg achieved (0.71 deg deflection at 1,000 Nm)",
    safetyMargin: "+18.3% above minimum competition target",
    status: "validated",
    description: "Tested with opposing vertical loads at headstock with rear swingarm clamped rigid. Confirms agile scrambler handling without frame wobble.",
  },
  {
    id: "cfd-thermal",
    title: "Battery & Inverter Thermal CFD",
    simulationType: "Transient Airflow & Conjugate Heat Transfer",
    targetCriteria: "Cell temperature differential < 5°C across all banks at 5 kW continuous",
    achievedValue: "Maximum cell delta: 3.4°C @ 45 km/h ram air",
    safetyMargin: "Peak core temp maintained below 48°C",
    status: "validated",
    description: "Custom composite front fairing guides laminar ram-air directly through the sealed battery cell tunnels and inverter heatsinks.",
  },
];

// =========================================================================
// 6. SIEP PROVING GROUND TRIALS
// =========================================================================
export const SIEP_PROVING_GROUND_TRIALS: ProvingGroundTrial[] = [
  {
    id: "trial-accel",
    code: "EV-01",
    title: "Acceleration & Launch Sprint",
    targetMetric: "0 to 50 meters in < 4.8 seconds",
    rulebookRequirement: "Fast standing-start launch without motor stall or battery voltage sag below 62V.",
    scramblerApproach: "Low final drive ratio paired with linear torque vectoring in the custom VCU.",
    status: "Bench Validated",
  },
  {
    id: "trial-hill",
    code: "EV-02",
    title: "Maximum Incline Hill Climb",
    targetMetric: "Sustained ascent on 40° ramp",
    rulebookRequirement: "Full vehicle stop on 40° incline, followed by clean restart without rollback.",
    scramblerApproach: "Mid-drive BLDC delivers immediate high torque through a reinforced 428 pitch chain.",
    status: "Ready",
  },
  {
    id: "trial-durability",
    code: "EV-03",
    title: "Obstacle & Pothole Torture Track",
    targetMetric: "Clear 140 mm deep potholes at 35 km/h",
    rulebookRequirement: "Continuous laps over cobblestone, staggered bumps, and 140mm deep water-filled potholes.",
    scramblerApproach: "Inverted 160mm travel USD front forks and progressive linkage monoshock.",
    status: "Ready",
  },
  {
    id: "trial-range",
    code: "EV-04",
    title: "Endurance & Energy Efficiency",
    targetMetric: "40–50 km on single 72V 40Ah charge",
    rulebookRequirement: "Multi-hour closed-circuit endurance trial evaluating watt-hour consumption per kilometer.",
    scramblerApproach: "2.88 kWh high-density lithium-ion pack with kinetic regenerative braking.",
    status: "Track Scheduled",
  },
];
