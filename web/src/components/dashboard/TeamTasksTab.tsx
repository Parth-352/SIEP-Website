"use client";

import React, { useState, useMemo } from 'react';
import { TEAMS_LIST } from '@/lib/teams';
import { Task, TaskStatus, TeamId, UserProfile } from '@/lib/types';
import { SpecialDeadlineFilter } from '@/types/dashboard';
import { isTaskAssignedToUser } from '@/lib/taskMatching';
import OperationsBanner from './OperationsBanner';
import MobileTeamTasksView from './tasks/MobileTeamTasksView';
import DesktopTaskControls from './tasks/DesktopTaskControls';
import DesktopTaskTable from './tasks/DesktopTaskTable';
import DesktopTaskKanban from './tasks/DesktopTaskKanban';

interface TeamTasksTabProps {
  user: UserProfile;
  isCoreAdmin: boolean;
  memberDomainIds: TeamId[];
  domainViewScope: 'assigned' | 'all';
  setDomainViewScope: (scope: 'assigned' | 'all') => void;
  tasks: Task[];
  filteredTasks: Task[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedPriorityFilter: string;
  setSelectedPriorityFilter: (filter: string) => void;
  selectedSubsystemFilter: string;
  setSelectedSubsystemFilter: (filter: string) => void;
  assignedToMeOnly: boolean;
  setAssignedToMeOnly: (val: boolean) => void;
  myAssignedCount: number;
  specialDeadlineFilter: SpecialDeadlineFilter;
  setSpecialDeadlineFilter: (filter: SpecialDeadlineFilter) => void;
  handleOpenTaskDetail: (task: Task) => void;
  handleMoveStatus: (e: React.MouseEvent, taskId: string, newStatus: TaskStatus) => void;
  handleQuickAssignToMe: (e: React.MouseEvent, task: Task) => void;
  setCardTaskToDelete: (task: Task | null) => void;
  cardMenuTaskId: string | null;
  setCardMenuTaskId: (id: string | null) => void;
  canApproveCompletion?: boolean;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, status: TaskStatus) => void;
  handleDragStart: (e: React.DragEvent, taskId: string) => void;
}

export default function TeamTasksTab({
  user,
  isCoreAdmin,
  memberDomainIds,
  domainViewScope,
  setDomainViewScope,
  tasks,
  filteredTasks,
  searchQuery,
  setSearchQuery,
  selectedPriorityFilter,
  setSelectedPriorityFilter,
  selectedSubsystemFilter,
  setSelectedSubsystemFilter,
  assignedToMeOnly,
  setAssignedToMeOnly,
  myAssignedCount,
  specialDeadlineFilter,
  setSpecialDeadlineFilter,
  handleOpenTaskDetail,
  handleMoveStatus,
  handleQuickAssignToMe,
  setCardTaskToDelete,
  cardMenuTaskId,
  setCardMenuTaskId,
  canApproveCompletion = false,
  handleDragOver,
  handleDrop,
  handleDragStart,
}: TeamTasksTabProps) {
  // Mobile single-status tab selection
  const [mobileStatusTab, setMobileStatusTab] = useState<TaskStatus>('todo');

  // Counts for mobile status chips
  const todoCount = useMemo(() => filteredTasks.filter((t) => t.status === 'todo').length, [filteredTasks]);
  const inProgressCount = useMemo(() => filteredTasks.filter((t) => t.status === 'in_progress').length, [filteredTasks]);
  const reviewCount = useMemo(() => filteredTasks.filter((t) => t.status === 'review').length, [filteredTasks]);
  const doneCount = useMemo(() => filteredTasks.filter((t) => t.status === 'done').length, [filteredTasks]);

  // Desktop state matching Mockup 2
  const [desktopFilterPill, setDesktopFilterPill] = useState<'all' | 'my' | 'assigned' | 'review' | 'completed'>('all');
  const [desktopViewMode, setDesktopViewMode] = useState<'table' | 'kanban'>('table');
  const [desktopTablePage, setDesktopTablePage] = useState<number>(1);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());

  const desktopAssignedCount = useMemo(() => tasks.filter((t) => t.assignedMembers && t.assignedMembers.length > 0).length, [tasks]);
  const desktopReviewCount = useMemo(() => tasks.filter((t) => t.status === 'review').length, [tasks]);
  const desktopDoneCount = useMemo(() => tasks.filter((t) => t.status === 'done').length, [tasks]);

  const desktopFilteredTasks = useMemo(() => {
    return filteredTasks.filter((t) => {
      if (desktopFilterPill === 'my') {
        return isTaskAssignedToUser(t, user);
      }
      if (desktopFilterPill === 'assigned') {
        return t.assignedMembers && t.assignedMembers.length > 0;
      }
      if (desktopFilterPill === 'review') {
        return t.status === 'review';
      }
      if (desktopFilterPill === 'completed') {
        return t.status === 'done';
      }
      return true;
    });
  }, [filteredTasks, desktopFilterPill, user]);

  const ITEMS_PER_PAGE = 8;
  const totalPages = Math.max(1, Math.ceil(desktopFilteredTasks.length / ITEMS_PER_PAGE));
  const paginatedTasks = useMemo(() => {
    const start = (desktopTablePage - 1) * ITEMS_PER_PAGE;
    return desktopFilteredTasks.slice(start, start + ITEMS_PER_PAGE);
  }, [desktopFilteredTasks, desktopTablePage]);

  // Squads available to active member (strictly assigned domains unless Core Admin in 'all' view)
  const availableSquads = useMemo(() => {
    if (isCoreAdmin && domainViewScope === 'all') {
      return TEAMS_LIST;
    }
    return TEAMS_LIST.filter((team) => memberDomainIds.includes(team.id));
  }, [isCoreAdmin, domainViewScope, memberDomainIds]);

  // Tasks visible in the selected mobile status tab
  const visibleMobileTasks = useMemo(
    () => filteredTasks.filter((t) => t.status === mobileStatusTab),
    [filteredTasks, mobileStatusTab]
  );

  return (
    <div className="space-y-6">
      {/* 1. Mobile View (KPI Tiles, Search, Squad Filters, Chips, Card List) */}
      <MobileTeamTasksView
        filteredTasks={filteredTasks}
        mobileStatusTab={mobileStatusTab}
        setMobileStatusTab={setMobileStatusTab}
        todoCount={todoCount}
        inProgressCount={inProgressCount}
        reviewCount={reviewCount}
        doneCount={doneCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedSubsystemFilter={selectedSubsystemFilter}
        setSelectedSubsystemFilter={setSelectedSubsystemFilter}
        selectedPriorityFilter={selectedPriorityFilter}
        setSelectedPriorityFilter={setSelectedPriorityFilter}
        setAssignedToMeOnly={setAssignedToMeOnly}
        availableSquads={availableSquads}
        visibleMobileTasks={visibleMobileTasks}
        handleOpenTaskDetail={handleOpenTaskDetail}
      />

      {/* 2. Desktop View Workspace (hidden on mobile) */}
      <div className="hidden md:block space-y-6">
        {/* Operations Hero Banner with + New Task CTA */}
        <OperationsBanner
          subtitle="PROJECT OPERATIONS"
          title="Tasks"
          description="Create, assign and track work across all teams"
          action={{
            label: "+ New Task",
            onClick: () => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('siep_open_create_modal'));
              }
            },
          }}
        />

        {/* Desktop Task Controls (Filter pills, Search, Dropdown filter, Mode switcher) */}
        <DesktopTaskControls
          desktopFilterPill={desktopFilterPill}
          setDesktopFilterPill={setDesktopFilterPill}
          setDesktopTablePage={setDesktopTablePage}
          totalTasksCount={tasks.length}
          myAssignedCount={myAssignedCount}
          desktopAssignedCount={desktopAssignedCount}
          desktopReviewCount={desktopReviewCount}
          desktopDoneCount={desktopDoneCount}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          isFilterDropdownOpen={isFilterDropdownOpen}
          setIsFilterDropdownOpen={setIsFilterDropdownOpen}
          selectedSubsystemFilter={selectedSubsystemFilter}
          setSelectedSubsystemFilter={setSelectedSubsystemFilter}
          selectedPriorityFilter={selectedPriorityFilter}
          setSelectedPriorityFilter={setSelectedPriorityFilter}
          tasks={tasks}
          desktopViewMode={desktopViewMode}
          setDesktopViewMode={setDesktopViewMode}
        />

        {/* View Mode 1: Uniform Tasks Table Matching Mockup 2 */}
        {desktopViewMode === 'table' ? (
          <DesktopTaskTable
            paginatedTasks={paginatedTasks}
            selectedTaskIds={selectedTaskIds}
            setSelectedTaskIds={setSelectedTaskIds}
            handleOpenTaskDetail={handleOpenTaskDetail}
            handleMoveStatus={handleMoveStatus}
            canApproveCompletion={canApproveCompletion}
            desktopFilteredTasksCount={desktopFilteredTasks.length}
            desktopTablePage={desktopTablePage}
            setDesktopTablePage={setDesktopTablePage}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            totalPages={totalPages}
          />
        ) : (
          /* View Mode 2: Kanban Columns Drag and Drop */
          <DesktopTaskKanban
            desktopFilteredTasks={desktopFilteredTasks}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            handleDragStart={handleDragStart}
            handleOpenTaskDetail={handleOpenTaskDetail}
            handleMoveStatus={handleMoveStatus}
            user={user}
            isCoreAdmin={isCoreAdmin}
            canApproveCompletion={canApproveCompletion}
          />
        )}
      </div>
    </div>
  );
}
