"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, User, Zap } from "lucide-react";
import { useState } from "react";

export default function BlogCard({ blog, index }: { blog: any; index: number }) {
  const [coverLoaded, setCoverLoaded] = useState(false);
  // Simple reading time calculation
  const wordsPerMinute = 200;
  const wordCount = blog.content.split(/\s+/g).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);

  return (
     <div
    >
      <Link 
        href={`/blogs/${blog.slug}`}
        className="group block relative h-full rounded-2xl bg-white border border-ink/10 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all duration-300 overflow-hidden"
      >
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {blog.coverImage ? (
            <>
              {/* EV shimmer overlay — fades out when image loads */}
              <div className={`absolute inset-0 ev-shimmer-base z-10 transition-opacity duration-500 pointer-events-none ${coverLoaded ? 'opacity-0' : 'opacity-100'}`}>
                <div className="ev-shimmer-sweep" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-[#577440]/15 animate-pulse" />
                </div>
              </div>
              <Image
                src={blog.coverImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                onLoad={() => setCoverLoaded(true)}
              />
            </>
          ) : (
            <div className="w-full h-full ev-shimmer-base flex items-center justify-center">
              <span className="text-[#577440]/10 font-black text-4xl">ZMR</span>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 rounded-full bg-lime border border-forest/10 text-[10px] font-black uppercase tracking-widest text-forest">
              {blog.category}
            </span>
          </div>

                  </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-ink/75">
            <span className="flex items-center gap-1.5">
              <User className="w-3 h-3 text-leaf" aria-hidden />
              {blog.authorName}
            </span>
            <time dateTime={new Date(blog.createdAt).toISOString()}>
              {new Date(blog.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </time>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-leaf" aria-hidden />
              {readTime} min read
            </span>
          </div>

          <h2 className="text-xl font-black text-forest group-hover:text-primary transition-colors leading-tight line-clamp-2">
            {blog.title}
          </h2>

          {blog.excerpt && (
            <p className="text-ink/80 text-sm leading-relaxed line-clamp-3">{blog.excerpt}</p>
          )}

          {Array.isArray(blog.tags) && blog.tags.length > 0 && (
            <ul className="flex flex-wrap gap-1.5" aria-label="Topics">
              {blog.tags.slice(0, 3).map((t: string) => (
                <li key={t} className="rounded-full bg-tint px-2.5 py-0.5 text-[11px] font-semibold text-forest">#{t}</li>
              ))}
            </ul>
          )}

          <div className="pt-2 flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-[0.2em]">
            Read Full Article
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </div>
  );
}
