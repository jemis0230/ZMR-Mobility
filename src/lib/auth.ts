import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin';
  /** AdminUser.sessionVersion when the session was issued. */
  sv: number;
};

const COOKIE_NAME = 'zmr-admin-session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const BCRYPT_COST = 12;

// Dummy hash used for timing-safe login rejection when user not found
const DUMMY_HASH = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/DmB9YEq';

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET env variable is not set');
  return new TextEncoder().encode(secret);
}

// ── Password helpers (Node.js runtime only — never import these in middleware) ──

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function getDummyHash(): string {
  return DUMMY_HASH;
}

// ── JWT helpers (Edge-safe via jose) ──

export async function signJWT(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyJWT(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

// ── Cookie / session helpers (Server Actions + Server Components only) ──

export async function createSession(payload: SessionPayload): Promise<void> {
  const token = await signJWT(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  });
}

/** Sign out: end every session of this account (bump its version) and clear the cookie. */
export async function destroySession(): Promise<void> {
  const session = await getSession();
  if (session) await revokeSessions(session.userId);
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Invalidate all existing sessions of a user (sign-out, password change, deactivation). */
export async function revokeSessions(userId: string): Promise<number> {
  const u = await prisma.adminUser.update({ where: { id: userId }, data: { sessionVersion: { increment: 1 } }, select: { sessionVersion: true } });
  return u.sessionVersion;
}

/**
 * The signed-in staff member, or null. The token signature is checked and then the
 * account itself: it must still exist, be active and have the same session version,
 * so sign-out, password changes and deactivation take effect immediately.
 * Cached per request.
 */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifyJWT(token);
  if (!payload?.userId) return null;
  const user = await prisma.adminUser.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, isActive: true, sessionVersion: true },
  });
  if (!user || !user.isActive || user.sessionVersion !== (payload.sv ?? 0)) return null;
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role === 'SUPER_ADMIN' ? 'superadmin' : 'admin',
    sv: user.sessionVersion,
  };
});

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect('/admin/login');
  return session;
}

export async function requireSuperAdmin(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role !== 'superadmin') redirect('/admin');
  return session;
}

export { COOKIE_NAME };

/**
 * For server actions that change data. Server actions can be called by anyone who
 * knows their ID, so each write must check the session itself (the /admin middleware
 * only protects page requests under /admin).
 */
export async function assertStaff(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw new Error('Not authorised. Please sign in again.');
  return session;
}
