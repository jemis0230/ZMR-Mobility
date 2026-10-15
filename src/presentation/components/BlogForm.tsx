"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { savePostAction, createAuthorAction, uploadImageAction } from "@/app/actions/blogActions";
import { safeAction } from "./blog-admin/safeAction";
import BlogEditor from "./BlogEditor";
import TagPicker, { type TagOption } from "./blog-admin/TagPicker";
import { slugify, AUTHOR_NAME_MAX, DESIGNATION_MAX } from "@/lib/blog/text";
import { Save, ArrowLeft, Image as ImageIcon, Globe, Lock, Trash2, Upload, Plus, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export type AuthorOption = { id: string; name: string; designation: string };
export type TypeOption = { id: string; name: string };

type InitialPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  coverImage: string | null;
  content: string;
  published: boolean;
  authorId: string | null;
  authorName: string;
  authorDesignation: string | null;
  typeId: string | null;
  tags: TagOption[];
};

type Field = "title" | "slug" | "content" | "authorId" | "typeId" | "tagIds" | "coverImage";

const CATEGORIES = ["EV Tech", "Sustainability", "Fleet Management", "Company News", "Case Studies"];
const INPUT = "w-full bg-white border rounded-lg px-4 py-3 text-sm text-ink placeholder-ink/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25";
const LABEL = "text-xs font-bold uppercase tracking-wider text-ink/70 mb-2 block";

export default function BlogForm({
  initialData, authors: initialAuthors, types, tags: initialTags,
}: {
  initialData?: InitialPost;
  authors: AuthorOption[];
  types: TypeOption[];
  tags: TagOption[];
}) {
  const router = useRouter();
  const uid = useId();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [formError, setFormError] = useState("");
  const [authors, setAuthors] = useState(initialAuthors);
  const [allTags, setAllTags] = useState(initialTags);
  const [slugEdited, setSlugEdited] = useState(!!initialData);
  const [refreshByline, setRefreshByline] = useState(false);

  const [form, setForm] = useState({
    title: initialData?.title ?? "",
    slug: initialData?.slug ?? "",
    excerpt: initialData?.excerpt ?? "",
    category: initialData?.category ?? CATEGORIES[0],
    coverImage: initialData?.coverImage ?? "",
    content: initialData?.content ?? "",
    authorId: initialData?.authorId ?? "",
    typeId: initialData?.typeId ?? "",
    tagIds: initialData?.tags.map((t) => t.id) ?? [],
  });
  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as Field]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  // Inline "new author" mini-form
  const [newAuthorOpen, setNewAuthorOpen] = useState(false);
  const [newAuthor, setNewAuthor] = useState({ name: "", designation: "" });
  const [newAuthorError, setNewAuthorError] = useState("");
  const [addingAuthor, setAddingAuthor] = useState(false);

  const author = authors.find((a) => a.id === form.authorId);
  const savedByline = initialData?.authorId && initialData.authorId === form.authorId && initialData.authorDesignation
    ? { name: initialData.authorName, designation: initialData.authorDesignation }
    : null;
  const bylineOutdated = !!(savedByline && author && (savedByline.name !== author.name || savedByline.designation !== author.designation));
  const shownByline = author ? (savedByline && !refreshByline ? savedByline : author) : null;

  const categories = CATEGORIES.includes(form.category) ? CATEGORIES : [form.category, ...CATEGORIES];
  const fieldId = (f: Field) => `${uid}-${f}`;
  const errorText = (f: Field) =>
    errors[f] ? (
      <p id={`${fieldId(f)}-err`} className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-red-700">
        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden /> {errors[f]}
      </p>
    ) : null;
  const a11y = (f: Field) => ({
    id: fieldId(f),
    "aria-invalid": errors[f] ? true : undefined,
    "aria-describedby": errors[f] ? `${fieldId(f)}-err` : undefined,
  });
  const border = (f: Field) => (errors[f] ? "border-red-600" : "border-ink/20");

  const addAuthor = async () => {
    setAddingAuthor(true);
    setNewAuthorError("");
    const res = await safeAction(createAuthorAction(newAuthor));
    setAddingAuthor(false);
    if (!res.success) { setNewAuthorError(res.error); return; }
    setAuthors((list) => [...list, res.data].sort((a, b) => a.name.localeCompare(b.name)));
    set("authorId", res.data.id);
    setNewAuthor({ name: "", designation: "" });
    setNewAuthorOpen(false);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = new FormData();
    data.append("file", file);
    const res = await safeAction(uploadImageAction(data));
    if (res.success) set("coverImage", res.url);
    else setErrors((er) => ({ ...er, coverImage: res.error || "Upload failed" }));
  };

  const save = async (publish: boolean) => {
    setFormError("");
    const found: Partial<Record<Field, string>> = {};
    if (!form.title.trim()) found.title = "Enter a title.";
    if (!slugify(form.slug || form.title)) found.slug = "Enter a URL slug using letters or numbers.";
    if (publish) {
      if (!form.content.replace(/<[^>]+>/g, "").trim()) found.content = "Write the article before publishing.";
      if (!form.authorId) found.authorId = "Choose an author before publishing.";
      if (!form.typeId) found.typeId = "Choose a blog type before publishing.";
    }
    setErrors(found);
    const first = (Object.keys(found) as Field[])[0];
    if (first) {
      setFormError(publish ? "Complete the highlighted fields to publish. Your changes are kept." : "Fix the highlighted fields. Your changes are kept.");
      document.getElementById(fieldId(first))?.focus();
      return;
    }

    setSaving(true);
    const res = await safeAction(savePostAction(initialData?.id ?? null, {
      ...form,
      slug: slugify(form.slug || form.title),
      published: publish,
      refreshByline,
    }));
    setSaving(false);
    if (!res.success) {
      const f = res.field as Field | undefined;
      if (f) setErrors({ [f]: res.error });
      setFormError(res.error);
      if (f) document.getElementById(fieldId(f))?.focus();
      return;
    }
    router.push("/admin/blogs");
    router.refresh();
  };

  const isPublished = !!initialData?.published;

  return (
    <form onSubmit={(e) => { e.preventDefault(); void save(isPublished); }} className="space-y-6" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/blogs" className="text-ink/60 hover:text-ink flex items-center gap-2 text-sm min-h-[44px]">
          <ArrowLeft className="w-4 h-4" aria-hidden /> Back to articles
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${isPublished ? "bg-lime text-forest" : "bg-ink/5 text-ink/70"}`}>
            {isPublished ? <Globe className="w-3.5 h-3.5" aria-hidden /> : <Lock className="w-3.5 h-3.5" aria-hidden />}
            {isPublished ? "Published" : initialData ? "Draft" : "New draft"}
          </span>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save(false)}
            className="min-h-[44px] px-5 rounded-xl border border-ink/20 bg-white text-sm font-bold text-forest hover:border-primary disabled:opacity-60"
          >
            {isPublished ? "Unpublish & save as draft" : "Save draft"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save(true)}
            className="min-h-[44px] bg-primary text-white px-6 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <Save className="w-4 h-4" aria-hidden />}
            {saving ? "Saving…" : isPublished ? "Update published article" : "Publish"}
          </button>
        </div>
      </div>

      {formError && (
        <p role="alert" className="flex gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden /> {formError}
        </p>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6 min-w-0">
          <div className="glass-card p-5 sm:p-8 space-y-6">
            <div>
              <label htmlFor={fieldId("title")} className={LABEL}>Article title <span className="text-red-700" aria-hidden>*</span></label>
              <input
                {...a11y("title")}
                type="text"
                value={form.title}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!slugEdited) set("slug", slugify(e.target.value));
                }}
                placeholder="Article title"
                className={`${INPUT} ${border("title")} text-xl sm:text-2xl font-black`}
              />
              {errorText("title")}
            </div>

            <div>
              <label htmlFor={fieldId("slug")} className={LABEL}>Slug (URL)</label>
              <div className={`flex items-center gap-1 rounded-lg border bg-white px-4 ${border("slug")} focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25`}>
                <span className="text-ink/50 text-sm shrink-0">/blogs/</span>
                <input
                  {...a11y("slug")}
                  type="text"
                  value={form.slug}
                  onChange={(e) => { setSlugEdited(true); set("slug", e.target.value); }}
                  onBlur={() => set("slug", slugify(form.slug))}
                  className="min-w-0 flex-1 bg-transparent py-3 text-sm font-mono text-primary-dark outline-none"
                />
              </div>
              {errorText("slug")}
              {isPublished && <p className="mt-1.5 text-xs text-ink/60">Changing the slug of a published article changes its URL.</p>}
            </div>

            <div>
              <span id={fieldId("content")} tabIndex={-1} className={LABEL}>Article content</span>
              <div className={errors.content ? "rounded-xl ring-2 ring-red-600" : ""}>
                <BlogEditor content={form.content} onChange={(content) => set("content", content)} />
              </div>
              {errorText("content")}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6 min-w-0">
          {/* Byline */}
          <fieldset className="glass-card p-5 sm:p-6 space-y-4">
            <legend className="sr-only">Author</legend>
            <h2 className="text-xs font-bold uppercase tracking-widest text-ink/85 border-b border-ink/[0.08] pb-3">Author &amp; type</h2>
            <div>
              <label htmlFor={fieldId("authorId")} className={LABEL}>Author <span className="text-red-700" aria-hidden>*</span> <span className="font-normal normal-case tracking-normal text-ink/60">(required to publish)</span></label>
              <select
                {...a11y("authorId")}
                value={form.authorId}
                onChange={(e) => { set("authorId", e.target.value); setRefreshByline(false); }}
                className={`${INPUT} ${border("authorId")}`}
              >
                <option value="">Choose an author</option>
                {authors.map((a) => <option key={a.id} value={a.id}>{a.name} — {a.designation}</option>)}
              </select>
              {errorText("authorId")}
              {!initialData?.authorId && initialData && initialData.authorName && (
                <p className="mt-1.5 text-xs text-ink/65">Current byline: “{initialData.authorName}” (no designation recorded).</p>
              )}
              {shownByline && (
                <p className="mt-2 text-sm text-forest">
                  Byline: <strong>By {shownByline.name}</strong> · {shownByline.designation}
                </p>
              )}
              {bylineOutdated && !refreshByline && author && (
                <div className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-ink/80">
                  This article keeps the byline it was saved with. The author profile now reads “{author.name} · {author.designation}”.
                  <button type="button" onClick={() => setRefreshByline(true)} className="mt-2 block min-h-[36px] font-bold text-primary-dark underline">
                    Use the current profile for this article
                  </button>
                </div>
              )}

              {!newAuthorOpen ? (
                <button type="button" onClick={() => setNewAuthorOpen(true)} className="mt-2 inline-flex items-center gap-1.5 min-h-[44px] text-sm font-bold text-primary-dark hover:underline">
                  <Plus className="w-4 h-4" aria-hidden /> Add a new author
                </button>
              ) : (
                <div className="mt-3 rounded-xl border border-ink/15 bg-cream p-4 space-y-3" role="group" aria-label="New author">
                  <p className="text-xs text-ink/70">Authors are byline profiles, not logins. Guest authors can be added here too. Only the name and designation are shown publicly.</p>
                  <div>
                    <label htmlFor={`${uid}-na-name`} className={LABEL}>Name</label>
                    <input id={`${uid}-na-name`} value={newAuthor.name} maxLength={AUTHOR_NAME_MAX} onChange={(e) => setNewAuthor((n) => ({ ...n, name: e.target.value }))} className={`${INPUT} border-ink/20`} />
                  </div>
                  <div>
                    <label htmlFor={`${uid}-na-des`} className={LABEL}>Designation</label>
                    <input id={`${uid}-na-des`} value={newAuthor.designation} maxLength={DESIGNATION_MAX} placeholder="e.g. Head of Operations" onChange={(e) => setNewAuthor((n) => ({ ...n, designation: e.target.value }))} className={`${INPUT} border-ink/20`} />
                  </div>
                  {newAuthorError && <p role="alert" className="text-xs font-semibold text-red-700">{newAuthorError}</p>}
                  <div className="flex gap-2">
                    <button type="button" disabled={addingAuthor} onClick={() => void addAuthor()} className="min-h-[44px] px-4 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark disabled:opacity-60">
                      {addingAuthor ? "Adding…" : "Add author"}
                    </button>
                    <button type="button" onClick={() => { setNewAuthorOpen(false); setNewAuthorError(""); }} className="min-h-[44px] px-4 rounded-lg border border-ink/20 text-sm font-bold text-ink/75">
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label htmlFor={fieldId("typeId")} className={LABEL}>Blog type <span className="text-red-700" aria-hidden>*</span> <span className="font-normal normal-case tracking-normal text-ink/60">(required to publish)</span></label>
              <select {...a11y("typeId")} value={form.typeId} onChange={(e) => set("typeId", e.target.value)} className={`${INPUT} ${border("typeId")}`}>
                <option value="">Choose a type</option>
                {types.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {errorText("typeId")}
              <Link href="/admin/blogs/types" className="mt-1.5 inline-block text-xs font-bold text-primary-dark hover:underline">Manage blog types</Link>
            </div>

            <div id={fieldId("tagIds")} tabIndex={-1}>
              <TagPicker
                tags={allTags}
                selected={form.tagIds}
                onChange={(ids) => set("tagIds", ids)}
                onTagCreated={(t) => setAllTags((list) => [...list, t].sort((a, b) => a.name.localeCompare(b.name)))}
                error={errors.tagIds}
              />
            </div>
          </fieldset>

          <div className="glass-card p-5 sm:p-6 space-y-5">
            <h2 className="text-xs font-bold uppercase tracking-widest text-ink/85 border-b border-ink/[0.08] pb-3">Article details</h2>
            <div>
              <label htmlFor={`${uid}-category`} className={LABEL}>Category</label>
              <select id={`${uid}-category`} value={form.category} onChange={(e) => set("category", e.target.value)} className={`${INPUT} border-ink/20`}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor={fieldId("coverImage")} className={LABEL}>Cover image</label>
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="mb-2 w-full min-h-[44px] rounded-lg border border-ink/20 bg-white px-4 text-sm font-bold text-ink/75 hover:text-primary hover:border-primary flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" aria-hidden /> Upload image
              </button>
              <input type="file" ref={coverInputRef} onChange={handleCoverUpload} accept="image/*" className="hidden" aria-hidden tabIndex={-1} />
              <div className="relative">
                <input
                  {...a11y("coverImage")}
                  type="text"
                  value={form.coverImage}
                  onChange={(e) => set("coverImage", e.target.value)}
                  placeholder="Or paste an image URL"
                  className={`${INPUT} ${border("coverImage")} pl-10`}
                />
                <ImageIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" aria-hidden />
              </div>
              {errorText("coverImage")}
              {form.coverImage && (
                <div className="mt-3 rounded-xl overflow-hidden border border-ink/10 aspect-video relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.coverImage} alt="Cover preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => set("coverImage", "")}
                    aria-label="Remove cover image"
                    className="absolute top-2 right-2 w-10 h-10 flex items-center justify-center bg-white/90 text-red-700 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label htmlFor={`${uid}-excerpt`} className={LABEL}>Excerpt (short summary)</label>
              <textarea
                id={`${uid}-excerpt`}
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
                rows={4}
                maxLength={500}
                className={`${INPUT} border-ink/20 resize-y leading-relaxed`}
                placeholder="A short summary shown in the blog list"
              />
            </div>
          </div>
        </div>
      </div>

      {!formError && Object.keys(errors).length === 0 && initialData && (
        <p className="flex items-center gap-1.5 text-xs text-ink/60"><CheckCircle2 className="w-3.5 h-3.5 text-leaf" aria-hidden /> Saved changes appear on the public blog straight away.</p>
      )}
    </form>
  );
}
