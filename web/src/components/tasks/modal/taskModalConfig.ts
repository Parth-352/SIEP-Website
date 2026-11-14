import { TaskStatus, TaskPriority } from '@/lib/types';

export interface StatusOption {
  id: TaskStatus;
  label: string;
  bg: string;
  activeClass: string;
}

export const STATUS_OPTIONS: StatusOption[] = [
  { id: 'todo', label: 'To Do', bg: 'bg-zinc-100 text-zinc-700', activeClass: 'bg-zinc-700 text-white ring-2 ring-zinc-400' },
  { id: 'in_progress', label: 'In Progress', bg: 'bg-orange/15 text-orange', activeClass: 'bg-orange text-white ring-2 ring-orange/60' },
  { id: 'review', label: 'Under Review', bg: 'bg-purple-100 text-purple-700', activeClass: 'bg-purple-600 text-white ring-2 ring-purple-400' },
  { id: 'done', label: 'Completed', bg: 'bg-emerald-100 text-emerald-800', activeClass: 'bg-emerald-600 text-white ring-2 ring-emerald-400' },
];

export const PRIORITY_BADGES: Record<TaskPriority, { label: string; badgeClass: string }> = {
  urgent: { label: 'Urgent', badgeClass: 'bg-red-500 text-white' },
  high: { label: 'High', badgeClass: 'bg-orange text-jet-black font-bold' },
  medium: { label: 'Medium', badgeClass: 'bg-amber-100 text-amber-800' },
  low: { label: 'Low', badgeClass: 'bg-zinc-100 text-zinc-600' },
};

/**
 * Format Due Date with relative days remaining hint
 */
export function formatDueDate(dateStr?: string): string {
  if (!dateStr) return 'No due date set';
  try {
    const due = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${dateStr} (${Math.abs(diffDays)}d overdue)`;
    if (diffDays === 0) return `${dateStr} (Due today!)`;
    if (diffDays === 1) return `${dateStr} (Due tomorrow)`;
    return `${dateStr} (in ${diffDays} days)`;
  } catch {
    return dateStr;
  }
}
