import { NextRequest, NextResponse } from 'next/server';
import { getTasks, createTask, updateTask, deleteTask, addNotification } from '@/lib/store';
import { 
  getFirestoreTasks, 
  saveFirestoreTask, 
  deleteFirestoreTask 
} from '@/lib/firestoreService';
import { TeamId, TaskStatus, TaskPriority, Task } from '@/lib/types';
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/session';
import { getMemberByName } from '@/lib/members';

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
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in to view project tasks.' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const teamId = searchParams.get('teamId') || undefined;

    // 1. Try Firestore cloud storage first
    const firestoreTasks = await getFirestoreTasks(teamId);
    if (firestoreTasks !== null) {
      return NextResponse.json({ success: true, tasks: firestoreTasks, source: 'firestore' });
    }

    // 2. Fallback to local store
    const tasks = getTasks(teamId);
    return NextResponse.json({ success: true, tasks, source: 'local' });
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
    });

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

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Please log in to update tasks.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Task id is required' }, { status: 400 });
    }

    const allTasks = getTasks();
    const existing = allTasks.find((t) => t.id === id);
    const isCoreAdmin = Boolean(
      session.isCore || session.role === 'admin' || session.teamId === 'core'
    );

    if (!existing) {
      // Also try fetching from Firestore directly
      const firestoreTasks = await getFirestoreTasks();
      const fsExisting = firestoreTasks?.find((t) => t.id === id);
      if (!fsExisting) {
        return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
      }

      // Check authorization
      const isAssigned = fsExisting.assignedMembers?.some(
        (m) => m.toLowerCase() === session.name.toLowerCase()
      );
      if (!isCoreAdmin && fsExisting.teamId !== session.teamId && !isAssigned) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You cannot modify tasks outside your subsystem.' },
          { status: 403 }
        );
      }

      const updatedFs: Task = {
        ...fsExisting,
        ...updates,
        updatedAt: Date.now(),
      };
      await saveFirestoreTask(updatedFs).catch(() => {});
      return NextResponse.json({ success: true, task: updatedFs });
    }

    // Check authorization
    const isAssigned = existing.assignedMembers?.some(
      (m) => m.toLowerCase() === session.name.toLowerCase()
    );
    if (!isCoreAdmin && existing.teamId !== session.teamId && !isAssigned) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You cannot modify tasks outside your subsystem.' },
        { status: 403 }
      );
    }

    const updated = updateTask(id, updates);
    if (updated) {
      await saveFirestoreTask(updated).catch((err) => {
        console.warn('Firestore task update sync notice:', err);
      });
    }

    return NextResponse.json({ success: true, task: updated });
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
