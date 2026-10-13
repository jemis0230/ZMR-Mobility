"use client";

import { useState, type ReactNode } from "react";
import { MapPin } from "lucide-react";
import { PRESENCE_STATUS_LABEL, type PresenceLocation } from "@/lib/presence";

export type MapPoint = PresenceLocation & { x: number; y: number };

function Marker({ status, selected }: { status: PresenceLocation["status"]; selected: boolean }) {
  return status === "current" ? (
    <>
      <circle r={selected ? 11 : 8} className="fill-lime/60 transition-all" />
      <circle r={5} className="fill-forest" stroke="#F4EFE9" strokeWidth={1.5} />
    </>
  ) : (
    <>
      <circle r={selected ? 10 : 7} className="fill-white transition-all" stroke="#577440" strokeWidth={2} strokeDasharray="3 2" />
      <circle r={2.5} className="fill-primary" />
    </>
  );
}

export default function PresenceMapInteractive({
  points, viewBox, children,
}: {
  points: MapPoint[];
  viewBox: { width: number; height: number };
  children: ReactNode;
}) {
  const [selected, setSelected] = useState<string | null>(points[0]?.city ?? null);
  const current = points.find((p) => p.city === selected) ?? null;
  const groups = (["current", "planned"] as const).map((status) => ({ status, items: points.filter((p) => p.status === status) }));

  return (
    <div className="mt-8 grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-8 items-start">
      <div className="relative rounded-3xl bg-cream border border-ink/10 p-3 sm:p-6">
        <svg
          viewBox={`0 0 ${viewBox.width} ${viewBox.height}`}
          className="w-full h-auto max-h-[70vh] mx-auto"
          role="img"
          aria-label="Map of India showing ZMR Mobility's current and planned cities"
        >
          {children}
          {/* Planned first so current markers sit on top where they overlap. */}
          {[...points].sort((a, b) => (a.status === b.status ? 0 : a.status === "planned" ? -1 : 1)).map((p) => {
            const isSel = p.city === selected;
            return (
              <g
                key={p.city}
                transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}
                role="button"
                tabIndex={0}
                aria-label={`${p.city}, ${p.state} — ${PRESENCE_STATUS_LABEL[p.status]}`}
                aria-pressed={isSel}
                onClick={() => setSelected(p.city)}
                onFocus={() => setSelected(p.city)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(p.city); } }}
                className="cursor-pointer outline-none [&:focus-visible>circle:first-child]:stroke-forest [&:focus-visible>circle:first-child]:stroke-[3]"
              >
                {/* Larger invisible hit area for touch */}
                <circle r={16} fill="transparent" />
                <Marker status={p.status} selected={isSel} />
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-forest" aria-label="Legend">
          <li className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="-11 -11 22 22" aria-hidden><Marker status="current" selected={false} /></svg>
            {PRESENCE_STATUS_LABEL.current}
          </li>
          <li className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="-11 -11 22 22" aria-hidden><Marker status="planned" selected={false} /></svg>
            {PRESENCE_STATUS_LABEL.planned}
          </li>
        </ul>
      </div>

      <div className="space-y-6">
        {/* Selected city */}
        <div aria-live="polite" className="rounded-2xl bg-forest text-cream p-5 focus-on-dark min-h-[104px]">
          {current ? (
            <>
              <p className="text-[11px] font-bold uppercase tracking-widest text-lime">{PRESENCE_STATUS_LABEL[current.status]}</p>
              <p className="mt-1 text-2xl font-black flex items-center gap-2"><MapPin className="w-5 h-5 text-lime" aria-hidden /> {current.city}</p>
              <p className="text-cream/80 text-sm">{current.state}</p>
            </>
          ) : (
            <p className="text-sm text-cream/80">Select a city on the map or in the list.</p>
          )}
        </div>

        {/* Accessible list of all cities */}
        {groups.map((g) => (
          <div key={g.status}>
            <h3 className="text-sm font-bold uppercase tracking-widest text-ink/70">{PRESENCE_STATUS_LABEL[g.status]}</h3>
            {g.items.length === 0 ? (
              <p className="mt-2 text-sm text-ink/70">To be announced.</p>
            ) : (
              <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {g.items.map((p) => (
                  <li key={p.city}>
                    <button
                      type="button"
                      onClick={() => setSelected(p.city)}
                      aria-pressed={p.city === selected}
                      className={`w-full min-h-[44px] text-left rounded-xl border px-4 py-2.5 transition-colors ${
                        p.city === selected ? "border-forest bg-lime/40" : "border-ink/15 bg-white hover:border-primary"
                      }`}
                    >
                      <span className="block font-bold text-forest">{p.city}</span>
                      <span className="block text-xs text-ink/70">{p.state}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
