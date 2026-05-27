import { ok, badRequest, notFound, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import { PrismaVehicleRepository } from '@/infrastructure/repositories/PrismaVehicleRepository';
import { VehicleFormSchema } from '@/lib/schemas/vehicle';
import { saveUploadedFile } from '@/lib/upload';
import { revalidatePath, revalidateTag } from 'next/cache';

const repo = new PrismaVehicleRepository();

// GET /api/vehicles/[id]
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vehicle = await repo.findById(id);
    if (!vehicle) return notFound('Vehicle');
    return ok(vehicle);
  } catch (error) {
    return serverError(error);
  }
}

// PUT /api/vehicles/[id] — update vehicle (admin, multipart)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { id } = await params;
    const existing = await repo.findById(id);
    if (!existing) return notFound('Vehicle');

    const formData = await req.formData();
    const fields: Record<string, string> = {};
    for (const [k, v] of formData.entries()) {
      if (typeof v === 'string') fields[k] = v;
    }

    const parsed = VehicleFormSchema.safeParse(fields);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    let mainImage: string | undefined;
    const mainImageFile = formData.get('mainImage') as File | null;
    const existingMainImage = formData.get('existingMainImage') as string | null;
    if (mainImageFile && mainImageFile.size > 0) {
      mainImage = await saveUploadedFile(mainImageFile, 'uploads');
    } else if (existingMainImage) {
      mainImage = existingMainImage;
    }

    const existingImageUrls = (formData.getAll('existingSideImages') as string[]).filter(Boolean);
    const newImagePaths: string[] = [];
    for (const file of formData.getAll('sideImages') as File[]) {
      if (file && file.size > 0) newImagePaths.push(await saveUploadedFile(file, 'uploads'));
    }
    const imageUrls = [...existingImageUrls, ...newImagePaths];

    const vehicle = await repo.update(id, {
      ...parsed.data,
      ...(mainImage ? { mainImage } : {}),
      imageUrls,
    });

    revalidateTag('vehicle-filter-options');
    revalidatePath('/');
    revalidatePath('/admin/vehicles');
    return ok(vehicle);
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/vehicles/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { id } = await params;
    const existing = await repo.findById(id);
    if (!existing) return notFound('Vehicle');

    await repo.delete(id);
    revalidateTag('vehicle-filter-options');
    revalidatePath('/admin/vehicles');
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
