'use server';

import { PrismaVehicleRepository } from "@/infrastructure/repositories/PrismaVehicleRepository";
import { revalidatePath, revalidateTag } from "next/cache";
import { saveUploadedFile } from "@/lib/upload";
import { VehicleFormSchema, LeasePlanFormSchema } from "@/lib/schemas/vehicle";

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
// Create vehicle
// ─────────────────────────────────────────────────────────────

export async function createVehicleAction(formData: FormData) {
  try {
    const parsed = VehicleFormSchema.safeParse(extractTextFields(formData));

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

    await vehicleRepo.create({ ...parsed.data, mainImage, sideImages });

    revalidateTag('vehicle-filter-options-leasing');
    revalidatePath('/');
    revalidatePath('/admin/vehicles');
    return { success: true };
  } catch (error) {
    console.error("Failed to create vehicle:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to connect to database",
    };
  }
}

// ─────────────────────────────────────────────────────────────
// Add lease plan
// ─────────────────────────────────────────────────────────────

export async function addLeasePlanAction(vehicleId: string, formData: FormData) {
  const parsed = LeasePlanFormSchema.safeParse(extractTextFields(formData));

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? 'Invalid input');
  }

  const { tenure, monthlyPrice, deposit } = parsed.data;

  await vehicleRepo.addLeasePlan({ vehicleId, tenure, monthlyPrice, deposit, isActive: true });

  revalidatePath('/');
  revalidatePath(`/admin/vehicles/${vehicleId}`);
}
