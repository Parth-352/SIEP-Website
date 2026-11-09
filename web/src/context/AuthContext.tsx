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
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isAdmin: false,
  isTeam: false,
  isCore: false,
  isLead: false,
  tier: 3,
  login: async () => ({ success: false }),
  logout: async () => {},
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

    // Re-verify against authoritative roster
    const member = getMemberByEmail(profile.email);
    if (member) {
      profile.displayName = member.name;
      profile.isCore = member.isCore;
      profile.isLead = member.isLead;
      profile.tier = getMemberTier(member.email);
      profile.role = member.isCore ? 'admin' : 'team';
      profile.teamId = member.teamId;
      profile.teamName = TEAMS[member.teamId]?.name || 'SIEP Squad';
      profile.memberId = member.id;
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

          const isCore = isMemberCore(fbUser.email);
          const isLead = isMemberLead(fbUser.email);
          const tier = getMemberTier(fbUser.email);

          const profile: UserProfile = {
            uid: member?.id || fbUser.uid,
            email: fbUser.email,
            displayName: member?.name || matchedTeam?.name || fbUser.displayName || fbUser.email,
            role: isCore ? 'admin' : 'team',
            teamId: (member?.teamId || matchedTeam?.id || 'core') as TeamId,
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

      if (data && data.error && verifyRes.status !== 404) {
        return { success: false, error: data.error };
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

  const isCore = Boolean(user?.isCore || user?.teamId === 'core');
  const isLead = Boolean(user?.isLead || isCore);
  const isAdmin = isCore;
  const isTeam = Boolean(user && !isCore);
  const tier: 1 | 2 | 3 = user?.tier || (isCore ? 1 : isLead ? 2 : 3);

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
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
