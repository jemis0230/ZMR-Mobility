"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import type { LeadNotificationItem } from "@/app/actions/leadActions";

// Email / WhatsApp delivery status for a lead or sell application, with staff retry.

const NOTIFY_STYLE: Record<string, { label: string; cls: string }> = {
  QUEUED: { label: 'Queued', cls: 'bg-ink/10 text-ink/70' },
  SENDING: { label: 'Sending', cls: 'bg-ink/10 text-ink/70' },
  ACCEPTED: { label: 'Sent', cls: 'bg-green-500/10 text-green-700' },
  DELIVERED: { label: 'Delivered', cls: 'bg-green-500/15 text-green-800' },
  READ: { label: 'Read', cls: 'bg-green-500/15 text-green-800' },
  FAILED: { label: 'Failed', cls: 'bg-red-500/10 text-red-700' },
  NOT_CONFIGURED: { label: 'Not set up', cls: 'bg-amber-500/15 text-amber-800' },
};

/** Compact Email / WhatsApp delivery badges for a lead. */
export function NotificationBadges({ items }: { items: LeadNotificationItem[] }) {
  if (!items.length) return <span className="text-[11px] text-ink/40">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((n) => {
        const st = NOTIFY_STYLE[n.status] ?? NOTIFY_STYLE.QUEUED;
        return (
          <span key={n.id} title={n.lastError ?? undefined} className={`px-2 py-0.5 rounded text-[11px] font-bold ${st.cls}`}>
            {n.channel === 'EMAIL' ? 'Email' : 'WhatsApp'}: {st.label}
          </span>
        );
      })}
    </div>
  );
}

/** Notification details with a staff retry for failed / not-configured channels. */
export function NotificationPanel({ items }: { items: LeadNotificationItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const retry = async (id: string) => {
    setBusy(id);
    setMessage(null);
    const res = await api.post<{ status: string; lastError: string | null }>(`/admin/notifications/${id}/retry`, {});
    setBusy(null);
    if (!res.success) setMessage({ ok: false, text: res.error });
    else setMessage({ ok: res.data.status === 'ACCEPTED' || res.data.status === 'DELIVERED', text: res.data.status === 'ACCEPTED' ? 'Sent.' : `Still not sent: ${res.data.lastError ?? res.data.status}` });
    router.refresh();
  };
  if (!items.length) return <p className="text-xs text-ink/60">No staff notifications were queued for this lead (it was received before notifications were added).</p>;
  return (
    <div className="space-y-2">
      {items.map((n) => {
        const st = NOTIFY_STYLE[n.status] ?? NOTIFY_STYLE.QUEUED;
        const canRetry = n.status === 'FAILED' || n.status === 'NOT_CONFIGURED' || n.status === 'QUEUED';
        return (
          <div key={n.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-ink/5 px-3 py-2">
            <span className="text-sm font-bold text-ink">{n.channel === 'EMAIL' ? 'Email' : 'WhatsApp'}</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${st.cls}`}>{st.label}</span>
            {n.attempts > 0 && <span className="text-[11px] text-ink/60">{n.attempts} attempt{n.attempts === 1 ? '' : 's'}</span>}
            {canRetry && (
              <button
                type="button"
                onClick={() => retry(n.id)}
                disabled={busy === n.id}
                className="ml-auto min-h-[36px] px-3 rounded-lg bg-primary text-white text-xs font-bold disabled:opacity-60"
              >
                {busy === n.id ? 'Sending…' : n.status === 'QUEUED' ? 'Send now' : 'Retry'}
              </button>
            )}
            {n.lastError && <p className="basis-full text-[11px] text-red-700 break-words">{n.lastError}</p>}
          </div>
        );
      })}
      {message && <p role="status" className={`text-xs font-semibold ${message.ok ? 'text-green-700' : 'text-red-700'}`}>{message.text}</p>}
    </div>
  );
}

