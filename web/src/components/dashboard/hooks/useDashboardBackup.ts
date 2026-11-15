"use client";

import { useState } from 'react';
import { Task, WorkLog } from '@/lib/types';
import { TASKS_STORAGE_KEY } from '@/constants/dashboard';

interface UseDashboardBackupOptions {
  loadDashboardData: () => Promise<void>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setLogs: React.Dispatch<React.SetStateAction<WorkLog[]>>;
}

export function useDashboardBackup({
  loadDashboardData,
  setTasks,
  setLogs,
}: UseDashboardBackupOptions) {
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleExportBackup = async () => {
    try {
      const res = await fetch('/api/store/backup');
      const data = await res.json();
      if (data.success) {
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `siep_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setBackupStatus('Backup successfully downloaded to your computer!');
      } else {
        setBackupStatus(`Export error: ${data.error}`);
      }
    } catch {
      setBackupStatus('Network error while exporting backup.');
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('CAUTION: This will clear all tasks and logs to an empty state. Proceed?')) return;
    setIsResetting(true);
    setBackupStatus(null);
    try {
      const res = await fetch('/api/store/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.removeItem(TASKS_STORAGE_KEY);
        setTasks([]);
        setLogs([]);
        setBackupStatus('Database successfully cleared to clean empty state!');
        loadDashboardData();
      } else {
        setBackupStatus(`Reset error: ${data.error}`);
      }
    } catch {
      setBackupStatus('Network error while resetting database.');
    } finally {
      setIsResetting(false);
    }
  };

  return {
    backupStatus,
    setBackupStatus,
    isResetting,
    handleExportBackup,
    handleResetDatabase,
  };
}
