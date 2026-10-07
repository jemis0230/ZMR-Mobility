'use client';

import { useState, useTransition, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, X, Car, AlertTriangle, ImageIcon, Search } from 'lucide-react';
import EVImage from '@/presentation/components/EVImage';
import { api } from '@/lib/api-client';
import type { BrandItem, ModelItem } from '@/app/actions/evCatalogActions';

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

const VEHICLE_CATEGORIES = [
  { value: 'TWO_WHEELER',             label: '2 Wheeler',            short: '2W',  color: 'teal'  },
  { value: 'THREE_WHEELER_PASSENGER', label: '3 Wheeler (Passenger)', short: '3W-P', color: 'amber' },
  { value: 'THREE_WHEELER_CARGO',     label: '3 Wheeler (Cargo)',    short: '3W-C', color: 'amber' },
  { value: 'FOUR_WHEELER_PASSENGER',  label: '4 Wheeler (Passenger)', short: '4W-P', color: 'blue'  },
  { value: 'FOUR_WHEELER_CARGO',      label: '4 Wheeler (Cargo)',    short: '4W-C', color: 'blue'  },
] as const;

type CategoryColor = 'teal' | 'amber' | 'blue';

const CHIP_STYLES: Record<CategoryColor, string> = {
  teal: 'bg-teal-400/10 text-teal-400 border-teal-400/20',
  amber: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  blue: 'bg-tint text-leaf border-sage/40',
};

// ─────────────────────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────────────────────

function inputCls(hasError = false) {
  return `w-full bg-ink/5 border rounded-xl px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-primary placeholder:text-ink/40 ${hasError ? 'border-red-500/60' : 'border-ink/10'}`;
}

function FormError({ msg }: { msg: string }) {
  return <p className="text-xs text-red-400 mt-1">{msg}</p>;
}

function CategoryChip({ cat }: { cat: string }) {
  const meta = VEHICLE_CATEGORIES.find((c) => c.value === cat);
  if (!meta) return null;
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border ${CHIP_STYLES[meta.color]}`}>
      {meta.short}
    </span>
  );
}

function BrandCategoryCheckboxes({ defaultValues = [] }: { defaultValues?: string[] }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest text-ink/50 font-bold">Categories (multi-select)</label>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {VEHICLE_CATEGORIES.map(({ value, short, color }) => (
          <label key={value} className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              name="categories"
              value={value}
              defaultChecked={defaultValues.includes(value)}
              className="accent-primary w-3.5 h-3.5"
            />
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${CHIP_STYLES[color]}`}>{short}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Delete confirm modal
// ─────────────────────────────────────────────────────────────

function DeleteConfirm({
  label, onCancel, onConfirm, isPending, warning,
}: {
  label: string; onCancel: () => void; onConfirm: () => void; isPending: boolean; warning?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{ background: 'linear-gradient(145deg,#ffffff,#fff5f5)', border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 25px 60px rgba(45,71,62,0.18)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-ink">Delete {label}</h3>
            {warning && <p className="text-xs text-red-300/70 mt-0.5">{warning}</p>}
          </div>
        </div>
        <p className="text-sm text-ink/65">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-ink/10 text-ink/65 hover:text-ink hover:border-ink/25 transition-all">Cancel</button>
          <button onClick={onConfirm} disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50">
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Model form — defined at module level to prevent remount bug
// (defining inside ModelPanel would create a new component type
//  on every render, unmounting the form and resetting file inputs)
// ─────────────────────────────────────────────────────────────

interface ModelFormProps {
  isEdit: boolean;
  editingModel: ModelItem | null;
  selectedBrandId: string | null;
  brands: BrandItem[];
  isPending: boolean;
  error: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

function ModelForm({
  isEdit, editingModel, selectedBrandId, brands, isPending, error, onSubmit, onCancel,
}: ModelFormProps) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  // Track selected category so we can filter the brand dropdown reactively
  const [chosenCategory, setChosenCategory] = useState(isEdit ? (editingModel?.category ?? '') : '');

  // When a brand is pre-selected from the left panel, restrict categories to that brand's list
  const preSelectedBrand = brands.find((b) => b.id === selectedBrandId);
  const availableCategories = preSelectedBrand && preSelectedBrand.categories.length > 0
    ? VEHICLE_CATEGORIES.filter((c) => preSelectedBrand.categories.includes(c.value))
    : VEHICLE_CATEGORIES;

  // Brand options: only populated once a category is chosen (empty = show hint, not all brands)
  const brandsForCategory = chosenCategory
    ? brands.filter((b) => b.isActive && b.categories.includes(chosenCategory))
    : [];

  return (
    <form onSubmit={onSubmit} className="space-y-3 p-4 rounded-xl bg-ink/5 border border-ink/10 mb-3">
      {/* Name */}
      <div>
        <label className="text-[10px] uppercase tracking-widest text-ink/50 font-bold">Model Name</label>
        <input
          name="name"
          defaultValue={isEdit ? editingModel?.name : ''}
          placeholder="e.g. Ola S1 Pro"
          className={`${inputCls()} mt-1`}
          required
        />
      </div>

      {/* Category — controlled so brand list reacts immediately */}
      <div>
        <label className="text-[10px] uppercase tracking-widest text-ink/50 font-bold">Vehicle Category</label>
        <select
          name="category"
          value={chosenCategory}
          onChange={(e) => setChosenCategory(e.target.value)}
          required
          className="w-full mt-1 bg-ink/5 border border-ink/10 rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-primary [&>option]:bg-white"
        >
          <option value="">Select category…</option>
          {availableCategories.map(({ value, label, short }) => (
            <option key={value} value={value}>{label} ({short})</option>
          ))}
        </select>
      </div>

      {/* Brand selector — only when no brand pre-selected; filtered by chosen category */}
      {!isEdit && !selectedBrandId && (
        <div>
          <label className="text-[10px] uppercase tracking-widest text-ink/50 font-bold">Brand</label>
          {brandsForCategory.length === 0 ? (
            <p className="mt-1 text-xs text-amber-400/70 py-2">
              {chosenCategory ? `No brands configured for ${chosenCategory}. Add categories to brands first.` : 'Select a category first to see relevant brands.'}
            </p>
          ) : (
            <select name="brandId" required className="w-full mt-1 bg-ink/5 border border-ink/10 rounded-xl px-3 py-2.5 text-sm text-ink outline-none focus:border-primary [&>option]:bg-white">
              <option value="">Select brand…</option>
              {brandsForCategory.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
        </div>
      )}

      {/* Photo */}
      <div>
        <label className="text-[10px] uppercase tracking-widest text-ink/50 font-bold">Photo (optional)</label>
        <div className="mt-1 flex items-center gap-3">
          {(photoPreview || (isEdit && editingModel?.photo)) && (
            <img
              src={photoPreview ?? editingModel?.photo ?? ''}
              alt="preview"
              className="w-14 h-14 rounded-lg object-contain bg-ink/5 border border-ink/10"
            />
          )}
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-ink/10 text-ink/60 hover:border-ink/25 hover:text-ink transition-all cursor-pointer text-xs">
            <ImageIcon className="w-3.5 h-3.5" />
            {photoPreview || (isEdit && editingModel?.photo) ? 'Change photo' : 'Upload photo'}
            <input
              type="file"
              name="photo"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setPhotoPreview(URL.createObjectURL(f));
              }}
            />
          </label>
        </div>
      </div>

      {/* Active toggle — edit only */}
      {isEdit && (
        <label className="flex items-center gap-2 text-xs text-ink/65 cursor-pointer">
          <input type="checkbox" name="isActive" defaultChecked={editingModel?.isActive} className="accent-primary" />
          Active
        </label>
      )}

      {error && <FormError msg={error} />}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all disabled:opacity-50"
        >
          {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Model'}
        </button>
        <button type="button" onClick={onCancel} className="p-2 rounded-lg border border-ink/10 text-ink/60 hover:text-ink transition-all">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// Brand panel
// ─────────────────────────────────────────────────────────────

function BrandPanel({
  brands, selectedBrandId, onSelectBrand, onBrandMutated,
}: {
  brands: BrandItem[];
  selectedBrandId: string | null;
  onSelectBrand: (id: string | null) => void;
  onBrandMutated: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BrandItem | null>(null);
  const [error, setError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const nameRef = useRef<HTMLInputElement>(null);

  const displayed = categoryFilter === 'ALL'
    ? brands
    : brands.filter((b) => b.categories.includes(categoryFilter));

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    const categories = fd.getAll('categories') as string[];
    startTransition(async () => {
      const res = await api.post('/brands', { name, categories });
      if (res.success) { setShowForm(false); router.refresh(); onBrandMutated(); }
      else setError(res.error ?? 'Failed');
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingBrand) return;
    setError('');
    const fd = new FormData(e.currentTarget);
    const name = fd.get('name') as string;
    const categories = fd.getAll('categories') as string[];
    const isActive = fd.get('isActive') === 'on';
    startTransition(async () => {
      const res = await api.put(`/brands/${editingBrand.id}`, { name, categories, isActive });
      if (res.success) { setEditingBrand(null); router.refresh(); onBrandMutated(); }
      else setError(res.error ?? 'Failed');
    });
  };

  const handleDelete = (brand: BrandItem) => {
    startTransition(async () => {
      await api.del(`/brands/${brand.id}`);
      if (selectedBrandId === brand.id) onSelectBrand(null);
      router.refresh();
      onBrandMutated();
      setDeleteTarget(null);
    });
  };

  return (
    <div className="glass-card p-5 border-ink/[0.08] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-ink">Brands <span className="text-ink/50 text-sm font-normal">({brands.length})</span></h2>
        <button
          onClick={() => { setShowForm(true); setEditingBrand(null); setError(''); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* Category filter bar */}
      <div className="flex flex-wrap gap-1.5">
        {(['ALL', ...VEHICLE_CATEGORIES.map((c) => c.value)] as const).map((val) => {
          const meta = val === 'ALL' ? null : VEHICLE_CATEGORIES.find((c) => c.value === val)!;
          const active = categoryFilter === val;
          return (
            <button
              key={val}
              onClick={() => setCategoryFilter(active && val !== 'ALL' ? 'ALL' : val)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                active
                  ? meta ? `${CHIP_STYLES[meta.color]}` : 'bg-ink/10 border-ink/25 text-ink'
                  : 'border-ink/[0.08] text-ink/50 hover:text-ink/70 hover:border-ink/15'
              }`}
            >
              {val === 'ALL' ? 'ALL' : meta!.short}
            </button>
          );
        })}
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="space-y-3 p-3 rounded-xl bg-ink/5 border border-ink/10">
          <input ref={nameRef} name="name" placeholder="Brand name…" autoFocus className={inputCls()} required />
          <BrandCategoryCheckboxes />
          {error && <FormError msg={error} />}
          <div className="flex gap-2">
            <button type="submit" disabled={isPending}
              className="flex-1 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all disabled:opacity-50">
              {isPending ? 'Saving…' : 'Create Brand'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="p-2 rounded-lg border border-ink/10 text-ink/60 hover:text-ink transition-all">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {/* Brand list */}
      <div className="space-y-1.5 flex-1 overflow-y-auto max-h-[420px]">
        {displayed.length === 0 ? (
          <p className="text-ink/40 text-sm text-center py-8">
            {categoryFilter === 'ALL' ? 'No brands yet.' : `No brands in this category.`}
          </p>
        ) : displayed.map((brand) => (
          <div key={brand.id}>
            {editingBrand?.id === brand.id ? (
              <form onSubmit={handleUpdate} className="space-y-3 p-3 rounded-xl bg-ink/5 border border-primary/20">
                <input name="name" defaultValue={brand.name} className={inputCls()} required />
                <BrandCategoryCheckboxes defaultValues={brand.categories} />
                <label className="flex items-center gap-2 text-xs text-ink/65 cursor-pointer">
                  <input type="checkbox" name="isActive" defaultChecked={brand.isActive} className="accent-primary" />
                  Active
                </label>
                {error && <FormError msg={error} />}
                <div className="flex gap-2">
                  <button type="submit" disabled={isPending}
                    className="flex-1 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold disabled:opacity-50">
                    {isPending ? '…' : 'Save'}
                  </button>
                  <button type="button" onClick={() => setEditingBrand(null)} className="p-1.5 rounded-lg border border-ink/10 text-ink/60 hover:text-ink transition-all">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </form>
            ) : (
              <div
                onClick={() => onSelectBrand(selectedBrandId === brand.id ? null : brand.id)}
                className={`flex items-start gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${selectedBrandId === brand.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-ink/5 border border-transparent'}`}
              >
                <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${brand.isActive ? 'bg-primary' : 'bg-ink/20'}`} />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-semibold text-ink truncate block">{brand.name}</span>
                  {brand.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {brand.categories.map((cat) => <CategoryChip key={cat} cat={cat} />)}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-ink/50 flex-shrink-0 mt-0.5">{brand.modelCount}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={(e) => { e.stopPropagation(); setEditingBrand(brand); setShowForm(false); setError(''); }}
                    className="p-1 rounded text-ink/60 hover:text-primary transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(brand); }}
                    className="p-1 rounded text-ink/60 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {deleteTarget && (
        <DeleteConfirm
          label={`"${deleteTarget.name}"`}
          warning={deleteTarget.modelCount > 0 ? `This will also delete ${deleteTarget.modelCount} model(s).` : undefined}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
          isPending={isPending}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Model panel
// ─────────────────────────────────────────────────────────────

function ModelPanel({
  models, brands, selectedBrandId,
}: {
  models: ModelItem[];
  brands: BrandItem[];
  selectedBrandId: string | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ModelItem | null>(null);
  const [formError, setFormError] = useState('');
  const [modelSearch, setModelSearch] = useState('');

  const byBrand = selectedBrandId ? models.filter((m) => m.brandId === selectedBrandId) : models;
  const filtered = modelSearch.trim()
    ? byBrand.filter((m) => m.name.toLowerCase().includes(modelSearch.toLowerCase()))
    : byBrand;
  const selectedBrandName = brands.find((b) => b.id === selectedBrandId)?.name;

  const resetForm = () => { setShowForm(false); setEditingModel(null); setFormError(''); };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError('');
    const fd = new FormData(e.currentTarget);
    if (selectedBrandId) fd.set('brandId', selectedBrandId);
    const brandId = fd.get('brandId') as string;
    startTransition(async () => {
      const res = await api.upload(`/brands/${brandId}/models`, fd);
      if (res.success) { resetForm(); router.refresh(); }
      else setFormError(res.error ?? 'Failed');
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingModel) return;
    setFormError('');
    const fd = new FormData(e.currentTarget);
    fd.set('isActive', fd.get('isActive') === 'on' ? 'true' : 'false');
    startTransition(async () => {
      const res = await api.upload(`/brands/${editingModel.brandId}/models/${editingModel.id}`, fd, 'PUT');
      if (res.success) { resetForm(); router.refresh(); }
      else setFormError(res.error ?? 'Failed');
    });
  };

  const handleDelete = (model: ModelItem) => {
    startTransition(async () => {
      await api.del(`/brands/${model.brandId}/models/${model.id}`);
      router.refresh();
      setDeleteTarget(null);
    });
  };

  return (
    <div className="glass-card p-5 border-ink/[0.08] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-ink">
          Models
          {selectedBrandName && <span className="text-primary ml-2 text-sm font-normal">· {selectedBrandName}</span>}
          <span className="text-ink/50 text-sm font-normal ml-1">({filtered.length})</span>
        </h2>
        <button
          onClick={() => { setShowForm(true); setEditingModel(null); setFormError(''); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/45 pointer-events-none" />
        <input
          type="text"
          placeholder="Search models…"
          value={modelSearch}
          onChange={(e) => setModelSearch(e.target.value)}
          className="w-full bg-ink/5 border border-ink/10 rounded-xl pl-8 pr-8 py-2 text-xs text-ink outline-none focus:border-primary/40 placeholder:text-ink/40 transition-all"
        />
        {modelSearch && (
          <button onClick={() => setModelSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-ink/45 hover:text-ink/70 transition-colors">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {!selectedBrandId && (
        <p className="text-xs text-ink/45 text-center py-1">← Select a brand to filter models</p>
      )}

      {/* Create form — uses stable top-level ModelForm component */}
      {showForm && !editingModel && (
        <ModelForm
          isEdit={false}
          editingModel={null}
          selectedBrandId={selectedBrandId}
          brands={brands}
          isPending={isPending}
          error={formError}
          onSubmit={handleCreate}
          onCancel={resetForm}
        />
      )}

      {/* Model list */}
      <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px]">
        {filtered.length === 0 ? (
          <p className="text-ink/40 text-sm text-center py-8">
            {modelSearch ? `No models matching "${modelSearch}".` : selectedBrandId ? 'No models for this brand yet.' : 'No models yet.'}
          </p>
        ) : filtered.map((model) => (
          <div key={model.id}>
            {editingModel?.id === model.id ? (
              <ModelForm
                isEdit
                editingModel={model}
                selectedBrandId={selectedBrandId}
                brands={brands}
                isPending={isPending}
                error={formError}
                onSubmit={handleUpdate}
                onCancel={resetForm}
              />
            ) : (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-ink/[0.03] border border-ink/[0.08] hover:border-ink/10 transition-all group">
                {model.photo ? (
                  <EVImage
                    src={model.photo}
                    alt={model.name}
                    className="w-10 h-10 rounded-lg border border-ink/10 flex-shrink-0"
                    imgClassName="w-full h-full object-contain"
                    iconSize="sm"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg ev-shimmer-base border border-ink/[0.08] flex items-center justify-center flex-shrink-0">
                    <Car className="w-4 h-4 text-[#577440]/20" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ink truncate">{model.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="text-[10px] text-ink/50">{model.brandName}</p>
                    {model.category && <CategoryChip cat={model.category} />}
                  </div>
                </div>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${model.isActive ? 'bg-primary' : 'bg-ink/20'}`} />
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingModel(model); setShowForm(false); setFormError(''); }}
                    className="p-1 rounded text-ink/60 hover:text-primary transition-colors"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteTarget(model)}
                    className="p-1 rounded text-ink/60 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {deleteTarget && (
        <DeleteConfirm
          label={`"${deleteTarget.name}"`}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => handleDelete(deleteTarget)}
          isPending={isPending}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

interface Props {
  initialBrands: BrandItem[];
  initialModels: ModelItem[];
  dbError: boolean;
}

export default function EvCatalogClient({ initialBrands, initialModels, dbError }: Props) {
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);

  if (dbError) {
    return (
      <div className="glass-card p-8 text-center border-red-500/20">
        <p className="text-red-400 font-bold">Failed to load catalog from database.</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <BrandPanel
        brands={initialBrands}
        selectedBrandId={selectedBrandId}
        onSelectBrand={setSelectedBrandId}
        onBrandMutated={() => {}}
      />
      <ModelPanel
        models={initialModels}
        brands={initialBrands}
        selectedBrandId={selectedBrandId}
      />
    </div>
  );
}
