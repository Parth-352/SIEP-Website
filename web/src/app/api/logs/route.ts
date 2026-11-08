import { NextRequest, NextResponse } from 'next/server';
import { getLogs, createLog, getLogById, updateLog, deleteLog } from '@/lib/store';
import { 
  getFirestoreLogs, 
  saveFirestoreLog, 
  deleteFirestoreLog 
} from '@/lib/firestoreService';
import { TeamId } from '@/lib/types';
import { TEAMS } from '@/lib/teams';
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in to view engineering build logs.' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    let teamId = searchParams.get('teamId') || undefined;

    // Strict role enforcement: ONLY Core Leadership can view logs across all teams.
    // Subsystem squads can ONLY view their own logs.
    if (session.teamId !== 'core') {
      teamId = session.teamId;
    }

    // 1. Try Firestore first
    const firestoreLogs = await getFirestoreLogs(teamId);
    if (firestoreLogs !== null) {
      return NextResponse.json({ success: true, logs: firestoreLogs, source: 'firestore' });
    }

    // 2. Fallback to local store
    const logs = getLogs(teamId);
    return NextResponse.json({ success: true, logs, source: 'local' });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in before publishing step logs.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    let {
      stepTitle,
      phase,
      teamId,
      authorName,
      date,
      workTime,
      membersPresent,
      hoursSpent,
      description,
      achievements,
      blockers,
      videoUrl,
      driveFileId,
      videoSource,
    } = body;

    // Subsystem squads can ONLY submit logs for their own team
    if (session.teamId !== 'core') {
      teamId = session.teamId;
    }

    if (!stepTitle || !teamId || !description) {
      return NextResponse.json(
        { success: false, error: 'Step Title, Team, and Description are required' },
        { status: 400 }
      );
    }

    const team = TEAMS[teamId as TeamId];
    const teamName = team ? team.name : teamId;

    const newLog = createLog({
      stepTitle,
      phase: phase || 'Engineering Move',
      teamId: teamId as TeamId,
      teamName,
      authorName: authorName || 'Team Member',
      date: date || new Date().toISOString().split('T')[0],
      workTime: workTime || '12:00 PM',
      membersPresent: Array.isArray(membersPresent) ? membersPresent : [],
      hoursSpent: Number(hoursSpent) || 0,
      description,
      achievements: achievements || '',
      blockers: blockers || '',
      videoUrl: videoUrl || undefined,
      driveFileId: driveFileId || undefined,
      videoSource: videoSource || (videoUrl ? 'drive' : undefined),
    });

    // Cloud Firestore Sync
    await saveFirestoreLog(newLog).catch((err) => {
      console.warn('Firestore log sync notice:', err);
    });

    return NextResponse.json({ success: true, log: newLog }, { status: 201 });
  } catch (error) {
    console.error('Error creating log:', error);
    return NextResponse.json({ success: false, error: 'Failed to create log' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in to edit engineering build logs.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Log ID is required for updates.' }, { status: 400 });
    }

    const existingLog = getLogById(id);
    if (!existingLog) {
      // Try from Firestore
      const fsLogs = await getFirestoreLogs();
      const fsExisting = fsLogs?.find((l) => l.id === id);
      if (!fsExisting) {
        return NextResponse.json({ success: false, error: 'Log record not found.' }, { status: 404 });
      }
      if (session.teamId !== 'core' && fsExisting.teamId !== session.teamId) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You can only edit step logs created by your subsystem team.' },
          { status: 403 }
        );
      }
      const updatedFs = {
        ...fsExisting,
        ...updates,
        updatedAt: Date.now(),
      };
      saveFirestoreLog(updatedFs).catch(() => {});
      return NextResponse.json({ success: true, log: updatedFs });
    }

    // Role enforcement: ONLY Core Leadership can edit logs belonging to other teams
    const isCoreAdmin = session.teamId === 'core';
    if (!isCoreAdmin) {
      if (existingLog.teamId !== session.teamId) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You can only edit step logs created by your subsystem team.' },
          { status: 403 }
        );
      }
      // Non-admins cannot transfer a log to another team
      delete updates.teamId;
      delete updates.teamName;
    } else if (updates.teamId) {
      const team = TEAMS[updates.teamId as TeamId];
      updates.teamName = team ? team.name : updates.teamId;
    }

    if (updates.hoursSpent !== undefined) {
      updates.hoursSpent = Number(updates.hoursSpent) || 0;
    }

    const updated = updateLog(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Failed to apply log update.' }, { status: 500 });
    }

    await saveFirestoreLog(updated).catch((err) => {
      console.warn('Firestore log update sync notice:', err);
    });

    return NextResponse.json({ success: true, log: updated });
  } catch (error) {
    console.error('Error updating log:', error);
    return NextResponse.json({ success: false, error: 'Failed to update log.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in to delete engineering step logs.' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Log ID parameter is required.' }, { status: 400 });
    }

    const existingLog = getLogById(id);
    if (!existingLog) {
      const fsLogs = await getFirestoreLogs();
      const fsExisting = fsLogs?.find((l) => l.id === id);
      if (!fsExisting) {
        return NextResponse.json({ success: false, error: 'Log record not found.' }, { status: 404 });
      }
      if (session.teamId !== 'core' && fsExisting.teamId !== session.teamId) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You can only delete step logs created by your subsystem team.' },
          { status: 403 }
        );
      }
      await deleteFirestoreLog(id);
      return NextResponse.json({ success: true });
    }

    // Role enforcement: ONLY Core Leadership can delete logs belonging to other teams
    const isCoreAdmin = session.teamId === 'core';
    if (!isCoreAdmin && existingLog.teamId !== session.teamId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only delete step logs created by your subsystem team.' },
        { status: 403 }
      );
    }

    const deleted = deleteLog(id);
    await deleteFirestoreLog(id).catch((err) => {
      console.warn('Firestore log delete sync notice:', err);
    });

    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting log:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete log.' }, { status: 500 });
  }
}
