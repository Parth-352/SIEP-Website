"use client";

import React from 'react';
import { Task, TaskStatus } from '@/lib/types';
import { getMemberInitials, getAvatarColorClass } from '@/utils/avatarUtils';
import { getDomainBadge } from './taskBadgeUtils';

interface DesktopTaskTableProps {
  paginatedTasks: Task[];
  selectedTaskIds: Set<string>;
  setSelectedTaskIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  handleOpenTaskDetail: (task: Task) => void;
  handleMoveStatus: (e: React.MouseEvent, taskId: string, newStatus: TaskStatus) => void;
  canApproveCompletion: boolean;
  desktopFilteredTasksCount: number;
  desktopTablePage: number;
  setDesktopTablePage: React.Dispatch<React.SetStateAction<number>>;
  ITEMS_PER_PAGE: number;
  totalPages: number;
}

export default function DesktopTaskTable({
  paginatedTasks,
  selectedTaskIds,
  setSelectedTaskIds,
  handleOpenTaskDetail,
  handleMoveStatus,
  canApproveCompletion,
  desktopFilteredTasksCount,
  desktopTablePage,
  setDesktopTablePage,
  ITEMS_PER_PAGE,
  totalPages,
}: DesktopTaskTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider font-sans">
              <th className="py-3.5 pl-6 pr-3 w-10">
                <input
                  type="checkbox"
                  checked={paginatedTasks.length > 0 && paginatedTasks.every((t) => selectedTaskIds.has(t.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedTaskIds(new Set([...Array.from(selectedTaskIds), ...paginatedTasks.map((t) => t.id)]));
                    } else {
                      const next = new Set(selectedTaskIds);
                      paginatedTasks.forEach((t) => next.delete(t.id));
                      setSelectedTaskIds(next);
                    }
                  }}
                  className="rounded text-orange-500 focus:ring-orange-500"
                />
              </th>
              <th className="py-3.5 px-3">Task</th>
              <th className="py-3.5 px-3">Team</th>
              <th className="py-3.5 px-3">Priority</th>
              <th className="py-3.5 px-3">Status</th>
              <th className="py-3.5 px-3">Assignee</th>
              <th className="py-3.5 px-3">Due Date</th>
              <th className="py-3.5 pr-6 pl-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-sans text-xs">
            {paginatedTasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 font-sans">
                  No tasks match the active filters.
                </td>
              </tr>
            ) : (
              paginatedTasks.map((task) => {
                const isChecked = selectedTaskIds.has(task.id);
                const domainInfo = getDomainBadge(task.teamId);

                // Priority styling matching Mockup 2 with clean SVG vector icons (no emojis)
                const priorityPill =
                  task.priority === 'urgent' || task.priority === 'high'
                    ? {
                        label: 'High',
                        icon: (
                          <svg className="w-2.5 h-2.5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                          </svg>
                        ),
                        class: 'bg-rose-50 text-rose-600 border-rose-200',
                      }
                    : task.priority === 'medium'
                    ? {
                        label: 'Medium',
                        icon: (
                          <svg className="w-2.5 h-2.5 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14" />
                          </svg>
                        ),
                        class: 'bg-amber-50 text-amber-600 border-amber-200',
                      }
                    : {
                        label: 'Low',
                        icon: (
                          <svg className="w-2.5 h-2.5 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                          </svg>
                        ),
                        class: 'bg-emerald-50 text-emerald-600 border-emerald-200',
                      };

                // Status pill matching Mockup 2 with clean SVG vector icons (no emojis)
                const statusPill =
                  task.status === 'done'
                    ? {
                        label: 'Completed',
                        icon: (
                          <svg className="w-2.5 h-2.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ),
                        class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      }
                    : task.status === 'in_progress'
                    ? {
                        label: 'In Progress',
                        icon: (
                          <svg className="w-2 h-2 text-amber-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        ),
                        class: 'bg-amber-50 text-amber-700 border-amber-200',
                      }
                    : task.status === 'review'
                    ? {
                        label: 'Under Review',
                        icon: (
                          <svg className="w-2.5 h-2.5 text-purple-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        ),
                        class: 'bg-purple-50 text-purple-700 border-purple-200',
                      }
                    : {
                        label: 'To Do',
                        icon: (
                          <span className="w-1.5 h-1.5 rounded-full border border-slate-400 shrink-0" />
                        ),
                        class: 'bg-slate-50 text-slate-700 border-slate-200',
                      };

                // Due date formatted
                const dueDateFormatted = task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—';

                return (
                  <tr
                    key={task.id}
                    onClick={() => handleOpenTaskDetail(task)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 pl-6 pr-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const next = new Set(selectedTaskIds);
                          if (e.target.checked) next.add(task.id);
                          else next.delete(task.id);
                          setSelectedTaskIds(next);
                        }}
                        className="rounded text-orange-500 focus:ring-orange-500"
                      />
                    </td>

                    {/* Task Title */}
                    <td className="py-3.5 px-3 font-semibold text-slate-900 group-hover:text-orange-600 transition-colors max-w-xs truncate">
                      {task.title}
                    </td>

                    {/* Team */}
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${domainInfo.bg}`}>
                        {domainInfo.code}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${priorityPill.class}`}>
                        {priorityPill.icon}
                        <span>{priorityPill.label}</span>
                      </span>
                    </td>

                    {/* Status & Review Workflow */}
                    <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-start gap-1.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusPill.class}`}>
                          {statusPill.icon}
                          <span>{statusPill.label}</span>
                        </span>

                        {/* Interactive Transition Actions for Desktop Parity */}
                        {task.status === 'todo' && (
                          <button
                            type="button"
                            onClick={(e) => handleMoveStatus(e, task.id, 'in_progress')}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 transition-colors cursor-pointer"
                            title="Advance to In Progress"
                          >
                            <span>Start Work &rarr;</span>
                          </button>
                        )}

                        {task.status === 'in_progress' && (
                          <button
                            type="button"
                            onClick={(e) => handleMoveStatus(e, task.id, 'review')}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded border border-purple-200 transition-colors cursor-pointer"
                            title="Submit deliverable for lead review"
                          >
                            <span>Submit for Review &rarr;</span>
                          </button>
                        )}

                        {task.status === 'review' && (
                          canApproveCompletion ? (
                            <button
                              type="button"
                              onClick={(e) => handleMoveStatus(e, task.id, 'done')}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-100/90 hover:bg-emerald-200 px-2.5 py-0.5 rounded-md border border-emerald-300 transition-colors cursor-pointer shadow-2xs"
                              title="Approve deliverable and record completion"
                            >
                              <svg className="w-2.5 h-2.5 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Approve &amp; Complete</span>
                            </button>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"
                              title="Awaiting Squad Lead or Core Leadership sign-off"
                            >
                              <svg className="w-2.5 h-2.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              <span>Awaiting Lead Approval</span>
                            </span>
                          )
                        )}
                      </div>
                    </td>

                    {/* Assignees */}
                    <td className="py-3.5 px-3">
                      {task.assignedMembers && task.assignedMembers.length > 0 ? (
                        <div className="flex items-center -space-x-1.5">
                          {task.assignedMembers.slice(0, 3).map((name) => (
                            <span
                              key={name}
                              title={name}
                              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-bold border-2 border-white uppercase shadow-xs ${getAvatarColorClass(name)}`}
                            >
                              {getMemberInitials(name)}
                            </span>
                          ))}
                          {task.assignedMembers.length > 3 && (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-[9px] font-bold bg-slate-200 text-slate-700 border-2 border-white">
                              +{task.assignedMembers.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Unassigned</span>
                      )}
                    </td>

                    {/* Due Date */}
                    <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{dueDateFormatted}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 pr-6 pl-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {task.status === 'in_progress' && (
                          <button
                            type="button"
                            onClick={(e) => handleMoveStatus(e, task.id, 'review')}
                            className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold border border-purple-200 transition-colors cursor-pointer"
                            title="Submit for Review"
                          >
                            Submit Review
                          </button>
                        )}
                        {task.status === 'review' && canApproveCompletion && (
                          <button
                            type="button"
                            onClick={(e) => handleMoveStatus(e, task.id, 'done')}
                            className="px-2 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                            title="Approve & Complete"
                          >
                            Approve ✓
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenTaskDetail(task)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="View Task Details"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer Matching Mockup 2 */}
      <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-sans">
        <span>
          Showing {desktopFilteredTasksCount > 0 ? (desktopTablePage - 1) * ITEMS_PER_PAGE + 1 : 0}–
          {Math.min(desktopTablePage * ITEMS_PER_PAGE, desktopFilteredTasksCount)} of {desktopFilteredTasksCount} tasks
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={desktopTablePage <= 1}
            onClick={() => setDesktopTablePage((p) => Math.max(1, p - 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            &lt;
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 7).map((pg) => (
            <button
              key={pg}
              type="button"
              onClick={() => setDesktopTablePage(pg)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                desktopTablePage === pg
                  ? 'bg-[#0e131f] text-white shadow-xs'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {pg}
            </button>
          ))}

          <button
            type="button"
            disabled={desktopTablePage >= totalPages}
            onClick={() => setDesktopTablePage((p) => Math.min(totalPages, p + 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
