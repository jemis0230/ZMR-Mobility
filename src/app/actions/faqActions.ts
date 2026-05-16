'use server';

import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import { type Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';

type RawFaqRow = {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean | number;
  createdAt: string | Date;
  updatedAt: string | Date;
};

type FaqInput = {
  question: string;
  answer: string;
  requestedOrder: number | null;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

function normalizeFaq(row: RawFaqRow): FaqItem {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    order: Number(row.order) || 0,
    isActive: Boolean(row.isActive),
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  };
}

function parseFaqFormData(formData: FormData): FaqInput | { error: string } {
  const questionValue = formData.get('question');
  const answerValue = formData.get('answer');
  const orderValue = formData.get('order');

  const question = typeof questionValue === 'string' ? questionValue.trim() : '';
  const answer = typeof answerValue === 'string' ? answerValue.trim() : '';
  const requestedOrder =
    typeof orderValue === 'string' && orderValue.trim() !== ''
      ? Number(orderValue)
      : null;

  if (!question) {
    return { error: 'Question is required.' };
  }

  if (!answer) {
    return { error: 'Answer is required.' };
  }

  return {
    question,
    answer,
    requestedOrder:
      requestedOrder !== null && Number.isFinite(requestedOrder)
        ? Math.trunc(requestedOrder)
        : null,
  };
}

function normalizeRequestedOrder(
  requestedOrder: number | null,
  totalItems: number
) {
  if (requestedOrder === null || requestedOrder < 1) {
    return totalItems + 1;
  }

  return Math.min(requestedOrder, totalItems + 1);
}

async function getOrderedFaqRows(tx: Prisma.TransactionClient) {
  return tx.$queryRaw<RawFaqRow[]>`
    SELECT "id", "question", "answer", "order", "isActive", "createdAt", "updatedAt"
    FROM "Faq"
    ORDER BY "order" ASC, "createdAt" ASC, "id" ASC
  `;
}

async function persistFaqOrder(
  tx: Prisma.TransactionClient,
  faqIdsInOrder: string[]
) {
  for (let index = 0; index < faqIdsInOrder.length; index += 1) {
    const faqId = faqIdsInOrder[index];
    await tx.$executeRaw`
      UPDATE "Faq"
      SET "order" = ${index + 1}
      WHERE "id" = ${faqId}
    `;
  }
}

export async function getFaqs() {
  try {
    const faqs = await prisma.$queryRaw<RawFaqRow[]>`
      SELECT "id", "question", "answer", "order", "isActive", "createdAt", "updatedAt"
      FROM "Faq"
      WHERE "isActive" = true
      ORDER BY "order" ASC, "createdAt" DESC
    `;

    return { success: true, data: faqs.map(normalizeFaq) };
  } catch (error) {
    console.error('Get FAQs error:', error);
    return { success: false, error: 'Failed to get FAQs' };
  }
}

export async function createFaq(formData: FormData) {
  try {
    const parsed = parseFaqFormData(formData);

    if ('error' in parsed) {
      return { success: false, error: parsed.error };
    }

    const now = new Date().toISOString();
    const newFaqId = randomUUID();

    await prisma.$transaction(async (tx) => {
      const existingFaqs = await getOrderedFaqRows(tx);
      const insertAt = normalizeRequestedOrder(
        parsed.requestedOrder,
        existingFaqs.length
      );

      const orderedFaqIds = existingFaqs.map((faq) => faq.id);
      orderedFaqIds.splice(insertAt - 1, 0, newFaqId);

      await tx.$executeRaw`
        INSERT INTO "Faq" ("id", "question", "answer", "order", "isActive", "createdAt", "updatedAt")
        VALUES (${newFaqId}, ${parsed.question}, ${parsed.answer}, ${insertAt}, ${1}, ${now}, ${now})
      `;

      await persistFaqOrder(tx, orderedFaqIds);
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

    if ('error' in parsed) {
      return { success: false, error: parsed.error };
    }

    const isActive = formData.get('isActive') === 'on';

    await prisma.$transaction(async (tx) => {
      const existingFaqs = await getOrderedFaqRows(tx);
      const currentFaq = existingFaqs.find((faq) => faq.id === id);

      if (!currentFaq) {
        throw new Error('FAQ not found');
      }

      const remainingFaqIds = existingFaqs
        .filter((faq) => faq.id !== id)
        .map((faq) => faq.id);
      const insertAt = normalizeRequestedOrder(
        parsed.requestedOrder,
        remainingFaqIds.length
      );

      remainingFaqIds.splice(insertAt - 1, 0, id);

      await tx.$executeRaw`
        UPDATE "Faq"
        SET
          "question" = ${parsed.question},
          "answer" = ${parsed.answer},
          "isActive" = ${isActive ? 1 : 0},
          "updatedAt" = ${new Date().toISOString()}
        WHERE "id" = ${id}
      `;

      await persistFaqOrder(tx, remainingFaqIds);
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
    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        DELETE FROM "Faq"
        WHERE "id" = ${id}
      `;

      const remainingFaqs = await getOrderedFaqRows(tx);
      await persistFaqOrder(
        tx,
        remainingFaqs.map((faq) => faq.id)
      );
    });

    revalidatePath('/admin/faqs');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Delete FAQ error:', error);
    return { success: false, error: 'Failed to delete FAQ' };
  }
}

export async function getAllFaqsAdmin() {
  try {
    const faqs = await prisma.$queryRaw<RawFaqRow[]>`
      SELECT "id", "question", "answer", "order", "isActive", "createdAt", "updatedAt"
      FROM "Faq"
      ORDER BY "order" ASC, "createdAt" DESC
    `;

    return { success: true, data: faqs.map(normalizeFaq) };
  } catch (error) {
    console.error('Get all FAQs (admin) error:', error);
    return { success: false, error: 'Failed to get FAQs' };
  }
}
