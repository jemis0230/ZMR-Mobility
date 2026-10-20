import { ok, badRequest, serverError } from '@/app/api/_lib/response';
import { verifyPassword, getDummyHash, createSession } from '@/lib/auth';
import { consume, isLimited, resetLimit, clientIp } from '@/lib/rateLimit';
import prisma from '@/lib/prisma';

// Failed sign-ins allowed per account and per IP address in 15 minutes.
const WINDOW_SEC = 15 * 60;
const PER_ACCOUNT = 5;
const PER_IP = 20;

const INVALID = 'Incorrect email or password.';

function tooMany(retryAfterSec: number) {
  const minutes = Math.max(1, Math.ceil(retryAfterSec / 60));
  return Response.json(
    { success: false, error: `Too many sign-in attempts. Please wait ${minutes} minute${minutes === 1 ? '' : 's'} and try again.` },
    { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
  );
}

// POST /api/auth/login
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!email || !password) return badRequest('Enter your email and password.');

    const ip = clientIp(req.headers);
    const accountKey = { key: `login:acct:${email}`, limit: PER_ACCOUNT, windowSec: WINDOW_SEC };
    const ipKey = { key: `login:ip:${ip}`, limit: PER_IP, windowSec: WINDOW_SEC };
    for (const k of [accountKey, ipKey]) {
      const s = await isLimited(k);
      if (s.limited) return tooMany(s.retryAfterSec);
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    // Always run bcrypt so response time does not reveal whether the account exists.
    const valid = await verifyPassword(password, user?.passwordHash ?? getDummyHash());

    if (!user || !valid || !user.isActive) {
      await consume(accountKey);
      await consume(ipKey);
      // 401 with a sign-in specific message (the generic API text "Authentication
      // required" made a wrong password look like a broken login).
      return Response.json({ success: false, error: INVALID }, { status: 401 });
    }

    await resetLimit(accountKey.key);
    await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const role = user.role === 'SUPER_ADMIN' ? ('superadmin' as const) : ('admin' as const);
    await createSession({ userId: user.id, email: user.email, name: user.name, role, sv: user.sessionVersion });

    return ok({ user: { id: user.id, email: user.email, name: user.name, role } });
  } catch (error) {
    return serverError(error);
  }
}
