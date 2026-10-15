"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

/** Native modal dialog: focus trap, Escape and inert background come from the browser. */
export default function ConfirmDialog({
  open, title, children, confirmLabel, busy, danger, onConfirm, onCancel, confirmDisabled,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  busy?: boolean;
  danger?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const uid = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${uid}-t`}
      onCancel={(e) => { e.preventDefault(); if (!busy) onCancel(); }}
      className="w-[min(520px,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] rounded-2xl bg-cream p-0 text-forest shadow-2xl backdrop:bg-forest/50"
    >
      <div className="p-6 space-y-4">
        <h2 id={`${uid}-t`} className="text-xl font-black">{title}</h2>
        <div className="text-sm text-ink/80 space-y-3">{children}</div>
        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} disabled={busy} className="min-h-[44px] px-5 rounded-lg border border-ink/20 bg-white text-sm font-bold text-ink/80">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy || confirmDisabled}
            className={`min-h-[44px] px-5 rounded-lg text-sm font-bold text-white disabled:opacity-60 ${danger ? "bg-red-700 hover:bg-red-800" : "bg-primary hover:bg-primary-dark"}`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
