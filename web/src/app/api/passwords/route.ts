import { NextRequest, NextResponse } from 'next/server';
import { TEAMS } from '@/lib/teams';
import { TeamId } from '@/lib/types';
import { getTeamPasswords, getTeamPassword } from '@/lib/store';
import { getFirestorePasswords } from '@/lib/firestoreService';
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/session';

/**
 * GET /api/passwords
 * Returns active passwords for authenticated admin or teams.
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    // Merge store passwords and Firestore passwords
    const fsPasswords = await getFirestorePasswords();
    const storePasswords = getTeamPasswords();
    const customPasswords = { ...storePasswords, ...fsPasswords };

    // If Core Leadership (admin), return all passwords (custom or default)
    if (session && (session.role === 'admin' || session.teamId === 'core')) {
      const allPasswords: Record<string, { password: string; isCustom: boolean }> = {};

      Object.values(TEAMS).forEach((team) => {
        const custom = customPasswords[team.id];
        allPasswords[team.id] = {
          password: custom || team.defaultPass,
          isCustom: Boolean(custom),
        };
      });

      return NextResponse.json({ success: true, passwords: allPasswords });
    }

    // For unauthenticated or normal teams, return list of team IDs that have custom passwords
    // (does not leak the actual passwords publicly)
    const updatedTeamIds = Object.keys(customPasswords);

    return NextResponse.json({
      success: true,
      hasCustomPasswords: updatedTeamIds.length > 0,
      updatedTeamIds,
    });
  } catch (error) {
    console.error('Error fetching team passwords:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/passwords
 * Verifies a team's password against custom store & defaults
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { teamId, password } = body;

    if (!teamId || !password) {
      return NextResponse.json(
        { success: false, error: 'teamId and password are required' },
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
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 });
  }
}
