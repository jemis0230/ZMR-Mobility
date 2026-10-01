"use client";

import { useState, type ReactNode } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { SORT_OPTIONS } from "@/lib/explore";

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get("sort") ?? "newest";

  return (
    <label className="flex items-center gap-2 text-sm text-ink/60">
      <span className="hidden sm:inline">Sort by</span>
      <select
        value={current}
        onChange={(e) => {
          const params = new URLSearchParams(sp.toString());
          if (e.target.value === "newest") params.delete("sort");
          else params.set("sort", e.target.value);
          params.delete("page");
          const qs = params.toString();
          router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }}
        className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-primary cursor-pointer"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

/** Sidebar is always visible on desktop; on mobile it opens as a bottom sheet. */
export function FilterPanel({ children, activeCount }: { children: ReactNode; activeCount: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="lg:hidden w-full flex items-center justify-center gap-2 rounded-xl border border-ink/15 bg-white py-3 text-sm font-bold text-ink"
      >
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        Filters{activeCount > 0 && <span className="rounded-full bg-primary text-white text-[11px] px-2 py-0.5">{activeCount}</span>}
      </button>

      {open && <div className="fixed inset-0 z-[60] bg-ink/40 lg:hidden" onClick={() => setOpen(false)} />}

      <div
        onClickCapture={(e) => {
          // close the sheet after picking an option on mobile
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
        className={`${open ? "fixed inset-x-0 bottom-0 z-[70] max-h-[85vh] overflow-y-auto rounded-t-3xl p-4 bg-white shadow-2xl" : "hidden"} lg:block lg:static lg:max-h-none lg:overflow-visible lg:p-0 lg:bg-transparent lg:shadow-none lg:rounded-none`}
      >
        {open && (
          <div className="lg:hidden flex items-center justify-between mb-3">
            <p className="font-bold text-ink">Filters</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="p-2 rounded-lg bg-secondary">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </>
  );
}
