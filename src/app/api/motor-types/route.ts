import { ok, created, badRequest, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// GET /api/motor-types — public: active only; ?admin=true: all
export async function GET(req: Request) {
  try {
    const admin = new URL(req.url).searchParams.get('admin') === 'true';
    const types = await prisma.motorType.findMany({
      where: admin ? undefined : { isActive: true },
      orderBy: { name: 'asc' },
    });
    return ok(types);
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/motor-types — admin only
export async function POST(req: Request) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const body = await req.json();
    const name = (body.name as string | undefined)?.trim();
    if (!name) return badRequest('Name is required');

    const existing = await prisma.motorType.findUnique({ where: { name } });
    if (existing) return badRequest('A motor type with this name already exists');

    const type = await prisma.motorType.create({ data: { name } });
    revalidatePath('/admin/vehicle-config');
    return created(type);
  } catch (error) {
    return serverError(error);
  }
}
