import { notFound } from "next/navigation";
import BlogForm from "@/presentation/components/BlogForm";
import { getPostById, listAuthors, listTags, listTypes } from "@/lib/blog/queries";

export const dynamic = "force-dynamic";

export default async function EditBlogPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const [blog, authors, types, tags] = await Promise.all([getPostById(id), listAuthors(false), listTypes(false), listTags(false)]);
  if (!blog) notFound();

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink">Edit article</h1>
        {(!blog.authorId || !blog.typeId) && (
          <p className="mt-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-ink/80">
            This article was created before authors and blog types existed. Add {[!blog.authorId && "an author", !blog.typeId && "a blog type"].filter(Boolean).join(" and ")} when you next update it.
          </p>
        )}
      </div>
      <BlogForm
        initialData={{
          id: blog.id, title: blog.title, slug: blog.slug, excerpt: blog.excerpt, category: blog.category,
          coverImage: blog.coverImage, content: blog.content, published: blog.published,
          authorId: blog.authorId, authorName: blog.authorName, authorDesignation: blog.authorDesignation,
          typeId: blog.typeId, tags: blog.tags,
        }}
        authors={authors}
        types={types}
        tags={tags}
      />
    </div>
  );
}
