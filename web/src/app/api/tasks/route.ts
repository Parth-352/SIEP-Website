import { NextRequest, NextResponse } from 'next/server';
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/store';
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

    const tasks = getTasks(teamId);
    return NextResponse.json({ success: true, tasks });
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

    // Role guard: Core/Admin can assign to any team; subsystem teams can create tasks for their own squad
    if (session.role !== 'admin' && session.teamId !== 'core' && teamId !== session.teamId) {
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
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    // Role guard: Core/Admin can modify any task; subsystem teams can modify their own team's tasks
    if (session.role !== 'admin' && session.teamId !== 'core' && existing.teamId !== session.teamId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only modify tasks belonging to your subsystem team.' },
        { status: 403 }
      );
    }

    const updated = updateTask(id, updates);
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
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    // Role guard: Core/Admin can delete any task; subsystem teams can delete their own team's tasks
    if (session.role !== 'admin' && session.teamId !== 'core' && existing.teamId !== session.teamId) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You can only delete tasks belonging to your subsystem team.' },
        { status: 403 }
      );
    }

    const deleted = deleteTask(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete task' }, { status: 500 });
  }
}
