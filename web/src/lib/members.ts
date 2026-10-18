import { TeamId } from './types';

export interface TeamMemberEntry {
  id: string;
  name: string;
  role: string;
  teamId: TeamId;
  isLead?: boolean;
}

/**
 * Official Team Roster:
 * 23 Student Innovators across 8 specialized domains.
 * All artificial roles removed; strictly labeled Domain Lead or Team Member.
 */
export const ROSTER_MEMBERS: TeamMemberEntry[] = [
  // 1. Software (Domain Lead: Parth Kshirsagar)
  { id: 'soft-parth', name: 'Parth Prashant Kshirsagar', role: 'Domain Lead', teamId: 'software', isLead: true },
  { id: 'soft-samiksha', name: 'Samiksha Vasant Patole', role: 'Team Member', teamId: 'software' },
  { id: 'soft-shravani', name: 'Shravani Chaitanya Gadekar', role: 'Team Member', teamId: 'software' },
  { id: 'soft-riddhi', name: 'Riddhi Niraj Munot', role: 'Team Member', teamId: 'software' },
  { id: 'soft-nishant', name: 'Nishant Rajendra Shinde', role: 'Team Member', teamId: 'software' },

  // 2. EnTC (Domain Lead: Tirthraj Pawale)
  { id: 'entc-tirthraj', name: 'Tirthraj Pawale', role: 'Domain Lead', teamId: 'entc', isLead: true },
  { id: 'entc-ankita', name: 'Bachhav Ankita Rakesh', role: 'Team Member', teamId: 'entc' },
  { id: 'entc-pratik', name: 'Desarda Pratik Sachin', role: 'Team Member', teamId: 'entc' },
  { id: 'entc-nayan', name: 'Nayan Punamchand Jain', role: 'Team Member', teamId: 'entc' },
  { id: 'entc-snehal', name: 'Snehal Ravsaheb Shinde', role: 'Team Member', teamId: 'entc' },
  { id: 'entc-prathamesh-d', name: 'Prathamesh Sanjay Deshmukh', role: 'Team Member', teamId: 'entc' },
  { id: 'entc-prem', name: 'Prem Manohar Chaudhari', role: 'Team Member', teamId: 'entc' },
  { id: 'entc-sharvari', name: 'Sharvari Prashant Bhambar', role: 'Team Member', teamId: 'entc' },
  { id: 'entc-mohit', name: 'Pagar Mohit Yogesh', role: 'Team Member', teamId: 'entc' },

  // 3. Mechanical (Domain Lead: Meet Samdadiya)
  { id: 'mech-meet', name: 'Meet Nayan Samdadiya', role: 'Domain Lead', teamId: 'mechanical', isLead: true },
  { id: 'mech-ganesh', name: 'Ganesh Santosh Sonawane', role: 'Team Member', teamId: 'mechanical' },
  { id: 'mech-mohit', name: 'Pagar Mohit Yogesh', role: 'Team Member', teamId: 'mechanical' },
  { id: 'mech-prathamesh-t', name: 'Prathamesh Vilas Tidake', role: 'Team Member', teamId: 'mechanical' },
  { id: 'mech-siddhesh', name: 'Siddhesh Raskar', role: 'Team Member', teamId: 'mechanical' },
  { id: 'mech-ajay', name: 'Ajay Dilip Kate', role: 'Team Member', teamId: 'mechanical' },
  { id: 'mech-kiran', name: 'Nyaharkar Kiran Balasaheb', role: 'Team Member', teamId: 'mechanical' },

  // 4. Design (Domain Lead: Meet Samdadiya)
  { id: 'dsgn-meet', name: 'Meet Nayan Samdadiya', role: 'Domain Lead', teamId: 'design', isLead: true },
  { id: 'dsgn-aditya', name: 'Aditya Namdeo Fuldeore', role: 'Team Member', teamId: 'design' },
  { id: 'dsgn-prathamesh-t', name: 'Prathamesh Vilas Tidake', role: 'Team Member', teamId: 'design' },
  { id: 'dsgn-prem', name: 'Prem Manohar Chaudhari', role: 'Team Member', teamId: 'design' },
  { id: 'dsgn-siddhesh', name: 'Siddhesh Raskar', role: 'Team Member', teamId: 'design' },

  // 5. Research (Domain Lead: Aditya Fuldeore)
  { id: 'res-aditya', name: 'Aditya Namdeo Fuldeore', role: 'Domain Lead', teamId: 'research', isLead: true },
  { id: 'res-omshri', name: 'Ahire Omshri Shrikant', role: 'Team Member', teamId: 'research' },
  { id: 'res-ankita', name: 'Bachhav Ankita Rakesh', role: 'Team Member', teamId: 'research' },
  { id: 'res-shravani', name: 'Shravani Chaitanya Gadekar', role: 'Team Member', teamId: 'research' },
  { id: 'res-meet', name: 'Meet Nayan Samdadiya', role: 'Team Member', teamId: 'research' },
  { id: 'res-tirthraj', name: 'Tirthraj Pawale', role: 'Team Member', teamId: 'research' },
  { id: 'res-nayan', name: 'Nayan Punamchand Jain', role: 'Team Member', teamId: 'research' },

  // 6. Sponsorship (Domain Lead: Shravani Gadekar)
  { id: 'spon-shravani', name: 'Shravani Chaitanya Gadekar', role: 'Domain Lead', teamId: 'sponsorship', isLead: true },
  { id: 'spon-pratik', name: 'Desarda Pratik Sachin', role: 'Team Member', teamId: 'sponsorship' },
  { id: 'spon-nishant', name: 'Nishant Rajendra Shinde', role: 'Team Member', teamId: 'sponsorship' },
  { id: 'spon-snehal', name: 'Snehal Ravsaheb Shinde', role: 'Team Member', teamId: 'sponsorship' },
  { id: 'spon-meet', name: 'Meet Nayan Samdadiya', role: 'Team Member', teamId: 'sponsorship' },
  { id: 'spon-parth', name: 'Parth Prashant Kshirsagar', role: 'Team Member', teamId: 'sponsorship' },
  { id: 'spon-riddhi', name: 'Riddhi Niraj Munot', role: 'Team Member', teamId: 'sponsorship' },
  { id: 'spon-omshri', name: 'Ahire Omshri Shrikant', role: 'Team Member', teamId: 'sponsorship' },

  // 7. Social Media (Domain Lead: Nishant Shinde)
  { id: 'socm-nishant', name: 'Nishant Rajendra Shinde', role: 'Domain Lead', teamId: 'socialmedia', isLead: true },
  { id: 'socm-nikhil', name: 'Nikhil Prabhakar Patil', role: 'Team Member', teamId: 'socialmedia' },
  { id: 'socm-tirthraj', name: 'Tirthraj Pawale', role: 'Team Member', teamId: 'socialmedia' },
  { id: 'socm-ajay', name: 'Ajay Dilip Kate', role: 'Team Member', teamId: 'socialmedia' },
  { id: 'socm-ankita', name: 'Bachhav Ankita Rakesh', role: 'Team Member', teamId: 'socialmedia' },

  // 8. Documentation (Domain Lead: Pratik Desarda)
  { id: 'docs-pratik', name: 'Desarda Pratik Sachin', role: 'Domain Lead', teamId: 'documentation', isLead: true },
  { id: 'docs-nikhil', name: 'Nikhil Prabhakar Patil', role: 'Team Member', teamId: 'documentation' },
  { id: 'docs-sharvari', name: 'Sharvari Prashant Bhambar', role: 'Team Member', teamId: 'documentation' },
  { id: 'docs-snehal', name: 'Snehal Ravsaheb Shinde', role: 'Team Member', teamId: 'documentation' },
  { id: 'docs-parth', name: 'Parth Prashant Kshirsagar', role: 'Team Member', teamId: 'documentation' },
  { id: 'docs-riddhi', name: 'Riddhi Niraj Munot', role: 'Team Member', teamId: 'documentation' },
  { id: 'docs-ajay', name: 'Ajay Dilip Kate', role: 'Team Member', teamId: 'documentation' },
];

export const ALL_MEMBER_NAMES = Array.from(new Set(ROSTER_MEMBERS.map((m) => m.name)));

export function getMembersForTeam(teamId?: TeamId): TeamMemberEntry[] {
  if (!teamId || teamId === 'core') return ROSTER_MEMBERS;
  return ROSTER_MEMBERS.filter((m) => m.teamId === teamId);
}
