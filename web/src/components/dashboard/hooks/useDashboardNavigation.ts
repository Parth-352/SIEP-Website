"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardTab } from '@/types/dashboard';

interface UseDashboardNavigationOptions {
  user: any;
  onOpenActivityDrawer: () => void;
  onOpenBackupModal: () => void;
  onOpenCreateModal: () => void;
  onSelectTaskById: (taskId: string) => void;
}

export function useDashboardNavigation({
  user,
  onOpenActivityDrawer,
  onOpenBackupModal,
  onOpenCreateModal,
  onSelectTaskById,
}: UseDashboardNavigationOptions) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<DashboardTab>('dashboard');

  // Handle URL query tab parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      if (tabParam === 'kanban' || tabParam === 'tasks') {
        setActiveTab('team_tasks');
      } else if (
        [
          'dashboard',
          'team_tasks',
          'my_tasks',
          'profile',
          'teams',
          'videos',
          'metrics',
          'materials',
          'roles',
          'accounts',
        ].includes(tabParam)
      ) {
        setActiveTab(tabParam as DashboardTab);
      }
    }
  }, [searchParams]);

  // Handle immediate tab change dispatched from Burger Menu or Global Nav
  useEffect(() => {
    const handleCustomTab = (e: Event) => {
      const rawDetail = (e as CustomEvent).detail;
      const detail = (rawDetail === 'tasks' || rawDetail === 'kanban') ? 'team_tasks' : rawDetail;
      if (
        detail &&
        [
          'dashboard',
          'team_tasks',
          'my_tasks',
          'profile',
          'teams',
          'videos',
          'metrics',
          'materials',
          'roles',
          'accounts',
        ].includes(detail)
      ) {
        setActiveTab(detail as DashboardTab);
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('tab', detail);
          window.history.pushState(null, '', url.toString());
        }
      }
    };
    window.addEventListener('siep_tab_change', handleCustomTab);
    return () => window.removeEventListener('siep_tab_change', handleCustomTab);
  }, []);

  // Browser back and forward button navigation support
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') as DashboardTab;
      if (tab && ['dashboard', 'team_tasks', 'my_tasks', 'profile', 'teams', 'videos', 'metrics', 'materials', 'roles', 'accounts'].includes(tab)) {
        setActiveTab(tab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Global event listeners for desktop navigation and action shortcuts
  useEffect(() => {
    window.addEventListener('siep_open_activity_drawer', onOpenActivityDrawer);
    window.addEventListener('siep_open_backup_modal', onOpenBackupModal);
    window.addEventListener('siep_open_create_modal', onOpenCreateModal);

    return () => {
      window.removeEventListener('siep_open_activity_drawer', onOpenActivityDrawer);
      window.removeEventListener('siep_open_backup_modal', onOpenBackupModal);
      window.removeEventListener('siep_open_create_modal', onOpenCreateModal);
    };
  }, [onOpenActivityDrawer, onOpenBackupModal, onOpenCreateModal]);

  // Handle open task events
  useEffect(() => {
    const handleOpenTask = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.taskId) {
        onSelectTaskById(detail.taskId);
      }
    };
    window.addEventListener('siep_open_task', handleOpenTask);
    return () => window.removeEventListener('siep_open_task', handleOpenTask);
  }, [onSelectTaskById]);

  // Security guard: If non-core squad is on accounts tab, reset to team_tasks
  useEffect(() => {
    if (activeTab === 'accounts' && user && user.teamId !== 'core') {
      setActiveTab('team_tasks');
    }
  }, [activeTab, user]);

  return {
    activeTab,
    setActiveTab,
  };
}
