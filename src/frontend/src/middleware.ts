import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for token in cookies (Next.js middleware can't access localStorage,
  // so we also check for the cookie that could be set)
  // For this implementation, we rely on client-side AuthProvider for protection.
  // Middleware provides an extra layer for SSR-rendered pages.

  // If path starts with /dashboard, check for auth
  if (pathname.startsWith('/dashboard')) {
    // Middleware can't access localStorage, so we skip server-side token checks.
    // The AuthProvider handles client-side redirect.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};
