import { ok, badRequest, notFound, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { parsePressInput, toPressDTO } from '@/lib/press';

// PUT /api/press/[id] — admin only
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;
    const { id } = await params;

    const existing = await prisma.pressMention.findUnique({ where: { id } });
    if (!existing) return notFound('Press mention');

    const parsed = parsePressInput(await req.json());
    if ('error' in parsed) return badRequest(parsed.error);

    const row = await prisma.pressMention.update({
      where: { id },
      data: { ...parsed, publishedAt: parsed.publishedAt ? new Date(parsed.publishedAt) : null },
    });
    revalidatePath('/press');
    revalidatePath('/admin/press');
    return ok(toPressDTO(row));
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/press/[id] — admin only
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;
    const { id } = await params;

    const existing = await prisma.pressMention.findUnique({ where: { id } });
    if (!existing) return notFound('Press mention');

    await prisma.pressMention.delete({ where: { id } });
    revalidatePath('/press');
    revalidatePath('/admin/press');
    return ok({ id });
  } catch (error) {
    return serverError(error);
  }
}
