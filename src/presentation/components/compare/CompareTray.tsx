"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ArrowLeftRight } from "lucide-react";
import { useCompare, compareHref, COMPARE_MAX, COMPARE_MIN } from "./compareStore";

/** Bottom tray showing the current comparison selection on every public page. */
export default function CompareTray() {
  const { items, notice, count, remove, clear } = useCompare();
  const pathname = usePathname();

  if (pathname?.startsWith("/compare")) return null;

  return (
    <>
      {/* Screen-reader announcements for add/limit/duplicate messages */}
      <p className="sr-only" aria-live="polite">{notice ?? ""}</p>

      {(count > 0 || notice) && (
        <div className="fixed bottom-24 lg:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-3xl focus-on-dark">
          {notice && (
            <div aria-hidden className="mb-2 rounded-xl bg-forest text-cream text-sm font-semibold px-4 py-2.5 shadow-lg">
              {notice}
            </div>
          )}
          {count > 0 && (
            <div className="rounded-2xl bg-forest text-cream shadow-2xl shadow-forest/40 p-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <ArrowLeftRight className="w-5 h-5 text-lime shrink-0" aria-hidden />
                <span className="text-sm font-bold whitespace-nowrap">
                  Compare <span className="text-lime">{count}/{COMPARE_MAX}</span>
                </span>
                <ul className="flex gap-2 overflow-x-auto no-scrollbar min-w-0" aria-label="Selected vehicles">
                  {items.map((i) => (
                    <li key={i.id} className="flex items-center gap-1.5 rounded-full bg-white/10 pl-3 pr-1 py-1 text-xs font-semibold whitespace-nowrap">
                      {i.title}
                      <button
                        type="button"
                        onClick={() => remove(i.id)}
                        aria-label={`Remove ${i.title} from comparison`}
                        className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center"
                      >
                        <X className="w-3.5 h-3.5" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button type="button" onClick={clear} className="px-3 py-2 rounded-lg text-xs font-bold text-cream/80 hover:text-white">
                  Clear
                </button>
                {count >= COMPARE_MIN ? (
                  <Link
                    href={compareHref(items.map((i) => i.id))}
                    className="rounded-xl bg-lime text-forest px-5 py-2.5 text-sm font-extrabold hover:bg-white transition-colors"
                  >
                    Compare now
                  </Link>
                ) : (
                  <span className="text-xs text-cream/80">Add {COMPARE_MIN - count} more to compare</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
