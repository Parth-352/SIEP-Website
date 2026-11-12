"use client";

import React from 'react';
import { TEAMS } from '@/lib/teams';
import { WorkLog } from '@/lib/types';
import { getEmbeddableVideoUrl } from '@/lib/driveUpload';

interface VideoArchiveTabProps {
  logs: WorkLog[];
}

export default function VideoArchiveTab({ logs }: VideoArchiveTabProps) {
  const videoLogs = logs.filter((l) => Boolean(l.videoUrl));

  return (
    <div className="space-y-6">
      {videoLogs.length === 0 ? (
        <div className="bg-white border border-jet-black/10 rounded-2xl p-16 text-center text-grey shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-full bg-alice-blue flex items-center justify-center mx-auto text-grey">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="text-base font-bold text-jet-black">No Videos Uploaded Yet</h4>
          <p className="text-xs max-w-md mx-auto leading-relaxed">
            When teams record daily engineering moves and attach video evidence, they will stream directly here from your personal Google Drive!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoLogs.map((log) => {
            const embedInfo = getEmbeddableVideoUrl(log.videoUrl);
            const teamInfo = TEAMS[log.teamId];

            return (
              <div
                key={log.id}
                className="bg-white border border-jet-black/10 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-orange/50 transition-all"
              >
                <div>
                  {/* Video player embed */}
                  <div className="aspect-video w-full bg-black relative">
                    {embedInfo ? (
                      embedInfo.source === 'drive' || embedInfo.source === 'youtube' ? (
                        <iframe
                          src={embedInfo.embedUrl}
                          className="w-full h-full border-0"
                          allow="autoplay; encrypted-media; fullscreen"
                          allowFullScreen
                          title={log.stepTitle}
                        />
                      ) : (
                        <video
                          controls
                          src={embedInfo.embedUrl}
                          className="w-full h-full object-contain"
                        />
                      )
                    ) : null}
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          teamInfo?.badgeBg || 'bg-jet-black/5 text-jet-black'
                        }`}
                      >
                        [{teamInfo?.code}] {log.teamName}
                      </span>
                      <span className="text-[10px] font-mono text-grey">
                        {log.date}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-jet-black line-clamp-1">
                      {log.stepTitle}
                    </h4>

                    <p className="text-xs text-grey font-light line-clamp-2 leading-relaxed">
                      {log.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3 bg-alice-blue/60 border-t border-jet-black/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-grey font-bold">STEP #{log.stepNumber}</span>
                  <a
                    href={log.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange hover:underline font-bold"
                  >
                    Open in Google Drive ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
