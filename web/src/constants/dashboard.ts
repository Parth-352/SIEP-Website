import { TaskStatus, TaskPriority } from '@/lib/types';

export const STATUS_COLUMNS: { id: TaskStatus; label: string; color: string; dotColor: string }[] = [
  { id: 'todo', label: 'To Do', color: 'bg-zinc-100 text-zinc-700', dotColor: 'bg-zinc-400' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-orange/15 text-orange font-bold', dotColor: 'bg-orange' },
  { id: 'review', label: 'Under Review', color: 'bg-purple-100 text-purple-700 font-bold', dotColor: 'bg-purple-500' },
  { id: 'done', label: 'Completed', color: 'bg-emerald-100 text-emerald-800 font-bold', dotColor: 'bg-emerald-500' },
];

export const PRIORITY_BADGES: Record<TaskPriority, { label: string; bg: string }> = {
  urgent: { label: 'Urgent', bg: 'bg-red-500 text-white' },
  high: { label: 'High', bg: 'bg-orange text-jet-black font-bold' },
  medium: { label: 'Medium', bg: 'bg-amber-100 text-amber-800' },
  low: { label: 'Low', bg: 'bg-zinc-100 text-zinc-600' },
};

export const TASKS_STORAGE_KEY = 'siep_tasks_cache_v3';

export const AVATAR_COLORS = [
  'bg-amber-100 text-amber-900 border-amber-300',
  'bg-sky-100 text-sky-900 border-sky-300',
  'bg-emerald-100 text-emerald-900 border-emerald-300',
  'bg-purple-100 text-purple-900 border-purple-300',
  'bg-rose-100 text-rose-900 border-rose-300',
  'bg-indigo-100 text-indigo-900 border-indigo-300',
  'bg-teal-100 text-teal-900 border-teal-300',
];
