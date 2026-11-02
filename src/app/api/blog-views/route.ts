import { getSession } from '@/lib/auth';
import { recordBlogView } from '@/lib/blog/analytics';
import { isSameOrigin } from '@/app/api/_lib/origin';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };
const done = (status = 204) => new Response(null, { status, headers: NO_STORE });

// POST /api/blog-views — public, write-only. Counts one view of a published article,
// sent by the article page's script. Accepts only { slug, ref } from this site, never
// returns report data, and answers 204 whether or not the view was counted, so it
// reveals nothing. Read access to the numbers is in the admin area only.
export async function POST(req: Request) {
  if (!isSameOrigin(req)) return done(403);
  if (Number(req.headers.get('content-length') ?? 0) > 1024) return done(413);

  let body: { slug?: unknown; ref?: unknown } | null = null;
  try {
    body = await req.json();
  } catch {
    return done(400);
  }
  if (!body || typeof body !== 'object') return done(400);

  try {
    // Signed-in staff previews are not counted.
    const isStaff = !!(await getSession().catch(() => null));
    const result = await recordBlogView({ slug: body.slug, ref: body.ref, headers: req.headers, isStaff });
    return done(result === 'invalid' ? 400 : 204);
  } catch (e) {
    console.error('[blog-views] not recorded:', e instanceof Error ? e.name : 'unknown error');
    return done(204);
  }
}
