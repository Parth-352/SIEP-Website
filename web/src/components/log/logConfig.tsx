import React from 'react';
import { WorkLog, LogWorkStatus } from '@/lib/types';

export function getLogWorkStatus(log: WorkLog): LogWorkStatus {
  if (log.status) return log.status;
  const text = `${log.stepTitle || ''} ${log.description || ''} ${log.achievements || ''}`.toLowerCase();
  if (text.includes('test') || text.includes('dyno') || text.includes('benchmark') || text.includes('trial')) {
    return 'testing';
  }
  if ((log.blockers && log.blockers.trim().length > 0) || text.includes('on hold') || text.includes('waiting') || text.includes('delay') || text.includes('blocked')) {
    return 'on_hold';
  }
  if (text.includes('review') || text.includes('audit') || text.includes('inspect') || text.includes('verification')) {
    return 'review';
  }
  if (log.videoUrl && (text.includes('weld') || text.includes('completed') || text.includes('done') || text.includes('finished') || text.includes('fabricated'))) {
    return 'completed';
  }
  return 'in_progress';
}

export function getDomainBadge(teamId: string): { code: string; bg: string } {
  switch (teamId) {
    case 'mechanical':
    case 'chassis':
      return { code: 'MECH', bg: 'bg-amber-500/10 text-amber-700 border-amber-500/20' };
    case 'powertrain':
      return { code: 'POW', bg: 'bg-sky-500/10 text-sky-700 border-sky-500/20' };
    case 'battery':
      return { code: 'BATT', bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' };
    case 'entc':
    case 'electronics':
      return { code: 'E&E', bg: 'bg-blue-500/10 text-blue-700 border-blue-500/20' };
    case 'software':
    case 'telemetry':
      return { code: 'SOFT', bg: 'bg-purple-500/10 text-purple-700 border-purple-500/20' };
    case 'brakes':
      return { code: 'BRK', bg: 'bg-rose-500/10 text-rose-700 border-rose-500/20' };
    case 'suspension':
      return { code: 'SUSP', bg: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20' };
    case 'safety':
      return { code: 'SAFE', bg: 'bg-red-500/10 text-red-700 border-red-500/20' };
    case 'design':
      return { code: 'DSGN', bg: 'bg-pink-500/10 text-pink-700 border-pink-500/20' };
    case 'research':
      return { code: 'R&D', bg: 'bg-cyan-500/10 text-cyan-700 border-cyan-500/20' };
    case 'sponsorship':
      return { code: 'SPON', bg: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' };
    case 'socialmedia':
    case 'marketing':
      return { code: 'MKT', bg: 'bg-pink-500/10 text-pink-700 border-pink-500/20' };
    case 'core':
      return { code: 'CORE', bg: 'bg-orange/10 text-orange border-orange/30' };
    case 'documentation':
    default:
      return { code: 'DOCS', bg: 'bg-zinc-100 text-zinc-700 border-zinc-200' };
  }
}

export function formatLogDate(dateVal?: string | number): string {
  if (!dateVal) return 'Recently';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export const WORK_STATUS_CONFIG: Record<
  LogWorkStatus,
  {
    label: string;
    filterLabel: string;
    icon: React.ReactNode;
    badgeBg: string;
    tileIconBg: string;
    tileIconColor: string;
  }
> = {
  in_progress: {
    label: 'In Progress',
    filterLabel: 'In Progress',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
      </svg>
    ),
    badgeBg: 'bg-amber-500/10 text-amber-700 border border-amber-500/20',
    tileIconBg: 'bg-amber-500/10 border border-amber-500/20',
    tileIconColor: 'text-amber-600',
  },
  testing: {
    label: 'Testing',
    filterLabel: 'Testing',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    badgeBg: 'bg-purple-500/10 text-purple-700 border border-purple-500/20',
    tileIconBg: 'bg-purple-500/10 border border-purple-500/20',
    tileIconColor: 'text-purple-600',
  },
  completed: {
    label: 'Completed',
    filterLabel: 'Completed',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
    badgeBg: 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20',
    tileIconBg: 'bg-emerald-500/10 border border-emerald-500/20',
    tileIconColor: 'text-emerald-600',
  },
  on_hold: {
    label: 'On Hold',
    filterLabel: 'On Hold',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
      </svg>
    ),
    badgeBg: 'bg-rose-500/10 text-rose-700 border border-rose-500/20',
    tileIconBg: 'bg-rose-500/10 border border-rose-500/20',
    tileIconColor: 'text-rose-600',
  },
  review: {
    label: 'Needs Review',
    filterLabel: 'Review',
    icon: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    badgeBg: 'bg-sky-500/10 text-sky-700 border border-sky-500/20',
    tileIconBg: 'bg-sky-500/10 border border-sky-500/20',
    tileIconColor: 'text-sky-600',
  },
};

export function LogLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-alice-blue flex flex-col items-center justify-center font-mono text-sm text-grey space-y-3">
      <span className="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin"></span>
      <p className="tracking-wider uppercase text-xs">Authenticating SIEP session &amp; logs...</p>
    </div>
  );
}
