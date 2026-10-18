import fs from 'fs';
import path from 'path';
import { WorkLog, Task, TeamId } from './types';

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
  inquiries?: PartnerInquiry[];
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

