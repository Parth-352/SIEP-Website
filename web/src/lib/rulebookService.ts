import rulebookData from '../../data/siep_rulebook_index.json';

export interface RulebookPage {
  page: number;
  text: string;
}

export interface RulebookCitation {
  section: string;
  clause?: string;
  page: number;
  topic?: string;
  excerptSnippet?: string;
}

export interface ScoredPage {
  page: number;
  text: string;
  score: number;
}

const pages: RulebookPage[] = (rulebookData as any).pages || [];

// Comprehensive EV Scrambler & SIEP technical synonym mappings
const SYNONYMS: Record<string, string[]> = {
  'ground clearance': ['ground clearance', 'clearance', 'inches', '5 inches', 'c.2.1.2'],
  'wheelbase': ['wheelbase', 'wheel base', '48 inches', '62 inches', 'c.2.1.2'],
  'chassis': ['chassis', 'frame', 'tubular', 'spaceframe', 'wall thickness', 'seamless', 'c.3.1', 'c.3.2', 'double cradle', 'chromoly', '4130'],
  'tubing': ['tubes', 'tube', 'wall thickness', 'seamless', '1 mm', 'chromoly', 'c.3.1', 'c.3.2'],
  'battery': ['battery', 'accumulator', 'pack', 'cell', 'c.10.5', 'c.10.6', 'c.10.7', 'c.10.8', 'enclosure', 'ip67', 'voltage'],
  'kill switch': ['kill switch', 'emergency switch', 'master disconnect', 'c.11.3', 'red switch', 'contactor'],
  'stand': ['paddock stand', 'side stand', 'main stand', 'c.2.3', '78 cm', '50 cm', '54 cm'],
  'paddock': ['paddock stand', 'c.2.3', '78 cm', '50 cm', '54 cm'],
  'brakes': ['brakes', 'hydraulic', 'disc', 'caliper', 'c.5', 'braking', 'stopping distance'],
  'suspension': ['suspension', 'fork', 'monoshock', 'rake', 'caster', 'c.4.1', 'travel'],
  'motor': ['motor', 'bldc', 'controller', 'c.10.9', 'c.10.10', 'drivetrain', 'power'],
  'hvs': ['hvs', 'high voltage', 'active lamp', 'c.11.1', 'c.11.2', 'contactor', 'red warning light'],
  'throttle': ['throttle', 'accelerator', 'potentiometer', 'c.11.4'],
  'horn': ['horn', 'decibel', 'db', 'c.11.5'],
  'fuse': ['fusing', 'fuse', 'hv fusing', 'c.11.6', 'mcb'],
  'tyre': ['tire', 'tyre', 'rim', 'c.6', 'compound'],
  'mudguard': ['mudguard', 'mud flap', 'c.2.4', 'fender'],
  'weight': ['weight', 'curb weight', 'mass', '150 kg'],
  'registration': ['registration', 'fee', 'deadline', 'b.1', 'eligibility'],
  'scrutiny': ['scrutiny', 'inspection', 'technical inspection', 'b.6', 'esf', 'tilt table', 'rain test'],
  'acceleration': ['acceleration', '50m', 'hill climb', 'dynamic events', '40 degree'],
  'durability': ['durability', 'endurance', '40 km', '50 km'],
};

/**
 * Authoritative Vehicle Knowledge Base for Riders Bay Smart Scrambler e-bike
 * Compiled from EVERYTHINGUWANNAKNOW.MD
 */
export const RIDERS_BAY_VEHICLE_KNOWLEDGE = `
TEAM IDENTITY & INSTITUTION:
- Team Name: Riders Bay (Smart Scrambler E-Bike Engineering Collective)
- Institution: SNJB's Late Sau. Kantabai Bhavarlalji Jain College of Engineering (SNJB's KBJ COE), Chandwad, Nashik, Maharashtra, India.
- Competition: ISIEINDIA SIEP E-Bike Challenge Season 7.0 (2026-2027)
- Faculty Mentor: Dr. R. C. Patil
- Team Captain: Parth Kshirsagar (Software / Systems Architecture & Master Admin)
- Vice Captain: Yashodhan Joshi (Mechanical Engineering & Fabrication Lead)
- Total Members: 23 engineering students across 9 specialized squads.

9 ENGINEERING SQUADS:
1. Chassis & Frame: AISC 4130 chromoly spaceframe, TIG welding, FEA stress analysis (Yashodhan Joshi, Harshal Sonawane).
2. Powertrain: 5.0 kW peak Mid-Drive BLDC motor, custom CNC mounting plates, chain drive (Rushikesh Gunjal, Aditya Sancheti).
3. Battery & BMS: 72V 40Ah Li-Ion (~2.88 kWh), active cell balancing, thermal monitoring, dual-side MDS (Pranav Borse, Bhavesh Patel).
4. Electronics & Harness: 12V DC-DC step-down, automotive-grade IP67 wiring harness, relays, fusing (Shreyas Ahire, Rohit Aher).
5. Telemetry & IoT: Dual-core ESP32 microcontrollers, 500 kbps CAN 2.0B bus at 50 Hz, live telemetry dashboard (Parth Kshirsagar, Devendra Shinde).
6. Brakes & Dynamics: Dual hydraulic disc brakes, regenerative braking algorithm (Tejas Patil, Gaurav Bhamare).
7. Suspension: Inverted front telescopic hydraulic forks with preload adjust, rear monoshock, 140 mm pothole tolerance (Omkar Kothawade, Kunal Pawar).
8. Safety & Scrutiny: HVIL safety loop, dual red kill switches, HVS active lamp, ESF documentation (Chetan Khairnar, Sanket Jadhav).
9. Marketing & Sponsorship: Pitch deck, corporate sponsorship, budget, social media (Sakshi Jain, Mansi Bafna).

TECHNICAL SPECIFICATIONS:
- Chassis / Frame: Tubular spaceframe fabricated from AISC 4130 chromoly steel, TIG welded with notched fishmouth joints. Torsional rigidity: 1,420 Nm/deg. Factor of safety > 2.3 under 20g frontal and 15g lateral impact vectors.
- Powertrain: Mid-Drive Brushless DC (BLDC) motor with custom CNC mounting plates. Peak power: 5.0 kW. Heavy-duty reinforced chain drive.
- Battery Pack: 72V nominal, 40 Ah capacity (~2.88 kWh) Lithium-Ion series-parallel pack. Positioned in the lower frame to lower the center of gravity (CG). Features active cell balancing, thermal monitoring, dual emergency Master Disconnect Switches (MDS), and high-voltage interlock loop (HVIL) with <100ms cutoff actuation.
- Telemetry & VCU: Dual-core ESP32 microcontrollers communicating across a 500 kbps CAN 2.0B bus with a 50 Hz refresh cycle, streaming RPM, temperatures, and cell voltages to the digital cluster and pit wall dashboard.
- Suspension: Inverted front telescopic hydraulic forks with adjustable pre-load; rear monoshock with progressive linkage. Designed for high ground clearance capable of tackling 140 mm potholes and rough off-road terrain.
- Brakes: Dual hydraulic disc brakes (front and rear) paired with regenerative braking algorithms to recapture kinetic energy.
- Key Targets: 40° Total Incline (Hill Climb Test), 40-50 km Single-Charge Range (Durability Test), high-torque 0-50m acceleration launch.
- Web Platform: Built with Next.js 16.4.5, React 19, Tailwind CSS v4, Firebase Auth/Firestore, and direct 5 GB Google Drive resumable upload engine.
`;

/**
 * Searches and retrieves the most relevant rulebook pages based on query tokens.
 */
export function searchRulebook(query: string, topK = 4): ScoredPage[] {
  const cleanQuery = query.toLowerCase().trim();
  const tokens = cleanQuery.split(/\s+/).filter((t) => t.length > 2);

  // Expand with synonyms
  const searchTerms = new Set<string>(tokens);
  for (const [key, synList] of Object.entries(SYNONYMS)) {
    if (cleanQuery.includes(key) || tokens.some((t) => key.includes(t))) {
      synList.forEach((s) => searchTerms.add(s.toLowerCase()));
    }
  }

  const scored: ScoredPage[] = pages.map((p) => {
    const textLower = p.text.toLowerCase();
    let score = 0;

    // Check direct query phrases
    if (textLower.includes(cleanQuery)) {
      score += 25;
    }

    // Check individual search terms
    searchTerms.forEach((term) => {
      const occurrences = (textLower.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      if (occurrences > 0) {
        score += Math.min(occurrences, 5) * 4;
      }
    });

    // Bonus for section numbers matching query
    const sectionMatch = cleanQuery.match(/[a-d]\.[0-9]+(\.[0-9]+)?/);
    if (sectionMatch && textLower.includes(sectionMatch[0])) {
      score += 40;
    }

    // Penalize Table of Contents pages (pages 1 to 6) unless specifically queried
    const isTocQuery = cleanQuery.includes('table of contents') || cleanQuery.includes('index') || cleanQuery.includes('toc');
    if (p.page <= 6 && !isTocQuery) {
      score = score * 0.15;
    }

    return {
      page: p.page,
      text: p.text,
      score: Math.round(score),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter((s) => s.score > 0).slice(0, topK);
}

/**
 * Detects whether a question is asking about the rulebook, rules, specifications, or competition requirements.
 */
export function isRulebookQuestion(query: string): boolean {
  const q = query.toLowerCase();
  const rulebookKeywords = [
    'rule', 'rulebook', 'regulation', 'regulation', 'compliance',
    'allowed', 'prohibited', 'compulsory', 'mandatory', 'minimum', 'maximum',
    'ground clearance', 'wheelbase', 'dimensions', 'stand', 'paddock',
    'wall thickness', 'thickness', 'seamless', 'kill switch', 'hvs',
    'active lamp', 'inspection', 'scrutiny', 'isieindia', 'siep',
    'season 7', 'weight limit', 'mudguard', 'esf', 'tilt table',
    'rain test', 'braking distance', 'stopping distance', 'c.2', 'c.3',
    'c.4', 'c.5', 'c.10', 'c.11', 'd.1', 'd.2', 'd.3'
  ];

  return rulebookKeywords.some((kw) => q.includes(kw));
}

/**
 * Detects whether a question is asking about Riders Bay's own vehicle, build, team, or specs.
 */
export function isBikeQuestion(query: string): boolean {
  const q = query.toLowerCase();
  const bikeKeywords = [
    'riders bay', 'our bike', 'our motor', 'our battery', 'our chassis',
    'our scrambler', 'who is', 'captain', 'vice captain', 'mentor',
    'parth', 'yashodhan', 'dr. r. c. patil', 'snjb', 'team members',
    'roster', 'squad', '5kw', '72v', '40ah', 'esp32', 'can bus',
    'materials hub', 'upload', 'drive', 'portal', 'dashboard', 'spec'
  ];

  return bikeKeywords.some((kw) => q.includes(kw));
}

/**
 * Parses authoritative citations from text or extracts fallback citation from top-scored page.
 */
export function extractCitations(
  responseText: string,
  topPages: ScoredPage[],
  isRulebook: boolean = false
): { cleanReply: string; citations: RulebookCitation[] } {
  const citations: RulebookCitation[] = [];

  // 1. Look for machine-readable citation blocks: <<<CITATION:{...}>>>
  const citationRegex = /<<<CITATION:(.*?)>>>/g;
  let match;
  while ((match = citationRegex.exec(responseText)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed.page && parsed.section) {
        citations.push({
          section: parsed.section,
          clause: parsed.clause || '',
          page: Number(parsed.page),
          topic: parsed.topic || '',
        });
      }
    } catch {
      // ignore parse error
    }
  }

  // 2. Look for markdown citation format [RULEBOOK CITATION: Section X | Page Y]
  const textCitationRegex = /\[RULEBOOK CITATION:\s*Section\s*([^|\]]+)\s*\|\s*(?:Article\/Clause\s*([^|\]]+)\s*\|\s*)?Page\s*([0-9]+)\]/gi;
  while ((match = textCitationRegex.exec(responseText)) !== null) {
    const section = match[1].trim();
    const clause = match[2] ? match[2].trim() : '';
    const page = parseInt(match[3], 10);
    if (!citations.some((c) => c.page === page && c.section === section)) {
      citations.push({ section, clause, page });
    }
  }

  // 3. Fallback: ONLY if this is a rulebook question and model omitted citation block
  if (isRulebook && citations.length === 0 && topPages.length > 0 && topPages[0].score >= 6) {
    const topPage = topPages[0];
    const sectionFound = topPage.text.match(/([A-D]\.[0-9]+(\.[0-9]+)?(\.[0-9]+)?)/);
    citations.push({
      section: sectionFound ? sectionFound[1] : 'Section Reference',
      page: topPage.page,
      topic: 'Verified SIEP Rulebook Specification',
    });
  }

  // Clean raw tags from reply text
  const cleanReply = responseText.replace(/<<<CITATION:.*?>>>/g, '').trim();

  return { cleanReply, citations };
}

/**
 * High-precision deterministic fallback synthesizer when Gemini API is unavailable or offline.
 * Produces structured, professional, grounded answers with citations.
 */
export function synthesizeDeterministicReply(
  query: string,
  topPages: ScoredPage[]
): { reply: string; isRulebook: boolean; citations: RulebookCitation[] } {
  const q = query.toLowerCase();

  // 1. Vehicle / Team Questions
  if (isBikeQuestion(query) && !isRulebookQuestion(query)) {
    if (q.includes('captain') || q.includes('team') || q.includes('roster') || q.includes('who') || q.includes('mentor')) {
      const reply = `**Riders Bay Leadership (SNJB's KBJ COE, Chandwad):**

- **Faculty Mentor:** Dr. R. C. Patil
- **Team Captain:** Parth Kshirsagar (Software / Systems Architecture & Master Admin)
- **Vice Captain:** Yashodhan Joshi (Mechanical Engineering & Fabrication Lead)

**Squad Breakdown (23 Members):**
- **Chassis:** Yashodhan Joshi, Harshal Sonawane
- **Powertrain:** Rushikesh Gunjal, Aditya Sancheti
- **Battery & BMS:** Pranav Borse, Bhavesh Patel
- **Electronics:** Shreyas Ahire, Rohit Aher
- **Telemetry & IoT:** Parth Kshirsagar, Devendra Shinde
- **Brakes & Dynamics:** Tejas Patil, Gaurav Bhamare
- **Suspension:** Omkar Kothawade, Kunal Pawar
- **Safety & Scrutiny:** Chetan Khairnar, Sanket Jadhav
- **Marketing & Sponsorship:** Sakshi Jain, Mansi Bafna`;
      return { reply, isRulebook: false, citations: [] };
    }

    if (q.includes('motor') || q.includes('power') || q.includes('drive') || q.includes('chain')) {
      const reply = `Riders Bay uses a **5.0 kW peak Mid-Drive BLDC motor**:

- **Mounting:** Custom CNC-machined 6061-T6 aluminum plates integrated into the spaceframe
- **Transmission:** Heavy-duty reinforced chain drive to the rear sprocket
- **Throttle:** Right-side handlebar potentiometer with instant linear torque mapping
- **Cooling:** Natural convection airflow optimized via fairing ducts`;
      return { reply, isRulebook: false, citations: [] };
    }

    if (q.includes('battery') || q.includes('voltage') || q.includes('pack') || q.includes('bms')) {
      const reply = `Riders Bay runs a custom **72V 40Ah Lithium-Ion battery pack** (~2.88 kWh):

- **Placement:** Centrally mounted in the lower frame cradle for an ultra-low center of gravity (CG)
- **Safety & BMS:** Active cell balancing, multi-point thermal monitoring, dual emergency Master Disconnect Switches (MDS), and <100ms HVIL cutoff actuation`;
      return { reply, isRulebook: false, citations: [] };
    }

    if (q.includes('chassis') || q.includes('frame') || q.includes('rigidity') || q.includes('welding')) {
      const reply = `Riders Bay features an **AISC 4130 Chromoly tubular spaceframe**:

- **Fabrication:** TIG welded with notched fishmouth joints in a double-cradle configuration
- **Torsional Stiffness:** **1,420 Nm/degree**
- **Safety Factor:** **> 2.3** under 20g frontal and 15g lateral impact vectors`;
      return { reply, isRulebook: false, citations: [] };
    }

    // Default overview
    const reply = `**Riders Bay Smart Scrambler E-Bike (SIEP Season 7.0):**

- **Chassis:** AISC 4130 chromoly spaceframe, 1,420 Nm/deg stiffness, FOS > 2.3
- **Powertrain:** 5.0 kW Peak Mid-Drive BLDC motor with chain drive
- **Battery:** 72V 40Ah Li-Ion pack (~2.88 kWh) with smart active BMS and dual MDS
- **Telemetry:** Dual-core ESP32 microcontrollers, 500 kbps CAN 2.0B bus at 50 Hz
- **Suspension:** Inverted front telescopic hydraulic forks, rear monoshock (140 mm pothole clearance)
- **Targets:** 40° hill climb, 40-50 km durability range, 0-50m acceleration launch`;
    return { reply, isRulebook: false, citations: [] };
  }

  // 2. Rulebook Specific Questions
  if (topPages.length > 0) {
    const top = topPages[0];
    const sectionMatch = top.text.match(/([A-D]\.[0-9]+(\.[0-9]+)?(\.[0-9]+)?)/);
    const section = sectionMatch ? sectionMatch[1] : 'Section Reference';
    const page = top.page;

    // Specific known rule syntheses
    if (q.includes('ground clearance') || q.includes('wheelbase') || q.includes('dimensions')) {
      const reply = `The minimum ground clearance for the Self-Manufactured class is **5 inches** (Section C.2.1.2, Page 16).

**Key Dimensions:**
- **Wheelbase:** 48 to 62 inches
- **Max Overall Length:** 80 inches
- **Max Width:** 40 inches
- **Max Height (without rider):** 60 inches
- **Weight Limit:** 150 kg max (no points awarded if bike exceeds 150 kg)`;

      return {
        reply,
        isRulebook: true,
        citations: [{ section: 'C.2.1.2', page: 16, topic: 'Vehicle Dimensions & Ground Clearance' }],
      };
    }

    if (q.includes('paddock') || q.includes('stand')) {
      const reply = `Under **Section C.2.3 (Page 17)**, paddock and side stands are compulsory:

- **Paddock Stand:** Compulsory (max height 78 cm, max length 50 cm, max width 54 cm)
- **Side Stand:** Compulsory for both classes
- **Main Stand:** **Prohibited** on the vehicle`;

      return {
        reply,
        isRulebook: true,
        citations: [{ section: 'C.2.3', page: 17, topic: 'Paddock Stand & Side Stand Regulations' }],
      };
    }

    if (q.includes('kill switch') || q.includes('active lamp') || q.includes('hvs')) {
      const reply = `Under **Section C.11.2 & C.11.3 (Page 32)**, the vehicle requires:

- **Dual Kill Switches (C.11.3):** Two red kill switches (one rider-accessible while seated, one on the side visible from outside)
- **Power Cutoff:** Must immediately disconnect all power except headlight and brake light
- **HVS Active Lamp (C.11.2):** Continuous red indicator light visible to the rider whenever the battery contactor is closed`;

      return {
        reply,
        isRulebook: true,
        citations: [
          { section: 'C.11.3', page: 32, topic: 'Dual Kill Switch Mandate' },
          { section: 'C.11.2', page: 32, topic: 'HVS Active Lamp Requirement' },
        ],
      };
    }

    if (q.includes('chassis') || q.includes('tubing') || q.includes('thickness') || q.includes('pipe')) {
      const reply = `Under **Section C.3.1.2 (Page 17)** for the Self-Manufactured Class:

- **Tubing:** **Seamless tubes only** for all tubular frame members
- **Frame Design:** **Double cradle frame only**, consisting of two continuous main pipes
- **Wall Thickness:** Minimum 1.0 mm inspected during mechanical scrutiny
- **Welds:** 100% penetration with intact joints; cracked/damaged frames are disqualified on the spot`;

      return {
        reply,
        isRulebook: true,
        citations: [{ section: 'C.3.1.2', page: 17, topic: 'Chassis Double Cradle & Seamless Tube Rules' }],
      };
    }

    // Generic rulebook page excerpt synthesis
    const cleanLines = top.text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 15 && !l.toLowerCase().includes('scanned with') && !l.toLowerCase().includes('reserved'));
    const bulletPoints = cleanLines.slice(0, 5).map((l) => `- ${l}`).join('\n');

    const reply = `**Section ${section} (Page ${page}) Requirements:**

${bulletPoints}`;

    return {
      reply,
      isRulebook: true,
      citations: [{ section, page, topic: 'Rulebook Excerpt' }],
    };
  }

  // Conversational fallback
  const reply = `**Hey!** How can I help with the rulebook or bike specs today?`;

  return { reply, isRulebook: false, citations: [] };
}
