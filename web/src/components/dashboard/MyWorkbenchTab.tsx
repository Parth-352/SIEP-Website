"use client";

import React from 'react';
import { UserProfile, Task, TaskStatus } from '@/lib/types';
import { STATUS_COLUMNS } from '@/constants/dashboard';
import { DashboardTab } from '@/types/dashboard';
import TaskCard from '@/components/shared/TaskCard';

interface MyWorkbenchTabProps {
  user: UserProfile;
  myAssignedTasks: Task[];
  myTasksBreakdown: { done: number; total: number; completionPct: number };
  myTasksTabStatusFilter: 'all' | TaskStatus;
  setMyTasksTabStatusFilter: (filter: 'all' | TaskStatus) => void;
  handleOpenTaskDetail: (task: Task) => void;
  handleMoveStatus: (e: React.MouseEvent, taskId: string, newStatus: TaskStatus) => void;
  setActiveTab: (tab: DashboardTab) => void;
}

export default function MyWorkbenchTab({
  user,
  myAssignedTasks,
  myTasksBreakdown,
  myTasksTabStatusFilter,
  setMyTasksTabStatusFilter,
  handleOpenTaskDetail,
  handleMoveStatus,
  setActiveTab,
}: MyWorkbenchTabProps) {
  return (
    <div className="space-y-6">
      {/* Header & Filter Toolbar for My Tasks */}
      <div className="bg-white border border-jet-black/10 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange animate-pulse" />
              <h3 className="text-base sm:text-lg font-bold font-sans text-jet-black">
                Personal Action Workbench
              </h3>
            </div>
            <p className="text-xs font-sans text-zinc-600 mt-0.5">
              Managing {myAssignedTasks.length} deliverables assigned to{' '}
              <strong className="text-jet-black font-semibold">{user.displayName}</strong>
            </p>
          </div>

          {/* Personal Completion Metric */}
          <div className="flex items-center gap-3">
            <div className="text-right font-sans">
              <div className="text-xs text-zinc-500">Personal Progress</div>
              <div className="text-sm font-bold text-jet-black">
                {myTasksBreakdown.done} / {myTasksBreakdown.total} completed ({myTasksBreakdown.completionPct}%)
              </div>
            </div>
            <div className="w-24 h-2.5 bg-alice-blue rounded-full overflow-hidden border border-jet-black/10 hidden sm:block">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${myTasksBreakdown.completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Status Filter Pills for My Tasks */}
        <div className="pt-3 border-t border-jet-black/5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-sans text-zinc-500 font-semibold shrink-0">
            Filter Status:
          </span>

          <button
            type="button"
            onClick={() => setMyTasksTabStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              myTasksTabStatusFilter === 'all'
                ? 'bg-jet-black text-alice-blue font-semibold shadow-sm'
                : 'bg-alice-blue/60 text-zinc-600 hover:text-jet-black hover:bg-alice-blue'
            }`}
          >
            <span>All Assigned</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                myTasksTabStatusFilter === 'all'
                  ? 'bg-white/20 text-alice-blue'
                  : 'bg-jet-black/10 text-zinc-700'
              }`}
            >
              {myAssignedTasks.length}
            </span>
          </button>

          {STATUS_COLUMNS.map((col) => {
            const count = myAssignedTasks.filter((t) => t.status === col.id).length;
            const isSelected = myTasksTabStatusFilter === col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setMyTasksTabStatusFilter(col.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-sans transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-jet-black text-alice-blue font-semibold shadow-sm'
                    : 'bg-alice-blue/60 text-zinc-600 hover:text-jet-black hover:bg-alice-blue'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                <span>{col.label}</span>
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
        </div>
      </div>

      {/* My Tasks Cards Layout */}
      {myAssignedTasks.length === 0 ? (
        <div className="bg-white border border-jet-black/10 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-orange/10 text-orange flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h4 className="text-base font-mono font-bold text-jet-black">
            No Active Tasks Assigned to You
          </h4>
          <p className="text-xs font-mono text-grey max-w-md leading-relaxed">
            You are all caught up! When tasks are assigned to <strong className="text-jet-black">{user.displayName}</strong>, they will be organized here with status flow and drive video attachments.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('team_tasks')}
            className="mt-2 px-5 py-2.5 rounded-xl bg-jet-black text-alice-blue hover:bg-orange transition-all font-mono text-xs font-bold uppercase tracking-wider cursor-pointer shadow-sm"
          >
            Go to Team Task Board &rarr;
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {STATUS_COLUMNS.map((col) => {
            const columnTasks = myAssignedTasks
              .filter((t) => t.status === col.id)
              .filter((t) => myTasksTabStatusFilter === 'all' || myTasksTabStatusFilter === col.id);

            return (
              <div
                key={col.id}
                className="bg-white border border-jet-black/10 rounded-2xl p-4 sm:p-5 flex flex-col min-h-[180px] h-fit shadow-sm"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-jet-black/10">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                    <h4 className="text-sm font-sans font-bold text-zinc-800">
                      {col.label}
                    </h4>
                  </div>
                  <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-alice-blue text-zinc-700 font-bold border border-jet-black/10">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-0.5">
                  {columnTasks.length === 0 ? (
                    <div className="py-6 px-3 border border-dashed border-zinc-200 rounded-xl flex items-center justify-center text-center">
                      <span className="text-xs text-zinc-500 font-sans">
                        No tasks in {col.label}
                      </span>
                    </div>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        colId={col.id}
                        isAssignedToMe={true}
                        canManage={true}
                        onOpenDetail={handleOpenTaskDetail}
                        onMoveStatus={handleMoveStatus}
                        showLogLink={true}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
