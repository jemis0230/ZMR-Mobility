import { ok, badRequest, unauthorized, serverError } from '@/app/api/_lib/response';
import { hashPassword, verifyPassword, getDummyHash, createSession, signJWT } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return badRequest('Email and password are required');
    }

    const user = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase() } });

    // Always run bcrypt to prevent timing attacks
    const hash = user?.passwordHash ?? getDummyHash();
    const valid = await verifyPassword(password, hash);

    if (!user || !valid || !user.isActive) {
      return unauthorized();
    }

    await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role === 'SUPER_ADMIN' ? 'superadmin' as const : 'admin' as const,
    };

    await createSession(payload);

    return ok({ user: { id: user.id, email: user.email, name: user.name, role: payload.role } });
  } catch (error) {
    return serverError(error);
  }
}
