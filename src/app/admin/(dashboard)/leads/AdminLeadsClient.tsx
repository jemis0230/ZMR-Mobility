'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Phone,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Car,
  MessageSquare,
  Mail,
  User,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { api } from '@/lib/api-client';
import type { LeadItem } from '@/app/actions/leadActions';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    dot: 'bg-primary animate-pulse',
    badge: 'bg-primary/10 text-primary',
    next: 'CONTACTED' as const,
    nextLabel: 'Mark as Contacted',
  },
  CONTACTED: {
    label: 'Contacted',
    dot: 'bg-yellow-500',
    badge: 'bg-yellow-500/10 text-yellow-400',
    next: 'QUALIFIED' as const,
    nextLabel: 'Mark as Qualified',
  },
  QUALIFIED: {
    label: 'Qualified',
    dot: 'bg-sage',
    badge: 'bg-tint text-leaf',
    next: 'CLOSED_WON' as const,
    nextLabel: 'Mark as Won',
  },
  CLOSED_WON: {
    label: 'Won',
    dot: 'bg-green-500',
    badge: 'bg-green-500/10 text-green-400',
    next: 'PENDING' as const,
    nextLabel: 'Re-open',
  },
  CLOSED_LOST: {
    label: 'Lost',
    dot: 'bg-red-500',
    badge: 'bg-red-500/10 text-red-400',
    next: 'PENDING' as const,
    nextLabel: 'Re-open',
  },
} as const;

const INQUIRY_TYPE_COLOR: Record<string, string> = {
  VEHICLE_LEASING:      'bg-purple-500/10 text-purple-400',
  VEHICLE_RENTING:      'bg-teal-500/10 text-teal-400',
  VEHICLE_PURCHASE:     'bg-green-500/10 text-green-400',
  CORPORATE_ENTERPRISE: 'bg-tint text-leaf',
  FLEET_LOGISTICS:      'bg-tint text-leaf',
  DEALERSHIP_FRANCHISE: 'bg-orange-500/10 text-orange-400',
  B2B_PARTNERSHIP:      'bg-pink-500/10 text-pink-400',
  OTHER:                'bg-ink/10 text-ink/65',
};

const INQUIRY_TYPE_LABEL: Record<string, string> = {
  VEHICLE_LEASING:      'Vehicle Leasing',
  VEHICLE_RENTING:      'Vehicle Renting',
  VEHICLE_PURCHASE:     'Vehicle Purchase',
  CORPORATE_ENTERPRISE: 'Corporate / Enterprise',
  FLEET_LOGISTICS:      'Fleet / Logistics',
  DEALERSHIP_FRANCHISE: 'Dealership / Franchise',
  B2B_PARTNERSHIP:      'B2B Partnership',
  OTHER:                'Other',
};

// Show full date + time; relative suffix for today/yesterday
function formatDate(iso: string): { primary: string; secondary: string } {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  const dateFull = d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  let secondary = '';
  if (diffMins < 2) secondary = 'Just now';
  else if (diffMins < 60) secondary = `${diffMins} min ago`;
  else if (diffHours < 24) secondary = `${diffHours}h ago`;
  else if (diffDays === 1) secondary = 'Yesterday';
  else secondary = `${diffDays} days ago`;

  return { primary: `${dateFull}, ${time}`, secondary };
}

// ─────────────────────────────────────────────────────────────
// Status Toggle
// ─────────────────────────────────────────────────────────────

function StatusToggle({ lead }: { lead: LeadItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const config = STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;

  return (
    <div className="flex items-center gap-2">
      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${config.badge}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {config.label}
      </span>
      <button
        onClick={() =>
          startTransition(async () => {
            await api.patch(`/leads/${lead.id}`, { status: config.next });
            router.refresh();
          })
        }
        disabled={isPending}
        title={config.nextLabel}
        className="opacity-0 group-hover:opacity-100 text-ink/50 hover:text-ink/75 transition-all border border-ink/10 rounded p-0.5 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <span className="text-[10px] px-0.5">…</span>
        ) : (
          <ChevronDown className="w-3 h-3" />
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Delete Confirm Modal
// ─────────────────────────────────────────────────────────────

function DeleteConfirmModal({
  lead,
  onCancel,
  onDeleted,
}: {
  lead: LeadItem;
  onCancel: () => void;
  onDeleted: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await api.del(`/leads/${lead.id}`);
      router.refresh();
      onDeleted();
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 space-y-5"
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #fff5f5 100%)',
          border: '1px solid rgba(239,68,68,0.25)',
          boxShadow: '0 25px 60px rgba(45,71,62,0.18)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-bold text-ink">Delete Lead</h3>
            <p className="text-xs text-ink/60">This cannot be undone.</p>
          </div>
        </div>

        <p className="text-sm text-ink/70">
          Are you sure you want to delete the lead from{' '}
          <span className="font-bold text-ink">{lead.name}</span>?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-ink/10 text-ink/65 hover:text-ink hover:border-ink/25 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
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

function LeadDetailModal({
  lead,
  onClose,
  onDeleteRequest,
}: {
  lead: LeadItem;
  onClose: () => void;
  onDeleteRequest: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentStatus, setCurrentStatus] = useState(lead.status);
  const config = STATUS_CONFIG[currentStatus as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
  const { primary: dateStr } = formatDate(lead.createdAt);

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      await api.patch(`/leads/${lead.id}`, { status: newStatus });
      setCurrentStatus(newStatus);
      router.refresh();
    });
  };

  const location =
    lead.city && lead.state
      ? `${lead.city}, ${lead.state}`
      : lead.state || lead.city || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f9ff 100%)',
          border: '1px solid rgba(45,71,62,0.08)',
          boxShadow: '0 25px 60px rgba(45,71,62,0.18)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-ink/[0.08]">
          <div>
            <h2 className="text-lg font-bold text-ink">{lead.name}</h2>
            <span
              className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${config.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onClose(); onDeleteRequest(); }}
              title="Delete lead"
              className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-ink/5 border border-ink/10 flex items-center justify-center hover:bg-ink/10 transition-all"
            >
              <X className="w-4 h-4 text-ink/70" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Contact grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-ink/5 rounded-xl p-4 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-ink/50 font-bold">Phone</p>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <Phone className="w-3.5 h-3.5 text-primary" />
                +91 {lead.phone}
              </p>
            </div>

            {lead.email ? (
              <div className="bg-ink/5 rounded-xl p-4 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-ink/50 font-bold">Email</p>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink truncate">
                  <Mail className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  {lead.email}
                </p>
              </div>
            ) : location ? (
              <div className="bg-ink/5 rounded-xl p-4 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-ink/50 font-bold">Location</p>
                <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  {location}
                </p>
              </div>
            ) : null}
          </div>

          {/* Show location separately if email already shown */}
          {lead.email && location && (
            <div className="bg-ink/5 rounded-xl p-4 space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-ink/50 font-bold">Location</p>
              <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                {location}
              </p>
            </div>
          )}

          {/* Inquiry details */}
          <div className="bg-ink/5 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-ink/50 font-bold mb-1">
                Inquiry Type
              </p>
              <span
                className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${INQUIRY_TYPE_COLOR[lead.inquiryType] ?? 'bg-ink/10 text-ink/65'}`}
              >
                {INQUIRY_TYPE_LABEL[lead.inquiryType] ?? lead.inquiryType}
              </span>
            </div>

            {lead.vehicleName && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-ink/50 font-bold mb-1">
                  Vehicle Interest
                </p>
                <p className="flex items-center gap-1.5 text-sm text-ink">
                  <Car className="w-3.5 h-3.5 text-primary" />
                  {lead.vehicleName}
                </p>
              </div>
            )}

            {lead.notes && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-ink/50 font-bold mb-1">
                  Message
                </p>
                <p className="flex items-start gap-1.5 text-sm text-ink/75">
                  <MessageSquare className="w-3.5 h-3.5 text-ink/50 mt-0.5 flex-shrink-0" />
                  {lead.notes}
                </p>
              </div>
            )}
          </div>

          <p className="text-[11px] text-ink/45 text-center">Received {dateStr}</p>
        </div>

        {/* Status buttons */}
        <div className="px-6 pb-6 flex gap-2">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              disabled={currentStatus === key || isPending}
              onClick={() => handleStatusChange(key)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                currentStatus === key
                  ? `${cfg.badge} border-transparent`
                  : 'border-ink/10 text-ink/60 hover:text-ink hover:border-ink/25 disabled:cursor-not-allowed'
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Search Bar
// ─────────────────────────────────────────────────────────────

function SearchBar({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(window.location.search);
    params.delete('page');
    if (val) params.set('q', val);
    else params.delete('q');
    router.replace(`/admin/leads?${params.toString()}`);
  };

  return (
    <input
      defaultValue={defaultValue}
      onChange={handleChange}
      placeholder="Search by name, phone, city…"
      className="bg-ink/5 border border-ink/10 rounded-lg px-4 py-2 text-sm focus:border-primary outline-none w-full sm:w-64"
    />
  );
}

// ─────────────────────────────────────────────────────────────
// Status Filter
// ─────────────────────────────────────────────────────────────

function StatusFilter({ current }: { current: string }) {
  const router = useRouter();

  const handle = (val: string) => {
    const params = new URLSearchParams(window.location.search);
    params.delete('page');
    if (val === 'ALL') params.delete('status');
    else params.set('status', val);
    router.replace(`/admin/leads?${params.toString()}`);
  };

  return (
    <div className="flex gap-1">
      {(['ALL', 'PENDING', 'CONTACTED', 'CLOSED'] as const).map((val) => (
        <button
          key={val}
          onClick={() => handle(val)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            current === val
              ? 'bg-primary/10 text-primary border border-primary/30'
              : 'text-ink/60 hover:text-ink/75 border border-ink/[0.08] hover:border-ink/15'
          }`}
        >
          {val === 'ALL' ? 'All' : val.charAt(0) + val.slice(1).toLowerCase()}
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────────────────────

function Pagination({
  page,
  pageCount,
  total,
}: {
  page: number;
  pageCount: number;
  total: number;
}) {
  const router = useRouter();

  if (pageCount <= 1) return null;

  const go = (p: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', String(p));
    router.replace(`/admin/leads?${params.toString()}`);
  };

  // Build visible page numbers: always show first, last, current ± 1
  const raw = [1, pageCount, page, page - 1, page + 1].filter((p) => p >= 1 && p <= pageCount);
  const sorted = raw.filter((p, i) => raw.indexOf(p) === i).sort((a, b) => a - b);

  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-xs text-ink/50">{total} leads total</p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => go(page - 1)}
          disabled={page === 1}
          className="p-1.5 rounded-lg border border-ink/10 text-ink/60 hover:text-ink hover:border-ink/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {sorted.map((p, i) => {
          const prev = sorted[i - 1];
          const showEllipsis = prev && p - prev > 1;
          return (
            <div key={p} className="flex items-center gap-1">
              {showEllipsis && (
                <span className="text-xs text-ink/40 px-1">…</span>
              )}
              <button
                onClick={() => go(p)}
                className={`min-w-[32px] h-8 rounded-lg text-xs font-bold transition-all border ${
                  p === page
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'border-ink/10 text-ink/60 hover:text-ink hover:border-ink/25'
                }`}
              >
                {p}
              </button>
            </div>
          );
        })}

        <button
          onClick={() => go(page + 1)}
          disabled={page === pageCount}
          className="p-1.5 rounded-lg border border-ink/10 text-ink/60 hover:text-ink hover:border-ink/25 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────

interface AdminLeadsClientProps {
  leads: LeadItem[];
  search: string;
  statusFilter: string;
  page: number;
  pageCount: number;
  total: number;
  dbError: boolean;
}

export default function AdminLeadsClient({
  leads,
  search,
  statusFilter,
  page,
  pageCount,
  total,
  dbError,
}: AdminLeadsClientProps) {
  const [detailLead, setDetailLead] = useState<LeadItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeadItem | null>(null);

  if (dbError) {
    return (
      <div className="glass-card p-8 text-center border-red-500/20">
        <p className="text-red-400 font-bold">Failed to load leads from database.</p>
        <p className="text-ink/60 text-sm mt-2">Check the server logs for details.</p>
      </div>
    );
  }

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <StatusFilter current={statusFilter} />
        <SearchBar defaultValue={search} />
      </div>

      {/* Mobile: card list */}
      {leads.length === 0 ? (
        <div className="glass-card py-20 text-center border-ink/[0.08]">
          <User className="w-10 h-10 text-ink/25 mx-auto mb-3" />
          <p className="text-ink/50 text-sm">
            {search || statusFilter !== 'ALL'
              ? 'No leads match your filters.'
              : 'No leads yet. Submit an inquiry from the website to see it here.'}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {leads.map((lead) => {
              const { secondary } = formatDate(lead.createdAt);
              const config = STATUS_CONFIG[lead.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.PENDING;
              const location = lead.city && lead.state
                ? `${lead.city}, ${lead.state}`
                : lead.state || lead.city || null;
              return (
                <div key={lead.id} className="glass-card p-4 border-ink/[0.08] space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-ink truncate">{lead.name}</p>
                      <p className="text-xs text-ink/60 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 shrink-0" /> +91 {lead.phone}
                      </p>
                    </div>
                    <span className={`shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${config.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                      {config.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${INQUIRY_TYPE_COLOR[lead.inquiryType] ?? 'bg-ink/10 text-ink/65'}`}>
                      {INQUIRY_TYPE_LABEL[lead.inquiryType] ?? lead.inquiryType}
                    </span>
                    {location && (
                      <span className="text-ink/60 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{location}
                      </span>
                    )}
                    <span className="text-ink/50 ml-auto">{secondary}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setDetailLead(lead)}
                      className="flex-1 py-2 text-xs font-bold rounded-lg bg-ink/5 border border-ink/10 hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => setDeleteTarget(lead)}
                      className="p-2 rounded-lg bg-ink/5 border border-ink/10 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block glass-card overflow-hidden border-ink/[0.08]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ink/5 text-[11px] uppercase tracking-widest text-ink/60 font-bold">
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Interest</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Received</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/[0.08]">
                  {leads.map((lead) => {
                    const { primary, secondary } = formatDate(lead.createdAt);
                    return (
                      <tr key={lead.id} className="hover:bg-ink/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-ink">{lead.name}</div>
                          <div className="text-xs text-ink/60 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3" /> +91 {lead.phone}
                          </div>
                          {lead.email && (
                            <div className="text-xs text-ink/50 flex items-center gap-1.5 mt-0.5">
                              <Mail className="w-3 h-3" /> {lead.email}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${INQUIRY_TYPE_COLOR[lead.inquiryType] ?? 'bg-ink/10 text-ink/65'}`}>
                            {INQUIRY_TYPE_LABEL[lead.inquiryType] ?? lead.inquiryType}
                          </span>
                          {lead.vehicleName && (
                            <div className="text-xs text-ink/50 flex items-center gap-1 mt-1">
                              <Car className="w-3 h-3" /> {lead.vehicleName}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-ink/65">
                          {lead.city && lead.state
                            ? `${lead.city}, ${lead.state}`
                            : lead.state || lead.city || <span className="text-ink/40">—</span>}
                        </td>
                        <td className="px-6 py-4"><StatusToggle lead={lead} /></td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-ink/70">{primary}</div>
                          <div className="text-[11px] text-ink/50 mt-0.5">{secondary}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 justify-end">
                            <button onClick={() => setDetailLead(lead)} className="text-xs font-bold text-primary hover:underline">Details</button>
                            <button onClick={() => setDeleteTarget(lead)} title="Delete lead" className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400/50 hover:text-red-400">
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
          </div>
        </>
      )}

      {/* Pagination */}
      <Pagination page={page} pageCount={pageCount} total={total} />

      {/* Detail Modal */}
      {detailLead && (
        <LeadDetailModal
          lead={detailLead}
          onClose={() => setDetailLead(null)}
          onDeleteRequest={() => {
            setDeleteTarget(detailLead);
            setDetailLead(null);
          }}
        />
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <DeleteConfirmModal
          lead={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onDeleted={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
