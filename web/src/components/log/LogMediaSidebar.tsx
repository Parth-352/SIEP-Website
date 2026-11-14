import React from 'react';
import Link from 'next/link';
import { WorkLog } from '@/lib/types';
import { getDomainBadge, formatLogDate } from './logConfig';

interface LogMediaSidebarProps {
  logs: WorkLog[];
  canCreateBuildLog: boolean;
  onSelectLog: (log: WorkLog) => void;
  onOpenNewBuildLog: () => void;
  onOpenNewTestLog: () => void;
  onOpenUploadMedia: () => void;
}

export default function LogMediaSidebar({
  logs,
  canCreateBuildLog,
  onSelectLog,
  onOpenNewBuildLog,
  onOpenNewTestLog,
  onOpenUploadMedia,
}: LogMediaSidebarProps) {
  const mediaLogs = logs.filter((l) => Boolean(l.videoUrl || l.driveFileId));

  return (
    <div className="space-y-6">
      {/* Card 1: Recent Build Media */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans">
                Recent Build Media
              </h3>
              <p className="text-[11px] text-slate-500 font-sans">
                Photos and video evidence from workshop
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const withVideo = logs.find((l) => Boolean(l.videoUrl));
              if (withVideo) onSelectLog(withVideo);
            }}
            className="text-xs font-semibold text-slate-600 hover:text-orange-600 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
          >
            <span>View All</span>
            <span className="text-sm font-normal">&rarr;</span>
          </button>
        </div>

        {/* Real Media Grid or Clean Empty State */}
        {mediaLogs.length === 0 ? (
          <div className="py-8 px-4 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs font-medium text-slate-600">No media evidence recorded yet</p>
            <p className="text-[11px] text-slate-400">Attach videos or photos to build logs to showcase workshop progress.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            {mediaLogs.slice(0, 4).map((mLog, mIdx) => (
              <div
                key={mLog.id || mIdx}
                onClick={() => onSelectLog(mLog)}
                className="group relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 cursor-pointer shadow-xs hover:border-orange-500 transition-all flex flex-col justify-end p-2 text-white"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-orange-400 inline-flex items-center gap-1 mb-1">
                    {mLog.videoUrl ? (
                      <>
                        <svg className="w-2.5 h-2.5 text-orange-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                        <span>Video</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-2.5 h-2.5 text-orange-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Photo</span>
                      </>
                    )}
                  </span>
                  <p className="text-[11px] font-bold text-white truncate group-hover:text-orange-300 transition-colors">
                    {mLog.stepTitle}
                  </p>
                  <p className="text-[9px] text-slate-300 truncate">
                    {getDomainBadge(mLog.teamId).code} &bull; {formatLogDate(mLog.date || mLog.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card 2: Quick Actions Matching Mockup 3 */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-sans">
              Quick Actions
            </h3>
            <p className="text-[11px] text-slate-500 font-sans">
              Frequent engineering log workflows
            </p>
          </div>
        </div>

        {canCreateBuildLog ? (
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={onOpenNewBuildLog}
              className="p-3 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50/40 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-700 font-sans group-hover:text-orange-600">
                New Build Log
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenNewTestLog}
              className="p-3 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-700 font-sans group-hover:text-purple-600">
                New Test Log
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenUploadMedia}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/40 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <span className="text-[11px] font-bold text-slate-700 font-sans group-hover:text-blue-600">
                Upload Media
              </span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-200/80 text-slate-600 mx-auto flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-xs font-bold text-slate-800">Build Log Publishing Gated</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Only Squad Leads and Core Leadership can record build logs. Regular team members can contribute technical research, papers, and CAD deliverables via the Materials repository.
            </p>
            <Link
              href="/materials"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-bold transition-colors cursor-pointer"
            >
              <span>Go to Materials Hub</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
