import { ok, created, badRequest, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// GET /api/faqs?admin=true
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const admin = searchParams.get('admin') === 'true';

    const faqs = await prisma.faq.findMany({
      where: admin ? undefined : { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return ok(
      faqs.map((f) => ({
        id: f.id,
        question: f.question,
        answer: f.answer,
        order: f.sortOrder,
        isActive: f.isActive,
        createdAt: f.createdAt.toISOString(),
        updatedAt: f.updatedAt.toISOString(),
      }))
    );
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/faqs
export async function POST(req: Request) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const body = await req.json();
    const question = body.question?.trim();
    const answer = body.answer?.trim();
    if (!question) return badRequest('Question is required');
    if (!answer) return badRequest('Answer is required');

    const requestedOrder =
      typeof body.order === 'number' && Number.isFinite(body.order)
        ? Math.trunc(body.order)
        : null;

    const count = await prisma.faq.count();
    const sortOrder =
      requestedOrder !== null && requestedOrder >= 1
        ? Math.min(requestedOrder, count + 1)
        : count + 1;

    const faq = await prisma.$transaction(async (tx) => {
      await tx.faq.updateMany({
        where: { sortOrder: { gte: sortOrder } },
        data: { sortOrder: { increment: 1 } },
      });
      return tx.faq.create({ data: { question, answer, sortOrder } });
    });

    revalidatePath('/');
    revalidatePath('/admin/faqs');
    return created({
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
