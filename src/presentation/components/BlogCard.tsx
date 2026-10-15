"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User, Zap } from "lucide-react";
import { useState } from "react";

export type BlogCardPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  readMinutes: number;
  coverImage: string | null;
  category: string;
  authorId: string | null;
  authorName: string;
  authorDesignation: string | null;
  displayDate: Date | string;
  type: { name: string; slug: string } | null;
  tags: { id: string; name: string; slug: string }[];
};

export default function BlogCard({ blog }: { blog: BlogCardPost; index?: number }) {
  const [coverLoaded, setCoverLoaded] = useState(false);
  const date = new Date(blog.displayDate);

  return (
    <article className="group relative flex h-full flex-col rounded-2xl bg-white border border-ink/10 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-300 overflow-hidden">
      <div className="relative aspect-[16/10] overflow-hidden">
        {blog.coverImage ? (
          <>
            <div className={`absolute inset-0 ev-shimmer-base z-10 transition-opacity duration-500 pointer-events-none ${coverLoaded ? "opacity-0" : "opacity-100"}`}>
              <div className="ev-shimmer-sweep" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Zap className="w-8 h-8 text-[#577440]/15 animate-pulse" aria-hidden />
              </div>
            </div>
            <Image
              src={blog.coverImage}
              alt=""
              fill
              sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              onLoad={() => setCoverLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full h-full ev-shimmer-base flex items-center justify-center">
            <span className="text-[#577440]/10 font-black text-4xl" aria-hidden>ZMR</span>
          </div>
        )}
        <div className="absolute top-4 left-4 z-10">
          <span className="px-3 py-1 rounded-full bg-lime border border-forest/10 text-[11px] font-black uppercase tracking-widest text-forest">
            {blog.type?.name ?? blog.category}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6 gap-4">
        <h2 className="text-xl font-black text-forest group-hover:text-primary transition-colors leading-tight line-clamp-2">
          {/* Stretched link: the whole card opens the article; tag links sit above it. */}
          <Link href={`/blogs/${blog.slug}`} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-primary focus-visible:after:rounded-2xl">
            {blog.title}
          </Link>
        </h2>

        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink/80">
          <User className="w-3.5 h-3.5 text-leaf" aria-hidden />
          <span>
            By <span className="font-bold text-forest">{blog.authorName}</span>
            {blog.authorDesignation && <> · {blog.authorDesignation}</>}
          </span>
        </p>

        {blog.excerpt && <p className="text-ink/80 text-sm leading-relaxed line-clamp-3">{blog.excerpt}</p>}

        {blog.tags.length > 0 && (
          <ul className="relative z-10 flex flex-wrap gap-1.5" aria-label="Topics">
            {blog.tags.slice(0, 4).map((t) => (
              <li key={t.id}>
                <Link href={`/blogs?tag=${t.slug}`} className="inline-flex min-h-[32px] items-center rounded-full bg-tint px-3 text-xs font-semibold text-forest hover:bg-lime">
                  #{t.name}
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-2 flex flex-wrap items-center justify-between gap-2 text-[12px] font-semibold text-ink/70">
          <span className="flex items-center gap-3">
            <time dateTime={date.toISOString()}>{date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</time>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-leaf" aria-hidden />{blog.readMinutes} min read</span>
          </span>
          <span className="flex items-center gap-1.5 text-primary-dark font-bold uppercase tracking-[0.15em]" aria-hidden>
            Read <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </article>
  );
}
