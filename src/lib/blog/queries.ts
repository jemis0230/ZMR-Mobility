import "server-only";
import type { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";
import { readMinutes } from "./text";

// Read-only blog queries. Public callers must pass `publishedOnly: true`; the admin
// area (behind the staff session) may read drafts.

const postInclude = {
  type: { select: { id: true, name: true, slug: true } },
  tagLinks: { select: { tag: { select: { id: true, name: true, slug: true } } } },
} satisfies Prisma.BlogPostInclude;

type PostRow = Prisma.BlogPostGetPayload<{ include: typeof postInclude }>;

export type BlogTagRef = { id: string; name: string; slug: string };
export type BlogTypeRef = { id: string; name: string; slug: string };

export type BlogPostView = Omit<PostRow, "tagLinks" | "tags"> & {
  tags: BlogTagRef[];
  /** Date shown to readers: first publication, or creation for drafts. */
  displayDate: Date;
};

function toView(row: PostRow): BlogPostView {
  // `rest.tags` (the legacy free-text column) is overridden by the managed tags below.
  const { tagLinks, ...rest } = row;
  return {
    ...rest,
    tags: tagLinks.map((l) => l.tag).sort((a, b) => a.name.localeCompare(b.name)),
    displayDate: row.publishedAt ?? row.createdAt,
  };
}

export type BlogListFilters = {
  publishedOnly: boolean;
  search?: string;
  category?: string;
  typeSlug?: string;
  tagId?: string;
  authorId?: string;
  /** Only posts without an author or a blog type (older posts needing completion). */
  missingMeta?: boolean;
  page?: number;
  limit?: number;
};

export async function listPosts(f: BlogListFilters): Promise<{ blogs: BlogPostView[]; total: number }> {
  const limit = Math.min(50, Math.max(1, f.limit ?? 10));
  const page = Math.max(1, f.page ?? 1);
  const where: Prisma.BlogPostWhereInput = {};
  if (f.publishedOnly) where.published = true;
  if (f.category) where.category = f.category;
  if (f.typeSlug) where.type = { slug: f.typeSlug };
  if (f.tagId) where.tagLinks = { some: { tagId: f.tagId } };
  if (f.authorId) where.authorId = f.authorId;
  if (f.missingMeta) where.AND = [{ OR: [{ authorId: null }, { typeId: null }] }];
  if (f.search) {
    where.OR = [
      { title: { contains: f.search, mode: "insensitive" } },
      { excerpt: { contains: f.search, mode: "insensitive" } },
      { content: { contains: f.search, mode: "insensitive" } },
    ];
  }
  const [rows, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      include: postInclude,
      orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.blogPost.count({ where }),
  ]);
  return { blogs: rows.map(toView), total };
}

export async function getPostBySlug(slug: string, publishedOnly: boolean): Promise<BlogPostView | null> {
  const row = await prisma.blogPost.findUnique({ where: { slug }, include: postInclude });
  if (!row || (publishedOnly && !row.published)) return null;
  return toView(row);
}

export async function getPostById(id: string): Promise<BlogPostView | null> {
  const row = await prisma.blogPost.findUnique({ where: { id }, include: postInclude });
  return row ? toView(row) : null;
}

/** Published posts sharing a type or tag with `post`, newest first. */
export async function relatedPosts(post: BlogPostView, take = 2): Promise<BlogPostView[]> {
  const or: Prisma.BlogPostWhereInput[] = [];
  if (post.typeId) or.push({ typeId: post.typeId });
  if (post.tags.length) or.push({ tagLinks: { some: { tagId: { in: post.tags.map((t) => t.id) } } } });
  or.push({ category: post.category });
  const rows = await prisma.blogPost.findMany({
    where: { published: true, id: { not: post.id }, OR: or },
    include: postInclude,
    orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
    take,
  });
  return rows.map(toView);
}

// ── Taxonomy ──────────────────────────────────────────────────────────────────

/** Tags with counts. Public callers count published posts only, and get only tags in use. */
export async function listTags(publishedOnly: boolean) {
  const tags = await prisma.blogTag.findMany({
    select: {
      id: true, name: true, slug: true,
      _count: { select: { posts: publishedOnly ? { where: { post: { published: true } } } : true } },
    },
    orderBy: { name: "asc" },
  });
  const out = tags.map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: t._count.posts }));
  return publishedOnly ? out.filter((t) => t.count > 0) : out;
}

export async function listTypes(publishedOnly: boolean) {
  const types = await prisma.blogType.findMany({
    select: {
      id: true, name: true, slug: true,
      _count: { select: { posts: publishedOnly ? { where: { published: true } } : true } },
    },
    orderBy: { name: "asc" },
  });
  return types.map((t) => ({ id: t.id, name: t.name, slug: t.slug, count: t._count.posts }));
}

export async function listAuthors(publishedOnly: boolean) {
  const authors = await prisma.blogAuthor.findMany({
    select: {
      id: true, name: true, designation: true,
      _count: { select: { posts: publishedOnly ? { where: { published: true } } : true } },
    },
    orderBy: { name: "asc" },
  });
  const out = authors.map((a) => ({ id: a.id, name: a.name, designation: a.designation, count: a._count.posts }));
  return publishedOnly ? out.filter((a) => a.count > 0) : out;
}

export async function listCategories(publishedOnly: boolean): Promise<string[]> {
  const rows = await prisma.blogPost.findMany({
    where: publishedOnly ? { published: true } : undefined,
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
}

/**
 * Resolve a `?tag=` value: a current slug, an old slug kept after a rename/merge, or a
 * legacy tag name (links from before managed tags used the name).
 */
export async function resolveTagParam(value: string): Promise<{ tag: BlogTagRef; canonical: boolean } | null> {
  const v = value.trim();
  if (!v) return null;
  const sel = { id: true, name: true, slug: true } as const;
  const bySlug = await prisma.blogTag.findUnique({ where: { slug: v }, select: sel });
  if (bySlug) return { tag: bySlug, canonical: true };
  const redirect = await prisma.blogTagRedirect.findUnique({ where: { fromSlug: v.toLowerCase() }, select: { tag: { select: sel } } });
  if (redirect) return { tag: redirect.tag, canonical: false };
  const byName = await prisma.blogTag.findUnique({ where: { nameKey: v.replace(/\s+/g, " ").toLowerCase() }, select: sel });
  if (byName) return { tag: byName, canonical: false };
  return null;
}

/** The subset of a post a listing card needs (no article body sent to the browser). */
export function toCard(p: BlogPostView) {
  return {
    id: p.id, slug: p.slug, title: p.title, excerpt: p.excerpt, coverImage: p.coverImage, category: p.category,
    authorId: p.authorId, authorName: p.authorName, authorDesignation: p.authorDesignation,
    displayDate: p.displayDate, type: p.type, tags: p.tags, readMinutes: readMinutes(p.content),
  };
}
