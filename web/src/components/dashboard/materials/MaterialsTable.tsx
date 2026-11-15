"use client";

import React from 'react';
import { TEAMS } from '@/lib/teams';
import { ResearchMaterial } from '@/lib/types';
import { CATEGORY_CONFIG, formatFileSize, getFileExtensionBadge } from './materialsConstants';

interface MaterialsTableProps {
  isLoading: boolean;
  filteredMaterials: ResearchMaterial[];
  pageMaterials: ResearchMaterial[];
  setSelectedTag: (tag: string) => void;
  isCore: boolean;
  isLead: boolean;
  userEmail?: string | null;
  handleDeleteMaterial: (id: string) => void;
  startIdx: number;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  ITEMS_PER_PAGE: number;
}

export default function MaterialsTable({
  isLoading,
  filteredMaterials,
  pageMaterials,
  setSelectedTag,
  isCore,
  isLead,
  userEmail,
  handleDeleteMaterial,
  startIdx,
  currentPage,
  setCurrentPage,
  totalPages,
  ITEMS_PER_PAGE,
}: MaterialsTableProps) {
  return (
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
                            className="px-1.5 py-0.2 rounded text-[10px] font-mono font-medium bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-600 transition-colors cursor-pointer"
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

                        {(isCore || isLead || mat.authorEmail === userEmail) && (
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
  );
}
