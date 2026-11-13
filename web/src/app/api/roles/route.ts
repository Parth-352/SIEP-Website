import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/session';
import { isParthMasterAdmin, TeamMemberEntry, ROSTER_MEMBERS } from '@/lib/members';
import { getStoreMembers, saveStoreMember, deleteStoreMember, recordActivity } from '@/lib/store';
import { getFirestoreMembers, saveFirestoreMember, deleteFirestoreMember } from '@/lib/firestoreService';
import { TeamId } from '@/lib/types';
import { TEAMS } from '@/lib/teams';

/**
 * Master Role Management API Gateway
 * STRICT INVARIANT: Accessible ONLY by Parth Kshirsagar (parthkshirsagrr@gmail.com).
 */
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session || !isParthMasterAdmin(session.email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Access restricted strictly to Parth Kshirsagar (parthkshirsagrr@gmail.com).',
        },
        { status: 403 }
      );
    }

    // 1. Try Firestore first
    let members = await getFirestoreMembers();

    // 2. Fallback to memory / local store
    if (!members || members.length === 0) {
      members = getStoreMembers();
    }

    // If still empty, use default roster
    if (!members || members.length === 0) {
      members = [...ROSTER_MEMBERS];
    }

    return NextResponse.json({
      success: true,
      members,
      authorizedAs: session.email,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error in GET /api/roles:', errorMsg);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve team roster: ' + errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session || !isParthMasterAdmin(session.email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden: Access restricted strictly to Parth Kshirsagar (parthkshirsagrr@gmail.com).',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const action = body.action || 'update_member';

    // Current members
    let currentMembers = await getFirestoreMembers();
    if (!currentMembers || currentMembers.length === 0) {
      currentMembers = getStoreMembers();
    }

    if (action === 'delete_member') {
      const memberId = body.memberId;
      if (!memberId) {
        return NextResponse.json({ success: false, error: 'Member ID is required.' }, { status: 400 });
      }

      deleteStoreMember(memberId);
      try {
        await deleteFirestoreMember(memberId);
      } catch (err) {
        console.warn('Firestore delete error:', err);
      }

      recordActivity({
        type: 'task_status',
        memberName: 'Parth Kshirsagar (Master Admin)',
        teamId: 'core',
        title: 'Member Removed',
        detail: `Removed member ${memberId} from team roster.`,
      });

      return NextResponse.json({ success: true, deletedId: memberId });
    }

    if (action === 'add_member') {
      const name = (body.name || '').trim();
      const email = (body.email || '').trim().toLowerCase();
      if (!name || !email) {
        return NextResponse.json({ success: false, error: 'Name and email are required.' }, { status: 400 });
      }

      const teamId: TeamId = (body.teamId || 'software') as TeamId;
      const isLead = Boolean(body.isLead);
      const isCore = Boolean(body.isCore);
      const tier: 1 | 2 | 3 = isCore ? 1 : isLead ? 2 : (body.tier || 3);
      const role = (body.role || (isCore ? 'Core Member' : isLead ? `${TEAMS[teamId]?.name || teamId} Lead` : 'Team Member')).trim();

      const newMember: TeamMemberEntry = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        email,
        role,
        teamId,
        secondaryTeams: Array.isArray(body.secondaryTeams) ? body.secondaryTeams : [],
        isLead,
        isCore,
        tier,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'active',
        updatedAt: Date.now(),
      };

      saveStoreMember(newMember);
      try {
        await saveFirestoreMember(newMember);
      } catch (err) {
        console.warn('Firestore save error:', err);
      }

      recordActivity({
        type: 'log_submitted',
        memberName: 'Parth Kshirsagar (Master Admin)',
        teamId: teamId,
        title: 'New Member Added',
        detail: `Added new member ${name} as ${role} in ${TEAMS[teamId]?.name || teamId}.`,
      });

      return NextResponse.json({ success: true, member: newMember });
    }

    // Member modification actions (assign_captain, assign_vice_captain, revoke_permissions, update_member)
    const memberId = body.memberId;
    if (!memberId) {
      return NextResponse.json({ success: false, error: 'Member ID is required.' }, { status: 400 });
    }

    const existing = currentMembers.find(
      (m) => m.id === memberId || m.email.toLowerCase() === (body.email || '').toLowerCase()
    );

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Member not found in roster.' }, { status: 404 });
    }

    let updatedMember: TeamMemberEntry = { ...existing };

    if (action === 'assign_captain') {
      updatedMember = {
        ...existing,
        role: (body.roleTitle || 'Core Lead & Captain').trim(),
        isLead: true,
        isCore: true,
        tier: 1,
        teamId: body.teamId ? (body.teamId as TeamId) : existing.teamId,
        status: 'active',
        updatedAt: Date.now(),
      };
      recordActivity({
        type: 'task_status',
        memberName: 'Parth Kshirsagar (Master Admin)',
        teamId: updatedMember.teamId,
        title: 'Captain Appointed',
        detail: `Promoted ${existing.name} to Captain (${updatedMember.role}).`,
      });
    } else if (action === 'assign_vice_captain') {
      updatedMember = {
        ...existing,
        role: (body.roleTitle || 'Vice Captain').trim(),
        isLead: true,
        isCore: true,
        tier: 1,
        teamId: body.teamId ? (body.teamId as TeamId) : existing.teamId,
        status: 'active',
        updatedAt: Date.now(),
      };
      recordActivity({
        type: 'task_status',
        memberName: 'Parth Kshirsagar (Master Admin)',
        teamId: updatedMember.teamId,
        title: 'Vice Captain Appointed',
        detail: `Promoted ${existing.name} to Vice Captain (${updatedMember.role}).`,
      });
    } else if (action === 'revoke_permissions') {
      updatedMember = {
        ...existing,
        role: 'Team Member',
        isLead: false,
        isCore: false,
        tier: 3,
        updatedAt: Date.now(),
      };
      recordActivity({
        type: 'task_status',
        memberName: 'Parth Kshirsagar (Master Admin)',
        teamId: updatedMember.teamId,
        title: 'Permissions Revoked',
        detail: `Revoked leadership and administrative permissions for ${existing.name}. Reverted to Tier 3 Team Member.`,
      });
    } else {
      // General update
      const isLead = body.isLead !== undefined ? Boolean(body.isLead) : existing.isLead;
      const isCore = body.isCore !== undefined ? Boolean(body.isCore) : existing.isCore;
      const tier: 1 | 2 | 3 = isCore ? 1 : isLead ? 2 : (body.tier || 3);

      updatedMember = {
        ...existing,
        name: body.name ? body.name.trim() : existing.name,
        role: body.role ? body.role.trim() : existing.role,
        teamId: body.teamId ? (body.teamId as TeamId) : existing.teamId,
        secondaryTeams: Array.isArray(body.secondaryTeams) ? body.secondaryTeams : existing.secondaryTeams || [],
        isLead,
        isCore,
        tier,
        status: body.status || existing.status || 'active',
        updatedAt: Date.now(),
      };

      recordActivity({
        type: 'task_status',
        memberName: 'Parth Kshirsagar (Master Admin)',
        teamId: updatedMember.teamId,
        title: 'Role Updated',
        detail: `Updated role for ${updatedMember.name}: ${updatedMember.role} (${TEAMS[updatedMember.teamId]?.name || updatedMember.teamId}).`,
      });
    }

    saveStoreMember(updatedMember);
    try {
      await saveFirestoreMember(updatedMember);
    } catch (err) {
      console.warn('Firestore save error:', err);
    }

    return NextResponse.json({ success: true, member: updatedMember });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error in POST /api/roles:', errorMsg);
    return NextResponse.json(
      { success: false, error: 'Failed to update member role: ' + errorMsg },
      { status: 500 }
    );
  }
}
