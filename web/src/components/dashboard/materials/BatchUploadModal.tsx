"use client";

import React from 'react';
import { TEAMS_LIST } from '@/lib/teams';
import { MaterialCategory, TeamId } from '@/lib/types';
import { QueuedUploadItem } from './materialsConstants';

interface BatchUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUploading: boolean;
  uploadProgress: number;
  uploadError: string | null;
  queuedFiles: QueuedUploadItem[];
  handleFilesSelected: (files: FileList | null) => void;
  updateQueuedItem: (id: string, updates: Partial<QueuedUploadItem>) => void;
  removeQueuedItem: (id: string) => void;
  manualTitle: string;
  setManualTitle: (val: string) => void;
  manualDriveUrl: string;
  setManualDriveUrl: (val: string) => void;
  handleBatchUploadSubmit: (e: React.FormEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export default function BatchUploadModal({
  isOpen,
  onClose,
  isUploading,
  uploadProgress,
  uploadError,
  queuedFiles,
  handleFilesSelected,
  updateQueuedItem,
  removeQueuedItem,
  manualTitle,
  setManualTitle,
  manualDriveUrl,
  setManualDriveUrl,
  handleBatchUploadSubmit,
  fileInputRef,
}: BatchUploadModalProps) {
  if (!isOpen) return null;

  return (
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
            onClick={onClose}
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
            onClick={onClose}
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
  );
}
