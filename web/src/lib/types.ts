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
  teamName: string;
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
}

export interface DriveUploadResponse {
  success: boolean;
  fileId?: string;
  viewUrl?: string;
  embedUrl?: string;
  error?: string;
}
