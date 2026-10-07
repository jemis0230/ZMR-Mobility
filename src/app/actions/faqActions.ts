'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { POLICY_TOPICS, isPolicyTopic, type PolicyItem } from '@/lib/policies';

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  topic: string | null;
  createdAt: string;
  updatedAt: string;
};

function toFaqItem(row: { id: string; question: string; answer: string; sortOrder: number; isActive: boolean; topic: string | null; createdAt: Date; updatedAt: Date }): FaqItem {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    order: row.sortOrder,
    isActive: row.isActive,
    topic: row.topic,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function parseFaqFormData(formData: FormData): { question: string; answer: string; requestedOrder: number | null } | { error: string } {
  const question = (formData.get('question') as string ?? '').trim();
  const answer = (formData.get('answer') as string ?? '').trim();
  const orderRaw = formData.get('order');
  const requestedOrder =
    typeof orderRaw === 'string' && orderRaw.trim() !== '' && Number.isFinite(Number(orderRaw))
      ? Math.trunc(Number(orderRaw))
      : null;

  if (!question) return { error: 'Question is required.' };
  if (!answer) return { error: 'Answer is required.' };
  return { question, answer, requestedOrder };
}

export async function getFaqs() {
  try {
    const faqs = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return { success: true, data: faqs.map(toFaqItem) };
  } catch (error) {
    console.error('Get FAQs error:', error);
    return { success: false, error: 'Failed to get FAQs' };
  }
}

/**
 * Policy items for the "Warranty & Ownership Support" section: the first active
 * FAQ published for each policy topic, otherwise the neutral default wording.
 */
export async function getPolicyItems(): Promise<PolicyItem[]> {
  let rows: { topic: string | null; question: string; answer: string }[] = [];
  try {
    rows = await prisma.faq.findMany({
      where: { isActive: true, topic: { not: null } },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      select: { topic: true, question: true, answer: true },
    });
  } catch (error) {
    console.error('Get policy items error:', error);
  }
  return POLICY_TOPICS.map((t) => {
    const row = rows.find((r) => isPolicyTopic(r.topic) && r.topic === t.key);
    return row
      ? { key: t.key, title: t.title, question: row.question, answer: row.answer, confirmed: true }
      : { key: t.key, title: t.title, question: t.question, answer: t.defaultAnswer, confirmed: false };
  });
}

export async function getAllFaqsAdmin() {
  try {
    const faqs = await prisma.faq.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return { success: true, data: faqs.map(toFaqItem) };
  } catch (error) {
    console.error('Get all FAQs (admin) error:', error);
    return { success: false, error: 'Failed to get FAQs' };
  }
}

export async function createFaq(formData: FormData) {
  try {
    const parsed = parseFaqFormData(formData);
    if ('error' in parsed) return { success: false, error: parsed.error };

    const count = await prisma.faq.count();
    const sortOrder =
      parsed.requestedOrder !== null && parsed.requestedOrder >= 1
        ? Math.min(parsed.requestedOrder, count + 1)
        : count + 1;

    await prisma.$transaction(async (tx) => {
      // Shift items that are at or after the insert position
      await tx.faq.updateMany({
        where: { sortOrder: { gte: sortOrder } },
        data: { sortOrder: { increment: 1 } },
      });
      await tx.faq.create({
        data: { question: parsed.question, answer: parsed.answer, sortOrder },
      });
    });

    revalidatePath('/');
    revalidatePath('/admin/faqs');
    return { success: true };
  } catch (error) {
    console.error('Create FAQ error:', error);
    return { success: false, error: 'Failed to create FAQ' };
  }
}

export async function updateFaq(id: string, formData: FormData) {
  try {
    const parsed = parseFaqFormData(formData);
    if ('error' in parsed) return { success: false, error: parsed.error };

    const isActive = formData.get('isActive') === 'on';

    const existing = await prisma.faq.findUnique({ where: { id } });
    if (!existing) return { success: false, error: 'FAQ not found' };

    const totalOthers = await prisma.faq.count({ where: { id: { not: id } } });
    const newOrder =
      parsed.requestedOrder !== null && parsed.requestedOrder >= 1
        ? Math.min(parsed.requestedOrder, totalOthers + 1)
        : existing.sortOrder;

    await prisma.$transaction(async (tx) => {
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
      await tx.faq.update({
        where: { id },
        data: { question: parsed.question, answer: parsed.answer, isActive, sortOrder: newOrder },
      });
    });

    revalidatePath('/');
    revalidatePath('/admin/faqs');
    return { success: true };
  } catch (error) {
    console.error('Update FAQ error:', error);
    return { success: false, error: 'Failed to update FAQ' };
  }
}

export async function deleteFaq(id: string) {
  try {
    const faq = await prisma.faq.findUnique({ where: { id } });
    if (!faq) return { success: false, error: 'FAQ not found' };

    await prisma.$transaction(async (tx) => {
      await tx.faq.delete({ where: { id } });
      await tx.faq.updateMany({
        where: { sortOrder: { gt: faq.sortOrder } },
        data: { sortOrder: { decrement: 1 } },
      });
    });

    revalidatePath('/');
    revalidatePath('/admin/faqs');
    return { success: true };
  } catch (error) {
    console.error('Delete FAQ error:', error);
    return { success: false, error: 'Failed to delete FAQ' };
  }
}
