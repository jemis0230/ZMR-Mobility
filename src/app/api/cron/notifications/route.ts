import { timingSafeEqual } from 'node:crypto';
import { processDueNotifications } from '@/lib/notifications/outbox';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Scheduled notification worker. Called by Vercel Cron (which sends
// "Authorization: Bearer $CRON_SECRET") and by the self-hosted "notifier" container.
// Refuses to run when CRON_SECRET is not set, so it can never be triggered publicly.
function authorised(req: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const got = Buffer.from(req.headers.get('authorization') ?? '');
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

async function run(req: Request) {
  if (!authorised(req)) return Response.json({ success: false, error: 'Not authorised' }, { status: 401 });
  let total = { processed: 0, accepted: 0, retrying: 0, failed: 0, notConfigured: 0 };
  // Drain in batches, bounded so one run stays well inside the time limit.
  for (let i = 0; i < 5; i++) {
    const r = await processDueNotifications({ limit: 20 });
    total = Object.fromEntries(Object.entries(total).map(([k, v]) => [k, v + r[k as keyof typeof r]])) as typeof total;
    if (r.processed < 20) break;
  }
  return Response.json({ success: true, data: total });
}

export const GET = run;
export const POST = run;
