'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { LEAD_STATUSES } from '@/lib/constants';
import { LeadSchema, GeneralInquirySchema } from '@/lib/schemas/lead';

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
};

// ─────────────────────────────────────────────────────────────
// Submit lead from EVConsultationModal (vehicle pages)
// ─────────────────────────────────────────────────────────────

export async function submitLeadAction(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const raw = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    state: formData.get('state') as string,
    city: formData.get('city') as string,
    inquiryType: formData.get('inquiryType') as string,
    vehicleId: formData.get('vehicleId') as string,
    vehicleName: formData.get('vehicleName') as string,
  };

  const parsed = LeadSchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: LeadFormState['errors'] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof NonNullable<LeadFormState['errors']>;
      if (field) fieldErrors[field] = issue.message;
    }
    return { success: false, errors: fieldErrors };
  }

  const { name, phone, state, city, inquiryType, vehicleId, vehicleName } = parsed.data;

  try {
    await prisma.lead.create({
      data: {
        name,
        phone,
        state,
        city,
        inquiryType,
        vehicleId: vehicleId ?? null,
        vehicleName: vehicleName ?? null,
        status: 'PENDING',
      },
    });

    revalidatePath('/admin/leads');
    return { success: true };
  } catch (error) {
    console.error('Failed to save lead:', error);
    return { success: false, errors: { general: 'Something went wrong. Please try again.' } };
  }
}

// ─────────────────────────────────────────────────────────────
// Submit general inquiry from home page contact form
// ─────────────────────────────────────────────────────────────

export async function submitGeneralInquiryAction(
  _prevState: GeneralInquiryFormState,
  formData: FormData
): Promise<GeneralInquiryFormState> {
  const raw = {
    name: formData.get('name') as string,
    phone: formData.get('phone') as string,
    email: formData.get('email') as string,
    inquiryType: formData.get('inquiryType') as string,
    notes: formData.get('notes') as string,
  };

  const parsed = GeneralInquirySchema.safeParse(raw);

  if (!parsed.success) {
    const fieldErrors: GeneralInquiryFormState['errors'] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof NonNullable<GeneralInquiryFormState['errors']>;
      if (field) fieldErrors[field] = issue.message;
    }
    return { success: false, errors: fieldErrors };
  }

  const { name, phone, email, inquiryType, notes } = parsed.data;

  try {
    await prisma.lead.create({
      data: {
        name,
        phone,
        email,
        state: '',
        city: '',
        inquiryType,
        notes,
        status: 'PENDING',
      },
    });

    revalidatePath('/admin/leads');
    return { success: true };
  } catch (error) {
    console.error('Failed to save general inquiry:', error);
    return { success: false, errors: { general: 'Something went wrong. Please try again.' } };
  }
}

// ─────────────────────────────────────────────────────────────
// Fetch leads for admin panel (with pagination)
// ─────────────────────────────────────────────────────────────

const LEADS_PAGE_SIZE = 15;

export async function getLeads(params: {
  search?: string;
  statusFilter?: string;
  page?: number;
}): Promise<{
  success: boolean;
  data?: LeadItem[];
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
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { email: { contains: q, mode: 'insensitive' } },
        { vehicleName: { contains: q, mode: 'insensitive' } },
        { state: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, leads] = await prisma.$transaction([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * LEADS_PAGE_SIZE,
        take: LEADS_PAGE_SIZE,
      }),
    ]);

    return {
      success: true,
      data: leads.map((l) => ({
        ...l,
        inquiryType: l.inquiryType,
        preferredDate: l.preferredDate ? l.preferredDate.toISOString().slice(0, 10) : null,
        createdAt: l.createdAt.toISOString(),
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
  try {
    await prisma.lead.delete({ where: { id } });
    revalidatePath('/admin/leads');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete lead:', error);
    return { success: false, error: 'Failed to delete lead.' };
  }
}
