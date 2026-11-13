"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TEAMS, TEAMS_LIST } from '@/lib/teams';
import { ResearchMaterial, TeamId, MaterialCategory, UserProfile } from '@/lib/types';
import OperationsBanner from './OperationsBanner';
import StatCard from './StatCard';
import { uploadFileToGoogleDrive } from '@/lib/driveUpload';
import { classifyDocumentHeuristically, DocumentAnalysisResult } from '@/lib/geminiService';

interface MaterialsTabProps {
  user: UserProfile | null;
  isCore: boolean;
  isLead: boolean;
}

interface QueuedUploadItem {
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

const CATEGORY_CONFIG: Record<
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

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return 'Document';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtensionBadge(filename?: string): { label: string; color: string } {
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

function cleanTitleFromFilename(name: string): string {
  return name
    .replace(/\.[^/.]+$/, '')
    .replace(/[._\-–]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function MaterialsTab({ user, isCore, isLead }: MaterialsTabProps) {
  const [materials, setMaterials] = useState<ResearchMaterial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<'all' | MaterialCategory>('all');
  const [squadFilter, setSquadFilter] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Batch multi-file upload queue
  const [queuedFiles, setQueuedFiles] = useState<QueuedUploadItem[]>([]);
  const [manualDriveUrl, setManualDriveUrl] = useState<string>('');
  const [manualTitle, setManualTitle] = useState<string>('');
  const [manualSquad, setManualSquad] = useState<TeamId>(user?.teamId || 'research');
  const [manualCategory, setManualCategory] = useState<MaterialCategory>('research');

  // File input ref for resetting
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch materials
  const loadMaterials = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/materials');
      const data = await res.json();
      if (data.success && Array.isArray(data.materials)) {
        setMaterials(data.materials);
      }
    } catch (err) {
      console.warn('Error fetching materials:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  // Compute popular indexed tags across all materials for instant 1-click filter
  const popularTags = useMemo(() => {
    const counts: Record<string, number> = {};
    materials.forEach((m) => {
      (m.tags || []).forEach((t) => {
        const norm = t.trim();
        if (norm && norm.length >= 2) {
          counts[norm] = (counts[norm] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 14);
  }, [materials]);

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      // Category filter
      if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;

      // Squad filter
      if (squadFilter !== 'all' && m.teamId !== squadFilter) return false;

      // Tag filter
      if (selectedTag !== 'all') {
        const hasTag = (m.tags || []).some((t) => t.toLowerCase() === selectedTag.toLowerCase());
        if (!hasTag) return false;
      }

      // Search query across title, description, tags, squad code, and author
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (m.title || '').toLowerCase().includes(q);
        const descMatch = (m.description || '').toLowerCase().includes(q);
        const authorMatch = (m.authorName || '').toLowerCase().includes(q);
        const fileMatch = (m.fileName || '').toLowerCase().includes(q);
        const squadMatch = (m.teamName || '').toLowerCase().includes(q) || (m.teamId || '').toLowerCase().includes(q);
        const tagMatch = (m.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !authorMatch && !fileMatch && !squadMatch && !tagMatch) {
          return false;
        }
      }

      return true;
    });
  }, [materials, categoryFilter, squadFilter, selectedTag, searchQuery]);

  // Pagination
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageMaterials = filteredMaterials.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Process dropped or selected files with instant heuristic classification + background Gemini refinement
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: QueuedUploadItem[] = Array.from(files).map((file) => {
      // 1. Instant heuristic analysis
      const initialAnalysis: DocumentAnalysisResult = classifyDocumentHeuristically(file.name);

      return {
        id: `queue_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        file,
        title: cleanTitleFromFilename(file.name),
        description: initialAnalysis.summary,
        teamId: initialAnalysis.teamId,
        category: initialAnalysis.category,
        tags: initialAnalysis.tags,
        status: 'ready',
        progress: 0,
        source: 'heuristic',
      };
    });

    setQueuedFiles((prev) => [...prev, ...newItems]);
    setUploadError(null);

    // 2. Fire background Gemini API analysis for higher fidelity tags and domain classification
    fetch('/api/materials/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        files: newItems.map((item) => ({
          fileName: item.file?.name || item.title,
          description: item.description,
        })),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.results)) {
          setQueuedFiles((curr) =>
            curr.map((item) => {
              const match = data.results.find((r: any) => r.fileName === (item.file?.name || item.title));
              if (match && match.analysis) {
                return {
                  ...item,
                  teamId: match.analysis.teamId || item.teamId,
                  category: match.analysis.category || item.category,
                  tags: Array.from(new Set([...item.tags, ...(match.analysis.tags || [])])).slice(0, 7),
                  description: match.analysis.summary || item.description,
                  source: match.analysis.source || 'gemini',
                };
              }
              return item;
            })
          );
        }
      })
      .catch((err) => console.warn('Background Gemini analysis note:', err));
  };

  const updateQueuedItem = (id: string, updates: Partial<QueuedUploadItem>) => {
    setQueuedFiles((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const removeQueuedItem = (id: string) => {
    setQueuedFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // Batch upload execution: Streams each file to Google Drive & saves all to database
  const handleBatchUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If no queued files but manual Drive URL was entered:
    if (queuedFiles.length === 0) {
      if (!manualDriveUrl.trim() || !manualTitle.trim()) {
        setUploadError('Please select files to upload or provide a title and Google Drive URL.');
        return;
      }

      try {
        setIsUploading(true);
        setUploadProgress(40);
        const res = await fetch('/api/materials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: manualTitle.trim(),
            description: '',
            category: manualCategory,
            teamId: manualSquad,
            fileName: manualTitle.trim(),
            fileSize: 0,
            mimeType: 'application/pdf',
            fileUrl: manualDriveUrl.trim(),
            tags: [TEAMS[manualSquad]?.code || 'DOC'],
          }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to save material.');
        setMaterials((prev) => [data.material, ...prev]);
        setManualDriveUrl('');
        setManualTitle('');
        setIsUploadModalOpen(false);
      } catch (err: any) {
        setUploadError(err.message || 'Upload failed');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadProgress(5);

      const uploadedMaterialsPayload: Array<{
        title: string;
        description: string;
        category: MaterialCategory;
        teamId: TeamId;
        fileName: string;
        fileSize: number;
        mimeType: string;
        fileUrl: string;
        driveFileId?: string;
        tags: string[];
      }> = [];

      const total = queuedFiles.length;

      for (let i = 0; i < total; i++) {
        const item = queuedFiles[i];
        updateQueuedItem(item.id, { status: 'uploading', progress: 10 });

        let fileUrl = item.externalUrl || '';
        let driveFileId = '';

        if (item.file) {
          const driveRes = await uploadFileToGoogleDrive({
            file: item.file,
            teamName: TEAMS[item.teamId]?.name || item.teamId,
            stepTitle: item.title,
            onProgress: (pct) => {
              updateQueuedItem(item.id, { progress: Math.max(10, Math.min(95, pct)) });
              const overall = Math.round(((i + pct / 100) / total) * 90);
              setUploadProgress(overall);
            },
          });

          if (!driveRes.success || !driveRes.viewUrl) {
            throw new Error(`Failed to upload ${item.file.name}: ${driveRes.error || 'Drive stream error'}`);
          }

          fileUrl = driveRes.viewUrl;
          driveFileId = driveRes.fileId || '';
        }

        updateQueuedItem(item.id, { status: 'done', progress: 100 });

        uploadedMaterialsPayload.push({
          title: item.title,
          description: item.description,
          category: item.category,
          teamId: item.teamId,
          fileName: item.file?.name || item.title,
          fileSize: item.file?.size || 0,
          mimeType: item.file?.type || 'application/pdf',
          fileUrl,
          driveFileId,
          tags: item.tags,
        });
      }

      setUploadProgress(95);

      // Save batch to database via upgraded /api/materials endpoint
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materials: uploadedMaterialsPayload }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save batch material records.');
      }

      setUploadProgress(100);
      setMaterials((prev) => [...(data.materials || []), ...prev]);
      setQueuedFiles([]);
      setIsUploadModalOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Delete material
  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Are you sure you want to remove this material from the repository?')) return;
    try {
      const res = await fetch(`/api/materials?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMaterials((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.warn('Error deleting material:', err);
    }
  };

  return (
    <>
      {/* =========================================================================
          DESKTOP MATERIALS VIEW (Matching Operations Design System)
          Visible on desktop screens (hidden md:block).
         ========================================================================= */}
      <div className="hidden md:block space-y-6">
        {/* Operations Hero Banner matching Dashboard, Tasks, Build Log, Teams, Reports */}
        <OperationsBanner
          subtitle="PROJECT OPERATIONS"
          title="Research & Materials"
          description="Technical documentation, research papers, datasheets, CAD specifications and engineering repository"
          action={{
            label: "+ Upload Documents",
            onClick: () => {
              setIsUploadModalOpen(true);
              setUploadError(null);
            },
          }}
        />

        {/* 4 Stat Cards in a Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Documents"
            value={materials.length}
            iconBg="bg-blue-50 text-blue-600 border-blue-100"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />

          <StatCard
            label="Research Papers"
            value={materials.filter((m) => m.category === 'research').length}
            iconBg="bg-purple-50 text-purple-600 border-purple-100"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            }
          />

          <StatCard
            label="Technical Specs & CAD"
            value={materials.filter((m) => m.category === 'specs' || m.category === 'cad').length}
            iconBg="bg-amber-50 text-amber-600 border-amber-100"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />

          <StatCard
            label="Reports & Briefs"
            value={materials.filter((m) => m.category === 'reports').length}
            iconBg="bg-emerald-50 text-emerald-600 border-emerald-100"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        {/* Filters, Search & AI Tag Indexing Bar */}
        <div className="space-y-3">
          {/* Main Filter Bar Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
            {/* Category Pill Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar">
              {[
                { id: 'all', label: 'All Materials', count: materials.length },
                {
                  id: 'research',
                  label: 'Research',
                  count: materials.filter((m) => m.category === 'research').length,
                },
                {
                  id: 'specs',
                  label: 'Specs',
                  count: materials.filter((m) => m.category === 'specs').length,
                },
                {
                  id: 'reports',
                  label: 'Reports',
                  count: materials.filter((m) => m.category === 'reports').length,
                },
                {
                  id: 'datasheets',
                  label: 'Datasheets',
                  count: materials.filter((m) => m.category === 'datasheets').length,
                },
                {
                  id: 'cad',
                  label: 'CAD & 3D',
                  count: materials.filter((m) => m.category === 'cad').length,
                },
              ].map((tab) => {
                const isActive = categoryFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setCategoryFilter(tab.id as any);
                      setCurrentPage(1);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                      isActive
                        ? 'bg-[#0e131f] text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Squad Filter Controls */}
            <div className="flex items-center gap-3">
              {/* Search Input matching other tabs */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search materials, PDFs, tags, BMS, FEA..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-56 lg:w-72 pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs font-sans text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
                />
                <svg
                  className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label="Clear search"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Squad Dropdown Filter */}
              <select
                value={squadFilter}
                onChange={(e) => {
                  setSquadFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-sans text-slate-700 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs cursor-pointer"
              >
                <option value="all">All Squads ({TEAMS_LIST.filter((t) => t.id !== 'core').length})</option>
                {TEAMS_LIST.filter((t) => t.id !== 'core').map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AI-Indexed Tags Filter Bar (Instant Search Acceleration) */}
          {popularTags.length > 0 && (
            <div className="bg-white/80 rounded-2xl border border-slate-200/60 p-3 shadow-2xs flex items-center gap-2 overflow-x-auto hide-scrollbar text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 pl-1">
                <svg className="w-3.5 h-3.5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>AI Index:</span>
              </span>

              <button
                type="button"
                onClick={() => {
                  setSelectedTag('all');
                  setCurrentPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedTag === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                All Tags
              </button>

              {popularTags.map((tag) => {
                const isActive = selectedTag.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSelectedTag(isActive ? 'all' : tag);
                      setCurrentPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                      isActive
                        ? 'bg-orange-500 text-white border-orange-600 shadow-2xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Document Grid / Table View */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 text-center space-y-3 font-sans">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">Loading technical documentation...</p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="py-20 text-center space-y-3 font-sans">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-800">No documents found matching filters</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload research papers, technical specs, or CAD models to build up the team's engineering archive.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse font-sans text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 pl-6 pr-3">Document Title</th>
                    <th className="py-3.5 px-3">Category</th>
                    <th className="py-3.5 px-3">Squad</th>
                    <th className="py-3.5 px-3">AI Index Tags</th>
                    <th className="py-3.5 px-3">Uploaded By</th>
                    <th className="py-3.5 px-3">Format</th>
                    <th className="py-3.5 pr-6 pl-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageMaterials.map((mat) => {
                    const catCfg = CATEGORY_CONFIG[mat.category] || CATEGORY_CONFIG.other;
                    const extBadge = getFileExtensionBadge(mat.fileName);
                    const squadInfo = TEAMS[mat.teamId];

                    return (
                      <tr key={mat.id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Title & Description */}
                        <td className="py-3.5 pl-6 pr-3 max-w-md">
                          <div className="flex items-start gap-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0 mt-0.5 ${extBadge.color}`}>
                              {extBadge.label}
                            </span>
                            <div className="min-w-0">
                              <a
                                href={mat.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors block truncate"
                                title={mat.title}
                              >
                                {mat.title}
                              </a>
                              {mat.description && (
                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                  {mat.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${catCfg.badge}`}>
                            {catCfg.icon}
                            <span>{catCfg.label}</span>
                          </span>
                        </td>

                        {/* Squad */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${squadInfo?.badgeBg || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
                            {squadInfo?.code || mat.teamId.toUpperCase().slice(0, 4)}
                          </span>
                        </td>

                        {/* AI Tags */}
                        <td className="py-3.5 px-3">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {(mat.tags || []).slice(0, 3).map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setSelectedTag(t)}
                                className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 transition-colors"
                              >
                                #{t}
                              </button>
                            ))}
                            {(mat.tags || []).length > 3 && (
                              <span className="text-[10px] text-slate-400">
                                +{(mat.tags || []).length - 3}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Uploaded By */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <p className="font-medium text-slate-900">{mat.authorName}</p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(mat.createdAt).toLocaleDateString()}
                          </p>
                        </td>

                        {/* Format & Size */}
                        <td className="py-3.5 px-3 whitespace-nowrap text-slate-500">
                          {formatFileSize(mat.fileSize)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 pr-6 pl-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={mat.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs inline-flex items-center gap-1 shadow-2xs transition-colors"
                            >
                              <span>Open</span>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>

                            {(isCore || isLead || mat.authorEmail === user?.email) && (
                              <button
                                type="button"
                                onClick={() => handleDeleteMaterial(mat.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Remove document"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {filteredMaterials.length > ITEMS_PER_PAGE && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-sans">
              <span>
                Showing {startIdx + 1}–{Math.min(startIdx + ITEMS_PER_PAGE, filteredMaterials.length)} of {filteredMaterials.length} documents
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  &lt;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold cursor-pointer ${
                      currentPage === pg
                        ? 'bg-orange-500 text-white'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pg}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  &gt;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          BATCH MULTI-DOCUMENT UPLOAD & AUTO-BIFURCATION MODAL
         ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[250] bg-jet-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn font-sans">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp max-h-[92vh] overflow-y-auto hide-scrollbar">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Upload &amp; Auto-Bifurcate Materials
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload multiple files at once. Gemini AI automatically classifies squads &amp; indexes tags.
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={isUploading}
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setQueuedFiles([]);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Banner */}
            {uploadError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{uploadError}</span>
              </div>
            )}

            {/* Drag & Drop Multi-file Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFilesSelected(e.dataTransfer.files);
              }}
              className="p-6 border-2 border-dashed border-orange-300 hover:border-orange-500 rounded-2xl bg-orange-50/30 text-center transition-all cursor-pointer relative"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                id="multi-material-file-upload"
                onChange={(e) => handleFilesSelected(e.target.files)}
                className="hidden"
              />
              <label htmlFor="multi-material-file-upload" className="cursor-pointer block space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center mx-auto shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">
                    Drop multiple documents here or click to select
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Select 1, 5, or 10+ PDFs, DOCX, XLSX, STEP/CAD models at once. Automatic domain bifurcation!
                  </p>
                </div>
              </label>
            </div>

            {/* Queued Batch Bifurcation Review Table */}
            {queuedFiles.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">
                    Bifurcated Document Queue ({queuedFiles.length} files)
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Auto-classified by Gemini &amp; Heuristics. Review or tweak below:
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                  {queuedFiles.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => updateQueuedItem(item.id, { title: e.target.value })}
                            className="font-bold text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-orange-500 focus:outline-none w-full truncate"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeQueuedItem(item.id)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Squad Bifurcation & Category Controls */}
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                            Auto Squad
                          </label>
                          <select
                            value={item.teamId}
                            onChange={(e) => updateQueuedItem(item.id, { teamId: e.target.value as TeamId })}
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white font-bold text-slate-800"
                          >
                            {TEAMS_LIST.filter((t) => t.id !== 'core').map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                            Category
                          </label>
                          <select
                            value={item.category}
                            onChange={(e) => updateQueuedItem(item.id, { category: e.target.value as MaterialCategory })}
                            className="w-full px-2 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-slate-800"
                          >
                            <option value="research">Research Paper</option>
                            <option value="specs">Technical Spec</option>
                            <option value="reports">Report &amp; Brief</option>
                            <option value="datasheets">Datasheet</option>
                            <option value="cad">CAD &amp; 3D</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Auto-extracted tags preview */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold text-slate-400">Tags:</span>
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-white border border-slate-200 text-slate-700"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      {/* Per-item progress bar */}
                      {item.status === 'uploading' && (
                        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 transition-all duration-300"
                            style={{ width: `${item.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Manual Google Drive Link */}
            {queuedFiles.length === 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-3 text-xs">
                <p className="font-bold text-slate-700">Or Paste a Direct Google Drive Share Link:</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Document Title"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    className="sm:col-span-1 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/..."
                    value={manualDriveUrl}
                    onChange={(e) => setManualDriveUrl(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            )}

            {/* Overall Upload Progress */}
            {isUploading && (
              <div className="space-y-1.5 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Streaming documents to Google Drive &amp; indexing tags...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setQueuedFiles([]);
                }}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer disabled:opacity-50 text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleBatchUploadSubmit}
                disabled={isUploading || (queuedFiles.length === 0 && !manualDriveUrl.trim())}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing {queuedFiles.length || 1} Document(s)...</span>
                  </>
                ) : (
                  <span>
                    Upload &amp; Bifurcate {queuedFiles.length > 0 ? `(${queuedFiles.length} files)` : ''} &rarr;
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
