import fs from 'fs';
import path from 'path';
import { WorkLog, Task, TeamId, InAppNotification, ActivityEvent, ResearchMaterial } from './types';
import { TeamMemberEntry, ROSTER_MEMBERS } from './members';

export interface PartnerInquiry {
  id: string;
  name: string;
  organization?: string;
  email: string;
  phone?: string;
  message: string;
  createdAt: number;
}

interface StoreData {
  logs: WorkLog[];
  tasks: Task[];
  materials?: ResearchMaterial[];
  members?: TeamMemberEntry[];
  activities?: ActivityEvent[];
  inquiries?: PartnerInquiry[];
  passwords?: Record<string, string>;
  memberPasswords?: Record<string, string>;
  notifications?: InAppNotification[];
}

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const SEED_FILE = path.join(process.cwd(), 'data', 'siep_store.json');
const DATA_DIR = isServerless ? '/tmp/siep_data' : path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'siep_store.json');

const INITIAL_LOGS: WorkLog[] = [];
const INITIAL_TASKS: Task[] = [];
const INITIAL_INQUIRIES: PartnerInquiry[] = [];

// In-memory cache for ultra-fast, serverless-instance-persistent reads
let memoryStore: StoreData | null = null;

// Read from store
function readStore(): StoreData {
  if (memoryStore) {
    return memoryStore;
  }

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(STORE_FILE)) {
      // Seed from repository data/siep_store.json if available
      if (fs.existsSync(SEED_FILE)) {
        try {
          const seedContent = fs.readFileSync(SEED_FILE, 'utf-8');
          const parsedSeed = JSON.parse(seedContent);
          fs.writeFileSync(STORE_FILE, JSON.stringify(parsedSeed, null, 2), 'utf-8');
          memoryStore = parsedSeed;
          return parsedSeed;
        } catch (seedErr) {
          console.warn('Could not read seed file, using defaults:', seedErr);
        }
      }

      const initial: StoreData = { logs: INITIAL_LOGS, tasks: INITIAL_TASKS, inquiries: INITIAL_INQUIRIES };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      memoryStore = initial;
      return initial;
    }

    const content = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    memoryStore = parsed;
    return parsed;
  } catch (err) {
    console.error('Error reading store file, using in-memory defaults:', err);
    // If SEED_FILE is readable directly (read-only mode)
    if (fs.existsSync(SEED_FILE)) {
      try {
        const seedContent = fs.readFileSync(SEED_FILE, 'utf-8');
        memoryStore = JSON.parse(seedContent);
        return memoryStore!;
      } catch {
        // fallback to empty
      }
    }
    return { logs: INITIAL_LOGS, tasks: INITIAL_TASKS, inquiries: INITIAL_INQUIRIES };
  }
}

// Write to store
function writeStore(data: StoreData) {
  memoryStore = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing store file to disk:', err);
  }
}

// Backup & Sync utilities
export function exportStore(): StoreData {
  return readStore();
}

export function importStore(incoming: Partial<StoreData>): boolean {
  try {
    const current = readStore();
    const updated: StoreData = {
      logs: Array.isArray(incoming.logs) ? incoming.logs : current.logs,
      tasks: Array.isArray(incoming.tasks) ? incoming.tasks : current.tasks,
      inquiries: Array.isArray(incoming.inquiries) ? incoming.inquiries : (current.inquiries || []),
    };
    writeStore(updated);
    return true;
  } catch (err) {
    console.error('Failed to import store:', err);
    return false;
  }
}

export function resetStore(): StoreData {
  let defaultData: StoreData = { logs: INITIAL_LOGS, tasks: INITIAL_TASKS, inquiries: INITIAL_INQUIRIES };
  if (fs.existsSync(SEED_FILE)) {
    try {
      const content = fs.readFileSync(SEED_FILE, 'utf-8');
      defaultData = JSON.parse(content);
    } catch (err) {
      console.error('Error reading seed file during reset:', err);
    }
  }
  writeStore(defaultData);
  return defaultData;
}

// ======================== LOGS API ========================

export function getLogs(teamId?: TeamId | string): WorkLog[] {
  const { logs } = readStore();
  if (!teamId || teamId === 'core' || teamId === 'all') {
    return logs.sort((a, b) => b.createdAt - a.createdAt);
  }
  return logs
    .filter((l) => l.teamId === teamId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function createLog(newLog: Omit<WorkLog, 'id' | 'createdAt' | 'stepNumber'>): WorkLog {
  const store = readStore();
  const nextStepNumber = store.logs.length + 1;
  const created: WorkLog = {
    ...newLog,
    id: 'log-' + Date.now(),
    stepNumber: nextStepNumber,
    createdAt: Date.now(),
  };

  store.logs.unshift(created);
  writeStore(store);
  return created;
}

export function getLogById(id: string): WorkLog | null {
  const { logs } = readStore();
  return logs.find((l) => l.id === id) || null;
}

export function updateLog(
  id: string,
  updates: Partial<Omit<WorkLog, 'id' | 'createdAt' | 'stepNumber'>>
): WorkLog | null {
  const store = readStore();
  const idx = store.logs.findIndex((l) => l.id === id);
  if (idx === -1) return null;

  store.logs[idx] = {
    ...store.logs[idx],
    ...updates,
    updatedAt: Date.now(),
  };

  writeStore(store);
  return store.logs[idx];
}

export function deleteLog(id: string): boolean {
  const store = readStore();
  const initialLength = store.logs.length;
  store.logs = store.logs.filter((l) => l.id !== id);
  if (store.logs.length !== initialLength) {
    writeStore(store);
    return true;
  }
  return false;
}

// ======================== TASKS API ========================

export function getTasks(teamId?: TeamId | string): Task[] {
  const { tasks } = readStore();
  if (!teamId || teamId === 'core' || teamId === 'all') {
    return tasks.sort((a, b) => b.updatedAt - a.updatedAt);
  }
  return tasks
    .filter((t) => t.teamId === teamId)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function createTask(newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
  const store = readStore();
  const created: Task = {
    ...newTask,
    id: 'task-' + Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  store.tasks.unshift(created);
  writeStore(store);
  return created;
}

export function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Task | null {
  const store = readStore();
  const idx = store.tasks.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  store.tasks[idx] = {
    ...store.tasks[idx],
    ...updates,
    updatedAt: Date.now(),
  };

  writeStore(store);
  return store.tasks[idx];
}

export function deleteTask(id: string): boolean {
  const store = readStore();
  const initialLength = store.tasks.length;
  store.tasks = store.tasks.filter((t) => t.id !== id);
  if (store.tasks.length !== initialLength) {
    writeStore(store);
    return true;
  }
  return false;
}

// ======================== INQUIRIES API ========================

export function recordInquiry(inquiry: Omit<PartnerInquiry, 'id' | 'createdAt'>): PartnerInquiry {
  const store = readStore();
  if (!store.inquiries) {
    store.inquiries = [];
  }

  const newEntry: PartnerInquiry = {
    ...inquiry,
    id: `inq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: Date.now(),
  };

  store.inquiries.unshift(newEntry);
  writeStore(store);
  return newEntry;
}

export function getInquiries(): PartnerInquiry[] {
  const store = readStore();
  return store.inquiries || [];
}

// ======================== PASSWORDS API ========================

export function getTeamPasswords(): Record<string, string> {
  const store = readStore();
  return store.passwords || {};
}

export function getTeamPassword(teamId: string): string | undefined {
  const store = readStore();
  return store.passwords ? store.passwords[teamId] : undefined;
}

export function setTeamPassword(teamId: string, newPass: string): void {
  const store = readStore();
  if (!store.passwords) {
    store.passwords = {};
  }
  store.passwords[teamId] = newPass.trim();
  writeStore(store);
}

// ======================== MEMBER PASSWORDS API ========================

export function getMemberPasswords(): Record<string, string> {
  const store = readStore();
  return store.memberPasswords || {};
}

export function getMemberPassword(email: string): string | undefined {
  const store = readStore();
  const cleanEmail = email.trim().toLowerCase();
  return store.memberPasswords ? store.memberPasswords[cleanEmail] : undefined;
}

export function setMemberPassword(email: string, newPass: string): void {
  const store = readStore();
  if (!store.memberPasswords) {
    store.memberPasswords = {};
  }
  const cleanEmail = email.trim().toLowerCase();
  store.memberPasswords[cleanEmail] = newPass.trim();
  writeStore(store);
}

// ======================== IN-APP NOTIFICATIONS API ========================

export function getNotifications(email?: string): InAppNotification[] {
  const store = readStore();
  const list = store.notifications || [];
  if (!email) return list.sort((a, b) => b.createdAt - a.createdAt);
  const clean = email.trim().toLowerCase();
  return list
    .filter((n) => n.recipientEmail.toLowerCase() === clean)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function addNotification(
  notif: Omit<InAppNotification, 'id' | 'createdAt' | 'read'>
): InAppNotification {
  const store = readStore();
  if (!store.notifications) {
    store.notifications = [];
  }
  const entry: InAppNotification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: Date.now(),
    read: false,
  };
  store.notifications.unshift(entry);
  // Keep last 200 notifications
  if (store.notifications.length > 200) {
    store.notifications = store.notifications.slice(0, 200);
  }
  writeStore(store);
  return entry;
}

export function markNotificationRead(id: string): boolean {
  const store = readStore();
  if (!store.notifications) return false;
  const item = store.notifications.find((n) => n.id === id);
  if (item) {
    item.read = true;
    writeStore(store);
    return true;
  }
  return false;
}

// ======================== ACTIVITIES FEED ========================

export function getActivities(limit = 40): ActivityEvent[] {
  const store = readStore();
  const acts = store.activities || [];
  return acts.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

export function recordActivity(event: Omit<ActivityEvent, 'id' | 'timestamp'>): ActivityEvent {
  const store = readStore();
  if (!store.activities) {
    store.activities = [];
  }
  const created: ActivityEvent = {
    ...event,
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: Date.now(),
  };
  store.activities.unshift(created);
  if (store.activities.length > 200) {
    store.activities = store.activities.slice(0, 200);
  }
  writeStore(store);
  return created;
}

// ======================== MATERIALS API ========================

export function getMaterials(teamId?: string): ResearchMaterial[] {
  const store = readStore();
  const list = store.materials || [];
  if (!teamId || teamId === 'all' || teamId === 'core') {
    return list;
  }
  return list.filter((m) => m.teamId === teamId);
}

export function createMaterial(material: ResearchMaterial): ResearchMaterial {
  const store = readStore();
  if (!store.materials) {
    store.materials = [];
  }
  store.materials.unshift(material);
  writeStore(store);
  return material;
}

export function deleteMaterial(id: string): boolean {
  const store = readStore();
  if (!store.materials) return false;
  const initialLength = store.materials.length;
  store.materials = store.materials.filter((m) => m.id !== id);
  if (store.materials.length !== initialLength) {
    writeStore(store);
    return true;
  }
  return false;
}

// ======================== ROSTER & ROLES API ========================

export function getStoreMembers(): TeamMemberEntry[] {
  const store = readStore();
  if (!store.members || store.members.length === 0) {
    store.members = [...ROSTER_MEMBERS];
    writeStore(store);
  }
  return store.members;
}

export function saveStoreMember(member: TeamMemberEntry): TeamMemberEntry {
  const store = readStore();
  if (!store.members) {
    store.members = [...ROSTER_MEMBERS];
  }
  const idx = store.members.findIndex((m) => m.id === member.id || m.email.toLowerCase() === member.email.toLowerCase());
  if (idx >= 0) {
    store.members[idx] = { ...store.members[idx], ...member, updatedAt: Date.now() };
  } else {
    store.members.push({ ...member, updatedAt: Date.now() });
  }
  writeStore(store);
  return member;
}

export function deleteStoreMember(id: string): boolean {
  const store = readStore();
  if (!store.members) return false;
  const initialLength = store.members.length;
  store.members = store.members.filter((m) => m.id !== id);
  if (store.members.length !== initialLength) {
    writeStore(store);
    return true;
  }
  return false;
}





