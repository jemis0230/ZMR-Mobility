"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Plus, AlertTriangle, ArrowLeftRight, Search } from "lucide-react";
import type { Vehicle } from "@/domain/entities/Vehicle";
import { CATEGORY_DISPLAY, type VehicleCategory } from "@/lib/constants";
import { slugifyVehicle } from "@/lib/vehicleSlug";
import { formatMinutes } from "@/lib/formatTime";
import { formatINR } from "@/lib/explore";
import { COMPARE_MAX, COMPARE_MIN, compareHref } from "@/lib/compare";
import { compareActions, useCompare } from "@/presentation/components/compare/compareStore";
import EVImage from "@/presentation/components/EVImage";

export interface CatalogItem {
  id: string;
  title: string;
  name: string;
  category: VehicleCategory;
  categoryLabel: string;
  image: string;
}

const NP = <span className="text-ink/60 italic">Not provided</span>;

function detailHref(v: Vehicle): string {
  const slug = slugifyVehicle(v.make, v.model, v.id);
  if (v.showInBuying) return `/buying/vehicles/detail/${slug}`;
  if (v.showInLeasing) return `/vehicles/${slug}`;
  return `/rent/vehicles/detail/${slug}`;
}

const lowestLease = (v: Vehicle) =>
  v.leasePlans.filter((p) => p.isActive).sort((a, b) => a.monthlyPriceRs - b.monthlyPriceRs)[0]?.monthlyPriceRs;

const ROWS: { label: string; render: (v: Vehicle) => ReactNode }[] = [
  {
    label: "Price",
    render: (v) =>
      v.buyingPrice ? (
        <span className="font-black text-forest">{formatINR(v.buyingPrice)}</span>
      ) : v.showInBuying ? "Price on request" : NP,
  },
  { label: "Lease from", render: (v) => (lowestLease(v) ? `${formatINR(lowestLease(v)!)}/month` : NP) },
  { label: "Year", render: (v) => v.manufactureYear ?? NP },
  { label: "KM driven", render: (v) => (v.kmDriven != null ? `${v.kmDriven.toLocaleString("en-IN")} km` : NP) },
  { label: "Body type", render: (v) => CATEGORY_DISPLAY[v.category] },
  { label: "Battery capacity", render: (v) => (v.batteryCapKwh ? `${v.batteryCapKwh} kWh` : NP) },
  {
    label: "Range per charge",
    render: (v) =>
      v.certifiedRangeKm ? (
        <>
          {v.certifiedRangeKm} km <span className="text-ink/65 text-xs">(certified)</span>
          {v.realWorldRangeKm ? <span className="block text-xs text-ink/75">{v.realWorldRangeKm} km real-world</span> : null}
        </>
      ) : NP,
  },
  { label: "Charging time", render: (v) => (v.chargingTimeMinutes > 0 ? formatMinutes(v.chargingTimeMinutes) : NP) },
  { label: "Top speed", render: (v) => (v.topSpeedKmh ? `${v.topSpeedKmh} km/h` : NP) },
  { label: "Vehicle condition", render: () => NP },
  { label: "Warranty", render: (v) => (v.warranty?.trim() ? v.warranty : NP) },
  {
    label: "Availability",
    render: (v) => {
      const modes = [v.showInBuying && "Buy", v.showInLeasing && "Lease", v.showInRent && "Rent"].filter(Boolean) as string[];
      return modes.length ? (
        <span className="flex flex-wrap gap-1">
          {modes.map((m) => <span key={m} className="rounded-full bg-lime/50 px-2 py-0.5 text-xs font-bold text-forest">{m}</span>)}
        </span>
      ) : "Not currently listed";
    },
  },
];

export default function ComparePageClient({
  requestedIds, vehicles, unavailableIds, catalog, categoryFilter, dbError,
}: {
  requestedIds: string[];
  vehicles: Vehicle[];
  unavailableIds: string[];
  catalog: CatalogItem[];
  categoryFilter: VehicleCategory | null;
  dbError: boolean;
}) {
  const router = useRouter();
  const { items: stored } = useCompare();
  const [pick, setPick] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<VehicleCategory | "">(categoryFilter ?? "");

  const byId = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const catalogById = useMemo(() => new Map(catalog.map((c) => [c.id, c])), [catalog]);

  // URL is the source of truth here; mirror it into the shared selection (tray / navbar badge).
  useEffect(() => {
    if (requestedIds.length > 0) {
      compareActions.setAll(vehicles.map((v) => ({ id: v.id, title: `${v.make} ${v.model}`, image: v.mainImage })));
    }
  }, [requestedIds, vehicles]);

  // Arriving via the navbar (/compare with no ids): load the saved selection.
  useEffect(() => {
    if (requestedIds.length === 0 && stored.length > 0) {
      router.replace(compareHref(stored.map((s) => s.id)), { scroll: false });
    }
  }, [requestedIds.length, stored, router]);

  const navigate = (ids: string[]) => router.replace(compareHref(ids), { scroll: false });

  const remove = (id: string) => {
    setMessage(null);
    compareActions.remove(id);
    navigate(requestedIds.filter((x) => x !== id));
  };

  const add = (id: string) => {
    if (!id) return;
    if (requestedIds.includes(id)) {
      setMessage("That vehicle is already in your comparison.");
      return;
    }
    if (requestedIds.length >= COMPARE_MAX) {
      setMessage(`You can compare up to ${COMPARE_MAX} vehicles. Remove or replace one first.`);
      return;
    }
    setMessage(null);
    setPick("");
    navigate([...requestedIds, id]);
  };

  const replace = (oldId: string, newId: string) => {
    if (!newId) return;
    if (requestedIds.includes(newId)) {
      setMessage("That vehicle is already in your comparison.");
      return;
    }
    setMessage(null);
    navigate(requestedIds.map((x) => (x === oldId ? newId : x)));
  };

  const options = catalog.filter((c) => !requestedIds.includes(c.id) && (!filter || c.category === filter));
  const full = requestedIds.length >= COMPARE_MAX;
  const categories = Array.from(new Set(catalog.map((c) => c.category)));

  return (
    <main className="min-h-screen bg-cream">
      <div className="pt-24 lg:pt-40 pb-20 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-widest">Side by side</p>
            <h1 className="text-3xl md:text-5xl font-black mt-2 text-forest">Compare EVs</h1>
            <p className="text-ink/80 mt-2 max-w-xl">
              Compare {COMPARE_MIN}–{COMPARE_MAX} vehicles from our current inventory. Details we don&apos;t have yet are shown as &ldquo;Not provided&rdquo;.
            </p>
          </div>
          <p className="text-sm font-bold text-forest" aria-live="polite">
            <ArrowLeftRight className="inline w-4 h-4 mr-1 text-leaf" aria-hidden />
            {requestedIds.length} of {COMPARE_MAX} selected
          </p>
        </div>

        {/* Picker */}
        <div className="rounded-2xl bg-white border border-ink/10 shadow-card p-4 md:p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
            <label className="flex-1">
              <span className="block text-xs font-bold uppercase tracking-wider text-ink/75 mb-1.5">Body type</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as VehicleCategory | "")}
                className="w-full rounded-xl border border-ink/20 bg-white px-3 py-2.5 text-sm text-forest"
              >
                <option value="">All body types</option>
                {categories.map((c) => <option key={c} value={c}>{CATEGORY_DISPLAY[c]}</option>)}
              </select>
            </label>
            <label className="flex-[2]">
              <span className="block text-xs font-bold uppercase tracking-wider text-ink/75 mb-1.5">Add a vehicle</span>
              <select
                value={pick}
                onChange={(e) => setPick(e.target.value)}
                disabled={full || options.length === 0}
                className="w-full rounded-xl border border-ink/20 bg-white px-3 py-2.5 text-sm text-forest disabled:bg-tint disabled:text-ink/60"
              >
                <option value="">{full ? `Maximum of ${COMPARE_MAX} reached — remove one to add another` : options.length ? "Choose a vehicle…" : "No more vehicles available"}</option>
                {options.map((c) => <option key={c.id} value={c.id}>{c.title} · {c.categoryLabel}</option>)}
              </select>
            </label>
            <button
              type="button"
              onClick={() => add(pick)}
              disabled={!pick || full}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" aria-hidden /> Add to compare
            </button>
          </div>
          {message && <p role="alert" className="mt-3 text-sm font-semibold text-amber-900 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2">{message}</p>}
          {dbError && <p role="alert" className="mt-3 text-sm text-red-800">We couldn&apos;t load the inventory right now. Please try again shortly.</p>}
        </div>

        {requestedIds.length === 0 ? (
          <div className="rounded-3xl bg-white border border-dashed border-ink/20 py-16 px-6 text-center">
            <Search className="w-8 h-8 text-leaf mx-auto mb-3" aria-hidden />
            <h2 className="text-xl font-bold text-forest">Start a comparison</h2>
            <p className="text-ink/75 text-sm mt-1 max-w-md mx-auto">
              Pick vehicles above, or use &ldquo;Add to compare&rdquo; on any vehicle card or detail page.
            </p>
            <Link href="/explore" className="inline-block mt-5 rounded-xl bg-primary text-white px-5 py-2.5 text-sm font-bold hover:bg-primary-dark">Browse vehicles</Link>
          </div>
        ) : (
          <>
            {requestedIds.length < COMPARE_MIN && (
              <p className="mb-4 text-sm text-ink/80">Add at least one more vehicle to compare side by side.</p>
            )}
            <div className="relative rounded-2xl bg-white border border-ink/10 shadow-card overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <caption className="sr-only">Comparison of {requestedIds.length} selected vehicles</caption>
                <thead>
                  <tr>
                    <th scope="col" className="sticky left-0 z-10 bg-tint w-36 md:w-48 p-4 text-left align-bottom text-xs font-bold uppercase tracking-wider text-ink/75">
                      Vehicle
                    </th>
                    {requestedIds.map((id) => {
                      const v = byId.get(id);
                      if (!v) {
                        const c = catalogById.get(id);
                        return (
                          <th key={id} scope="col" className="p-4 align-top text-left min-w-[200px] border-l border-ink/10">
                            <div className="rounded-xl bg-amber-50 border border-amber-300 p-4">
                              <p className="flex items-center gap-2 font-bold text-amber-900"><AlertTriangle className="w-4 h-4" aria-hidden /> No longer available</p>
                              <p className="text-xs text-amber-900 mt-1">{c ? c.title : "This vehicle"} has been sold or removed from our listings.</p>
                              <button type="button" onClick={() => remove(id)} className="mt-3 text-xs font-bold text-forest underline">Remove from comparison</button>
                            </div>
                          </th>
                        );
                      }
                      return (
                        <th key={id} scope="col" className="p-4 align-top text-left min-w-[200px] border-l border-ink/10 font-normal">
                          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-tint mb-3">
                            {v.mainImage && <EVImage src={v.mainImage} alt="" className="w-full h-full" imgClassName="object-cover" />}
                          </div>
                          <p className="text-xs font-bold uppercase tracking-wider text-ink/70">{v.make}</p>
                          <p className="text-base font-black text-forest leading-tight">{v.model}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => remove(id)}
                              aria-label={`Remove ${v.make} ${v.model} from comparison`}
                              className="inline-flex items-center gap-1 rounded-full border border-ink/20 px-2.5 py-1 text-xs font-bold text-forest hover:border-red-400 hover:text-red-800"
                            >
                              <X className="w-3 h-3" aria-hidden /> Remove
                            </button>
                            <label className="sr-only" htmlFor={`replace-${id}`}>Replace {v.make} {v.model} with</label>
                            <select
                              id={`replace-${id}`}
                              value=""
                              onChange={(e) => replace(id, e.target.value)}
                              className="rounded-full border border-ink/20 bg-white px-2.5 py-1 text-xs font-bold text-forest max-w-[150px]"
                            >
                              <option value="">Replace with…</option>
                              {catalog.filter((c) => !requestedIds.includes(c.id)).map((c) => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                              ))}
                            </select>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row, ri) => (
                    <tr key={row.label} className={ri % 2 === 0 ? "bg-cream/50" : "bg-white"}>
                      <th scope="row" className={`sticky left-0 z-10 p-4 text-left text-xs font-bold uppercase tracking-wider text-ink/80 ${ri % 2 === 0 ? "bg-tint" : "bg-white"}`}>
                        {row.label}
                      </th>
                      {requestedIds.map((id) => {
                        const v = byId.get(id);
                        return (
                          <td key={id} className="p-4 border-l border-ink/10 text-forest align-top">
                            {v ? row.render(v) : <span className="text-ink/50">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="sticky left-0 z-10 bg-white p-4 text-left text-xs font-bold uppercase tracking-wider text-ink/80">Next steps</th>
                    {requestedIds.map((id) => {
                      const v = byId.get(id);
                      return (
                        <td key={id} className="p-4 border-l border-ink/10 align-top">
                          {v ? (
                            <div className="flex flex-col gap-2">
                              <Link href={detailHref(v)} className="rounded-xl bg-primary hover:bg-primary-dark text-white text-center text-sm font-bold px-4 py-2.5">
                                View details
                              </Link>
                              <Link href={`${detailHref(v)}#vehicle-policy-title`} className="rounded-xl border border-ink/20 text-forest text-center text-sm font-bold px-4 py-2.5 hover:border-primary">
                                Enquire &amp; confirm terms
                              </Link>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-ink/70">
              Vehicle condition is assessed individually — ask our team for the inspection details of any vehicle.
              Warranty shows the coverage recorded for each vehicle; see <Link href="/warranty-ownership" className="underline font-semibold">Warranty &amp; Ownership Support</Link>.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
