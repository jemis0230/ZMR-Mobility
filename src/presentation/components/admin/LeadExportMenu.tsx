'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, FileSpreadsheet, Loader2 } from 'lucide-react';

type Scope = 'filtered' | 'all';

export type LeadExportCounts = {
  /** Leads matching the current filters, across every page. */
  filtered: number;
  /** Every lead. */
  allLeads: number;
  /** Sell-vehicle applications (added to "All leads" on their own worksheet). */
  sellApplications: number;
};

/**
 * "Export to Excel" on the Leads screen. The server builds the .xlsx from the same
 * filters as the list (all pages), so this only chooses the scope and downloads it.
 */
export default function LeadExportMenu({
  counts,
  filters,
  hasFilters,
  maxRows,
}: {
  counts: LeadExportCounts;
  filters: { q: string; status: string; source: string; notify: string };
  hasFilters: boolean;
  maxRows: number;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<Scope | null>(null);
  const [message, setMessage] = useState<{ kind: 'error' | 'done'; text: string } | null>(null);
  const running = useRef(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onClick = (e: MouseEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false); };
    window.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  async function download(scope: Scope) {
    if (running.current) return; // one export at a time, whatever the click speed
    const count = scope === 'filtered' ? counts.filtered : counts.allLeads + counts.sellApplications;
    if (count === 0) {
      setMessage({ kind: 'error', text: scope === 'filtered' ? 'No leads match the selected filters.' : 'There are no leads to export yet.' });
      setOpen(false);
      return;
    }
    running.current = true;
    setBusy(scope);
    setMessage(null);
    try {
      const params = new URLSearchParams({ scope });
      if (scope === 'filtered') {
        if (filters.q) params.set('q', filters.q);
        if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
        if (filters.source) params.set('source', filters.source);
        if (filters.notify) params.set('notify', filters.notify);
      }
      const res = await fetch(`/api/admin/leads/export?${params}`, { credentials: 'same-origin', cache: 'no-store' });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? 'The Excel file could not be created. Please try again.');
      }
      const blob = await res.blob();
      const name = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') ?? '')?.[1] ?? 'ZMR_Leads.xlsx';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      const rows = res.headers.get('X-Export-Rows');
      setMessage({ kind: 'done', text: `Downloaded ${name}${rows ? ` (${Number(rows).toLocaleString('en-IN')} rows)` : ''}.` });
    } catch (e) {
      setMessage({
        kind: 'error',
        text: e instanceof TypeError ? 'Network problem: the export did not reach the server. Check your connection and try again.' : (e as Error).message,
      });
    } finally {
      running.current = false;
      setBusy(null);
      setOpen(false); // show the result message, which the menu would cover
    }
  }

  const fmt = (n: number) => n.toLocaleString('en-IN');
  const optionCls =
    'w-full text-left rounded-xl border border-ink/10 px-4 py-3 hover:border-primary/40 hover:bg-primary/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div ref={boxRef} className="relative w-full sm:w-auto sm:flex sm:flex-col sm:items-end">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={busy !== null}
        aria-expanded={open}
        aria-haspopup="true"
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-xl bg-primary text-white text-sm font-bold shadow-sm hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-wait"
      >
        {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden /> : <FileSpreadsheet className="w-4 h-4" aria-hidden />}
        {busy ? 'Preparing Excel file…' : 'Export to Excel'}
        {!busy && <ChevronDown className="w-4 h-4" aria-hidden />}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Export to Excel"
          className="absolute right-0 z-40 mt-2 w-full sm:w-[22rem] rounded-2xl border border-ink/10 bg-white p-3 shadow-xl space-y-2"
        >
          <button type="button" role="menuitem" className={optionCls} disabled={busy !== null} onClick={() => download('filtered')}>
            <span className="block text-sm font-bold text-ink">
              {hasFilters ? 'Export filtered leads' : 'Export leads on this screen'}
            </span>
            <span className="block text-xs text-ink/60 mt-0.5">
              {fmt(counts.filtered)} lead{counts.filtered === 1 ? '' : 's'}
              {hasFilters ? ' matching the current search and filters' : ' (no filters applied)'}, all pages
            </span>
          </button>
          <button type="button" role="menuitem" className={optionCls} disabled={busy !== null} onClick={() => download('all')}>
            <span className="block text-sm font-bold text-ink">Export all leads</span>
            <span className="block text-xs text-ink/60 mt-0.5">
              {fmt(counts.allLeads)} lead{counts.allLeads === 1 ? '' : 's'} + {fmt(counts.sellApplications)} sell application
              {counts.sellApplications === 1 ? '' : 's'} (separate worksheet)
            </span>
          </button>
          <p className="px-1 pt-1 text-[11px] leading-snug text-ink/50">
            .xlsx workbook · times in IST (UTC+05:30) · up to {fmt(maxRows)} rows per worksheet. Exporting does not change any lead.
          </p>
        </div>
      )}

      {message && (
        <p
          role={message.kind === 'error' ? 'alert' : 'status'}
          className={`mt-2 sm:max-w-[22rem] text-xs rounded-lg px-3 py-2 ${
            message.kind === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
