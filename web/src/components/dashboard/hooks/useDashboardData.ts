"use client";

import { useState, useEffect, useCallback } from 'react';
import { Task, WorkLog, ActivityEvent } from '@/lib/types';
import { TASKS_STORAGE_KEY } from '@/constants/dashboard';
import { MemberCredential } from '@/types/dashboard';
import {
  getOfflineCachedTasks,
  cacheOfflineTasks,
  getOfflineCachedLogs,
  cacheOfflineLogs,
  getOutboxItems,
} from '@/lib/offlineDb';

interface UseDashboardDataOptions {
  user: any;
  isCoreAdmin: boolean;
  activeTab: string;
}

export function useDashboardData({ user, isCoreAdmin, activeTab }: UseDashboardDataOptions) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [, setLoadingData] = useState(true);
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);
  const [lastReadActivityTimestamp, setLastReadActivityTimestamp] = useState<number>(0);
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  // Core leadership credentials
  const [teamCredentials, setTeamCredentials] = useState<Record<string, { password: string; isCustom: boolean }>>({});
  const [memberCredentials, setMemberCredentials] = useState<MemberCredential[]>([]);

  // Local persistence helper
  const persistTasksLocal = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    try {
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updatedTasks));
    } catch (e) {
      console.warn('Error saving local tasks cache:', e);
    }
  };

  // Fetch updated credentials for Core Leadership
  const loadCredentials = useCallback(() => {
    if (user && isCoreAdmin) {
      fetch('/api/passwords')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            if (data.passwords) setTeamCredentials(data.passwords);
            if (data.memberCredentials) setMemberCredentials(data.memberCredentials);
          }
        })
        .catch(() => {});
    }
  }, [user, isCoreAdmin]);

  useEffect(() => {
    loadCredentials();
  }, [loadCredentials, activeTab]);

  // Load tasks and logs from API + offline fallback
  const loadDashboardData = useCallback(async () => {
    if (!user) return;

    // Immediately hydrate from offline caches if available
    getOfflineCachedTasks().then((cached) => {
      if (cached && cached.length > 0) setTasks(cached);
    });
    getOfflineCachedLogs().then((cached) => {
      if (cached && cached.length > 0) setLogs(cached);
    });

    try {
      const [tasksRes, logsRes] = await Promise.all([fetch('/api/tasks'), fetch('/api/logs')]);
      const tasksData = await tasksRes.json();
      const logsData = await logsRes.json();

      if (tasksData.success && Array.isArray(tasksData.tasks)) {
        persistTasksLocal(tasksData.tasks);
        cacheOfflineTasks(tasksData.tasks);
      }
      if (tasksData.activities && Array.isArray(tasksData.activities)) {
        setActivities(tasksData.activities);
      }
      if (logsData.success && Array.isArray(logsData.logs)) {
        setLogs(logsData.logs);
        cacheOfflineLogs(logsData.logs);
      }
    } catch (err) {
      console.warn('Network offline or failed, using cached dashboard data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  // Listen to background sync updates
  useEffect(() => {
    const handleSync = () => {
      loadDashboardData();
    };
    window.addEventListener('siep_task_synced', handleSync);
    window.addEventListener('siep_log_synced', handleSync);
    return () => {
      window.removeEventListener('siep_task_synced', handleSync);
      window.removeEventListener('siep_log_synced', handleSync);
    };
  }, [loadDashboardData]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, loadDashboardData]);

  // Initialize last read activity timestamp from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('siep_last_read_activity');
      if (stored) {
        setLastReadActivityTimestamp(Number(stored));
      }
    } catch {}
  }, []);

  // Real-Time 10s Live Sync Engine + Outbox Queue Monitoring
  useEffect(() => {
    const checkQueue = async () => {
      try {
        const items = await getOutboxItems();
        setPendingQueueCount(items.filter((it) => it.status === 'queued').length);
      } catch {}
    };

    checkQueue();

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        fetch('/api/tasks')
          .then((res) => res.json())
          .then((data) => {
            if (data.success && Array.isArray(data.tasks)) {
              setTasks(data.tasks);
              cacheOfflineTasks(data.tasks);
            }
            if (data.activities && Array.isArray(data.activities)) {
              setActivities(data.activities);
            }
          })
          .catch(() => {});
        checkQueue();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Manual fast sync trigger for mobile bottom hub
  const handleManualSync = async () => {
    setIsManualSyncing(true);
    try {
      await loadDashboardData();
    } finally {
      setTimeout(() => setIsManualSyncing(false), 600);
    }
  };

  return {
    tasks,
    setTasks,
    logs,
    setLogs,
    activities,
    pendingQueueCount,
    lastReadActivityTimestamp,
    setLastReadActivityTimestamp,
    isManualSyncing,
    teamCredentials,
    memberCredentials,
    loadCredentials,
    loadDashboardData,
    persistTasksLocal,
    handleManualSync,
  };
}
