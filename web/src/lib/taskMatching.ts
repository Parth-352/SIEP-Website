import { Task, UserProfile } from './types';
import { ROSTER_MEMBERS } from './members';

/**
 * Universal, robust matcher to determine if a task deliverable is assigned to a member.
 * Supports:
 * - Full name (exact or case-insensitive)
 * - First name / Last name
 * - Email address
 * - Member ID (e.g., 'mech-ganesh', 'soft-parth')
 * - Array or comma-separated string formats of assignedMembers
 * - Authoritative roster aliases
 */
export function isTaskAssignedToUser(task: Task | null | undefined, user: UserProfile | null | undefined): boolean {
  if (!user || !task) return false;

  const userDisplayName = (user.displayName || '').toLowerCase().trim();
  const userEmail = (user.email || '').toLowerCase().trim();
  const userMemberId = (user.memberId || '').toLowerCase().trim();

  // Extract name parts
  const nameParts = userDisplayName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

  // Parse assignedMembers safely
  let members: string[] = [];
  if (Array.isArray(task.assignedMembers)) {
    members = task.assignedMembers;
  } else if (typeof task.assignedMembers === 'string') {
    members = (task.assignedMembers as string).split(',').map((s) => s.trim());
  }

  if (members.length === 0) {
    return false;
  }

  // Lookup canonical roster profile for user
  const roster = ROSTER_MEMBERS.find(
    (rm) =>
      (userEmail && rm.email.toLowerCase() === userEmail) ||
      (userDisplayName && rm.name.toLowerCase() === userDisplayName) ||
      (userMemberId && rm.id.toLowerCase() === userMemberId)
  );

  for (const raw of members) {
    if (!raw) continue;
    const m = String(raw).toLowerCase().trim();

    // 1. Direct name match
    if (m === userDisplayName) return true;
    if (userDisplayName && (m.includes(userDisplayName) || userDisplayName.includes(m))) return true;

    // 2. Email match
    if (userEmail && (m === userEmail || m.includes(userEmail) || userEmail.includes(m))) return true;

    // 3. Member ID match
    if (userMemberId && (m === userMemberId || m.includes(userMemberId) || userMemberId.includes(m))) return true;

    // 4. First / Last name match
    if (firstName.length >= 3 && (m === firstName || m.includes(firstName) || firstName.includes(m))) return true;
    if (lastName.length >= 3 && (m === lastName || m.includes(lastName) || lastName.includes(m))) return true;

    // 5. Roster aliases
    if (roster) {
      const rName = roster.name.toLowerCase();
      const rId = roster.id.toLowerCase();
      if (m === rName || m.includes(rName) || rName.includes(m)) return true;
      if (m === rId || m.includes(rId) || rId.includes(m)) return true;
    }
  }

  return false;
}
