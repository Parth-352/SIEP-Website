import { NextRequest, NextResponse } from 'next/server';
import { getTasks, createTask, updateTask, deleteTask, addNotification, recordActivity, getActivities } from '@/lib/store';
import { 
  getFirestoreTasks, 
  saveFirestoreTask, 
  deleteFirestoreTask 
} from '@/lib/firestoreService';
import { TeamId, TaskStatus, TaskPriority, Task, ActivityEvent } from '@/lib/types';
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/session';
import { getMemberByName } from '@/lib/members';
import { normalizeTask } from '@/lib/taskMatching';

function dispatchTaskNotifications(task: Task, assignedBy: string) {
  const gasUrl = process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL;
  if (!Array.isArray(task.assignedMembers) || task.assignedMembers.length === 0) return;

  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  task.assignedMembers.forEach((name) => {
    const member = getMemberByName(name);
    if (!member) return;

    // 1. Record In-App notification
    try {
      addNotification({
        recipientEmail: member.email,
        recipientName: member.name,
        title: `Task Assigned: ${task.title}`,
        message: `Assigned by ${assignedBy}. Priority: ${task.priority.toUpperCase()}. Due: ${task.dueDate || 'No due date'}`,
        taskId: task.id,
      });
    } catch (e) {
      console.warn('In-app notification notice:', e);
    }

    // 2. Dispatch personal Gmail notification via Google Apps Script
    if (gasUrl) {
      fetch(gasUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'sendTaskAssignmentNotification',
          to: member.email,
          recipientName: member.name,
          taskTitle: task.title,
          taskDescription: task.description || '',
          teamId: task.teamId,
          priority: task.priority,
          dueDate: task.dueDate || 'Unscheduled',
          assignedBy,
          timestamp,
        }),
      }).catch((err) => {
        console.warn(`Task notification dispatch notice for ${member.email}:`, err);
      });
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('teamId') || undefined;
    const activities = getActivities(40);

    // 1. Try Firestore cloud storage first
    const firestoreTasks = await getFirestoreTasks(teamId);
    if (firestoreTasks !== null) {
      const normalized = firestoreTasks.map(normalizeTask);
      return NextResponse.json({ success: true, tasks: normalized, activities, source: 'firestore' });
    }

    // 2. Fallback to local store
    const tasks = getTasks(teamId);
    const normalized = tasks.map(normalizeTask);
    return NextResponse.json({ success: true, tasks: normalized, activities, source: 'local' });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in to create tasks.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, teamId, assignedMembers, status, priority, dueDate } = body;

    if (!title || !teamId) {
      return NextResponse.json(
        { success: false, error: 'Task title and teamId are required' },
        { status: 400 }
      );
    }

    const isCoreAdmin = Boolean(
      session.isCore || session.role === 'admin' || session.teamId === 'core'
    );
    const isDomainLead = Boolean(session.isLead || session.teamId === teamId);

    // Role guard: Core can assign anywhere; Leads can create within their squad; Members can create for their squad
    if (!isCoreAdmin && !isDomainLead && session.teamId !== teamId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only assign tasks for your own subsystem team.' },
        { status: 403 }
      );
    }

    const task = createTask({
      title: title.trim(),
      description: description?.trim() || '',
      teamId: teamId as TeamId,
      assignedMembers: Array.isArray(assignedMembers) ? assignedMembers : [],
      status: (status as TaskStatus) || 'todo',
      priority: (priority as TaskPriority) || 'medium',
      dueDate: dueDate || undefined,
      subtasks: [],
      comments: [],
      estimatedHours: Number(body.estimatedHours || 0),
      actualHours: 0,
      isBlocked: false,
      blockerReason: '',
    });

    // Record creation in activity feed
    try {
      recordActivity({
        type: 'task_created',
        memberName: session.name || 'Leadership',
        teamId: task.teamId,
        title: task.title,
        taskId: task.id,
        detail: `New deliverable created [${task.priority.toUpperCase()}]`,
      });
    } catch {}

    // Sync to Firestore in Cloud
    await saveFirestoreTask(task).catch((err) => {
      console.warn('Firestore task sync notice:', err);
    });

    // Dispatch assignment email notifications to personal Gmails
    dispatchTaskNotifications(task, session.name || 'Leadership');

    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ success: false, error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Task id is required' }, { status: 400 });
    }

    const allTasks = getTasks();
    let existing = allTasks.find((t) => t.id === id);

    if (!existing) {
      const firestoreTasks = await getFirestoreTasks();
      existing = firestoreTasks?.find((t) => t.id === id);
    }

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const isCoreAdmin = Boolean(
      !session || session.isCore || session.role === 'admin' || session.teamId === 'core'
    );
    const sessionName = (session?.name || '').toLowerCase().trim();
    const sessionEmail = (session?.email || '').toLowerCase().trim();

    // Check authorization (Core leadership, squad members, or assigned members)
    const isAssigned = existing.assignedMembers?.some((m) => {
      const norm = m.toLowerCase().trim();
      return (
        norm === sessionName ||
        (sessionName && (norm.includes(sessionName) || sessionName.includes(norm))) ||
        (sessionEmail && norm === sessionEmail)
      );
    });

    if (!isCoreAdmin && session && existing.teamId !== session.teamId && !isAssigned) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You cannot modify tasks outside your subsystem.' },
        { status: 403 }
      );
    }

    const normalized = normalizeTask(existing);
    const patchUpdates: Partial<Task> = { ...updates };
    let activityToRecord: Omit<ActivityEvent, 'id' | 'timestamp'> | null = null;

    // Handle Atomic Actions
    if (action === 'TOGGLE_SUBTASK') {
      const { subtaskId, completed } = body;
      const subtasks = [...(normalized.subtasks || [])];
      const targetIdx = subtasks.findIndex((st) => st.id === subtaskId);
      if (targetIdx !== -1) {
        subtasks[targetIdx] = {
          ...subtasks[targetIdx],
          completed: Boolean(completed),
          completedBy: session?.name || 'Team Member',
          completedAt: Date.now(),
        };
        patchUpdates.subtasks = subtasks;
        activityToRecord = {
          type: 'subtask_toggled',
          memberName: session?.name || 'Team Member',
          teamId: normalized.teamId,
          title: normalized.title,
          taskId: normalized.id,
          detail: `${completed ? 'Completed' : 'Reopened'} "${subtasks[targetIdx].text}"`,
        };
      }
    } else if (action === 'ADD_SUBTASK') {
      const { text } = body;
      if (text?.trim()) {
        const subtasks = [...(normalized.subtasks || [])];
        const newSt = {
          id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          text: text.trim(),
          completed: false,
        };
        subtasks.push(newSt);
        patchUpdates.subtasks = subtasks;
      }
    } else if (action === 'DELETE_SUBTASK') {
      const { subtaskId } = body;
      patchUpdates.subtasks = (normalized.subtasks || []).filter((st) => st.id !== subtaskId);
    } else if (action === 'ADD_COMMENT') {
      const { text } = body;
      if (text?.trim()) {
        const comments = [...(normalized.comments || [])];
        const newComment = {
          id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          authorId: session?.memberId || session?.email || 'member',
          authorName: session?.name || 'Team Member',
          authorTeam: session?.teamId || normalized.teamId,
          text: text.trim(),
          createdAt: Date.now(),
        };
        comments.push(newComment);
        patchUpdates.comments = comments;
        activityToRecord = {
          type: 'comment_added',
          memberName: session?.name || 'Team Member',
          teamId: normalized.teamId,
          title: normalized.title,
          taskId: normalized.id,
          detail: text.trim().slice(0, 80),
        };
      }
    } else if (action === 'SET_BLOCKER') {
      const { isBlocked, blockerReason } = body;
      patchUpdates.isBlocked = Boolean(isBlocked);
      patchUpdates.blockerReason = blockerReason?.trim() || '';
      activityToRecord = {
        type: 'task_blocked',
        memberName: session?.name || 'Team Member',
        teamId: normalized.teamId,
        title: normalized.title,
        taskId: normalized.id,
        detail: isBlocked ? (blockerReason?.trim() || 'Blocker flagged') : 'Blocker cleared',
      };
    } else if (action === 'LOG_HOURS') {
      const { hours } = body;
      const addHours = Number(hours) || 0;
      if (addHours > 0) {
        patchUpdates.actualHours = (normalized.actualHours || 0) + addHours;
        activityToRecord = {
          type: 'hours_logged',
          memberName: session?.name || 'Team Member',
          teamId: normalized.teamId,
          title: normalized.title,
          taskId: normalized.id,
          detail: `Logged +${addHours}h deliverable time`,
        };
      }
    } else if (updates.status && updates.status !== normalized.status) {
      activityToRecord = {
        type: 'task_status',
        memberName: session?.name || 'Team Member',
        teamId: normalized.teamId,
        title: normalized.title,
        taskId: normalized.id,
        detail: `Moved to ${String(updates.status).toUpperCase()}`,
      };
    }

    // 1. Update in local store
    let updated = updateTask(id, patchUpdates);

    // If task was only in Firestore, construct merged task
    if (!updated) {
      updated = {
        ...normalized,
        ...patchUpdates,
        updatedAt: Date.now(),
      };
    }

    // 2. Persist to Firestore
    await saveFirestoreTask(updated).catch((err) => {
      console.warn('Firestore task update sync notice:', err);
    });

    // 3. Record Activity Event if triggered
    if (activityToRecord) {
      try {
        recordActivity(activityToRecord);
      } catch {}
    }

    return NextResponse.json({
      success: true,
      task: normalizeTask(updated),
      activities: getActivities(40),
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ success: false, error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in to delete tasks.' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Task id is required' }, { status: 400 });
    }

    const isCoreAdmin = Boolean(
      session.isCore || session.role === 'admin' || session.teamId === 'core'
    );
    const allTasks = getTasks();
    const existing = allTasks.find((t) => t.id === id);

    if (!existing) {
      const firestoreTasks = await getFirestoreTasks();
      const fsExisting = firestoreTasks?.find((t) => t.id === id);
      if (!fsExisting) {
        return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
      }
      if (!isCoreAdmin && fsExisting.teamId !== session.teamId) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You can only delete tasks belonging to your subsystem team.' },
          { status: 403 }
        );
      }
      await deleteFirestoreTask(id);
      return NextResponse.json({ success: true });
    }

    if (!isCoreAdmin && existing.teamId !== session.teamId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only delete tasks belonging to your subsystem team.' },
        { status: 403 }
      );
    }

    const deleted = deleteTask(id);
    await deleteFirestoreTask(id).catch((err) => {
      console.warn('Firestore task delete sync notice:', err);
    });

    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete task' }, { status: 500 });
  }
}
