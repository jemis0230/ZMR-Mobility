"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import {
  createAuthorAction, updateAuthorAction, deleteAuthorAction,
  createTypeAction, renameTypeAction, deleteTypeAction,
} from "@/app/actions/blogActions";
import { safeAction } from "./safeAction";
import { AUTHOR_NAME_MAX, DESIGNATION_MAX, TYPE_NAME_MAX } from "@/lib/blog/text";
import ConfirmDialog from "./ConfirmDialog";

export type NamedItem = { id: string; name: string; designation?: string; count: number };
type Kind = "author" | "type";

const INPUT = "w-full min-h-[44px] bg-white border border-ink/20 rounded-lg px-4 text-sm text-ink placeholder-ink/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/25";
const LABEL = "text-xs font-bold uppercase tracking-wider text-ink/70 mb-1.5 block";

const ACTIONS = {
  author: {
    create: (v: { name: string; designation: string }) => createAuthorAction(v),
    update: (id: string, v: { name: string; designation: string }) => updateAuthorAction(id, v),
    remove: (id: string, to?: string | null) => deleteAuthorAction(id, to),
  },
  type: {
    create: (v: { name: string }) => createTypeAction(v),
    update: (id: string, v: { name: string }) => renameTypeAction(id, v),
    remove: (id: string, to?: string | null) => deleteTypeAction(id, to),
  },
};

/** Manage blog authors (name + designation) or blog types (name). */
export default function ManageNamedItemsClient({ kind, items }: { kind: Kind; items: NamedItem[] }) {
  const router = useRouter();
  const isAuthor = kind === "author";
  const noun = isAuthor ? "author" : "type";
  const nameMax = isAuthor ? AUTHOR_NAME_MAX : TYPE_NAME_MAX;

  const [status, setStatus] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [draft, setDraft] = useState({ name: "", designation: "" });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<{ id: string; name: string; designation: string } | null>(null);
  const [editError, setEditError] = useState("");
  const [toDelete, setToDelete] = useState<NamedItem | null>(null);
  const [reassignTo, setReassignTo] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const done = (text: string) => { setStatus({ kind: "ok", text }); router.refresh(); };
  const values = (v: { name: string; designation: string }) => (isAuthor ? v : { name: v.name });

  const create = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    const res = await safeAction((ACTIONS[kind].create as (v: object) => ReturnType<typeof createTypeAction>)(values(draft)));
    setSaving(false);
    if (!res.success) { setStatus({ kind: "error", text: res.error }); return; }
    setDraft({ name: "", designation: "" });
    done(`${isAuthor ? "Author" : "Type"} “${res.data.name}” added.`);
  };

  const update = async () => {
    if (!editing) return;
    setSaving(true);
    const res = await safeAction((ACTIONS[kind].update as (id: string, v: object) => ReturnType<typeof renameTypeAction>)(editing.id, values(editing)));
    setSaving(false);
    if (!res.success) { setEditError(res.error); return; }
    setEditing(null);
    done(isAuthor
      ? "Author profile updated. Published articles keep the byline they were saved with; update an article to use the new details."
      : `Type renamed to “${res.data.name}”.`);
  };

  const remove = async () => {
    if (!toDelete) return;
    setSaving(true);
    const res = await safeAction(ACTIONS[kind].remove(toDelete.id, reassignTo || null));
    setSaving(false);
    if (!res.success) { setDeleteError(res.error); return; }
    setToDelete(null);
    const n = res.data.postsReassigned;
    done(`${isAuthor ? "Author" : "Type"} deleted${n ? `; ${n} post${n === 1 ? " was" : "s were"} reassigned` : ""}.`);
  };

  const others = toDelete ? items.filter((i) => i.id !== toDelete.id) : [];

  return (
    <div className="space-y-6">
      {status && (
        <p role={status.kind === "error" ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm font-semibold ${status.kind === "error" ? "border border-red-300 bg-red-50 text-red-800" : "border border-leaf/30 bg-lime/40 text-forest"}`}>
          {status.text}
        </p>
      )}

      <form onSubmit={create} className="glass-card p-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" aria-label={`Add ${noun}`}>
        <div>
          <label htmlFor={`new-${kind}-name`} className={LABEL}>{isAuthor ? "Author name" : "Type name"}</label>
          <input id={`new-${kind}-name`} value={draft.name} maxLength={nameMax} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className={INPUT} placeholder={isAuthor ? "Full name as it should appear" : "e.g. Case study"} />
        </div>
        {isAuthor ? (
          <div>
            <label htmlFor="new-author-designation" className={LABEL}>Designation</label>
            <input id="new-author-designation" value={draft.designation} maxLength={DESIGNATION_MAX} onChange={(e) => setDraft((d) => ({ ...d, designation: e.target.value }))} className={INPUT} placeholder="e.g. Head of Operations" />
          </div>
        ) : <div className="hidden sm:block" />}
        <button type="submit" disabled={saving || !draft.name.trim() || (isAuthor && !draft.designation.trim())} className="min-h-[44px] inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-60">
          <Plus className="w-4 h-4" aria-hidden /> Add {noun}
        </button>
        {isAuthor && <p className="sm:col-span-3 text-xs text-ink/60">Authors are byline profiles — they do not get a login. Guest authors can be added here. Only the name and designation appear publicly.</p>}
      </form>

      <div className="glass-card p-4 sm:p-6 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left">
          <thead>
            <tr className="border-b border-ink/[0.08] text-ink/60 text-[11px] uppercase tracking-[0.15em] font-black">
              <th scope="col" className="pb-3 pl-2">{isAuthor ? "Author" : "Type"}</th>
              {isAuthor && <th scope="col" className="pb-3">Designation</th>}
              <th scope="col" className="pb-3">Posts</th>
              <th scope="col" className="pb-3 pr-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/[0.08]">
            {items.map((it) =>
              editing?.id === it.id ? (
                <tr key={it.id}>
                  <td colSpan={isAuthor ? 4 : 3} className="py-3 px-2">
                    <form onSubmit={(e) => { e.preventDefault(); void update(); }} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                      <div>
                        <label htmlFor={`edit-${it.id}-name`} className={LABEL}>Name</label>
                        <input id={`edit-${it.id}-name`} autoFocus value={editing.name} maxLength={nameMax} onChange={(e) => { setEditing({ ...editing, name: e.target.value }); setEditError(""); }} className={INPUT} />
                      </div>
                      {isAuthor ? (
                        <div>
                          <label htmlFor={`edit-${it.id}-des`} className={LABEL}>Designation</label>
                          <input id={`edit-${it.id}-des`} value={editing.designation} maxLength={DESIGNATION_MAX} onChange={(e) => { setEditing({ ...editing, designation: e.target.value }); setEditError(""); }} className={INPUT} />
                        </div>
                      ) : <div className="hidden sm:block" />}
                      <div className="flex gap-2">
                        <button type="submit" disabled={saving} aria-label="Save" className="w-11 h-11 inline-flex items-center justify-center rounded-lg bg-primary text-white"><Check className="w-4 h-4" aria-hidden /></button>
                        <button type="button" onClick={() => setEditing(null)} aria-label="Cancel" className="w-11 h-11 inline-flex items-center justify-center rounded-lg border border-ink/20"><X className="w-4 h-4" aria-hidden /></button>
                      </div>
                      {editError && <p role="alert" className="sm:col-span-3 text-xs font-semibold text-red-700">{editError}</p>}
                      {isAuthor && it.count > 0 && <p className="sm:col-span-3 text-xs text-ink/60">Existing articles keep their saved byline until they are updated.</p>}
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={it.id}>
                  <td className="py-3 pl-2 pr-3 font-bold text-forest">{it.name}</td>
                  {isAuthor && <td className="py-3 pr-3 text-sm text-ink/80">{it.designation}</td>}
                  <td className="py-3 pr-3 text-sm">{it.count}</td>
                  <td className="py-3 pr-2">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => { setEditing({ id: it.id, name: it.name, designation: it.designation ?? "" }); setEditError(""); }} aria-label={`Edit ${it.name}`} className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-ink/5 text-ink/70 hover:text-primary">
                        <Edit className="w-4 h-4" aria-hidden />
                      </button>
                      <button type="button" onClick={() => { setToDelete(it); setReassignTo(""); setDeleteError(""); }} aria-label={`Delete ${it.name}`} className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-red-50 text-ink/60 hover:text-red-700">
                        <Trash2 className="w-4 h-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ),
            )}
            {items.length === 0 && (
              <tr><td colSpan={isAuthor ? 4 : 3} className="py-12 text-center text-sm font-semibold text-ink/60">No {noun}s yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title={`Delete “${toDelete?.name ?? ""}”?`}
        confirmLabel={toDelete?.count ? `Reassign ${toDelete.count} and delete` : `Delete ${noun}`}
        danger
        busy={saving}
        confirmDisabled={!!toDelete?.count && !reassignTo}
        onCancel={() => setToDelete(null)}
        onConfirm={() => void remove()}
      >
        {toDelete?.count ? (
          <>
            <p>
              This {noun} is used by {toDelete.count} post{toDelete.count === 1 ? "" : "s"}. Choose the {noun} those posts should use instead.
              {isAuthor ? " Their byline will change to the new author." : ""}
            </p>
            <label htmlFor="reassign-to" className={LABEL}>Reassign posts to</label>
            <select id="reassign-to" value={reassignTo} onChange={(e) => setReassignTo(e.target.value)} className={INPUT}>
              <option value="">Choose…</option>
              {others.map((o) => <option key={o.id} value={o.id}>{o.name}{o.designation ? ` — ${o.designation}` : ""}</option>)}
            </select>
            {others.length === 0 && <p className="text-xs font-semibold text-amber-700">Add another {noun} first.</p>}
          </>
        ) : (
          <p>No posts use this {noun}.</p>
        )}
        {deleteError && <p role="alert" className="font-semibold text-red-700">{deleteError}</p>}
      </ConfirmDialog>
    </div>
  );
}
