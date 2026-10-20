import { ok, created, badRequest, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import prisma from '@/lib/prisma';
import { LeadSchema, GeneralInquirySchema } from '@/lib/schemas/lead';
import { revalidatePath } from 'next/cache';
import { createLead, checkPublicSubmission } from '@/lib/leads';

const PAGE_SIZE = 15;

// GET /api/leads (admin only)
export async function GET(req: Request) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page') ?? 1));
    const statusFilter = searchParams.get('status') ?? '';
    const search = searchParams.get('search')?.trim() ?? '';

    const where: Record<string, unknown> = {};
    if (statusFilter && statusFilter !== 'ALL') where.status = statusFilter;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } },
        { vehicleName: { contains: search, mode: 'insensitive' } },
        { state: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, leads] = await prisma.$transaction([
      prisma.lead.count({ where }),
      prisma.lead.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    return ok({
      data: leads.map((l) => ({
        ...l,
        preferredDate: l.preferredDate ? l.preferredDate.toISOString().slice(0, 10) : null,
        createdAt: l.createdAt.toISOString(),
      })),
      total,
      page,
      pageCount: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/leads (public — vehicle enquiry or Contact Us form)
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return badRequest('Invalid request.');
    const guard = await checkPublicSubmission(req, body, 'lead');
    if (guard === 'bot') return created({ submitted: true });
    if (guard) return guard;

    let lead;
    if (body.type === 'general') {
      const parsed = GeneralInquirySchema.safeParse(body);
      if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');
      const { name, phone, email, inquiryType, notes } = parsed.data;
      lead = await createLead('contact-form', { name, phone, email, inquiryType, notes });
    } else {
      const parsed = LeadSchema.safeParse(body);
      if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');
      const { name, phone, state, city, inquiryType, vehicleId, vehicleName } = parsed.data;
      lead = await createLead('vehicle-enquiry', { name, phone, state, city, inquiryType: inquiryType ?? 'VEHICLE_LEASING', vehicleId, vehicleName });
    }

    revalidatePath('/admin/leads');
    return created({ submitted: true, reference: lead.reference });
  } catch (error) {
    return serverError(error);
  }
}
