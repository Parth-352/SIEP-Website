import { Task, WorkLog, TeamId, TaskStatus, TaskPriority, ActivityEvent } from '@/lib/types';

export type DashboardTab =
  | 'dashboard'
  | 'team_tasks'
  | 'kanban'
  | 'my_tasks'
  | 'profile'
  | 'teams'
  | 'videos'
  | 'metrics'
  | 'materials'
  | 'roles'
  | 'accounts';

export interface UndoState {
  taskId: string;
  previousStatus: TaskStatus;
  message: string;
}

export type SpecialDeadlineFilter = 'all' | 'due_week' | 'overdue' | 'review';

export interface MemberCredential {
  id: string;
  name: string;
  email: string;
  role: string;
  teamId: TeamId;
  isCore: boolean;
  isLead: boolean;
  tier: number;
  password: string;
  isCustom: boolean;
}

export type { Task, WorkLog, TeamId, TaskStatus, TaskPriority, ActivityEvent };
