import { ok, badRequest, notFound, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// PUT /api/faqs/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { id } = await params;
    const existing = await prisma.faq.findUnique({ where: { id } });
    if (!existing) return notFound('FAQ');

    const body = await req.json();
    const question = body.question?.trim();
    const answer = body.answer?.trim();
    if (!question) return badRequest('Question is required');
    if (!answer) return badRequest('Answer is required');

    const isActive = typeof body.isActive === 'boolean' ? body.isActive : existing.isActive;
    const requestedOrder =
      typeof body.order === 'number' && Number.isFinite(body.order)
        ? Math.trunc(body.order)
        : null;

    const totalOthers = await prisma.faq.count({ where: { id: { not: id } } });
    const newOrder =
      requestedOrder !== null && requestedOrder >= 1
        ? Math.min(requestedOrder, totalOthers + 1)
        : existing.sortOrder;

    const faq = await prisma.$transaction(async (tx) => {
      const old = existing.sortOrder;
      if (newOrder !== old) {
        if (newOrder > old) {
          await tx.faq.updateMany({
            where: { sortOrder: { gt: old, lte: newOrder }, id: { not: id } },
            data: { sortOrder: { decrement: 1 } },
          });
        } else {
          await tx.faq.updateMany({
            where: { sortOrder: { gte: newOrder, lt: old }, id: { not: id } },
            data: { sortOrder: { increment: 1 } },
          });
        }
      }
      return tx.faq.update({
        where: { id },
        data: { question, answer, isActive, sortOrder: newOrder },
      });
    });

    revalidatePath('/');
    revalidatePath('/admin/faqs');
    return ok({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      order: faq.sortOrder,
      isActive: faq.isActive,
      createdAt: faq.createdAt.toISOString(),
      updatedAt: faq.updatedAt.toISOString(),
    });
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/faqs/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { id } = await params;
    const faq = await prisma.faq.findUnique({ where: { id } });
    if (!faq) return notFound('FAQ');

    await prisma.$transaction(async (tx) => {
      await tx.faq.delete({ where: { id } });
      await tx.faq.updateMany({
        where: { sortOrder: { gt: faq.sortOrder } },
        data: { sortOrder: { decrement: 1 } },
      });
    });

    revalidatePath('/');
    revalidatePath('/admin/faqs');
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
