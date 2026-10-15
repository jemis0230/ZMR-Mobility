import { revalidatePath } from 'next/cache';
import { ok, badRequest, notFound, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import { getSession } from '@/lib/auth';
import { getPostById } from '@/lib/blog/queries';
import { savePost, deletePost } from '@/lib/blog/mutations';

type Ctx = { params: Promise<{ id: string }> };

const refresh = () => {
  revalidatePath('/blogs', 'layout');
  revalidatePath('/admin/blogs', 'layout');
};

// GET /api/blogs/[id] — drafts are visible to signed-in staff only.
export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const blog = await getPostById(id);
    if (!blog || (!blog.published && !(await getSession()))) return notFound('Blog');
    return ok(blog);
  } catch (error) {
    return serverError(error);
  }
}

// PUT /api/blogs/[id] — staff only.
export async function PUT(req: Request, { params }: Ctx) {
  const session = await withSession();
  if (isResponse(session)) return session;
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return badRequest('Invalid request.');
  const res = await savePost(id, body);
  if (!res.success) return badRequest(res.error, { field: res.field });
  refresh();
  return ok(res.data);
}

// DELETE /api/blogs/[id] — staff only.
export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await withSession();
  if (isResponse(session)) return session;
  const { id } = await params;
  const res = await deletePost(id);
  if (!res.success) return notFound('Blog');
  refresh();
  return ok({ deleted: true });
}
