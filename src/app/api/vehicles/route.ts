import { ok, created, badRequest, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import { PrismaVehicleRepository } from '@/infrastructure/repositories/PrismaVehicleRepository';
import { VehicleFormSchema } from '@/lib/schemas/vehicle';
import { saveUploadedFile } from '@/lib/upload';
import { revalidatePath, revalidateTag } from 'next/cache';
import type { VehicleCategory, ChargerType } from '@/lib/constants';

const repo = new PrismaVehicleRepository();

type PendingPlan = { tenureMonths?: number; monthlyPriceRs?: number; durationDays?: number; pricePerDayRs?: number; depositRs: number };

// GET /api/vehicles — list vehicles, optionally filtered
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as VehicleCategory | null;
    const section = searchParams.get('section'); // leasing | buying | rent

    if (category && section === 'leasing') {
      const page = parseInt(searchParams.get('page') ?? '1');
      const makes = searchParams.get('makes')?.split(',').filter(Boolean);
      const chargerType = searchParams.get('chargerType') as ChargerType | undefined ?? undefined;
      const result = await repo.findByCategoryWithFilters(category, {
        makes, chargerType,
        minRange: searchParams.get('minRange') ? +searchParams.get('minRange')! : undefined,
        maxRange: searchParams.get('maxRange') ? +searchParams.get('maxRange')! : undefined,
        page,
      });
      return ok(result);
    }

    if (category && section === 'buying') {
      const page = parseInt(searchParams.get('page') ?? '1');
      const result = await repo.findByCategoryForBuying(category, { page });
      return ok(result);
    }

    if (category && section === 'rent') {
      const page = parseInt(searchParams.get('page') ?? '1');
      const result = await repo.findByCategoryForRent(category, { page });
      return ok(result);
    }

    if (category) {
      const vehicles = await repo.findByCategory(category);
      return ok(vehicles);
    }

    const vehicles = await repo.findAll();
    return ok(vehicles);
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/vehicles — create vehicle (admin, multipart)
export async function POST(req: Request) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const formData = await req.formData();
    const fields: Record<string, string> = {};
    for (const [k, v] of formData.entries()) {
      if (typeof v === 'string') fields[k] = v;
    }

    const parsed = VehicleFormSchema.safeParse(fields);
    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    const mainImageFile = formData.get('mainImage') as File | null;
    if (!mainImageFile || mainImageFile.size === 0) {
      return badRequest('Main image is required');
    }
    const mainImage = await saveUploadedFile(mainImageFile, 'uploads');

    const imageUrls: string[] = [];
    for (const file of formData.getAll('sideImages') as File[]) {
      if (file && file.size > 0) imageUrls.push(await saveUploadedFile(file, 'uploads'));
    }

    const vehicle = await repo.create({ ...parsed.data, mainImage, imageUrls });

    // Atomic plan creation
    const pendingLeaseRaw = formData.get('pendingLeasePlans') as string | null;
    const pendingRentRaw = formData.get('pendingRentPlans') as string | null;
    if (pendingLeaseRaw) {
      const plans: PendingPlan[] = JSON.parse(pendingLeaseRaw);
      await Promise.all(plans.map((p) =>
        repo.addLeasePlan({ vehicleId: vehicle.id, tenureMonths: p.tenureMonths!, monthlyPriceRs: p.monthlyPriceRs!, depositRs: p.depositRs, isActive: true })
      ));
    }
    if (pendingRentRaw) {
      const plans: PendingPlan[] = JSON.parse(pendingRentRaw);
      await Promise.all(plans.map((p) =>
        repo.addRentPlan({ vehicleId: vehicle.id, durationDays: p.durationDays!, pricePerDayRs: p.pricePerDayRs!, depositRs: p.depositRs, isActive: true })
      ));
    }

    revalidateTag('vehicle-filter-options');
    revalidatePath('/');
    revalidatePath('/admin/vehicles');
    return created(vehicle);
  } catch (error) {
    return serverError(error);
  }
}
