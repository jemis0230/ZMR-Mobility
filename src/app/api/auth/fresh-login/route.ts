import { NextResponse } from 'next/server';
import { COOKIE_NAME, endCurrentSession } from '@/lib/auth';
import { isSameOrigin } from '@/app/api/_lib/origin';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store, max-age=0' };

// POST /api/auth/fresh-login — the More → Admin entry on the public site.
//
// Ends this browser's admin session (only this one; other devices and staff stay
// signed in) and sends the visitor to the login page, so the dashboard always needs
// a fresh email and password from that menu. POST only, same-origin only: a link,
// prefetch or another site cannot trigger it.
export async function POST(req: Request) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ success: false, error: 'Request refused.' }, { status: 403, headers: NO_STORE });
  }

  let failed = false;
  try {
    await endCurrentSession();
  } catch (e) {
    // The cookie is removed regardless, so this browser cannot continue into the dashboard.
    failed = true;
    console.error('[fresh-login] could not end the session:', e instanceof Error ? e.name : 'unknown error');
  }

  const res = new NextResponse(null, {
    status: 303, // follow with GET
    headers: { ...NO_STORE, Location: failed ? '/admin/login?signout=failed' : '/admin/login' },
  });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
