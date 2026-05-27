'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api-client';

interface LookupItem {
  id: string;
  name: string;
  isActive: boolean;
}

interface Props {
  initialBatteryTypes: LookupItem[];
  initialMotorTypes: LookupItem[];
}

// ── Reusable lookup panel ──────────────────────────────────────────────────────

interface PanelProps {
  title: string;
  apiPath: string;
  items: LookupItem[];
  onRefresh: () => void;
}

function LookupPanel({ title, apiPath, items, onRefresh }: PanelProps) {
  const [isPending, startTransition] = useTransition();
  const [adding, setAdding] = useState(false);
  const [addName, setAddName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<LookupItem | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    setError(null);
    const result = await api.post<LookupItem>(apiPath, { name: addName });
    if (!result.success) { setError(result.error); return; }
    setAddName('');
    setAdding(false);
    startTransition(onRefresh);
  }

  function startEdit(item: LookupItem) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditActive(item.isActive);
    setError(null);
  }

  async function handleEdit() {
    if (!editingId) return;
    setError(null);
    const result = await api.put<LookupItem>(`${apiPath}/${editingId}`, { name: editName, isActive: editActive });
    if (!result.success) { setError(result.error); return; }
    setEditingId(null);
    startTransition(onRefresh);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setError(null);
    const result = await api.del(`${apiPath}/${deleteTarget.id}`);
    if (!result.success) { setError((result as { error: string }).error); return; }
    setDeleteTarget(null);
    startTransition(onRefresh);
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none transition-all';
  const btnPrimary = 'flex items-center gap-2 px-3 py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 rounded-lg text-sm font-semibold transition-colors';
  const btnGhost = 'p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors';

  return (
    <div className="glass-card p-6 flex flex-col gap-4 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full">{items.length} total</span>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Add form */}
      {adding ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Type name…"
            className={inputCls}
          />
          <button onClick={handleAdd} disabled={!addName.trim()} className={`${btnPrimary} shrink-0`}>
            <Check className="w-4 h-4" />
          </button>
          <button onClick={() => { setAdding(false); setAddName(''); setError(null); }} className={`${btnGhost} shrink-0`}>
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className={btnPrimary}>
          <Plus className="w-4 h-4" />
          Add {title.split(' ')[0]}
        </button>
      )}

      {/* List */}
      <div className="flex flex-col gap-1 overflow-y-auto">
        {items.length === 0 && (
          <p className="text-sm text-white/30 text-center py-8">No {title.toLowerCase()} yet</p>
        )}
        {items.map((item) =>
          editingId === item.id ? (
            <div key={item.id} className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
              <input
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <label className="flex items-center gap-1.5 text-xs text-white/50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editActive}
                  onChange={(e) => setEditActive(e.target.checked)}
                  className="accent-primary"
                />
                Active
              </label>
              <button onClick={handleEdit} disabled={!editName.trim()} className="p-1.5 rounded-lg hover:bg-primary/20 text-primary transition-colors">
                <Check className="w-4 h-4" />
              </button>
              <button onClick={() => { setEditingId(null); setError(null); }} className={btnGhost}>
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div key={item.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 group transition-colors">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.isActive ? 'bg-primary' : 'bg-white/20'}`} />
              <span className="flex-1 text-sm">{item.name}</span>
              {!item.isActive && <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">Inactive</span>}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(item)} className={btnGhost} title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        )}
        {isPending && <Loader2 className="w-4 h-4 animate-spin text-white/30 mx-auto mt-2" />}
      </div>

      {/* Delete modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-sm w-full mx-4 space-y-4">
            <h3 className="font-bold text-lg">Delete &ldquo;{deleteTarget.name}&rdquo;?</h3>
            <p className="text-sm text-white/50">
              Any vehicles assigned this {title.includes('Battery') ? 'battery' : 'motor'} type will have it cleared. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 font-semibold transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function VehicleConfigClient({ initialBatteryTypes, initialMotorTypes }: Props) {
  const router = useRouter();
  const refresh = () => router.refresh();

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vehicle Configuration</h1>
        <p className="text-sm text-white/40 mt-1">Manage battery and motor type lookup lists used when creating vehicles.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <LookupPanel
          title="Battery Types"
          apiPath="/battery-types"
          items={initialBatteryTypes}
          onRefresh={refresh}
        />
        <LookupPanel
          title="Motor Types"
          apiPath="/motor-types"
          items={initialMotorTypes}
          onRefresh={refresh}
        />
      </div>
    </div>
  );
}
