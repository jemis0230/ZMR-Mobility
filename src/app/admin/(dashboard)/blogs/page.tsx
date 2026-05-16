import { getBlogsAction, deleteBlogAction } from "@/app/actions/blogActions";
import Link from "next/link";
import { Plus, Edit, Trash2, Globe, Lock, Search } from "lucide-react";
import Image from "next/image";

export default async function AdminBlogsPage(props: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageStr } = await props.searchParams;
  const query = q || "";
  const page = parseInt(pageStr || "1");
  const { blogs, total } = await getBlogsAction({ search: query, page, limit: 10 });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Blog Management</h1>
          <p className="text-white/40 text-sm mt-1">Create and manage your articles</p>
        </div>
        <Link 
          href="/admin/blogs/new" 
          className="bg-primary text-background px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all electric-glow w-fit"
        >
          <Plus className="w-5 h-5" />
          New Article
        </Link>
      </div>

      <div className="glass-card p-6 border-white/10 bg-white/[0.02]">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text" 
              placeholder="Search articles..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:border-primary/50 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-white/40 uppercase tracking-widest">
            {total} Total Articles
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-white/40 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="pb-4 pl-4">Article</th>
                <th className="pb-4">Category</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Date</th>
                <th className="pb-4 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {blogs.map((blog) => (
                <tr key={blog.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="py-5 pl-4">
                    <div className="flex items-center gap-4">
                      {blog.coverImage ? (
                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 relative">
                          <Image src={blog.coverImage} alt={blog.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-16 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-white/20 flex-shrink-0">
                          NO IMG
                        </div>
                      )}
                      <div>
                        <p className="text-white font-bold text-sm line-clamp-1">{blog.title}</p>
                        <p className="text-white/40 text-[10px] font-mono mt-0.5">/{blog.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-white/60">
                      {blog.category}
                    </span>
                  </td>
                  <td className="py-5">
                    {blog.published ? (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                        <Globe className="w-3.5 h-3.5" />
                        Published
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-white/30 text-xs font-bold">
                        <Lock className="w-3.5 h-3.5" />
                        Draft
                      </div>
                    )}
                  </td>
                  <td className="py-5">
                    <p className="text-white/40 text-xs">{new Date(blog.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="py-5 text-right pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/blogs/${blog.id}`}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-primary transition-all"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <form action={async () => {
                        "use server";
                        await deleteBlogAction(blog.id);
                      }}>
                        <button className="p-2 rounded-lg hover:bg-white/10 text-white/30 hover:text-red-400 transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <p className="text-white/20 font-bold">No articles found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
