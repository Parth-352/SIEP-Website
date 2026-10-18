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
    let teamId = searchParams.get('teamId') || undefined;

    // Non-admin teams only see tasks for their team
    if (session.role !== 'admin' && session.teamId !== 'core') {
      teamId = session.teamId;
    }

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

    if (!session || (session.role !== 'admin' && session.teamId !== 'core')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only Core / Admin can assign new project tasks.' },
        { status: 403 }
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

    const task = createTask({
      title,
      description: description || '',
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

    const updated = updateTask(id, updates);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
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

    if (!session || (session.role !== 'admin' && session.teamId !== 'core')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only Core / Admin can delete tasks.' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Task id is required' }, { status: 400 });
    }

    const deleted = deleteTask(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete task' }, { status: 500 });
  }
}
