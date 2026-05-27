import { ok, badRequest, notFound, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import prisma from '@/lib/prisma';
import { SELL_STATUSES } from '@/lib/constants';
import { SellStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// PATCH /api/sell-applications/[id] — update status
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { id } = await params;
    const body = await req.json();

    if (!SELL_STATUSES.includes(body.status)) {
      return badRequest('Invalid status');
    }

    const app = await prisma.sellApplication.update({
      where: { id },
      data: { status: body.status as SellStatus },
    });

    revalidatePath('/admin/sell-applications');
    return ok({ ...app, createdAt: app.createdAt.toISOString() });
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/sell-applications/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { id } = await params;
    const existing = await prisma.sellApplication.findUnique({ where: { id } });
    if (!existing) return notFound('Application');

    await prisma.sellApplication.delete({ where: { id } });
    revalidatePath('/admin/sell-applications');
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
