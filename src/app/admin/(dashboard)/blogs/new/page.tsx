import BlogForm from "@/presentation/components/BlogForm";
import { listAuthors, listTags, listTypes } from "@/lib/blog/queries";

export const dynamic = "force-dynamic";

export default async function NewBlogPage() {
  const [authors, types, tags] = await Promise.all([listAuthors(false), listTypes(false), listTags(false)]);
  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-ink">New article</h1>
        <p className="text-ink/60 text-sm mt-1">Save a draft at any time. Publishing needs an author, a blog type and the article text.</p>
      </div>
      <BlogForm authors={authors} types={types} tags={tags} />
    </div>
  );
}
