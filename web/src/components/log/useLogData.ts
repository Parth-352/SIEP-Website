"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { WorkLog, TeamId, LogWorkStatus } from '@/lib/types';
import { TEAMS } from '@/lib/teams';
import { getOfflineCachedLogs, cacheOfflineLogs } from '@/lib/offlineDb';
import { getLogWorkStatus } from '@/components/log/logConfig';

interface UseLogDataOptions {
  user: any;
  isCoreAdmin: boolean;
  onOpenForm: () => void;
  setFormInitialTitle: (title: string) => void;
  setFormInitialTeamId: (teamId: TeamId | undefined) => void;
}

export function useLogData({
  user,
  isCoreAdmin,
  onOpenForm,
  setFormInitialTitle,
  setFormInitialTeamId,
}: UseLogDataOptions) {
  const searchParams = useSearchParams();
  const [logs, setLogs] = useState<WorkLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Desktop filters
  const [mobileStatusFilter, setMobileStatusFilter] = useState<'all' | LogWorkStatus>('all');
  const [desktopLogPill, setDesktopLogPill] = useState<'all' | 'builds' | 'tests' | 'design' | 'analysis'>('all');
  const [desktopLogPage, setDesktopLogPage] = useState<number>(1);
  const [desktopLogTimeFilter, setDesktopLogTimeFilter] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [desktopLogSearch, setDesktopLogSearch] = useState<string>('');

  // Fetch logs with clean async pattern + offline fallback
  const loadLogs = useCallback(async () => {
    if (!user) return;
    setLoadingLogs(true);

    getOfflineCachedLogs().then((cached) => {
      if (cached && cached.length > 0) {
        setLogs(cached);
      }
    });

    const teamQuery =
      !isCoreAdmin && user
        ? user.teamId
        : selectedTeamFilter !== 'all'
        ? selectedTeamFilter
        : '';
    const url = teamQuery ? `/api/logs?teamId=${teamQuery}` : '/api/logs';

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && Array.isArray(data.logs)) {
        setLogs(data.logs);
        cacheOfflineLogs(data.logs);
      }
    } catch (err) {
      console.warn('Network offline or failed, using cached logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  }, [user, isCoreAdmin, selectedTeamFilter]);

  // Listen to background sync completion events
  useEffect(() => {
    const handleLogSynced = (e: any) => {
      const newLog = e.detail;
      if (newLog) {
        setLogs((prev) => [
          newLog,
          ...prev.filter((l) => l.id !== newLog.id && !l.id.startsWith('temp-log-')),
        ]);
      }
    };
    window.addEventListener('siep_log_synced', handleLogSynced);
    return () => window.removeEventListener('siep_log_synced', handleLogSynced);
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Handle URL query parameter for team filter and task pre-filling
  useEffect(() => {
    const urlTeam = searchParams.get('team') || searchParams.get('teamId');
    if (urlTeam && (urlTeam === 'all' || TEAMS[urlTeam as TeamId])) {
      setSelectedTeamFilter(urlTeam);
      if (urlTeam !== 'all') {
        setFormInitialTeamId(urlTeam as TeamId);
      }
    }
    const taskParam = searchParams.get('task') || searchParams.get('taskTitle');
    if (taskParam) {
      setFormInitialTitle(decodeURIComponent(taskParam));
      onOpenForm();
    }
    const newParam = searchParams.get('new') === 'true' || searchParams.get('action') === 'new';
    if (newParam) {
      onOpenForm();
    }
  }, [searchParams, onOpenForm, setFormInitialTeamId, setFormInitialTitle]);

  // Dynamic filtered logs feed for desktop
  const desktopFilteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const txt = `${log.stepTitle || ''} ${log.description || ''}`.toLowerCase();

      // 1. Category Pill Filter
      if (
        desktopLogPill === 'builds' &&
        !(txt.includes('weld') || txt.includes('build') || txt.includes('fab') || log.status === 'completed')
      )
        return false;
      if (
        desktopLogPill === 'tests' &&
        !(txt.includes('test') || txt.includes('dyno') || log.status === 'testing')
      )
        return false;
      if (
        desktopLogPill === 'design' &&
        !(txt.includes('cad') || txt.includes('design') || txt.includes('ui') || log.teamId === 'design' || log.teamId === 'software')
      )
        return false;
      if (
        desktopLogPill === 'analysis' &&
        !(txt.includes('analysis') || txt.includes('fea') || log.teamId === 'research')
      )
        return false;

      // 2. Time Filter
      if (desktopLogTimeFilter === '24h') {
        const logTime = log.createdAt ? new Date(log.createdAt).getTime() : 0;
        if (Date.now() - logTime > 24 * 60 * 60 * 1000) return false;
      } else if (desktopLogTimeFilter === '7d') {
        const logTime = log.createdAt ? new Date(log.createdAt).getTime() : 0;
        if (Date.now() - logTime > 7 * 24 * 60 * 60 * 1000) return false;
      } else if (desktopLogTimeFilter === '30d') {
        const logTime = log.createdAt ? new Date(log.createdAt).getTime() : 0;
        if (Date.now() - logTime > 30 * 24 * 60 * 60 * 1000) return false;
      }

      // 3. Search Query
      if (desktopLogSearch.trim()) {
        const q = desktopLogSearch.toLowerCase().trim();
        const titleMatch = (log.stepTitle || '').toLowerCase().includes(q);
        const descMatch = (log.description || '').toLowerCase().includes(q);
        const memberMatch =
          (log.membersPresent || []).some((m) => m.toLowerCase().includes(q)) ||
          (log.authorName || '').toLowerCase().includes(q);
        const teamMatch = (log.teamName || log.teamId || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !memberMatch && !teamMatch) return false;
      }

      return true;
    });
  }, [logs, desktopLogPill, desktopLogTimeFilter, desktopLogSearch]);

  // Dynamic status counts calculated live from Firestore logs (respects team selection)
  const statusCounts = useMemo(() => {
    const counts: Record<LogWorkStatus, number> = {
      in_progress: 0,
      testing: 0,
      completed: 0,
      on_hold: 0,
      review: 0,
    };
    const pool =
      selectedTeamFilter === 'all'
        ? logs
        : logs.filter((l) => l.teamId === selectedTeamFilter);

    pool.forEach((l) => {
      const st = getLogWorkStatus(l);
      counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }, [logs, selectedTeamFilter]);

  // Dynamic filtered logs feed for mobile
  const visibleMobileLogs = useMemo(() => {
    return logs.filter((log) => {
      if (selectedTeamFilter !== 'all' && log.teamId !== selectedTeamFilter) {
        return false;
      }
      if (mobileStatusFilter !== 'all') {
        const st = getLogWorkStatus(log);
        if (st !== mobileStatusFilter) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          (log.stepTitle || '').toLowerCase().includes(q) ||
          (log.description || '').toLowerCase().includes(q) ||
          (log.teamName || '').toLowerCase().includes(q) ||
          (log.membersPresent || []).some((m) => m.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [logs, selectedTeamFilter, mobileStatusFilter, searchQuery]);

  return {
    logs,
    setLogs,
    loadingLogs,
    selectedTeamFilter,
    setSelectedTeamFilter,
    searchQuery,
    setSearchQuery,
    mobileStatusFilter,
    setMobileStatusFilter,
    desktopLogPill,
    setDesktopLogPill,
    desktopLogPage,
    setDesktopLogPage,
    desktopLogTimeFilter,
    setDesktopLogTimeFilter,
    desktopLogSearch,
    setDesktopLogSearch,
    desktopFilteredLogs,
    statusCounts,
    visibleMobileLogs,
  };
}
