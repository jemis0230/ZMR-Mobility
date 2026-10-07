'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Phone, Mail, ChevronDown, ChevronLeft, ChevronRight,
  X, Car, Zap, AlertTriangle, User, Trash2, FileText,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import type { SellApplicationItem } from '@/app/actions/sellActions';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  NEW: { label: 'New', dot: 'bg-primary animate-pulse', badge: 'bg-primary/10 text-primary', next: 'REVIEWING' as const, nextLabel: 'Mark Reviewing' },
  REVIEWING: { label: 'Reviewing', dot: 'bg-yellow-500', badge: 'bg-yellow-500/10 text-yellow-400', next: 'VALUED' as const, nextLabel: 'Mark Valued' },
  VALUED: { label: 'Valued', dot: 'bg-sage', badge: 'bg-tint text-leaf', next: 'CLOSED' as const, nextLabel: 'Mark Closed' },
  CLOSED: { label: 'Closed', dot: 'bg-green-500', badge: 'bg-green-500/10 text-green-400', next: 'NEW' as const, nextLabel: 'Re-open' },
} as const;

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMins = Math.floor((now.getTime() - d.getTime()) / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  let relative = '';
  if (diffMins < 2) relative = 'Just now';
  else if (diffMins < 60) relative = `${diffMins}m ago`;
  else if (diffHours < 24) relative = `${diffHours}h ago`;
  else if (diffDays === 1) relative = 'Yesterday';
  else relative = `${diffDays}d ago`;
  return { primary: `${date}, ${time}`, secondary: relative };
}

// ─────────────────────────────────────────────────────────────
// Status toggle
// ─────────────────────────────────────────────────────────────

function StatusToggle({ app }: { app: SellApplicationItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const config = STATUS_CONFIG[app.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.NEW;
  return (
    <div className="flex items-center gap-2">
      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${config.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
      <button
        onClick={() => startTransition(async () => { await api.patch(`/sell-applications/${app.id}`, { status: config.next }); router.refresh(); })}
        disabled={isPending}
        title={config.nextLabel}
        className="opacity-0 group-hover:opacity-100 text-ink/50 hover:text-ink/75 transition-all border border-ink/10 rounded p-0.5 disabled:cursor-not-allowed"
      >
        {isPending ? <span className="text-[10px] px-0.5">…</span> : <ChevronDown className="w-3 h-3" />}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Delete confirm
// ─────────────────────────────────────────────────────────────

function DeleteConfirm({ app, onCancel, onDeleted }: { app: SellApplicationItem; onCancel: () => void; onDeleted: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const handle = () => startTransition(async () => { await api.del(`/sell-applications/${app.id}`); router.refresh(); onDeleted(); });
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl p-6 space-y-4"
        style={{ background: 'linear-gradient(145deg,#ffffff,#fff5f5)', border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 25px 60px rgba(45,71,62,0.18)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-ink">Delete Application</h3>
            <p className="text-xs text-ink/60">{app.applicationId}</p>
          </div>
        </div>
        <p className="text-sm text-ink/65">Permanently delete this sell application from <span className="font-bold text-ink">{app.contactName}</span>? This cannot be undone.</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-ink/10 text-ink/65 hover:text-ink hover:border-ink/25 transition-all">Cancel</button>
          <button onClick={handle} disabled={isPending} className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50">
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Detail Modal
// ─────────────────────────────────────────────────────────────

function DetailModal({ app, onClose, onDeleteRequest }: { app: SellApplicationItem; onClose: () => void; onDeleteRequest: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(app.status);
  const config = STATUS_CONFIG[currentStatus as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.NEW;
  const docs = Array.isArray(app.documents) ? app.documents.filter(Boolean) : [];

  const handleStatus = (s: string) => startTransition(async () => {
    await api.patch(`/sell-applications/${app.id}`, { status: s });
    setCurrentStatus(s);
    router.refresh();
  });

  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-ink/[0.08] last:border-0">
      <span className="text-[11px] uppercase tracking-widest text-ink/50 font-bold flex-shrink-0">{label}</span>
      <span className="text-sm text-ink text-right">{value}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: 'linear-gradient(145deg,#ffffff,#f5f9ff)', border: '1px solid rgba(45,71,62,0.08)', boxShadow: '0 25px 60px rgba(45,71,62,0.18)' }}>
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-ink/[0.08] sticky top-0 bg-white z-10">
          <div>
            <code className="text-xs text-primary font-bold tracking-wider">{app.applicationId}</code>
            <h2 className="text-lg font-bold text-ink mt-0.5">{app.contactName}</h2>
            <span className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${config.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} /> {config.label}
              {isPending && <span className="text-[9px] opacity-50">updating…</span>}
            </span>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <button onClick={() => { onClose(); onDeleteRequest(); }}
              className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-all">
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg bg-ink/5 border border-ink/10 flex items-center justify-center hover:bg-ink/10 transition-all">
              <X className="w-4 h-4 text-ink/70" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Contact */}
          <div className="bg-ink/5 rounded-xl p-4 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-ink/50 font-bold mb-2">Contact</p>
            <div className="flex items-center gap-2 text-sm text-ink"><Phone className="w-3.5 h-3.5 text-primary" /> +91 {app.contactPhone}</div>
            <div className="flex items-center gap-2 text-sm text-ink"><Mail className="w-3.5 h-3.5 text-primary" /> {app.contactEmail}</div>
            <div className="flex items-center gap-2 text-sm text-ink/75"><User className="w-3.5 h-3.5 text-ink/50" /> {app.contactCity} · {app.sellerType}</div>
          </div>

          {/* Vehicle */}
          <div className="bg-ink/5 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-ink/50 font-bold mb-3">Vehicle Details</p>
            <div className="space-y-0">
              <InfoRow label="Category" value={app.category} />
              <InfoRow label="Brand & Model" value={<span className="flex items-center gap-1.5"><Car className="w-3.5 h-3.5 text-primary" />{app.brandName} {app.modelName}</span>} />
              <InfoRow label="Year" value={app.year} />
              <InfoRow label="Ownership" value={app.ownership} />
            </div>
          </div>

          {/* Condition */}
          <div className="bg-ink/5 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-ink/50 font-bold mb-3">Condition</p>
            <div className="space-y-0">
              <InfoRow label="Battery" value={<span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary" />{app.batteryCondition}</span>} />
              <InfoRow label="Condition" value={app.vehicleCondition} />
              <InfoRow label="Accident" value={app.hasAccident ? <span className="text-red-400">Yes</span> : <span className="text-green-400">No</span>} />
              <InfoRow label="Loan" value={app.loanStatus} />
              <InfoRow label="Documents" value={docs.length > 0 ? docs.join(', ') : 'None'} />
            </div>
          </div>

          {/* Price */}
          <div className="bg-ink/5 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-ink/50 font-bold">Expected Price</p>
              <p className="text-2xl font-black text-primary mt-1">₹{app.expectedPriceRs.toLocaleString('en-IN')}</p>
            </div>
            <FileText className="w-8 h-8 text-ink/25" />
          </div>

          <p className="text-[11px] text-ink/45 text-center">Submitted {new Date(app.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        {/* Status buttons */}
        <div className="px-6 pb-6 flex gap-2 flex-wrap">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button key={key} disabled={currentStatus === key || isPending} onClick={() => handleStatus(key)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${currentStatus === key ? `${cfg.badge} border-transparent` : 'border-ink/10 text-ink/60 hover:text-ink hover:border-ink/25 disabled:cursor-not-allowed'}`}>
              {cfg.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Search, filter, pagination (URL-param driven)
// ─────────────────────────────────────────────────────────────

function SearchBar({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(window.location.search);
    params.delete('page');
    e.target.value ? params.set('q', e.target.value) : params.delete('q');
    router.replace(`/admin/sell-applications?${params.toString()}`);
  };
  return <input defaultValue={defaultValue} onChange={handle} placeholder="Search by name, phone, app ID…" className="bg-ink/5 border border-ink/10 rounded-lg px-4 py-2 text-sm focus:border-primary outline-none w-full sm:w-64" />;
}

function StatusFilter({ current }: { current: string }) {
  const router = useRouter();
  const go = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    params.delete('page');
    val === 'ALL' ? params.delete('status') : params.set('status', val);
    router.replace(`/admin/sell-applications?${params.toString()}`);
  };
  return (
    <div className="flex gap-1">
      {(['ALL', 'NEW', 'REVIEWING', 'VALUED', 'CLOSED'] as const).map((val) => (
        <button key={val} onClick={() => go(val)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${current === val ? 'bg-primary/10 text-primary border border-primary/30' : 'text-ink/60 hover:text-ink/75 border border-ink/[0.08] hover:border-ink/15'}`}>
          {val === 'ALL' ? 'All' : val.charAt(0) + val.slice(1).toLowerCase()}
        </button>
      ))}
    </div>
  );
}

function Pagination({ page, pageCount, total }: { page: number; pageCount: number; total: number }) {
  const router = useRouter();
  if (pageCount <= 1) return null;
  const go = (p: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', String(p));
    router.replace(`/admin/sell-applications?${params.toString()}`);
  };
  const raw = [1, pageCount, page, page - 1, page + 1].filter((p) => p >= 1 && p <= pageCount);
  const sorted = raw.filter((p, i) => raw.indexOf(p) === i).sort((a, b) => a - b);
  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs text-ink/50">{total} applications total</p>
      <div className="flex items-center gap-1">
        <button onClick={() => go(page - 1)} disabled={page === 1} className="p-1.5 rounded-lg border border-ink/10 text-ink/60 hover:text-ink hover:border-ink/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft className="w-4 h-4" /></button>
        {sorted.map((p, i) => {
          const prev = sorted[i - 1];
          return (
            <div key={p} className="flex items-center gap-1">
              {prev && p - prev > 1 && <span className="text-xs text-ink/40 px-1">…</span>}
              <button onClick={() => go(p)} className={`min-w-[32px] h-8 rounded-lg text-xs font-bold transition-all border ${p === page ? 'bg-primary/10 text-primary border-primary/30' : 'border-ink/10 text-ink/60 hover:text-ink hover:border-ink/25'}`}>{p}</button>
            </div>
          );
        })}
        <button onClick={() => go(page + 1)} disabled={page === pageCount} className="p-1.5 rounded-lg border border-ink/10 text-ink/60 hover:text-ink hover:border-ink/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

interface Props {
  apps: SellApplicationItem[];
  search: string;
  statusFilter: string;
  page: number;
  pageCount: number;
  total: number;
  dbError: boolean;
}

export default function SellApplicationsClient({ apps, search, statusFilter, page, pageCount, total, dbError }: Props) {
  const [detailApp, setDetailApp] = useState<SellApplicationItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SellApplicationItem | null>(null);

  if (dbError) {
    return (
      <div className="glass-card p-8 text-center border-red-500/20">
        <p className="text-red-400 font-bold">Failed to load applications.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <StatusFilter current={statusFilter} />
        <SearchBar defaultValue={search} />
      </div>

      <div className="glass-card overflow-hidden border-ink/[0.08]">
        {apps.length === 0 ? (
          <div className="py-20 text-center">
            <User className="w-10 h-10 text-ink/25 mx-auto mb-3" />
            <p className="text-ink/50 text-sm">
              {search || statusFilter !== 'ALL' ? 'No applications match your filters.' : 'No sell applications yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-ink/5 text-[11px] uppercase tracking-widest text-ink/60 font-bold">
                <th className="px-6 py-4">Application</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Received</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/[0.08]">
              {apps.map((app) => {
                const { primary, secondary } = formatDate(app.createdAt);
                return (
                  <tr key={app.id} className="hover:bg-ink/5 transition-colors group">
                    <td className="px-6 py-4">
                      <code className="text-[10px] text-primary font-bold tracking-wider block">{app.applicationId}</code>
                      <div className="font-bold text-ink mt-0.5">{app.contactName}</div>
                      <div className="text-xs text-ink/60 flex items-center gap-1.5 mt-0.5"><Phone className="w-3 h-3" />+91 {app.contactPhone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-ink">{app.brandName} {app.modelName}</div>
                      <div className="text-xs text-ink/60 mt-0.5">{app.category} · {app.year}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-primary text-sm">₹{app.expectedPriceRs.toLocaleString('en-IN')}</span>
                    </td>
                    <td className="px-6 py-4"><StatusToggle app={app} /></td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-ink/70">{primary}</div>
                      <div className="text-[11px] text-ink/50 mt-0.5">{secondary}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 justify-end">
                        <button onClick={() => setDetailApp(app)} className="text-xs font-bold text-primary hover:underline">Details</button>
                        <button onClick={() => setDeleteTarget(app)} title="Delete" className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400/50 hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>

      <Pagination page={page} pageCount={pageCount} total={total} />

      {detailApp && (
        <DetailModal
          app={detailApp}
          onClose={() => setDetailApp(null)}
          onDeleteRequest={() => { setDeleteTarget(detailApp); setDetailApp(null); }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          app={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onDeleted={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
