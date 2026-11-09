import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, decodeSession } from './lib/session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Separation mode: If deployed as standalone log portal, redirect public pages to login
  const isPortalOnly = process.env.NEXT_PUBLIC_PORTAL_ONLY === 'true';
  const isPublicPage = ['/', '/about', '/bike', '/competition', '/contact'].some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  );

  if (isPortalOnly && isPublicPage) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

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

  // 2. Strict Role Enforcement for Engineering Log System (/log):
  // Exclusively accessible to Tier 1 (Core Leadership) and Tier 2 (Domain Leads).
  // Blocked for Tier 3 (Team Members) — redirected to /dashboard.
  if (isLogRoute) {
    const isPrivileged = Boolean(
      session.isCore || session.isLead || session.role === 'admin' || session.teamId === 'core'
    );
    if (!isPrivileged) {
      const dashUrl = new URL('/dashboard', request.url);
      dashUrl.searchParams.set('restricted', 'log');
      return NextResponse.redirect(dashUrl);
    }
  }

  // Authenticated sessions have access to internal portal routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/log/:path*',
    '/api/logs/:path*',
    '/api/tasks/:path*',
    '/',
    '/about/:path*',
    '/bike/:path*',
    '/competition/:path*',
    '/contact/:path*',
  ],
};
