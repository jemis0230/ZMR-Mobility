import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Clock, RefreshCw } from "lucide-react";
import { getBlogBySlugAction, getBlogsAction } from "@/app/actions/blogActions";
import BlogCard from "@/presentation/components/BlogCard";
import ShareLinks from "@/presentation/components/ShareLinks";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const revalidate = 300;

const fmtDate = (d: Date) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
const isTeamAuthor = (name: string) => /team|zmr mobility/i.test(name);

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const blog = await getBlogBySlugAction(slug);
  if (!blog || !blog.published) return { title: "Article not found | ZMR Mobility" };

  const description = blog.excerpt || blog.title;
  return {
    title: `${blog.title} | ZMR Mobility Blog`,
    description,
    alternates: { canonical: `/blogs/${blog.slug}` },
    authors: [{ name: blog.authorName }],
    keywords: blog.tags,
    openGraph: {
      type: "article",
      title: blog.title,
      description,
      url: `${SITE_URL}/blogs/${blog.slug}`,
      publishedTime: new Date(blog.createdAt).toISOString(),
      modifiedTime: new Date(blog.updatedAt).toISOString(),
      authors: [blog.authorName],
      section: blog.category,
      tags: blog.tags,
      ...(blog.coverImage ? { images: [{ url: blog.coverImage }] } : {}),
    },
  };
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const blog = await getBlogBySlugAction(slug);
  if (!blog || !blog.published) notFound();

  const { blogs: relatedPosts } = await getBlogsAction({ category: blog.category, publishedOnly: true, limit: 3 });
  const related = relatedPosts.filter((p) => p.id !== blog.id).slice(0, 2);

  const wordCount = blog.content.replace(/<[^>]+>/g, " ").split(/\s+/g).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  const published = new Date(blog.createdAt);
  const updated = new Date(blog.updatedAt);
  // Only show "Updated" when the article was edited at least a day after publishing.
  const showUpdated = updated.getTime() - published.getTime() > 24 * 60 * 60 * 1000;
  const url = `${SITE_URL}/blogs/${blog.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt || undefined,
    image: blog.coverImage ? [blog.coverImage.startsWith("http") ? blog.coverImage : `${SITE_URL}${blog.coverImage}`] : undefined,
    datePublished: published.toISOString(),
    dateModified: updated.toISOString(),
    author: isTeamAuthor(blog.authorName)
      ? { "@type": "Organization", name: blog.authorName, url: SITE_URL }
      : { "@type": "Person", name: blog.authorName },
    publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: `${SITE_URL}/zmr-logo-official.png` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: blog.category,
    keywords: blog.tags.length ? blog.tags.join(", ") : undefined,
    wordCount,
  };

  return (
    <main className="min-h-screen bg-cream pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <header className="pt-24 lg:pt-40 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/blogs" className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-6 hover:gap-3 transition-all">
            <ArrowLeft className="w-4 h-4" aria-hidden /> Back to Journal
          </Link>
          <Link href={`/blogs?category=${encodeURIComponent(blog.category)}`} className="inline-block ml-3 align-middle rounded-full bg-lime px-3 py-1 text-[11px] font-black uppercase tracking-widest text-forest">
            {blog.category}
          </Link>
          <h1 className="mt-5 text-4xl md:text-6xl font-black text-forest leading-tight">{blog.title}</h1>
          {blog.excerpt && <p className="mt-4 text-lg text-ink/80 leading-relaxed">{blog.excerpt}</p>}

          {/* Byline */}
          <div className="mt-6 pt-5 border-t border-ink/15 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink/80">
            <span className="flex items-center gap-3">
              <span aria-hidden className="w-10 h-10 rounded-full bg-forest text-lime flex items-center justify-center font-black">
                {blog.authorName.charAt(0).toUpperCase()}
              </span>
              <span>
                <span className="block text-[11px] uppercase tracking-widest text-ink/70">Written by</span>
                <span className="block font-bold text-forest">{blog.authorName}</span>
              </span>
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-leaf" aria-hidden />
              Published <time dateTime={published.toISOString()}>{fmtDate(published)}</time>
            </span>
            {showUpdated && (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-leaf" aria-hidden />
                Updated <time dateTime={updated.toISOString()}>{fmtDate(updated)}</time>
              </span>
            )}
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-leaf" aria-hidden /> {readTime} min read
            </span>
          </div>
        </div>

        {blog.coverImage && (
          <div className="max-w-5xl mx-auto mt-10 relative aspect-[16/9] rounded-3xl overflow-hidden bg-tint">
            <Image src={blog.coverImage} alt="" fill priority sizes="(min-width: 1024px) 1024px, 100vw" className="object-cover" />
          </div>
        )}
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 mt-12">
        <article
          className="prose prose-lg max-w-none prose-headings:text-forest prose-h2:text-3xl prose-h2:font-black prose-h3:text-2xl prose-h3:font-bold prose-p:text-ink/85 prose-p:leading-relaxed prose-a:text-primary-dark prose-strong:text-forest prose-img:rounded-3xl prose-blockquote:border-primary prose-blockquote:bg-tint prose-blockquote:p-6 prose-blockquote:rounded-2xl prose-blockquote:not-italic"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {blog.tags.length > 0 && (
          <nav aria-label="Article topics" className="mt-10 flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-ink/75 mr-1">Topics:</span>
            {blog.tags.map((t) => (
              <Link key={t} href={`/blogs?tag=${encodeURIComponent(t)}`} className="rounded-full bg-white border border-ink/15 px-3 py-1.5 text-xs font-bold text-forest hover:border-primary hover:bg-lime/40">
                #{t}
              </Link>
            ))}
          </nav>
        )}

        <div className="mt-10 pt-8 border-t border-ink/15">
          <ShareLinks url={url} title={blog.title} />
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="mt-24 pt-16 border-t border-ink/10 bg-tint">
          <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-primary text-xs font-bold uppercase tracking-widest">More for you</p>
                <h2 id="related-title" className="text-3xl md:text-4xl font-black text-forest mt-2">Related articles</h2>
              </div>
              <Link href="/blogs" className="text-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                View all <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
              {related.map((post, i) => <BlogCard key={post.id} blog={post} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
