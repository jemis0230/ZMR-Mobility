import { revalidatePath } from 'next/cache';
import { ok, created, badRequest, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import { getSession } from '@/lib/auth';
import { listPosts } from '@/lib/blog/queries';
import { savePost } from '@/lib/blog/mutations';

// GET /api/blogs — published posts for everyone; drafts too for a signed-in staff member
// who asks for them with ?publishedOnly=false.
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wantsDrafts = searchParams.get('publishedOnly') === 'false';
    const publishedOnly = !(wantsDrafts && (await getSession()));
    const num = (k: string) => (searchParams.get(k) ? Number(searchParams.get(k)) || undefined : undefined);
    const result = await listPosts({
      publishedOnly,
      category: searchParams.get('category') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      typeSlug: searchParams.get('type') ?? undefined,
      authorId: searchParams.get('author') ?? undefined,
      page: num('page'),
      limit: num('limit'),
    });
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/blogs — staff only.
export async function POST(req: Request) {
  const session = await withSession();
  if (isResponse(session)) return session;
  const body = await req.json().catch(() => null);
  if (!body) return badRequest('Invalid request.');
  const res = await savePost(null, body);
  if (!res.success) return badRequest(res.error, { field: res.field });
  revalidatePath('/blogs', 'layout');
  revalidatePath('/admin/blogs', 'layout');
  return created(res.data);
}
