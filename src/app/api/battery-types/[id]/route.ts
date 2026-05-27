import { ok, badRequest, notFound, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// PUT /api/battery-types/[id] — admin only
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { id } = await params;
    const existing = await prisma.batteryType.findUnique({ where: { id } });
    if (!existing) return notFound('Battery type');

    const body = await req.json();
    const name = (body.name as string | undefined)?.trim();
    const isActive = typeof body.isActive === 'boolean' ? body.isActive : existing.isActive;

    if (name && name !== existing.name) {
      const dup = await prisma.batteryType.findUnique({ where: { name } });
      if (dup) return badRequest('A battery type with this name already exists');
    }

    const updated = await prisma.batteryType.update({
      where: { id },
      data: { ...(name ? { name } : {}), isActive },
    });
    revalidatePath('/admin/vehicle-config');
    return ok(updated);
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/battery-types/[id] — admin only; vehicles get batteryTypeId = null via onDelete: SetNull
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { id } = await params;
    const existing = await prisma.batteryType.findUnique({ where: { id } });
    if (!existing) return notFound('Battery type');

    await prisma.batteryType.delete({ where: { id } });
    revalidatePath('/admin/vehicle-config');
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
