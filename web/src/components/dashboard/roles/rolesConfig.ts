import { UserProfile } from '@/lib/types';

export interface RolesManagementTabProps {
  user: UserProfile | null;
  isCore: boolean;
  isLead: boolean;
}

export const PRESET_ROLES = [
  { title: 'Core Lead & Captain', tier: 1, isCore: true, isLead: true },
  { title: 'Vice Captain', tier: 1, isCore: true, isLead: true },
  { title: 'Core Member', tier: 1, isCore: true, isLead: false },
  { title: 'Domain Lead', tier: 2, isCore: false, isLead: true },
  { title: 'Lead Engineer', tier: 2, isCore: false, isLead: true },
  { title: 'Team Member', tier: 3, isCore: false, isLead: false },
  { title: 'Research Specialist', tier: 3, isCore: false, isLead: false },
  { title: 'Design Engineer', tier: 3, isCore: false, isLead: false },
] as const;
