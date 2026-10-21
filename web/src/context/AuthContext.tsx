"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, TeamId, UserRole } from '@/lib/types';
import { TEAMS, getTeamByEmail } from '@/lib/teams';
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
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  isAdmin: false,
  isTeam: false,
  login: async () => ({ success: false }),
  logout: async () => {},
});

const STORAGE_KEY = 'siep_auth_user_v1';

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
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const profile = JSON.parse(saved);
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
          const matchedTeam = getTeamByEmail(fbUser.email);
          const profile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: matchedTeam ? matchedTeam.name : (fbUser.displayName || fbUser.email),
            role: (matchedTeam?.role || 'team') as UserRole,
            teamId: (matchedTeam?.id || 'core') as TeamId,
            teamName: matchedTeam ? matchedTeam.name : 'Team',
          };
          setUser(profile);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
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

    // Check credentials against our 11 pre-configured teams
    const team = getTeamByEmail(cleanEmail);

    // Verify team password (case-insensitive check for convenience: e.g. Core@9352 or core@9352)
    const isValidTeamPass = team && (
      cleanPass === team.defaultPass ||
      cleanPass.toLowerCase() === team.defaultPass.toLowerCase()
    );

    if (isValidTeamPass && team) {
      const profile: UserProfile = {
        uid: `user-${team.id}`,
        email: team.email,
        displayName: team.name,
        role: team.role,
        teamId: team.id,
        teamName: team.name,
      };

      setUser(profile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      syncSessionCookie(profile);

      // If Firebase is configured, attempt Firebase sign-in in background
      if (isFirebaseConfigured() && auth) {
        try {
          await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        } catch {
          // If user doesn't exist yet in Firebase Console, local login still succeeds!
        }
      }

      return { success: true };
    }

    // If Firebase is configured, check if it's a custom registered user in Firebase
    if (isFirebaseConfigured() && auth) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        const fbUser = userCredential.user;
        const matchedTeam = getTeamByEmail(cleanEmail);

        const profile: UserProfile = {
          uid: fbUser.uid,
          email: cleanEmail,
          displayName: matchedTeam ? matchedTeam.name : cleanEmail.split('@')[0],
          role: matchedTeam?.role || 'team',
          teamId: matchedTeam?.id || 'core',
          teamName: matchedTeam?.name || 'Riders Bay Team',
        };

        setUser(profile);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        syncSessionCookie(profile);
        return { success: true };
      } catch (fbErr: unknown) {
        const errMessage = fbErr instanceof Error ? fbErr.message : String(fbErr);
        return { success: false, error: errMessage };
      }
    }

    return {
      success: false,
      error: 'Invalid credentials. Please verify your team email and password.',
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
    syncSessionCookie(null);
  }

  // Only Core Leadership has full administrative scope
  const isAdmin = user?.teamId === 'core';
  const isTeam = Boolean(user && !isAdmin);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        isTeam,
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
