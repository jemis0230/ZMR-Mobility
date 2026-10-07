"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBlogAction, updateBlogAction, uploadImageAction } from "@/app/actions/blogActions";
import BlogEditor from "./BlogEditor";
import { Save, ArrowLeft, Image as ImageIcon, Globe, Lock, Trash2, Upload } from "lucide-react";
import Link from "next/link";

export default function BlogForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    category: initialData?.category || "EV Tech",
    coverImage: initialData?.coverImage || "",
    content: initialData?.content || "",
    published: initialData?.published || false,
    authorName: initialData?.authorName || "ZMR Mobility Team",
    tags: Array.isArray(initialData?.tags) ? initialData.tags.join(", ") : initialData?.tags || "",
  });

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("file", file);

    const res = await uploadImageAction(uploadData);
    if (res.success && res.url) {
      setFormData({ ...formData, coverImage: res.url });
    } else {
      alert(res.error || "Upload failed");
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    setFormData({ ...formData, title, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = initialData 
      ? await updateBlogAction(initialData.id, formData)
      : await createBlogAction(formData);

    if (res.success) {
      router.push("/admin/blogs");
      router.refresh();
    } else {
      alert(`Error: ${res.error || "Unknown error"}`);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <Link href="/admin/blogs" className="text-ink/60 hover:text-ink flex items-center gap-2 text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Articles
        </Link>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setFormData({ ...formData, published: !formData.published })}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
              formData.published 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-ink/5 border-ink/10 text-ink/60"
            }`}
          >
            {formData.published ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            {formData.published ? "Public" : "Draft"}
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-primary text-white px-8 py-2 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all electric-glow disabled:opacity-50 disabled:hover:scale-100"
          >
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : initialData ? "Update Article" : "Publish Article"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card p-8 border-ink/10 bg-ink/[0.02] space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-ink/60 ml-1">Article Title</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="The Future of Clean Mobility in Bharat"
                className="w-full bg-ink/5 border border-ink/10 rounded-xl py-4 px-5 text-2xl font-black text-ink focus:border-primary/50 outline-none transition-all placeholder:text-ink/25"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-ink/60 ml-1">Slug (URL)</label>
              <div className="flex items-center gap-2 px-5 py-3 bg-ink/5 border border-ink/10 rounded-xl">
                <span className="text-ink/40 text-sm">zmrmobility.com/blogs/</span>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="bg-transparent flex-1 text-sm font-mono text-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-ink/60 ml-1">Article Content</label>
              <BlogEditor 
                content={formData.content} 
                onChange={(content) => setFormData({ ...formData, content })} 
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 border-ink/10 bg-ink/[0.02] space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-ink/85 border-b border-ink/[0.08] pb-4">Article Metadata</h3>
            
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-ink/60 ml-1">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-ink/5 border border-ink/10 rounded-xl py-3 px-4 text-sm text-ink focus:border-primary/50 outline-none transition-all"
              >
                <option value="EV Tech" className="bg-background">EV Tech</option>
                <option value="Sustainability" className="bg-background">Sustainability</option>
                <option value="Fleet Management" className="bg-background">Fleet Management</option>
                <option value="Company News" className="bg-background">Company News</option>
                <option value="Case Studies" className="bg-background">Case Studies</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-ink/60 ml-1">Cover Image</label>
              <div className="flex gap-2 mb-2">
                <button 
                  type="button" 
                  onClick={() => coverInputRef.current?.click()}
                  className="flex-1 bg-ink/5 border border-ink/10 rounded-xl py-3 px-4 text-xs font-bold text-ink/70 hover:text-primary hover:border-primary/40 transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Local
                </button>
                <input 
                  type="file" 
                  ref={coverInputRef} 
                  onChange={handleCoverUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <div className="relative group">
                <input 
                  type="text" 
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  placeholder="Or paste an Image URL..."
                  className="w-full bg-ink/5 border border-ink/10 rounded-xl py-3 pl-10 pr-4 text-xs text-ink/70 focus:border-primary/50 outline-none transition-all"
                />
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
              </div>
              {formData.coverImage && (
                <div className="mt-4 rounded-xl overflow-hidden border border-ink/10 aspect-video relative group/cover">
                  <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setFormData({ ...formData, coverImage: "" })}
                    className="absolute top-2 right-2 p-2 bg-red-500/80 text-ink rounded-lg opacity-0 group-hover/cover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-ink/60 ml-1">Excerpt (Short Summary)</label>
              <textarea 
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={4}
                className="w-full bg-ink/5 border border-ink/10 rounded-xl py-3 px-4 text-xs text-ink/70 focus:border-primary/50 outline-none transition-all resize-none leading-relaxed"
                placeholder="A short summary of the article for the list view..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-ink/60 ml-1">Author Name (shown as the article byline — use the real author)</label>
              <input 
                type="text" 
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                className="w-full bg-ink/5 border border-ink/10 rounded-xl py-3 px-4 text-xs text-ink/70 focus:border-primary/50 outline-none transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="blog-tags" className="text-[10px] uppercase tracking-[0.2em] font-black text-ink/60 ml-1">Topic Tags</label>
              <input
                id="blog-tags"
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g. EV leasing, Battery health, Fleet"
                className="w-full bg-ink/5 border border-ink/10 rounded-xl py-3 px-4 text-xs text-ink/70 focus:border-primary/50 outline-none transition-all"
              />
              <p className="text-[10px] text-ink/60 ml-1">Comma-separated, up to 10. Shown on the article and used for topic filtering on /blogs.</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
