"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, TeamId, UserRole } from '@/lib/types';
import { TEAMS, getTeamByEmail, getTeamById } from '@/lib/teams';
import {
  getMemberByEmail,
  isMemberCore,
  isMemberLead,
  getMemberTier,
} from '@/lib/members';
import { auth, isFirebaseConfigured } from '@/lib/firebase';
import { encodeSession, SESSION_COOKIE_NAME } from '@/lib/session';
import { 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isTeam: boolean;
  isCore: boolean;
  isLead: boolean;
  tier: 1 | 2 | 3;
  userTeams: TeamId[];
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: { displayName?: string; photoUrl?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isAdmin: false,
  isTeam: false,
  isCore: false,
  isLead: false,
  tier: 3,
  userTeams: [],
  login: async () => ({ success: false }),
  logout: async () => {},
  updateUserProfile: async () => {},
});

const STORAGE_KEY = 'siep_auth_user_v2';

function syncSessionCookie(profile: UserProfile | null) {
  if (typeof document === 'undefined') return;
  if (profile) {
    document.cookie = `${SESSION_COOKIE_NAME}=${encodeSession(profile)}; path=/; max-age=2592000; SameSite=Lax;`;
  } else {
    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax;`;
  }
}

function getSavedUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('siep_auth_user_v1');
    if (!saved) return null;
    const profile = JSON.parse(saved) as UserProfile;

    // Re-verify against authoritative roster while preserving dynamic leadership promotions
    const member = getMemberByEmail(profile.email);
    if (member) {
      profile.displayName = profile.displayName || member.name;
      profile.photoUrl = profile.photoUrl || member.photoUrl || undefined;
      profile.isCore = Boolean(profile.isCore !== undefined ? profile.isCore : member.isCore);
      profile.isLead = Boolean(profile.isLead !== undefined ? profile.isLead : member.isLead);
      profile.tier = (profile.tier || getMemberTier(member.email) || (profile.isCore ? 1 : profile.isLead ? 2 : 3)) as 1 | 2 | 3;
      profile.role = profile.isCore ? 'admin' : 'team';
      profile.teamId = profile.teamId || member.teamId;
      profile.secondaryTeams = profile.secondaryTeams?.length ? profile.secondaryTeams : (member.secondaryTeams || []);
      profile.teamName = TEAMS[profile.teamId]?.name || TEAMS[member.teamId]?.name || 'SIEP Squad';
      profile.memberId = profile.memberId || member.id;
    } else if (profile.teamId) {
      const canonicalTeam = getTeamById(profile.teamId);
      if (canonicalTeam) {
        profile.role = canonicalTeam.role;
        profile.teamName = canonicalTeam.name;
      }
    }

    syncSessionCookie(profile);
    return profile;
  } catch (e) {
    console.error('Error reading auth from storage', e);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(getSavedUser);
  const [loading, setLoading] = useState<boolean>(false);

  // Initialize session from Firebase if configured
  useEffect(() => {
    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
        if (fbUser && fbUser.email) {
          const member = getMemberByEmail(fbUser.email);
          const matchedTeam = getTeamByEmail(fbUser.email);

          const savedUser = getSavedUser();
          const isCore = Boolean(savedUser?.isCore !== undefined ? savedUser.isCore : (member?.isCore ?? isMemberCore(fbUser.email)));
          const isLead = Boolean(savedUser?.isLead !== undefined ? savedUser.isLead : (member?.isLead ?? isMemberLead(fbUser.email)));
          const tier = (savedUser?.tier || (member?.tier ?? getMemberTier(fbUser.email)) || (isCore ? 1 : isLead ? 2 : 3)) as 1 | 2 | 3;

          const profile: UserProfile = {
            uid: member?.id || fbUser.uid,
            email: fbUser.email,
            displayName: member?.name || matchedTeam?.name || fbUser.displayName || fbUser.email,
            role: isCore ? 'admin' : 'team',
            teamId: (member?.teamId || matchedTeam?.id || 'core') as TeamId,
            secondaryTeams: member?.secondaryTeams || [],
            teamName: member ? (TEAMS[member.teamId]?.name || 'SIEP Squad') : (matchedTeam?.name || 'SIEP Team'),
            isCore,
            isLead,
            tier,
            memberId: member?.id,
          };
          setUser(profile);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
          syncSessionCookie(profile);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, []);

  // Synchronize profile updates (displayName, photoUrl) from server / Firestore
  useEffect(() => {
    if (!user?.email) return;
    let isMounted = true;
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !data.success || !data.profiles) return;
        const myProfile = data.profiles[user.email.toLowerCase().trim()];
        if (myProfile) {
          setUser((prev) => {
            if (!prev) return null;
            const needsUpdate =
              (myProfile.displayName && myProfile.displayName !== prev.displayName) ||
              (myProfile.photoUrl !== undefined && myProfile.photoUrl !== prev.photoUrl);
            if (needsUpdate) {
              const updated: UserProfile = {
                ...prev,
                ...(myProfile.displayName ? { displayName: myProfile.displayName } : {}),
                ...(myProfile.photoUrl !== undefined ? { photoUrl: myProfile.photoUrl } : {}),
              };
              try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
                syncSessionCookie(updated);
              } catch (e) {
                console.warn('Storage sync error:', e);
              }
              return updated;
            }
            return prev;
          });
        }
      })
      .catch((err) => console.warn('Could not sync user profile:', err));

    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  // Login handler
  async function login(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    try {
      // 1. Primary verification: Personal Member Login via API
      const verifyRes = await fetch('/api/passwords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });

      const data = await verifyRes.json();

      if (verifyRes.ok && data.success && data.valid && data.member) {
        const mem = data.member;
        const profile: UserProfile = {
          uid: mem.id,
          email: mem.email,
          displayName: mem.name,
          role: data.isCore ? 'admin' : 'team',
          teamId: mem.teamId,
          secondaryTeams: mem.secondaryTeams || getMemberByEmail(cleanEmail)?.secondaryTeams || [],
          teamName: TEAMS[mem.teamId as TeamId]?.name || 'SIEP Squad',
          isCore: Boolean(data.isCore),
          isLead: Boolean(data.isLead),
          tier: data.tier || 3,
          memberId: mem.id,
        };

        setUser(profile);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        syncSessionCookie(profile);

        // Attempt background Firebase sign-in if configured
        if (isFirebaseConfigured() && auth) {
          try {
            await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
          } catch {
            // Local login still succeeds!
          }
        }

        return { success: true };
      }

      // STRICT PIN CHECK: If member API returned invalid PIN or error, do not fall through to legacy/fallback auth!
      if (data && (data.valid === false || data.error)) {
        return { success: false, error: data.error || 'Incorrect 6-digit PIN.' };
      }
    } catch (err) {
      console.warn('API password verification notice:', err);
    }

    // 2. Legacy fallback for team credentials
    const team = getTeamByEmail(cleanEmail);
    if (team) {
      let isValidTeamPass = cleanPass === team.defaultPass || cleanPass.toLowerCase() === team.defaultPass.toLowerCase();

      if (!isValidTeamPass) {
        try {
          const verifyRes = await fetch('/api/passwords', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teamId: team.id, password: cleanPass }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success && verifyData.valid) {
            isValidTeamPass = true;
          }
        } catch {
          // ignore
        }
      }

      if (isValidTeamPass) {
        const isCore = team.id === 'core';
        const profile: UserProfile = {
          uid: `user-${team.id}`,
          email: team.email,
          displayName: team.name,
          role: isCore ? 'admin' : 'team',
          teamId: team.id,
          teamName: team.name,
          isCore,
          isLead: true,
          tier: isCore ? 1 : 2,
        };

        setUser(profile);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        syncSessionCookie(profile);
        return { success: true };
      }
    }

    return {
      success: false,
      error: 'Invalid credentials. Please verify your registered email and 6-digit PIN.',
    };
  }

  // Logout handler
  async function logout() {
    if (isFirebaseConfigured() && auth) {
      try {
        await fbSignOut(auth);
      } catch (err) {
        console.error('Firebase signout error', err);
      }
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('siep_auth_user_v1');
    syncSessionCookie(null);
  }

  const updateUserProfile = async (updates: { displayName?: string; photoUrl?: string }) => {
    if (!user) return;
    const updated: UserProfile = {
      ...user,
      ...(updates.displayName ? { displayName: updates.displayName } : {}),
      ...(updates.photoUrl !== undefined ? { photoUrl: updates.photoUrl } : {}),
    };
    setUser(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      syncSessionCookie(updated);
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  };

  const isCore = Boolean(user?.isCore || user?.teamId === 'core');
  const isLead = Boolean(user?.isLead || isCore);
  const isAdmin = isCore;
  const isTeam = Boolean(user && !isCore);
  const tier: 1 | 2 | 3 = user?.tier || (isCore ? 1 : isLead ? 2 : 3);
  const userTeams: TeamId[] = user
    ? Array.from(new Set([user.teamId, ...(user.secondaryTeams || [])]))
    : [];

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isTeam,
        isCore,
        isLead,
        tier,
        userTeams,
        login,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
