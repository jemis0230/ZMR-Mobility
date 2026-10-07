"use client";

import { Check, Plus } from "lucide-react";
import { useCompare, COMPARE_MAX, type CompareItem } from "./compareStore";

/** "Add to Compare" toggle used on inventory cards and vehicle detail pages. */
export default function CompareButton({ item, variant = "chip" }: { item: CompareItem; variant?: "chip" | "block" }) {
  const { has, add, remove, isFull } = useCompare();
  const selected = has(item.id);
  const disabled = !selected && isFull;

  const base =
    variant === "block"
      ? "w-full justify-center py-3 rounded-xl text-sm"
      : "px-3 py-1.5 rounded-full text-xs";

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={disabled}
      title={disabled ? `You can compare up to ${COMPARE_MAX} vehicles` : undefined}
      onClick={() => (selected ? remove(item.id) : add(item))}
      className={`inline-flex items-center gap-1.5 font-bold border transition-colors ${base} ${
        selected
          ? "bg-lime border-lime text-forest hover:bg-lime/80"
          : disabled
          ? "bg-white border-ink/15 text-ink/45 cursor-not-allowed"
          : "bg-white border-primary/40 text-primary-dark hover:bg-tint"
      }`}
    >
      {selected ? <Check className="w-3.5 h-3.5" aria-hidden /> : <Plus className="w-3.5 h-3.5" aria-hidden />}
      {selected ? "Added to compare" : disabled ? "Compare full (3/3)" : "Add to compare"}
    </button>
  );
}
