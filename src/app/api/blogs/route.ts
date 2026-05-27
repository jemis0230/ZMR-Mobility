import { ok, created, badRequest, serverError } from '@/app/api/_lib/response';
import { withSession, isResponse } from '@/app/api/_lib/auth-guard';
import { PrismaBlogRepository } from '@/infrastructure/repositories/PrismaBlogRepository';
import { revalidatePath } from 'next/cache';

const repo = new PrismaBlogRepository();

// GET /api/blogs
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') ?? undefined;
    const search = searchParams.get('search') ?? undefined;
    const publishedOnly = searchParams.get('publishedOnly') === 'true';
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : undefined;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

    const result = await repo.findAll({ category, search, publishedOnly, page, limit });
    return ok(result);
  } catch (error) {
    return serverError(error);
  }
}

// POST /api/blogs
export async function POST(req: Request) {
  try {
    const session = await withSession();
    if (isResponse(session)) return session;

    const body = await req.json();

    if (!body.title?.trim()) return badRequest('Title is required');
    if (!body.slug?.trim()) return badRequest('Slug is required');
    if (!body.content?.trim()) return badRequest('Content is required');

    const blog = await repo.create(body);
    revalidatePath('/blogs');
    revalidatePath('/admin/blogs');
    return created(blog);
  } catch (error) {
    return serverError(error);
  }
}
