import { ok, created, badRequest, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import prisma from '@/lib/prisma';
import { saveUploadedFile } from '@/lib/upload';
import { VEHICLE_CATEGORIES } from '@/lib/constants';
import { VehicleCategory as PrismaVehicleCategory } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// GET /api/brands/[id]/models?category=...&admin=true
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') ?? undefined;
    const admin = searchParams.get('admin') === 'true';

    const models = await prisma.evBrandModel.findMany({
      where: {
        brandId: id,
        ...(admin ? {} : { isActive: true }),
        ...(category ? { category: category as PrismaVehicleCategory } : {}),
      },
      orderBy: { name: 'asc' },
      include: admin ? { brand: { select: { name: true } } } : undefined,
    });

    return ok(
      models.map((m) => ({
        id: m.id,
        name: m.name,
        brandId: m.brandId,
        photo: m.photo,
        category: m.category,
        isActive: m.isActive,
        ...(admin && 'brand' in m ? { brandName: (m as typeof m & { brand: { name: string } }).brand.name, createdAt: m.createdAt.toISOString() } : {}),
      }))
    );
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/brands/[id]/models (admin, multipart)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { id } = await params;
    const brand = await prisma.evBrand.findUnique({ where: { id } });
    if (!brand) return badRequest('Brand not found');

    const formData = await req.formData();
    const name = (formData.get('name') as string)?.trim();
    const category = (formData.get('category') as string)?.trim() ?? '';

    if (!name) return badRequest('Model name is required');
    if (!VEHICLE_CATEGORIES.includes(category as (typeof VEHICLE_CATEGORIES)[number])) {
      return badRequest('Invalid vehicle category');
    }

    let photo: string | null = null;
    const photoFile = formData.get('photo') as File | null;
    if (photoFile && photoFile.size > 0) {
      photo = await saveUploadedFile(photoFile, 'uploads/ev-models');
    }

    const model = await prisma.evBrandModel.create({
      data: { name, brandId: id, photo, category: category as PrismaVehicleCategory },
      include: { brand: { select: { name: true } } },
    });

    revalidatePath('/admin/ev-catalog');
    return created({
      id: model.id,
      name: model.name,
      brandId: model.brandId,
      brandName: model.brand.name,
      photo: model.photo,
      category: model.category,
      isActive: model.isActive,
      createdAt: model.createdAt.toISOString(),
    });
  } catch (error) {
    return serverError(error);
  }
}
