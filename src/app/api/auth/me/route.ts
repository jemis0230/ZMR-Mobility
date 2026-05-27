import { ok } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';

export async function GET() {
  const session = await withSession();
  if (isResponse(session)) return session;
  return ok(session);
}
