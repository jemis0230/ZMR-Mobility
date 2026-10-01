import { getBlogsAction, getBlogCategoriesAction } from "@/app/actions/blogActions";
import BlogCard from "@/presentation/components/BlogCard";
import BlogFilters from "@/presentation/components/BlogFilters";
import { motion } from "framer-motion";

export const revalidate = 300;

export const metadata = {
  title: "Blogs & Insights | ZMR Mobility",
  description: "Explore the latest trends, technology, and insights in the electric vehicle industry.",
};

export default async function BlogsPage(props: {
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}) {
  const searchParams = await props.searchParams;
  const category = searchParams.category;
  const query = searchParams.q;
  const page = parseInt(searchParams.page || "1");
  
  const [blogsData, categories] = await Promise.all([
    getBlogsAction({ category, search: query, page, publishedOnly: true, limit: 9 }),
    getBlogCategoriesAction(),
  ]);

  const { blogs, total } = blogsData;

  return (
    <main className="min-h-screen bg-background pt-24 lg:pt-40 pb-20 px-6 overflow-hidden">
      {/* Decorative backgrounds */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-ink/5 border border-ink/10 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Industry Insights
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-ink leading-tight">
            The ZMR <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Journal</span>
          </h1>
          <p className="text-ink/60 max-w-2xl mx-auto text-lg leading-relaxed">
            Deep dives into EV technology, sustainable fleet management, 
            and the future of clean mobility in Bharat.
          </p>
        </div>

        <BlogFilters categories={categories} />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, i) => (
            <BlogCard key={blog.id} blog={blog} index={i} />
          ))}
        </div>

        {blogs.length === 0 && (
          <div className="py-40 text-center glass-card border-ink/[0.08] bg-ink/[0.01]">
            <h3 className="text-2xl font-black text-ink/40 uppercase tracking-widest">No articles found</h3>
            <p className="text-ink/25 mt-2">Try adjusting your filters or search query.</p>
          </div>
        )}

        {/* Pagination placeholder */}
        {total > 9 && (
          <div className="mt-16 flex justify-center gap-2">
            {/* Simple pagination UI could be added here */}
          </div>
        )}
      </div>
    </main>
  );
}
