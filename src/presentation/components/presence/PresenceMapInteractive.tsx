"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { PRESENCE_STATUS_LABEL, type PresenceLocation } from "@/lib/presence";
import { PRESENCE_LANDMARKS, type Landmark } from "@/lib/presenceLandmarks";

export type MapPoint = PresenceLocation & { x: number; y: number };

/**
 * The city's landmark photo, faded in behind the card content. `visible` is driven by
 * hover/focus/selection; the overlay keeps the text readable on any photo.
 */
function LandmarkLayer({ landmark, visible, overlay, sizes }: { landmark?: Landmark; visible: boolean; overlay: string; sizes: string }) {
  if (!landmark) return null;
  return (
    <span aria-hidden className={`pointer-events-none absolute inset-0 transition-opacity duration-300 motion-reduce:transition-none ${visible ? "opacity-100" : "opacity-0"}`}>
      <Image src={landmark.src} alt="" fill sizes={sizes} className="object-cover" />
      <span className={`absolute inset-0 ${overlay}`} />
    </span>
  );
}

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
  // City previewed by pointer hover or keyboard focus in the list (highlights its marker).
  const [hovered, setHovered] = useState<string | null>(null);
  const current = points.find((p) => p.city === selected) ?? null;
  const credits = points.map((p) => landmarkOf(p.city)).filter((l): l is Landmark => !!l);
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
            const isSel = p.city === selected || p.city === hovered;
            return (
              <g
                key={p.city}
                transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}
                role="button"
                tabIndex={0}
                aria-label={`${p.city}, ${p.state} — ${PRESENCE_STATUS_LABEL[p.status]}`}
                aria-pressed={p.city === selected}
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
        <div aria-live="polite" className="relative overflow-hidden rounded-2xl bg-forest text-cream p-5 focus-on-dark min-h-[104px]">
          {current ? (
            <>
              {/* Landmark of the selected city, under a dark overlay so the text stays readable. */}
              <LandmarkLayer key={current.city} landmark={landmarkOf(current.city)} visible overlay="bg-forest/75" sizes="(min-width: 1024px) 520px, 100vw" />
              <div className="relative">
                <p className="text-[11px] font-bold uppercase tracking-widest text-lime">{PRESENCE_STATUS_LABEL[current.status]}</p>
                <p className="mt-1 text-2xl font-black flex items-center gap-2"><MapPin className="w-5 h-5 text-lime" aria-hidden /> {current.city}</p>
                <p className="text-cream/85 text-sm">{current.state}</p>
                {landmarkOf(current.city) && <p className="mt-1 text-xs text-cream/80">{landmarkOf(current.city)!.name}</p>}
              </div>
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
                {g.items.map((p) => {
                  const isSel = p.city === selected;
                  const landmark = landmarkOf(p.city);
                  return (
                    <li key={p.city}>
                      {/* Tap/click/Enter selects the city (and keeps its landmark shown); hover
                          and keyboard focus preview it and highlight its marker on the map. */}
                      <button
                        type="button"
                        onClick={() => setSelected(p.city)}
                        onMouseEnter={() => setHovered(p.city)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(p.city)}
                        onBlur={() => setHovered(null)}
                        aria-pressed={isSel}
                        aria-label={`${p.city}, ${p.state} — ${PRESENCE_STATUS_LABEL[p.status]}${landmark ? ` (${landmark.name})` : ""}`}
                        className={`group relative overflow-hidden w-full min-h-[64px] text-left rounded-xl border px-4 py-2.5 transition-[border-color,background-color,box-shadow] duration-200 motion-reduce:transition-none ${
                          p.status === "planned" ? "border-dashed" : ""
                        } ${
                          isSel
                            ? "border-forest bg-lime/40 shadow-[inset_4px_0_0_#2D473E]"
                            : "border-ink/15 bg-white hover:border-primary hover:bg-tint focus-visible:bg-tint"
                        }`}
                      >
                        <LandmarkLayer landmark={landmark} visible={isSel || hovered === p.city} overlay="bg-white/80" sizes="(min-width: 640px) 260px, 100vw" />
                        <span className="relative flex items-start justify-between gap-2">
                          <span>
                            <span className="block font-bold text-forest">{p.city}</span>
                            <span className="block text-xs text-ink/75">{p.state}</span>
                          </span>
                          <MapPin
                            aria-hidden
                            className={`w-4 h-4 mt-0.5 shrink-0 transition-opacity duration-200 motion-reduce:transition-none ${
                              isSel ? "text-forest opacity-100" : "text-primary opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                            }`}
                          />
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ))}

        {credits.length > 0 && (
          <p className="text-[11px] text-ink/60">
            Landmark photos:{" "}
            {credits.map((l, i) => (
              <span key={l.src}>
                {i > 0 && " · "}
                <a href={l.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">{l.name}</a> by {l.credit}, {l.license}
              </span>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}

const landmarkOf = (city: string): Landmark | undefined => PRESENCE_LANDMARKS[city];
