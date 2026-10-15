"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, Edit, Trash2, Combine, Check, X, ExternalLink } from "lucide-react";
import {
  createTagAction, renameTagAction, deleteTagAction, previewTagMergeAction, mergeTagsAction,
} from "@/app/actions/blogActions";
import { safeAction } from "./safeAction";
import { TAG_NAME_MAX } from "@/lib/blog/text";
import ConfirmDialog from "./ConfirmDialog";

export type AdminTag = { id: string; name: string; slug: string; count: number };
type MergePreview = { destination: string; sources: { name: string; posts: number }[]; postsAffected: number; postsAlreadyTagged: number };

const INPUT = "w-full min-h-[44px] bg-white border border-ink/20 rounded-lg px-4 text-sm text-ink placeholder-ink/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25";
const BTN = "min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold";

export default function ManageTagsClient({ tags }: { tags: AdminTag[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");

  const [toDelete, setToDelete] = useState<AdminTag | null>(null);
  const [busy, setBusy] = useState(false);

  const [selected, setSelected] = useState<string[]>([]);
  const [destinationId, setDestinationId] = useState("");
  const [preview, setPreview] = useState<MergePreview | null>(null);
  const [mergeError, setMergeError] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? tags.filter((t) => t.name.toLowerCase().includes(q) || t.slug.includes(q)) : tags;
  }, [tags, query]);

  const done = (text: string) => { setStatus({ kind: "ok", text }); router.refresh(); };

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setStatus(null);
    const res = await safeAction(createTagAction({ name: newName }));
    setCreating(false);
    if (!res.success) { setStatus({ kind: "error", text: res.error }); return; }
    setNewName("");
    done(`Tag “${res.data.name}” created.`);
  };

  const rename = async (id: string) => {
    setBusy(true);
    const res = await safeAction(renameTagAction(id, { name: editName }));
    setBusy(false);
    if (!res.success) { setEditError(res.error); return; }
    setEditingId(null);
    done(`Tag renamed to “${res.data.name}”. Its posts keep the tag, and the old link still works.`);
  };

  const remove = async () => {
    if (!toDelete) return;
    setBusy(true);
    const res = await safeAction(deleteTagAction(toDelete.id));
    setBusy(false);
    if (!res.success) { setStatus({ kind: "error", text: res.error }); setToDelete(null); return; }
    setSelected((s) => s.filter((id) => id !== toDelete.id));
    setToDelete(null);
    done(`Tag deleted. ${res.data.postsUntagged} post${res.data.postsUntagged === 1 ? "" : "s"} no longer carry it; no posts were deleted.`);
  };

  const sources = selected.filter((id) => id !== destinationId);
  const openMerge = async () => {
    setMergeError("");
    const res = await safeAction(previewTagMergeAction({ sourceIds: sources, destinationId }));
    if (!res.success) { setStatus({ kind: "error", text: res.error }); return; }
    setPreview(res.data);
  };
  const merge = async () => {
    setBusy(true);
    const res = await safeAction(mergeTagsAction({ sourceIds: sources, destinationId }));
    setBusy(false);
    if (!res.success) { setMergeError(res.error); return; }
    setPreview(null);
    setSelected([]);
    setDestinationId("");
    done(`Merged ${res.data.tagsRemoved} tag${res.data.tagsRemoved === 1 ? "" : "s"}; ${res.data.postsMoved} post${res.data.postsMoved === 1 ? "" : "s"} now use the kept tag.`);
  };

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const selectedTags = tags.filter((t) => selected.includes(t.id));

  return (
    <div className="space-y-6">
      {status && (
        <p role={status.kind === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm font-semibold ${status.kind === "error" ? "border border-red-300 bg-red-50 text-red-800" : "border border-leaf/30 bg-lime/40 text-forest"}`}>
          {status.text}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <form onSubmit={create} className="glass-card p-5 space-y-3" aria-label="Create a tag">
          <h2 className="font-black text-forest">Create a tag</h2>
          <label htmlFor="new-tag" className="text-xs font-bold uppercase tracking-wider text-ink/70 block">Tag name</label>
          <input id="new-tag" value={newName} maxLength={TAG_NAME_MAX} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Battery health" className={INPUT} />
          <button type="submit" disabled={creating || !newName.trim()} className={`${BTN} w-full bg-primary text-white hover:bg-primary-dark disabled:opacity-60`}>
            <Plus className="w-4 h-4" aria-hidden /> {creating ? "Creating…" : "Create tag"}
          </button>
          <p className="text-xs text-ink/60">Names are unique regardless of capital letters (“EV” and “ev” are the same tag).</p>
        </form>

        <div className="glass-card p-5 space-y-3 lg:col-span-2">
          <h2 className="font-black text-forest flex items-center gap-2"><Combine className="w-4 h-4" aria-hidden /> Combine tags</h2>
          <p className="text-sm text-ink/75">Tick the tags to combine in the table, then choose the one to keep. Posts move to the kept tag and the others are removed; their old links lead to the kept tag.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <label htmlFor="merge-dest" className="sr-only">Tag to keep</label>
            <select id="merge-dest" value={destinationId} onChange={(e) => setDestinationId(e.target.value)} className={`${INPUT} sm:flex-1`}>
              <option value="">Tag to keep…</option>
              {(selectedTags.length ? selectedTags : tags).map((t) => <option key={t.id} value={t.id}>{t.name} ({t.count})</option>)}
            </select>
            <button type="button" disabled={!destinationId || sources.length === 0} onClick={() => void openMerge()} className={`${BTN} bg-forest text-white disabled:opacity-50`}>
              Review merge
            </button>
          </div>
          <p className="text-xs text-ink/60" aria-live="polite">
            {selected.length ? `${selected.length} selected: ${selectedTags.map((t) => t.name).join(", ")}` : "No tags selected."}
          </p>
        </div>
      </div>

      <div className="glass-card p-4 sm:p-6">
        <div className="relative mb-4 max-w-md">
          <label htmlFor="tag-search" className="sr-only">Search tags</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" aria-hidden />
          <input id="tag-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tags…" className={`${INPUT} pl-9`} />
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-ink/[0.08] text-ink/60 text-[11px] uppercase tracking-[0.15em] font-black">
                <th scope="col" className="pb-3 pl-4 w-12"><span className="sr-only">Select for merge</span></th>
                <th scope="col" className="pb-3">Tag</th>
                <th scope="col" className="pb-3">Slug</th>
                <th scope="col" className="pb-3">Posts</th>
                <th scope="col" className="pb-3 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.08]">
              {visible.map((t) => (
                <tr key={t.id}>
                  <td className="py-2 pl-4">
                    <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggle(t.id)} aria-label={`Select ${t.name} for merging`} className="w-5 h-5 accent-[#577440]" />
                  </td>
                  <td className="py-2 pr-3">
                    {editingId === t.id ? (
                      <form onSubmit={(e) => { e.preventDefault(); void rename(t.id); }} className="flex flex-wrap items-center gap-2">
                        <label htmlFor={`rename-${t.id}`} className="sr-only">New name for {t.name}</label>
                        <input
                          id={`rename-${t.id}`}
                          autoFocus
                          value={editName}
                          maxLength={TAG_NAME_MAX}
                          onChange={(e) => { setEditName(e.target.value); setEditError(""); }}
                          onKeyDown={(e) => { if (e.key === "Escape") setEditingId(null); }}
                          aria-invalid={editError ? true : undefined}
                          aria-describedby={editError ? `rename-err-${t.id}` : undefined}
                          className={`${INPUT} max-w-[220px]`}
                        />
                        <button type="submit" disabled={busy} aria-label="Save name" className="w-10 h-10 inline-flex items-center justify-center rounded-lg bg-primary text-white"><Check className="w-4 h-4" aria-hidden /></button>
                        <button type="button" onClick={() => setEditingId(null)} aria-label="Cancel rename" className="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-ink/20"><X className="w-4 h-4" aria-hidden /></button>
                        {editError && <p id={`rename-err-${t.id}`} role="alert" className="basis-full text-xs font-semibold text-red-700">{editError}</p>}
                      </form>
                    ) : (
                      <span className="font-bold text-forest">{t.name}</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 font-mono text-xs text-ink/70">{t.slug}</td>
                  <td className="py-2 pr-3 text-sm">{t.count}</td>
                  <td className="py-2 pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <a href={`/blogs?tag=${t.slug}`} target="_blank" rel="noreferrer" aria-label={`View public posts tagged ${t.name}`} className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-ink/5 text-ink/60 hover:text-primary">
                        <ExternalLink className="w-4 h-4" aria-hidden />
                      </a>
                      <button type="button" onClick={() => { setEditingId(t.id); setEditName(t.name); setEditError(""); }} aria-label={`Rename ${t.name}`} className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-ink/5 text-ink/70 hover:text-primary">
                        <Edit className="w-4 h-4" aria-hidden />
                      </button>
                      <button type="button" onClick={() => setToDelete(t)} aria-label={`Delete ${t.name}`} className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-red-50 text-ink/60 hover:text-red-700">
                        <Trash2 className="w-4 h-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-sm font-semibold text-ink/60">{tags.length ? "No tags match your search." : "No tags yet."}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete the tag “${toDelete?.name ?? ""}”?`}
        confirmLabel="Delete tag"
        danger
        busy={busy}
        onCancel={() => setToDelete(null)}
        onConfirm={() => void remove()}
      >
        <p>
          {toDelete?.count
            ? `It will be removed from ${toDelete.count} post${toDelete.count === 1 ? "" : "s"} (published and drafts).`
            : "No posts use this tag."}{" "}
          The posts themselves are not deleted.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={!!preview}
        title={`Merge into “${preview?.destination ?? ""}”?`}
        confirmLabel="Merge tags"
        busy={busy}
        onCancel={() => { setPreview(null); setMergeError(""); }}
        onConfirm={() => void merge()}
      >
        {preview && (
          <>
            <ul className="list-disc pl-5 space-y-1">
              {preview.sources.map((s) => (
                <li key={s.name}><strong>{s.name}</strong> — {s.posts} post{s.posts === 1 ? "" : "s"} will move, then this tag is removed</li>
              ))}
            </ul>
            <p>
              {preview.postsAffected} post{preview.postsAffected === 1 ? "" : "s"} will carry “{preview.destination}”
              {preview.postsAlreadyTagged > 0 ? ` (${preview.postsAlreadyTagged} already do, so no duplicate is created)` : ""}.
              Links to the removed tags will lead to “{preview.destination}”. No posts are deleted.
            </p>
            {mergeError && <p role="alert" className="font-semibold text-red-700">{mergeError}</p>}
          </>
        )}
      </ConfirmDialog>
    </div>
  );
}
