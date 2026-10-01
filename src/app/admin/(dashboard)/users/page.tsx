import { requireSuperAdmin } from '@/lib/auth';
import prisma from '@/lib/prisma';
import UsersClient from './UsersClient';
import { redirect } from 'next/navigation';

export default async function UsersPage() {
  const session = await requireSuperAdmin().catch(() => null);
  if (!session) redirect('/admin');

  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black">User Management</h1>
        <p className="text-ink/60 mt-1">Manage who can access the admin panel</p>
      </div>
      <UsersClient
        users={users.map((u) => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
          lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        }))}
        currentUserId={session.userId}
      />
    </div>
  );
}
