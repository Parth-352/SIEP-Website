"use client";

import { useState, useMemo } from 'react';
import { Task, TeamId, TaskStatus } from '@/lib/types';
import { SpecialDeadlineFilter, DashboardTab } from '@/types/dashboard';
import { getMemberByEmail } from '@/lib/members';
import { isTaskAssignedToUser } from '@/lib/taskMatching';

interface UseDashboardFiltersOptions {
  user: any;
  tasks: Task[];
  activeTab: DashboardTab;
  isCoreAdmin: boolean;
}

export function useDashboardFilters({
  user,
  tasks,
  activeTab,
  isCoreAdmin,
}: UseDashboardFiltersOptions) {
  // Domain view scope for Team Tasks ('assigned' = member's squads only; 'all' = all 9 squads)
  const [domainViewScope, setDomainViewScope] = useState<'assigned' | 'all'>('assigned');

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubsystemFilter, setSelectedSubsystemFilter] = useState<string>('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<string>('all');
  const [assignedToMeOnly, setAssignedToMeOnly] = useState(false);
  const [specialDeadlineFilter, setSpecialDeadlineFilter] = useState<SpecialDeadlineFilter>('all');
  const [myTasksTabStatusFilter, setMyTasksTabStatusFilter] = useState<'all' | TaskStatus>('all');

  // Member's assigned domain IDs (primary + secondary, verified against roster)
  const memberDomainIds: TeamId[] = useMemo(() => {
    if (!user) return [];
    const list: TeamId[] = [user.teamId];
    if (user.secondaryTeams && Array.isArray(user.secondaryTeams)) {
      user.secondaryTeams.forEach((t: TeamId) => {
        if (!list.includes(t)) list.push(t);
      });
    }
    const member = getMemberByEmail(user.email);
    if (member) {
      if (!list.includes(member.teamId)) list.push(member.teamId);
      if (member.secondaryTeams && Array.isArray(member.secondaryTeams)) {
        member.secondaryTeams.forEach((t: TeamId) => {
          if (!list.includes(t)) list.push(t);
        });
      }
    }
    return list;
  }, [user]);

  // Dedicated memo for all tasks assigned to the current member within their assigned domain(s)
  const myAssignedTasks = useMemo(() => {
    if (!user) return [];
    return tasks.filter((t) => {
      if (!isTaskAssignedToUser(t, user)) return false;
      if (!isCoreAdmin || domainViewScope === 'assigned') {
        if (!memberDomainIds.includes(t.teamId)) return false;
      }
      return true;
    });
  }, [tasks, user, isCoreAdmin, domainViewScope, memberDomainIds]);

  const myAssignedCount = myAssignedTasks.length;

  const myTasksBreakdown = useMemo(() => {
    const todo = myAssignedTasks.filter((t) => t.status === 'todo').length;
    const inProgress = myAssignedTasks.filter((t) => t.status === 'in_progress').length;
    const review = myAssignedTasks.filter((t) => t.status === 'review').length;
    const done = myAssignedTasks.filter((t) => t.status === 'done').length;
    const total = myAssignedTasks.length;
    const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { todo, inProgress, review, done, total, completionPct };
  }, [myAssignedTasks]);

  // Actionable Deadlines & Review Counts
  const { overdueTasksList, dueThisWeekTasksList, underReviewTasksList } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const overdue: Task[] = [];
    const dueThisWeek: Task[] = [];
    const review: Task[] = [];

    tasks.forEach((t) => {
      if (t.status === 'review') review.push(t);
      if (t.status !== 'done' && t.dueDate) {
        const parts = t.dueDate.split('-');
        if (parts.length === 3) {
          const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 23, 59, 59);
          if (target.getTime() < today.getTime()) {
            overdue.push(t);
          } else if (target.getTime() <= nextWeek.getTime()) {
            dueThisWeek.push(t);
          }
        }
      }
    });

    return {
      overdueTasksList: overdue,
      dueThisWeekTasksList: dueThisWeek,
      underReviewTasksList: review,
    };
  }, [tasks]);

  // Filtered Tasks computation
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Assigned to me filter
      if (assignedToMeOnly && user) {
        if (!isTaskAssignedToUser(task, user)) return false;
      }
      // Domain-scoped filtering for Team Tasks
      if ((activeTab === 'team_tasks' || activeTab === 'kanban') && !assignedToMeOnly) {
        if (!isCoreAdmin || domainViewScope === 'assigned') {
          if (!memberDomainIds.includes(task.teamId)) {
            return false;
          }
        }
      }
      // Subsystem filter
      if (!assignedToMeOnly && selectedSubsystemFilter !== 'all' && task.teamId !== selectedSubsystemFilter) {
        return false;
      }
      // Priority filter
      if (selectedPriorityFilter !== 'all' && task.priority !== selectedPriorityFilter) {
        return false;
      }
      // Special Deadline / Actionable KPI filter
      if (specialDeadlineFilter === 'overdue') {
        if (task.status === 'done' || !task.dueDate) return false;
        const parts = task.dueDate.split('-');
        if (parts.length !== 3) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 23, 59, 59);
        if (target.getTime() >= today.getTime()) return false;
      } else if (specialDeadlineFilter === 'due_week') {
        if (task.status === 'done' || !task.dueDate) return false;
        const parts = task.dueDate.split('-');
        if (parts.length !== 3) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const target = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 23, 59, 59);
        if (target.getTime() < today.getTime() || target.getTime() > nextWeek.getTime()) return false;
      } else if (specialDeadlineFilter === 'review') {
        if (task.status !== 'review') return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = task.title.toLowerCase().includes(q);
        const descMatch = (task.description || '').toLowerCase().includes(q);
        const memberMatch = Array.isArray(task.assignedMembers)
          ? task.assignedMembers.some((m) => m.toLowerCase().includes(q))
          : String(task.assignedMembers || '').toLowerCase().includes(q);
        const teamMatch = (task.teamId || '').toLowerCase().includes(q);
        if (!titleMatch && !descMatch && !memberMatch && !teamMatch) {
          return false;
        }
      }
      return true;
    });
  }, [
    tasks,
    selectedSubsystemFilter,
    selectedPriorityFilter,
    searchQuery,
    assignedToMeOnly,
    specialDeadlineFilter,
    user,
    activeTab,
    isCoreAdmin,
    domainViewScope,
    memberDomainIds,
  ]);

  return {
    domainViewScope,
    setDomainViewScope,
    memberDomainIds,
    searchQuery,
    setSearchQuery,
    selectedSubsystemFilter,
    setSelectedSubsystemFilter,
    selectedPriorityFilter,
    setSelectedPriorityFilter,
    assignedToMeOnly,
    setAssignedToMeOnly,
    specialDeadlineFilter,
    setSpecialDeadlineFilter,
    myTasksTabStatusFilter,
    setMyTasksTabStatusFilter,
    myAssignedTasks,
    myAssignedCount,
    myTasksBreakdown,
    overdueTasksList,
    dueThisWeekTasksList,
    underReviewTasksList,
    filteredTasks,
  };
}
