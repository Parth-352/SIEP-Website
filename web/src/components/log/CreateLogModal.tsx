import React, { useState, useEffect } from 'react';
import { TeamId, LogWorkStatus } from '@/lib/types';
import { TEAMS, TEAMS_LIST } from '@/lib/teams';
import MemberSelect from '@/components/MemberSelect';
import { getEmbeddableVideoUrl } from '@/lib/driveUpload';
import { WORK_STATUS_CONFIG } from './logConfig';

interface CreateLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isCoreAdmin: boolean;
  initialTitle?: string;
  initialStatus?: LogWorkStatus;
  initialTeamId?: TeamId;
  onSubmitLog: (payload: {
    stepTitle: string;
    status: LogWorkStatus;
    teamId: TeamId;
    teamName: string;
    authorName: string;
    date: string;
    workTime: string;
    membersPresent: string[];
    hoursSpent: number;
    description: string;
    achievements: string;
    blockers: string;
    videoUrl: string;
  }, videoFile: File | null) => void;
}

export default function CreateLogModal({
  isOpen,
  onClose,
  user,
  isCoreAdmin,
  initialTitle = '',
  initialStatus = 'in_progress',
  initialTeamId,
  onSubmitLog,
}: CreateLogModalProps) {
  const currentTeam = user?.teamId ? TEAMS[user.teamId as TeamId] : null;

  const [stepTitle, setStepTitle] = useState(initialTitle);
  const [targetStatus, setTargetStatus] = useState<LogWorkStatus>(initialStatus);
  const [targetTeamId, setTargetTeamId] = useState<TeamId>(
    initialTeamId || (user?.teamId && user.teamId !== 'core' ? user.teamId : 'chassis')
  );
  const [authorName, setAuthorName] = useState(user?.displayName || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [workTime, setWorkTime] = useState(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    user?.displayName ? [user.displayName] : []
  );
  const [hoursSpent, setHoursSpent] = useState('4');
  const [description, setDescription] = useState('');
  const [achievements, setAchievements] = useState('');
  const [blockers, setBlockers] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [largeFileNotice, setLargeFileNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial title / status if changed
  useEffect(() => {
    if (isOpen) {
      if (initialTitle) setStepTitle(initialTitle);
      if (initialStatus) setTargetStatus(initialStatus);
      if (initialTeamId) setTargetTeamId(initialTeamId);
      setDate(new Date().toISOString().split('T')[0]);
      setWorkTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setFormError(null);
      setLargeFileNotice(null);
    }
  }, [isOpen, initialTitle, initialStatus, initialTeamId]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    setLargeFileNotice(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const mb = file.size / (1024 * 1024);
      setVideoFile(file);
      if (mb > 5000) {
        setLargeFileNotice(
          `This video is ${(mb / 1024).toFixed(2)} GB, which exceeds the 5 GB direct upload ceiling. Please upload it directly to your Google Drive and paste the share link on the right for 0s instant embedding.`
        );
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!stepTitle.trim() || !description.trim()) {
      setFormError('Please enter a Step Title and Description of what was worked on.');
      return;
    }

    const effectiveTeamId: TeamId = isCoreAdmin ? targetTeamId : (user?.teamId || 'core');
    const effectiveTeamConfig = TEAMS[effectiveTeamId];

    setIsSubmitting(true);
    onSubmitLog(
      {
        stepTitle: stepTitle.trim(),
        status: targetStatus,
        teamId: effectiveTeamId,
        teamName: effectiveTeamConfig?.name || effectiveTeamId,
        authorName: authorName.trim() || user?.displayName || 'Lead Engineer',
        date: date || new Date().toISOString().split('T')[0],
        workTime: workTime.trim() || '12:00 PM',
        membersPresent: selectedMembers,
        hoursSpent: parseFloat(hoursSpent) || 0,
        description: description.trim(),
        achievements: achievements.trim(),
        blockers: blockers.trim(),
        videoUrl: videoUrlInput.trim(),
      },
      videoFile
    );

    // Reset fields
    setStepTitle('');
    setDescription('');
    setAchievements('');
    setBlockers('');
    setVideoFile(null);
    setVideoUrlInput('');
    setLargeFileNotice(null);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-jet-black/70 backdrop-blur-xs flex flex-col justify-end p-0 sm:items-center sm:justify-center sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div onClick={onClose} className="fixed inset-0" />
      <div className="relative bg-white border-2 border-orange/40 rounded-t-3xl sm:rounded-2xl p-4 sm:p-8 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto z-10 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:pb-8 my-0 sm:my-auto">
        {/* Form Top Title */}
        <div className="flex items-center justify-between pb-3 border-b border-jet-black/10">
          <h3 className="text-lg font-bold text-jet-black tracking-tight">Add Build Log</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-600 font-bold text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Error Banner */}
        {formError && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-3">
            <span className="font-bold text-xs uppercase tracking-wider shrink-0 bg-red-200 px-1.5 py-0.5 rounded">
              Error
            </span>
            <p className="leading-relaxed flex-1">{formError}</p>
            <button
              type="button"
              onClick={() => setFormError(null)}
              className="text-red-500 hover:text-red-800 text-xs font-mono font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Step Title */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
              Step Title *
            </label>
            <input
              type="text"
              required
              value={stepTitle}
              onChange={(e) => setStepTitle(e.target.value)}
              placeholder="e.g. Chassis Swingarm Pivot Welding & Alignment"
              className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-sm font-medium focus:ring-2 focus:ring-orange focus:outline-none transition-all"
            />
          </div>

          {/* Work Status */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
              Work Status
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(['in_progress', 'testing', 'completed', 'on_hold', 'review'] as LogWorkStatus[]).map(
                (st) => {
                  const cfg = WORK_STATUS_CONFIG[st];
                  const isSelected = targetStatus === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTargetStatus(st)}
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

          {/* Subsystem, Date, Time & Hours */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Team Scope */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                Subsystem Team
              </label>
              {isCoreAdmin ? (
                <select
                  value={targetTeamId}
                  onChange={(e) => {
                    setTargetTeamId(e.target.value as TeamId);
                    setSelectedMembers([]);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none transition-all"
                >
                  {TEAMS_LIST.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.code}] {t.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="w-full px-3 py-2 rounded-xl border border-jet-black/10 bg-jet-black/5 text-jet-black text-xs font-mono font-bold flex items-center justify-between">
                  <span>
                    [{currentTeam?.code || 'CORE'}] {currentTeam?.name || 'Core'}
                  </span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-jet-black/10 text-grey">
                    Locked
                  </span>
                </div>
              )}
            </div>

            {/* Work Date */}
            <div className="col-span-2 md:col-span-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none font-mono transition-all"
              />
            </div>

            {/* Time */}
            <div className="col-span-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                Time
              </label>
              <input
                type="text"
                value={workTime}
                onChange={(e) => setWorkTime(e.target.value)}
                placeholder="e.g. 02:30 PM"
                className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none font-mono transition-all"
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
                value={hoursSpent}
                onChange={(e) => setHoursSpent(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none font-mono transition-all"
              />
            </div>
          </div>

          {/* Members */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
              Assigned Members
            </label>
            <MemberSelect
              teamId={isCoreAdmin ? targetTeamId : (user?.teamId || 'core')}
              selectedMembers={selectedMembers}
              onChange={setSelectedMembers}
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what was assembled, calibrated, simulated or tested..."
              className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none leading-relaxed transition-all"
            />
          </div>

          {/* Achievements & Blockers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                Key Achievements (Optional)
              </label>
              <textarea
                rows={2}
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="e.g. Achieved 0.5mm welding tolerance, passed 200kg load test"
                className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                Blockers / Issues (Optional)
              </label>
              <textarea
                rows={2}
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                placeholder="e.g. Awaiting M12 flange bolts, lathe chuck vibration"
                className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs focus:ring-2 focus:ring-orange focus:outline-none"
              />
            </div>
          </div>

          {/* Video Attachment */}
          <div className="space-y-3 pt-2 border-t border-jet-black/10">
            <label className="block text-xs font-mono uppercase text-grey font-medium">
              Video (Upload File or Paste Link)
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Option A: File Upload */}
              <div className="p-4 bg-alice-blue/40 border border-jet-black/10 rounded-xl space-y-2">
                <label className="block text-xs font-mono uppercase text-jet-black font-semibold">
                  Upload Video File
                </label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="w-full text-xs text-grey file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-mono file:bg-jet-black file:text-alice-blue hover:file:bg-orange file:cursor-pointer transition-all"
                />

                {videoFile && (
                  <div className="text-xs font-mono text-jet-black flex items-center justify-between bg-white p-2.5 rounded-lg border border-jet-black/10">
                    <span className="truncate max-w-[200px] font-medium">{videoFile.name}</span>
                    <span className="text-grey font-bold">
                      {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoFile(null);
                        setLargeFileNotice(null);
                      }}
                      className="text-xs font-mono text-red-500 hover:underline cursor-pointer shrink-0 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {largeFileNotice && (
                  <div className="mt-2 p-2.5 bg-amber-50 border border-amber-300 rounded-lg text-xs text-amber-900">
                    {largeFileNotice}
                  </div>
                )}
              </div>

              {/* Option B: Direct Link */}
              <div className="p-4 bg-alice-blue/40 border border-jet-black/10 rounded-xl space-y-2">
                <label className="block text-xs font-mono uppercase text-jet-black font-semibold">
                  Or Paste Video Link
                </label>
                <input
                  type="url"
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... or YouTube"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-jet-black/15 bg-white text-jet-black text-base sm:text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                />

                {videoUrlInput && (
                  <div className="text-xs font-mono">
                    {getEmbeddableVideoUrl(videoUrlInput) ? (
                      <span className="text-emerald-600 font-medium">Valid video link</span>
                    ) : (
                      <span className="text-amber-600">Please enter a valid Google Drive or YouTube link</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Action Buttons */}
          <div className="pt-4 border-t border-jet-black/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-jet-black/20 text-jet-black text-xs font-mono uppercase font-semibold hover:bg-jet-black/5 cursor-pointer transition-colors w-full sm:w-auto text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 sm:py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto min-h-[44px] sm:min-h-0"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Step &rarr;</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
