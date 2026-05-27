import { ok, created, badRequest, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import prisma from '@/lib/prisma';
import { VEHICLE_CATEGORIES, type VehicleCategory } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

// GET /api/brands?category=...&admin=true
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') ?? undefined;
    const admin = searchParams.get('admin') === 'true';

    const brands = await prisma.evBrand.findMany({
      where: admin ? undefined : { isActive: true },
      orderBy: { name: 'asc' },
      include: admin ? { _count: { select: { models: true } } } : undefined,
    });

    const data = brands.map((b) => ({
      id: b.id,
      name: b.name,
      categories: b.categories as string[],
      isActive: b.isActive,
      ...(admin && '_count' in b ? { modelCount: (b as typeof b & { _count: { models: number } })._count.models, createdAt: b.createdAt.toISOString() } : {}),
    }));

    if (category) {
      return ok(data.filter((b) => b.categories.includes(category)));
    }
    return ok(data);
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/brands (admin only)
export async function POST(req: Request) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const body = await req.json();
    const name = body.name?.trim();
    if (!name) return badRequest('Brand name is required');

    const categories = (Array.isArray(body.categories) ? body.categories as string[] : []).filter(
      (c): c is VehicleCategory => VEHICLE_CATEGORIES.includes(c as VehicleCategory)
    );

    const brand = await prisma.evBrand.create({ data: { name, categories } });
    revalidatePath('/admin/ev-catalog');
    return created({ id: brand.id, name: brand.name, categories: brand.categories, isActive: brand.isActive });
  } catch (error) {
    return serverError(error);
  }
}
