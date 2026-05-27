'use server';

import prisma from '@/lib/prisma';
import {
  hashPassword,
  verifyPassword,
  getDummyHash,
  createSession,
  destroySession,
  requireSession,
  requireSuperAdmin,
} from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export type AuthResult = { success: boolean; error?: string };
export type PasswordResult = { success: boolean; error?: string; generatedPassword?: string };

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

// ── Login ──────────────────────────────────────────────────────────────────────

export async function loginAction(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const email = (formData.get('email') as string ?? '').toLowerCase().trim();
  const password = (formData.get('password') as string) ?? '';

  const user = await prisma.adminUser.findUnique({ where: { email } });

  if (!user) {
    await verifyPassword(password, getDummyHash()); // timing-safe rejection
    return { success: false, error: 'Invalid email or password' };
  }

  if (!user.isActive) {
    await verifyPassword(password, getDummyHash());
    return { success: false, error: 'Invalid email or password' };
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { success: false, error: 'Invalid email or password' };
  }

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role === 'SUPER_ADMIN' ? 'superadmin' : 'admin',
  });

  return { success: true };
}

// ── Logout ─────────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/admin/login');
}

// ── Change own password ────────────────────────────────────────────────────────

export async function changePasswordAction(
  _prev: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const session = await requireSession();
  const currentPassword = (formData.get('currentPassword') as string) ?? '';
  const newPassword = (formData.get('newPassword') as string) ?? '';
  const confirmPassword = (formData.get('confirmPassword') as string) ?? '';

  if (newPassword.length < 8) {
    return { success: false, error: 'New password must be at least 8 characters' };
  }
  if (newPassword !== confirmPassword) {
    return { success: false, error: 'New passwords do not match' };
  }

  const user = await prisma.adminUser.findUnique({ where: { id: session.userId } });
  if (!user) return { success: false, error: 'User not found' };

  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return { success: false, error: 'Current password is incorrect' };

  const newHash = await hashPassword(newPassword);
  await prisma.adminUser.update({ where: { id: user.id }, data: { passwordHash: newHash } });

  return { success: true };
}

// ── Create admin user (superadmin only) ────────────────────────────────────────

export async function createAdminUserAction(
  _prev: PasswordResult,
  formData: FormData
): Promise<PasswordResult> {
  await requireSuperAdmin();

  const email = (formData.get('email') as string ?? '').toLowerCase().trim();
  const name = (formData.get('name') as string ?? '').trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Valid email is required' };
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: 'An account with this email already exists' };
  }

  const generatedPassword = generatePassword();
  const passwordHash = await hashPassword(generatedPassword);

  await prisma.adminUser.create({
    data: {
      email,
      name: name || email,
      passwordHash,
      role: 'ADMIN', // role is NEVER taken from formData
      isActive: true,
    },
  });

  revalidatePath('/admin/users');
  return { success: true, generatedPassword };
}

// ── Reset a user's password (superadmin only) ──────────────────────────────────

export async function resetUserPasswordAction(
  _prev: PasswordResult,
  formData: FormData
): Promise<PasswordResult> {
  await requireSuperAdmin();

  const userId = formData.get('userId') as string;
  const user = await prisma.adminUser.findUnique({ where: { id: userId } });

  if (!user) return { success: false, error: 'User not found' };
  if (user.role === 'SUPER_ADMIN') {
    return { success: false, error: 'Cannot reset superadmin password via this form' };
  }

  const generatedPassword = generatePassword();
  const passwordHash = await hashPassword(generatedPassword);

  await prisma.adminUser.update({ where: { id: userId }, data: { passwordHash } });

  revalidatePath('/admin/users');
  return { success: true, generatedPassword };
}

// ── Toggle user active/inactive (superadmin only) ─────────────────────────────

export async function toggleUserActiveAction(userId: string): Promise<AuthResult> {
  await requireSuperAdmin();

  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: 'User not found' };
  if (user.role === 'SUPER_ADMIN') {
    return { success: false, error: 'Cannot deactivate superadmin' };
  }

  await prisma.adminUser.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  revalidatePath('/admin/users');
  return { success: true };
}

// ── Delete admin user (superadmin only) ───────────────────────────────────────

export async function deleteAdminUserAction(userId: string): Promise<AuthResult> {
  const session = await requireSuperAdmin();

  if (userId === session.userId) {
    return { success: false, error: 'Cannot delete your own account' };
  }

  const user = await prisma.adminUser.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: 'User not found' };
  if (user.role === 'SUPER_ADMIN') {
    return { success: false, error: 'Cannot delete superadmin account' };
  }

  await prisma.adminUser.delete({ where: { id: userId } });

  revalidatePath('/admin/users');
  return { success: true };
}
