"use client";

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { TEAMS, TEAMS_LIST } from '@/lib/teams';
import { WorkLog, TeamId, Task, TaskStatus, TaskPriority } from '@/lib/types';
import { uploadFileToGoogleDrive, getEmbeddableVideoUrl } from '@/lib/driveUpload';
import MemberSelect from '@/components/MemberSelect';

function LogLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-alice-blue flex flex-col items-center justify-center font-mono text-sm text-grey space-y-3">
      <span className="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin"></span>
      <p className="tracking-wider uppercase text-xs">Authenticating SIEP session &amp; logs...</p>
    </div>
  );
}

function LogPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, isAdmin } = useAuth();

  const [isMounted, setIsMounted] = useState(false);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active tasks for squad context
  const [teamTasks, setTeamTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  // Form state (Create)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [stepTitle, setStepTitle] = useState('');
  const [targetTeamId, setTargetTeamId] = useState<TeamId>('mechanical');
  const [authorName, setAuthorName] = useState('');
  const [date, setDate] = useState('');
  const [workTime, setWorkTime] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [hoursSpent, setHoursSpent] = useState('4');
  const [description, setDescription] = useState('');
  const [achievements, setAchievements] = useState('');
  const [blockers, setBlockers] = useState('');

  // Video upload state (Create)
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [largeFileNotice, setLargeFileNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit modal state
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);
  const [editStepTitle, setEditStepTitle] = useState('');
  const [editTeamId, setEditTeamId] = useState<TeamId>('mechanical');
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

  // Delete confirmation modal state
  const [deleteConfirmLog, setDeleteConfirmLog] = useState<WorkLog | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Handle URL query parameter for team filter and task pre-filling
  useEffect(() => {
    const urlTeam = searchParams.get('team') || searchParams.get('teamId');
    if (urlTeam && (urlTeam === 'all' || TEAMS[urlTeam as TeamId])) {
      setSelectedTeamFilter(urlTeam);
    }
    const taskParam = searchParams.get('task') || searchParams.get('taskTitle');
    if (taskParam) {
      setStepTitle(decodeURIComponent(taskParam));
      setIsFormOpen(true);
    }
  }, [searchParams]);

  // Auth redirect guard & initial state
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?from=/log');
    } else if (user) {
      setTargetTeamId(user.teamId);
      setAuthorName(user.displayName);
      const now = new Date();
      setDate(now.toISOString().split('T')[0]);
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setWorkTime(`${hours}:${mins}`);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch logs with clean async pattern
  const loadLogs = useCallback(async () => {
    if (!user) return;
    setLoadingLogs(true);
    const teamQuery = !isAdmin && user ? user.teamId : (selectedTeamFilter !== 'all' ? selectedTeamFilter : '');
    const url = teamQuery ? `/api/logs?teamId=${teamQuery}` : '/api/logs';

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, [user, isAdmin, selectedTeamFilter]);

  // Fetch team tasks for pipeline context
  const loadTeamTasks = useCallback(async () => {
    if (!user) return;
    setLoadingTasks(true);
    const teamQuery = !isAdmin && user ? user.teamId : (selectedTeamFilter !== 'all' ? selectedTeamFilter : '');
    const url = teamQuery ? `/api/tasks?teamId=${teamQuery}` : '/api/tasks';

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.tasks)) {
        setTeamTasks(data.tasks);
      }
    } catch (err) {
      console.warn('Failed to load team tasks on log page:', err);
    } finally {
      setLoadingTasks(false);
    }
  }, [user, isAdmin, selectedTeamFilter]);

  useEffect(() => {
    loadLogs();
    loadTeamTasks();
  }, [loadLogs, loadTeamTasks]);

  // Quick Advance Task from Log Page
  const handleQuickAdvanceTask = async (task: Task) => {
    const nextStatusMap: Record<TaskStatus, TaskStatus | null> = {
      todo: 'in_progress',
      in_progress: 'review',
      review: 'done',
      done: null,
    };
    const nextStatus = nextStatusMap[task.status];
    if (!nextStatus) return;

    setTeamTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus, updatedAt: Date.now() } : t))
    );

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: task.id, status: nextStatus }),
      });
    } catch (err) {
      console.error('Error advancing task status:', err);
      loadTeamTasks();
    }
  };

  // Prefill new step log from task
  const handleSelectTaskForLog = (task: Task) => {
    setStepTitle(task.title);
    if (task.description) {
      setDescription((prev) => prev ? prev : `Working on deliverable: ${task.description}`);
    }
    setIsFormOpen(true);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  if (!isMounted || authLoading || !user) {
    return <LogLoadingSkeleton />;
  }

  const currentTeam = TEAMS[user.teamId];

  // Handle Video File Selection with 5 GB resumable upload detection
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

  // Submit new log handler
  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!stepTitle.trim() || !description.trim()) {
      setFormError('Please enter a Step Title and Description of what was worked on.');
      return;
    }

    const effectiveTeamId: TeamId = isAdmin ? targetTeamId : user.teamId;
    const effectiveTeamConfig = TEAMS[effectiveTeamId];

    setIsSubmitting(true);
    let finalVideoUrl = videoUrlInput.trim();
    let driveFileId: string | undefined = undefined;

    // Handle Google Drive file upload if a file was selected
    if (videoFile) {
      setIsUploading(true);
      const mbSize = (videoFile.size / (1024 * 1024)).toFixed(1);
      setUploadStatus(`Preparing ${mbSize} MB resumable upload...`);
      const uploadRes = await uploadFileToGoogleDrive({
        file: videoFile,
        teamName: effectiveTeamConfig?.name || effectiveTeamId,
        stepTitle,
        onProgress: (p) => {
          setUploadProgress(p);
          if (p < 8) {
            setUploadStatus('Creating Google Drive resumable session...');
          } else if (p < 93) {
            setUploadStatus(`Streaming ${mbSize} MB to Drive (${p}%)...`);
          } else if (p < 100) {
            setUploadStatus('Finalizing Google Drive permissions & embed...');
          } else {
            setUploadStatus('Upload complete!');
          }
        },
      });

      if (!uploadRes.success) {
        setFormError(uploadRes.error || 'Failed to upload video to Google Drive');
        setIsUploading(false);
        setIsSubmitting(false);
        return;
      }

      finalVideoUrl = uploadRes.embedUrl || uploadRes.viewUrl || '';
      driveFileId = uploadRes.fileId;
      setIsUploading(false);
      setUploadStatus('Video successfully saved to your Google Drive!');
    }

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepTitle: stepTitle.trim(),
          teamId: effectiveTeamId,
          authorName: authorName.trim() || user.displayName,
          date: date || new Date().toISOString().split('T')[0],
          workTime: workTime.trim() || '12:00 PM',
          membersPresent: selectedMembers,
          hoursSpent: parseFloat(hoursSpent) || 0,
          description: description.trim(),
          achievements: achievements.trim(),
          blockers: blockers.trim(),
          videoUrl: finalVideoUrl,
          driveFileId,
        }),
      });

      const data = await res.json();
      if (data.success && data.log) {
        // Reset form inputs
        setStepTitle('');
        setDescription('');
        setAchievements('');
        setBlockers('');
        setVideoFile(null);
        setVideoUrlInput('');
        setSelectedMembers([]);
        setUploadProgress(0);
        setUploadStatus(null);
        setLargeFileNotice(null);
        setIsFormOpen(false);

        // Instantly reflect in logs list
        setLogs((prev) => [data.log, ...prev.filter((item) => item.id !== data.log.id)]);
        setSelectedTeamFilter('all');
        setSearchQuery('');

        setTimeout(() => {
          document.getElementById('engineering-feed')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);

        loadLogs();
      } else {
        setFormError(data.error || 'Failed to save log entry');
      }
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error submitting log');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (log: WorkLog) => {
    setEditingLog(log);
    setEditStepTitle(log.stepTitle);
    setEditTeamId(log.teamId);
    setEditAuthorName(log.authorName);
    setEditDate(log.date);
    setEditWorkTime(log.workTime || '');
    setEditMembers(log.membersPresent || []);
    setEditHoursSpent(String(log.hoursSpent || 0));
    setEditDescription(log.description);
    setEditAchievements(log.achievements || '');
    setEditBlockers(log.blockers || '');
    setEditVideoUrl(log.videoUrl || '');
    setEditError(null);
  };

  // Submit Edit Handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;
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
          teamId: isAdmin ? editTeamId : editingLog.teamId,
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
        setLogs((prev) => prev.map((item) => (item.id === editingLog.id ? data.log : item)));
        setEditingLog(null);
      } else {
        setEditError(data.error || 'Failed to update step log.');
      }
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Failed to update step log.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  // Delete Handler
  const handleDeleteLog = async () => {
    if (!deleteConfirmLog) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/logs?id=${deleteConfirmLog.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setLogs((prev) => prev.filter((item) => item.id !== deleteConfirmLog.id));
        setDeleteConfirmLog(null);
      } else {
        setDeleteError(data.error || 'Failed to delete step log.');
      }
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Network error during log deletion.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Safe Filter logs for search
  const filteredLogs = logs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.stepTitle || '').toLowerCase().includes(q) ||
      (log.description || '').toLowerCase().includes(q) ||
      (log.teamName || '').toLowerCase().includes(q) ||
      (log.membersPresent || []).some((m) => m.toLowerCase().includes(q))
    );
  });

  return (
    <main className="min-h-screen bg-alice-blue text-jet-black pt-24 pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Background CAD Accent */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#2B303A_1px,transparent_1px)] [background-size:24px_24px]"></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">

        {/* =========================================================================
            HEADER & SCOPE CONSOLE
           ========================================================================= */}
        <div className="bg-white border border-jet-black/10 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Title & Metadata */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse"></span>
                <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-grey font-bold">
                  SIEP 2026–27 • Engineering Logbook
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-jet-black tracking-tight">
                Build Log &amp; Step Tracker<span className="text-orange">.</span>
              </h1>
              <p className="text-grey font-light text-sm max-w-2xl leading-relaxed">
                Recording and tracking every fabrication move, powertrain test, firmware flash, and design milestone with video evidence.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
              <button
                type="button"
                onClick={() => loadLogs()}
                title="Sync logs with cloud storage"
                className="px-4 py-2.5 rounded-xl border border-jet-black/15 bg-white hover:bg-alice-blue text-jet-black transition-all shadow-sm flex items-center gap-2 cursor-pointer text-xs font-mono font-medium"
              >
                <svg className={`w-3.5 h-3.5 text-grey ${loadingLogs ? 'animate-spin text-orange' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Sync</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(!isFormOpen);
                  setFormError(null);
                }}
                className={`px-5 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-2 cursor-pointer ${
                  isFormOpen
                    ? 'bg-jet-black/10 text-jet-black hover:bg-jet-black/20'
                    : 'bg-jet-black text-alice-blue hover:bg-orange'
                }`}
              >
                <svg className={`w-3.5 h-3.5 transition-transform ${isFormOpen ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>{isFormOpen ? 'Close Form' : '+ Record New Step'}</span>
              </button>
            </div>

          </div>

          {/* Scope Indicator Ribbon */}
          <div className="mt-6 pt-5 border-t border-jet-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2.5 text-grey">
              <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-orange' : 'bg-emerald-500'}`}></span>
              {isAdmin ? (
                <span>
                  <strong className="text-jet-black">Master Admin Access:</strong> Viewing and logging across all 8 subsystem teams.
                </span>
              ) : (
                <span>
                  <strong className="text-jet-black">Team Scoped:</strong> Viewing exclusively for <strong className="text-jet-black">[{currentTeam?.code}] {currentTeam?.name}</strong>.
                </span>
              )}
            </div>

            <Link
              href="/dashboard"
              className="text-orange hover:text-jet-black font-bold transition-colors inline-flex items-center gap-1 self-start sm:self-auto"
            >
              Open Project Dashboard →
            </Link>
          </div>
        </div>

        {/* =========================================================================
            SQUAD ACTIVE PIPELINE TASKS WIDGET
            Shows assigned deliverables for the team, allowing 1-click step prefill
           ========================================================================= */}
        {teamTasks.filter((t) => t.status !== 'done').length > 0 && (
          <div className="bg-white border border-jet-black/10 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-jet-black/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse"></span>
                <h3 className="text-xs font-mono uppercase font-black tracking-wider text-jet-black">
                  Subsystem Active Deliverables ({teamTasks.filter((t) => t.status !== 'done').length})
                </h3>
              </div>
              <Link
                href="/dashboard"
                className="text-xs font-mono text-orange hover:text-jet-black font-bold transition-colors inline-flex items-center gap-1"
              >
                <span>View Full Kanban Board</span>
                <span>→</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teamTasks
                .filter((t) => t.status !== 'done')
                .slice(0, 6)
                .map((task) => {
                  const taskTeam = TEAMS[task.teamId];
                  return (
                    <div
                      key={task.id}
                      className="bg-alice-blue/40 border border-jet-black/10 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-orange/60 hover:bg-white transition-all shadow-sm"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                            task.status === 'in_progress'
                              ? 'bg-orange/15 text-orange'
                              : task.status === 'review'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-zinc-100 text-zinc-700'
                          }`}>
                            {task.status.replace('_', ' ')}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase font-bold ${
                            task.priority === 'urgent'
                              ? 'bg-red-500 text-white'
                              : task.priority === 'high'
                              ? 'bg-orange text-jet-black'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-jet-black line-clamp-2">
                          {task.title}
                        </h4>
                        {task.dueDate && (
                          <div className="text-[10px] font-mono text-grey">
                            Due: {task.dueDate}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-jet-black/5 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleSelectTaskForLog(task)}
                          className="px-2.5 py-1 bg-jet-black text-alice-blue hover:bg-orange rounded-lg text-[10px] font-mono font-bold uppercase transition-colors cursor-pointer"
                        >
                          Log Work ✎
                        </button>
                        <button
                          type="button"
                          onClick={() => handleQuickAdvanceTask(task)}
                          className="px-2.5 py-1 bg-white hover:bg-jet-black/5 border border-jet-black/15 rounded-lg text-[10px] font-mono font-bold text-jet-black transition-colors cursor-pointer"
                          title="Advance task status"
                        >
                          Advance →
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* =========================================================================
            RECORD NEW STEP FORM DRAWER
           ========================================================================= */}
        {isFormOpen && (
          <div className="bg-white border-2 border-orange/40 rounded-2xl p-6 sm:p-10 shadow-lg animate-in fade-in duration-200">
            
            {/* Form Top Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-jet-black/10">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-widest text-orange font-bold block mb-1">
                  Step Entry #{logs.length + 1}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-jet-black tracking-tight">
                  Log Engineering Move / Fabrication Step
                </h3>
              </div>
              <span className="text-xs font-mono bg-alice-blue px-3.5 py-1.5 rounded-full text-grey border border-jet-black/10 self-start sm:self-auto font-medium">
                Google Drive 5 GB Direct Stream
              </span>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-3">
                <span className="font-bold text-xs uppercase tracking-wider shrink-0 bg-red-200 px-1.5 py-0.5 rounded">Error</span>
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

            <form onSubmit={handleLogSubmit} className="mt-8 space-y-8">
              
              {/* ZONE 1: Move Identification */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-jet-black/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-grey font-bold">
                    01 • Move Identification
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-2 font-medium">
                    Step / Move Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={stepTitle}
                    onChange={(e) => setStepTitle(e.target.value)}
                    placeholder="e.g. Swingarm TIG Root Pass & Dropout Alignment Measurement"
                    className="w-full px-4 py-3 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-jet-black text-sm font-medium focus:ring-2 focus:ring-orange focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* ZONE 2: Team, Timing & Effort */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-jet-black/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-grey font-bold">
                    02 • Subsystem &amp; Time
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                  
                  {/* Team Scope */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-2 font-medium">
                      Subsystem Team
                    </label>
                    {isAdmin ? (
                      <select
                        value={targetTeamId}
                        onChange={(e) => {
                          setTargetTeamId(e.target.value as TeamId);
                          setSelectedMembers([]); // Reset selected members cleanly when subsystem team changes
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-jet-black text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none transition-all"
                      >
                        {TEAMS_LIST.map((t) => (
                          <option key={t.id} value={t.id}>
                            [{t.code}] {t.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="w-full px-4 py-2.5 rounded-xl border border-jet-black/10 bg-jet-black/5 text-jet-black text-xs font-mono font-bold flex items-center justify-between">
                        <span>[{currentTeam?.code}] {currentTeam?.name}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-jet-black/10 text-grey">Locked</span>
                      </div>
                    )}
                  </div>

                  {/* Work Date */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-2 font-medium">
                      Work Date
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-jet-black text-xs focus:ring-2 focus:ring-orange focus:outline-none font-mono transition-all"
                    />
                  </div>

                  {/* Custom Time */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-2 font-medium">
                      Custom Time / Window
                    </label>
                    <input
                      type="text"
                      value={workTime}
                      onChange={(e) => setWorkTime(e.target.value)}
                      placeholder="e.g. 14:30 or 2:00 PM - 5:30 PM"
                      className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-jet-black text-xs focus:ring-2 focus:ring-orange focus:outline-none font-mono transition-all"
                    />
                  </div>

                  {/* Hours */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-2 font-medium">
                      Hours Invested
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      value={hoursSpent}
                      onChange={(e) => setHoursSpent(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-jet-black text-xs focus:ring-2 focus:ring-orange focus:outline-none font-mono transition-all"
                    />
                  </div>

                </div>
              </div>

              {/* ZONE 3: Team Personnel & Detailed Work */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-jet-black/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-grey font-bold">
                    03 • Contributors &amp; Operations
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-2 font-medium">
                    Members Working on This Move (Tick from Checkbox List)
                  </label>
                  <MemberSelect
                    teamId={isAdmin ? targetTeamId : user.teamId}
                    selectedMembers={selectedMembers}
                    onChange={setSelectedMembers}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-2 font-medium">
                    Technical Actions &amp; Operations Performed *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe specific engineering operations, equipment used, torque specs, components assembled, firmware flashed, or telemetry readings measured..."
                    className="w-full px-4 py-3 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-jet-black text-sm focus:ring-2 focus:ring-orange focus:outline-none leading-relaxed transition-all"
                  />
                </div>
              </div>

              {/* ZONE 4: Achievements & Blockers */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-1 border-b border-jet-black/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-grey font-bold">
                    04 • Outcomes &amp; Blockers
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 space-y-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-emerald-700 font-bold">
                      Key Achievement / Result Metric
                    </label>
                    <textarea
                      rows={2}
                      value={achievements}
                      onChange={(e) => setAchievements(e.target.value)}
                      placeholder="e.g. Dropout parallel measured within 0.08mm; CAN packet rate 100Hz confirmed..."
                      className="w-full px-3 py-2 rounded-lg border border-emerald-200 bg-white text-jet-black text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/20 space-y-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-amber-700 font-bold">
                      Blocker / Challenge (if any)
                    </label>
                    <textarea
                      rows={2}
                      value={blockers}
                      onChange={(e) => setBlockers(e.target.value)}
                      placeholder="e.g. Awaiting supplier shipment of 200A fuse; need argon gas cylinder refill..."
                      className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-jet-black text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* ZONE 5: Video Proof & Evidence (5 GB Resumable Upload) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-1 border-b border-jet-black/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-grey font-bold">
                    05 • Video Evidence &amp; Proof (Up to 5 GB)
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                    High-Speed Resumable Stream
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Option A: Direct File Upload */}
                  <div className="p-5 bg-alice-blue/40 border border-jet-black/10 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-mono uppercase text-jet-black font-bold">
                          Option A: Direct Video Upload
                        </label>
                        <span className="text-[10px] font-mono text-grey">Max 5 GB</span>
                      </div>
                      <p className="text-xs text-grey mb-3 font-light leading-relaxed">
                        Streams raw video directly into your Google Drive team folder via resumable chunks.
                      </p>
                      
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="w-full text-xs font-mono file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-jet-black file:text-alice-blue hover:file:bg-orange file:cursor-pointer transition-all"
                      />

                      {videoFile && (
                        <div className="mt-3 flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-200 shadow-sm">
                          <div className="truncate mr-2">
                            <span className="text-xs font-mono text-emerald-700 font-bold block truncate">
                              {videoFile.name}
                            </span>
                            <span className="text-[10px] font-mono text-grey">
                              {(videoFile.size / (1024 * 1024)).toFixed(1)} MB • Ready to stream
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setVideoFile(null);
                              setLargeFileNotice(null);
                            }}
                            className="text-xs font-mono text-red-500 hover:underline cursor-pointer shrink-0"
                          >
                            Remove
                          </button>
                        </div>
                      )}

                      {largeFileNotice && (
                        <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-1">
                          <p className="font-bold text-[11px]">Notice: Large Video File</p>
                          <p className="text-[11px] leading-snug">{largeFileNotice}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Option B: Paste Drive Link */}
                  <div className="p-5 bg-alice-blue/40 border border-jet-black/10 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-mono uppercase text-jet-black font-bold">
                          Option B: Paste Drive / YouTube Link
                        </label>
                        <span className="text-[10px] font-mono text-grey">Instant 0s Embed</span>
                      </div>
                      <p className="text-xs text-grey mb-3 font-light leading-relaxed">
                        Already in Google Drive or YouTube? Paste any share link to play video inline with zero upload wait time.
                      </p>
                      
                      <input
                        type="url"
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        placeholder="https://drive.google.com/file/d/... or YouTube"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-jet-black/15 bg-white text-jet-black text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none shadow-sm"
                      />

                      {videoUrlInput && (
                        <div className="mt-2.5 text-[11px] font-mono">
                          {getEmbeddableVideoUrl(videoUrlInput) ? (
                            <span className="text-emerald-600 flex items-center gap-1.5 font-bold">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              Valid Video Link — Ready to Stream Inline
                            </span>
                          ) : (
                            <span className="text-amber-600 flex items-center gap-1.5 font-medium">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              Enter a valid Google Drive file, YouTube, or direct video URL (.mp4/.webm)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </div>

                {/* Progress Bar */}
                {isUploading && (
                  <div className="mt-4 p-4 bg-alice-blue/60 border border-orange/20 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-jet-black">
                      <span className="font-medium">{uploadStatus}</span>
                      <span className="font-bold text-orange">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-jet-black/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="pt-6 border-t border-jet-black/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-6 py-3 rounded-xl border border-jet-black/20 text-jet-black text-xs font-mono uppercase font-semibold hover:bg-jet-black/5 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-bold text-xs uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Publishing Step...</span>
                    </>
                  ) : (
                    <span>Publish Step Record →</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        )}

        {/* =========================================================================
            EDIT STEP MODAL DIALOG
           ========================================================================= */}
        {editingLog && (
          <div className="fixed inset-0 z-50 bg-jet-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border-2 border-orange/50 rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
              
              <div className="flex items-center justify-between pb-4 border-b border-jet-black/10">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-orange font-bold block mb-1">
                    Edit Step #{editingLog.stepNumber}
                  </span>
                  <h3 className="text-xl font-black text-jet-black tracking-tight">
                    Modify Engineering Step Record
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="text-grey hover:text-jet-black p-1.5 rounded-lg border border-jet-black/10 hover:bg-alice-blue cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {editError}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                    Step Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={editStepTitle}
                    onChange={(e) => setEditStepTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-jet-black text-sm focus:ring-2 focus:ring-orange focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                      Subsystem Team
                    </label>
                    {isAdmin ? (
                      <select
                        value={editTeamId}
                        onChange={(e) => setEditTeamId(e.target.value as TeamId)}
                        className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                      >
                        {TEAMS_LIST.map((t) => (
                          <option key={t.id} value={t.id}>
                            [{t.code}] {t.shortName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="px-3 py-2 rounded-xl bg-jet-black/5 text-xs font-mono font-bold text-jet-black">
                        {editingLog.teamName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                      Work Date
                    </label>
                    <input
                      type="date"
                      required
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                      Hours Spent
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      value={editHoursSpent}
                      onChange={(e) => setEditHoursSpent(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                    Contributors
                  </label>
                  <MemberSelect
                    teamId={isAdmin ? editTeamId : editingLog.teamId}
                    selectedMembers={editMembers}
                    onChange={setEditMembers}
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                    Operations Performed *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-xs focus:ring-2 focus:ring-orange focus:outline-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-emerald-700 font-bold mb-1.5">
                      Key Achievement
                    </label>
                    <textarea
                      rows={2}
                      value={editAchievements}
                      onChange={(e) => setEditAchievements(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50/20 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-amber-700 font-bold mb-1.5">
                      Blocker / Challenge
                    </label>
                    <textarea
                      rows={2}
                      value={editBlockers}
                      onChange={(e) => setEditBlockers(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-200 bg-amber-50/20 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-grey mb-1.5 font-medium">
                    Video URL (Google Drive / YouTube)
                  </label>
                  <input
                    type="url"
                    value={editVideoUrl}
                    onChange={(e) => setEditVideoUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... or YouTube"
                    className="w-full px-4 py-2.5 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-jet-black/10 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingLog(null)}
                    className="px-5 py-2.5 rounded-xl border border-jet-black/20 text-xs font-mono uppercase font-semibold hover:bg-jet-black/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEditSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isEditSubmitting ? 'Saving Changes...' : 'Save Revisions'}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

        {/* =========================================================================
            DELETE CONFIRMATION MODAL
           ========================================================================= */}
        {deleteConfirmLog && (
          <div className="fixed inset-0 z-50 bg-jet-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white border-2 border-red-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-jet-black">Confirm Step Deletion</h3>
                  <p className="text-xs text-grey">Step #{deleteConfirmLog.stepNumber}</p>
                </div>
              </div>

              {deleteError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {deleteError}
                </div>
              )}

              <p className="text-xs text-jet-black/80 leading-relaxed">
                Are you sure you want to permanently delete step record: <strong className="text-jet-black">&ldquo;{deleteConfirmLog.stepTitle}&rdquo;</strong>? This action cannot be undone.
              </p>

              <div className="pt-3 border-t border-jet-black/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteConfirmLog(null);
                    setDeleteError(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-jet-black/20 text-xs font-mono uppercase font-semibold hover:bg-jet-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleDeleteLog}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Step'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ENGINEERING FEED HEADER & FILTER BAR
           ========================================================================= */}
        <div id="engineering-feed" className="bg-white border border-jet-black/10 rounded-2xl p-6 sm:p-7 shadow-sm scroll-mt-24 space-y-5">
          
          {/* Top Row: Title & Counter + Search Input */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-jet-black tracking-tight">
                Engineering Timeline Feed
              </h2>
              <span className="px-3 py-1 rounded-full bg-jet-black/10 text-jet-black font-mono text-xs font-bold">
                {filteredLogs.length} {filteredLogs.length === 1 ? 'record' : 'records'}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search moves, parts, contributors..."
                className="w-full pl-9 pr-12 py-2.5 rounded-xl border border-jet-black/15 bg-alice-blue/30 text-xs font-mono focus:ring-2 focus:ring-orange focus:outline-none shadow-sm placeholder:text-grey/60"
              />
              <svg className="w-4 h-4 text-grey absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-grey hover:text-jet-black text-xs font-mono font-bold"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Subsystem Filter Tabs */}
          {isAdmin ? (
            <div className="pt-2 border-t border-jet-black/5 flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedTeamFilter('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all ${
                  selectedTeamFilter === 'all'
                    ? 'bg-jet-black text-alice-blue font-bold shadow-sm'
                    : 'bg-alice-blue/60 text-grey hover:text-jet-black hover:bg-alice-blue border border-jet-black/10'
                }`}
              >
                All Teams ({logs.length})
              </button>
              {TEAMS_LIST.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTeamFilter(t.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono uppercase tracking-wider whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                    selectedTeamFilter === t.id
                      ? 'bg-jet-black text-alice-blue font-bold shadow-sm'
                      : 'bg-alice-blue/60 text-grey hover:text-jet-black hover:bg-alice-blue border border-jet-black/10'
                  }`}
                >
                  <span className="text-[10px] opacity-70">[{t.code}]</span>
                  <span>{t.shortName}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="pt-2 border-t border-jet-black/5 flex items-center gap-2 text-xs font-mono">
              <span className="text-grey">Filtered exclusively for:</span>
              <span className="px-3 py-1 rounded-full bg-jet-black text-alice-blue font-bold">
                [{currentTeam?.code}] {currentTeam?.name}
              </span>
            </div>
          )}

        </div>

        {/* =========================================================================
            TIMELINE FEED CARDS
           ========================================================================= */}
        <div className="space-y-6">
          {loadingLogs ? (
            <div className="bg-white border border-jet-black/10 rounded-2xl p-16 text-center text-sm font-mono text-grey shadow-sm">
              <span className="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin inline-block mb-3"></span>
              <p>Syncing engineering logbook...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="bg-white border border-jet-black/10 rounded-2xl p-16 text-center text-grey shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-full bg-alice-blue flex items-center justify-center mx-auto text-grey">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-base font-bold text-jet-black">No Step Records Found</h4>
              <p className="text-xs text-grey max-w-md mx-auto leading-relaxed">
                No entries match your search criteria. Click &ldquo;+ Record New Step&rdquo; at the top to log your team&apos;s latest moves!
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const teamInfo = TEAMS[log.teamId] || currentTeam;
              const embedInfo = getEmbeddableVideoUrl(log.videoUrl);
              const canModify = isAdmin || user.teamId === log.teamId;

              const videoActionLabel =
                embedInfo?.source === 'youtube'
                  ? 'Watch on YouTube ↗'
                  : embedInfo?.source === 'drive'
                  ? 'Open in Google Drive ↗'
                  : 'Open Video ↗';

              return (
                <article
                  key={log.id}
                  className="bg-white border border-jet-black/10 hover:border-orange/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                >
                  
                  {/* Card Header Bar */}
                  <div className="px-6 sm:px-8 py-4 bg-jet-black/[0.02] border-b border-jet-black/5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded bg-jet-black text-alice-blue font-mono font-black text-xs tracking-wider">
                        STEP #{String(log.stepNumber).padStart(2, '0')}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${teamInfo?.badgeBg || 'bg-jet-black/10 text-jet-black'}`}>
                        <span className="text-[10px] opacity-70">[{teamInfo?.code}]</span>
                        <span>{log.teamName}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs font-mono text-grey">
                      <span className="bg-alice-blue px-2.5 py-1 rounded border border-jet-black/10">
                        {log.date} {log.workTime ? `• ${log.workTime}` : ''}
                      </span>
                      <span className="bg-alice-blue px-2.5 py-1 rounded border border-jet-black/10 font-bold text-jet-black">
                        {log.hoursSpent} hrs
                      </span>

                      {/* Edit & Delete Action Buttons */}
                      {canModify && (
                        <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-jet-black/15">
                          <button
                            type="button"
                            onClick={() => openEditModal(log)}
                            title="Edit this step record"
                            className="p-1.5 rounded-lg border border-jet-black/15 bg-white hover:border-orange hover:text-orange text-grey transition-colors cursor-pointer shadow-2xs"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmLog(log)}
                            title="Delete this step record"
                            className="p-1.5 rounded-lg border border-jet-black/15 bg-white hover:border-red-400 hover:text-red-600 text-grey transition-colors cursor-pointer shadow-2xs"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 sm:p-8 space-y-6">
                    
                    {/* Step Title */}
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-jet-black tracking-tight leading-snug">
                        {log.stepTitle}
                      </h3>
                    </div>

                    {/* Members List */}
                    {log.membersPresent && log.membersPresent.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-grey font-bold">
                          Contributors:
                        </span>
                        {log.membersPresent.map((m, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-mono bg-alice-blue text-jet-black px-2.5 py-0.5 rounded-full border border-jet-black/10 font-medium"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Detailed Description */}
                    <p className="text-sm text-jet-black/90 font-light leading-relaxed whitespace-pre-line">
                      {log.description}
                    </p>

                    {/* Video Player Embed */}
                    {embedInfo && (
                      <div className="rounded-xl overflow-hidden border border-jet-black/15 bg-black shadow-sm">
                        <div className="px-4 py-2.5 bg-jet-black/95 text-alice-blue text-xs font-mono flex items-center justify-between border-b border-white/10">
                          <span className="text-[11px] uppercase tracking-wider font-bold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-orange animate-pulse"></span>
                            Video Proof &amp; Engineering Evidence
                          </span>
                          <a
                            href={log.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange hover:underline text-[11px] font-bold"
                          >
                            {videoActionLabel}
                          </a>
                        </div>
                        <div className="aspect-video w-full bg-black flex items-center justify-center">
                          {embedInfo.source === 'drive' || embedInfo.source === 'youtube' ? (
                            <iframe
                              src={embedInfo.embedUrl}
                              className="w-full h-full border-0"
                              allow="autoplay; encrypted-media; fullscreen"
                              allowFullScreen
                              title={log.stepTitle}
                            ></iframe>
                          ) : (
                            <video
                              controls
                              src={embedInfo.embedUrl}
                              className="w-full h-full object-contain"
                            >
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Achievements & Blockers Grid */}
                    {(log.achievements || log.blockers) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-jet-black/5">
                        {log.achievements && (
                          <div className="p-4 bg-emerald-500/[0.04] rounded-xl border border-emerald-500/20 space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 font-bold block">
                              Key Achievement / Result
                            </span>
                            <p className="text-xs text-jet-black font-light leading-relaxed">
                              {log.achievements}
                            </p>
                          </div>
                        )}

                        {log.blockers && (
                          <div className="p-4 bg-amber-500/[0.05] rounded-xl border border-amber-500/20 space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-700 font-bold block">
                              Blocker / Challenge
                            </span>
                            <p className="text-xs text-jet-black font-light leading-relaxed">
                              {log.blockers}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                </article>
              );
            })
          )}
        </div>

      </div>

    </main>
  );
}

export default function LogPage() {
  return (
    <Suspense fallback={<LogLoadingSkeleton />}>
      <LogPageContent />
    </Suspense>
  );
}
