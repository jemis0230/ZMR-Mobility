import { ok, created, badRequest, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { parsePressInput, toPressDTO } from '@/lib/press';

// GET /api/press — public, active mentions only
export async function GET() {
  try {
    const rows = await prisma.pressMention.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { publishedAt: { sort: 'desc', nulls: 'last' } }],
    });
    return ok(rows.map(toPressDTO));
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/press — admin only
export async function POST(req: Request) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const parsed = parsePressInput(await req.json());
    if ('error' in parsed) return badRequest(parsed.error);

    const row = await prisma.pressMention.create({
      data: { ...parsed, publishedAt: parsed.publishedAt ? new Date(parsed.publishedAt) : null },
    });
    revalidatePath('/press');
    revalidatePath('/admin/press');
    return created(toPressDTO(row));
  } catch (error) {
    return serverError(error);
  }
}
