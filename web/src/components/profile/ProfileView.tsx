"use client";

import React, { useState, useRef, useMemo } from 'react';
import { UserProfile, Task, WorkLog, TeamId } from '@/lib/types';
import { TEAMS } from '@/lib/teams';
import { DashboardTab } from '@/types/dashboard';
import { getMemberInitials, getAvatarColorClass } from '@/utils/avatarUtils';
import { useAuth } from '@/context/AuthContext';
import PinChangeForm from './PinChangeForm';

interface ProfileViewProps {
  user: UserProfile;
  tier: number;
  logout: () => void;
  isInstalled?: boolean;
  installApp?: (() => void) | null;
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

  // Photo Action Sheet & Lightbox Modal State
  const [isPhotoActionOpen, setIsPhotoActionOpen] = useState(false);
  const [isViewPhotoOpen, setIsViewPhotoOpen] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Collapsible Accordion States (My Domains & Reset PIN)
  const [isMyDomainsOpen, setIsMyDomainsOpen] = useState(false);
  const [isResetPinOpen, setIsResetPinOpen] = useState(false);

  // Copy email feedback state
  const [isEmailCopied, setIsEmailCopied] = useState(false);

  // Sign out confirmation state
  const [isConfirmingSignOut, setIsConfirmingSignOut] = useState(false);

  // All assigned domains (equal representation without primary vs secondary division)
  const allAssignedDomains: TeamId[] = useMemo(() => {
    const list: TeamId[] = [];
    if (user.teamId) list.push(user.teamId);
    if (user.secondaryTeams && Array.isArray(user.secondaryTeams)) {
      user.secondaryTeams.forEach((t) => {
        if (t && !list.includes(t)) list.push(t);
      });
    }
    return list;
  }, [user.teamId, user.secondaryTeams]);

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
    <div className="space-y-4 max-w-lg mx-auto pb-24 font-sans px-2 sm:px-0">
      {/* Hidden File Picker Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* =========================================================================
          1. HERO PROFILE CARD (Matching Reference Image)
         ========================================================================= */}
      <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden text-center">
        {/* Subtle Warm Top Accent Wave Banner */}
        <div className="absolute top-0 left-0 right-0 h-28 sm:h-32 bg-gradient-to-b from-[#FDE8D0]/60 via-[#FDF3E7]/40 to-transparent pointer-events-none rounded-t-3xl overflow-hidden">
          <svg
            className="w-full h-full opacity-40 text-[#E89234]"
            viewBox="0 0 400 120"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              d="M0,0 L400,0 L400,35 Q290,95 170,45 Q70,15 0,55 Z"
            />
          </svg>
        </div>

        {/* Center Circular Profile Avatar & Camera Badge */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 z-10 mt-1">
          <button
            type="button"
            onClick={() => setIsPhotoActionOpen(true)}
            className={`w-full h-full rounded-full border-4 border-white shadow-md overflow-hidden flex items-center justify-center cursor-pointer group hover:scale-[1.02] transition-transform ${
              !user.photoUrl ? getAvatarColorClass(user.displayName) : 'bg-zinc-100'
            }`}
            title="Click to view or update profile photo"
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
          </button>

          {/* Camera Badge Overlay */}
          <button
            type="button"
            onClick={() => setIsPhotoActionOpen(true)}
            disabled={isUploadingPhoto}
            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#1b222d] text-white border-2 border-white flex items-center justify-center shadow-md cursor-pointer hover:bg-orange transition-colors"
            title="Profile photo options"
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
        </div>

        {/* Member Name with Inline Editor */}
        <div className="mt-4 relative z-10 space-y-2">
          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex items-center justify-center gap-2 max-w-sm mx-auto">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-orange focus:ring-2 focus:ring-orange/20 text-lg font-bold text-jet-black font-sans text-center focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                disabled={isSavingName}
                className="px-3 py-1.5 bg-jet-black hover:bg-orange text-white text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                {isSavingName ? 'Saving...' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditingName(false);
                  setNameInput(user.displayName);
                }}
                className="px-2 py-1.5 text-xs text-zinc-500 hover:text-jet-black cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-black text-jet-black font-sans tracking-tight">
                {user.displayName}
              </h2>
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                title="Edit Display Name"
                className="p-1 rounded-md text-zinc-400 hover:text-orange hover:bg-orange/5 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          )}

          {nameError && (
            <p className="text-xs text-red-600 font-sans">{nameError}</p>
          )}
          {photoError && (
            <p className="text-xs text-red-600 font-sans">{photoError}</p>
          )}

          {/* Verified Gmail Chip with Copy Button */}
          <div className="flex items-center justify-center pt-0.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f4f6f8] border border-zinc-200/80 text-xs font-mono text-zinc-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-mono text-xs text-zinc-700">{user.email}</span>
              <button
                type="button"
                onClick={handleCopyEmail}
                title="Copy email address"
                className="text-zinc-400 hover:text-jet-black transition-colors cursor-pointer pl-1.5 border-l border-zinc-200 flex items-center"
              >
                {isEmailCopied ? (
                  <span className="text-[10px] text-emerald-600 font-sans font-bold">✓</span>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Subtitle: admin • Software */}
          <p className="text-xs font-medium text-zinc-500 font-sans">
            {user.role || 'admin'} •{' '}
            <span className="text-orange font-bold font-sans">
              {TEAMS[user.teamId]?.name || user.teamName}
            </span>
          </p>
        </div>
      </div>

      {/* =========================================================================
          2. THREE ACTION PILLS (Tasks, Build Steps, Workshop)
         ========================================================================= */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
        {/* Pill 1: Tasks */}
        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('my_tasks')}
          className="bg-white border border-zinc-200/80 rounded-2xl px-2 py-3 sm:px-3 sm:py-3.5 flex items-center justify-between shadow-xs hover:border-zinc-300 active:scale-[0.98] transition-all cursor-pointer group min-w-0"
        >
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-[11px] sm:text-xs font-bold text-jet-black font-sans whitespace-nowrap">
              Tasks
            </span>
          </div>
          <svg className="w-3 h-3 text-zinc-400 group-hover:text-jet-black transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Pill 2: Build Steps */}
        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('videos')}
          className="bg-white border border-zinc-200/80 rounded-2xl px-2 py-3 sm:px-3 sm:py-3.5 flex items-center justify-between shadow-xs hover:border-zinc-300 active:scale-[0.98] transition-all cursor-pointer group min-w-0"
        >
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-jet-black font-sans whitespace-nowrap">
              Build Steps
            </span>
          </div>
          <svg className="w-3 h-3 text-zinc-400 group-hover:text-jet-black transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Pill 3: Workshop */}
        <button
          type="button"
          onClick={() => setActiveTab && setActiveTab('metrics')}
          className="bg-white border border-zinc-200/80 rounded-2xl px-2 py-3 sm:px-3 sm:py-3.5 flex items-center justify-between shadow-xs hover:border-zinc-300 active:scale-[0.98] transition-all cursor-pointer group min-w-0"
        >
          <div className="flex items-center gap-1 sm:gap-2 min-w-0">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-[10.5px] sm:text-xs font-bold text-jet-black font-sans whitespace-nowrap">
              Workshop
            </span>
          </div>
          <svg className="w-3 h-3 text-zinc-400 group-hover:text-jet-black transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* =========================================================================
          3. COLLAPSIBLE ACCORDION: MY DOMAINS
         ========================================================================= */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsMyDomainsOpen(!isMyDomainsOpen)}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-zinc-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-sm font-bold text-jet-black font-sans">
              My Domains
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isMyDomainsOpen ? 'rotate-180 text-orange' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isMyDomainsOpen && (
          <div className="p-4 pt-2 border-t border-zinc-100 space-y-2.5 animate-in fade-in">
            {allAssignedDomains.length > 0 ? (
              allAssignedDomains.map((domainId) => {
                const team = TEAMS[domainId];
                if (!team) return null;
                return (
                  <div
                    key={domainId}
                    className="p-3.5 rounded-xl bg-zinc-50/70 border border-zinc-200/80 hover:border-orange/30 hover:bg-orange/2 transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-jet-black font-sans">
                        {team.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold border ${team.badgeBg}`}>
                        {team.code}
                      </span>
                    </div>
                    {team.description && (
                      <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                        {team.description}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-zinc-400 font-sans italic">
                No domains assigned.
              </p>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          4. COLLAPSIBLE ACCORDION: RESET PIN
         ========================================================================= */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsResetPinOpen(!isResetPinOpen)}
          className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-zinc-50/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <span className="text-sm font-bold text-jet-black font-sans block">
                Reset PIN
              </span>
              <span className="text-xs text-zinc-500 font-sans block">
                Update your 6-digit sign-in PIN
              </span>
            </div>
          </div>
          <svg
            className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isResetPinOpen ? 'rotate-90 text-emerald-600' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {isResetPinOpen && (
          <div className="p-4 pt-1 border-t border-zinc-100 animate-in fade-in">
            <PinChangeForm user={user} embedded={true} />
          </div>
        )}
      </div>

      {/* =========================================================================
          5. HORIZONTAL RED SIGN OUT BUTTON
         ========================================================================= */}
      {isConfirmingSignOut ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in">
          <span className="text-xs font-sans font-bold text-red-700">
            Are you sure you want to sign out of the operations portal?
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => logout()}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-sans text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Confirm Sign Out
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingSignOut(false)}
              className="flex-1 sm:flex-initial px-3 py-2 text-xs text-zinc-600 hover:text-jet-black cursor-pointer font-sans"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsConfirmingSignOut(true)}
          className="w-full py-3.5 px-4 rounded-2xl border border-red-500/80 bg-white hover:bg-red-50 active:scale-[0.99] text-red-600 font-bold font-sans text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
        >
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Sign Out</span>
        </button>
      )}

      {/* =========================================================================
          6. PHOTO ACTION SHEET MODAL (View Photo vs Upload Photo vs Remove Photo)
         ========================================================================= */}
      {isPhotoActionOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in slide-in-from-bottom-6 sm:zoom-in-95">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 overflow-hidden border border-zinc-200 flex items-center justify-center">
                  {user.photoUrl ? (
                    <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-mono text-sm font-bold text-zinc-600">
                      {getMemberInitials(user.displayName)}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-jet-black font-sans">
                    Profile Photo
                  </h4>
                  <p className="text-[11px] text-zinc-500 font-sans">
                    Personalize your official badge
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPhotoActionOpen(false)}
                className="w-7 h-7 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 pt-1">
              {user.photoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPhotoActionOpen(false);
                    setIsViewPhotoOpen(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-jet-black text-xs font-bold font-sans flex items-center gap-3 transition-colors cursor-pointer text-left"
                >
                  <svg className="w-4 h-4 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>View Full Photo</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsPhotoActionOpen(false);
                  fileInputRef.current?.click();
                }}
                className="w-full py-3 px-4 rounded-xl bg-orange/10 hover:bg-orange/20 text-orange text-xs font-bold font-sans flex items-center gap-3 transition-colors cursor-pointer text-left"
              >
                <svg className="w-4 h-4 text-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{user.photoUrl ? 'Upload New Photo' : 'Upload Profile Picture'}</span>
              </button>

              {user.photoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPhotoActionOpen(false);
                    handleRemovePhoto();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold font-sans flex items-center gap-3 transition-colors cursor-pointer text-left"
                >
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Remove Photo</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsPhotoActionOpen(false)}
                className="w-full py-2.5 rounded-xl text-zinc-500 hover:text-jet-black text-xs font-semibold font-sans transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. FULL PHOTO LIGHTBOX PREVIEW MODAL
         ========================================================================= */}
      {isViewPhotoOpen && user.photoUrl && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="relative max-w-sm w-full bg-zinc-900 border border-white/10 rounded-3xl p-5 text-center space-y-4 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsViewPhotoOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center text-xs font-mono transition-colors cursor-pointer"
            >
              ✕
            </button>
            <div className="w-64 h-64 mx-auto rounded-2xl overflow-hidden border-2 border-orange/40 shadow-xl bg-black">
              <img src={user.photoUrl} alt={user.displayName} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans">{user.displayName}</h3>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">{user.email}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
