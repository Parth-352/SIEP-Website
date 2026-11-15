// web/src/components/team/teamRosterData.ts

import { TeamMember, MobileTeamGroup } from './teamTypes';

/**
 * Official Team Roster:
 * 23 Student Innovators across 8 specialized domains + 1 Faculty Mentor.
 * Official domain leads from college records:
 *  1. Software: Parth Kshirsagar
 *  2. EnTC: Tirthraj Pawale
 *  3. Mechanical: Meet Samdadiya
 *  4. Design: Meet Samdadiya
 *  5. Research: Aditya Fuldeore
 *  6. Sponsorship: Shravani Gadekar
 *  7. Social Media: Nishant Shinde
 *  8. Documentation: Pratik Desarda
 */
export const TEAM_MEMBERS_DATA: TeamMember[] = [
  // Faculty Mentor & Advisor
  {
    id: 'deore',
    name: 'Prof. Deore H.S.',
    isMentor: true,
    department: 'Dept. of Mechanical Engineering',
    domains: [],
    leadDomains: [],
    image: '/team/prof_deore.jpg',
  },

  // 1. Meet Samdadiya (Domain Lead: Mechanical & Design; Member: Research, Sponsorship)
  {
    id: 'meet',
    name: 'Meet Samdadiya',
    role: 'Mechanical & Design Lead',
    department: 'Mechanical Engineering',
    domains: ['mechanical', 'design', 'research', 'sponsorship'],
    leadDomains: ['mechanical', 'design'],
    image: '/team/meet_jain.jpg',
  },

  // 2. Tirthraj Pawale (Team Captain & EnTC Lead)
  {
    id: 'tirthraj',
    name: 'Tirthraj Pawale',
    role: 'Core Lead & Captain',
    isCore: true,
    department: 'Electrical & Electronics',
    domains: ['entc', 'research', 'socialmedia'],
    leadDomains: ['entc'],
    image: '/team/tirthraj_pawale.jpg',
  },

  // 3. Pratik Desarda (Vice Captain & Documentation Lead)
  {
    id: 'pratik',
    name: 'Pratik Desarda',
    role: 'Vice Captain',
    isCore: true,
    department: 'Electrical & Electronics',
    domains: ['documentation', 'entc', 'sponsorship'],
    leadDomains: ['documentation'],
    image: '/team/pratik_desarda.jpg',
  },

  // 4. Parth Kshirsagar (Software Lead & Core Member)
  {
    id: 'parth',
    name: 'Parth Kshirsagar',
    role: 'Software Lead',
    isCore: true,
    department: 'Computer Engineering',
    domains: ['software', 'sponsorship', 'documentation'],
    leadDomains: ['software'],
  },

  // 5. Aditya Fuldeore (Domain Lead: Research; Member: Design)
  {
    id: 'aditya',
    name: 'Aditya Fuldeore',
    role: 'Research Lead',
    department: 'Mechanical Engineering',
    domains: ['research', 'design'],
    leadDomains: ['research'],
  },

  // 6. Shravani Gadekar (Domain Lead: Sponsorship; Member: Software, Research)
  {
    id: 'shravani',
    name: 'Shravani Gadekar',
    role: 'Sponsorship Lead',
    department: 'Computer Engineering',
    domains: ['sponsorship', 'software', 'research'],
    leadDomains: ['sponsorship'],
  },

  // 7. Nishant Shinde (Domain Lead: Social Media; Member: Software, Sponsorship)
  {
    id: 'nishant',
    name: 'Nishant Shinde',
    role: 'Social Media Lead',
    department: 'Computer Engineering',
    domains: ['socialmedia', 'software', 'sponsorship'],
    leadDomains: ['socialmedia'],
  },

  // 8. Samiksha Patole (Software)
  {
    id: 'samiksha',
    name: 'Samiksha Patole',
    role: 'Team Member',
    department: 'Computer Engineering',
    domains: ['software'],
    leadDomains: [],
  },

  // 9. Riddhi Munot (Software, Sponsorship, Documentation; Core Member)
  {
    id: 'riddhi',
    name: 'Riddhi Munot',
    role: 'Core Member',
    isCore: true,
    department: 'Computer Engineering',
    domains: ['software', 'sponsorship', 'documentation'],
    leadDomains: [],
  },

  // 10. Ankita Bachhav (EnTC, Research, Social Media)
  {
    id: 'ankita',
    name: 'Ankita Bachhav',
    department: 'Electrical & Electronics',
    domains: ['entc', 'research', 'socialmedia'],
    leadDomains: [],
  },

  // 11. Nayan Jain (EnTC, Research)
  {
    id: 'nayan',
    name: 'Nayan Jain',
    department: 'Electrical & Electronics',
    domains: ['entc', 'research'],
    leadDomains: [],
  },

  // 12. Snehal Shinde (EnTC, Sponsorship, Documentation)
  {
    id: 'snehal',
    name: 'Snehal Shinde',
    department: 'Electrical & Electronics',
    domains: ['entc', 'sponsorship', 'documentation'],
    leadDomains: [],
  },

  // 13. Prathamesh Deshmukh (EnTC)
  {
    id: 'prathamesh-d',
    name: 'Prathamesh Deshmukh',
    department: 'Electrical & Electronics',
    domains: ['entc'],
    leadDomains: [],
  },

  // 14. Prem Chaudhari (Design Lead; EnTC, Design)
  {
    id: 'prem',
    name: 'Prem Chaudhari',
    role: 'Design Lead',
    department: 'Electrical & Electronics',
    domains: ['design', 'entc'],
    leadDomains: ['design'],
  },

  // 15. Sharvari Bhambar (EnTC, Documentation)
  {
    id: 'sharvari',
    name: 'Sharvari Bhambar',
    department: 'Electrical & Electronics',
    domains: ['entc', 'documentation'],
    leadDomains: [],
  },

  // 16. Mohit Pagar (EnTC, Mechanical)
  {
    id: 'mohit',
    name: 'Mohit Pagar',
    department: 'Mechanical Engineering',
    domains: ['entc', 'mechanical'],
    leadDomains: [],
  },

  // 17. Ganesh Sonawane (Mechanical)
  {
    id: 'ganesh',
    name: 'Ganesh Sonawane',
    department: 'Mechanical Engineering',
    domains: ['mechanical'],
    leadDomains: [],
  },

  // 18. Prathamesh Tidake (Mechanical, Design)
  {
    id: 'prathamesh-t',
    name: 'Prathamesh Tidake',
    department: 'Mechanical Engineering',
    domains: ['mechanical', 'design'],
    leadDomains: [],
  },

  // 19. Siddhesh Raskar (Mechanical, Design)
  {
    id: 'siddhesh',
    name: 'Siddhesh Raskar',
    department: 'Mechanical Engineering',
    domains: ['mechanical', 'design'],
    leadDomains: [],
  },

  // 20. Ajay Kate (Mechanical, Social Media, Documentation)
  {
    id: 'ajay',
    name: 'Ajay Kate',
    department: 'Mechanical Engineering',
    domains: ['mechanical', 'socialmedia', 'documentation'],
    leadDomains: [],
  },

  // 21. Kiran Nyaharkar (Mechanical)
  {
    id: 'kiran',
    name: 'Kiran Nyaharkar',
    department: 'Mechanical Engineering',
    domains: ['mechanical'],
    leadDomains: [],
  },

  // 22. Omshri Ahire (Research, Sponsorship)
  {
    id: 'omshri',
    name: 'Omshri Ahire',
    department: 'Mechanical Engineering',
    domains: ['research', 'sponsorship'],
    leadDomains: [],
  },

  // 23. Nikhil Patil (Social Media, Documentation)
  {
    id: 'nikhil',
    name: 'Nikhil Patil',
    department: 'Computer Engineering',
    domains: ['socialmedia', 'documentation'],
    leadDomains: [],
  },
];

export const NINE_MOBILE_TEAMS: MobileTeamGroup[] = [
  {
    id: 'core',
    name: 'Core Team',
    subtitle: 'Faculty Guidance & Executive Leadership',
    memberIds: [
      { id: 'deore', role: 'Faculty Mentor & Advisor', isMentor: true },
      { id: 'meet', role: 'Team Captain', isLead: true },
      { id: 'tirthraj', role: 'Vice Captain', isLead: true },
      { id: 'pratik', role: 'Core Member', isLead: true },
    ],
  },
  {
    id: 'software',
    name: 'Software Team',
    subtitle: 'Firmware, Telemetry & IoT Architecture',
    memberIds: [
      { id: 'parth', role: 'Domain Lead', isLead: true },
      { id: 'shravani', role: 'Team Member' },
      { id: 'nishant', role: 'Team Member' },
      { id: 'samiksha', role: 'Team Member' },
      { id: 'riddhi', role: 'Team Member' },
    ],
  },
  {
    id: 'entc',
    name: 'Electrical & Electronics Team',
    subtitle: 'Powertrain, Wiring Harness & Power Distribution',
    memberIds: [
      { id: 'tirthraj', role: 'Domain Lead', isLead: true },
      { id: 'pratik', role: 'Team Member' },
      { id: 'ankita', role: 'Team Member' },
      { id: 'nayan', role: 'Team Member' },
      { id: 'snehal', role: 'Team Member' },
      { id: 'prathamesh-d', role: 'Team Member' },
      { id: 'prem', role: 'Team Member' },
      { id: 'sharvari', role: 'Team Member' },
      { id: 'mohit', role: 'Team Member' },
    ],
  },
  {
    id: 'mechanical',
    name: 'Mechanical Team',
    subtitle: 'Chassis, Suspension & Braking Dynamics',
    memberIds: [
      { id: 'meet', role: 'Domain Lead', isLead: true },
      { id: 'mohit', role: 'Team Member' },
      { id: 'ganesh', role: 'Team Member' },
      { id: 'prathamesh-t', role: 'Team Member' },
      { id: 'siddhesh', role: 'Team Member' },
      { id: 'ajay', role: 'Team Member' },
      { id: 'kiran', role: 'Team Member' },
    ],
  },
  {
    id: 'design',
    name: 'Design Team',
    subtitle: 'Ergonomics, Aero & Industrial CAD',
    memberIds: [
      { id: 'meet', role: 'Domain Lead', isLead: true },
      { id: 'aditya', role: 'Team Member' },
      { id: 'prem', role: 'Team Member' },
      { id: 'prathamesh-t', role: 'Team Member' },
      { id: 'siddhesh', role: 'Team Member' },
    ],
  },
  {
    id: 'research',
    name: 'Research Team',
    subtitle: 'Battery Chemistries & Simulation Analysis',
    memberIds: [
      { id: 'aditya', role: 'Domain Lead', isLead: true },
      { id: 'meet', role: 'Team Member' },
      { id: 'tirthraj', role: 'Team Member' },
      { id: 'shravani', role: 'Team Member' },
      { id: 'ankita', role: 'Team Member' },
      { id: 'nayan', role: 'Team Member' },
      { id: 'omshri', role: 'Team Member' },
    ],
  },
  {
    id: 'sponsorship',
    name: 'Sponsorship Team',
    subtitle: 'Corporate Outreach, PR & Financial Backing',
    memberIds: [
      { id: 'shravani', role: 'Domain Lead', isLead: true },
      { id: 'meet', role: 'Team Member' },
      { id: 'pratik', role: 'Team Member' },
      { id: 'parth', role: 'Team Member' },
      { id: 'nishant', role: 'Team Member' },
      { id: 'riddhi', role: 'Team Member' },
      { id: 'snehal', role: 'Team Member' },
      { id: 'omshri', role: 'Team Member' },
    ],
  },
  {
    id: 'socialmedia',
    name: 'Social Media Team',
    subtitle: 'Digital Brand Identity & Launch Campaigns',
    memberIds: [
      { id: 'nishant', role: 'Domain Lead', isLead: true },
      { id: 'tirthraj', role: 'Team Member' },
      { id: 'ankita', role: 'Team Member' },
      { id: 'ajay', role: 'Team Member' },
      { id: 'nikhil', role: 'Team Member' },
    ],
  },
  {
    id: 'documentation',
    name: 'Documentation Team',
    subtitle: 'Rulebook Compliance & Technical Reports',
    memberIds: [
      { id: 'pratik', role: 'Domain Lead', isLead: true },
      { id: 'parth', role: 'Team Member' },
      { id: 'riddhi', role: 'Team Member' },
      { id: 'snehal', role: 'Team Member' },
      { id: 'sharvari', role: 'Team Member' },
      { id: 'ajay', role: 'Team Member' },
      { id: 'nikhil', role: 'Team Member' },
    ],
  },
];
