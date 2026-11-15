// web/src/components/team/teamTypes.ts

export type DomainId = 
  | 'software'
  | 'entc'
  | 'mechanical'
  | 'design'
  | 'research'
  | 'sponsorship'
  | 'socialmedia'
  | 'documentation';

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  isMentor?: boolean;
  isCore?: boolean;
  department: string;
  domains: DomainId[];
  leadDomains: DomainId[];
  image?: string;
}

export function normalizeDomainId(id: string): DomainId | null {
  const map: Record<string, DomainId> = {
    software: 'software',
    telemetry: 'software',
    entc: 'entc',
    electronics: 'entc',
    battery: 'entc',
    mechanical: 'mechanical',
    chassis: 'mechanical',
    powertrain: 'mechanical',
    brakes: 'mechanical',
    suspension: 'mechanical',
    design: 'design',
    research: 'research',
    sponsorship: 'sponsorship',
    marketing: 'sponsorship',
    socialmedia: 'socialmedia',
    documentation: 'documentation',
    safety: 'documentation',
  };
  return map[id.toLowerCase()] || null;
}

export const DOMAIN_LABELS: Record<DomainId, string> = {
  software: 'Software',
  entc: 'Electrical & Electronics',
  mechanical: 'Mechanical',
  design: 'Design',
  research: 'Research',
  sponsorship: 'Sponsorship',
  socialmedia: 'Social Media',
  documentation: 'Documentation',
};

export const DOMAIN_FILTER_TABS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Crew' },
  { id: 'software', label: 'Software' },
  { id: 'entc', label: 'Electrical & Electronics' },
  { id: 'mechanical', label: 'Mechanical' },
  { id: 'design', label: 'Design' },
  { id: 'research', label: 'Research' },
  { id: 'sponsorship', label: 'Sponsorship' },
  { id: 'socialmedia', label: 'Social Media' },
  { id: 'documentation', label: 'Documentation' },
];

export interface MobileTeamGroup {
  id: string;
  name: string;
  subtitle: string;
  memberIds: { id: string; role: string; isLead?: boolean; isMentor?: boolean }[];
}
