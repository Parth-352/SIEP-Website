import { RulebookCitation } from '@/lib/rulebookService';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isRulebook?: boolean;
  citations?: RulebookCitation[];
  timestamp: string;
}

export const COPILOT_QUICK_PROMPTS = [
  'Minimum ground clearance & wheelbase?',
  'Paddock & side stand rules',
  'Chassis tubing & wall thickness',
  'Kill switch & HVS lamp rules',
  'Our bike specs (motor & battery)',
  'Team roster & leadership',
];
