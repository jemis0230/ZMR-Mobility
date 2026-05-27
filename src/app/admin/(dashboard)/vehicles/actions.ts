'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { PrismaVehicleRepository } from '@/infrastructure/repositories/PrismaVehicleRepository';
import { saveUploadedFile } from '@/lib/upload';
import { VehicleFormSchema } from '@/lib/schemas/vehicle';

const vehicleRepo = new PrismaVehicleRepository();

function extractTextFields(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Array.from(formData.entries())) {
    if (typeof value === 'string') {
      result[key] = value;
    }
  }
  return result;
}

// ─────────────────────────────────────────────────────────────
// Delete vehicle
// ─────────────────────────────────────────────────────────────

export async function deleteVehicle(id: string) {
  try {
    await vehicleRepo.delete(id);
    revalidateTag('vehicle-filter-options');
    revalidatePath('/admin/vehicles');
    return { success: true };
  } catch (error) {
    console.error('Delete vehicle error:', error);
    return { success: false, error: 'Failed to delete vehicle' };
  }
}

// ─────────────────────────────────────────────────────────────
// Update vehicle
// ─────────────────────────────────────────────────────────────

export async function updateVehicle(id: string, formData: FormData) {
  try {
    const parsed = VehicleFormSchema.safeParse(extractTextFields(formData));

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    // Main image: new upload takes priority, else keep existing
    let mainImage: string | undefined;
    const mainImageFile = formData.get('mainImage') as File;
    const existingMainImage = formData.get('existingMainImage') as string;
    if (mainImageFile && mainImageFile.size > 0) {
      mainImage = await saveUploadedFile(mainImageFile, 'uploads');
    } else if (existingMainImage) {
      mainImage = existingMainImage;
    }

    // Side images: keep existing paths + append new uploads
    const existingImageUrls = (Array.from(formData.getAll('existingSideImages')) as string[]).filter(Boolean);
    const newImagePaths: string[] = [];
    for (const file of Array.from(formData.getAll('sideImages')) as File[]) {
      if (file && file.size > 0) {
        newImagePaths.push(await saveUploadedFile(file, 'uploads'));
      }
    }
    const imageUrls = [...existingImageUrls, ...newImagePaths];

    await vehicleRepo.update(id, {
      ...parsed.data,
      ...(mainImage ? { mainImage } : {}),
      imageUrls,
    });

    revalidateTag('vehicle-filter-options');
    revalidatePath('/admin/vehicles');
    return { success: true };
  } catch (error) {
    console.error('Update vehicle error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update vehicle' };
  }
}
