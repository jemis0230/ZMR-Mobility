import { ok, created, badRequest, notFound, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import { PrismaVehicleRepository } from '@/infrastructure/repositories/PrismaVehicleRepository';
import { LeasePlanFormSchema } from '@/lib/schemas/vehicle';
import { revalidatePath, revalidateTag } from 'next/cache';

const repo = new PrismaVehicleRepository();

// GET /api/vehicles/[id]/lease-plans
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const plans = await repo.findLeasePlansByVehicleId(id);
    return ok(plans);
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/vehicles/[id]/lease-plans
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { id } = await params;
    const body = await req.json();

    const parsed = LeasePlanFormSchema.safeParse({
      tenureMonths: String(body.tenureMonths),
      monthlyPriceRs: String(body.monthlyPriceRs),
      depositRs: String(body.depositRs),
      isActive: body.isActive !== false ? 'on' : '',
    });

    if (!parsed.success) {
      return badRequest(parsed.error.issues[0]?.message ?? 'Invalid input');
    }

    const plan = await repo.addLeasePlan({ vehicleId: id, ...parsed.data });
    revalidatePath('/');
    revalidatePath('/admin/vehicles');
    revalidateTag('vehicle-filter-options');
    return created(plan);
  } catch (error) {
    return serverError(error);
  }
}
