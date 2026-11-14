import React, { useState, useEffect } from 'react';
import { WorkLog, TeamId, LogWorkStatus } from '@/lib/types';
import { TEAMS_LIST } from '@/lib/teams';
import MemberSelect from '@/components/MemberSelect';
import { getDomainBadge, getLogWorkStatus, WORK_STATUS_CONFIG } from './logConfig';

interface EditLogModalProps {
  editingLog: WorkLog | null;
  onClose: () => void;
  isCoreAdmin: boolean;
  onLogUpdated: (updatedLog: WorkLog) => void;
}

export default function EditLogModal({
  editingLog,
  onClose,
  isCoreAdmin,
  onLogUpdated,
}: EditLogModalProps) {
  const [editStepTitle, setEditStepTitle] = useState('');
  const [editStatus, setEditStatus] = useState<LogWorkStatus>('in_progress');
  const [editTeamId, setEditTeamId] = useState<TeamId>('core');
  const [editAuthorName, setEditAuthorName] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editWorkTime, setEditWorkTime] = useState('');
  const [editMembers, setEditMembers] = useState<string[]>([]);
  const [editHoursSpent, setEditHoursSpent] = useState('4');
  const [editDescription, setEditDescription] = useState('');
  const [editAchievements, setEditAchievements] = useState('');
  const [editBlockers, setEditBlockers] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  useEffect(() => {
    if (editingLog) {
      setEditStepTitle(editingLog.stepTitle || '');
      setEditStatus(editingLog.status || getLogWorkStatus(editingLog));
      setEditTeamId(editingLog.teamId || 'core');
      setEditAuthorName(editingLog.authorName || '');
      setEditDate(editingLog.date || '');
      setEditWorkTime(editingLog.workTime || '');
      setEditMembers(editingLog.membersPresent || []);
      setEditHoursSpent(String(editingLog.hoursSpent || 0));
      setEditDescription(editingLog.description || '');
      setEditAchievements(editingLog.achievements || '');
      setEditBlockers(editingLog.blockers || '');
      setEditVideoUrl(editingLog.videoUrl || '');
      setEditError(null);
    }
  }, [editingLog]);

  if (!editingLog) return null;

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (!editStepTitle.trim() || !editDescription.trim()) {
      setEditError('Step Title and Description are required.');
      return;
    }

    setIsEditSubmitting(true);
    try {
      const res = await fetch('/api/logs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingLog.id,
          stepTitle: editStepTitle.trim(),
          status: editStatus,
          teamId: isCoreAdmin ? editTeamId : editingLog.teamId,
          authorName: editAuthorName.trim() || editingLog.authorName,
          date: editDate || editingLog.date,
          workTime: editWorkTime.trim() || editingLog.workTime,
          membersPresent: editMembers,
          hoursSpent: parseFloat(editHoursSpent) || 0,
          description: editDescription.trim(),
          achievements: editAchievements.trim(),
          blockers: editBlockers.trim(),
          videoUrl: editVideoUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.log) {
        onLogUpdated(data.log);
        onClose();
      } else {
        setEditError(data.error || 'Failed to update step log.');
      }
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to update step log.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-jet-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border-2 border-orange/50 rounded-2xl max-w-3xl w-full p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-6 my-auto max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-jet-black/10">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-jet-black text-white font-mono text-[10px] font-bold">
              EDIT STEP #{String(editingLog.stepNumber).padStart(2, '0')}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getDomainBadge(editingLog.teamId).bg}`}>
              {getDomainBadge(editingLog.teamId).code}
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

        {editError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
            <span>{editError}</span>
            <button
              type="button"
              onClick={() => setEditError(null)}
              className="text-red-500 hover:text-red-800 text-xs font-mono font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleEditSubmit} className="space-y-4 sm:space-y-5">
          {/* Step Title */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
              Step Title *
            </label>
            <input
              type="text"
              required
              value={editStepTitle}
              onChange={(e) => setEditStepTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-sm font-medium focus:ring-2 focus:ring-orange focus:outline-none"
            />
          </div>

          {/* Work Status Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
              Work Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['in_progress', 'testing', 'completed', 'on_hold', 'review'] as LogWorkStatus[]).map(
                (st) => {
                  const cfg = WORK_STATUS_CONFIG[st];
                  const isSelected = editStatus === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`p-2 rounded-xl border text-xs font-sans font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-orange bg-orange/10 text-orange shadow-2xs ring-1 ring-orange'
                          : 'border-jet-black/15 bg-white text-zinc-700 hover:bg-zinc-50'
                      }`}
                    >
                      {cfg.icon}
                      <span className="truncate">{cfg.label}</span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Team Scope */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                Team
              </label>
              {isCoreAdmin ? (
                <select
                  value={editTeamId}
                  onChange={(e) => setEditTeamId(e.target.value as TeamId)}
                  className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                >
                  {TEAMS_LIST.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.code}] {t.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  disabled
                  value={editingLog.teamId}
                  className="w-full px-3 py-2 rounded-xl border border-jet-black/10 bg-jet-black/5 text-jet-black text-xs font-mono cursor-not-allowed"
                />
              )}
            </div>

            {/* Author */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                Author
              </label>
              <input
                type="text"
                value={editAuthorName}
                onChange={(e) => setEditAuthorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none"
              />
            </div>

            {/* Date */}
            <div className="col-span-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                Date
              </label>
              <input
                type="date"
                required
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
              />
            </div>

            {/* Hours */}
            <div className="col-span-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={editHoursSpent}
                onChange={(e) => setEditHoursSpent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
              />
            </div>
          </div>

          {/* Members */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
              Assigned Members
            </label>
            <MemberSelect
              teamId={editTeamId}
              selectedMembers={editMembers}
              onChange={setEditMembers}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none leading-relaxed"
            />
          </div>

          {/* Achievements & Blockers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                Key Achievements
              </label>
              <textarea
                rows={2}
                value={editAchievements}
                onChange={(e) => setEditAchievements(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                Blockers / Issues
              </label>
              <textarea
                rows={2}
                value={editBlockers}
                onChange={(e) => setEditBlockers(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none"
              />
            </div>
          </div>

          {/* Video Link */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
              Video URL (Google Drive / YouTube)
            </label>
            <input
              type="url"
              value={editVideoUrl}
              onChange={(e) => setEditVideoUrl(e.target.value)}
              placeholder="https://drive.google.com/file/d/..."
              className="w-full px-3.5 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 sm:pt-4 border-t border-jet-black/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-jet-black/20 text-xs font-mono uppercase font-semibold hover:bg-jet-black/5 cursor-pointer w-full sm:w-auto text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEditSubmitting}
              className="px-6 py-3 sm:py-2.5 rounded-xl bg-orange hover:bg-orange/90 text-white font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] sm:min-h-0"
            >
              {isEditSubmitting ? 'Saving Changes...' : 'Update Step Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
