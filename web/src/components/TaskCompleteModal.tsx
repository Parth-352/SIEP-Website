"use client";

import React, { useState, useEffect } from 'react';
import { Task, TeamId, WorkLog } from '@/lib/types';
import { TEAMS } from '@/lib/teams';
import { uploadFileToGoogleDrive, getEmbeddableVideoUrl } from '@/lib/driveUpload';
import MemberSelect from './MemberSelect';
import { useAuth } from '@/context/AuthContext';

interface TaskCompleteModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskCompleted: (updatedTask: Task, createdLog?: WorkLog) => void;
}

export default function TaskCompleteModal({
  task,
  isOpen,
  onClose,
  onTaskCompleted,
}: TaskCompleteModalProps) {
  const { user } = useAuth();

  // Carried-forward log state
  const [stepTitle, setStepTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [date, setDate] = useState('');
  const [workTime, setWorkTime] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [hoursSpent, setHoursSpent] = useState('4');
  const [description, setDescription] = useState('');
  const [achievements, setAchievements] = useState('');
  const [blockers, setBlockers] = useState('');

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Carry forward task data whenever task changes
  useEffect(() => {
    if (task) {
      setStepTitle(`Completed: ${task.title}`);
      setAuthorName(user?.displayName || 'Team Lead');
      
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setWorkTime(`${hours}:${mins}`);

      // Carry forward assigned members
      setSelectedMembers(task.assignedMembers && task.assignedMembers.length > 0 ? [...task.assignedMembers] : []);
      
      // Carry forward task deliverables description
      setDescription(task.description || `Execution and verification of deliverable: ${task.title}`);
      setAchievements(`Successfully completed and verified all requirements for ${task.title}.`);
      setBlockers('');
      
      setVideoFile(null);
      setVideoUrlInput('');
      setUploadProgress(0);
      setUploadStatus(null);
      setErrorMessage(null);
    }
  }, [task, user]);

  if (!isOpen || !task) return null;

  const currentTeam = TEAMS[task.teamId];

  // Handle Video File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
    }
  };

  // Submit Handler: Uploads video, creates log, and updates task to 'done'
  const handleSubmitWithVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepTitle.trim() || !description.trim()) {
      setErrorMessage('Step Title and Description are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    let finalVideoUrl = videoUrlInput.trim();
    let driveFileId: string | undefined = undefined;

    // 1. If file is selected, stream to personal Google Drive
    if (videoFile) {
      setIsUploading(true);
      const sizeMb = (videoFile.size / (1024 * 1024)).toFixed(1);
      setUploadStatus(`Preparing ${sizeMb} MB upload to Google Drive...`);

      const uploadRes = await uploadFileToGoogleDrive({
        file: videoFile,
        teamName: currentTeam?.name || task.teamId,
        stepTitle,
        onProgress: (p) => {
          setUploadProgress(p);
          if (p < 10) {
            setUploadStatus('Creating Google Drive resumable session...');
          } else if (p < 95) {
            setUploadStatus(`Streaming ${sizeMb} MB to Drive (${p}%)...`);
          } else {
            setUploadStatus('Finalizing permissions & embed link...');
          }
        },
      });

      if (!uploadRes.success) {
        setErrorMessage(uploadRes.error || 'Failed to upload video to Google Drive');
        setIsUploading(false);
        setIsSubmitting(false);
        return;
      }

      finalVideoUrl = uploadRes.embedUrl || uploadRes.viewUrl || '';
      driveFileId = uploadRes.fileId;
      setIsUploading(false);
    }

    try {
      // 2. Mark Task as Done in API
      const taskRes = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: 'done' }),
      });
      const taskData = await taskRes.json();
      if (!taskData.success) {
        throw new Error(taskData.error || 'Failed to update task status to Completed');
      }

      // 3. Create WorkLog entry with carried forward data and video evidence
      const logRes = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepTitle: stepTitle.trim(),
          phase: 'Deliverable Completed',
          teamId: task.teamId,
          authorName: authorName.trim() || user?.displayName || 'Squad Member',
          date,
          workTime,
          membersPresent: selectedMembers,
          hoursSpent: parseFloat(hoursSpent) || 0,
          description: description.trim(),
          achievements: achievements.trim(),
          blockers: blockers.trim(),
          videoUrl: finalVideoUrl || undefined,
          driveFileId,
          videoSource: finalVideoUrl ? 'drive' : undefined,
        }),
      });

      const logData = await logRes.json();

      onTaskCompleted(taskData.task, logData.log);
      onClose();
    } catch (err: unknown) {
      console.error('Error in task completion flow:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Error completing task and recording log');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Complete (Mark done only, skip video log)
  const handleMarkDoneOnly = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Mark task as Done
      const taskRes = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: 'done' }),
      });
      const taskData = await taskRes.json();
      if (!taskData.success) {
        throw new Error(taskData.error || 'Failed to update task status');
      }

      // 2. Also record clean completion step log
      const logRes = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepTitle: `Completed: ${task.title}`,
          phase: 'Deliverable Completed',
          teamId: task.teamId,
          authorName: user?.displayName || 'Squad Member',
          date: new Date().toISOString().split('T')[0],
          workTime: '18:00',
          membersPresent: task.assignedMembers || [],
          hoursSpent: parseFloat(hoursSpent) || 0,
          description: task.description || `Deliverable completed: ${task.title}`,
          achievements: `Completed all tasks requirements for ${task.title}`,
        }),
      });
      const logData = await logRes.json();

      onTaskCompleted(taskData.task, logData.log);
      onClose();
    } catch (err: unknown) {
      console.error('Error completing task:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to mark task as done');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-jet-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border-2 border-emerald-500/40 rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-200 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-jet-black/10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Deliverable Complete • Record Log Evidence
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${currentTeam?.badgeBg || 'bg-jet-black/5 text-jet-black'}`}>
                [{currentTeam?.code}] {currentTeam?.shortName}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-jet-black tracking-tight">
              Mark as Done &amp; Attach Video Evidence<span className="text-emerald-500">.</span>
            </h3>
            <p className="text-xs text-grey">
              The task details have been carried forward below. Attach your fabrication or testing video to stream directly into the Master Gallery!
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-grey hover:text-jet-black text-sm p-2 cursor-pointer rounded-xl hover:bg-alice-blue transition-colors shrink-0"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-mono">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Video Upload Banner (Primary Feature) */}
        <div className="bg-gradient-to-br from-emerald-50/60 to-alice-blue p-5 rounded-2xl border border-emerald-200/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">📹</span>
              <h4 className="text-xs font-mono uppercase font-black tracking-wider text-jet-black">
                Video Evidence Attachment (Personal Google Drive)
              </h4>
            </div>
            <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-jet-black/10 text-grey font-bold">
              Up to 5 GB Resumable
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option A: Direct File Upload */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase text-grey font-bold">
                A) Upload Video File (.mp4, .webm, .mov)
              </label>
              <input
                type="file"
                accept="video/*,.mp4,.webm,.mov,.mkv"
                onChange={handleFileSelect}
                className="w-full text-xs font-mono text-grey file:mr-3 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-mono file:font-bold file:bg-jet-black file:text-alice-blue hover:file:bg-orange file:cursor-pointer cursor-pointer border border-jet-black/15 bg-white p-2 rounded-xl"
              />
              {videoFile && (
                <div className="text-[10px] font-mono text-emerald-700 font-bold flex items-center gap-1">
                  <span>✓ Selected:</span>
                  <span className="truncate max-w-[200px]">{videoFile.name}</span>
                  <span>({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                </div>
              )}
            </div>

            {/* Option B: Direct Link */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono uppercase text-grey font-bold">
                B) Or Paste Drive / YouTube Link
              </label>
              <input
                type="url"
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-jet-black/15 text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              />
              {videoUrlInput && getEmbeddableVideoUrl(videoUrlInput) && (
                <div className="text-[10px] font-mono text-emerald-700 font-bold">
                  ✓ Valid stream embed link detected!
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-jet-black font-bold">{uploadStatus}</span>
                <span className="text-orange font-black">{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-jet-black/10">
                <div
                  className="h-full bg-orange transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Form of Carried-Forward Data */}
        <form onSubmit={handleSubmitWithVideo} className="space-y-4">
          
          <div>
            <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
              Log Step Title (Carried Forward) *
            </label>
            <input
              type="text"
              required
              value={stepTitle}
              onChange={(e) => setStepTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-sm font-medium focus:ring-2 focus:ring-orange focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
              Deliverables &amp; Work Completed (Carried Forward) *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-xs focus:ring-2 focus:ring-orange focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
              Key Achievements / Verification Notes
            </label>
            <input
              type="text"
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="e.g. Verified structural rigidity, zero warpage, tolerance within 0.8mm"
              className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 text-xs focus:ring-2 focus:ring-orange focus:outline-none"
            />
          </div>

          {/* Members Checklist (Carried Forward) */}
          <div>
            <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
              Members Present (Carried from Assigned Deliverable)
            </label>
            <MemberSelect
              teamId={task.teamId}
              selectedMembers={selectedMembers}
              onChange={setSelectedMembers}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
                Completion Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-jet-black/15 text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
                Session Hours Spent
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                required
                value={hoursSpent}
                onChange={(e) => setHoursSpent(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-jet-black/15 text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-grey mb-1.5 font-medium">
                Author / Lead Name
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-jet-black/15 text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
              />
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="pt-5 border-t border-jet-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleMarkDoneOnly}
              className="text-xs font-mono text-grey hover:text-jet-black underline cursor-pointer text-left sm:text-center py-1 font-medium disabled:opacity-50"
            >
              Skip video log &amp; mark done only
            </button>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-jet-black/20 text-xs font-mono uppercase cursor-pointer hover:bg-alice-blue transition-colors font-medium"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all font-bold text-xs uppercase font-mono tracking-wider shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Publishing &amp; Completing...</span>
                  </>
                ) : (
                  <span>Attach Video &amp; Complete Task ✓</span>
                )}
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
}
