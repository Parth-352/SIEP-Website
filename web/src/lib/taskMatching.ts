import { Task, UserProfile, SubTask, TaskComment } from './types';
import { ROSTER_MEMBERS } from './members';

/**
 * Defensive normalizer ensuring any task object (from local JSON, API, or Firestore)
 * always has guaranteed arrays and booleans for sprint subtasks, comments, and blockers.
 */
export function normalizeTask(raw: any): Task {
  if (!raw || typeof raw !== 'object') {
    return {
      id: `task-${Date.now()}`,
      title: 'Untitled Task',
      description: '',
      teamId: 'core',
      assignedMembers: [],
      status: 'todo',
      priority: 'medium',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      subtasks: [],
      comments: [],
      estimatedHours: 0,
      actualHours: 0,
      isBlocked: false,
      blockerReason: '',
    };
  }

  const assignedMembers: string[] = Array.isArray(raw.assignedMembers)
    ? raw.assignedMembers
    : typeof raw.assignedMembers === 'string'
    ? raw.assignedMembers.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const subtasks: SubTask[] = Array.isArray(raw.subtasks)
    ? raw.subtasks.map((st: any, idx: number) => ({
        id: String(st.id || `st-${idx}-${Date.now()}`),
        text: String(st.text || ''),
        completed: Boolean(st.completed),
        completedBy: st.completedBy ? String(st.completedBy) : undefined,
        completedAt: st.completedAt ? Number(st.completedAt) : undefined,
      }))
    : [];

  const comments: TaskComment[] = Array.isArray(raw.comments)
    ? raw.comments.map((c: any, idx: number) => ({
        id: String(c.id || `c-${idx}-${Date.now()}`),
        authorId: String(c.authorId || ''),
        authorName: String(c.authorName || 'Team Member'),
        authorTeam: c.authorTeam || undefined,
        text: String(c.text || ''),
        createdAt: Number(c.createdAt || Date.now()),
      }))
    : [];

  return {
    ...raw,
    id: String(raw.id || `task-${Date.now()}`),
    title: String(raw.title || ''),
    description: String(raw.description || ''),
    teamId: raw.teamId || 'core',
    assignedMembers,
    status: raw.status || 'todo',
    priority: raw.priority || 'medium',
    dueDate: raw.dueDate || undefined,
    createdAt: Number(raw.createdAt || Date.now()),
    updatedAt: Number(raw.updatedAt || Date.now()),
    subtasks,
    comments,
    estimatedHours: Number(raw.estimatedHours || 0),
    actualHours: Number(raw.actualHours || 0),
    isBlocked: Boolean(raw.isBlocked),
    blockerReason: String(raw.blockerReason || ''),
  };
}

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
