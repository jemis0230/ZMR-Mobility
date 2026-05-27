import { ok, badRequest, notFound, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import { PrismaBlogRepository } from '@/infrastructure/repositories/PrismaBlogRepository';
import { revalidatePath } from 'next/cache';

const repo = new PrismaBlogRepository();

// GET /api/blogs/[id]
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const blog = await repo.findById(id);
    if (!blog) return notFound('Blog');
    return ok(blog);
  } catch (error) {
    return serverError(error);
  }
}

// PUT /api/blogs/[id]
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { id } = await params;
    const existing = await repo.findById(id);
    if (!existing) return notFound('Blog');

    const body = await req.json();
    if (!body.title?.trim()) return badRequest('Title is required');

    const blog = await repo.update(id, body);
    revalidatePath('/blogs');
    revalidatePath(`/blogs/${blog.slug}`);
    revalidatePath('/admin/blogs');
    return ok(blog);
  } catch (error) {
    return serverError(error);
  }
}

// DELETE /api/blogs/[id]
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const { id } = await params;
    const existing = await repo.findById(id);
    if (!existing) return notFound('Blog');

    await repo.delete(id);
    revalidatePath('/blogs');
    revalidatePath('/admin/blogs');
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
