'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { SELL_STATUSES } from '@/lib/constants';
import { SellApplicationSchema } from '@/lib/schemas/sell';

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
  documents: string;
  expectedPrice: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  contactCity: string;
  status: string;
  adminNotes: string | null;
  createdAt: string;
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

export async function submitSellApplication(data: WizardFormData): Promise<{
  success: boolean;
  applicationId?: string;
  error?: string;
}> {
  const parsed = SellApplicationSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const applicationId = `ZMR-SELL-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;

    const v = parsed.data;
    await prisma.sellApplication.create({
      data: {
        applicationId,
        category: v.category,
        sellerType: v.sellerType,
        brandId: v.brandId,
        brandName: v.brandName,
        modelId: v.modelId,
        modelName: v.modelName,
        year: v.year,
        ownership: v.ownership,
        batteryCondition: v.batteryCondition,
        vehicleCondition: v.vehicleCondition,
        hasAccident: v.hasAccident,
        loanStatus: v.loanStatus,
        documents: v.documents.join(','),
        expectedPrice: v.expectedPrice,
        contactName: v.contactName,
        contactPhone: v.contactPhone,
        contactEmail: v.contactEmail,
        contactCity: v.contactCity,
        status: 'NEW',
      },
    });

    revalidatePath('/admin/sell-applications');
    return { success: true, applicationId };
  } catch (error) {
    console.error('submitSellApplication error:', error);
    return { success: false, error: 'Failed to submit application. Please try again.' };
  }
}

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
      }),
    ]);

    return {
      success: true,
      data: apps.map((a) => ({
        ...a,
        expectedPrice: a.expectedPrice,
        createdAt: a.createdAt.toISOString(),
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
  if (!SELL_STATUSES.includes(status as (typeof SELL_STATUSES)[number])) {
    return { success: false, error: 'Invalid status.' };
  }
  try {
    await prisma.sellApplication.update({ where: { id }, data: { status } });
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
  try {
    await prisma.sellApplication.delete({ where: { id } });
    revalidatePath('/admin/sell-applications');
    return { success: true };
  } catch (error) {
    console.error('deleteSellApplication error:', error);
    return { success: false, error: 'Failed to delete application.' };
  }
}
