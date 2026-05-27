import { ok, badRequest, notFound, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import prisma from '@/lib/prisma';
import { LEAD_STATUSES } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

// PATCH /api/leads/[id] — update status
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { id } = await params;
    const body = await req.json();

    if (!LEAD_STATUSES.includes(body.status)) {
      return badRequest('Invalid status');
    }

    const lead = await prisma.lead.update({
      where: { id },
      data: { status: body.status },
    });

    revalidatePath('/admin/leads');
    return ok({ ...lead, createdAt: lead.createdAt.toISOString() });
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/leads/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { id } = await params;
    const existing = await prisma.lead.findUnique({ where: { id } });
    if (!existing) return notFound('Lead');

    await prisma.lead.delete({ where: { id } });
    revalidatePath('/admin/leads');
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
