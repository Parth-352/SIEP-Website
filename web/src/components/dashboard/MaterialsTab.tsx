"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { TEAMS, TEAMS_LIST } from '@/lib/teams';
import { ResearchMaterial, TeamId, MaterialCategory, UserProfile } from '@/lib/types';
import OperationsBanner from './OperationsBanner';
import StatCard from './StatCard';
import { uploadFileToGoogleDrive } from '@/lib/driveUpload';

interface MaterialsTabProps {
  user: UserProfile | null;
  isCore: boolean;
  isLead: boolean;
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
    case 'blend':
    case 'cad':
    case 'zip':
      return { label: 'CAD', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    default:
      return { label: (ext || 'DOC').toUpperCase().slice(0, 4), color: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

export default function MaterialsTab({ user, isCore, isLead }: MaterialsTabProps) {
  const [materials, setMaterials] = useState<ResearchMaterial[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [categoryFilter, setCategoryFilter] = useState<'all' | MaterialCategory>('all');
  const [squadFilter, setSquadFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Upload modal state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formCategory, setFormCategory] = useState<MaterialCategory>('research');
  const [formSquad, setFormSquad] = useState<TeamId>(user?.teamId || 'research');
  const [formTags, setFormTags] = useState<string>('');
  const [formFile, setFormFile] = useState<File | null>(null);
  const [formExternalUrl, setFormExternalUrl] = useState<string>('');

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

  // Filtered materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      // Category filter
      if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;

      // Squad filter
      if (squadFilter !== 'all' && m.teamId !== squadFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = (m.title || '').toLowerCase().includes(q);
        const descMatch = (m.description || '').toLowerCase().includes(q);
        const authorMatch = (m.authorName || '').toLowerCase().includes(q);
        const fileMatch = (m.fileName || '').toLowerCase().includes(q);
        const tagMatch = (m.tags || []).some((t) => t.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !authorMatch && !fileMatch && !tagMatch) return false;
      }

      return true;
    });
  }, [materials, categoryFilter, squadFilter, searchQuery]);

  // Pagination
  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE));
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageMaterials = filteredMaterials.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  // Handle document submission
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setUploadError('Please provide a document title.');
      return;
    }

    if (!formFile && !formExternalUrl.trim()) {
      setUploadError('Please select a file to upload or provide a Google Drive URL.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(5);
      setUploadError(null);

      let finalFileUrl = formExternalUrl.trim();
      let finalDriveId = '';
      let finalFileName = formFile?.name || formTitle.trim();
      let finalFileSize = formFile?.size || 0;
      let finalMimeType = formFile?.type || 'application/pdf';

      // If user selected a file, upload to Google Drive via resumable upload
      if (formFile) {
        setUploadProgress(15);
        const driveRes = await uploadFileToGoogleDrive({
          file: formFile,
          teamName: TEAMS[formSquad]?.name || formSquad,
          stepTitle: formTitle.trim(),
          onProgress: (pct) => {
            setUploadProgress(Math.min(95, Math.max(15, pct)));
          },
        });

        if (!driveRes.success || !driveRes.viewUrl) {
          throw new Error(driveRes.error || 'Failed to stream document into Google Drive.');
        }

        finalFileUrl = driveRes.viewUrl;
        finalDriveId = driveRes.fileId || '';
      }

      setUploadProgress(96);

      // Save material record in database
      const res = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle.trim(),
          description: formDescription.trim(),
          category: formCategory,
          teamId: formSquad,
          fileName: finalFileName,
          fileSize: finalFileSize,
          mimeType: finalMimeType,
          fileUrl: finalFileUrl,
          driveFileId: finalDriveId,
          tags: formTags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to save material record.');
      }

      setUploadProgress(100);
      setMaterials((prev) => [data.material, ...prev]);

      // Reset form
      setFormTitle('');
      setFormDescription('');
      setFormTags('');
      setFormFile(null);
      setFormExternalUrl('');
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
          DESKTOP MATERIALS VIEW (Strictly matching Design System & Operations Banners)
          Visible on desktop screens (hidden md:block).
         ========================================================================= */}
      <div className="hidden md:block space-y-6">
        {/* Operations Hero Banner matching Dashboard, Tasks, Build Log, Teams, Reports */}
        <OperationsBanner
          subtitle="PROJECT OPERATIONS"
          title="Research & Materials"
          description="Technical documentation, research papers, datasheets, CAD specifications and engineering repository"
          action={{
            label: "+ Upload Material",
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

        {/* Main 2-Column Content Grid (2/3 Left Column, 1/3 Right Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Filter Bar + Materials Table */}
          <div className="lg:col-span-2 space-y-4">
            {/* Standalone Filter Bar Card matching Tasks, Build Log, and Teams */}
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
                    placeholder="Search materials, PDFs, tags..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-56 lg:w-64 pl-9 pr-8 py-2 rounded-xl bg-white border border-slate-200 text-xs font-sans text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500 focus:outline-none shadow-xs"
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

                {/* Squad Selector Dropdown */}
                <div className="relative">
                  <select
                    value={squadFilter}
                    onChange={(e) => {
                      setSquadFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-sans text-slate-700 bg-white focus:outline-none shadow-xs cursor-pointer"
                  >
                    <option value="all">All Squads</option>
                    {TEAMS_LIST.filter((t) => t.id !== 'core').map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.shortName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Materials Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">
                      <th className="py-3.5 pl-6 pr-3 w-16">#</th>
                      <th className="py-3.5 px-3">Document Title</th>
                      <th className="py-3.5 px-3">Category</th>
                      <th className="py-3.5 px-3">Squad</th>
                      <th className="py-3.5 px-3">Author</th>
                      <th className="py-3.5 px-3">Cloud Storage</th>
                      <th className="py-3.5 pr-6 pl-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans text-xs">
                    {pageMaterials.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-16 text-center text-slate-400 font-sans">
                          <div className="max-w-sm mx-auto space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                            <p className="font-semibold text-slate-700 text-sm">
                              No research materials uploaded yet
                            </p>
                            <p className="text-xs text-slate-400">
                              Upload technical documentation, test reports, research papers, and datasheets to Google Drive.
                            </p>
                            <button
                              type="button"
                              onClick={() => setIsUploadModalOpen(true)}
                              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <span>+ Upload First Material</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pageMaterials.map((mat, idx) => {
                        const extBadge = getFileExtensionBadge(mat.fileName);
                        const catConfig = CATEGORY_CONFIG[mat.category] || CATEGORY_CONFIG.other;
                        const teamInfo = TEAMS[mat.teamId];
                        const matCode = `MAT-${String(filteredMaterials.length - (startIdx + idx)).padStart(3, '0')}`;
                        const canDelete =
                          isCore ||
                          isLead ||
                          user?.email?.toLowerCase() === mat.authorEmail.toLowerCase();

                        return (
                          <tr
                            key={mat.id}
                            className="hover:bg-slate-50/80 transition-colors group"
                          >
                            <td className="py-3.5 pl-6 pr-3 font-mono text-[11px] font-bold text-slate-500">
                              {matCode}
                            </td>

                            <td className="py-3.5 px-3 max-w-sm">
                              <div className="flex items-start gap-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 mt-0.5 border ${extBadge.color}`}>
                                  {extBadge.label}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <a
                                    href={mat.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-semibold text-slate-900 group-hover:text-orange-600 transition-colors block truncate"
                                    title={mat.title}
                                  >
                                    {mat.title}
                                  </a>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-sans mt-0.5">
                                    <span>{mat.fileName}</span>
                                    <span>•</span>
                                    <span>{formatFileSize(mat.fileSize)}</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3.5 px-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${catConfig.badge}`}>
                                {catConfig.icon}
                                <span>{catConfig.label}</span>
                              </span>
                            </td>

                            <td className="py-3.5 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${teamInfo?.badgeBg || 'bg-slate-100 text-slate-700'}`}>
                                {teamInfo?.code || mat.teamId}
                              </span>
                            </td>

                            <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {mat.authorName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <span className="font-medium text-xs text-slate-800">{mat.authorName}</span>
                              </div>
                            </td>

                            <td className="py-3.5 px-3">
                              <a
                                href={mat.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              >
                                <svg className="w-2.5 h-2.5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z" />
                                </svg>
                                <span>Google Drive</span>
                              </a>
                            </td>

                            <td className="py-3.5 pr-6 pl-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <a
                                  href={mat.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                                  title="Open in Google Drive"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>

                                {canDelete && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMaterial(mat.id)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                    title="Delete Material"
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
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {filteredMaterials.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-sans">
                  <span>
                    Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredMaterials.length)}–
                    {Math.min(currentPage * ITEMS_PER_PAGE, filteredMaterials.length)} of {filteredMaterials.length} materials
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 transition-all ${
                        currentPage <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((pg) => (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => setCurrentPage(pg)}
                        className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                          currentPage === pg
                            ? 'bg-[#0e131f] text-white shadow-xs'
                            : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {pg}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 transition-all ${
                        currentPage >= totalPages ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Quick Upload + Distribution Cards */}
          <div className="space-y-6">
            {/* Card 1: Quick Upload CTA */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-sans">
                    Upload Material
                  </h3>
                  <p className="text-[11px] text-slate-500 font-sans">
                    All members can publish documents
                  </p>
                </div>
              </div>

              <div
                onClick={() => {
                  setIsUploadModalOpen(true);
                  setUploadError(null);
                }}
                className="border-2 border-dashed border-slate-200 hover:border-orange-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50/50 hover:bg-orange-50/30 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-800 font-sans group-hover:text-orange-600 transition-colors">
                  Click to Upload PDF or Document
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Streams directly into Google Drive (up to 5 GB)
                </p>
              </div>
            </div>

            {/* Card 2: Squad Distribution */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-sans">
                    Squad Repository
                  </h3>
                  <p className="text-[11px] text-slate-500 font-sans">
                    Materials distribution across squads
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {TEAMS_LIST.filter((t) => t.id !== 'core').map((team) => {
                  const teamMaterials = materials.filter((m) => m.teamId === team.id);
                  const count = teamMaterials.length;
                  const pct = materials.length > 0 ? Math.round((count / materials.length) * 100) : 0;

                  return (
                    <div key={team.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-sans">
                        <span className="font-semibold text-slate-800">{team.name}</span>
                        <span className="font-mono text-slate-500 text-[11px]">
                          {count} docs ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 3: Google Drive Gateway */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 font-sans">Google Drive Synced</h4>
                  <p className="text-[10px] text-slate-500 font-sans">Resumable storage gateway active</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
                All materials are automatically backed up and secured in the official Riders Bay Google Drive engineering folder with direct download and preview embeds.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          UPLOAD MATERIAL MODAL (Accessible by ALL signed-in members)
         ========================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div
            onClick={() => !isUploading && setIsUploadModalOpen(false)}
            className="fixed inset-0"
          />

          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest font-mono">
                  SIEP 2026–27
                </span>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Upload Research &amp; Material
                </h3>
              </div>
              <button
                type="button"
                disabled={isUploading}
                onClick={() => setIsUploadModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error banner */}
            {uploadError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{uploadError}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-sans">
              {/* Document Title */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Document Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., BMS Thermal Runaway Analysis & Test Results"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Category & Squad Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as MaterialCategory)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
                  >
                    <option value="research">Research Paper</option>
                    <option value="specs">Technical Spec / Blueprint</option>
                    <option value="reports">Engineering Report & Brief</option>
                    <option value="datasheets">Component Datasheet</option>
                    <option value="cad">CAD & 3D Model</option>
                    <option value="other">Other Material</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Engineering Squad</label>
                  <select
                    value={formSquad}
                    onChange={(e) => setFormSquad(e.target.value as TeamId)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 bg-white focus:ring-2 focus:ring-orange-500 focus:outline-none cursor-pointer"
                  >
                    {TEAMS_LIST.filter((t) => t.id !== 'core').map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description / Abstract */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">Description / Key Notes</label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of findings, test parameters, methodology, or component specifications..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* File Selector (Google Drive Upload) */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Upload File to Google Drive (PDF, Word, Excel, CAD, ZIP)
                </label>
                <div className="p-4 border-2 border-dashed border-slate-200 hover:border-orange-500 rounded-2xl bg-slate-50/60 text-center transition-all">
                  <input
                    type="file"
                    id="material-file-upload"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setFormFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="material-file-upload"
                    className="cursor-pointer block space-y-1.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </div>
                    {formFile ? (
                      <p className="font-bold text-slate-900 text-xs">
                        Selected: {formFile.name} ({formatFileSize(formFile.size)})
                      </p>
                    ) : (
                      <>
                        <p className="font-bold text-slate-800 text-xs">
                          Click to select a file from your computer
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Supports PDF, DOCX, XLSX, PPTX, CAD/ZIP up to 5 GB
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Or Existing Google Drive Link */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Or Paste an Existing Google Drive Share Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={formExternalUrl}
                  onChange={(e) => setFormExternalUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. bms, battery, thermal, dyno"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-slate-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Upload Progress Bar */}
              {isUploading && (
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span>Streaming to Google Drive...</span>
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
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>+ Publish Material</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
