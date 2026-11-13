import { TeamId } from './types';

export interface TeamMemberEntry {
  id: string;
  name: string; // Clean First + Last Name
  role: string; // Specific official title
  domains: TeamId[]; // All assigned domains with 100% equal standing (no primary/secondary partiality)
  teamId: TeamId; // Retained for backwards-compatibility (matches domains[0])
  secondaryTeams?: TeamId[]; // Retained for backwards-compatibility
  isLead?: boolean;
  isCore?: boolean; // Master administrative scope across all domains
  tier?: 1 | 2 | 3;
  email: string; // Personal Gmail
  password?: string; // Hashed/masked PIN in UI with reveal toggle
  photoUrl?: string; // Profile picture URL
  joinedDate?: string;
  status?: 'active' | 'inactive' | 'revoked';
  updatedAt?: number;
}

/**
 * Returns all assigned domains for a member without any primary/secondary partiality
 */
export function getMemberDomains(m: TeamMemberEntry | { domains?: TeamId[]; teamId?: TeamId; secondaryTeams?: TeamId[] }): TeamId[] {
  if (Array.isArray(m.domains) && m.domains.length > 0) {
    return Array.from(new Set(m.domains));
  }
  const list: TeamId[] = [];
  if (m.teamId) list.push(m.teamId);
  if (Array.isArray(m.secondaryTeams)) {
    m.secondaryTeams.forEach((t) => {
      if (!list.includes(t)) list.push(t);
    });
  }
  return list.length > 0 ? Array.from(new Set(list)) : ['software'];
}

/**
 * Checks whether an email belongs exclusively to Parth Kshirsagar (Master Role & Team Authority)
 */
export function isParthMasterAdmin(email?: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  return clean === 'parthkshirsagrr@gmail.com' || clean === 'parthkshirsagr@gmail.com';
}

/**
 * 4 Core Leadership Members with Master Admin Access across the portal
 */
export const CORE_MEMBER_NAMES = [
  'Tirthraj Pawale',
  'Parth Kshirsagar',
  'Riddhi Munot',
  'Pratik Desarda',
];

export const CORE_MEMBER_EMAILS = [
  'pawaletirthraj@gmail.com',
  'parthkshirsagrr@gmail.com',
  'parthkshirsagr@gmail.com',
  'riddhimunot7@gmail.com',
  'desardapratik7@gmail.com',
];

/**
 * Official 23-Member Directory Baseline
 * Exactly 23 student innovators with clean First + Last names and personal Gmails.
 */
const BASELINE_ROSTER_DATA: Omit<TeamMemberEntry, 'domains'>[] = [
  // ================= TIER 1: CORE LEADERSHIP (4 MEMBERS) =================
  {
    id: 'core-tirthraj',
    name: 'Tirthraj Pawale',
    role: 'Core Lead & Captain',
    teamId: 'core',
    secondaryTeams: ['entc', 'research', 'socialmedia'],
    isLead: true,
    isCore: true,
    email: 'pawaletirthraj@gmail.com',
  },
  {
    id: 'soft-parth',
    name: 'Parth Kshirsagar',
    role: 'Software Lead',
    teamId: 'software',
    secondaryTeams: ['core', 'sponsorship', 'documentation'],
    isLead: true,
    isCore: true,
    email: 'parthkshirsagrr@gmail.com',
  },
  {
    id: 'soft-riddhi',
    name: 'Riddhi Munot',
    role: 'Core Member',
    teamId: 'software',
    secondaryTeams: ['core', 'sponsorship', 'documentation'],
    isLead: false,
    isCore: true,
    email: 'riddhimunot7@gmail.com',
  },
  {
    id: 'docs-pratik',
    name: 'Pratik Desarda',
    role: 'Documentation Lead',
    teamId: 'documentation',
    secondaryTeams: ['core', 'entc', 'sponsorship'],
    isLead: true,
    isCore: true,
    email: 'desardapratik7@gmail.com',
  },

  // ================= TIER 2: DOMAIN LEADS (5 MEMBERS) =================
  {
    id: 'mech-meet',
    name: 'Meet Samdadiya',
    role: 'Mechanical Lead',
    teamId: 'mechanical',
    secondaryTeams: ['design', 'research', 'sponsorship'],
    isLead: true,
    isCore: false,
    email: 'meetjain212@gmail.com',
  },
  {
    id: 'dsgn-prem',
    name: 'Prem Chaudhari',
    role: 'Design Lead',
    teamId: 'design',
    secondaryTeams: ['entc'],
    isLead: true,
    isCore: false,
    email: 'premchaudhari0955@gmail.com',
  },
  {
    id: 'res-aditya',
    name: 'Aditya Fuldeore',
    role: 'Research Lead',
    teamId: 'research',
    secondaryTeams: ['design'],
    isLead: true,
    isCore: false,
    email: 'adityafuldeore0700@gmail.com',
  },
  {
    id: 'spon-shravani',
    name: 'Shravani Gadekar',
    role: 'Sponsorship Lead',
    teamId: 'sponsorship',
    secondaryTeams: ['software', 'research'],
    isLead: true,
    isCore: false,
    email: 'shravani.cg17@gmail.com',
  },
  {
    id: 'socm-nishant',
    name: 'Nishant Shinde',
    role: 'Social Media Lead',
    teamId: 'socialmedia',
    secondaryTeams: ['software', 'sponsorship'],
    isLead: true,
    isCore: false,
    email: 'nishantshinde682@gmail.com',
  },

  // ================= TIER 3: TEAM MEMBERS (14 MEMBERS) =================
  {
    id: 'socm-nikhil',
    name: 'Nikhil Patil',
    role: 'Team Member',
    teamId: 'socialmedia',
    secondaryTeams: ['documentation'],
    isLead: false,
    isCore: false,
    email: 'nikhilpatil93090@gmail.com',
  },
  {
    id: 'entc-nayan',
    name: 'Nayan Jain',
    role: 'Team Member',
    teamId: 'entc',
    secondaryTeams: ['research'],
    isLead: false,
    isCore: false,
    email: 'nayanjain5805@gmail.com',
  },
  {
    id: 'entc-mohit',
    name: 'Mohit Pagar',
    role: 'Team Member',
    teamId: 'entc',
    secondaryTeams: ['mechanical'],
    isLead: false,
    isCore: false,
    email: 'mohitpagar9801@gmail.com',
  },
  {
    id: 'entc-sharvari',
    name: 'Sharvari Bhambar',
    role: 'Team Member',
    teamId: 'entc',
    secondaryTeams: ['documentation'],
    isLead: false,
    isCore: false,
    email: 'sharvarybhambar@gmail.com',
  },
  {
    id: 'res-omshri',
    name: 'Omshri Ahire',
    role: 'Team Member',
    teamId: 'research',
    secondaryTeams: ['sponsorship'],
    isLead: false,
    isCore: false,
    email: 'omshriahire06@gmail.com',
  },
  {
    id: 'entc-ankita',
    name: 'Ankita Bachhav',
    role: 'Team Member',
    teamId: 'entc',
    secondaryTeams: ['research', 'socialmedia'],
    isLead: false,
    isCore: false,
    email: 'ankitabachhav14@gmail.com',
  },
  {
    id: 'entc-snehal',
    name: 'Snehal Shinde',
    role: 'Team Member',
    teamId: 'entc',
    secondaryTeams: ['sponsorship', 'documentation'],
    isLead: false,
    isCore: false,
    email: 'snehallshinde2005@gmail.com',
  },
  {
    id: 'entc-prathamesh-d',
    name: 'Prathamesh Deshmukh',
    role: 'Team Member',
    teamId: 'entc',
    isLead: false,
    isCore: false,
    email: 'prathameshdeshmukh2007@gmail.com',
  },
  {
    id: 'mech-ajay',
    name: 'Ajay Kate',
    role: 'Team Member',
    teamId: 'mechanical',
    secondaryTeams: ['socialmedia', 'documentation'],
    isLead: false,
    isCore: false,
    email: 'ajaykate9922@gmail.com',
  },
  {
    id: 'mech-ganesh',
    name: 'Ganesh Sonawane',
    role: 'Team Member',
    teamId: 'mechanical',
    isLead: false,
    isCore: false,
    email: 'ganeshsonawane8149@gmail.com',
  },
  {
    id: 'soft-samiksha',
    name: 'Samiksha Patole',
    role: 'Team Member',
    teamId: 'software',
    isLead: false,
    isCore: false,
    email: 'samikshapatole63@gmail.com',
  },
  {
    id: 'mech-siddhesh',
    name: 'Siddhesh Raskar',
    role: 'Team Member',
    teamId: 'mechanical',
    secondaryTeams: ['design'],
    isLead: false,
    isCore: false,
    email: 'siddheshraskar72@gmail.com',
  },
  {
    id: 'mech-kiran',
    name: 'Kiran Nyaharkar',
    role: 'Team Member',
    teamId: 'mechanical',
    isLead: false,
    isCore: false,
    email: 'nyaharkarkiran05@gmail.com',
  },
  {
    id: 'mech-prathamesh-t',
    name: 'Prathamesh Tidake',
    role: 'Team Member',
    teamId: 'mechanical',
    secondaryTeams: ['design'],
    isLead: false,
    isCore: false,
    email: 'prathameshvilastidake@gmail.com',
  },
];

export const ROSTER_MEMBERS: TeamMemberEntry[] = BASELINE_ROSTER_DATA.map((m) => ({
  ...m,
  domains: getMemberDomains(m),
}));

export const ALL_MEMBER_NAMES = ROSTER_MEMBERS.map((m) => m.name);

export function getMemberByEmail(email: string): TeamMemberEntry | undefined {
  if (!email) return undefined;
  const clean = email.trim().toLowerCase();
  const normalized = clean === 'parthkshirsagr@gmail.com' ? 'parthkshirsagrr@gmail.com' : clean;
  return ROSTER_MEMBERS.find((m) => m.email.toLowerCase() === normalized || m.email.toLowerCase() === clean);
}

export function getMemberByName(name: string): TeamMemberEntry | undefined {
  if (!name) return undefined;
  const clean = name.trim().toLowerCase();
  return ROSTER_MEMBERS.find(
    (m) =>
      m.name.toLowerCase() === clean ||
      clean.includes(m.name.toLowerCase()) ||
      m.name.toLowerCase().includes(clean)
  );
}

export function isMemberCore(emailOrName: string): boolean {
  if (!emailOrName) return false;
  const clean = emailOrName.trim().toLowerCase();
  const m = ROSTER_MEMBERS.find(
    (mem) => mem.email.toLowerCase() === clean || mem.name.toLowerCase() === clean
  );
  if (m) return Boolean(m.isCore);
  return (
    CORE_MEMBER_EMAILS.some((e) => e.toLowerCase() === clean) ||
    CORE_MEMBER_NAMES.some((n) => n.toLowerCase() === clean)
  );
}

export function isMemberLead(emailOrName: string): boolean {
  if (!emailOrName) return false;
  const clean = emailOrName.trim().toLowerCase();
  const m = ROSTER_MEMBERS.find(
    (mem) => mem.email.toLowerCase() === clean || mem.name.toLowerCase() === clean
  );
  if (m) return Boolean(m.isLead || m.isCore);
  return isMemberCore(emailOrName);
}

export function getMemberTier(emailOrName: string): 1 | 2 | 3 {
  if (isMemberCore(emailOrName)) return 1;
  if (isMemberLead(emailOrName)) return 2;
  return 3;
}

export function getMembersForTeam(teamId?: TeamId): TeamMemberEntry[] {
  if (!teamId || teamId === 'core') return ROSTER_MEMBERS;
  return ROSTER_MEMBERS.filter((m) => getMemberDomains(m).includes(teamId));
}
