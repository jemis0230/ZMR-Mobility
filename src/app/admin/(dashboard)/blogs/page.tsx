import Link from "next/link";
import { Plus, Edit, Globe, Lock, Search, ExternalLink } from "lucide-react";
import { listAuthors, listPosts, listTags, listTypes } from "@/lib/blog/queries";
import BlogAdminTabs from "@/presentation/components/blog-admin/BlogAdminTabs";
import DeletePostButton from "@/presentation/components/blog-admin/DeletePostButton";
import Pagination from "@/presentation/components/Pagination";
import { storageMode } from "@/lib/upload";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 15;
const SELECT = "min-h-[44px] rounded-lg border border-ink/20 bg-white px-3 text-sm text-ink focus:outline-none focus:border-primary";

export default async function AdminBlogsPage(props: {
  searchParams: Promise<{ q?: string; page?: string; type?: string; tag?: string; author?: string; missing?: string }>;
}) {
  const sp = await props.searchParams;
  const page = Math.max(1, parseInt(sp.page || "1") || 1);
  const [types, tags, authors] = await Promise.all([listTypes(false), listTags(false), listAuthors(false)]);
  const { blogs, total } = await listPosts({
    publishedOnly: false,
    search: sp.q?.trim() || undefined,
    typeSlug: sp.type || undefined,
    tagId: tags.find((t) => t.slug === sp.tag)?.id,
    authorId: sp.author || undefined,
    missingMeta: sp.missing === "1",
    page,
    limit: PAGE_SIZE,
  });
  const rows = blogs;
  const params = new URLSearchParams(Object.entries(sp).filter(([k, v]) => k !== "page" && v) as [string, string][]);
  const filtered = params.toString() !== "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-ink">Manage blogs</h1>
          <p className="text-ink/60 text-sm mt-1">Articles, with their authors, blog types and topic tags.</p>
        </div>
        <Link href="/admin/blogs/new" className="bg-primary text-white px-6 min-h-[44px] rounded-xl font-bold inline-flex items-center gap-2 hover:bg-primary-dark w-fit">
          <Plus className="w-5 h-5" aria-hidden /> New article
        </Link>
      </div>

      <BlogAdminTabs current="posts" />

      {storageMode() === "unconfigured" && (
        <p role="status" className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-ink/85">
          <strong>Image uploads are switched off</strong> until a Vercel Blob store is connected to this project. Articles can still be written and published; paste an image URL instead of uploading.
        </p>
      )}

      <div className="glass-card p-4 sm:p-6">
        <form method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6 mb-6" role="search" aria-label="Filter articles">
          <div className="relative sm:col-span-2">
            <label htmlFor="admin-blog-q" className="sr-only">Search articles</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" aria-hidden />
            <input id="admin-blog-q" name="q" defaultValue={sp.q ?? ""} placeholder="Search articles…" className={`${SELECT} w-full pl-9`} />
          </div>
          <label className="sr-only" htmlFor="admin-blog-type">Type</label>
          <select id="admin-blog-type" name="type" defaultValue={sp.type ?? ""} className={SELECT}>
            <option value="">All types</option>
            {types.map((t) => <option key={t.id} value={t.slug}>{t.name}</option>)}
          </select>
          <label className="sr-only" htmlFor="admin-blog-tag">Tag</label>
          <select id="admin-blog-tag" name="tag" defaultValue={sp.tag ?? ""} className={SELECT}>
            <option value="">All tags</option>
            {tags.map((t) => <option key={t.id} value={t.slug}>{t.name}</option>)}
          </select>
          <label className="sr-only" htmlFor="admin-blog-author">Author</label>
          <select id="admin-blog-author" name="author" defaultValue={sp.author ?? ""} className={SELECT}>
            <option value="">All authors</option>
            {authors.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <label className="flex items-center gap-2 min-h-[44px] text-sm font-semibold text-forest lg:col-span-6">
            <input type="checkbox" name="missing" value="1" defaultChecked={sp.missing === "1"} className="w-5 h-5 accent-[#577440]" />
            Only articles missing an author or blog type
          </label>
          <div className="flex gap-2">
            <button type="submit" className="min-h-[44px] flex-1 rounded-lg bg-forest px-4 text-sm font-bold text-white">Apply</button>
            {filtered && <Link href="/admin/blogs" className="min-h-[44px] inline-flex items-center rounded-lg border border-ink/20 px-3 text-sm font-bold text-ink/75">Reset</Link>}
          </div>
        </form>

        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/60">{total} article{total === 1 ? "" : "s"}</p>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-ink/[0.08] text-ink/60 text-[11px] uppercase tracking-[0.15em] font-black">
                <th scope="col" className="pb-3 pl-4">Article</th>
                <th scope="col" className="pb-3">Author</th>
                <th scope="col" className="pb-3">Type &amp; tags</th>
                <th scope="col" className="pb-3">Status</th>
                <th scope="col" className="pb-3">Date</th>
                <th scope="col" className="pb-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.08]">
              {rows.map((blog) => (
                <tr key={blog.id} className="align-top">
                  <td className="py-4 pl-4 pr-3 max-w-[260px]">
                    <p className="text-ink font-bold text-sm line-clamp-2">{blog.title}</p>
                    <p className="text-ink/60 text-xs font-mono mt-0.5 truncate">/blogs/{blog.slug}</p>
                  </td>
                  <td className="py-4 pr-3 text-sm">
                    {blog.authorId ? (
                      <>
                        <p className="font-semibold text-forest">{blog.authorName}</p>
                        <p className="text-xs text-ink/65">{blog.authorDesignation}</p>
                      </>
                    ) : (
                      <p className="text-xs text-amber-700 font-semibold">Missing author{blog.authorName ? ` (was “${blog.authorName}”)` : ""}</p>
                    )}
                  </td>
                  <td className="py-4 pr-3">
                    {blog.type ? (
                      <span className="inline-block rounded-full bg-lime px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-forest">{blog.type.name}</span>
                    ) : (
                      <span className="text-xs text-amber-700 font-semibold">Missing type</span>
                    )}
                    {blog.tags.length > 0 && (
                      <p className="mt-1 text-xs text-ink/70 line-clamp-2">{blog.tags.map((t) => t.name).join(", ")}</p>
                    )}
                  </td>
                  <td className="py-4 pr-3">
                    {blog.published ? (
                      <span className="flex items-center gap-1.5 text-leaf text-xs font-bold"><Globe className="w-3.5 h-3.5" aria-hidden /> Published</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-ink/60 text-xs font-bold"><Lock className="w-3.5 h-3.5" aria-hidden /> Draft</span>
                    )}
                  </td>
                  <td className="py-4 pr-3 text-xs text-ink/65 whitespace-nowrap">
                    {new Date(blog.displayDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center justify-end gap-1">
                      {blog.published && (
                        <Link href={`/blogs/${blog.slug}`} target="_blank" aria-label={`View “${blog.title}” on the site`} className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-ink/5 text-ink/60 hover:text-primary">
                          <ExternalLink className="w-4 h-4" aria-hidden />
                        </Link>
                      )}
                      <Link href={`/admin/blogs/${blog.id}`} aria-label={`Edit “${blog.title}”`} className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-ink/5 text-ink/70 hover:text-primary">
                        <Edit className="w-4 h-4" aria-hidden />
                      </Link>
                      <DeletePostButton id={blog.id} title={blog.title} />
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-ink/60 font-semibold">
                    {filtered ? "No articles match these filters." : "No articles yet. Create the first one with “New article”."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={page} totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))} basePath="/admin/blogs" searchParams={params} />
      </div>
    </div>
  );
}
