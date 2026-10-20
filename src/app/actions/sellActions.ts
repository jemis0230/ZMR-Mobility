'use server';

import { assertStaff } from '@/lib/auth';
import type { LeadNotificationItem } from './leadActions';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { SELL_STATUSES } from '@/lib/constants';
import { SellStatus } from '@prisma/client';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type SellApplicationItem = {
  id: string;
  applicationId: string;
  category: string;
  sellerType: string;
  brandName: string;
  modelName: string;
  year: number;
  ownership: string;
  batteryCondition: string;
  vehicleCondition: string;
  hasAccident: boolean;
  loanStatus: string;
  documents: string[];
  expectedPriceRs: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactCity: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  notifications: LeadNotificationItem[];
};

export type WizardFormData = {
  category: string;
  sellerType: string;
  brandId: string;
  brandName: string;
  modelId: string;
  modelName: string;
  year: number;
  ownership: string;
  batteryCondition: string;
  vehicleCondition: string;
  hasAccident: boolean;
  loanStatus: string;
  documents: string[];
  expectedPrice: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactCity: string;
};

const SELL_PAGE_SIZE = 15;

// ─────────────────────────────────────────────────────────────
// Submit sell application (from wizard)
// ─────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────
// Get paginated applications for admin
// ─────────────────────────────────────────────────────────────

export async function getSellApplications(params: {
  search?: string;
  statusFilter?: string;
  page?: number;
}): Promise<{
  success: boolean;
  data?: SellApplicationItem[];
  total?: number;
  page?: number;
  pageCount?: number;
  error?: string;
}> {
  await assertStaff();
  try {
    const page = Math.max(1, params.page ?? 1);
    const where: Record<string, unknown> = {};

    if (params.statusFilter && params.statusFilter !== 'ALL') {
      where.status = params.statusFilter;
    }

    if (params.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { contactName: { contains: q } },
        { contactPhone: { contains: q } },
        { contactEmail: { contains: q } },
        { applicationId: { contains: q } },
        { brandName: { contains: q } },
        { modelName: { contains: q } },
        { contactCity: { contains: q } },
      ];
    }

    const [total, apps] = await prisma.$transaction([
      prisma.sellApplication.count({ where }),
      prisma.sellApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * SELL_PAGE_SIZE,
        take: SELL_PAGE_SIZE,
        include: {
          notifications: {
            select: { id: true, channel: true, status: true, attempts: true, lastError: true, updatedAt: true },
            orderBy: { channel: 'asc' },
          },
        },
      }),
    ]);

    return {
      success: true,
      data: apps.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
        notifications: a.notifications.map((n) => ({ ...n, updatedAt: n.updatedAt.toISOString() })),
      })),
      total,
      page,
      pageCount: Math.ceil(total / SELL_PAGE_SIZE),
    };
  } catch (error) {
    console.error('getSellApplications error:', error);
    return { success: false, error: 'Failed to load applications.' };
  }
}

// ─────────────────────────────────────────────────────────────
// Update status
// ─────────────────────────────────────────────────────────────

export async function updateSellApplicationStatus(id: string, status: string): Promise<{
  success: boolean;
  error?: string;
}> {
  await assertStaff();
  if (!SELL_STATUSES.includes(status as (typeof SELL_STATUSES)[number])) {
    return { success: false, error: 'Invalid status.' };
  }
  try {
    await prisma.sellApplication.update({ where: { id }, data: { status: status as SellStatus } });
    revalidatePath('/admin/sell-applications');
    return { success: true };
  } catch (error) {
    console.error('updateSellApplicationStatus error:', error);
    return { success: false, error: 'Failed to update status.' };
  }
}

// ─────────────────────────────────────────────────────────────
// Delete application
// ─────────────────────────────────────────────────────────────

export async function deleteSellApplication(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  await assertStaff();
  try {
    await prisma.sellApplication.delete({ where: { id } });
    revalidatePath('/admin/sell-applications');
    return { success: true };
  } catch (error) {
    console.error('deleteSellApplication error:', error);
    return { success: false, error: 'Failed to delete application.' };
  }
}
