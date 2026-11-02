import 'server-only';
import { createHash } from 'node:crypto';
import prisma from '@/lib/prisma';
import { consume, clientIp } from '@/lib/rateLimit';
import { SITE_URL } from '@/lib/site';
import {
  VIEW_RATE_LIMIT, VIEW_SOURCES, classifySource, isLikelyBot, isValidSlug, istDay,
  type ReportRange, type ViewSource,
} from '@/lib/blog/viewRules';

export type RecordResult = 'counted' | 'ignored-bot' | 'ignored-staff' | 'not-found' | 'rate-limited' | 'invalid';

/** Rate-limit key from a one-way hash of the client IP; the IP itself is never stored. */
function connectionKey(headers: Headers): string {
  const salt = process.env.AUTH_SECRET ?? 'zmr';
  return 'blogview:' + createHash('sha256').update(`${salt}|${clientIp(headers)}`).digest('hex').slice(0, 32);
}

/**
 * Count one view of a published article. Drafts, unknown slugs, bots and signed-in staff
 * are not counted. Stores only the article, the time and a coarse referrer type.
 */
export async function recordBlogView(input: { slug: unknown; ref: unknown; headers: Headers; isStaff: boolean }): Promise<RecordResult> {
  if (!isValidSlug(input.slug)) return 'invalid';
  if (isLikelyBot(input.headers.get('user-agent'))) return 'ignored-bot';
  if (input.isStaff) return 'ignored-staff';

  const post = await prisma.blogPost.findUnique({ where: { slug: input.slug }, select: { id: true, published: true } });
  if (!post || !post.published) return 'not-found';

  const { allowed } = await consume({ key: connectionKey(input.headers), ...VIEW_RATE_LIMIT });
  if (!allowed) return 'rate-limited';

  const siteHosts = [new URL(SITE_URL).host, input.headers.get('host') ?? ''].filter(Boolean);
  const source = classifySource(input.ref, siteHosts);
  await prisma.blogPageView.create({ data: { postId: post.id, source } });
  return 'counted';
}

export type BlogReport = {
  totalViews: number;
  publishedCount: number;
  articlesViewed: number;
  collectionStartedAt: Date | null;
  byDay: { day: string; views: number }[];
  byArticle: { id: string; title: string; slug: string; published: boolean; views: number }[];
  bySource: { source: ViewSource; views: number }[];
};

/** Aggregates for the admin report. Read-only; callers must check the staff session. */
export async function getBlogReport(range: ReportRange): Promise<BlogReport> {
  const inRange = { viewedAt: { gte: range.startUtc, lt: range.endUtc } };
  const [totalViews, publishedCount, first, perPost, perSource, perDay] = await Promise.all([
    prisma.blogPageView.count({ where: inRange }),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.blogPageView.aggregate({ _min: { viewedAt: true } }),
    prisma.blogPageView.groupBy({ by: ['postId'], where: inRange, _count: { _all: true } }),
    prisma.blogPageView.groupBy({ by: ['source'], where: inRange, _count: { _all: true } }),
    prisma.$queryRaw<{ day: string; views: number }[]>`
      SELECT to_char(("viewedAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') AS day,
             count(*)::int AS views
      FROM "BlogPageView"
      WHERE "viewedAt" >= ${range.startUtc} AND "viewedAt" < ${range.endUtc}
      GROUP BY 1`,
  ]);

  const counts = new Map(perPost.map((r) => [r.postId, r._count._all]));
  // Every published article (including those with no views yet) plus any unpublished
  // article that received views in the range while it was published.
  const posts = await prisma.blogPost.findMany({
    where: { OR: [{ published: true }, { id: { in: [...counts.keys()] } }] },
    select: { id: true, title: true, slug: true, published: true },
  });
  const byArticle = posts
    .map((p) => ({ ...p, views: counts.get(p.id) ?? 0 }))
    .sort((a, b) => b.views - a.views || a.title.localeCompare(b.title));

  const dayMap = new Map(perDay.map((r) => [r.day, r.views]));
  const sourceMap = new Map(perSource.map((r) => [r.source, r._count._all]));

  return {
    totalViews,
    publishedCount,
    articlesViewed: counts.size,
    collectionStartedAt: first._min.viewedAt,
    byDay: range.days.map((day) => ({ day, views: dayMap.get(day) ?? 0 })),
    byArticle,
    bySource: VIEW_SOURCES.map((source) => ({ source, views: sourceMap.get(source) ?? 0 })),
  };
}

export { istDay };
