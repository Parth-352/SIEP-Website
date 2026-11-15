"use client";

import { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority, TeamId } from '@/lib/types';
import { UndoState } from '@/types/dashboard';
import { STATUS_COLUMNS } from '@/constants/dashboard';
import { cacheOfflineTasks } from '@/lib/offlineDb';
import { isTaskAssignedToUser } from '@/lib/taskMatching';

interface UseDashboardTaskActionsOptions {
  user: any;
  tasks: Task[];
  persistTasksLocal: (tasks: Task[]) => void;
  loadDashboardData: () => Promise<void>;
  enqueueTaskStatusUpdate: (payload: { taskId: string; nextStatus: TaskStatus }) => void;
  canApproveCompletion: boolean;
  onOpenCompleteModal: (task: Task) => void;
  setSelectedTask: (task: Task | null) => void;
  setIsDetailModalOpen: (open: boolean) => void;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export function useDashboardTaskActions({
  user,
  tasks,
  persistTasksLocal,
  loadDashboardData,
  enqueueTaskStatusUpdate,
  canApproveCompletion,
  onOpenCompleteModal,
  setSelectedTask,
  setIsDetailModalOpen,
  setTasks,
}: UseDashboardTaskActionsOptions) {
  // Undo Toast state
  const [undoState, setUndoState] = useState<UndoState | null>(null);

  // Card menu & deletion state
  const [cardTaskToDelete, setCardTaskToDelete] = useState<Task | null>(null);
  const [isDeletingCardTask, setIsDeletingCardTask] = useState(false);
  const [cardMenuTaskId, setCardMenuTaskId] = useState<string | null>(null);

  // Auto-dismiss undo notification toast after 6 seconds
  useEffect(() => {
    if (!undoState) return;
    const timer = setTimeout(() => {
      setUndoState(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [undoState]);

  // Create Task Submission
  const handleCreateTask = async (taskData: {
    title: string;
    description: string;
    teamId: TeamId;
    assignedMembers: string[];
    priority: TaskPriority;
    status: TaskStatus;
    dueDate?: string;
  }) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData),
    });

    const data = await res.json();
    if (data.success && data.task) {
      const nextTasks = [data.task, ...tasks];
      persistTasksLocal(nextTasks);
    } else {
      throw new Error(data.error || 'Failed to create task');
    }
  };

  // Move Task Status (Kanban quick advance / rewind with Undo support)
  const handleMoveStatus = async (e: React.MouseEvent, taskId: string, nextStatus: TaskStatus) => {
    e.stopPropagation();

    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask) return;
    const prevStatus = currentTask.status;

    if (nextStatus === 'done') {
      if (!canApproveCompletion) {
        alert('Hierarchy Rule: Only Squad Leads and Core Leadership can approve and mark tasks as Completed.');
        return;
      }
      onOpenCompleteModal(currentTask);
      return;
    }

    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: nextStatus, updatedAt: Date.now() } : t
    );
    persistTasksLocal(updatedTasks);
    cacheOfflineTasks(updatedTasks);

    const nextColLabel = STATUS_COLUMNS.find((c) => c.id === nextStatus)?.label || nextStatus;
    setUndoState({
      taskId,
      previousStatus: prevStatus,
      message: `"${currentTask.title.slice(0, 32)}..." moved to ${nextColLabel}`,
    });

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      enqueueTaskStatusUpdate({ taskId, nextStatus });
      return;
    }

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: nextStatus }),
      });
    } catch (err) {
      console.warn('Network offline or update failed, queuing status update:', err);
      enqueueTaskStatusUpdate({ taskId, nextStatus });
    }
  };

  // Revert / Undo status advancement
  const handleUndoMoveStatus = async () => {
    if (!undoState) return;
    const { taskId, previousStatus } = undoState;
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: previousStatus, updatedAt: Date.now() } : t
    );
    persistTasksLocal(updatedTasks);
    cacheOfflineTasks(updatedTasks);
    setUndoState(null);

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status: previousStatus }),
      });
    } catch (err) {
      console.warn('Network offline or undo failed:', err);
    }
  };

  const confirmDeleteCardTask = async () => {
    if (!cardTaskToDelete) return;
    const taskId = cardTaskToDelete.id;
    setIsDeletingCardTask(true);

    const remainingTasks = tasks.filter((t) => t.id !== taskId);
    persistTasksLocal(remainingTasks);

    try {
      await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete task:', err);
      loadDashboardData();
    } finally {
      setIsDeletingCardTask(false);
      setCardTaskToDelete(null);
    }
  };

  // Modal Callbacks
  const handleModalTaskUpdated = (updatedTask: Task) => {
    const updated = tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t));
    persistTasksLocal(updated);
    setSelectedTask(updatedTask);
  };

  const handleModalTaskDeleted = (taskId: string) => {
    const remaining = tasks.filter((t) => t.id !== taskId);
    persistTasksLocal(remaining);
    setIsDetailModalOpen(false);
    setSelectedTask(null);
  };

  // Quick 1-click self-assign or toggle
  const handleQuickAssignToMe = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation();
    if (!user) return;
    const myName = user.displayName;
    const currentMembers = Array.isArray(task.assignedMembers)
      ? [...task.assignedMembers]
      : typeof task.assignedMembers === 'string'
      ? (task.assignedMembers as string).split(',').map((s) => s.trim())
      : [];

    const isAssigned = isTaskAssignedToUser(task, user);
    let updatedMembers: string[];
    if (isAssigned) {
      updatedMembers = currentMembers.filter(
        (m) =>
          m.toLowerCase() !== myName.toLowerCase() &&
          !m.toLowerCase().includes(myName.toLowerCase()) &&
          !myName.toLowerCase().includes(m.toLowerCase())
      );
    } else {
      updatedMembers = [...currentMembers, myName];
    }

    const updatedTask: Task = {
      ...task,
      assignedMembers: updatedMembers,
      updatedAt: Date.now(),
    };

    setTasks((prev) => prev.map((t) => (t.id === task.id ? updatedTask : t)));
    persistTasksLocal(tasks.map((t) => (t.id === task.id ? updatedTask : t)));

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: task.id,
          assignedMembers: updatedMembers,
        }),
      });
    } catch (err) {
      console.warn('Failed to update task assignment:', err);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;
    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask || currentTask.status === status) return;

    if (status === 'done') {
      if (!canApproveCompletion) {
        alert('Hierarchy Rule: Only Squad Leads and Core Leadership can approve and mark tasks as Completed.');
        return;
      }
      onOpenCompleteModal(currentTask);
      return;
    }

    const prevStatus = currentTask.status;
    const updatedTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status, updatedAt: Date.now() } : t
    );
    persistTasksLocal(updatedTasks);
    cacheOfflineTasks(updatedTasks);

    const nextColLabel = STATUS_COLUMNS.find((c) => c.id === status)?.label || status;
    setUndoState({
      taskId,
      previousStatus: prevStatus,
      message: `"${currentTask.title.slice(0, 32)}..." moved to ${nextColLabel}`,
    });

    try {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: taskId, status }),
      });
    } catch (err) {
      console.warn('Network offline or drag update failed:', err);
      enqueueTaskStatusUpdate({ taskId, nextStatus: status });
    }
  };

  return {
    undoState,
    setUndoState,
    cardTaskToDelete,
    setCardTaskToDelete,
    isDeletingCardTask,
    cardMenuTaskId,
    setCardMenuTaskId,
    handleCreateTask,
    handleMoveStatus,
    handleUndoMoveStatus,
    confirmDeleteCardTask,
    handleModalTaskUpdated,
    handleModalTaskDeleted,
    handleQuickAssignToMe,
    handleDragStart,
    handleDragOver,
    handleDrop,
  };
}
