import { cookies } from 'next/headers';
import { verifyJWT, COOKIE_NAME, type SessionPayload } from '@/lib/auth';
import { unauthorized, forbidden } from './response';

async function getSessionFromRequest(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyJWT(token);
}

// Returns session or a 401 Response
export async function withSession(): Promise<SessionPayload | Response> {
  const session = await getSessionFromRequest();
  if (!session) return unauthorized();
  return session;
}

// Returns session or a 401/403 Response
export async function withSuperAdmin(): Promise<SessionPayload | Response> {
  const session = await getSessionFromRequest();
  if (!session) return unauthorized();
  if (session.role !== 'superadmin') return forbidden();
  return session;
}

export function isResponse(v: unknown): v is Response {
  return v instanceof Response;
}
