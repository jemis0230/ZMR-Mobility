import 'server-only';
import prisma from '@/lib/prisma';

// Fixed-window counters in Postgres, so limits hold across serverless instances
// (Vercel) and container restarts (self-hosted) without extra infrastructure.

export type Limit = { key: string; limit: number; windowSec: number };

/** Count one hit and report whether it is within the limit. */
export async function consume({ key, limit, windowSec }: Limit): Promise<{ allowed: boolean; retryAfterSec: number }> {
  const rows = await prisma.$queryRaw<{ count: number; windowStart: Date }[]>`
    INSERT INTO "RateLimitBucket" ("key", "count", "windowStart") VALUES (${key}, 1, now())
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimitBucket"."windowStart" < now() - make_interval(secs => ${windowSec}) THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
      "windowStart" = CASE WHEN "RateLimitBucket"."windowStart" < now() - make_interval(secs => ${windowSec}) THEN now() ELSE "RateLimitBucket"."windowStart" END
    RETURNING "count", "windowStart"`;
  const { count, windowStart } = rows[0];
  const retryAfterSec = Math.max(1, Math.ceil((windowStart.getTime() + windowSec * 1000 - Date.now()) / 1000));
  return { allowed: count <= limit, retryAfterSec };
}

/** Whether the key is already over its limit, without counting a hit. */
export async function isLimited({ key, limit, windowSec }: Limit): Promise<{ limited: boolean; retryAfterSec: number }> {
  const b = await prisma.rateLimitBucket.findUnique({ where: { key } });
  if (!b) return { limited: false, retryAfterSec: 0 };
  const ends = b.windowStart.getTime() + windowSec * 1000;
  if (ends <= Date.now()) return { limited: false, retryAfterSec: 0 };
  return { limited: b.count >= limit, retryAfterSec: Math.ceil((ends - Date.now()) / 1000) };
}

export async function resetLimit(key: string) {
  await prisma.rateLimitBucket.deleteMany({ where: { key } });
}

/** Client IP as reported by the hosting proxy (Vercel or Caddy). */
export function clientIp(headers: Headers): string {
  const fwd = headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim().slice(0, 64);
  return (headers.get('x-real-ip') ?? 'unknown').slice(0, 64);
}
