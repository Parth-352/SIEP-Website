// Offline IndexedDB Persistence for SIEP Operations Portal
import { WorkLog, Task, TeamId } from './types';

export interface OutboxItem {
  id: string;
  type:
    | 'CREATE_LOG'
    | 'COMPLETE_TASK_WITH_VIDEO'
    | 'UPDATE_TASK_STATUS'
    | 'TASK_ACTION';
  payload: any;
  fileBlob?: Blob;
  fileName?: string;
  fileType?: string;
  status: 'queued' | 'uploading' | 'synced' | 'failed';
  progress: number;
  statusMessage?: string;
  error?: string;
  createdAt: number;
}

const DB_NAME = 'siep_offline_db_v1';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db: IDBDatabase = event.target.result;

      if (!db.objectStoreNames.contains('outbox')) {
        db.createObjectStore('outbox', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('cached_logs')) {
        db.createObjectStore('cached_logs', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('cached_tasks')) {
        db.createObjectStore('cached_tasks', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// =========================================================================
// OUTBOX QUEUE OPERATIONS
// =========================================================================

export async function addOutboxItem(item: OutboxItem): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('outbox', 'readwrite');
      const store = tx.objectStore('outbox');
      const req = store.put(item);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallback: Saving outbox item to localStorage', err);
    try {
      const existing = JSON.parse(localStorage.getItem('siep_offline_outbox_fallback') || '[]');
      existing.push({ ...item, fileBlob: undefined }); // omit blob in localStorage
      localStorage.setItem('siep_offline_outbox_fallback', JSON.stringify(existing));
    } catch {}
  }
}

export async function updateOutboxItem(id: string, updates: Partial<OutboxItem>): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('outbox', 'readwrite');
      const store = tx.objectStore('outbox');
      const getReq = store.get(id);

      getReq.onsuccess = () => {
        const item = getReq.result;
        if (!item) return resolve();
        const updated = { ...item, ...updates };
        const putReq = store.put(updated);
        putReq.onsuccess = () => resolve();
        putReq.onerror = () => reject(putReq.error);
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch (err) {
    console.warn('Failed to update outbox item in IndexedDB:', err);
  }
}

export async function removeOutboxItem(id: string): Promise<void> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('outbox', 'readwrite');
      const store = tx.objectStore('outbox');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to remove outbox item:', err);
  }
}

export async function getOutboxItems(): Promise<OutboxItem[]> {
  try {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('outbox', 'readonly');
      const store = tx.objectStore('outbox');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    try {
      return JSON.parse(localStorage.getItem('siep_offline_outbox_fallback') || '[]');
    } catch {
      return [];
    }
  }
}

/**
 * Queues an atomic task action (status change, subtask toggle, comment, blocker)
 * for background or offline dispatch.
 */
export async function queueTaskAction(payload: { id: string; action?: string; [key: string]: any }): Promise<void> {
  const item: OutboxItem = {
    id: `qa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type: 'TASK_ACTION',
    payload,
    status: 'queued',
    progress: 0,
    createdAt: Date.now(),
  };
  await addOutboxItem(item);
}

/**
 * Flushes queued task actions to the backend when online.
 */
export async function flushTaskOutbox(): Promise<{ synced: number; failed: number }> {
  if (typeof window === 'undefined' || !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const items = await getOutboxItems();
  const taskActions = items.filter((it) => it.type === 'TASK_ACTION' && it.status === 'queued');
  let synced = 0;
  let failed = 0;

  for (const item of taskActions) {
    try {
      await updateOutboxItem(item.id, { status: 'uploading' });
      const res = await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      });

      if (res.ok) {
        await removeOutboxItem(item.id);
        synced++;
      } else {
        await updateOutboxItem(item.id, { status: 'failed', error: `Server error ${res.status}` });
        failed++;
      }
    } catch (err: any) {
      await updateOutboxItem(item.id, { status: 'failed', error: err?.message || 'Network error' });
      failed++;
    }
  }

  return { synced, failed };
}

// =========================================================================
// OFFLINE CACHE OPERATIONS FOR LOGS & TASKS
// =========================================================================

export async function cacheOfflineLogs(logs: WorkLog[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('siep_logs_cache_v3', JSON.stringify(logs));
    const db = await openDb();
    const tx = db.transaction('cached_logs', 'readwrite');
    const store = tx.objectStore('cached_logs');
    store.clear();
    logs.forEach((log) => store.put(log));
  } catch {}
}

export async function getOfflineCachedLogs(): Promise<WorkLog[]> {
  if (typeof window === 'undefined') return [];
  try {
    const db = await openDb();
    const tx = db.transaction('cached_logs', 'readonly');
    const store = tx.objectStore('cached_logs');
    const req = store.getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => {
        if (req.result && req.result.length > 0) {
          resolve(req.result);
        } else {
          const fallback = localStorage.getItem('siep_logs_cache_v3');
          resolve(fallback ? JSON.parse(fallback) : []);
        }
      };
      req.onerror = () => {
        const fallback = localStorage.getItem('siep_logs_cache_v3');
        resolve(fallback ? JSON.parse(fallback) : []);
      };
    });
  } catch {
    try {
      const fallback = localStorage.getItem('siep_logs_cache_v3');
      return fallback ? JSON.parse(fallback) : [];
    } catch {
      return [];
    }
  }
}

export async function cacheOfflineTasks(tasks: Task[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('siep_tasks_cache_v3', JSON.stringify(tasks));
    const db = await openDb();
    const tx = db.transaction('cached_tasks', 'readwrite');
    const store = tx.objectStore('cached_tasks');
    store.clear();
    tasks.forEach((task) => store.put(task));
  } catch {}
}

export async function getOfflineCachedTasks(): Promise<Task[]> {
  if (typeof window === 'undefined') return [];
  try {
    const db = await openDb();
    const tx = db.transaction('cached_tasks', 'readonly');
    const store = tx.objectStore('cached_tasks');
    const req = store.getAll();
    return new Promise((resolve) => {
      req.onsuccess = () => {
        if (req.result && req.result.length > 0) {
          const cleaned = req.result.filter((t: Task) => !t.id?.startsWith('task-seed'));
          resolve(cleaned);
        } else {
          const fallback = localStorage.getItem('siep_tasks_cache_v3');
          if (fallback) {
            try {
              const parsed = JSON.parse(fallback);
              resolve(Array.isArray(parsed) ? parsed.filter((t: Task) => !t.id?.startsWith('task-seed')) : []);
            } catch {
              resolve([]);
            }
          } else {
            resolve([]);
          }
        }
      };
      req.onerror = () => {
        const fallback = localStorage.getItem('siep_tasks_cache_v3');
        if (fallback) {
          try {
            const parsed = JSON.parse(fallback);
            resolve(Array.isArray(parsed) ? parsed.filter((t: Task) => !t.id?.startsWith('task-seed')) : []);
          } catch {
            resolve([]);
          }
        } else {
          resolve([]);
        }
      };
    });
  } catch {
    try {
      const fallback = localStorage.getItem('siep_tasks_cache_v3');
      if (fallback) {
        const parsed = JSON.parse(fallback);
        return Array.isArray(parsed) ? parsed.filter((t: Task) => !t.id?.startsWith('task-seed')) : [];
      }
      return [];
    } catch {
      return [];
    }
  }
}
