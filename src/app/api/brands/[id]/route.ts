import { ok, badRequest, notFound, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import prisma from '@/lib/prisma';
import { VEHICLE_CATEGORIES, type VehicleCategory } from '@/lib/constants';
import { revalidatePath } from 'next/cache';

// GET /api/brands/[id]
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const brand = await prisma.evBrand.findUnique({ where: { id }, include: { _count: { select: { models: true } } } });
    if (!brand) return notFound('Brand');
    return ok({
      id: brand.id,
      name: brand.name,
      categories: brand.categories,
      isActive: brand.isActive,
      modelCount: brand._count.models,
      createdAt: brand.createdAt.toISOString(),
    });
  } catch (error) {
    return serverError(error);
  }
}

// PUT /api/brands/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { id } = await params;
    const existing = await prisma.evBrand.findUnique({ where: { id } });
    if (!existing) return notFound('Brand');

    const body = await req.json();
    const name = body.name?.trim();
    if (!name) return badRequest('Brand name is required');

    const isActive = typeof body.isActive === 'boolean' ? body.isActive : existing.isActive;
    const categories = (Array.isArray(body.categories) ? body.categories as string[] : []).filter(
      (c): c is VehicleCategory => VEHICLE_CATEGORIES.includes(c as VehicleCategory)
    );

    const brand = await prisma.evBrand.update({ where: { id }, data: { name, isActive, categories } });
    revalidatePath('/admin/ev-catalog');
    return ok({ id: brand.id, name: brand.name, categories: brand.categories, isActive: brand.isActive });
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/brands/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { id } = await params;
    const existing = await prisma.evBrand.findUnique({ where: { id } });
    if (!existing) return notFound('Brand');

    await prisma.evBrand.delete({ where: { id } });
    revalidatePath('/admin/ev-catalog');
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
