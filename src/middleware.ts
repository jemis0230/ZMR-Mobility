import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'zmr-admin-session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  // Send staff back to the page they asked for after signing in.
  const loginUrl = new URL('/admin/login', request.url);
  if (request.method === 'GET') loginUrl.searchParams.set('next', pathname + request.nextUrl.search);

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  // Signature/expiry only; the account itself (active, session version) is checked by
  // getSession() in the admin layout, API routes and server actions.
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
