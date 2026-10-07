"use client";

import { useState, type ReactNode } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { SORT_OPTIONS, formatINR } from "@/lib/explore";
import DualRangeSlider from "@/presentation/components/DualRangeSlider";

export function SortSelect() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const current = sp.get("sort") ?? "newest";

  return (
    <label className="flex items-center gap-2 text-sm text-ink/75">
      <span className="hidden sm:inline">Sort by</span>
      <select
        value={current}
        aria-label="Sort vehicles"
        onChange={(e) => {
          const params = new URLSearchParams(sp.toString());
          if (e.target.value === "newest") params.delete("sort");
          else params.set("sort", e.target.value);
          params.delete("page");
          const qs = params.toString();
          router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        }}
        className="rounded-xl border border-ink/20 bg-white px-3 py-2 text-sm font-semibold text-forest outline-none focus:border-primary cursor-pointer"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

/** Custom price range from real inventory bounds (never above the ₹3,00,000 cap). */
export function PriceRangeFilter({
  bounds, currentMin, currentMax,
}: { bounds: { min: number; max: number }; currentMin?: number; currentMax?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const clampToBounds = (v: number) => Math.min(bounds.max, Math.max(bounds.min, v));
  const [range, setRange] = useState<[number, number]>([
    clampToBounds(currentMin ?? bounds.min),
    clampToBounds(currentMax ?? bounds.max),
  ]);

  const apply = () => {
    const params = new URLSearchParams(sp.toString());
    const [lo, hi] = range;
    if (lo <= bounds.min) params.delete("minPrice"); else params.set("minPrice", String(lo));
    params.set("maxPrice", String(hi));
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="rounded-xl bg-tint p-3">
      <p className="text-xs font-bold text-forest mb-2">Custom range</p>
      <DualRangeSlider
        min={bounds.min}
        max={bounds.max}
        step={5000}
        initialMin={range[0]}
        initialMax={range[1]}
        onChangeComplete={(lo, hi) => setRange([lo, hi])}
        formatLabel={formatINR}
        labels={["Minimum price", "Maximum price"]}
      />
      <button
        type="button"
        onClick={apply}
        className="mt-3 w-full rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-bold py-2 transition-colors"
      >
        Apply {formatINR(range[0])} – {formatINR(range[1])}
      </button>
    </div>
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
        aria-expanded={open}
        className="lg:hidden w-full flex items-center justify-center gap-2 rounded-xl border border-ink/20 bg-white py-3 text-sm font-bold text-forest"
      >
        <SlidersHorizontal className="w-4 h-4 text-primary" aria-hidden />
        Filters{activeCount > 0 && <span className="rounded-full bg-primary text-white text-[11px] px-2 py-0.5">{activeCount}</span>}
      </button>

      {open && <div className="fixed inset-0 z-[60] bg-forest/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}

      <div
        role={open ? "dialog" : undefined}
        aria-modal={open ? true : undefined}
        aria-label={open ? "Filters" : undefined}
        onClickCapture={(e) => {
          // close the sheet after picking an option on mobile
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
        className={`${open ? "fixed inset-x-0 bottom-0 z-[70] max-h-[85vh] overflow-y-auto rounded-t-3xl p-4 bg-cream shadow-2xl" : "hidden"} lg:block lg:static lg:max-h-none lg:overflow-visible lg:p-0 lg:bg-transparent lg:shadow-none lg:rounded-none`}
      >
        {open && (
          <div className="lg:hidden flex items-center justify-between mb-3">
            <p className="font-bold text-forest">Filters</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="p-2 rounded-lg bg-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {children}
      </div>
    </>
  );
}
