export interface ContactPerson {
  name: string;
  role: string;
  phone?: string | null;
  photoUrl?: string;
}

export const SUPPORT_AREAS = [
  { label: "Financial Aid", desc: "Direct funding for raw materials, competition registration, and high-voltage components." },
  { label: "Components & Manufacturing", desc: "Raw AISI 4130 steel, 4-axis CNC machining, composite fairings, and precision welding." },
  { label: "Technical Mentorship", desc: "Engineering consultation on powertrain dynamics, BMS cell balancing, and vehicle diagnostics." },
  { label: "Software & Sensor Hardware", desc: "Simulation software licenses (FEA/CFD), CAN bus transceivers, and IoT sensor hardware." },
  { label: "Testing Track & Dyno Access", desc: "Dynamometer chassis dyno runs, closed-track endurance trials, and thermal stress testing." },
  { label: "Logistics & Competition Transit", desc: "Safe transport and pit infrastructure for the electric scrambler to national competition." },
];

export const KNOWN_PHONES: Record<string, string> = {
  'tirthraj pawale': '+91 9271647536',
  'meet samdadiya': '+91 7058471449',
  'meet jain': '+91 7058471449',
  'pratik desarda': '+91 9307740350',
  'parth kshirsagar': '+91 9271647536',
  'riddhi munot': '+91 9271647536',
  'yashodhan joshi': '+91 9271647536',
};

// Initial verified baseline (Mentor, Captain, Vice Captain only)
export const INITIAL_TEAM_CONTACTS: ContactPerson[] = [
  { name: "Prof. Deore H.S.", role: "Faculty Mentor & Advisor", phone: null },
  { name: "Tirthraj Pawale", role: "Team Captain", phone: "+91 9271647536" },
  { name: "Pratik Desarda", role: "Vice Captain", phone: "+91 9307740350" },
];
