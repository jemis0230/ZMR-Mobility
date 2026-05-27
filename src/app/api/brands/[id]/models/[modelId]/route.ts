import { ok, badRequest, notFound, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import prisma from '@/lib/prisma';
import { saveUploadedFile } from '@/lib/upload';
import { VEHICLE_CATEGORIES } from '@/lib/constants';
import { VehicleCategory as PrismaVehicleCategory } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// PUT /api/brands/[id]/models/[modelId] (admin, multipart)
export async function PUT(req: Request, { params }: { params: Promise<{ modelId: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { modelId } = await params;
    const existing = await prisma.evBrandModel.findUnique({ where: { id: modelId } });
    if (!existing) return notFound('Model');

    const formData = await req.formData();
    const name = (formData.get('name') as string)?.trim();
    const category = (formData.get('category') as string)?.trim() ?? existing.category;
    const isActiveRaw = formData.get('isActive');
    const isActive = isActiveRaw !== null ? isActiveRaw === 'true' : existing.isActive;

    if (!name) return badRequest('Model name is required');
    if (!VEHICLE_CATEGORIES.includes(category as (typeof VEHICLE_CATEGORIES)[number])) {
      return badRequest('Invalid vehicle category');
    }

    const data: { name: string; isActive: boolean; category: PrismaVehicleCategory; photo?: string } = {
      name,
      isActive,
      category: category as PrismaVehicleCategory,
    };

    const photoFile = formData.get('photo') as File | null;
    if (photoFile && photoFile.size > 0) {
      data.photo = await saveUploadedFile(photoFile, 'uploads/ev-models');
    }

    const model = await prisma.evBrandModel.update({
      where: { id: modelId },
      data,
      include: { brand: { select: { name: true } } },
    });

    revalidatePath('/admin/ev-catalog');
    return ok({
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

// DELETE /api/brands/[id]/models/[modelId]
export async function DELETE(_req: Request, { params }: { params: Promise<{ modelId: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { modelId } = await params;
    const existing = await prisma.evBrandModel.findUnique({ where: { id: modelId } });
    if (!existing) return notFound('Model');

    await prisma.evBrandModel.delete({ where: { id: modelId } });
    revalidatePath('/admin/ev-catalog');
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
