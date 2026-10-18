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

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'siep_store.json');

const INITIAL_LOGS: WorkLog[] = [];
const INITIAL_TASKS: Task[] = [];
const INITIAL_INQUIRIES: PartnerInquiry[] = [];

// Read from store
function readStore(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      const initial: StoreData = { logs: INITIAL_LOGS, tasks: INITIAL_TASKS };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(STORE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading store file, using in-memory defaults:', err);
    return { logs: INITIAL_LOGS, tasks: INITIAL_TASKS };
  }
}

// Write to store
function writeStore(data: StoreData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing store file:', err);
  }
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

