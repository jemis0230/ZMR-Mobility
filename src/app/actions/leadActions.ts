'use server';

import { assertStaff } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { LEAD_STATUSES } from '@/lib/constants';
import { buildLeadWhere, parseLeadFilters } from '@/lib/leadExportCore';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type LeadFormState = {
  success: boolean;
  errors?: {
    name?: string;
    phone?: string;
    state?: string;
    city?: string;
    inquiryType?: string;
    general?: string;
  };
};

export type GeneralInquiryFormState = {
  success: boolean;
  errors?: {
    name?: string;
    phone?: string;
    email?: string;
    general?: string;
  };
};

export type LeadItem = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  state: string;
  city: string;
  inquiryType: string;
  vehicleId: string | null;
  vehicleName: string | null;
  notes: string | null;
  /** Test drives only: the customer's preferred date (YYYY-MM-DD), not a confirmed slot. */
  preferredDate: string | null;
  status: string;
  createdAt: string;
  reference: string | null;
  /** Website form that created the lead (null for leads saved before sources were recorded). */
  source: string | null;
  notifications: LeadNotificationItem[];
};

export type LeadNotificationItem = {
  id: string;
  channel: 'EMAIL' | 'WHATSAPP';
  status: string;
  attempts: number;
  lastError: string | null;
  updatedAt: string;
};


// ─────────────────────────────────────────────────────────────
// Fetch leads for admin panel (with pagination)
// ─────────────────────────────────────────────────────────────

const LEADS_PAGE_SIZE = 15;

export async function getLeads(params: {
  search?: string;
  statusFilter?: string;
  source?: string;
  inquiryType?: string;
  /** "problem" = any notification failed or not configured. */
  notify?: string;
  page?: number;
}): Promise<{
  success: boolean;
  data?: LeadItem[];
  total?: number;
  page?: number;
  pageCount?: number;
  error?: string;
}> {
  await assertStaff();
  try {
    const page = Math.max(1, params.page ?? 1);
    // Same filter rules as the Excel export (src/lib/leadExportCore.ts).
    const parsed = parseLeadFilters({
      q: params.search,
      status: params.statusFilter,
      source: params.source,
      notify: params.notify,
      inquiryType: params.inquiryType,
    });
    if (!parsed.ok) return { success: false, error: parsed.error };
    const where = buildLeadWhere(parsed.filters);

    const [total, leads] = await prisma.$transaction([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * LEADS_PAGE_SIZE,
        take: LEADS_PAGE_SIZE,
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
      data: leads.map((l) => ({
        ...l,
        inquiryType: l.inquiryType,
        preferredDate: l.preferredDate ? l.preferredDate.toISOString().slice(0, 10) : null,
        createdAt: l.createdAt.toISOString(),
        notifications: l.notifications.map((n) => ({ ...n, updatedAt: n.updatedAt.toISOString() })),
      })),
      total,
      page,
      pageCount: Math.ceil(total / LEADS_PAGE_SIZE),
    };
  } catch (error) {
    console.error('Failed to fetch leads:', error);
    return { success: false, error: 'Failed to load leads.' };
  }
}

// ─────────────────────────────────────────────────────────────
// Update lead status
// ─────────────────────────────────────────────────────────────

export async function updateLeadStatus(id: string, status: string): Promise<{
  success: boolean;
  error?: string;
}> {
  await assertStaff();
  if (!LEAD_STATUSES.includes(status as (typeof LEAD_STATUSES)[number])) {
    return { success: false, error: 'Invalid status.' };
  }

  try {
    await prisma.lead.update({ where: { id }, data: { status: status as (typeof LEAD_STATUSES)[number] } });
    revalidatePath('/admin/leads');
    return { success: true };
  } catch (error) {
    console.error('Failed to update lead status:', error);
    return { success: false, error: 'Failed to update status.' };
  }
}

// ─────────────────────────────────────────────────────────────
// Delete lead
// ─────────────────────────────────────────────────────────────

export async function deleteLead(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  await assertStaff();
  try {
    await prisma.lead.delete({ where: { id } });
    revalidatePath('/admin/leads');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete lead:', error);
    return { success: false, error: 'Failed to delete lead.' };
  }
}
