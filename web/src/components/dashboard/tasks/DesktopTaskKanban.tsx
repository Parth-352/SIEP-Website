"use client";

import React from 'react';
import { TEAMS } from '@/lib/teams';
import { Task, TaskStatus, UserProfile } from '@/lib/types';
import { STATUS_COLUMNS, PRIORITY_BADGES } from '@/constants/dashboard';
import { isTaskAssignedToUser } from '@/lib/taskMatching';
import { formatRelativeDueDate } from '@/utils/dateUtils';

interface DesktopTaskKanbanProps {
  desktopFilteredTasks: Task[];
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, status: TaskStatus) => void;
  handleDragStart: (e: React.DragEvent, taskId: string) => void;
  handleOpenTaskDetail: (task: Task) => void;
  handleMoveStatus: (e: React.MouseEvent, taskId: string, newStatus: TaskStatus) => void;
  user: UserProfile;
  isCoreAdmin: boolean;
  canApproveCompletion: boolean;
}

export default function DesktopTaskKanban({
  desktopFilteredTasks,
  handleDragOver,
  handleDrop,
  handleDragStart,
  handleOpenTaskDetail,
  handleMoveStatus,
  user,
  isCoreAdmin,
  canApproveCompletion,
}: DesktopTaskKanbanProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {STATUS_COLUMNS.map((col) => {
        const columnTasks = desktopFilteredTasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col min-h-[200px] h-fit shadow-xs"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                <h3 className="text-sm font-sans font-bold text-slate-800">
                  {col.label}
                </h3>
              </div>
              <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                {columnTasks.length}
              </span>
            </div>

            {/* Cards List */}
            <div className="space-y-3.5 flex-1 overflow-y-auto pr-0.5">
              {columnTasks.length === 0 ? (
                <div className="py-8 px-4 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-sans text-slate-500 font-medium">
                    No tasks in {col.label}
                  </span>
                  <span className="text-[11px] font-sans text-slate-400 mt-1">
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
                      className="group bg-slate-50/50 hover:bg-white border border-slate-200 hover:border-orange-500 rounded-xl p-3.5 sm:p-4 shadow-2xs hover:shadow-md transition-all space-y-3 cursor-pointer relative"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[11px] font-sans font-semibold border whitespace-nowrap flex-shrink-0 ${
                            taskTeam ? taskTeam.badgeBg : 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {taskTeam ? taskTeam.shortName : task.teamId}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-sans font-bold uppercase tracking-wider ${priorityInfo.bg}`}>
                          {priorityInfo.label}
                        </span>
                      </div>

                      <h4 className="text-sm font-sans font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                        {task.title}
                      </h4>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 gap-2">
                        {dueInfo && <span className={`text-[11px] ${dueInfo.className}`}>{dueInfo.text}</span>}
                        
                        <div className="flex items-center gap-1.5 ml-auto">
                          {task.status === 'todo' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStatus(e, task.id, 'in_progress');
                              }}
                              className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200 transition-colors cursor-pointer"
                              title="Start work"
                            >
                              Start &rarr;
                            </button>
                          )}
                          {task.status === 'in_progress' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMoveStatus(e, task.id, 'review');
                              }}
                              className="px-2 py-0.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold border border-purple-200 transition-colors cursor-pointer"
                              title="Submit deliverable for lead review"
                            >
                              Review &rarr;
                            </button>
                          )}
                          {task.status === 'review' && (
                            canApproveCompletion ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveStatus(e, task.id, 'done');
                                }}
                                className="px-2 py-0.5 rounded bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold shadow-2xs transition-colors cursor-pointer"
                                title="Approve deliverable and record completion"
                              >
                                Approve ✓
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] text-slate-400 font-medium">
                                <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <span>Awaiting Lead</span>
                              </span>
                            )
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTaskDetail(task);
                            }}
                            className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                          >
                            Details &rarr;
                          </button>
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
  );
}
