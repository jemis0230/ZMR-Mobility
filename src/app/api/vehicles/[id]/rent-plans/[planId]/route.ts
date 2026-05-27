import { ok, badRequest, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import { PrismaVehicleRepository } from '@/infrastructure/repositories/PrismaVehicleRepository';
import { revalidatePath, revalidateTag } from 'next/cache';

const repo = new PrismaVehicleRepository();

// PUT /api/vehicles/[id]/rent-plans/[planId]
export async function PUT(req: Request, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { planId } = await params;
    const body = await req.json();

    if (typeof body.isActive !== 'boolean') {
      return badRequest('isActive must be a boolean');
    }

    const plan = await repo.updateRentPlan(planId, { isActive: body.isActive });
    revalidatePath('/admin/vehicles');
    revalidateTag('vehicles');
    return ok(plan);
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/vehicles/[id]/rent-plans/[planId]
export async function DELETE(_req: Request, { params }: { params: Promise<{ planId: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { planId } = await params;
    await repo.deleteRentPlan(planId);
    revalidatePath('/admin/vehicles');
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
