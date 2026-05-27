import { ok, created, badRequest, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import prisma from '@/lib/prisma';
import { SellApplicationSchema } from '@/lib/schemas/sell';
import { SellStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const PAGE_SIZE = 15;

// GET /api/sell-applications (admin only)
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
        { contactName: { contains: search } },
        { contactPhone: { contains: search } },
        { contactEmail: { contains: search } },
        { applicationId: { contains: search } },
        { brandName: { contains: search } },
        { modelName: { contains: search } },
        { contactCity: { contains: search } },
      ];
    }

    const [total, apps] = await prisma.$transaction([
      prisma.sellApplication.count({ where }),
      prisma.sellApplication.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    return ok({
      data: apps.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
      total,
      page,
      pageCount: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/sell-applications (public)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = SellApplicationSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');

    const applicationId = `ZMR-SELL-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`;
    const v = parsed.data;

    const app = await prisma.sellApplication.create({
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
        documents: v.documents,
        expectedPriceRs: v.expectedPrice,
        contactName: v.contactName,
        contactPhone: v.contactPhone,
        contactEmail: v.contactEmail,
        contactCity: v.contactCity,
        status: 'NEW' as SellStatus,
      },
    });

    revalidatePath('/admin/sell-applications');
    return created({ applicationId: app.applicationId });
  } catch (error) {
    return serverError(error);
  }
}
