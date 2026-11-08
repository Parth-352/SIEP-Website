import { NextRequest, NextResponse } from 'next/server';
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/store';
import { 
  getFirestoreTasks, 
  saveFirestoreTask, 
  deleteFirestoreTask 
} from '@/lib/firestoreService';
import { TeamId, TaskStatus, TaskPriority } from '@/lib/types';
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/session';

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

    // Role guard: Only Core Leadership can assign to any team; subsystem squads can create tasks for their own squad
    if (session.teamId !== 'core' && teamId !== session.teamId) {
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
    if (!existing) {
      // Also try fetching from Firestore directly
      const firestoreTasks = await getFirestoreTasks();
      const fsExisting = firestoreTasks?.find((t) => t.id === id);
      if (!fsExisting) {
        return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
      }
      if (session.teamId !== 'core' && fsExisting.teamId !== session.teamId) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You can only modify tasks belonging to your subsystem team.' },
          { status: 403 }
        );
      }
      const updatedFs = {
        ...fsExisting,
        ...updates,
        updatedAt: Date.now(),
      };
      await saveFirestoreTask(updatedFs).catch(() => {});
      return NextResponse.json({ success: true, task: updatedFs });
    }

    // Role guard: Only Core Leadership can modify any task; subsystem squads can modify their own team's tasks
    if (session.teamId !== 'core' && existing.teamId !== session.teamId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only modify tasks belonging to your subsystem team.' },
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

    const allTasks = getTasks();
    const existing = allTasks.find((t) => t.id === id);
    if (!existing) {
      // Check firestore too
      const firestoreTasks = await getFirestoreTasks();
      const fsExisting = firestoreTasks?.find((t) => t.id === id);
      if (!fsExisting) {
        return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
      }
      if (session.teamId !== 'core' && fsExisting.teamId !== session.teamId) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: You can only delete tasks belonging to your subsystem team.' },
          { status: 403 }
        );
      }
      await deleteFirestoreTask(id);
      return NextResponse.json({ success: true });
    }

    // Role guard: Only Core Leadership can delete any task; subsystem squads can delete their own team's tasks
    if (session.teamId !== 'core' && existing.teamId !== session.teamId) {
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
