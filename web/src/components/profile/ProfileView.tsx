"use client";

import React, { useState, useRef } from 'react';
import { UserProfile, Task, WorkLog } from '@/lib/types';
import { TEAMS } from '@/lib/teams';
import { DashboardTab } from '@/types/dashboard';
import { getMemberInitials, getAvatarColorClass } from '@/utils/avatarUtils';
import { isTaskAssignedToUser } from '@/lib/taskMatching';
import { useAuth } from '@/context/AuthContext';
import PinChangeForm from './PinChangeForm';

interface ProfileViewProps {
  user: UserProfile;
  tier: number;
  logout: () => void;
  isInstalled: boolean;
  installApp: (() => void) | null;
  tasks?: Task[];
  logs?: WorkLog[];
  setActiveTab?: (tab: DashboardTab) => void;
}

/**
 * Resizes and center-crops an image file to a 256x256 square WebP/JPEG data URL (<40KB)
 */
async function compressProfileImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const targetSize = 256;
        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Center-crop calculation
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);
        // Try webp first, fallback to jpeg
        try {
          const webpData = canvas.toDataURL('image/webp', 0.85);
          if (webpData.startsWith('data:image/webp')) {
            resolve(webpData);
            return;
          }
        } catch {
          // ignore and fallback
        }
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => reject(new Error('Failed to load image file'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export default function ProfileView({
  user,
  tier,
  logout,
  isInstalled,
  installApp,
  tasks = [],
  logs = [],
  setActiveTab,
}: ProfileViewProps) {
  const { updateUserProfile } = useAuth();

  // Name Editing State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user.displayName);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  // Photo Upload State
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Copy email feedback state
  const [isEmailCopied, setIsEmailCopied] = useState(false);

  // Sign out confirmation state
  const [isConfirmingSignOut, setIsConfirmingSignOut] = useState(false);

  // Personal Metrics
  const myTasks = tasks.filter((t) => isTaskAssignedToUser(t, user));
  const myActiveTasks = myTasks.filter((t) => t.status !== 'done');
  const myCompletedTasks = myTasks.filter((t) => t.status === 'done');
  const completionRate =
    myTasks.length > 0 ? Math.round((myCompletedTasks.length / myTasks.length) * 100) : 0;

  const myLogs = logs.filter(
    (l) =>
      (l.authorName && l.authorName.toLowerCase() === user.displayName.toLowerCase()) ||
      (l.membersPresent &&
        l.membersPresent.some((m) => m.toLowerCase().includes(user.displayName.toLowerCase())))
  );
  const totalHoursLogged = Number(
    myLogs.reduce((acc, curr) => acc + (curr.hoursSpent || 0), 0).toFixed(1)
  );

  // Save Name
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = nameInput.trim();
    if (!cleanName) {
      setNameError('Name cannot be empty.');
      return;
    }

    setNameError(null);
    setIsSavingName(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: cleanName }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await updateUserProfile({ displayName: cleanName });
        setIsEditingName(false);
      } else {
        setNameError(data.error || 'Failed to update name.');
      }
    } catch {
      setNameError('Network error updating name.');
    } finally {
      setIsSavingName(false);
    }
  };

  // Upload Photo
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    setPhotoError(null);
    setIsUploadingPhoto(true);

    try {
      const compressedDataUrl = await compressProfileImage(file);
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: compressedDataUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await updateUserProfile({ photoUrl: compressedDataUrl });
      } else {
        setPhotoError(data.error || 'Failed to save photo.');
      }
    } catch (err) {
      console.error('Photo upload error:', err);
      setPhotoError('Error processing photo. Please try a different image.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove Photo
  const handleRemovePhoto = async () => {
    if (!confirm('Are you sure you want to remove your custom profile picture?')) return;
    setIsUploadingPhoto(true);
    setPhotoError(null);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: '' }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await updateUserProfile({ photoUrl: '' });
      }
    } catch {
      setPhotoError('Failed to remove photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(user.email);
    setIsEmailCopied(true);
    setTimeout(() => setIsEmailCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* =========================================================================
          1. HERO MEMBER IDENTITY CARD
         ========================================================================= */}
      <div className="bg-white border border-jet-black/10 rounded-2xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar & Photo Upload Trigger */}
            <div className="relative group shrink-0">
              <div
                className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-orange/40 shadow-sm flex items-center justify-center bg-zinc-100 ${
                  !user.photoUrl ? getAvatarColorClass(user.displayName) : ''
                }`}
              >
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                    {getMemberInitials(user.displayName)}
                  </span>
                )}
              </div>

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                title="Upload or change profile picture"
                className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-jet-black text-white hover:bg-orange transition-all flex items-center justify-center shadow-md border-2 border-white cursor-pointer group-hover:scale-105"
              >
                {isUploadingPhoto ? (
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Member Details & Inline Name Editor */}
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                {isEditingName ? (
                  <form onSubmit={handleSaveName} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="px-3 py-1 rounded-xl border border-orange focus:ring-2 focus:ring-orange/20 text-lg font-bold text-jet-black font-sans focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={isSavingName}
                      className="px-3 py-1 bg-jet-black hover:bg-orange text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
                    >
                      {isSavingName ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditingName(false);
                        setNameInput(user.displayName);
                      }}
                      className="px-2 py-1 text-xs text-zinc-500 hover:text-jet-black cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-jet-black font-sans tracking-tight">
                      {user.displayName}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(true)}
                      title="Edit Display Name"
                      className="p-1 rounded-md text-zinc-400 hover:text-orange hover:bg-orange/5 transition-all cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                )}

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase ${
                    tier === 1
                      ? 'bg-orange/20 text-orange border border-orange/40'
                      : tier === 2
                      ? 'bg-sky-100 text-sky-800 border border-sky-300'
                      : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                  }`}
                >
                  {tier === 1
                    ? 'Tier 1 • Core Leadership'
                    : tier === 2
                    ? 'Tier 2 • Domain Lead'
                    : 'Tier 3 • Team Innovator'}
                </span>
              </div>

              {nameError && (
                <p className="text-xs text-red-600 font-sans">{nameError}</p>
              )}
              {photoError && (
                <p className="text-xs text-red-600 font-sans">{photoError}</p>
              )}

              {/* Verified Gmail & Copy Button */}
              <div className="flex items-center gap-2 flex-wrap text-xs font-sans text-zinc-600 pt-0.5">
                <span className="flex items-center gap-1.5 bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="font-mono text-[11px] text-zinc-700">{user.email}</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="text-[11px] text-zinc-500 hover:text-jet-black transition-colors cursor-pointer"
                >
                  {isEmailCopied ? '✓ Copied' : 'Copy'}
                </button>
                {user.photoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-[11px] text-zinc-400 hover:text-red-600 transition-colors cursor-pointer ml-1"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              <p className="text-xs font-sans text-zinc-500 font-medium">
                {user.role || 'SIEP Engineering Member'} •{' '}
                <span className="text-orange font-semibold">
                  {TEAMS[user.teamId]?.name || user.teamName}
                </span>
              </p>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="shrink-0 self-start sm:self-center">
            {isConfirmingSignOut ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => logout()}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 text-white font-sans text-xs font-bold hover:bg-red-700 transition-all cursor-pointer shadow-sm"
                >
                  Confirm Sign Out
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingSignOut(false)}
                  className="px-2.5 py-1.5 text-xs text-zinc-500 hover:text-jet-black cursor-pointer font-sans"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingSignOut(true)}
                className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-sans font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. PERSONAL PERFORMANCE & WORKSHOP IMPACT BAR
         ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* KPI 1: Assigned Deliverables */}
        <div
          onClick={() => setActiveTab && setActiveTab('my_tasks')}
          className="bg-white border border-jet-black/10 rounded-2xl p-4 shadow-xs hover:border-orange transition-all cursor-pointer group flex flex-col justify-between"
          title="Click to open your personal action workbench"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
              Assigned Tasks
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-700 font-bold group-hover:bg-jet-black group-hover:text-white transition-colors">
              {myCompletedTasks.length}/{myTasks.length} Done
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black font-mono text-jet-black">
              {myActiveTasks.length}
            </span>
            <span className="text-xs text-zinc-600 font-sans">in flight ({completionRate}%)</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-sans text-orange font-semibold pt-1 border-t border-zinc-100">
            <span>Open Workbench</span>
            <span>&rarr;</span>
          </div>
        </div>

        {/* KPI 2: Workshop Hours Logged */}
        <div className="bg-white border border-jet-black/10 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
              Workshop Time
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-bold">
              Verified
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black font-mono text-jet-black">
              {totalHoursLogged}
            </span>
            <span className="text-xs text-zinc-600 font-sans">hours logged</span>
          </div>
          <p className="mt-3 text-[11px] text-zinc-500 font-sans pt-1 border-t border-zinc-100">
            Recorded in engineering build logs
          </p>
        </div>

        {/* KPI 3: Build Steps Authored */}
        <div className="bg-white border border-jet-black/10 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
              Build Steps Authored
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              Proof
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black font-mono text-jet-black">
              {myLogs.length}
            </span>
            <span className="text-xs text-zinc-600 font-sans">verified entries</span>
          </div>
          <p className="mt-3 text-[11px] text-zinc-500 font-sans pt-1 border-t border-zinc-100">
            With Google Drive video proofs
          </p>
        </div>
      </div>

      {/* =========================================================================
          3. ASSIGNED ENGINEERING DOMAINS
         ========================================================================= */}
      <div className="bg-white border border-jet-black/10 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-jet-black font-sans flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange" />
          Assigned Engineering Domains &amp; Squads
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Primary Team */}
          <div className="p-4 rounded-xl bg-orange/5 border border-orange/20 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-orange uppercase tracking-wider">
                Primary Domain
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold border ${TEAMS[user.teamId]?.badgeBg}`}>
                {TEAMS[user.teamId]?.code}
              </span>
            </div>
            <div className="text-base font-bold text-jet-black font-sans">
              {TEAMS[user.teamId]?.name || user.teamId}
            </div>
            <p className="text-xs text-zinc-500 font-sans leading-relaxed">
              {TEAMS[user.teamId]?.description || 'Core engineering division'}
            </p>
          </div>

          {/* Secondary Teams */}
          <div className="p-4 rounded-xl bg-zinc-50 border border-jet-black/10 space-y-2">
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider block">
              Secondary Domains ({user.secondaryTeams?.length || 0})
            </span>
            {user.secondaryTeams && user.secondaryTeams.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {user.secondaryTeams.map((secId) => (
                  <span
                    key={secId}
                    className={`px-2.5 py-1 rounded-lg text-xs font-sans font-semibold border ${
                      TEAMS[secId]?.badgeBg || 'bg-white text-zinc-800 border-zinc-200'
                    }`}
                  >
                    {TEAMS[secId]?.shortName || secId}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 font-sans italic pt-1">
                No secondary domains assigned.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. SECURITY & PIN MANAGEMENT (Direct Change + Email OTP Recovery)
         ========================================================================= */}
      <PinChangeForm user={user} />

      {/* =========================================================================
          5. PWA & DEVICE ENVIRONMENT STATUS
         ========================================================================= */}
      <div className="bg-white border border-jet-black/10 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h4 className="text-sm font-bold text-jet-black font-sans">
              SIEP Progressive Web App (PWA)
            </h4>
          </div>
          <p className="text-xs text-zinc-500 font-sans">
            {isInstalled
              ? 'Installed as standalone app on this device with background synchronization.'
              : 'Install this application to your home screen for offline access and full screen view.'}
          </p>
        </div>

        {!isInstalled && installApp && (
          <button
            type="button"
            onClick={installApp}
            className="px-4 py-2.5 rounded-xl bg-orange text-white hover:bg-orange/90 font-sans text-xs font-semibold shadow-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 self-start sm:self-center"
          >
            <span>Install Web App</span>
            <span>⤓</span>
          </button>
        )}
      </div>
    </div>
  );
}
