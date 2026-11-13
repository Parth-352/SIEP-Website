import { Task, UserProfile, TeamId, ResearchMaterial } from './types';
import { TEAMS } from './teams';
import { isTaskAssignedToUser } from './taskMatching';

export interface DeckNotification {
  id: string;
  type: 'reminder' | 'review_needed' | 'assignment' | 'material' | 'milestone';
  title: string;
  message: string;
  teamId?: TeamId;
  teamName?: string;
  timestamp: number;
  priority: 'urgent' | 'high' | 'normal';
  targetUrl: string;
  read: boolean;
  isPersonalDeck: boolean; // True if directly assigned or in member's squad
}

const STORAGE_KEY_READ = 'siep_read_notifications_v1';
const STORAGE_KEY_NATIVE_PREF = 'siep_native_notif_enabled_v1';

export function getReadNotificationIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_READ);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

export function markNotificationAsRead(id: string) {
  if (typeof window === 'undefined') return;
  try {
    const set = getReadNotificationIds();
    set.add(id);
    localStorage.setItem(STORAGE_KEY_READ, JSON.stringify(Array.from(set)));
  } catch (err) {
    console.warn('Error saving read notification:', err);
  }
}

export function isNativeNotificationEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_NATIVE_PREF) === 'true';
}

export function setNativeNotificationEnabled(enabled: boolean) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_NATIVE_PREF, enabled ? 'true' : 'false');
}

/**
 * Computes personal notifications for the logged-in user according to their deck
 */
export function generateDeckNotifications(
  user: UserProfile | null,
  tasks: Task[] = [],
  materials: ResearchMaterial[] = []
): DeckNotification[] {
  if (!user) return [];

  const readIds = getReadNotificationIds();
  const notifications: DeckNotification[] = [];
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const userDomains: TeamId[] = [
    user.teamId,
    ...(user.secondaryTeams || []),
    ...((user as any).domains || []),
  ].filter(Boolean) as TeamId[];
  const userDomainSet = new Set(userDomains);

  const isCoreOrLead = Boolean(
    user.isCore ||
    user.isLead ||
    user.role === 'admin' ||
    user.teamId === 'core' ||
    (user.tier && user.tier <= 2)
  );

  // 1. Task Reminders: Due soon or overdue (Assigned to this user)
  tasks.forEach((task) => {
    const isAssigned = isTaskAssignedToUser(task, user);
    if (!isAssigned) return;

    if (task.status === 'done') return;

    if (task.dueDate) {
      const dueTime = new Date(task.dueDate).getTime();
      const diff = dueTime - now;

      // Overdue
      if (diff < 0) {
        const id = `overdue_${task.id}_${task.dueDate}`;
        notifications.push({
          id,
          type: 'reminder',
          title: `Overdue Task: "${task.title}"`,
          message: `This deliverable for ${TEAMS[task.teamId]?.name || task.teamId} was due on ${task.dueDate}. Please update status.`,
          teamId: task.teamId,
          teamName: TEAMS[task.teamId]?.name || task.teamId,
          timestamp: dueTime,
          priority: 'urgent',
          targetUrl: `/dashboard?tab=tasks&taskId=${task.id}`,
          read: readIds.has(id),
          isPersonalDeck: true,
        });
      }
      // Due within 24 hours
      else if (diff <= ONE_DAY_MS) {
        const id = `due_soon_${task.id}_${task.dueDate}`;
        notifications.push({
          id,
          type: 'reminder',
          title: `Task Due Today: "${task.title}"`,
          message: `Due within 24 hours for ${TEAMS[task.teamId]?.name || task.teamId}. Finish work and submit for review.`,
          teamId: task.teamId,
          teamName: TEAMS[task.teamId]?.name || task.teamId,
          timestamp: now,
          priority: 'high',
          targetUrl: `/dashboard?tab=tasks&taskId=${task.id}`,
          read: readIds.has(id),
          isPersonalDeck: true,
        });
      }
    }
  });

  // 2. Squad Lead & Core Alerts: Tasks awaiting approval ("Under Review")
  if (isCoreOrLead) {
    tasks.forEach((task) => {
      if (task.status !== 'review') return;
      const inMySquad = user.isCore || user.teamId === 'core' || userDomainSet.has(task.teamId);
      if (!inMySquad) return;

      const id = `review_req_${task.id}_${task.updatedAt || now}`;
      notifications.push({
        id,
        type: 'review_needed',
        title: `Sign-off Required: "${task.title}"`,
        message: `Deliverable submitted for review under ${TEAMS[task.teamId]?.name || task.teamId}. Squad Lead sign-off needed.`,
        teamId: task.teamId,
        teamName: TEAMS[task.teamId]?.name || task.teamId,
        timestamp: task.updatedAt || now,
        priority: 'high',
        targetUrl: `/dashboard?tab=tasks&taskId=${task.id}`,
        read: readIds.has(id),
        isPersonalDeck: true,
      });
    });
  }

  // 3. New Research Materials in User's Squads
  materials.slice(0, 5).forEach((mat) => {
    const inMySquad = user.isCore || user.teamId === 'core' || userDomainSet.has(mat.teamId);
    const isOwnUpload = mat.authorEmail?.toLowerCase() === user.email?.toLowerCase();
    if (!inMySquad || isOwnUpload) return;

    const id = `mat_notif_${mat.id}`;
    notifications.push({
      id,
      type: 'material',
      title: `New Document: "${mat.title}"`,
      message: `${mat.authorName} uploaded a new ${mat.category} document for ${mat.teamName}.`,
      teamId: mat.teamId,
      teamName: mat.teamName,
      timestamp: mat.createdAt || now,
      priority: 'normal',
      targetUrl: `/dashboard?tab=materials`,
      read: readIds.has(id),
      isPersonalDeck: true,
    });
  });

  // Sort by priority and timestamp (most recent first)
  return notifications.sort((a, b) => {
    if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
    if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
    return b.timestamp - a.timestamp;
  });
}

/**
 * Requests native browser notification permission
 */
export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNativeNotificationEnabled(true);
    } else {
      setNativeNotificationEnabled(false);
    }
    return permission;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Dispatches a native OS browser notification (desktop/mobile)
 */
export function sendNativeNotification(
  title: string,
  options: {
    body: string;
    icon?: string;
    tag?: string;
    url?: string;
  }
): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  if (Notification.permission !== 'granted' || !isNativeNotificationEnabled()) return false;

  try {
    // If Service Worker is available, use showNotification for better PWA support
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body: options.body,
          icon: options.icon || '/icons/icon-192.png',
          badge: '/icons/icon-192.png',
          data: options.url || '/dashboard',
          tag: options.tag,
        });
      });
      return true;
    }

    // Fallback: standard web notification
    const n = new Notification(title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192.png',
      tag: options.tag,
    });
    n.onclick = () => {
      window.focus();
      if (options.url) window.location.href = options.url;
      n.close();
    };
    return true;
  } catch (err) {
    console.warn('Failed to dispatch native notification:', err);
    return false;
  }
}
