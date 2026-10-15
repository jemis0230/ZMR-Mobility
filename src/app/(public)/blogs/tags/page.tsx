import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { listTags, listTypes } from "@/lib/blog/queries";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog Topics | ZMR Mobility",
  description: "Browse ZMR Mobility articles by topic.",
  alternates: { canonical: "/blogs/tags" },
};

/** Public tag directory: only tags on published articles, with published counts. */
export default async function BlogTagsPage() {
  const [tags, types] = await Promise.all([
    listTags(true).catch(() => []),
    listTypes(true).catch(() => []),
  ]);
  const usedTypes = types.filter((t) => t.count > 0);

  return (
    <main className="min-h-screen bg-cream pt-24 lg:pt-40 pb-20 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/blogs" className="inline-flex items-center gap-2 min-h-[44px] text-primary-dark font-bold text-xs uppercase tracking-widest hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" aria-hidden /> All articles
        </Link>
        <h1 className="mt-4 text-4xl md:text-6xl font-black text-forest leading-tight">Blog topics</h1>
        <p className="mt-3 text-lg text-ink/80">Choose a topic to see the articles about it.</p>

        {tags.length > 0 ? (
          <ul className="mt-10 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" aria-label="Topics">
            {tags.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/blogs?tag=${t.slug}`}
                  className="flex items-center justify-between gap-3 min-h-[56px] rounded-2xl bg-white border border-ink/10 px-5 shadow-card hover:border-primary hover:shadow-card-hover transition-all"
                >
                  <span className="font-bold text-forest break-words min-w-0">#{t.name}</span>
                  <span className="shrink-0 rounded-full bg-tint px-2.5 py-0.5 text-xs font-bold text-forest">
                    {t.count}<span className="sr-only"> article{t.count === 1 ? "" : "s"}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 rounded-3xl bg-white border border-dashed border-ink/20 py-16 px-4 text-center text-ink/75">
            Topics will appear here once tagged articles are published.
          </p>
        )}

        {usedTypes.length > 0 && (
          <section aria-labelledby="types-title" className="mt-14">
            <h2 id="types-title" className="text-2xl font-black text-forest">Article types</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {usedTypes.map((t) => (
                <li key={t.id}>
                  <Link href={`/blogs?type=${t.slug}`} className="inline-flex items-center gap-2 min-h-[44px] rounded-full bg-lime px-4 text-sm font-bold text-forest hover:bg-lime/70">
                    {t.name} <span className="text-forest/70">{t.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
