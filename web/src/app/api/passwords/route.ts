import { NextRequest, NextResponse } from 'next/server';
import { TEAMS } from '@/lib/teams';
import { TeamId } from '@/lib/types';
import {
  getTeamPasswords,
  getTeamPassword,
  getMemberPasswords,
  getMemberPassword,
} from '@/lib/store';
import {
  getFirestorePasswords,
  getFirestoreMemberPasswords,
} from '@/lib/firestoreService';
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/session';
import {
  ROSTER_MEMBERS,
  getMemberByEmail,
  isMemberCore,
  isMemberLead,
  getMemberTier,
} from '@/lib/members';

const DEFAULT_MEMBER_PIN = '935200';

/**
 * GET /api/passwords
 * Returns active passwords for authenticated Core Leadership or password status flags.
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    // Merge store passwords and Firestore passwords for teams
    const fsPasswords = await getFirestorePasswords();
    const storePasswords = getTeamPasswords();
    const customTeamPasswords = { ...storePasswords, ...fsPasswords };

    // Merge member passwords
    const fsMemberPasswords = await getFirestoreMemberPasswords();
    const storeMemberPasswords = getMemberPasswords();
    const customMemberPasswords = { ...storeMemberPasswords, ...fsMemberPasswords };

    const isCoreAdmin = Boolean(
      session && (session.isCore || session.role === 'admin' || session.teamId === 'core')
    );

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Session required' },
        { status: 401 }
      );
    }

    if (!isCoreAdmin) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Central Core Leadership access required' },
        { status: 403 }
      );
    }

    // 1. Team passwords
    const allTeamPasswords: Record<string, { password: string; isCustom: boolean }> = {};
      Object.values(TEAMS).forEach((team) => {
        const custom = customTeamPasswords[team.id];
        allTeamPasswords[team.id] = {
          password: custom || team.defaultPass,
          isCustom: Boolean(custom),
        };
      });

      // 2. Member PINs for all 23 members
      const allMemberCredentials = ROSTER_MEMBERS.map((m) => {
        const custom = customMemberPasswords[m.email.toLowerCase()];
        return {
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
          teamId: m.teamId,
          isCore: Boolean(m.isCore),
          isLead: Boolean(m.isLead),
          tier: getMemberTier(m.email),
          password: custom || DEFAULT_MEMBER_PIN,
          isCustom: Boolean(custom),
        };
      });

      return NextResponse.json({
        success: true,
        passwords: allTeamPasswords,
        memberCredentials: allMemberCredentials,
      });
  } catch (error) {
    console.error('Error fetching passwords:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/passwords
 * Verifies email + 6-digit numeric password for member logins
 * (or teamId + password for legacy squad logins)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, teamId } = body;

    // ─── 1. PERSONAL MEMBER LOGIN (EMAIL + 6-DIGIT PIN) ─────────────────
    if (email) {
      const cleanEmail = String(email).trim().toLowerCase();
      const cleanPass = String(password || '').trim();

      if (!cleanPass) {
        return NextResponse.json(
          { success: false, error: 'Please enter your 6-digit PIN.' },
          { status: 400 }
        );
      }

      const member = getMemberByEmail(cleanEmail);
      if (!member) {
        return NextResponse.json(
          {
            success: false,
            error: 'Email address not found in the official SIEP roster. Please check your spelling.',
          },
          { status: 404 }
        );
      }

      // Check Firestore member passwords first, then fallback to local store
      const fsMemberPasswords = await getFirestoreMemberPasswords();
      const customPass = fsMemberPasswords[cleanEmail] || getMemberPassword(cleanEmail);
      const activePass = customPass || DEFAULT_MEMBER_PIN;

      // Strict PIN validation: only the active PIN is valid.
      // Default PIN 935200 is only valid if no custom PIN has been set yet.
      const isValid = cleanPass === activePass;

      if (!isValid) {
        return NextResponse.json({
          success: true,
          valid: false,
          error: customPass
            ? 'Incorrect 6-digit PIN. Please enter your active PIN or use Forgot PIN.'
            : 'Incorrect 6-digit PIN. Default PIN is 935200.',
        });
      }

      const isCore = isMemberCore(member.email);
      const isLead = isMemberLead(member.email);
      const tier = getMemberTier(member.email);

      return NextResponse.json({
        success: true,
        valid: true,
        member: {
          id: member.id,
          name: member.name,
          email: member.email,
          role: member.role,
          teamId: member.teamId,
          secondaryTeams: member.secondaryTeams || [],
          isCore,
          isLead,
          tier,
        },
        isCore,
        isLead,
        tier,
      });
    }

    // ─── 2. LEGACY SQUAD LOGIN (TEAM ID + PASSWORD) ─────────────────────
    if (teamId) {
      if (!password) {
        return NextResponse.json(
          { success: false, error: 'Password is required.' },
          { status: 400 }
        );
      }

      const team = TEAMS[teamId as TeamId];
      if (!team) {
        return NextResponse.json({ success: false, error: 'Team not found' }, { status: 404 });
      }

      const cleanPass = String(password).trim();
      const fsPasswords = await getFirestorePasswords();
      const customPass = fsPasswords[teamId] || getTeamPassword(teamId);
      const activePass = customPass || team.defaultPass;

      const isValid =
        cleanPass === activePass ||
        cleanPass.toLowerCase() === activePass.toLowerCase() ||
        (customPass && (cleanPass === team.defaultPass || cleanPass.toLowerCase() === team.defaultPass.toLowerCase()));

      return NextResponse.json({
        success: true,
        valid: Boolean(isValid),
      });
    }

    return NextResponse.json(
      { success: false, error: 'Email or teamId is required.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
