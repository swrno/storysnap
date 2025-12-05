import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // This is a client-side route protection
  // The actual auth check happens in the client components
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/create-story/:path*',
    '/admin/:path*',
    '/profile/:path*',
  ],
};
