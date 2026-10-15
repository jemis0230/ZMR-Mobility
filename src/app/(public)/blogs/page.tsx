import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import { X, Tags } from "lucide-react";
import { listAuthors, listPosts, listTags, listTypes, resolveTagParam, toCard } from "@/lib/blog/queries";
import BlogCard from "@/presentation/components/BlogCard";
import BlogFilters from "@/presentation/components/BlogFilters";
import Pagination from "@/presentation/components/Pagination";

export const revalidate = 300;

const PAGE_SIZE = 9;

type SP = { category?: string; q?: string; page?: string; tag?: string; type?: string; author?: string };

async function load(sp: SP) {
  try {
    const [types, tags, authors, tagMatch] = await Promise.all([
      listTypes(true),
      listTags(true),
      listAuthors(true),
      sp.tag ? resolveTagParam(sp.tag) : Promise.resolve(null),
    ]);
    return { types, tags, authors, tagMatch, failed: false };
  } catch (e) {
    console.error("[blogs] taxonomy unavailable", e);
    return { types: [], tags: [], authors: [], tagMatch: null, failed: true };
  }
}

export async function generateMetadata(props: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await props.searchParams;
  const { tagMatch, types } = await load(sp);
  const type = types.find((t) => t.slug === sp.type);
  if (tagMatch) {
    return {
      title: `${tagMatch.tag.name} — Articles | ZMR Mobility Blog`,
      description: `ZMR Mobility articles about ${tagMatch.tag.name}.`,
      alternates: { canonical: `/blogs?tag=${tagMatch.tag.slug}` },
    };
  }
  if (type) {
    return {
      title: `${type.name} — Articles | ZMR Mobility Blog`,
      alternates: { canonical: `/blogs?type=${type.slug}` },
    };
  }
  return {
    title: "Blogs & Insights | ZMR Mobility",
    description: "Explore the latest trends, technology, and insights in the electric vehicle industry.",
    alternates: { canonical: "/blogs" },
  };
}

export default async function BlogsPage(props: { searchParams: Promise<SP> }) {
  const sp = await props.searchParams;
  const page = Math.max(1, parseInt(sp.page || "1") || 1);
  const { types, tags, authors, tagMatch } = await load(sp);

  // Old links (tag names, renamed or merged tags) move to the tag's current address.
  if (sp.tag && tagMatch && !tagMatch.canonical) {
    const next = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
    next.set("tag", tagMatch.tag.slug);
    permanentRedirect(`/blogs?${next.toString()}`);
  }
  const unknownTag = !!sp.tag && !tagMatch;
  const params = new URLSearchParams();
  for (const k of ["q", "type", "tag", "author", "category"] as const) if (sp[k]) params.set(k, sp[k]!);
  const filtered = params.toString() !== "";

  const typeName = types.find((t) => t.slug === sp.type)?.name;
  const author = authors.find((a) => a.id === sp.author);
  const active = [
    sp.q && { key: "q", label: `“${sp.q}”` },
    typeName && { key: "type", label: `Type: ${typeName}` },
    tagMatch && { key: "tag", label: `Topic: #${tagMatch.tag.name}` },
    unknownTag && { key: "tag", label: `Topic: ${sp.tag}` },
    author && { key: "author", label: `Author: ${author.name}` },
    sp.category && { key: "category", label: `Category: ${sp.category}` },
  ].filter(Boolean) as { key: string; label: string }[];
  const without = (key: string) => {
    const n = new URLSearchParams(params);
    n.delete(key);
    return n.toString() ? `/blogs?${n.toString()}` : "/blogs";
  };

  return (
    <main className="min-h-screen bg-cream pt-24 lg:pt-40 pb-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 space-y-4">
          <p className="inline-block rounded-full bg-lime px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-forest">Industry insights</p>
          <h1 className="text-5xl md:text-7xl font-black text-forest leading-tight">
            The ZMR <span className="text-leaf">Journal</span>
          </h1>
          <p className="text-ink/80 max-w-2xl mx-auto text-lg leading-relaxed">
            Deep dives into EV technology, sustainable fleet management, and the future of clean mobility in Bharat.
          </p>
        </div>

        <BlogFilters
          types={types.filter((t) => t.count > 0 || t.slug === sp.type).map((t) => ({ value: t.slug, label: `${t.name} (${t.count})` }))}
          tags={tags.map((t) => ({ value: t.slug, label: `${t.name} (${t.count})` }))}
          authors={authors.map((a) => ({ value: a.id, label: a.name }))}
        />

        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 text-sm">
          {active.map((f) => (
            <Link key={f.key + f.label} href={without(f.key)} className="inline-flex items-center gap-1.5 min-h-[36px] rounded-full bg-white border border-ink/15 px-3 font-semibold text-forest hover:border-primary">
              {f.label} <X className="w-3.5 h-3.5" aria-hidden /><span className="sr-only">(remove filter)</span>
            </Link>
          ))}
          {filtered && (
            <Link href="/blogs" className="inline-flex items-center min-h-[36px] rounded-full px-3 font-bold text-primary-dark hover:underline">
              Reset filters
            </Link>
          )}
          <Link href="/blogs/tags" className="inline-flex items-center gap-1.5 min-h-[36px] rounded-full px-3 font-bold text-primary-dark hover:underline">
            <Tags className="w-4 h-4" aria-hidden /> Browse all topics
          </Link>
        </div>

        {/* Only the results stream; redirects above are decided first, so they are real HTTP redirects. */}
        <Suspense key={`${params.toString()}|${page}`} fallback={<ResultsSkeleton />}>
          <Results sp={sp} page={page} tagId={tagMatch?.tag.id} unknownTag={unknownTag} params={params} filtered={filtered} />
        </Suspense>
      </div>
    </main>
  );
}

async function Results({ sp, page, tagId, unknownTag, params, filtered }: {
  sp: SP; page: number; tagId?: string; unknownTag: boolean; params: URLSearchParams; filtered: boolean;
}) {
  const { blogs, total } = unknownTag
    ? { blogs: [], total: 0 }
    : await listPosts({
        publishedOnly: true,
        search: sp.q?.trim() || undefined,
        category: sp.category || undefined,
        typeSlug: sp.type || undefined,
        tagId,
        authorId: sp.author || undefined,
        page,
        limit: PAGE_SIZE,
      }).catch((e) => {
        console.error("[blogs] list failed", e);
        return { blogs: [], total: 0 };
      });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
        {filtered && (
          <p className="sr-only" aria-live="polite">{total} article{total === 1 ? "" : "s"} found</p>
        )}

        {blogs.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((blog) => <BlogCard key={blog.id} blog={toCard(blog)} />)}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} basePath="/blogs" searchParams={params} />
          </>
        ) : (
          <div className="py-20 px-4 text-center rounded-3xl bg-white border border-dashed border-ink/20">
            <h2 className="text-2xl font-black text-forest">{unknownTag ? "Topic not found" : "No articles found"}</h2>
            <p className="text-ink/75 mt-2">
              {unknownTag
                ? "This topic no longer exists."
                : filtered ? "No published articles match these filters." : "New articles will appear here once they are published."}
            </p>
            {filtered && (
              <Link href="/blogs" className="mt-6 inline-flex items-center min-h-[44px] rounded-xl bg-primary px-6 text-sm font-bold text-white hover:bg-primary-dark">
                Show all articles
              </Link>
            )}
          </div>
        )}
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse" aria-busy="true" aria-label="Loading articles">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="rounded-2xl bg-white border border-ink/10 overflow-hidden">
          <div className="aspect-[16/10] bg-tint" />
          <div className="p-6 space-y-3">
            <div className="h-6 w-3/4 rounded-xl bg-ink/[0.07]" />
            <div className="h-4 w-1/2 rounded-xl bg-ink/[0.07]" />
            <div className="h-16 w-full rounded-xl bg-ink/[0.07]" />
          </div>
        </div>
      ))}
    </div>
  );
}
