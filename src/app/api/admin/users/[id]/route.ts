import { ok, badRequest, notFound, forbidden, serverError } from '@/app/api/_lib/response';
import { withSuperAdmin, withSession, isResponse } from '@/app/api/_lib/auth-guard';
import prisma from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

// PUT /api/admin/users/[id] — toggle active, reset password, or change own password
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Change own password — any authenticated user can do this for themselves
    if (body.action === 'change-password') {
      const session = await withSession();
      if (isResponse(session)) return session;
      if (session.userId !== id) return forbidden();

      const { currentPassword, newPassword, confirmPassword } = body;
      if (!newPassword || newPassword.length < 8) return badRequest('New password must be at least 8 characters');
      if (newPassword !== confirmPassword) return badRequest('Passwords do not match');

      const user = await prisma.adminUser.findUnique({ where: { id } });
      if (!user) return notFound('User');

      const valid = await verifyPassword(currentPassword, user.passwordHash);
      if (!valid) return badRequest('Current password is incorrect');

      await prisma.adminUser.update({ where: { id }, data: { passwordHash: await hashPassword(newPassword) } });
      return ok({ updated: true });
    }

    // All other actions require superadmin
    const session = await withSuperAdmin();
    if (isResponse(session)) return session;

    const user = await prisma.adminUser.findUnique({ where: { id } });
    if (!user) return notFound('User');
    if (user.role === 'SUPER_ADMIN') return forbidden();

    if (body.action === 'toggle-active') {
      const updated = await prisma.adminUser.update({ where: { id }, data: { isActive: !user.isActive } });
      revalidatePath('/admin/users');
      return ok({ id: updated.id, isActive: updated.isActive });
    }

    if (body.action === 'reset-password') {
      const generatedPassword = generatePassword();
      await prisma.adminUser.update({ where: { id }, data: { passwordHash: await hashPassword(generatedPassword) } });
      revalidatePath('/admin/users');
      return ok({ generatedPassword });
    }

    return badRequest('Unknown action');
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/admin/users/[id] (superadmin only)
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSuperAdmin();
    if (isResponse(session)) return session;

    const { id } = await params;
    if (id === session.userId) return badRequest('Cannot delete your own account');

    const user = await prisma.adminUser.findUnique({ where: { id } });
    if (!user) return notFound('User');
    if (user.role === 'SUPER_ADMIN') return forbidden();

    await prisma.adminUser.delete({ where: { id } });
    revalidatePath('/admin/users');
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
