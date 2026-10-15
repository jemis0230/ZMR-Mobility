import "server-only";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { sanitizeArticleHtml, textLength } from "./sanitize";
import {
  cleanName, nameKey, slugify, RESERVED_ARTICLE_SLUGS,
  TAG_NAME_MAX, AUTHOR_NAME_MAX, DESIGNATION_MAX, TYPE_NAME_MAX, MAX_TAGS_PER_POST,
} from "./text";

// Blog writes. Callers are responsible for checking the staff session first
// (see src/app/actions/blogActions.ts and the /api/blogs routes).

export type Result<T> = { success: true; data: T } | { success: false; error: string; field?: string };

const ok = <T>(data: T): Result<T> => ({ success: true, data });
const fail = (error: string, field?: string): Result<never> => ({ success: false, error, field });

class FieldError extends Error {
  constructor(message: string, readonly field?: string) { super(message); }
}

/** Run `fn`, turning validation and known database errors into a failed Result. */
async function attempt<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (e) {
    if (e instanceof FieldError) return fail(e.message, e.field);
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") return fail("That name or slug is already in use.");
      if (e.code === "P2003") return fail("This item is still used by blog posts. Reassign them first.");
      if (e.code === "P2025") return fail("The item no longer exists. Refresh the page and try again.");
    }
    console.error("[blog] write failed", e);
    return fail("Something went wrong while saving. Please try again.");
  }
}

type Tx = Prisma.TransactionClient;

const nameField = (label: string, max: number) =>
  z.string({ error: `${label} is required.` })
    .transform(cleanName)
    .pipe(z.string().min(1, `${label} is required.`).max(max, `${label} must be ${max} characters or fewer.`));

function parse<S extends z.ZodTypeAny>(schema: S, input: unknown): z.output<S> {
  const r = schema.safeParse(input);
  if (!r.success) {
    const issue = r.error.issues[0];
    throw new FieldError(issue?.message ?? "Invalid input.", issue?.path?.[0]?.toString());
  }
  return r.data;
}

/** Slug for `base` that no other tag uses, now or as a kept old slug. */
async function freeTagSlug(tx: Tx, base: string, selfId?: string): Promise<string> {
  const root = base || "tag";
  for (let i = 1; ; i++) {
    const slug = i === 1 ? root : `${root}-${i}`;
    const [tag, redirect] = await Promise.all([
      tx.blogTag.findUnique({ where: { slug }, select: { id: true } }),
      tx.blogTagRedirect.findUnique({ where: { fromSlug: slug }, select: { tagId: true } }),
    ]);
    const tagFree = !tag || tag.id === selfId;
    const redirectFree = !redirect || redirect.tagId === selfId;
    if (tagFree && redirectFree) return slug;
  }
}

async function freeTypeSlug(tx: Tx, base: string, selfId?: string): Promise<string> {
  const root = base || "type";
  for (let i = 1; ; i++) {
    const slug = i === 1 ? root : `${root}-${i}`;
    const t = await tx.blogType.findUnique({ where: { slug }, select: { id: true } });
    if (!t || t.id === selfId) return slug;
  }
}

// ── Tags ──────────────────────────────────────────────────────────────────────

const TagName = z.object({ name: nameField("Tag name", TAG_NAME_MAX) });

export function createTag(input: unknown) {
  return attempt(async () => {
    const { name } = parse(TagName, input);
    return prisma.$transaction(async (tx) => {
      const dup = await tx.blogTag.findUnique({ where: { nameKey: nameKey(name) }, select: { name: true } });
      if (dup) throw new FieldError(`A tag called “${dup.name}” already exists.`, "name");
      const slug = await freeTagSlug(tx, slugify(name));
      return tx.blogTag.create({ data: { name, nameKey: nameKey(name), slug }, select: { id: true, name: true, slug: true } });
    });
  });
}

export function renameTag(id: string, input: unknown) {
  return attempt(async () => {
    const { name } = parse(TagName, input);
    return prisma.$transaction(async (tx) => {
      const tag = await tx.blogTag.findUniqueOrThrow({ where: { id } });
      const dup = await tx.blogTag.findUnique({ where: { nameKey: nameKey(name) }, select: { id: true, name: true } });
      if (dup && dup.id !== id) throw new FieldError(`A tag called “${dup.name}” already exists. Use Merge to combine them.`, "name");
      const slug = await freeTagSlug(tx, slugify(name), id);
      if (slug !== tag.slug) {
        // Keep the old public link working.
        await tx.blogTagRedirect.upsert({ where: { fromSlug: tag.slug }, create: { fromSlug: tag.slug, tagId: id }, update: { tagId: id } });
        await tx.blogTagRedirect.deleteMany({ where: { fromSlug: slug } });
      }
      return tx.blogTag.update({ where: { id }, data: { name, nameKey: nameKey(name), slug }, select: { id: true, name: true, slug: true } });
    });
  });
}

const MergeInput = z.object({
  sourceIds: z.array(z.string().min(1)).min(1, "Choose at least one tag to merge."),
  destinationId: z.string().min(1, "Choose the tag to keep."),
});

/** What a merge would change, for the confirmation dialog. */
export function previewTagMerge(input: unknown) {
  return attempt(async () => {
    const { sourceIds, destinationId } = parse(MergeInput, input);
    const sources = sourceIds.filter((s) => s !== destinationId);
    if (!sources.length) throw new FieldError("Choose at least one tag other than the one you keep.", "sourceIds");
    const [dest, srcTags, links] = await Promise.all([
      prisma.blogTag.findUniqueOrThrow({ where: { id: destinationId }, select: { name: true } }),
      prisma.blogTag.findMany({ where: { id: { in: sources } }, select: { id: true, name: true, _count: { select: { posts: true } } } }),
      prisma.blogPostTag.findMany({ where: { tagId: { in: sources } }, select: { postId: true } }),
    ]);
    if (srcTags.length !== sources.length) throw new FieldError("One of the selected tags no longer exists. Refresh and try again.");
    const postIds = Array.from(new Set(links.map((l) => l.postId)));
    const alreadyTagged = await prisma.blogPostTag.count({ where: { tagId: destinationId, postId: { in: postIds } } });
    return {
      destination: dest.name,
      sources: srcTags.map((t) => ({ name: t.name, posts: t._count.posts })),
      postsAffected: postIds.length,
      postsAlreadyTagged: alreadyTagged,
    };
  });
}

/** Move every post from the source tags to the destination, then remove the sources. Atomic. */
export function mergeTags(input: unknown) {
  return attempt(async () => {
    const { sourceIds, destinationId } = parse(MergeInput, input);
    const sources = sourceIds.filter((s) => s !== destinationId);
    if (!sources.length) throw new FieldError("Choose at least one tag other than the one you keep.", "sourceIds");
    return prisma.$transaction(async (tx) => {
      await tx.blogTag.findUniqueOrThrow({ where: { id: destinationId } });
      const srcTags = await tx.blogTag.findMany({ where: { id: { in: sources } }, select: { id: true, slug: true } });
      if (srcTags.length !== sources.length) throw new FieldError("One of the selected tags no longer exists. Refresh and try again.");
      const links = await tx.blogPostTag.findMany({ where: { tagId: { in: sources } }, select: { postId: true } });
      const postIds = Array.from(new Set(links.map((l) => l.postId)));
      if (postIds.length) {
        await tx.blogPostTag.createMany({ data: postIds.map((postId) => ({ postId, tagId: destinationId })), skipDuplicates: true });
      }
      // Old links to the merged tags (and their own old slugs) now lead to the destination.
      await tx.blogTagRedirect.updateMany({ where: { tagId: { in: sources } }, data: { tagId: destinationId } });
      await tx.blogTagRedirect.createMany({ data: srcTags.map((t) => ({ fromSlug: t.slug, tagId: destinationId })), skipDuplicates: true });
      await tx.blogTag.deleteMany({ where: { id: { in: sources } } }); // removes their post links only
      return { postsMoved: postIds.length, tagsRemoved: srcTags.length };
    });
  });
}

/** Delete a tag and its post links. Posts themselves are never deleted. */
export function deleteTag(id: string) {
  return attempt(async () => {
    const posts = await prisma.blogPostTag.count({ where: { tagId: id } });
    await prisma.blogTag.delete({ where: { id } });
    return { postsUntagged: posts };
  });
}

// ── Authors ───────────────────────────────────────────────────────────────────

const AuthorInput = z.object({
  name: nameField("Author name", AUTHOR_NAME_MAX),
  designation: nameField("Designation", DESIGNATION_MAX),
});

export function createAuthor(input: unknown) {
  return attempt(async () => {
    const { name, designation } = parse(AuthorInput, input);
    const dup = await prisma.blogAuthor.findUnique({ where: { nameKey: nameKey(name) }, select: { name: true } });
    if (dup) throw new FieldError(`An author called “${dup.name}” already exists.`, "name");
    return prisma.blogAuthor.create({ data: { name, nameKey: nameKey(name), designation }, select: { id: true, name: true, designation: true } });
  });
}

/** Edits the author record only; existing posts keep the byline they were saved with. */
export function updateAuthor(id: string, input: unknown) {
  return attempt(async () => {
    const { name, designation } = parse(AuthorInput, input);
    const dup = await prisma.blogAuthor.findUnique({ where: { nameKey: nameKey(name) }, select: { id: true, name: true } });
    if (dup && dup.id !== id) throw new FieldError(`An author called “${dup.name}” already exists.`, "name");
    return prisma.blogAuthor.update({ where: { id }, data: { name, nameKey: nameKey(name), designation }, select: { id: true, name: true, designation: true } });
  });
}

/** Delete an author. If posts use them, `reassignToId` must name another author for those posts. */
export function deleteAuthor(id: string, reassignToId?: string | null) {
  return attempt(async () =>
    prisma.$transaction(async (tx) => {
      const used = await tx.blogPost.count({ where: { authorId: id } });
      if (used > 0) {
        if (!reassignToId || reassignToId === id) {
          throw new FieldError(`This author is on ${used} post${used === 1 ? "" : "s"}. Choose another author for them first.`, "reassignToId");
        }
        const to = await tx.blogAuthor.findUnique({ where: { id: reassignToId } });
        if (!to) throw new FieldError("The replacement author no longer exists.", "reassignToId");
        // An explicit reassignment: the byline becomes the new author's.
        await tx.blogPost.updateMany({ where: { authorId: id }, data: { authorId: to.id, authorName: to.name, authorDesignation: to.designation } });
      }
      await tx.blogAuthor.delete({ where: { id } });
      return { postsReassigned: used };
    }),
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────

const TypeInput = z.object({ name: nameField("Type name", TYPE_NAME_MAX) });

export function createType(input: unknown) {
  return attempt(async () => {
    const { name } = parse(TypeInput, input);
    return prisma.$transaction(async (tx) => {
      const dup = await tx.blogType.findUnique({ where: { nameKey: nameKey(name) }, select: { name: true } });
      if (dup) throw new FieldError(`A type called “${dup.name}” already exists.`, "name");
      const slug = await freeTypeSlug(tx, slugify(name));
      return tx.blogType.create({ data: { name, nameKey: nameKey(name), slug }, select: { id: true, name: true, slug: true } });
    });
  });
}

export function renameType(id: string, input: unknown) {
  return attempt(async () => {
    const { name } = parse(TypeInput, input);
    return prisma.$transaction(async (tx) => {
      const dup = await tx.blogType.findUnique({ where: { nameKey: nameKey(name) }, select: { id: true, name: true } });
      if (dup && dup.id !== id) throw new FieldError(`A type called “${dup.name}” already exists.`, "name");
      const slug = await freeTypeSlug(tx, slugify(name), id);
      return tx.blogType.update({ where: { id }, data: { name, nameKey: nameKey(name), slug }, select: { id: true, name: true, slug: true } });
    });
  });
}

export function deleteType(id: string, reassignToId?: string | null) {
  return attempt(async () =>
    prisma.$transaction(async (tx) => {
      const used = await tx.blogPost.count({ where: { typeId: id } });
      if (used > 0) {
        if (!reassignToId || reassignToId === id) {
          throw new FieldError(`This type is used by ${used} post${used === 1 ? "" : "s"}. Choose another type for them first.`, "reassignToId");
        }
        await tx.blogType.findUniqueOrThrow({ where: { id: reassignToId } });
        await tx.blogPost.updateMany({ where: { typeId: id }, data: { typeId: reassignToId } });
      }
      await tx.blogType.delete({ where: { id } });
      return { postsReassigned: used };
    }),
  );
}

// ── Posts ─────────────────────────────────────────────────────────────────────

const optionalText = (max: number) =>
  z.string().optional().nullable().transform((v) => (v ?? "").trim()).pipe(z.string().max(max));
const optionalId = z.string().optional().nullable().transform((v) => v || null);

const PostInput = z.object({
  title: nameField("Title", 200),
  slug: z.string().optional().default(""),
  excerpt: optionalText(500),
  category: optionalText(60),
  coverImage: optionalText(1000).refine((v) => !v || /^https?:\/\//i.test(v) || v.startsWith("/"), "Cover image must be an uploaded image or an http(s) URL."),
  content: z.string().optional().default(""),
  published: z.boolean().optional().default(false),
  authorId: optionalId,
  typeId: optionalId,
  tagIds: z.array(z.string().min(1)).optional().default([]),
  /** Re-copy the author's current name and designation into this post's byline. */
  refreshByline: z.boolean().optional().default(false),
});

export type SavedPost = { id: string; slug: string; published: boolean };

export function savePost(id: string | null, input: unknown) {
  return attempt<SavedPost>(async () => {
    const d = parse(PostInput, input);
    const slug = slugify(d.slug || d.title);
    if (!slug) throw new FieldError("Enter a URL slug using letters or numbers.", "slug");
    if (RESERVED_ARTICLE_SLUGS.has(slug)) throw new FieldError(`“${slug}” is reserved. Choose another slug.`, "slug");
    const tagIds = Array.from(new Set(d.tagIds));
    if (tagIds.length > MAX_TAGS_PER_POST) throw new FieldError(`Use at most ${MAX_TAGS_PER_POST} tags.`, "tagIds");
    const content = sanitizeArticleHtml(d.content);

    if (d.published) {
      if (!textLength(content)) throw new FieldError("Write the article before publishing.", "content");
      if (!d.authorId) throw new FieldError("Choose an author before publishing.", "authorId");
      if (!d.typeId) throw new FieldError("Choose a blog type before publishing.", "typeId");
    }

    return prisma.$transaction(async (tx) => {
      const existing = id ? await tx.blogPost.findUnique({ where: { id } }) : null;
      if (id && !existing) throw new FieldError("This article no longer exists.");

      const clash = await tx.blogPost.findUnique({ where: { slug }, select: { id: true } });
      if (clash && clash.id !== id) throw new FieldError("Another article already uses this slug.", "slug");

      const author = d.authorId ? await tx.blogAuthor.findUnique({ where: { id: d.authorId } }) : null;
      if (d.authorId && !author) throw new FieldError("The selected author no longer exists.", "authorId");
      if (d.typeId && !(await tx.blogType.findUnique({ where: { id: d.typeId }, select: { id: true } }))) {
        throw new FieldError("The selected blog type no longer exists.", "typeId");
      }
      if (tagIds.length && (await tx.blogTag.count({ where: { id: { in: tagIds } } })) !== tagIds.length) {
        throw new FieldError("A selected tag no longer exists. Refresh and try again.", "tagIds");
      }

      // Byline snapshot: copied from the author when first chosen, when the author changes,
      // or when staff ask for it — never silently when the author record is edited later.
      let byline: { authorName?: string; authorDesignation?: string | null } = {};
      if (author) {
        const needsCopy = !existing || existing.authorId !== author.id || !existing.authorDesignation || d.refreshByline;
        if (needsCopy) byline = { authorName: author.name, authorDesignation: author.designation };
      }
      if (d.published && !(byline.authorDesignation ?? existing?.authorDesignation)) {
        throw new FieldError("The author needs a designation before publishing.", "authorId");
      }

      const data = {
        title: d.title,
        slug,
        excerpt: d.excerpt || null,
        category: d.category || existing?.category || "General",
        coverImage: d.coverImage || null,
        content,
        published: d.published,
        authorId: d.authorId,
        typeId: d.typeId,
        ...byline,
        ...(d.published && !existing?.publishedAt ? { publishedAt: new Date() } : {}),
      };

      const post = existing
        ? await tx.blogPost.update({ where: { id: existing.id }, data, select: { id: true, slug: true, published: true } })
        : await tx.blogPost.create({ data, select: { id: true, slug: true, published: true } });

      await tx.blogPostTag.deleteMany({ where: { postId: post.id, tagId: { notIn: tagIds } } });
      if (tagIds.length) {
        await tx.blogPostTag.createMany({ data: tagIds.map((tagId) => ({ postId: post.id, tagId })), skipDuplicates: true });
      }
      return post;
    });
  });
}

/** Delete a post (and its tag links). */
export function deletePost(id: string) {
  return attempt(async () => {
    const post = await prisma.blogPost.delete({ where: { id }, select: { slug: true } });
    return post;
  });
}
