import { ok, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import prisma from '@/lib/prisma';
import { storageMode } from '@/lib/upload';

export const dynamic = 'force-dynamic';

// GET /api/admin/status — staff only. Lets staff confirm, without database credentials,
// which migrations are applied in this deployment's database, that the blog tables
// exist, which image storage is in use, and which commit is deployed. No secrets.
export async function GET() {
  const session = await withSession();
  if (isResponse(session)) return session;
  try {
    const migrations = await prisma.$queryRaw<{ migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }[]>`
      SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY started_at`;
    const [blogTypes, blogAuthors, blogTags] = await Promise.all([
      prisma.blogType.findMany({ select: { name: true }, orderBy: { name: 'asc' } }),
      prisma.blogAuthor.count(),
      prisma.blogTag.count(),
    ]);
    return ok({
      deployment: {
        environment: process.env.VERCEL_ENV ?? 'not on Vercel',
        commit: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      },
      imageStorage: storageMode(), // "blob" = Vercel Blob, "local" = server disk, "unconfigured" = uploads refused
      migrations: migrations.map((m) => ({
        name: m.migration_name,
        applied: !!m.finished_at && !m.rolled_back_at,
        finishedAt: m.finished_at,
      })),
      blog: { types: blogTypes.map((t) => t.name), authors: blogAuthors, tags: blogTags },
    });
  } catch (error) {
    return serverError(error);
  }
}
