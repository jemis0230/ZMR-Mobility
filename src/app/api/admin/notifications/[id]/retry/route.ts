import { revalidatePath } from 'next/cache';
import { ok, badRequest, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import { retryNotification } from '@/lib/notifications/outbox';

// POST /api/admin/notifications/[id]/retry — staff only. Re-sends a failed or
// not-configured lead notification now (recipients that already got it are skipped).
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await withSession();
  if (isResponse(session)) return session;
  try {
    const { id } = await params;
    const res = await retryNotification(id);
    if (!res.retried) return badRequest(res.reason);
    revalidatePath('/admin/leads');
    revalidatePath('/admin/sell-applications');
    revalidatePath('/admin');
    return ok(res);
  } catch (error) {
    return serverError(error);
  }
}
