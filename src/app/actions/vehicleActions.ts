'use server';

import { PrismaVehicleRepository } from "@/infrastructure/repositories/PrismaVehicleRepository";
import { LeasePlan, RentPlan } from "@/domain/entities/Vehicle";
import { revalidatePath, revalidateTag } from "next/cache";
import { saveUploadedFile } from "@/lib/upload";
import { VehicleFormSchema, LeasePlanFormSchema, RentPlanFormSchema } from "@/lib/schemas/vehicle";

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

type PendingLeasePlan = { tenureMonths: number; monthlyPriceRs: number; depositRs: number };
type PendingRentPlan  = { durationDays: number; pricePerDayRs: number;  depositRs: number };

// ─────────────────────────────────────────────────────────────
// Create vehicle (+ optional pending plans submitted at creation)
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

    const imageUrls: string[] = [];
    for (const file of Array.from(formData.getAll('sideImages')) as File[]) {
      if (file && file.size > 0) {
        imageUrls.push(await saveUploadedFile(file, 'uploads'));
      }
    }

    const vehicle = await vehicleRepo.create({ ...parsed.data, mainImage, imageUrls });

    // Create pending plans submitted alongside the vehicle
    const pendingLeaseRaw = formData.get('pendingLeasePlans') as string | null;
    const pendingRentRaw  = formData.get('pendingRentPlans')  as string | null;

    if (pendingLeaseRaw) {
      const pendingLease: PendingLeasePlan[] = JSON.parse(pendingLeaseRaw);
      await Promise.all(pendingLease.map((p) =>
        vehicleRepo.addLeasePlan({ vehicleId: vehicle.id, isActive: true, ...p })
      ));
    }

    if (pendingRentRaw) {
      const pendingRent: PendingRentPlan[] = JSON.parse(pendingRentRaw);
      await Promise.all(pendingRent.map((p) =>
        vehicleRepo.addRentPlan({ vehicleId: vehicle.id, isActive: true, ...p })
      ));
    }

    revalidateTag('vehicle-filter-options');
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
// LeasePlan actions
// ─────────────────────────────────────────────────────────────

export async function addLeasePlanAction(vehicleId: string, formData: FormData): Promise<{ success: boolean; error?: string; plan?: LeasePlan }> {
  const parsed = LeasePlanFormSchema.safeParse(extractTextFields(formData));

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const plan = await vehicleRepo.addLeasePlan({ vehicleId, ...parsed.data });
    revalidatePath('/');
    revalidatePath('/admin/vehicles');
    return { success: true, plan };
  } catch (error) {
    console.error("Failed to add lease plan:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to add plan' };
  }
}

export async function deleteLeasePlanAction(planId: string) {
  try {
    await vehicleRepo.deleteLeasePlan(planId);
    revalidatePath('/admin/vehicles');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete lease plan:", error);
    return { success: false, error: 'Failed to delete plan' };
  }
}

export async function updateLeasePlanAction(planId: string, data: { isActive: boolean }) {
  try {
    await vehicleRepo.updateLeasePlan(planId, data);
    revalidatePath('/admin/vehicles');
    revalidateTag('vehicles');
    return { success: true };
  } catch (error) {
    console.error("Failed to update lease plan:", error);
    return { success: false, error: 'Failed to update plan' };
  }
}

// ─────────────────────────────────────────────────────────────
// RentPlan actions
// ─────────────────────────────────────────────────────────────

export async function addRentPlanAction(vehicleId: string, formData: FormData): Promise<{ success: boolean; error?: string; plan?: RentPlan }> {
  const parsed = RentPlanFormSchema.safeParse(extractTextFields(formData));

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const plan = await vehicleRepo.addRentPlan({ vehicleId, ...parsed.data });
    revalidatePath('/');
    revalidatePath('/admin/vehicles');
    return { success: true, plan };
  } catch (error) {
    console.error("Failed to add rent plan:", error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to add plan' };
  }
}

export async function deleteRentPlanAction(planId: string) {
  try {
    await vehicleRepo.deleteRentPlan(planId);
    revalidatePath('/admin/vehicles');
    return { success: true };
  } catch (error) {
    console.error("Failed to delete rent plan:", error);
    return { success: false, error: 'Failed to delete plan' };
  }
}

export async function updateRentPlanAction(planId: string, data: { isActive: boolean }) {
  try {
    await vehicleRepo.updateRentPlan(planId, data);
    revalidatePath('/admin/vehicles');
    revalidateTag('vehicles');
    return { success: true };
  } catch (error) {
    console.error("Failed to update rent plan:", error);
    return { success: false, error: 'Failed to update plan' };
  }
}
