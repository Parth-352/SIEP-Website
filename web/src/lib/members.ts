import { TeamId } from './types';

export interface TeamMemberEntry {
  id: string;
  name: string;
  role: string;
  teamId: TeamId;
  isLead?: boolean;
}

export const ROSTER_MEMBERS: TeamMemberEntry[] = [
  // 1. Software (Lead: Parth Kshirsagar)
  { id: 'soft-parth', name: 'Parth Kshirsagar', role: 'Software Lead & Telemetry Architect', teamId: 'software', isLead: true },
  { id: 'soft-samiksha', name: 'Samiksha Patole', role: 'Frontend & Dashboard Developer', teamId: 'software' },
  { id: 'soft-shravani', name: 'Shravani Gadekar', role: 'Data & Telemetry Engineer', teamId: 'software' },
  { id: 'soft-riddhi', name: 'Riddhi Munot', role: 'Embedded Software Engineer', teamId: 'software' },
  { id: 'soft-nishant', name: 'Nishant Shinde', role: 'CAN Bus & Sensor Integration', teamId: 'software' },

  // 2. EnTC (Lead: Tirthraj Pawale)
  { id: 'entc-tirthraj', name: 'Tirthraj Pawale', role: 'Vice Captain & EnTC Lead', teamId: 'entc', isLead: true },
  { id: 'entc-ankita', name: 'Ankita Bachhav', role: 'BMS Architecture Engineer', teamId: 'entc' },
  { id: 'entc-pratik', name: 'Pratik Desarda', role: 'Electronics Systems Engineer', teamId: 'entc' },
  { id: 'entc-nayan', name: 'Nayan Jain', role: 'Power Electronics & Inverter', teamId: 'entc' },
  { id: 'entc-snehal', name: 'Snehal Shinde', role: 'Sensor Wiring & Harness', teamId: 'entc' },
  { id: 'entc-prathamesh-d', name: 'Prathamesh Deshmukh', role: 'Microcontroller Firmware', teamId: 'entc' },
  { id: 'entc-prem', name: 'Prem Chaudhari', role: 'Safety Interlocks & Fusing', teamId: 'entc' },
  { id: 'entc-sharvari', name: 'Sharvari Bhambar', role: 'Hardware Testing & QC', teamId: 'entc' },
  { id: 'entc-mohit', name: 'Mohit Pagar', role: 'Telemetry & Circuit Design', teamId: 'entc' },

  // 3. Mechanical (Lead: Meet Samdadiya)
  { id: 'mech-meet', name: 'Meet Samdadiya', role: 'Team Captain & Mechanical Lead', teamId: 'mechanical', isLead: true },
  { id: 'mech-ganesh', name: 'Ganesh Sonawane', role: 'Chassis & Spaceframe Fabrication', teamId: 'mechanical' },
  { id: 'mech-mohit', name: 'Mohit Pagar', role: 'TIG Welding & Prototyping', teamId: 'mechanical' },
  { id: 'mech-prathamesh-t', name: 'Prathamesh Tidake', role: 'Suspension Kinematics & Tuning', teamId: 'mechanical' },
  { id: 'mech-siddhesh', name: 'Siddhesh Raskar', role: 'Braking & Steering Dynamics', teamId: 'mechanical' },
  { id: 'mech-ajay', name: 'Ajay Kate', role: 'Drivetrain & Machining', teamId: 'mechanical' },
  { id: 'mech-kiran', name: 'Kiran Nyaharkar', role: 'Structural Assembly & Fitting', teamId: 'mechanical' },

  // 4. Design (Lead: Meet Samdadiya)
  { id: 'dsgn-meet', name: 'Meet Samdadiya', role: 'Design Lead & CAD Architect', teamId: 'design', isLead: true },
  { id: 'dsgn-aditya', name: 'Aditya Fuldeore', role: 'Aerodynamics & Fairing Modeling', teamId: 'design' },
  { id: 'dsgn-prathamesh-t', name: 'Prathamesh Tidake', role: 'Suspension Geometry Modeling', teamId: 'design' },
  { id: 'dsgn-prem', name: 'Prem Chaudhari', role: 'Ergonomics & Rider Packaging', teamId: 'design' },
  { id: 'dsgn-siddhesh', name: 'Siddhesh Raskar', role: 'Chassis 3D Modeling', teamId: 'design' },

  // 5. Research (Lead: Aditya Fuldeore)
  { id: 'res-aditya', name: 'Aditya Fuldeore', role: 'Research Lead & Simulation Specialist', teamId: 'research', isLead: true },
  { id: 'res-omshri', name: 'Omshri Ahire', role: 'FEA Structural Analysis', teamId: 'research' },
  { id: 'res-ankita', name: 'Ankita Bachhav', role: 'Thermal & Battery Simulation', teamId: 'research' },
  { id: 'res-shravani', name: 'Shravani Gadekar', role: 'Materials & Composites R&D', teamId: 'research' },
  { id: 'res-meet', name: 'Meet Samdadiya', role: 'Dynamic Load Testing', teamId: 'research' },
  { id: 'res-tirthraj', name: 'Tirthraj Pawale', role: 'Motor Efficiency Research', teamId: 'research' },
  { id: 'res-nayan', name: 'Nayan Jain', role: 'Regenerative Braking Analysis', teamId: 'research' },

  // 6. Sponsorship (Lead: Shravani Gadekar)
  { id: 'spon-shravani', name: 'Shravani Gadekar', role: 'Sponsorship Lead & Outreach Head', teamId: 'sponsorship', isLead: true },
  { id: 'spon-pratik', name: 'Pratik Desarda', role: 'Corporate Relations & Budgeting', teamId: 'sponsorship' },
  { id: 'spon-nishant', name: 'Nishant Shinde', role: 'Sponsor Pitch Decks & Proposals', teamId: 'sponsorship' },
  { id: 'spon-snehal', name: 'Snehal Shinde', role: 'Vendor & Industry Partnerships', teamId: 'sponsorship' },
  { id: 'spon-meet', name: 'Meet Samdadiya', role: 'Technical Deliverables Liaison', teamId: 'sponsorship' },
  { id: 'spon-parth', name: 'Parth Kshirsagar', role: 'Digital Sponsorship Collateral', teamId: 'sponsorship' },
  { id: 'spon-riddhi', name: 'Riddhi Munot', role: 'Alumni & Outreach Network', teamId: 'sponsorship' },
  { id: 'spon-omshri', name: 'Omshri Ahire', role: 'Procurement & Financial Audit', teamId: 'sponsorship' },

  // 7. Social Media (Lead: Nishant Shinde)
  { id: 'socm-nishant', name: 'Nishant Shinde', role: 'Social Media Lead & Creative Director', teamId: 'socialmedia', isLead: true },
  { id: 'socm-nikhil', name: 'Nikhil Patil', role: 'Cinematography & Video Production', teamId: 'socialmedia' },
  { id: 'socm-tirthraj', name: 'Tirthraj Pawale', role: 'Technical Storytelling & Reels', teamId: 'socialmedia' },
  { id: 'socm-ajay', name: 'Ajay Kate', role: 'Behind-the-Scenes & Photography', teamId: 'socialmedia' },
  { id: 'socm-ankita', name: 'Ankita Bachhav', role: 'Public Relations & Campaign Copy', teamId: 'socialmedia' },

  // 8. Documentation (Lead: Pratik Desarda)
  { id: 'docs-pratik', name: 'Pratik Desarda', role: 'Documentation Lead & Core Member', teamId: 'documentation', isLead: true },
  { id: 'docs-nikhil', name: 'Nikhil Patil', role: 'Design Report Compilation', teamId: 'documentation' },
  { id: 'docs-sharvari', name: 'Sharvari Bhambar', role: 'Technical Regulations & Audit', teamId: 'documentation' },
  { id: 'docs-snehal', name: 'Snehal Shinde', role: 'Bill of Materials (BOM) Tracking', teamId: 'documentation' },
  { id: 'docs-parth', name: 'Parth Kshirsagar', role: 'System Documentation & Archives', teamId: 'documentation' },
  { id: 'docs-riddhi', name: 'Riddhi Munot', role: 'Submission Compliance Officer', teamId: 'documentation' },
  { id: 'docs-ajay', name: 'Ajay Kate', role: 'Fabrication Records & Step Log', teamId: 'documentation' },
];

export const ALL_MEMBER_NAMES = Array.from(new Set(ROSTER_MEMBERS.map((m) => m.name)));

export function getMembersForTeam(teamId?: TeamId): TeamMemberEntry[] {
  if (!teamId || teamId === 'core') return ROSTER_MEMBERS;
  return ROSTER_MEMBERS.filter((m) => m.teamId === teamId);
}
