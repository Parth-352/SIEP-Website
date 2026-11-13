import { NextResponse } from 'next/server';
import { getFirestoreMembers, getFirestoreMemberProfiles } from '@/lib/firestoreService';
import { getMemberDomains } from '@/lib/members';
import { MemberProfileData } from '@/lib/types';

/**
 * Public Team Members API
 * Returns all 23+ active team innovators with dynamic role titles, domain allocations,
 * and profile pictures. Passwords are never exposed through this endpoint.
 */
export async function GET() {
  try {
    const rawMembers = await getFirestoreMembers();
    const profiles: Record<string, MemberProfileData> = await getFirestoreMemberProfiles().catch(() => ({} as Record<string, MemberProfileData>));

    const members = rawMembers.map((m) => {
      const email = m.email.toLowerCase().trim();
      const customProfile = profiles[email];
      const domains = getMemberDomains(m);

      return {
        id: m.id,
        name: customProfile?.displayName || m.name,
        role: m.role || 'Team Member',
        domains,
        teamId: domains[0] || m.teamId || 'software',
        secondaryTeams: domains.slice(1),
        isLead: Boolean(m.isLead),
        isCore: Boolean(m.isCore),
        tier: m.tier || (m.isCore ? 1 : m.isLead ? 2 : 3),
        email: m.email,
        photoUrl: customProfile?.photoUrl || m.photoUrl || undefined,
        joinedDate: m.joinedDate || 'Sep 15, 2026',
        status: m.status || 'active',
        updatedAt: m.updatedAt || Date.now(),
      };
    });

    return NextResponse.json({
      success: true,
      members,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error in GET /api/members:', errorMsg);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team members: ' + errorMsg },
      { status: 500 }
    );
  }
}
