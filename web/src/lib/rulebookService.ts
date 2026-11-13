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

// Common EV Scrambler & SIEP technical synonym mappings
const SYNONYMS: Record<string, string[]> = {
  'ground clearance': ['ground clearance', 'clearance', 'inches', '5 inches', 'c.2.1.2'],
  'wheelbase': ['wheelbase', 'wheel base', '48 inches', '62 inches', 'c.2.1.2'],
  'chassis': ['chassis', 'frame', 'tubular', 'spaceframe', 'wall thickness', 'seamed', 'c.3.1', 'c.3.2'],
  'tubing': ['tubes', 'tube', 'wall thickness', 'seamed', '1 mm', 'chromoly'],
  'battery': ['battery', 'accumulator', 'pack', 'cell', 'c.10.5', 'c.10.6', 'c.10.7', 'c.10.8'],
  'kill switch': ['kill switch', 'emergency switch', 'master disconnect', 'c.11.3'],
  'stand': ['paddock stand', 'side stand', 'main stand', 'c.2.3', '78 cm', '50 cm'],
  'paddock': ['paddock stand', 'c.2.3', '78 cm', '50 cm'],
  'brakes': ['brakes', 'hydraulic', 'disc', 'caliper', 'c.5', 'braking'],
  'suspension': ['suspension', 'fork', 'monoshock', 'rake', 'caster', 'c.4.1'],
  'motor': ['motor', 'bldc', 'controller', 'c.10.9', 'c.10.10', 'drivetrain'],
  'hvs': ['hvs', 'high voltage', 'active lamp', 'c.11.1', 'c.11.2', 'insulation'],
  'throttle': ['throttle', 'accelerator', 'c.11.4'],
  'horn': ['horn', 'decibel', 'db', 'c.11.5'],
  'fuse': ['fusing', 'fuse', 'hv fusing', 'c.11.6'],
  'tyre': ['tire', 'tyre', 'rim', 'c.6', 'compound'],
  'mudguard': ['mudguard', 'mud flap', 'c.2.4', 'fender'],
  'weight': ['weight', 'curb weight', 'mass'],
  'registration': ['registration', 'fee', 'deadline', 'b.1', 'eligibility'],
  'scrutiny': ['scrutiny', 'inspection', 'technical inspection', 'b.6'],
  'acceleration': ['acceleration', '50m', 'hill climb', 'dynamic events'],
  'durability': ['durability', 'endurance', '40 km', '50 km'],
};

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
      score += 15;
    }

    // Check individual search terms
    searchTerms.forEach((term) => {
      const occurrences = (textLower.match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      if (occurrences > 0) {
        score += Math.min(occurrences, 5) * 3;
      }
    });

    // Bonus for section numbers matching query
    const sectionMatch = cleanQuery.match(/[a-d]\.[0-9]+(\.[0-9]+)?/);
    if (sectionMatch && textLower.includes(sectionMatch[0])) {
      score += 30;
    }

    return {
      page: p.page,
      text: p.text,
      score,
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
    'rule', 'rulebook', 'regulation', 'specification', 'spec', 'compliance',
    'allowed', 'prohibited', 'compulsory', 'mandatory', 'minimum', 'maximum',
    'ground clearance', 'wheelbase', 'dimensions', 'stand', 'paddock',
    'chassis', 'tube', 'wall thickness', 'thickness', 'battery', 'voltage',
    'kill switch', 'hvs', 'throttle', 'brake', 'suspension', 'inspection',
    'scrutiny', 'isieindia', 'siep', 'season 7', 'weight', 'mudguard',
    'fuse', 'wiring', 'motor', 'controller', 'document', 'esf'
  ];

  return rulebookKeywords.some((kw) => q.includes(kw));
}

/**
 * Parses authoritative citations from text or extracts fallback citation from top-scored page.
 */
export function extractCitations(
  responseText: string,
  topPages: ScoredPage[]
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

  // 3. Fallback: If model failed to output citation block for a rulebook question, derive from top page
  if (citations.length === 0 && topPages.length > 0 && topPages[0].score >= 6) {
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
