"use client";

import React from 'react';
import { Task, WorkLog } from '@/lib/types';
import { DashboardTab, MemberCredential } from '@/types/dashboard';
import DashboardOverviewTab from '@/components/dashboard/DashboardOverviewTab';
import TeamTasksTab from '@/components/dashboard/TeamTasksTab';
import MyWorkbenchTab from '@/components/dashboard/MyWorkbenchTab';
import SubsystemsTab from '@/components/dashboard/SubsystemsTab';
import VideoArchiveTab from '@/components/dashboard/VideoArchiveTab';
import VelocityMetricsTab from '@/components/dashboard/VelocityMetricsTab';
import MaterialsTab from '@/components/dashboard/MaterialsTab';
import RolesManagementTab from '@/components/dashboard/RolesManagementTab';
import CredentialsVaultTab from '@/components/dashboard/CredentialsVaultTab';
import ProfileView from '@/components/profile/ProfileView';
import { useDashboardFilters, useDashboardTaskActions } from '@/components/dashboard/hooks';

export interface DashboardTabContentProps {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  user: any;
  tier: number;
  isCore: boolean;
  isLead: boolean;
  isCoreAdmin: boolean;
  canApproveCompletion: boolean;
  tasks: Task[];
  logs: WorkLog[];
  filters: ReturnType<typeof useDashboardFilters>;
  taskActions: ReturnType<typeof useDashboardTaskActions>;
  handleOpenTaskDetail: (task: Task) => void;
  handleManualSync: () => Promise<void>;
  isManualSyncing: boolean;
  memberCredentials: MemberCredential[];
  teamCredentials: Record<string, { password: string; isCustom: boolean }>;
  loadCredentials: () => void;
  logout: () => Promise<void>;
  isInstalled: boolean;
  installApp: () => Promise<void>;
}

export default function DashboardTabContent({
  activeTab,
  setActiveTab,
  user,
  tier,
  isCore,
  isLead,
  isCoreAdmin,
  canApproveCompletion,
  tasks,
  logs,
  filters,
  taskActions,
  handleOpenTaskDetail,
  handleManualSync,
  isManualSyncing,
  memberCredentials,
  teamCredentials,
  loadCredentials,
  logout,
  isInstalled,
  installApp,
}: DashboardTabContentProps) {
  const handleViewTeamTasksInKanban = (teamId: string) => {
    filters.setSelectedSubsystemFilter(teamId);
    setActiveTab('team_tasks');
  };

  return (
    <div className="max-w-7xl mx-auto relative z-10 space-y-5 sm:space-y-8">
      {/* Tab 1: Dashboard Overview */}
      {activeTab === 'dashboard' && (
        <DashboardOverviewTab
          tasks={tasks}
          logs={logs}
          memberDomainIds={filters.memberDomainIds}
          isCore={isCore}
          isLead={isLead}
          setActiveTab={setActiveTab}
          setSelectedSubsystemFilter={filters.setSelectedSubsystemFilter}
        />
      )}

      {/* Tab 2: Team Tasks / Kanban */}
      {(activeTab === 'team_tasks' || activeTab === 'kanban') && (
        <TeamTasksTab
          user={user}
          isCoreAdmin={isCoreAdmin}
          memberDomainIds={filters.memberDomainIds}
          domainViewScope={filters.domainViewScope}
          setDomainViewScope={filters.setDomainViewScope}
          tasks={tasks}
          filteredTasks={filters.filteredTasks}
          searchQuery={filters.searchQuery}
          setSearchQuery={filters.setSearchQuery}
          selectedPriorityFilter={filters.selectedPriorityFilter}
          setSelectedPriorityFilter={filters.setSelectedPriorityFilter}
          selectedSubsystemFilter={filters.selectedSubsystemFilter}
          setSelectedSubsystemFilter={filters.setSelectedSubsystemFilter}
          assignedToMeOnly={filters.assignedToMeOnly}
          setAssignedToMeOnly={filters.setAssignedToMeOnly}
          myAssignedCount={filters.myAssignedCount}
          specialDeadlineFilter={filters.specialDeadlineFilter}
          setSpecialDeadlineFilter={filters.setSpecialDeadlineFilter}
          handleOpenTaskDetail={handleOpenTaskDetail}
          handleMoveStatus={taskActions.handleMoveStatus}
          handleQuickAssignToMe={taskActions.handleQuickAssignToMe}
          setCardTaskToDelete={taskActions.setCardTaskToDelete}
          cardMenuTaskId={taskActions.cardMenuTaskId}
          setCardMenuTaskId={taskActions.setCardMenuTaskId}
          handleDragOver={taskActions.handleDragOver}
          handleDrop={taskActions.handleDrop}
          handleDragStart={taskActions.handleDragStart}
          canApproveCompletion={canApproveCompletion}
        />
      )}

      {/* Tab 3: Dedicated Personal Workbench */}
      {activeTab === 'my_tasks' && (
        <MyWorkbenchTab
          user={user}
          myAssignedTasks={filters.myAssignedTasks}
          myTasksBreakdown={filters.myTasksBreakdown}
          myTasksTabStatusFilter={filters.myTasksTabStatusFilter}
          setMyTasksTabStatusFilter={filters.setMyTasksTabStatusFilter}
          handleOpenTaskDetail={handleOpenTaskDetail}
          handleMoveStatus={taskActions.handleMoveStatus}
          setActiveTab={setActiveTab}
          memberDomainIds={filters.memberDomainIds}
          isCoreAdmin={isCoreAdmin}
          domainViewScope={filters.domainViewScope}
          canApproveCompletion={canApproveCompletion}
        />
      )}

      {/* Tab 4: Subsystem Overview */}
      {activeTab === 'teams' && (
        <SubsystemsTab
          tasks={tasks}
          logs={logs}
          isCore={isCore}
          isLead={isLead}
          memberDomainIds={filters.memberDomainIds}
          handleOpenTaskDetail={handleOpenTaskDetail}
          handleViewTeamTasksInKanban={handleViewTeamTasksInKanban}
        />
      )}

      {/* Tab 5: Video Archive */}
      {activeTab === 'videos' && <VideoArchiveTab logs={logs} />}

      {/* Tab 6: Metrics & Velocity */}
      {activeTab === 'metrics' && (
        <VelocityMetricsTab
          tasks={tasks}
          logs={logs}
          handleManualSync={handleManualSync}
          isManualSyncing={isManualSyncing}
          handleOpenTaskDetail={handleOpenTaskDetail}
          setSelectedSubsystemFilter={filters.setSelectedSubsystemFilter}
          setActiveTab={setActiveTab}
        />
      )}

      {/* Tab 7: Dedicated Research & Materials Repository */}
      {activeTab === 'materials' && (
        <MaterialsTab user={user} isCore={isCore} isLead={isLead} />
      )}

      {/* Tab 8: Master Role Management */}
      {activeTab === 'roles' && (
        <RolesManagementTab user={user} isCore={isCore} isLead={isLead} />
      )}

      {/* Tab 9: Core Admin Credentials Vault */}
      {activeTab === 'accounts' && isCoreAdmin && (
        <CredentialsVaultTab
          memberCredentials={memberCredentials}
          teamCredentials={teamCredentials}
          loadCredentials={loadCredentials}
        />
      )}

      {/* Tab 10: Personal Profile */}
      {activeTab === 'profile' && (
        <ProfileView
          user={user}
          tier={tier}
          logout={logout}
          isInstalled={isInstalled}
          installApp={installApp}
          tasks={tasks}
          logs={logs}
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}
