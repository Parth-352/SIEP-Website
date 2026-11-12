"use client";

import React from 'react';
import { TEAMS_LIST, TEAMS } from '@/lib/teams';
import { Task, TaskStatus, TeamId, UserProfile } from '@/lib/types';
import { STATUS_COLUMNS, PRIORITY_BADGES } from '@/constants/dashboard';
import { SpecialDeadlineFilter } from '@/types/dashboard';
import { isTaskAssignedToUser } from '@/lib/taskMatching';
import { formatRelativeDueDate } from '@/utils/dateUtils';
import { getMemberInitials, getAvatarColorClass } from '@/utils/avatarUtils';

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
  handleDragOver,
  handleDrop,
  handleDragStart,
}: TeamTasksTabProps) {
  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <div className="bg-white border border-jet-black/10 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks by title, description, or squad..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-jet-black/15 text-xs sm:text-sm font-sans text-zinc-800 placeholder:text-zinc-400 focus:ring-2 focus:ring-orange focus:outline-none"
            />
            <svg
              className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-2.5 text-zinc-400 hover:text-zinc-700 text-xs font-sans cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Priority Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-sans text-zinc-500 font-semibold">Priority:</span>
            <select
              value={selectedPriorityFilter}
              onChange={(e) => setSelectedPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-jet-black/15 text-xs sm:text-sm font-sans text-zinc-700 font-medium focus:ring-2 focus:ring-orange focus:outline-none bg-white cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Subsystem Filter Pills with smooth horizontal scroll and right-edge gradient indicator */}
        <div className="relative">
          <div className="pt-3 border-t border-jet-black/5 flex items-center gap-2 overflow-x-auto hide-scrollbar touch-pan-x scroll-smooth pr-10">
            {/* Core Leadership Scope Switcher */}
            {isCoreAdmin && (
              <div className="flex items-center gap-1 p-0.5 bg-zinc-100 rounded-xl text-xs font-sans font-medium shrink-0 mr-1 border border-zinc-200/80">
                <button
                  type="button"
                  onClick={() => {
                    setDomainViewScope('assigned');
                    setSelectedSubsystemFilter('all');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    domainViewScope === 'assigned'
                      ? 'bg-jet-black text-white font-semibold shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  My Domains ({memberDomainIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDomainViewScope('all');
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    domainViewScope === 'all'
                      ? 'bg-jet-black text-white font-semibold shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  All Squads (9)
                </button>
              </div>
            )}

            <span className="text-xs font-sans text-zinc-500 font-semibold shrink-0">
              Subsystem:
            </span>

            <button
              type="button"
              onClick={() => {
                setSelectedSubsystemFilter('all');
                setAssignedToMeOnly(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                selectedSubsystemFilter === 'all' && !assignedToMeOnly
                  ? 'bg-jet-black text-alice-blue font-semibold shadow-sm'
                  : 'bg-alice-blue/60 text-zinc-600 hover:text-jet-black hover:bg-alice-blue'
              }`}
            >
              {!isCoreAdmin || domainViewScope === 'assigned'
                ? `All My Squads (${tasks.filter((t) => memberDomainIds.includes(t.teamId)).length})`
                : `All Tasks (${tasks.length})`}
            </button>

            <button
              type="button"
              onClick={() => {
                const nextVal = !assignedToMeOnly;
                setAssignedToMeOnly(nextVal);
                if (nextVal) {
                  setSelectedSubsystemFilter('all');
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                assignedToMeOnly
                  ? 'bg-orange text-white font-semibold shadow-md'
                  : 'bg-alice-blue/60 text-zinc-600 hover:text-jet-black hover:bg-alice-blue'
              }`}
            >
              <span>Assigned to Me</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  assignedToMeOnly ? 'bg-white/30 text-white' : 'bg-jet-black/10 text-zinc-700'
                }`}
              >
                {myAssignedCount}
              </span>
            </button>

            {/* Render squads based on member's domains (or all squads for Core toggle) */}
            {((!isCoreAdmin || domainViewScope === 'assigned')
              ? TEAMS_LIST.filter((t) => memberDomainIds.includes(t.id))
              : TEAMS_LIST
            ).map((team) => {
              const count = tasks.filter((t) => t.teamId === team.id).length;
              const isSelected = selectedSubsystemFilter === team.id && !assignedToMeOnly;
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => {
                    setSelectedSubsystemFilter(team.id);
                    setAssignedToMeOnly(false);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? 'bg-jet-black text-alice-blue font-semibold shadow-sm'
                      : 'bg-alice-blue/60 text-zinc-600 hover:text-jet-black hover:bg-alice-blue'
                  }`}
                >
                  <span className="font-medium">{team.shortName}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected ? 'bg-white/20 text-alice-blue' : 'bg-jet-black/10 text-zinc-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}

            {specialDeadlineFilter !== 'all' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange/15 border border-orange/30 text-orange text-xs font-sans font-semibold whitespace-nowrap shrink-0">
                <span>
                  Filter:{' '}
                  {specialDeadlineFilter === 'due_week'
                    ? 'Due This Week'
                    : specialDeadlineFilter === 'overdue'
                    ? 'Overdue'
                    : 'Review Queue'}
                </span>
                <button
                  type="button"
                  onClick={() => setSpecialDeadlineFilter('all')}
                  className="hover:text-jet-black font-bold ml-0.5 cursor-pointer"
                  title="Clear deadline filter"
                >
                  ✕
                </button>
              </div>
            )}

            {(selectedSubsystemFilter !== 'all' ||
              selectedPriorityFilter !== 'all' ||
              searchQuery ||
              assignedToMeOnly ||
              specialDeadlineFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSubsystemFilter('all');
                  setSelectedPriorityFilter('all');
                  setSearchQuery('');
                  setAssignedToMeOnly(false);
                  setSpecialDeadlineFilter('all');
                }}
                className="ml-auto px-2.5 py-1 text-xs font-sans text-orange hover:underline font-semibold whitespace-nowrap cursor-pointer shrink-0"
              >
                Reset Filters
              </button>
            )}
          </div>
          {/* Right subtle fade indicator for mobile/narrow horizontal scroll */}
          <div className="absolute right-0 top-3 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden" />
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {STATUS_COLUMNS.map((col) => {
          const columnTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="bg-white border border-jet-black/10 rounded-2xl p-4 sm:p-5 flex flex-col min-h-[200px] h-fit shadow-sm"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-jet-black/10">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                  <h3 className="text-sm font-sans font-bold text-zinc-800">
                    {col.label}
                  </h3>
                </div>
                <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-alice-blue text-zinc-700 font-bold border border-jet-black/10">
                  {columnTasks.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3.5 flex-1 overflow-y-auto pr-0.5">
                {columnTasks.length === 0 ? (
                  <div className="py-8 px-4 border border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-sans text-zinc-500 font-medium">
                      {filteredTasks.length === 0 &&
                      (selectedSubsystemFilter !== 'all' || searchQuery || specialDeadlineFilter !== 'all')
                        ? 'No matching deliverables'
                        : `No tasks in ${col.label}`}
                    </span>
                    <span className="text-[11px] font-sans text-zinc-400 mt-1">
                      Drag or advance deliverables here
                    </span>
                  </div>
                ) : (
                  columnTasks.map((task) => {
                    const taskTeam = TEAMS[task.teamId];
                    const priorityInfo = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.medium;
                    const isTaskAssignedToMe = isTaskAssignedToUser(task, user);
                    const canManageThisTask = isCoreAdmin || user.teamId === task.teamId || isTaskAssignedToMe;
                    const dueInfo = formatRelativeDueDate(task.dueDate);

                    return (
                      <div
                        key={task.id}
                        draggable={canManageThisTask}
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => handleOpenTaskDetail(task)}
                        className="group bg-alice-blue/40 hover:bg-white border border-jet-black/10 hover:border-orange/60 rounded-xl p-3.5 sm:p-4 shadow-2xs hover:shadow-md transition-all space-y-3 cursor-pointer relative"
                      >
                        {/* Team & Priority Row */}
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[11px] font-sans font-semibold border whitespace-nowrap flex-shrink-0 ${
                              taskTeam?.badgeBg || 'bg-zinc-100 text-zinc-800 border-zinc-200'
                            }`}
                          >
                            {taskTeam?.shortName || task.teamId}
                          </span>

                          <div className="flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
                            {task.isBlocked && (
                              <span
                                className="px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-700 text-[10px] font-sans font-bold flex items-center gap-1"
                                title={task.blockerReason || 'Blocked deliverable'}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Blocked
                              </span>
                            )}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase tracking-wider ${priorityInfo.bg}`}
                            >
                              {priorityInfo.label}
                            </span>
                          </div>
                        </div>

                        {/* Title & Desc */}
                        <div>
                          <h4 className="text-sm font-sans font-semibold text-jet-black leading-snug group-hover:text-orange transition-colors">
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs text-zinc-600 mt-1 font-normal line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>

                        {/* Subtasks Progress Bar */}
                        {task.subtasks && task.subtasks.length > 0 && (
                          <div className="space-y-1 pt-0.5">
                            <div className="flex items-center justify-between text-[11px] font-sans text-zinc-500">
                              <span>Checklist</span>
                              <span className="font-semibold text-zinc-800">
                                {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-jet-black/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{
                                  width: `${Math.round(
                                    (task.subtasks.filter((st) => st.completed).length / task.subtasks.length) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Assignee & Due Date Row */}
                        <div className="pt-2 border-t border-jet-black/5 flex items-center justify-between text-xs text-zinc-500 gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {task.assignedMembers && task.assignedMembers.length > 0 ? (
                              <div className="flex items-center -space-x-1.5">
                                {task.assignedMembers.slice(0, 3).map((name) => (
                                  <span
                                    key={name}
                                    title={name}
                                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-sans font-bold border-2 border-white uppercase shadow-xs ${getAvatarColorClass(
                                      name
                                    )}`}
                                  >
                                    {getMemberInitials(name)}
                                  </span>
                                ))}
                                {task.assignedMembers.length > 3 && (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-bold bg-zinc-200 text-zinc-700 border-2 border-white">
                                    +{task.assignedMembers.length - 3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-zinc-400 italic font-sans">
                                <span className="w-5 h-5 rounded-full border border-dashed border-zinc-300 flex items-center justify-center text-[9px] text-zinc-400">
                                  ?
                                </span>
                                Unassigned
                              </span>
                            )}

                            {task.comments && task.comments.length > 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-white border border-jet-black/10 text-zinc-500 font-bold flex items-center gap-0.5 text-[10px]">
                                💬 {task.comments.length}
                              </span>
                            )}
                            {Boolean(task.actualHours) && (
                              <span className="px-1.5 py-0.5 rounded bg-white border border-jet-black/10 text-zinc-500 font-medium text-[10px]">
                                {task.actualHours}h
                              </span>
                            )}

                            {!isTaskAssignedToMe && (
                              <button
                                type="button"
                                onClick={(e) => handleQuickAssignToMe(e, task)}
                                className="px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-orange hover:text-white border border-zinc-200 text-[10px] font-sans font-medium text-zinc-600 transition-all cursor-pointer"
                                title="Assign this task to yourself"
                              >
                                + Claim
                              </button>
                            )}
                          </div>

                          {/* Relative Due Date badge */}
                          <div>
                            {dueInfo ? (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-sans ${dueInfo.className}`}
                              >
                                {dueInfo.isOverdue && <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />}
                                {dueInfo.text}
                              </span>
                            ) : (
                              <span className="text-[11px] font-sans text-zinc-400 italic">No deadline</span>
                            )}
                          </div>
                        </div>

                        {/* Quick Move Status Controls & Open Details / More Menu */}
                        <div className="pt-2.5 border-t border-jet-black/5 flex items-center justify-between">
                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {col.id !== 'todo' && (
                              <button
                                type="button"
                                disabled={!canManageThisTask}
                                onClick={(e) => {
                                  const prevIdx = STATUS_COLUMNS.findIndex((c) => c.id === col.id) - 1;
                                  if (prevIdx >= 0) handleMoveStatus(e, task.id, STATUS_COLUMNS[prevIdx].id);
                                }}
                                title="Move back"
                                className="px-2 py-1 text-xs font-sans font-medium bg-white hover:bg-zinc-100 rounded-lg border border-zinc-200 text-zinc-600 cursor-pointer transition-colors disabled:opacity-40"
                              >
                                ←
                              </button>
                            )}
                            {col.id !== 'done' && (
                              <button
                                type="button"
                                disabled={!canManageThisTask}
                                onClick={(e) => {
                                  const nextIdx = STATUS_COLUMNS.findIndex((c) => c.id === col.id) + 1;
                                  if (nextIdx < STATUS_COLUMNS.length) handleMoveStatus(e, task.id, STATUS_COLUMNS[nextIdx].id);
                                }}
                                title="Move forward"
                                className="px-2.5 py-1 text-xs font-sans font-medium border border-zinc-300 hover:border-orange hover:bg-orange/10 hover:text-orange text-zinc-700 bg-white rounded-lg transition-colors cursor-pointer disabled:opacity-40"
                              >
                                Advance →
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleOpenTaskDetail(task)}
                              className="text-xs font-sans text-zinc-500 hover:text-orange font-semibold transition-colors px-1.5 py-1 cursor-pointer"
                            >
                              Details ↗
                            </button>

                            {canManageThisTask && (
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCardMenuTaskId(cardMenuTaskId === task.id ? null : task.id);
                                  }}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 transition-colors text-xs cursor-pointer font-bold"
                                  title="Task options"
                                >
                                  ···
                                </button>

                                {cardMenuTaskId === task.id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-20"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCardMenuTaskId(null);
                                      }}
                                    />
                                    <div className="absolute right-0 bottom-full mb-1 w-40 bg-white border border-zinc-200 rounded-xl shadow-xl py-1 z-30 animate-in fade-in zoom-in-95">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCardMenuTaskId(null);
                                          setCardTaskToDelete(task);
                                        }}
                                        className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                                      >
                                        <span>🗑</span>
                                        <span>Delete Task...</span>
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
