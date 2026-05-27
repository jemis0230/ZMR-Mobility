import { ok, created, badRequest, serverError } from '@/app/api/_lib/response';
import { withSuperAdmin, isResponse } from '@/app/api/_lib/auth-guard';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

// GET /api/admin/users (superadmin only)
export async function GET(_req: Request) {
  try {
    const session = await withSuperAdmin();
    if (isResponse(session)) return session;

    const users = await prisma.adminUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
    });

    return ok(
      users.map((u) => ({
        ...u,
        lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        createdAt: u.createdAt.toISOString(),
      }))
    );
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/admin/users (superadmin only — create admin user with generated password)
export async function POST(req: Request) {
  try {
    const session = await withSuperAdmin();
    if (isResponse(session)) return session;

    const body = await req.json();
    const email = body.email?.toLowerCase().trim();
    const name = body.name?.trim() ?? '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest('Valid email is required');
    }

    const existing = await prisma.adminUser.findUnique({ where: { email } });
    if (existing) return badRequest('An account with this email already exists');

    const generatedPassword = generatePassword();
    const passwordHash = await hashPassword(generatedPassword);

    const user = await prisma.adminUser.create({
      data: { email, name: name || email, passwordHash, role: 'ADMIN', isActive: true },
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });

    revalidatePath('/admin/users');
    return created({ ...user, createdAt: user.createdAt.toISOString(), generatedPassword });
  } catch (error) {
    return serverError(error);
  }
}
