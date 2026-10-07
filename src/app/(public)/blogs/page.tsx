import type { Metadata } from "next";
import Link from "next/link";
import { X } from "lucide-react";
import { getBlogsAction, getBlogCategoriesAction, getBlogTagsAction } from "@/app/actions/blogActions";
import BlogCard from "@/presentation/components/BlogCard";
import BlogFilters from "@/presentation/components/BlogFilters";
import Pagination from "@/presentation/components/Pagination";

export const revalidate = 300;

const PAGE_SIZE = 9;

export async function generateMetadata(props: { searchParams: Promise<{ tag?: string }> }): Promise<Metadata> {
  const { tag } = await props.searchParams;
  if (tag) {
    return {
      title: `${tag} — Articles | ZMR Mobility Blog`,
      description: `ZMR Mobility articles about ${tag}.`,
      alternates: { canonical: `/blogs?tag=${encodeURIComponent(tag)}` },
    };
  }
  return {
    title: "Blogs & Insights | ZMR Mobility",
    description: "Explore the latest trends, technology, and insights in the electric vehicle industry.",
    alternates: { canonical: "/blogs" },
  };
}

export default async function BlogsPage(props: {
  searchParams: Promise<{ category?: string; q?: string; page?: string; tag?: string }>;
}) {
  const { category, q: query, tag, page: pageRaw } = await props.searchParams;
  const page = Math.max(1, parseInt(pageRaw || "1") || 1);

  const [blogsData, categories, tags] = await Promise.all([
    getBlogsAction({ category, search: query, tag, page, publishedOnly: true, limit: PAGE_SIZE }),
    getBlogCategoriesAction(),
    getBlogTagsAction(),
  ]);

  const { blogs, total } = blogsData;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (query) params.set("q", query);
  if (tag) params.set("tag", tag);

  return (
    <main className="min-h-screen bg-cream pt-24 lg:pt-40 pb-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <p className="inline-block rounded-full bg-lime px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-forest">Industry insights</p>
          <h1 className="text-5xl md:text-7xl font-black text-forest leading-tight">
            The ZMR <span className="text-leaf">Journal</span>
          </h1>
          <p className="text-ink/80 max-w-2xl mx-auto text-lg leading-relaxed">
            Deep dives into EV technology, sustainable fleet management, and the future of clean mobility in Bharat.
          </p>
        </div>

        <BlogFilters categories={categories} />

        {tags.length > 0 && (
          <nav aria-label="Topics" className="mb-10 -mt-4 flex flex-wrap justify-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-ink/70 self-center mr-1">Topics:</span>
            {tags.slice(0, 20).map(({ tag: t, count }) => {
              const active = t === tag;
              const next = new URLSearchParams(params);
              next.delete("page");
              if (active) next.delete("tag"); else next.set("tag", t);
              const qs = next.toString();
              return (
                <Link
                  key={t}
                  href={qs ? `/blogs?${qs}` : "/blogs"}
                  aria-current={active ? "true" : undefined}
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${active ? "bg-lime border-forest/30 text-forest" : "bg-white border-ink/15 text-forest hover:border-primary"}`}
                >
                  #{t} <span className="text-ink/60 font-semibold">{count}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {tag && (
          <p className="mb-6 text-center text-sm text-forest">
            Showing articles tagged <strong>#{tag}</strong> ·{" "}
            <Link href="/blogs" className="inline-flex items-center gap-1 font-bold text-primary hover:underline">
              Clear <X className="w-3 h-3" aria-hidden />
            </Link>
          </p>
        )}

        {blogs.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog, i) => (
                <BlogCard key={blog.id} blog={blog} index={i} />
              ))}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} basePath="/blogs" searchParams={params} />
          </>
        ) : (
          <div className="py-24 text-center rounded-3xl bg-white border border-dashed border-ink/20">
            <h2 className="text-2xl font-black text-forest">No articles found</h2>
            <p className="text-ink/75 mt-2">
              {query || category || tag ? "Try adjusting your filters or search query." : "New articles will appear here once they are published."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
