import { getBlogBySlugAction, getBlogsAction } from "@/app/actions/blogActions";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, User, Clock, Share2, Twitter, Linkedin, Facebook } from "lucide-react";
import BlogCard from "@/presentation/components/BlogCard";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const blog = await getBlogBySlugAction(params.slug);
  if (!blog) return { title: "Blog Not Found" };
  
  return {
    title: `${blog.title} | ZMR Mobility Blog`,
    description: blog.excerpt || blog.title,
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const blog = await getBlogBySlugAction(params.slug);
  
  if (!blog) {
    notFound();
  }

  // Related posts from same category
  const { blogs: relatedPosts } = await getBlogsAction({ 
    category: blog.category, 
    publishedOnly: true, 
    limit: 3 
  });
  
  const filteredRelated = relatedPosts.filter(p => p.id !== blog.id).slice(0, 2);

  const wordsPerMinute = 200;
  const wordCount = blog.content.split(/\s+/g).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);

  return (
    <main className="min-h-screen bg-background pb-20 overflow-hidden">
      {/* Hero Header */}
      <div className="relative h-[60vh] md:h-[70vh] w-full">
        {blog.coverImage ? (
          <Image src={blog.coverImage} alt={blog.title} fill className="object-cover" priority />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end px-6 pb-12">
          <div className="max-w-4xl mx-auto w-full">
            <Link 
              href="/blogs" 
              className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-8 hover:gap-3 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Journal
            </Link>
            
            <div className="space-y-6">
              <span className="px-4 py-1.5 rounded-full bg-primary text-background text-[10px] font-black uppercase tracking-[0.2em]">
                {blog.category}
              </span>
              <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                {blog.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                    {blog.authorName[0]}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{blog.authorName}</p>
                    <p className="text-white/40 text-[10px] uppercase tracking-widest">Author</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Calendar className="w-4 h-4 text-primary" />
                    {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-2 text-white/40 text-xs">
                    <Clock className="w-4 h-4 text-primary" />
                    {readTime} min read
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-16 mt-16">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <article 
            className="prose prose-invert prose-primary max-w-none prose-h2:text-3xl prose-h2:font-black prose-h3:text-2xl prose-h3:font-bold prose-p:text-white/70 prose-p:leading-relaxed prose-p:text-lg prose-img:rounded-3xl prose-img:shadow-2xl prose-blockquote:border-primary prose-blockquote:bg-white/5 prose-blockquote:p-8 prose-blockquote:rounded-3xl prose-blockquote:not-italic prose-blockquote:text-xl prose-blockquote:font-bold"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
          
          {/* Share Section */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="text-xs font-black uppercase tracking-widest text-white/40">Share this article:</span>
              <div className="flex gap-2">
                {[Twitter, Linkedin, Facebook].map((Icon, i) => (
                  <button key={i} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-all border border-white/10">
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
            
            <button className="flex items-center gap-2 text-white/40 hover:text-white text-xs font-bold transition-colors">
              <Share2 className="w-4 h-4" />
              Copy Article Link
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-12">
          {/* Author Card */}
          <div className="glass-card p-8 border-white/10 bg-white/[0.02] sticky top-32">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 mb-6">About the Author</h3>
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-cyan-400 flex items-center justify-center text-background text-3xl font-black">
                {blog.authorName[0]}
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">{blog.authorName}</h4>
                <p className="text-white/40 text-xs mt-1">Sustainability & EV Mobility Expert</p>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Passionate about driving India's transition to sustainable energy through 
                IoT-enabled electric vehicle solutions.
              </p>
              <div className="pt-4 flex gap-4">
                <Linkedin className="w-5 h-5 text-white/20 hover:text-primary transition-colors cursor-pointer" />
                <Twitter className="w-5 h-5 text-white/20 hover:text-primary transition-colors cursor-pointer" />
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Related Posts Section */}
      {filteredRelated.length > 0 && (
        <section className="mt-32 pt-24 border-t border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-12">
              <div>
                <span className="text-primary text-xs font-bold uppercase tracking-widest">More for you</span>
                <h2 className="text-3xl md:text-4xl font-black text-white mt-2">Related Articles</h2>
              </div>
              <Link href="/blogs" className="text-primary font-bold text-xs uppercase tracking-widest hover:gap-3 flex items-center gap-2 transition-all">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
              {filteredRelated.map((post, i) => (
                <BlogCard key={post.id} blog={post} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
