// web/src/components/dashboard/materials/materialsConstants.tsx

import React from 'react';
import { MaterialCategory, TeamId } from '@/lib/types';

export interface QueuedUploadItem {
  id: string;
  file?: File;
  title: string;
  description: string;
  teamId: TeamId;
  category: MaterialCategory;
  tags: string[];
  externalUrl?: string;
  status: 'ready' | 'uploading' | 'analyzing' | 'done' | 'error';
  progress: number;
  error?: string;
  source: 'gemini' | 'heuristic';
}

export const CATEGORY_CONFIG: Record<
  MaterialCategory,
  { label: string; badge: string; icon: React.ReactNode }
> = {
  research: {
    label: 'Research Paper',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: (
      <svg className="w-2.5 h-2.5 text-purple-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  specs: {
    label: 'Technical Spec',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: (
      <svg className="w-2.5 h-2.5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  reports: {
    label: 'Report & Brief',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: (
      <svg className="w-2.5 h-2.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  datasheets: {
    label: 'Datasheet',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    icon: (
      <svg className="w-2.5 h-2.5 text-sky-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  cad: {
    label: 'CAD & 3D',
    badge: 'bg-pink-50 text-pink-700 border-pink-200',
    icon: (
      <svg className="w-2.5 h-2.5 text-pink-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  other: {
    label: 'Material',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: (
      <svg className="w-2.5 h-2.5 text-slate-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
};

export function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return 'Document';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileExtensionBadge(filename?: string): { label: string; color: string } {
  if (!filename) return { label: 'DOC', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return { label: 'PDF', color: 'bg-red-50 text-red-700 border-red-200' };
    case 'doc':
    case 'docx':
      return { label: 'DOC', color: 'bg-blue-50 text-blue-700 border-blue-200' };
    case 'xls':
    case 'xlsx':
    case 'csv':
      return { label: 'XLS', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    case 'ppt':
    case 'pptx':
      return { label: 'PPT', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    case 'step':
    case 'stp':
    case 'stl':
    case 'sldprt':
    case 'sldasm':
    case 'blend':
      return { label: 'CAD', color: 'bg-pink-50 text-pink-700 border-pink-200' };
    case 'zip':
    case 'rar':
    case '7z':
      return { label: 'ZIP', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    default:
      return { label: (ext || 'DOC').toUpperCase().slice(0, 4), color: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

export function cleanTitleFromFilename(name: string): string {
  return name
    .replace(/\.[^/.]+$/, '')
    .replace(/[._\-–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
