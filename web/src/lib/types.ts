export type UserRole = 'admin' | 'team';

export type TeamId =
  | 'software'
  | 'entc'
  | 'mechanical'
  | 'design'
  | 'research'
  | 'sponsorship'
  | 'socialmedia'
  | 'documentation'
  | 'core';

export interface TeamConfig {
  id: TeamId;
  name: string;
  shortName: string;
  code: string;
  email: string;
  defaultPass: string;
  role: UserRole;
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  lead?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  teamId: TeamId;
  secondaryTeams?: TeamId[];
  teamName: string;
  isCore?: boolean;
  isLead?: boolean;
  memberId?: string;
  tier?: 1 | 2 | 3;
}

export interface InAppNotification {
  id: string;
  recipientEmail: string;
  recipientName: string;
  title: string;
  message: string;
  taskId?: string;
  createdAt: number;
  read: boolean;
}

export interface WorkLog {
  id: string;
  stepNumber: number;
  stepTitle: string;
  phase?: string;
  teamId: TeamId;
  teamName: string;
  authorName: string;
  date: string; // YYYY-MM-DD
  workTime: string; // Custom time string (e.g. "14:30" or "2:30 PM - 6:00 PM")
  membersPresent: string[];
  hoursSpent: number;
  description: string;
  achievements: string;
  blockers?: string;
  videoUrl?: string; // Direct link or embed URL (Google Drive)
  driveFileId?: string;
  videoSource?: 'drive' | 'youtube' | 'direct' | 'local';
  createdAt: number;
  updatedAt?: number;
}

export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: number;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorTeam?: TeamId;
  text: string;
  createdAt: number;
}

export interface ActivityEvent {
  id: string;
  type: 'task_created' | 'task_status' | 'subtask_toggled' | 'comment_added' | 'log_submitted' | 'task_blocked' | 'hours_logged';
  memberName: string;
  teamId: TeamId;
  title: string;
  taskId?: string;
  detail?: string;
  timestamp: number;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  teamId: TeamId;
  assignedMembers: string[];
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  createdAt: number;
  updatedAt: number;
  // Sprint Granularity extensions
  subtasks?: SubTask[];
  comments?: TaskComment[];
  estimatedHours?: number;
  actualHours?: number;
  isBlocked?: boolean;
  blockerReason?: string;
}

export interface DriveUploadResponse {
  success: boolean;
  fileId?: string;
  viewUrl?: string;
  embedUrl?: string;
  error?: string;
}
