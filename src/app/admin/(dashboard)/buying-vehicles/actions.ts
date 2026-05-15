'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { saveUploadedFile } from '@/lib/upload';
import { BuyingVehicleFormSchema } from '@/lib/schemas/buyingVehicle';

function extractTextFields(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Array.from(formData.entries())) {
    if (typeof value === 'string') {
      result[key] = value;
    }
  }
  return result;
}

export async function deleteBuyingVehicle(id: string) {
  try {
    await prisma.buyingVehicle.delete({ where: { id } });
    revalidatePath('/admin/buying-vehicles');
    return { success: true };
  } catch (error) {
    console.error('Delete buying vehicle error:', error);
    return { success: false, error: 'Failed to delete vehicle' };
  }
}

export async function updateBuyingVehicle(id: string, formData: FormData) {
  try {
    const parsed = BuyingVehicleFormSchema.safeParse(extractTextFields(formData));

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    let mainImage: string | undefined;
    const mainImageFile = formData.get('mainImage') as File;
    const existingMainImage = formData.get('existingMainImage') as string;
    if (mainImageFile && mainImageFile.size > 0) {
      mainImage = await saveUploadedFile(mainImageFile, 'uploads');
    } else if (existingMainImage) {
      mainImage = existingMainImage;
    }

    const existingSideImages = (Array.from(formData.getAll('existingSideImages')) as string[]).filter(Boolean);
    const newSidePaths: string[] = [];
    for (const file of Array.from(formData.getAll('sideImages')) as File[]) {
      if (file && file.size > 0) {
        newSidePaths.push(await saveUploadedFile(file, 'uploads'));
      }
    }
    const sideImages = [...existingSideImages, ...newSidePaths].join(',');

    await prisma.buyingVehicle.update({
      where: { id },
      data: {
        ...parsed.data,
        ...(mainImage ? { mainImage } : {}),
        sideImages,
      },
    });

    revalidatePath('/admin/buying-vehicles');
    return { success: true };
  } catch (error) {
    console.error('Update buying vehicle error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update vehicle' };
  }
}
