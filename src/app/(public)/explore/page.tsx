import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, X, Check, SearchX, ShieldCheck, ArrowLeftRight, Info, Bike } from "lucide-react";
import type { ExploreFilterParams, ExploreMenuData } from "@/application/repositories/IVehicleRepository";
import { getCachedExploreMenuData, getCachedExplorePage } from "@/lib/cachedVehicleQueries";
import {
  YEAR_OPTIONS, KM_OPTIONS, BODY_TYPES, RANGE_OPTIONS, PRICE_CAP,
  EXPLORE_PATH, SORT_OPTIONS, EMI_DISCLAIMER, buildPriceBuckets, priceSliderBounds,
  clampPrice, priceRangeLabel, formatINR, parseBodyTypeSlugs,
} from "@/lib/explore";
import { ALLOWED_BRANDS, canonicalBrand } from "@/lib/brands";
import ExploreVehicleCard from "@/presentation/components/ExploreVehicleCard";
import Pagination from "@/presentation/components/Pagination";
import { SortSelect, FilterPanel, PriceRangeFilter } from "./ExploreControls";

export const dynamic = "force-dynamic";

const BASE_DESCRIPTION = "Explore pre-owned electric scooters and bikes from ZMR Mobility by price, make & model, year, KM driven, body type and range per charge.";

// Body-type pages (/explore?type=…) are listed in the sitemap, so they get their own
// canonical URL and title; every other filter combination canonicalises to /explore.
export async function generateMetadata(props: { searchParams: Promise<SP> }): Promise<Metadata> {
  const sp = await props.searchParams;
  const keys = Object.keys(sp).filter((k) => sp[k]);
  const type = typeof sp.type === "string" ? sp.type : undefined;
  const bodyType = type ? BODY_TYPES.find((b) => b.slug === type) : undefined;

  if (bodyType && keys.length === 1) {
    return {
      title: `Buy Used Electric ${bodyType.label}s | ZMR Mobility`,
      description: `Pre-owned electric ${bodyType.label.toLowerCase()}s for sale from ZMR Mobility. ${BASE_DESCRIPTION}`,
      alternates: { canonical: `/explore?type=${type}` },
    };
  }
  return {
    title: "Buy Pre-owned Electric Scooters & Bikes | ZMR Mobility",
    description: BASE_DESCRIPTION,
    alternates: { canonical: "/explore" },
  };
}


const ALLOWED_MAKES_EMPTY = ALLOWED_BRANDS.map((make) => ({ make, models: [] as string[], count: 0 }));

type SP = Record<string, string | string[] | undefined>;

const FILTER_KEYS = ["q", "minPrice", "maxPrice", "make", "model", "minYear", "maxKm", "type", "minRange", "sort"] as const;
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
    <details open className="group border-b border-ink/10 last:border-b-0">
      <summary className="flex items-center justify-between cursor-pointer list-none py-4 text-sm font-bold text-forest rounded-md">
        {title}
        <ChevronRight className="w-4 h-4 text-ink/60 transition-transform group-open:rotate-90" aria-hidden />
      </summary>
      <div className="pb-4 space-y-1">{children}</div>
    </details>
  );
}

function Option({ href, active, children, multi, count }: { href: string; active: boolean; children: React.ReactNode; multi?: boolean; count?: number }) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={`flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors ${active ? "text-forest font-semibold bg-lime/40" : "text-ink/80 hover:bg-tint hover:text-forest"}`}
    >
      <span
        aria-hidden
        className={`w-4 h-4 shrink-0 flex items-center justify-center border ${multi ? "rounded" : "rounded-full"} ${active ? "border-primary bg-primary text-white" : "border-ink/40 bg-white"}`}
      >
        {active && <Check className="w-3 h-3" strokeWidth={3} />}
      </span>
      <span className="flex-1">{children}</span>
      {count !== undefined && <span className="text-[11px] text-ink/60">{count}</span>}
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default async function ExplorePage(props: { searchParams: Promise<SP> }) {
  const sp = await props.searchParams;
  const raw = readParams(sp);
  const page = Math.max(1, toInt(typeof sp.page === "string" ? sp.page : undefined) ?? 1);

  // Links made before the filter options changed may carry values we no longer offer
  // (other brands, 2018, 50,000 km, Car, 300+ km…). Those are dropped, never shown as active.
  const dropped: string[] = [];
  const p: Partial<Record<FilterKey, string>> = { ...raw };

  const brandList: string[] = [];
  for (const m of (raw.make ?? "").split(",").map((s) => s.trim()).filter(Boolean)) {
    const brand = canonicalBrand(m);
    if (brand) { if (!brandList.includes(brand)) brandList.push(brand); }
    else dropped.push(m);
  }
  p.make = brandList.length ? brandList.join(",") : undefined;
  if (raw.model && brandList.length !== 1) { dropped.push(raw.model); p.model = undefined; }

  const keepIfOffered = (key: "minYear" | "maxKm" | "minRange", options: number[], label: (n: string) => string) => {
    if (raw[key] && !options.map(String).includes(raw[key]!)) { dropped.push(label(raw[key]!)); p[key] = undefined; }
  };
  keepIfOffered("minYear", YEAR_OPTIONS, (v) => `${v} & above`);
  keepIfOffered("maxKm", KM_OPTIONS, (v) => `${Number(v).toLocaleString("en-IN")} km or less`);
  keepIfOffered("minRange", RANGE_OPTIONS, (v) => `${v}+ km range`);

  const bodyTypes = parseBodyTypeSlugs(raw.type);
  dropped.push(...bodyTypes.dropped);
  const typeSlugs: string[] = bodyTypes.slugs;
  p.type = typeSlugs.length ? typeSlugs.join(",") : undefined;

  const makes = brandList.length ? brandList : undefined;
  const bodyStyles = BODY_TYPES.filter((b) => typeSlugs.includes(b.slug)).map((b) => b.style);
  const sortBy = SORT_OPTIONS.some((o) => o.value === p.sort) ? (p.sort as ExploreFilterParams["sortBy"]) : "newest";

  // Selectable prices never exceed the ₹3,00,000 cap; out-of-range links are clamped.
  let minPrice = clampPrice(toInt(p.minPrice));
  let maxPrice = clampPrice(toInt(p.maxPrice));
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) [minPrice, maxPrice] = [maxPrice, minPrice];
  if (minPrice === 0) minPrice = undefined;
  const priceActive = minPrice !== undefined || maxPrice !== undefined;
  // Any price filter implies the selling-price cap.
  if (priceActive && maxPrice === undefined) maxPrice = PRICE_CAP;
  const pc = { ...p, minPrice: minPrice?.toString(), maxPrice: maxPrice?.toString() };

  const filters: ExploreFilterParams = {
    q: p.q,
    minPrice,
    maxPrice,
    makes,
    model: p.model,
    minYear: toInt(p.minYear),
    maxKm: toInt(p.maxKm),
    bodyStyles,
    minRange: toInt(p.minRange),
    sortBy,
    page,
    pageSize: 12,
  };

  const emptyMenu: ExploreMenuData = { makes: [], prices: [], unpricedCount: 0, overCapCount: 0 };
  const [result, menu] = await Promise.all([
    getCachedExplorePage(filters),
    getCachedExploreMenuData().catch(() => emptyMenu),
  ]);
  const { data: vehicles, total, totalPages } = result;
  const priceBuckets = buildPriceBuckets(menu.prices);
  const bounds = priceSliderBounds(menu.prices);

  // Active filter chips
  const chips: { label: string; href: string }[] = [];
  if (p.q) chips.push({ label: `“${p.q}”`, href: hrefWith(pc, { q: undefined }) });
  if (priceActive) {
    const bucket = priceBuckets.find((b) => b.min === minPrice && b.max === maxPrice);
    chips.push({ label: bucket?.label ?? priceRangeLabel(minPrice, maxPrice), href: hrefWith(pc, { minPrice: undefined, maxPrice: undefined }) });
  }
  makes?.forEach((m) => chips.push({ label: m, href: hrefWith(pc, { make: toggleInList(p.make, m), model: undefined }) }));
  if (p.model) chips.push({ label: p.model, href: hrefWith(pc, { model: undefined }) });
  if (p.minYear) chips.push({ label: `${p.minYear} & above`, href: hrefWith(pc, { minYear: undefined }) });
  if (p.maxKm) chips.push({ label: `Up to ${Number(p.maxKm).toLocaleString("en-IN")} km`, href: hrefWith(pc, { maxKm: undefined }) });
  BODY_TYPES.filter((b) => typeSlugs.includes(b.slug)).forEach((bt) => {
    chips.push({ label: bt.label, href: hrefWith(pc, { type: toggleInList(p.type, bt.slug) }) });
  });
  if (p.minRange) chips.push({ label: `${p.minRange}+ km range`, href: hrefWith(pc, { minRange: undefined }) });

  // Selected brands with no listings at all (shown honestly instead of a generic empty state)
  const unlistedBrands = (makes ?? []).filter((b) => (menu.makes.find((m) => m.make === b)?.count ?? 0) === 0);

  const pageParams = new URLSearchParams();
  for (const k of FILTER_KEYS) if (pc[k]) pageParams.set(k, pc[k]!);

  const heading = typeSlugs.length === 1
    ? `Pre-owned Electric ${BODY_TYPES.find((b) => b.slug === typeSlugs[0])?.label ?? "Vehicle"}s`
    : makes?.length === 1
    ? `Pre-owned ${makes[0]}${p.model ? ` ${p.model}` : ""} EVs`
    : "Pre-owned Electric Two-Wheelers";

  return (
    <main className="min-h-screen bg-cream">
      {/* ── Header band ── */}
      <section className="pt-24 lg:pt-36 pb-8 px-4 md:px-6 bg-tint border-b border-ink/10">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-1.5 text-xs font-semibold text-ink/70 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="w-3 h-3" aria-hidden />
            <span aria-current="page" className="text-forest">Buy Pre-owned EVs</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-forest">{heading}</h1>
              <p className="text-ink/75 mt-2" aria-live="polite">
                <span className="font-bold text-primary">{total}</span> {total === 1 ? "two-wheeler" : "two-wheelers"} available
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <Link href="/warranty-ownership" className="inline-flex items-center gap-1.5 rounded-full bg-white border border-ink/15 px-3 py-2 text-forest hover:border-primary">
                <ShieldCheck className="w-3.5 h-3.5 text-leaf" aria-hidden /> Warranty & ownership support
              </Link>
              <Link href="/compare" className="inline-flex items-center gap-1.5 rounded-full bg-white border border-ink/15 px-3 py-2 text-forest hover:border-primary">
                <ArrowLeftRight className="w-3.5 h-3.5 text-leaf" aria-hidden /> Compare up to 3 vehicles
              </Link>
            </div>
          </div>

          {/* Body type quick tiles */}
          <div className="mt-6 flex gap-3 overflow-x-auto no-scrollbar pb-1" role="list" aria-label="Body type">
            {BODY_TYPES.map((bt) => {
              const slug = bt.slug;
              const active = typeSlugs.includes(slug);
              return (
                <Link
                  key={slug}
                  role="listitem"
                  href={hrefWith(pc, { type: toggleInList(p.type, slug) })}
                  scroll={false}
                  aria-current={active ? "true" : undefined}
                  className={`shrink-0 flex items-center gap-3 rounded-2xl border pr-4 pl-1.5 py-1.5 transition-all ${active ? "border-forest bg-lime text-forest shadow-md" : "border-ink/15 bg-white text-forest hover:border-primary"}`}
                >
                  <span className="relative w-14 h-10 rounded-xl overflow-hidden bg-cream flex items-center justify-center">
                    {bt.image
                      ? <Image src={bt.image} alt="" fill sizes="56px" className="object-cover" />
                      : <Bike className="w-6 h-6 text-leaf" aria-hidden />}
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
        <aside className="w-full lg:w-72 shrink-0" aria-label="Filters">
          <FilterPanel activeCount={chips.length}>
            <div className="lg:sticky lg:top-36 rounded-2xl bg-white border border-ink/10 shadow-card px-4">
              <div className="flex items-center justify-between pt-4">
                <h2 className="hidden lg:block font-black text-forest">Filters</h2>
                {chips.length > 0 && (
                  <Link href={EXPLORE_PATH} className="text-xs font-bold text-primary hover:underline">Clear all</Link>
                )}
              </div>

              <FilterGroup title="Price Range">
                {priceBuckets.map((b) => {
                  const active = minPrice === b.min && maxPrice === b.max;
                  return (
                    <Option
                      key={b.label}
                      active={active}
                      count={b.count}
                      href={hrefWith(pc, active ? { minPrice: undefined, maxPrice: undefined } : { minPrice: b.min?.toString(), maxPrice: b.max?.toString() })}
                    >
                      {b.label}
                    </Option>
                  );
                })}
                <div className="pt-3 px-1">
                  <PriceRangeFilter bounds={bounds} currentMin={minPrice} currentMax={maxPrice} />
                </div>
                <p className="flex gap-1.5 px-1 pt-2 text-[11px] leading-snug text-ink/70">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-px" aria-hidden />
                  <span>
                    Prices up to {formatINR(PRICE_CAP)}.
                    {menu.unpricedCount > 0 && ` ${menu.unpricedCount} listing${menu.unpricedCount === 1 ? "" : "s"} without a published price ${menu.unpricedCount === 1 ? "is" : "are"} hidden while a price filter is on.`}
                  </span>
                </p>
              </FilterGroup>

              <FilterGroup title="Make and Model">
                {(menu.makes.length ? menu.makes : ALLOWED_MAKES_EMPTY).map((m) => {
                  const active = makes?.includes(m.make) ?? false;
                  return (
                    <div key={m.make}>
                      <Option multi active={active} count={m.count} href={hrefWith(pc, { make: toggleInList(p.make, m.make), model: undefined })}>
                        {m.make}
                        {m.count === 0 && <span className="text-[11px] text-ink/60"> · none listed now</span>}
                      </Option>
                      {active && makes?.length === 1 && m.models.length > 1 && (
                        <div className="ml-7 mt-1 mb-2 flex flex-wrap gap-1">
                          {m.models.map((model) => {
                            const on = p.model === model;
                            return (
                              <Link
                                key={model}
                                href={hrefWith(pc, { model: on ? undefined : model })}
                                scroll={false}
                                aria-current={on ? "true" : undefined}
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${on ? "border-forest bg-lime text-forest" : "border-ink/20 text-ink/80 hover:border-primary"}`}
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
                  return <Option key={y} active={active} href={hrefWith(pc, { minYear: active ? undefined : String(y) })}>{y} & above</Option>;
                })}
              </FilterGroup>

              <FilterGroup title="KM Driven">
                {KM_OPTIONS.map((km) => {
                  const active = p.maxKm === String(km);
                  return <Option key={km} active={active} href={hrefWith(pc, { maxKm: active ? undefined : String(km) })}>{km.toLocaleString("en-IN")} kms or less</Option>;
                })}
              </FilterGroup>

              <FilterGroup title="Body Type">
                {BODY_TYPES.map((bt) => (
                  <Option key={bt.slug} multi active={typeSlugs.includes(bt.slug)} href={hrefWith(pc, { type: toggleInList(p.type, bt.slug) })}>
                    {bt.label}
                  </Option>
                ))}
              </FilterGroup>

              <FilterGroup title="Range per Charge">
                {RANGE_OPTIONS.map((r) => {
                  const active = p.minRange === String(r);
                  return <Option key={r} active={active} href={hrefWith(pc, { minRange: active ? undefined : String(r) })}>{r}+ km</Option>;
                })}
              </FilterGroup>
            </div>
          </FilterPanel>
        </aside>

        {/* ── Results ── */}
        <section className="flex-1 min-w-0" aria-label="Results">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex flex-wrap items-center gap-2">
              {chips.length === 0 ? (
                <p className="text-sm text-ink/70">Showing all available electric scooters and bikes</p>
              ) : (
                <>
                  {chips.map((c) => (
                    <Link
                      key={c.label}
                      href={c.href}
                      scroll={false}
                      aria-label={`Remove filter: ${c.label}`}
                      className="inline-flex items-center gap-1.5 rounded-full bg-lime/50 border border-lime px-3 py-1.5 text-xs font-bold text-forest hover:bg-lime"
                    >
                      {c.label} <X className="w-3 h-3" aria-hidden />
                    </Link>
                  ))}
                  <Link href={EXPLORE_PATH} className="text-xs font-bold text-primary hover:underline px-1">Clear all</Link>
                </>
              )}
            </div>
            <SortSelect />
          </div>

          {dropped.length > 0 && (
            <p role="status" className="mb-5 flex gap-2 rounded-xl border border-ink/15 bg-white px-4 py-3 text-xs text-ink/80">
              <Info className="w-4 h-4 shrink-0 text-leaf" aria-hidden />
              <span>
                Some filters in this link are no longer offered and were removed: {dropped.map((d) => `“${d}”`).join(", ")}.
              </span>
            </p>
          )}

          {vehicles.length > 0 ? (
            <>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {vehicles.map((v, i) => <ExploreVehicleCard key={v.id} vehicle={v} eager={i < 3} />)}
              </div>
              <Pagination currentPage={page} totalPages={totalPages} basePath={EXPLORE_PATH} searchParams={pageParams} />
              <p className="mt-8 text-xs text-ink/65">{EMI_DISCLAIMER}</p>
            </>
          ) : (
            <div className="rounded-3xl bg-white border border-dashed border-ink/20 py-20 px-6 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-tint flex items-center justify-center mb-4">
                <SearchX className="w-7 h-7 text-leaf" aria-hidden />
              </div>
              <h2 className="text-xl font-bold text-forest">
                {unlistedBrands.length > 0 && unlistedBrands.length === makes?.length
                  ? `No ${unlistedBrands.join(" or ")} vehicles are listed right now`
                  : "No vehicles match these filters"}
              </h2>
              <p className="text-ink/75 text-sm mt-1 max-w-md mx-auto">
                {unlistedBrands.length > 0 && unlistedBrands.length === makes?.length
                  ? "Check back soon, or tell us what you’re looking for and our team will let you know when one is available."
                  : priceActive
                  ? `No listed vehicle is priced ${priceRangeLabel(minPrice, maxPrice).toLowerCase()} with the other filters you chose. Try a wider price range or remove a filter.`
                  : "Try removing a filter — or tell us what you need and our team will help you find it."}
              </p>
              <div className="flex flex-wrap justify-center gap-3 mt-6">
                <Link href={EXPLORE_PATH} className="rounded-xl bg-primary text-white px-5 py-2.5 text-sm font-bold hover:bg-primary-dark">Clear all filters</Link>
                <Link href="/#contact" className="rounded-xl border border-ink/20 bg-white px-5 py-2.5 text-sm font-bold text-forest hover:border-primary">Request a vehicle</Link>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
