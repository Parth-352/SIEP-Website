import { UserProfile, TeamId, UserRole } from './types';
import { TEAMS } from './teams';

export const SESSION_COOKIE_NAME = 'siep_session';

export interface SessionData {
  teamId: TeamId;
  role: UserRole;
  email: string;
  name: string;
  timestamp: number;
}

/**
 * Encodes a user profile into a signed/formatted session string
 */
export function encodeSession(profile: UserProfile): string {
  const data: SessionData = {
    teamId: profile.teamId,
    role: profile.role,
    email: profile.email,
    name: profile.displayName,
    timestamp: Date.now(),
  };
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

/**
 * Decodes and validates a session string
 */
export function decodeSession(sessionStr?: string): SessionData | null {
  if (!sessionStr) return null;
  try {
    const json = Buffer.from(sessionStr, 'base64').toString('utf-8');
    const data = JSON.parse(json) as SessionData;
    if (!data.teamId || !data.role) return null;
    // Verify teamId is one of our valid teams
    if (!TEAMS[data.teamId]) return null;
    return data;
  } catch {
    return null;
  }
}
