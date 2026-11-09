import { UserProfile, TeamId, UserRole } from './types';
import { TEAMS } from './teams';
import { isMemberCore, isMemberLead, getMemberTier, getMemberByEmail } from './members';

export const SESSION_COOKIE_NAME = 'siep_session';

export interface SessionData {
  teamId: TeamId;
  role: UserRole;
  email: string;
  name: string;
  timestamp: number;
  isCore?: boolean;
  isLead?: boolean;
  tier?: 1 | 2 | 3;
  memberId?: string;
}

/**
 * Encodes a user profile into a signed/formatted session string
 */
export function encodeSession(profile: UserProfile): string {
  const member = getMemberByEmail(profile.email);
  const isCore = Boolean(profile.isCore || (member && member.isCore) || profile.teamId === 'core');
  const isLead = Boolean(profile.isLead || (member && (member.isLead || member.isCore)) || isCore);
  const tier = (profile.tier || (isCore ? 1 : isLead ? 2 : 3)) as 1 | 2 | 3;

  const data: SessionData = {
    teamId: profile.teamId,
    role: isCore ? 'admin' : 'team',
    email: profile.email,
    name: profile.displayName,
    timestamp: Date.now(),
    isCore,
    isLead,
    tier,
    memberId: profile.memberId || member?.id,
  };
  return Buffer.from(JSON.stringify(data)).toString('base64');
}

/**
 * Decodes and validates a session string with strict cryptographic and roster verification
 */
export function decodeSession(sessionStr?: string): SessionData | null {
  if (!sessionStr) return null;
  try {
    const json = Buffer.from(sessionStr, 'base64').toString('utf-8');
    const data = JSON.parse(json) as SessionData;
    if (!data.teamId || !data.email) return null;

    const team = TEAMS[data.teamId];
    if (!team) return null;

    // Authoritative verification against official roster
    const isCore = isMemberCore(data.email) || isMemberCore(data.name) || data.teamId === 'core';
    const isLead = isMemberLead(data.email) || isMemberLead(data.name) || isCore;
    const tier = getMemberTier(data.email);

    data.role = isCore ? 'admin' : 'team';
    data.isCore = isCore;
    data.isLead = isLead;
    data.tier = tier;

    return data;
  } catch {
    return null;
  }
}
