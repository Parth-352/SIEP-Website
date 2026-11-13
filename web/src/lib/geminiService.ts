import { TeamId, MaterialCategory } from './types';
import { TEAMS } from './teams';

export interface DocumentAnalysisResult {
  teamId: TeamId;
  teamName: string;
  category: MaterialCategory;
  tags: string[];
  summary: string;
  source: 'gemini' | 'heuristic';
  confidence: number;
}

// Technical keyword dictionary for fallback rule-based bifurcation
const DOMAIN_KEYWORDS: Record<TeamId, string[]> = {
  software: [
    'software', 'firmware', 'code', 'telemetry', 'iot', 'mqtt', 'can', 'can-bus',
    'obd', 'frontend', 'backend', 'api', 'cloud', 'dashboard', 'ota', 'esp32',
    'stm32', 'arduino', 'bluetooth', 'ble', 'react', 'nextjs', 'algorithm', 'app'
  ],
  entc: [
    'entc', 'electronics', 'circuit', 'pcb', 'schematic', 'microcontroller', 'sensor',
    'wiring', 'harness', 'motor controller', 'inverter', 'mosfet', 'igbt', 'resistor',
    'capacitor', 'current sensor', 'hall effect', 'voltage', 'dc-dc', 'converter'
  ],
  mechanical: [
    'mechanical', 'chassis', 'frame', 'suspension', 'swingarm', 'damper', 'shock',
    'weld', 'fea', 'ansys', 'stress', 'strain', 'yield', 'tensile', 'rigidity',
    'torsion', 'cromoly', 'aluminum', 'alloy', 'bearing', 'bush', 'geometry', 'fork'
  ],
  design: [
    'design', 'cad', '3d', 'model', 'step', 'stp', 'stl', 'solidworks', 'fusion360',
    'blender', 'styling', 'fairing', 'bodywork', 'aerodynamic', 'render', 'ergonomics',
    'blueprint', 'dxf', 'dwg', 'catia'
  ],
  research: [
    'research', 'paper', 'journal', 'study', 'methodology', 'experiment', 'analysis',
    'simulation', 'cfd', 'thermal', 'battery chemistry', 'cell', 'bms', 'lifepo4',
    'nmc', 'lithium', 'runaway', 'state of charge', 'soc', 'soh', 'cooling'
  ],
  sponsorship: [
    'sponsorship', 'sponsor', 'budget', 'cost', 'quotation', 'bom', 'bill of materials',
    'vendor', 'procurement', 'invoice', 'financial', 'proposal', 'pitch', 'deck',
    'partnership', 'funds', 'pricing'
  ],
  documentation: [
    'documentation', 'rulebook', 'siep', 'isieindia', 'compliance', 'regulation',
    'guideline', 'standard', 'ais-156', 'iso', 'sae', 'dft', 'edr', 'fdr',
    'checklist', 'report', 'submission', 'manual'
  ],
  socialmedia: [
    'social', 'media', 'marketing', 'poster', 'banner', 'video', 'teaser', 'launch',
    'instagram', 'linkedin', 'press', 'branding', 'campaign', 'graphic'
  ],
  core: [
    'core', 'management', 'roadmap', 'schedule', 'gantt', 'milestone', 'strategy',
    'leadership', 'team structure', 'overview'
  ],
};

const CATEGORY_EXTENSIONS: Record<string, MaterialCategory> = {
  step: 'cad',
  stp: 'cad',
  stl: 'cad',
  sldprt: 'cad',
  sldasm: 'cad',
  f3d: 'cad',
  blend: 'cad',
  pdf: 'research',
  doc: 'reports',
  docx: 'reports',
  xls: 'datasheets',
  xlsx: 'datasheets',
  csv: 'datasheets',
  ppt: 'specs',
  pptx: 'specs',
};

/**
 * High-precision heuristic classifier used as instantaneous baseline and Gemini fallback
 */
export function classifyDocumentHeuristically(
  fileName: string,
  description?: string
): DocumentAnalysisResult {
  const text = `${fileName} ${description || ''}`.toLowerCase();
  const ext = fileName.split('.').pop()?.toLowerCase() || '';

  // 1. Determine Category
  let category: MaterialCategory = CATEGORY_EXTENSIONS[ext] || 'other';
  if (text.includes('datasheet') || text.includes('pinout') || text.includes('spec sheet')) {
    category = 'datasheets';
  } else if (text.includes('paper') || text.includes('thesis') || text.includes('journal') || text.includes('thermal') || text.includes('bms')) {
    category = 'research';
  } else if (text.includes('report') || text.includes('test result') || text.includes('brief') || text.includes('summary')) {
    category = 'reports';
  } else if (text.includes('cad') || text.includes('3d') || text.includes('assembly') || text.includes('drawing')) {
    category = 'cad';
  } else if (text.includes('specification') || text.includes('standard') || text.includes('rulebook') || text.includes('manual')) {
    category = 'specs';
  }

  // 2. Score Domains
  const scores: Record<TeamId, number> = {
    software: 0,
    entc: 0,
    mechanical: 0,
    design: 0,
    research: 0,
    sponsorship: 0,
    documentation: 0,
    socialmedia: 0,
    core: 0,
  };

  (Object.keys(DOMAIN_KEYWORDS) as TeamId[]).forEach((teamId) => {
    DOMAIN_KEYWORDS[teamId].forEach((keyword) => {
      if (text.includes(keyword)) {
        scores[teamId] += keyword.length > 5 ? 2 : 1;
      }
    });
  });

  // Battery specific booster (maps to research or entc)
  if (text.includes('battery') || text.includes('cell') || text.includes('bms') || text.includes('lifepo4')) {
    scores.research += 4;
    scores.entc += 2;
  }
  if (text.includes('chassis') || text.includes('frame') || text.includes('suspension')) {
    scores.mechanical += 4;
  }
  if (text.includes('controller') || text.includes('motor') || text.includes('inverter')) {
    scores.entc += 3;
    scores.mechanical += 1;
  }

  let bestTeam: TeamId = 'research';
  let maxScore = 0;
  (Object.keys(scores) as TeamId[]).forEach((team) => {
    if (scores[team] > maxScore) {
      maxScore = scores[team];
      bestTeam = team;
    }
  });

  // 3. Extract Tags (Clean technical tags for search indexing)
  const tagsSet = new Set<string>();
  const commonTechnicalTokens = [
    'BMS', 'LiFePO4', 'Thermal Runaway', 'CAN-bus', 'AIS-156', 'FEA', 'SolidWorks',
    'Telematics', 'Motor Controller', 'Inverter', 'Regen', 'Dyno', 'Chassis', 'Suspension',
    'ESP32', 'IoT', 'CAD', 'Datasheet', 'CFD', 'Ansys', 'BLDC', 'Battery Pack',
    'Cell Balancing', 'Wiring Harness', 'Braking System', 'Ergonomics', 'Rulebook'
  ];

  commonTechnicalTokens.forEach((token) => {
    if (text.includes(token.toLowerCase())) {
      tagsSet.add(token);
    }
  });

  // Add category & domain tag
  tagsSet.add(TEAMS[bestTeam]?.code || bestTeam.toUpperCase());
  if (ext) tagsSet.add(ext.toUpperCase());

  // Clean filename words as supplementary tags
  const cleanTokens = fileName
    .replace(/[._\-–()]/g, ' ')
    .split(' ')
    .filter((w) => w.length > 3 && !['pdf', 'docx', 'xlsx', 'file', 'final', 'v1', 'v2', 'copy'].includes(w.toLowerCase()))
    .slice(0, 3);
  cleanTokens.forEach((t) => tagsSet.add(t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()));

  const tags = Array.from(tagsSet).slice(0, 6);

  return {
    teamId: bestTeam,
    teamName: TEAMS[bestTeam]?.name || bestTeam,
    category,
    tags,
    summary: description || `Automated technical index for ${fileName} under ${TEAMS[bestTeam]?.name || bestTeam}.`,
    source: 'heuristic',
    confidence: maxScore > 0 ? Math.min(0.95, 0.5 + maxScore * 0.1) : 0.4,
  };
}

/**
 * Analyzes document with Google's latest Gemini 2.0 Flash API (or configured GEMINI_MODEL),
 * with automatic fallback to Gemini 1.5 Flash and resilient EV engineering heuristics.
 */
export async function analyzeDocumentWithGemini(
  fileName: string,
  description?: string,
  sampleText?: string
): Promise<DocumentAnalysisResult> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    return classifyDocumentHeuristically(fileName, description);
  }

  const prompt = `You are a Chief EV Motorcycle Systems Engineer for "Riders Bay" (ISIEINDIA SIEP Season 7.0 Smart Scrambler Electric Bike).
Analyze this engineering document:
- File Name: "${fileName}"
- Description: "${description || 'None'}"
- Content Preview: "${(sampleText || '').slice(0, 1000)}"

Return a strictly valid JSON object with:
1. "teamId": Choose exactly one from ["mechanical", "entc", "software", "design", "research", "sponsorship", "socialmedia", "documentation"]
2. "category": Choose exactly one from ["research", "specs", "reports", "datasheets", "cad", "other"]
3. "tags": An array of 4 to 7 high-density technical tags/keywords for instant search indexing (e.g. ["BMS", "Thermal Runaway", "LiFePO4", "CAN-bus", "AIS-156"])
4. "summary": A concise 1-2 sentence engineering summary highlighting the key specs or purpose.

Format: Only return raw JSON without markdown or backticks.`;

  // Try latest Gemini 2.0 Flash first, followed by Gemini 1.5 Flash fallback
  const preferredModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const modelsToTry = [preferredModel, 'gemini-1.5-flash'].filter((m, i, arr) => arr.indexOf(m) === i);

  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.15,
            maxOutputTokens: 350,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!res.ok) {
        console.warn(`Gemini API (${model}) returned status ${res.status}. Trying next model/fallback.`);
        continue;
      }

      const json = await res.json();
      const candidateText =
        json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

      if (!candidateText) continue;

      // Strip markdown code fences if present
      const cleanJson = candidateText.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(cleanJson);

      const validTeams: TeamId[] = [
        'mechanical', 'entc', 'software', 'design', 'research',
        'sponsorship', 'socialmedia', 'documentation', 'core'
      ];
      const validCategories: MaterialCategory[] = [
        'research', 'specs', 'reports', 'datasheets', 'cad', 'other'
      ];

      const teamId: TeamId = validTeams.includes(parsed.teamId) ? parsed.teamId : 'research';
      const category: MaterialCategory = validCategories.includes(parsed.category) ? parsed.category : 'research';
      const tags: string[] = Array.isArray(parsed.tags) ? parsed.tags.slice(0, 8) : [];
      const summary: string = parsed.summary || description || fileName;

      return {
        teamId,
        teamName: TEAMS[teamId]?.name || teamId,
        category,
        tags,
        summary,
        source: 'gemini',
        confidence: model.includes('2.0') ? 0.99 : 0.95,
      };
    } catch (err) {
      console.warn(`Error running Gemini model ${model}:`, err);
    }
  }

  return classifyDocumentHeuristically(fileName, description);
}
