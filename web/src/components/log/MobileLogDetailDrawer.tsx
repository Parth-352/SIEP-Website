import React from 'react';
import { WorkLog } from '@/lib/types';
import { getEmbeddableVideoUrl } from '@/lib/driveUpload';
import { getDomainBadge, getLogWorkStatus, formatLogDate, WORK_STATUS_CONFIG } from './logConfig';

interface MobileLogDetailDrawerProps {
  selectedLog: WorkLog | null;
  onClose: () => void;
  isCoreAdmin: boolean;
  user: any;
  onEdit: (log: WorkLog) => void;
  onDelete: (log: WorkLog) => void;
}

export default function MobileLogDetailDrawer({
  selectedLog,
  onClose,
  isCoreAdmin,
  user,
  onEdit,
  onDelete,
}: MobileLogDetailDrawerProps) {
  if (!selectedLog) return null;

  const domainBadge = getDomainBadge(selectedLog.teamId);
  const workStatus = getLogWorkStatus(selectedLog);
  const statusCfg = WORK_STATUS_CONFIG[workStatus];
  const canModify = isCoreAdmin || (user && user.teamId === selectedLog.teamId);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col justify-end p-0 sm:items-center sm:justify-center sm:p-4 animate-in fade-in duration-200">
      <div onClick={onClose} className="fixed inset-0 bg-jet-black/60 backdrop-blur-xs" />

      <div className="relative bg-white rounded-t-3xl sm:rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto z-10 shadow-2xl border border-jet-black/15 p-5 space-y-4 animate-in slide-in-from-bottom duration-200 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        {/* Top Handle & Close */}
        <div className="flex items-center justify-between border-b border-jet-black/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-jet-black text-white font-mono text-[10px] font-bold">
              STEP #{String(selectedLog.stepNumber).padStart(2, '0')}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${domainBadge.bg}`}>
              {domainBadge.code}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${statusCfg.badgeBg}`}>
              {statusCfg.icon}
              <span>{statusCfg.label}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Video Player Embed */}
        {selectedLog.videoUrl && (() => {
          const embed = getEmbeddableVideoUrl(selectedLog.videoUrl);
          if (!embed) return null;
          return (
            <div className="rounded-2xl overflow-hidden bg-black aspect-video border border-black/10 shadow-xs relative">
              {embed.source === 'drive' || embed.source === 'youtube' ? (
                <iframe
                  src={embed.embedUrl}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                  title={selectedLog.stepTitle}
                />
              ) : (
                <video
                  controls
                  src={embed.embedUrl}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          );
        })()}

        {/* Title & Metadata */}
        <div className="space-y-1">
          <h3 className="text-base font-bold font-sans text-jet-black">
            {selectedLog.stepTitle}
          </h3>
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-sans flex-wrap">
            <span>{selectedLog.teamName}</span>
            <span>&bull;</span>
            <span>{formatLogDate(selectedLog.date)}</span>
            {selectedLog.workTime && (
              <>
                <span>&bull;</span>
                <span>{selectedLog.workTime}</span>
              </>
            )}
            <span>&bull;</span>
            <span className="font-bold text-jet-black">{selectedLog.hoursSpent} hrs</span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-alice-blue/50 rounded-xl p-3 border border-jet-black/5 text-xs text-zinc-700 font-sans leading-relaxed whitespace-pre-line">
          {selectedLog.description}
        </div>

        {/* Achievements & Blockers */}
        {(selectedLog.achievements || selectedLog.blockers) && (
          <div className="space-y-2 pt-1 text-xs">
            {selectedLog.achievements && (
              <div className="p-3 bg-emerald-50 border border-emerald-200/60 rounded-xl text-emerald-900">
                <span className="font-bold block mb-0.5 text-[10px] uppercase font-mono tracking-wider">
                  Key Achievements
                </span>
                <p>{selectedLog.achievements}</p>
              </div>
            )}
            {selectedLog.blockers && (
              <div className="p-3 bg-rose-50 border border-rose-200/60 rounded-xl text-rose-900">
                <span className="font-bold block mb-0.5 text-[10px] uppercase font-mono tracking-wider">
                  Blockers / Issues
                </span>
                <p>{selectedLog.blockers}</p>
              </div>
            )}
          </div>
        )}

        {/* Contributors */}
        {selectedLog.membersPresent && selectedLog.membersPresent.length > 0 && (
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
              Contributors
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedLog.membersPresent.map((m, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-lg bg-zinc-100 text-zinc-700 text-[11px] font-sans">
                  {m}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions for Author / Admin */}
        {canModify && (
          <div className="pt-3 border-t border-jet-black/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => onEdit(selectedLog)}
              className="px-4 py-2 rounded-xl border border-jet-black/20 text-xs font-sans font-bold hover:bg-zinc-100 text-jet-black cursor-pointer"
            >
              Edit Step
            </button>
            <button
              type="button"
              onClick={() => onDelete(selectedLog)}
              className="px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-sans font-bold cursor-pointer"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
