"use client";

import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      viewport={{ once: true }}
    >
      <Link 
        href={`/blogs/${blog.slug}`}
        className="group block relative h-full glass-card border-white/5 hover:border-primary/30 transition-all duration-500 overflow-hidden bg-white/[0.02]"
      >
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {blog.coverImage ? (
            <>
              {/* EV shimmer overlay — fades out when image loads */}
              <div className={`absolute inset-0 ev-shimmer-base z-10 transition-opacity duration-500 pointer-events-none ${coverLoaded ? 'opacity-0' : 'opacity-100'}`}>
                <div className="ev-shimmer-sweep" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-[#00FF85]/15 animate-pulse" />
                </div>
              </div>
              <Image
                src={blog.coverImage}
                alt={blog.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                onLoad={() => setCoverLoaded(true)}
              />
            </>
          ) : (
            <div className="w-full h-full ev-shimmer-base flex items-center justify-center">
              <span className="text-[#00FF85]/10 font-black text-4xl">ZMR</span>
            </div>
          )}
          
          {/* Category Badge */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3 py-1 rounded-full bg-background/80 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-primary">
              {blog.category}
            </span>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-primary" />
              {readTime} min read
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-3 h-3 text-primary" />
              {blog.authorName}
            </span>
          </div>

          <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors leading-tight line-clamp-2">
            {blog.title}
          </h3>

          <p className="text-white/40 text-sm leading-relaxed line-clamp-3">
            {blog.excerpt || "Click to read more about this exciting development in the EV industry..."}
          </p>

          <div className="pt-2 flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-[0.2em] opacity-60 group-hover:opacity-100 transition-all">
            Read Full Article
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
