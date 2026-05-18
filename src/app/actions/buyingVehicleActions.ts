'use server';

import { PrismaBuyingVehicleRepository } from "@/infrastructure/repositories/PrismaBuyingVehicleRepository";
import { revalidatePath, revalidateTag } from "next/cache";
import { saveUploadedFile } from "@/lib/upload";
import { BuyingVehicleFormSchema } from "@/lib/schemas/buyingVehicle";

const buyingVehicleRepo = new PrismaBuyingVehicleRepository();

function extractTextFields(formData: FormData): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Array.from(formData.entries())) {
    if (typeof value === 'string') {
      result[key] = value;
    }
  }
  return result;
}

export async function createBuyingVehicleAction(formData: FormData) {
  try {
    const parsed = BuyingVehicleFormSchema.safeParse(extractTextFields(formData));

    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
    }

    const mainImageFile = formData.get('mainImage') as File;
    if (!mainImageFile || mainImageFile.size === 0) {
      return { success: false, error: 'Main image is required' };
    }
    const mainImage = await saveUploadedFile(mainImageFile, 'uploads');

    const sideImages: string[] = [];
    for (const file of Array.from(formData.getAll('sideImages')) as File[]) {
      if (file && file.size > 0) {
        sideImages.push(await saveUploadedFile(file, 'uploads'));
      }
    }

    await buyingVehicleRepo.create({ ...parsed.data, mainImage, sideImages });

    revalidateTag('vehicle-filter-options-buying');
    revalidatePath('/');
    revalidatePath('/admin/buying-vehicles');
    return { success: true };
  } catch (error) {
    console.error("Failed to create buying vehicle:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to connect to database",
    };
  }
}
