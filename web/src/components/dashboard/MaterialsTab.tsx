"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { TEAMS } from '@/lib/teams';
import { ResearchMaterial, TeamId, MaterialCategory, UserProfile } from '@/lib/types';
import OperationsBanner from './OperationsBanner';
import { uploadFileToGoogleDrive } from '@/lib/driveUpload';
import { classifyDocumentHeuristically, DocumentAnalysisResult } from '@/lib/geminiService';
import { QueuedUploadItem, cleanTitleFromFilename } from './materials/materialsConstants';
import MaterialsStatsSection from './materials/MaterialsStatsSection';
import MaterialsFilterBar from './materials/MaterialsFilterBar';
import MaterialsTable from './materials/MaterialsTable';
import BatchUploadModal from './materials/BatchUploadModal';

interface MaterialsTabProps {
  user: UserProfile | null;
  isCore: boolean;
  isLead: boolean;
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
      {/* Desktop Materials View Workspace (hidden md:block) */}
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
        <MaterialsStatsSection materials={materials} />

        {/* Filters, Search & AI Tag Indexing Bar */}
        <MaterialsFilterBar
          materials={materials}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          setCurrentPage={setCurrentPage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          squadFilter={squadFilter}
          setSquadFilter={setSquadFilter}
          popularTags={popularTags}
          selectedTag={selectedTag}
          setSelectedTag={setSelectedTag}
        />

        {/* Document Grid / Table View */}
        <MaterialsTable
          isLoading={isLoading}
          filteredMaterials={filteredMaterials}
          pageMaterials={pageMaterials}
          setSelectedTag={setSelectedTag}
          isCore={isCore}
          isLead={isLead}
          userEmail={user?.email}
          handleDeleteMaterial={handleDeleteMaterial}
          startIdx={startIdx}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
          ITEMS_PER_PAGE={ITEMS_PER_PAGE}
        />
      </div>

      {/* Batch Multi-Document Upload & Auto-Bifurcation Modal */}
      <BatchUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setQueuedFiles([]);
        }}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        uploadError={uploadError}
        queuedFiles={queuedFiles}
        handleFilesSelected={handleFilesSelected}
        updateQueuedItem={updateQueuedItem}
        removeQueuedItem={removeQueuedItem}
        manualTitle={manualTitle}
        setManualTitle={setManualTitle}
        manualDriveUrl={manualDriveUrl}
        setManualDriveUrl={setManualDriveUrl}
        handleBatchUploadSubmit={handleBatchUploadSubmit}
        fileInputRef={fileInputRef}
      />
    </>
  );
}
