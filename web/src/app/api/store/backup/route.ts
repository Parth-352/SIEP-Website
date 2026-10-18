import { NextRequest, NextResponse } from 'next/server';
import { exportStore, importStore, resetStore } from '@/lib/store';
import { SESSION_COOKIE_NAME, decodeSession } from '@/lib/session';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session || (session.role !== 'admin' && session.teamId !== 'core')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only administrators can export project database backups.' },
        { status: 403 }
      );
    }

    const store = exportStore();
    return NextResponse.json({
      success: true,
      data: store,
      exportedAt: new Date().toISOString(),
      stats: {
        totalLogs: store.logs?.length || 0,
        totalTasks: store.tasks?.length || 0,
        totalInquiries: store.inquiries?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error exporting store backup:', error);
    return NextResponse.json({ success: false, error: 'Failed to export store backup' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = decodeSession(sessionCookie);

    if (!session || (session.role !== 'admin' && session.teamId !== 'core')) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Only administrators can modify database store states.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const action = body.action || 'import';

    if (action === 'reset') {
      const resetData = resetStore();
      return NextResponse.json({
        success: true,
        message: 'Database store successfully reset to official seed defaults.',
        data: resetData,
      });
    }

    if (action === 'import') {
      const data = body.data;
      if (!data || typeof data !== 'object') {
        return NextResponse.json({ success: false, error: 'Invalid backup data provided' }, { status: 400 });
      }

      const ok = importStore(data);
      if (!ok) {
        return NextResponse.json({ success: false, error: 'Failed to import backup data' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Database store backup successfully imported.',
        stats: {
          totalLogs: data.logs?.length || 0,
          totalTasks: data.tasks?.length || 0,
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error in store backup POST:', error);
    return NextResponse.json({ success: false, error: 'Failed to process store request' }, { status: 500 });
  }
}
