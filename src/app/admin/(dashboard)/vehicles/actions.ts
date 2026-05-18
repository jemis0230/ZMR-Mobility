'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import prisma from '@/lib/prisma';
import { saveUploadedFile } from '@/lib/upload';
import { VehicleFormSchema } from '@/lib/schemas/vehicle';

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
    await prisma.vehicle.delete({ where: { id } });
    revalidateTag('vehicle-filter-options-leasing');
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
    const existingSideImages = (Array.from(formData.getAll('existingSideImages')) as string[]).filter(Boolean);
    const newSidePaths: string[] = [];
    for (const file of Array.from(formData.getAll('sideImages')) as File[]) {
      if (file && file.size > 0) {
        newSidePaths.push(await saveUploadedFile(file, 'uploads'));
      }
    }
    const sideImages = [...existingSideImages, ...newSidePaths].join(',');

    await prisma.vehicle.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(mainImage ? { mainImage } : {}),
        sideImages,
      },
    });

    revalidateTag('vehicle-filter-options-leasing');
    revalidatePath('/admin/vehicles');
    return { success: true };
  } catch (error) {
    console.error('Update vehicle error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update vehicle' };
  }
}
