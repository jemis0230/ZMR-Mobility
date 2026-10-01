import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, X, Check, SearchX, ShieldCheck, BadgeIndianRupee, Wrench, Truck } from "lucide-react";
import { PrismaVehicleRepository } from "@/infrastructure/repositories/PrismaVehicleRepository";
import type { ExploreFilterParams } from "@/application/repositories/IVehicleRepository";
import { getCachedExploreMenuData } from "@/lib/cachedVehicleQueries";
import {
  PRICE_BUCKETS, YEAR_OPTIONS, KM_OPTIONS, BODY_TYPES, TRANSMISSION_OPTIONS, RANGE_OPTIONS,
  EXPLORE_PATH, SORT_OPTIONS, categoryFromTypeSlug,
} from "@/lib/explore";
import { CATEGORY_TO_SLUG, TRANSMISSION_DISPLAY, TRANSMISSION_TYPES, type TransmissionType, type VehicleCategory } from "@/lib/constants";
import ExploreVehicleCard from "@/presentation/components/ExploreVehicleCard";
import Pagination from "@/presentation/components/Pagination";
import { SortSelect, FilterPanel } from "./ExploreControls";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buy Pre-owned Electric Vehicles | ZMR Mobility",
  description: "Explore ZMR Certified pre-owned EVs by price range, make & model, year, KM driven and body type — scooters, e-rickshaws, cargo loaders and electric cars.",
};

const repo = new PrismaVehicleRepository();

type SP = Record<string, string | string[] | undefined>;

const FILTER_KEYS = ["q", "minPrice", "maxPrice", "make", "model", "minYear", "maxKm", "type", "transmission", "minRange", "sort"] as const;
type FilterKey = (typeof FILTER_KEYS)[number];

function readParams(sp: SP): Partial<Record<FilterKey, string>> {
  const out: Partial<Record<FilterKey, string>> = {};
  for (const k of FILTER_KEYS) {
    const v = sp[k];
    const s = Array.isArray(v) ? v[0] : v;
    if (s) out[k] = s;
  }
  return out;
}

function toInt(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : undefined;
}

function hrefWith(current: Partial<Record<FilterKey, string>>, changes: Partial<Record<FilterKey, string | undefined>>): string {
  const params = new URLSearchParams();
  const merged = { ...current, ...changes };
  for (const k of FILTER_KEYS) {
    const v = merged[k];
    if (v) params.set(k, v);
  }
  const qs = params.toString();
  return qs ? `${EXPLORE_PATH}?${qs}` : EXPLORE_PATH;
}

function toggleInList(list: string | undefined, value: string): string | undefined {
  const items = new Set((list ?? "").split(",").filter(Boolean));
  if (items.has(value)) items.delete(value);
  else items.add(value);
  return items.size ? Array.from(items).join(",") : undefined;
}

// ── Sidebar pieces ────────────────────────────────────────────

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="group border-b border-ink/[0.08] last:border-b-0">
      <summary className="flex items-center justify-between cursor-pointer list-none py-4 text-sm font-bold text-ink">
        {title}
        <ChevronRight className="w-4 h-4 text-ink/40 transition-transform group-open:rotate-90" />
      </summary>
      <div className="pb-4 space-y-1">{children}</div>
    </details>
  );
}

function Option({ href, active, children, multi }: { href: string; active: boolean; children: React.ReactNode; multi?: boolean }) {
  return (
    <Link
      href={href}
      scroll={false}
      className={`flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors ${active ? "text-primary font-semibold bg-primary-50" : "text-ink/70 hover:bg-secondary hover:text-ink"}`}
    >
      <span
        className={`w-4 h-4 shrink-0 flex items-center justify-center border ${multi ? "rounded" : "rounded-full"} ${active ? "border-primary bg-primary text-white" : "border-ink/25 bg-white"}`}
      >
        {active && <Check className="w-3 h-3" strokeWidth={3} />}
      </span>
      {children}
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default async function ExplorePage(props: { searchParams: Promise<SP> }) {
  const sp = await props.searchParams;
  const p = readParams(sp);
  const page = Math.max(1, toInt(typeof sp.page === "string" ? sp.page : undefined) ?? 1);

  const makes = p.make ? p.make.split(",").filter(Boolean) : undefined;
  const typeSlugs = p.type ? p.type.split(",").filter(Boolean) : [];
  const categories = typeSlugs.map(categoryFromTypeSlug).filter(Boolean) as VehicleCategory[];
  const transmission = TRANSMISSION_TYPES.includes(p.transmission as TransmissionType) ? (p.transmission as TransmissionType) : undefined;
  const sortBy = SORT_OPTIONS.some((o) => o.value === p.sort) ? (p.sort as ExploreFilterParams["sortBy"]) : "newest";

  const filters: ExploreFilterParams = {
    q: p.q,
    minPrice: toInt(p.minPrice),
    maxPrice: toInt(p.maxPrice),
    makes,
    model: p.model,
    minYear: toInt(p.minYear),
    maxKm: toInt(p.maxKm),
    categories,
    transmission,
    minRange: toInt(p.minRange),
    sortBy,
    page,
    pageSize: 12,
  };

  const [result, menu] = await Promise.all([
    repo.findForExplore(filters),
    getCachedExploreMenuData().catch(() => ({ makes: [] })),
  ]);
  const { data: vehicles, total, totalPages } = result;

  // Active filter chips
  const chips: { label: string; href: string }[] = [];
  if (p.q) chips.push({ label: `“${p.q}”`, href: hrefWith(p, { q: undefined }) });
  if (p.minPrice || p.maxPrice) {
    const bucket = PRICE_BUCKETS.find((b) => String(b.min ?? "") === (p.minPrice ?? "") && String(b.max ?? "") === (p.maxPrice ?? ""));
    chips.push({ label: bucket?.label ?? "Custom price", href: hrefWith(p, { minPrice: undefined, maxPrice: undefined }) });
  }
  makes?.forEach((m) => chips.push({ label: m, href: hrefWith(p, { make: toggleInList(p.make, m), model: undefined }) }));
  if (p.model) chips.push({ label: p.model, href: hrefWith(p, { model: undefined }) });
  if (p.minYear) chips.push({ label: `${p.minYear} & above`, href: hrefWith(p, { minYear: undefined }) });
  if (p.maxKm) chips.push({ label: `Under ${Number(p.maxKm).toLocaleString("en-IN")} km`, href: hrefWith(p, { maxKm: undefined }) });
  categories.forEach((c) => {
    const bt = BODY_TYPES.find((b) => b.category === c);
    chips.push({ label: bt?.label ?? c, href: hrefWith(p, { type: toggleInList(p.type, CATEGORY_TO_SLUG[c]) }) });
  });
  if (transmission) chips.push({ label: TRANSMISSION_DISPLAY[transmission], href: hrefWith(p, { transmission: undefined }) });
  if (p.minRange) chips.push({ label: `${p.minRange}+ km range`, href: hrefWith(p, { minRange: undefined }) });

  const pageParams = new URLSearchParams();
  for (const k of FILTER_KEYS) if (p[k]) pageParams.set(k, p[k]!);

  const heading = categories.length === 1
    ? `Pre-owned ${BODY_TYPES.find((b) => b.category === categories[0])?.label ?? "EVs"}`
    : makes?.length === 1
    ? `Pre-owned ${makes[0]}${p.model ? ` ${p.model}` : ""} EVs`
    : "Pre-owned Electric Vehicles";

  return (
    <main className="min-h-screen bg-background">
      {/* ── Header band ── */}
      <section className="pt-24 lg:pt-36 pb-8 px-4 md:px-6 bg-gradient-to-b from-primary-50 to-background border-b border-ink/[0.06]">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-1.5 text-xs font-semibold text-ink/50 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-ink/80">Buy Pre-owned EVs</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-ink">{heading}</h1>
              <p className="text-ink/60 mt-2">
                <span className="font-bold text-primary">{total}</span> ZMR Certified {total === 1 ? "vehicle" : "vehicles"} available
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-ink/70">
              {[
                { icon: ShieldCheck, label: "200+ point inspection" },
                { icon: Wrench, label: "Up to 24-month warranty" },
                { icon: BadgeIndianRupee, label: "Easy EMI" },
                { icon: Truck, label: "Doorstep delivery" },
              ].map((b) => (
                <span key={b.label} className="inline-flex items-center gap-1.5 rounded-full bg-white border border-ink/10 px-3 py-1.5">
                  <b.icon className="w-3.5 h-3.5 text-primary" /> {b.label}
                </span>
              ))}
            </div>
          </div>

          {/* Body type quick tiles */}
          <div className="mt-6 flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {BODY_TYPES.map((bt) => {
              const slug = CATEGORY_TO_SLUG[bt.category];
              const active = typeSlugs.includes(slug);
              return (
                <Link
                  key={bt.category}
                  href={hrefWith(p, { type: toggleInList(p.type, slug) })}
                  scroll={false}
                  className={`shrink-0 flex items-center gap-3 rounded-2xl border pr-4 pl-1.5 py-1.5 transition-all ${active ? "border-primary bg-primary text-white shadow-md shadow-primary/25" : "border-ink/10 bg-white text-ink hover:border-primary/40"}`}
                >
                  <span className="relative w-14 h-10 rounded-xl overflow-hidden bg-secondary">
                    <Image src={bt.image} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="text-sm font-bold whitespace-nowrap">{bt.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col lg:flex-row gap-8">
        {/* ── Sidebar ── */}
        <aside className="w-full lg:w-72 shrink-0">
          <FilterPanel activeCount={chips.length}>
            <div className="lg:sticky lg:top-36 rounded-2xl bg-white border border-ink/[0.08] shadow-card px-4">
              <div className="flex items-center justify-between pt-4">
                <p className="font-black text-ink">Filters</p>
                {chips.length > 0 && (
                  <Link href={EXPLORE_PATH} className="text-xs font-bold text-primary hover:underline">Clear all</Link>
                )}
              </div>

              <FilterGroup title="Price Range">
                {PRICE_BUCKETS.map((b) => {
                  const active = (p.minPrice ?? "") === String(b.min ?? "") && (p.maxPrice ?? "") === String(b.max ?? "");
                  return (
                    <Option
                      key={b.label}
                      active={active}
                      href={hrefWith(p, active ? { minPrice: undefined, maxPrice: undefined } : { minPrice: b.min?.toString(), maxPrice: b.max?.toString() })}
                    >
                      {b.label}
                    </Option>
                  );
                })}
              </FilterGroup>

              <FilterGroup title="Make and Model">
                {menu.makes.length === 0 && <p className="text-xs text-ink/50 px-2">No brands listed yet.</p>}
                {menu.makes.map((m) => {
                  const active = makes?.includes(m.make) ?? false;
                  return (
                    <div key={m.make}>
                      <Option multi active={active} href={hrefWith(p, { make: toggleInList(p.make, m.make), model: undefined })}>
                        <span className="flex-1">{m.make}</span>
                        <span className="text-[11px] text-ink/40">{m.count}</span>
                      </Option>
                      {active && makes?.length === 1 && m.models.length > 1 && (
                        <div className="ml-7 mt-1 mb-2 flex flex-wrap gap-1">
                          {m.models.map((model) => {
                            const on = p.model === model;
                            return (
                              <Link
                                key={model}
                                href={hrefWith(p, { model: on ? undefined : model })}
                                scroll={false}
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${on ? "border-primary bg-primary text-white" : "border-ink/15 text-ink/70 hover:border-primary/40"}`}
                              >
                                {model}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </FilterGroup>

              <FilterGroup title="Year">
                {YEAR_OPTIONS.map((y) => {
                  const active = p.minYear === String(y);
                  return <Option key={y} active={active} href={hrefWith(p, { minYear: active ? undefined : String(y) })}>{y} & above</Option>;
                })}
              </FilterGroup>

              <FilterGroup title="KM Driven">
                {KM_OPTIONS.map((km) => {
                  const active = p.maxKm === String(km);
                  return <Option key={km} active={active} href={hrefWith(p, { maxKm: active ? undefined : String(km) })}>{km.toLocaleString("en-IN")} kms or less</Option>;
                })}
              </FilterGroup>

              <FilterGroup title="Body Type">
                {BODY_TYPES.map((bt) => {
                  const slug = CATEGORY_TO_SLUG[bt.category];
                  return (
                    <Option key={slug} multi active={typeSlugs.includes(slug)} href={hrefWith(p, { type: toggleInList(p.type, slug) })}>
                      <span>{bt.label} <span className="text-[11px] text-ink/40">· {bt.hint}</span></span>
                    </Option>
                  );
                })}
              </FilterGroup>

              <FilterGroup title="Transmission">
                {TRANSMISSION_OPTIONS.map((t) => {
                  const active = transmission === t.value;
                  return <Option key={t.value} active={active} href={hrefWith(p, { transmission: active ? undefined : t.value })}>{t.label}</Option>;
                })}
              </FilterGroup>

              <FilterGroup title="Range per Charge">
                {RANGE_OPTIONS.map((r) => {
                  const active = p.minRange === String(r);
                  return <Option key={r} active={active} href={hrefWith(p, { minRange: active ? undefined : String(r) })}>{r}+ km</Option>;
                })}
              </FilterGroup>
            </div>
          </FilterPanel>
        </aside>

        {/* ── Results ── */}
        <section className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex flex-wrap items-center gap-2">
              {chips.length === 0 ? (
                <p className="text-sm text-ink/55">Showing all certified EVs</p>
              ) : (
                <>
                  {chips.map((c) => (
                    <Link
                      key={c.label}
                      href={c.href}
                      scroll={false}
                      className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 border border-primary/20 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary-100"
                    >
                      {c.label} <X className="w-3 h-3" />
                    </Link>
                  ))}
                  <Link href={EXPLORE_PATH} className="text-xs font-bold text-ink/50 hover:text-primary px-1">Clear all</Link>
                </>
              )}
            </div>
            <SortSelect />
          </div>

          {vehicles.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {vehicles.map((v) => <ExploreVehicleCard key={v.id} vehicle={v} />)}
              </div>
              <Pagination currentPage={page} totalPages={totalPages} basePath={EXPLORE_PATH} searchParams={pageParams} />
            </>
          ) : (
            <div className="rounded-3xl bg-white border border-dashed border-ink/15 py-20 px-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
                <SearchX className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-ink">No EVs match these filters</h2>
              <p className="text-ink/55 text-sm mt-1 max-w-md mx-auto">
                Try removing a filter — or tell us what you need and our team will source it for you.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <Link href={EXPLORE_PATH} className="rounded-xl bg-primary text-white px-5 py-2.5 text-sm font-bold hover:bg-primary-dark">Clear all filters</Link>
                <Link href="/#contact" className="rounded-xl border border-ink/15 bg-white px-5 py-2.5 text-sm font-bold text-ink hover:border-primary/40">Request a vehicle</Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
