import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/session';
import { isParthMasterAdmin, TeamMemberEntry, ROSTER_MEMBERS, getMemberDomains } from '@/lib/members';
import { getStoreMembers, saveStoreMember, deleteStoreMember, recordActivity } from '@/lib/store';
import {
  getFirestoreMembers,
  saveFirestoreMember,
  deleteFirestoreMember,
  getFirestoreMemberPasswords,
  saveFirestoreMemberPassword,
  getFirestoreMemberProfiles,
  saveFirestoreMemberProfile,
} from '@/lib/firestoreService';
import { TeamId, MemberProfileData } from '@/lib/types';
import { TEAMS } from '@/lib/teams';

const DEFAULT_PIN = '935200';

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

    // 1. Fetch merged members
    const rawMembers = await getFirestoreMembers();
    const passwords: Record<string, string> = await getFirestoreMemberPasswords().catch(() => ({} as Record<string, string>));
    const profiles: Record<string, MemberProfileData> = await getFirestoreMemberProfiles().catch(() => ({} as Record<string, MemberProfileData>));

    // 2. Enrich with passwords and profile pictures
    const enrichedMembers: TeamMemberEntry[] = rawMembers.map((m) => {
      const email = m.email.toLowerCase().trim();
      const customProfile = profiles[email];
      const customPass = passwords[email];
      const domains = getMemberDomains(m);

      return {
        ...m,
        name: customProfile?.displayName || m.name,
        domains,
        teamId: domains[0] || m.teamId || 'software',
        secondaryTeams: domains.slice(1),
        photoUrl: customProfile?.photoUrl || m.photoUrl || undefined,
        password: customPass || m.password || DEFAULT_PIN,
      };
    });

    return NextResponse.json({
      success: true,
      members: enrichedMembers,
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
    const currentMembers = await getFirestoreMembers();

    // Action: Delete Member
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

    // Action: Add Member
    if (action === 'add_member') {
      const name = (body.name || '').trim();
      const email = (body.email || '').trim().toLowerCase();
      if (!name || !email) {
        return NextResponse.json({ success: false, error: 'Name and email are required.' }, { status: 400 });
      }

      const domains: TeamId[] = Array.isArray(body.domains) && body.domains.length > 0
        ? body.domains
        : [((body.teamId as TeamId) || 'software')];
      const isLead = Boolean(body.isLead);
      const isCore = Boolean(body.isCore);
      const tier: 1 | 2 | 3 = isCore ? 1 : isLead ? 2 : (body.tier || 3);
      const role = (body.role || (isCore ? 'Core Member' : isLead ? 'Domain Lead' : 'Team Member')).trim();
      const initialPin = (body.password || DEFAULT_PIN).trim();
      const photoUrl = (body.photoUrl || '').trim();

      const newMember: TeamMemberEntry = {
        id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        email,
        role,
        domains,
        teamId: domains[0] || 'software',
        secondaryTeams: domains.slice(1),
        isLead,
        isCore,
        tier,
        password: initialPin,
        photoUrl: photoUrl || undefined,
        joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        status: 'active',
        updatedAt: Date.now(),
      };

      saveStoreMember(newMember);
      try {
        await saveFirestoreMember(newMember);
        if (initialPin) {
          await saveFirestoreMemberPassword(email, initialPin);
        }
        if (photoUrl) {
          await saveFirestoreMemberProfile(email, { displayName: name, photoUrl });
        }
      } catch (err) {
        console.warn('Firestore save error:', err);
      }

      recordActivity({
        type: 'log_submitted',
        memberName: 'Parth Kshirsagar (Master Admin)',
        teamId: domains[0] || 'core',
        title: 'New Member Added',
        detail: `Added new member ${name} as ${role} across [${domains.join(', ')}].`,
      });

      return NextResponse.json({ success: true, member: newMember });
    }

    // Member modification actions (assign_captain, assign_vice_captain, revoke_permissions, update_member)
    const memberId = body.memberId;
    const bodyEmail = (body.email || '').trim().toLowerCase();

    // Resilient member matching: check current dynamic members, then fallback to baseline ROSTER_MEMBERS
    let foundMember = currentMembers.find(
      (m) =>
        (memberId && m.id === memberId) ||
        (bodyEmail && m.email.toLowerCase().trim() === bodyEmail) ||
        (body.name && m.name.toLowerCase().trim() === body.name.toLowerCase().trim())
    );

    if (!foundMember) {
      foundMember = ROSTER_MEMBERS.find(
        (m) =>
          (memberId && m.id === memberId) ||
          (bodyEmail && m.email.toLowerCase().trim() === bodyEmail) ||
          (body.name && m.name.toLowerCase().trim() === body.name.toLowerCase().trim())
      );
    }

    const safeDomains: TeamId[] = Array.isArray(body.domains) && body.domains.length > 0
      ? (body.domains as TeamId[])
      : foundMember
      ? getMemberDomains(foundMember)
      : ['software'];

    const existing: TeamMemberEntry = foundMember
      ? { ...foundMember, domains: getMemberDomains(foundMember) }
      : {
          id: memberId || (body.name || 'member').toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: body.name ? body.name.trim() : 'Team Member',
          email: bodyEmail || body.email || '',
          role: body.role ? body.role.trim() : 'Team Member',
          teamId: safeDomains[0] || 'software',
          domains: safeDomains,
          secondaryTeams: safeDomains.slice(1),
          isLead: Boolean(body.isLead),
          isCore: Boolean(body.isCore),
          tier: body.tier || 3,
          status: 'active',
          joinedDate: 'Sep 15, 2026',
          updatedAt: Date.now(),
        };

    let updatedMember: TeamMemberEntry = {
      ...existing,
      domains: getMemberDomains(existing),
    };

    if (action === 'assign_captain') {
      updatedMember = {
        ...updatedMember,
        role: (body.roleTitle || 'Core Lead & Captain').trim(),
        isLead: true,
        isCore: true,
        tier: 1,
        status: 'active',
        updatedAt: Date.now(),
      };
      recordActivity({
        type: 'task_status',
        memberName: 'Parth Kshirsagar (Master Admin)',
        teamId: updatedMember.domains[0] || 'core',
        title: 'Captain Appointed',
        detail: `Promoted ${existing.name} to Captain (${updatedMember.role}).`,
      });
    } else if (action === 'assign_vice_captain') {
      updatedMember = {
        ...updatedMember,
        role: (body.roleTitle || 'Vice Captain').trim(),
        isLead: true,
        isCore: true,
        tier: 1,
        status: 'active',
        updatedAt: Date.now(),
      };
      recordActivity({
        type: 'task_status',
        memberName: 'Parth Kshirsagar (Master Admin)',
        teamId: updatedMember.domains[0] || 'core',
        title: 'Vice Captain Appointed',
        detail: `Promoted ${existing.name} to Vice Captain (${updatedMember.role}).`,
      });
    } else if (action === 'revoke_permissions') {
      updatedMember = {
        ...updatedMember,
        role: 'Team Member',
        isLead: false,
        isCore: false,
        tier: 3,
        updatedAt: Date.now(),
      };
      recordActivity({
        type: 'task_status',
        memberName: 'Parth Kshirsagar (Master Admin)',
        teamId: updatedMember.domains[0] || 'software',
        title: 'Permissions Revoked',
        detail: `Revoked leadership and administrative permissions for ${existing.name}. Reverted to Tier 3 Team Member.`,
      });
    } else {
      // General update
      const domains: TeamId[] = Array.isArray(body.domains) && body.domains.length > 0
        ? body.domains
        : getMemberDomains(existing);
      const isLead = body.isLead !== undefined ? Boolean(body.isLead) : existing.isLead;
      const isCore = body.isCore !== undefined ? Boolean(body.isCore) : existing.isCore;
      const tier: 1 | 2 | 3 = isCore ? 1 : isLead ? 2 : (body.tier || 3);

      updatedMember = {
        ...existing,
        id: existing.id,
        email: existing.email,
        name: body.name ? body.name.trim() : existing.name,
        role: body.role ? body.role.trim() : existing.role,
        domains,
        teamId: domains[0] || 'software',
        secondaryTeams: domains.slice(1),
        isLead,
        isCore,
        tier,
        status: (body.status || existing.status || 'active') as 'active' | 'inactive' | 'revoked',
        updatedAt: Date.now(),
      };

      // Handle Password Update if provided
      if (body.password && typeof body.password === 'string') {
        const cleanPass = body.password.trim();
        if (cleanPass) {
          updatedMember.password = cleanPass;
          try {
            await saveFirestoreMemberPassword(updatedMember.email, cleanPass);
          } catch (passErr) {
            console.warn('Password save error:', passErr);
          }
        }
      }

      // Handle Profile Picture (Removal or Update)
      if (body.removePhoto) {
        updatedMember.photoUrl = '';
        try {
          await saveFirestoreMemberProfile(updatedMember.email, { photoUrl: '' });
        } catch (photoErr) {
          console.warn('Photo removal error:', photoErr);
        }
      } else if (body.photoUrl !== undefined) {
        updatedMember.photoUrl = body.photoUrl.trim();
        try {
          await saveFirestoreMemberProfile(updatedMember.email, { photoUrl: body.photoUrl.trim() });
        } catch (photoErr) {
          console.warn('Photo save error:', photoErr);
        }
      }

      recordActivity({
        type: 'task_status',
        memberName: 'Parth Kshirsagar (Master Admin)',
        teamId: domains[0] || 'core',
        title: 'Role Updated',
        detail: `Updated role for ${updatedMember.name}: ${updatedMember.role} across [${domains.join(', ')}].`,
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
