'use client';

import { type FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Newspaper, Plus, X, Edit, Trash2, ExternalLink, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { PressMentionDTO } from '@/lib/press';

const INPUT = 'w-full bg-white border border-ink/20 rounded-lg px-4 py-3 text-ink placeholder-ink/50 focus:outline-none focus:border-primary';
const LABEL = 'text-xs font-bold uppercase tracking-wider text-ink/70 mb-2 block';

export default function AdminPressClient({ initialItems, dbError }: { initialItems: PressMentionDTO[]; dbError: boolean }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<PressMentionDTO | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (form: HTMLFormElement) => {
    setBusy(true);
    setError(null);
    const fd = new FormData(form);
    let imageUrl = String(fd.get('imageUrl') || '');
    const file = fd.get('imageFile') as File | null;
    try {
      if (file && file.size > 0) {
        const up = new FormData();
        up.append('file', file);
        up.append('folder', 'uploads/press');
        const res = await fetch('/api/uploads', { method: 'POST', body: up }).then((r) => r.json());
        if (!res.success) throw new Error(res.error || 'Image upload failed');
        imageUrl = res.data.url;
      }
      const body = {
        publication: fd.get('publication'),
        title: fd.get('title'),
        url: fd.get('url'),
        publishedAt: fd.get('publishedAt') || null,
        imageUrl,
        sortOrder: Number(fd.get('sortOrder')) || 0,
        isActive: fd.get('isActive') === 'on',
      };
      const res = editing ? await api.put<PressMentionDTO>(`/press/${editing.id}`, body) : await api.post<PressMentionDTO>('/press', body);
      if (!res.success) throw new Error(res.error);
      setItems((prev) => (editing ? prev.map((p) => (p.id === editing.id ? res.data : p)) : [...prev, res.data]));
      setEditing(null);
      setShowForm(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this press mention?')) return;
    const res = await api.del(`/press/${id}`);
    if (!res.success) { alert(res.error || 'Delete failed'); return; }
    setItems((prev) => prev.filter((p) => p.id !== id));
    router.refresh();
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => { e.preventDefault(); save(e.currentTarget); };
  const formOpen = showForm || editing;

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg"><Newspaper className="w-6 h-6 text-primary" /></div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Press &amp; Media</h1>
            <p className="text-ink/70 text-sm">Coverage shown on the public Press &amp; Media page. Add only real, verifiable articles.</p>
          </div>
        </div>
        <button onClick={() => { setEditing(null); setShowForm((s) => !s); }} className="bg-primary px-4 py-2 rounded-lg text-sm font-medium text-white hover:bg-primary-dark flex items-center gap-2">
          <Plus className="w-4 h-4" /> {showForm && !editing ? 'Hide form' : 'Add coverage'}
        </button>
      </div>

      {dbError && (
        <div className="glass-card p-5 border-red-300 flex items-center gap-3 text-red-800">
          <AlertTriangle className="w-5 h-5" /> Database connection error — check DATABASE_URL.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          {formOpen && (
            <form key={editing?.id ?? 'new'} onSubmit={onSubmit} className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{editing ? 'Edit coverage' : 'Add coverage'}</h2>
                <button type="button" aria-label="Close form" onClick={() => { setEditing(null); setShowForm(false); }} className="text-ink/60 hover:text-ink"><X className="w-5 h-5" /></button>
              </div>
              <div><label htmlFor="pm-pub" className={LABEL}>Publication</label><input id="pm-pub" name="publication" required defaultValue={editing?.publication} className={INPUT} placeholder="e.g. The Economic Times" /></div>
              <div><label htmlFor="pm-title" className={LABEL}>Article title</label><input id="pm-title" name="title" required defaultValue={editing?.title} className={INPUT} /></div>
              <div><label htmlFor="pm-url" className={LABEL}>Article link</label><input id="pm-url" name="url" type="url" required defaultValue={editing?.url} className={INPUT} placeholder="https://…" /></div>
              <div><label htmlFor="pm-date" className={LABEL}>Publication date</label><input id="pm-date" name="publishedAt" type="date" defaultValue={editing?.publishedAt?.slice(0, 10)} className={INPUT} /></div>
              <div>
                <label htmlFor="pm-img" className={LABEL}>Logo / image URL (optional)</label>
                <input id="pm-img" name="imageUrl" defaultValue={editing?.imageUrl ?? ''} className={INPUT} placeholder="https://… or leave blank" />
                <input name="imageFile" type="file" accept="image/*" aria-label="Upload logo or image" className="mt-2 text-xs" />
                <p className="text-[11px] text-ink/60 mt-1">Only use publication logos or images you have permission to display.</p>
              </div>
              <div><label htmlFor="pm-order" className={LABEL}>Sort order</label><input id="pm-order" name="sortOrder" type="number" step={1} defaultValue={editing?.sortOrder ?? 0} className={INPUT} /></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isActive" defaultChecked={editing?.isActive ?? true} className="w-4 h-4" /> Show on website</label>
              {error && <p role="alert" className="text-sm text-red-800">{error}</p>}
              <button type="submit" disabled={busy} className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary-dark disabled:opacity-50">
                {busy ? 'Saving…' : editing ? 'Update' : 'Save'}
              </button>
            </form>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Coverage ({items.length})</h2>
          {items.length === 0 && !dbError && (
            <div className="py-16 text-center glass-card border-dashed">
              <p className="text-ink/70">No press coverage added yet. The public page shows a &ldquo;coming soon&rdquo; message until you add some.</p>
            </div>
          )}
          {items.map((p) => (
            <div key={p.id} className="glass-card p-5 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-ink/60">
                  {p.publication}{p.publishedAt ? ` · ${new Date(p.publishedAt).toLocaleDateString('en-IN')}` : ''}
                  {!p.isActive && <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-red-800">Hidden</span>}
                </p>
                <p className="font-bold text-lg truncate">{p.title}</p>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary inline-flex items-center gap-1 hover:underline break-all">
                  {p.url} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex gap-2 shrink-0">
                <button aria-label={`Edit ${p.title}`} onClick={() => { setEditing(p); setShowForm(true); }} className="p-2 rounded hover:bg-ink/5"><Edit className="w-4 h-4" /></button>
                <button aria-label={`Delete ${p.title}`} onClick={() => remove(p.id)} className="p-2 rounded text-red-700 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
