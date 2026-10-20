import { getSession, type SessionPayload } from '@/lib/auth';
import { unauthorized, forbidden } from './response';

// Same check as pages and server actions: valid token AND an active account whose
// session version still matches.
const getSessionFromRequest = (): Promise<SessionPayload | null> => getSession();

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
