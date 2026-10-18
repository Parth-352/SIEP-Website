import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, decodeSession } from './lib/session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected paths
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isLogRoute = pathname.startsWith('/log');
  const isProtectedApi = pathname.startsWith('/api/logs') || pathname.startsWith('/api/tasks');

  if (!isDashboardRoute && !isLogRoute && !isProtectedApi) {
    return NextResponse.next();
  }

  // Retrieve session cookie
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = decodeSession(sessionCookie);

  // 1. If not authenticated:
  if (!session) {
    // For protected API endpoints, return 401 Unauthorized
    if (isProtectedApi) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: You must be logged in to access internal SIEP records.',
        },
        { status: 401 }
      );
    }

    // For protected web pages (/dashboard, /log), redirect to /login immediately
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If trying to access /dashboard but not an Admin / Core team:
  if (isDashboardRoute && session.role !== 'admin' && session.teamId !== 'core') {
    const logUrl = new URL('/log', request.url);
    return NextResponse.redirect(logUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/log/:path*',
    '/api/logs/:path*',
    '/api/tasks/:path*',
  ],
};
