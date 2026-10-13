import type { VehicleCategory } from '@/lib/constants';
import { ALLOWED_BRANDS } from '@/lib/brands';

// ── "Explore By" definitions ─────────────────────────────────────────────────
// Shared by the navbar mega-menu, the home page quick-filters, the footer and /explore.

export const EXPLORE_PATH = '/explore';

/**
 * The pre-owned catalogue ("View all EVs" → /explore, its menus, counts and price
 * ranges) lists electric two-wheelers only. Enforced in the database query, so no URL
 * parameter can bring other vehicle types back. Other categories stay in the database
 * for leasing, rent and comparison.
 */
export const CATALOG_CATEGORIES: VehicleCategory[] = ['TWO_WHEELER'];

// ── Price ────────────────────────────────────────────────────────────────────
// ZMR sells vehicles up to ₹3,00,000, so selectable price filters never go above this.
export const PRICE_CAP = 300000;

export interface PriceBucket { label: string; min?: number; max?: number; count?: number }

/** Candidate bucket edges (₹). Only buckets that contain listed vehicles are shown. */
const PRICE_EDGES = [0, 50000, 75000, 100000, 125000, 150000, 200000, 250000, PRICE_CAP];

/** Used when no priced inventory is available (e.g. DB unreachable at build time). */
export const DEFAULT_PRICE_BUCKETS: PriceBucket[] = [
  { label: 'Under ₹1 Lakh', max: 99999 },
  { label: '₹1 – 2 Lakh', min: 100000, max: 199999 },
  { label: '₹2 – 3 Lakh', min: 200000, max: PRICE_CAP },
];

/** Indian-style rupee formatting: 245000 → "₹2,45,000". */
export function formatINR(rs: number): string {
  return `₹${Math.round(rs).toLocaleString('en-IN')}`;
}

/** Compact label: 50000 → "₹50,000", 125000 → "₹1.25 Lakh". */
export function formatINRShort(rs: number): string {
  if (rs >= 100000) return `₹${(rs / 100000).toFixed(2).replace(/\.?0+$/, '')} Lakh`;
  return formatINR(rs);
}

function bucketLabel(min: number, max: number): string {
  if (min === 0) return `Under ${formatINRShort(max)}`;
  if (min >= 100000) return `₹${(min / 100000).toFixed(2).replace(/\.?0+$/, '')} – ${formatINRShort(max)}`;
  return `${formatINRShort(min)} – ${formatINRShort(max)}`;
}

/**
 * Builds price buckets from real inventory prices (₹, already ≤ PRICE_CAP).
 * Buckets are inclusive ranges that don't overlap; empty buckets are dropped.
 */
export function buildPriceBuckets(prices: number[] | undefined): PriceBucket[] {
  const inRange = (prices ?? []).filter((p) => p > 0 && p <= PRICE_CAP);
  if (inRange.length === 0) return DEFAULT_PRICE_BUCKETS;

  const buckets: PriceBucket[] = [];
  for (let i = 0; i < PRICE_EDGES.length - 1; i++) {
    const lo = PRICE_EDGES[i];
    const hi = PRICE_EDGES[i + 1];
    const isLast = i === PRICE_EDGES.length - 2;
    const max = isLast ? hi : hi - 1;
    const count = inRange.filter((p) => p >= lo && p <= max).length;
    if (count === 0) continue;
    buckets.push({ label: bucketLabel(lo, hi), min: lo === 0 ? undefined : lo, max, count });
  }
  return buckets;
}

/** Slider bounds rounded to ₹5,000 and never above the cap. */
export function priceSliderBounds(prices: number[] | undefined): { min: number; max: number } {
  const inRange = (prices ?? []).filter((p) => p > 0 && p <= PRICE_CAP);
  if (inRange.length === 0) return { min: 0, max: PRICE_CAP };
  const step = 5000;
  const min = Math.floor(Math.min(...inRange) / step) * step;
  const max = Math.min(PRICE_CAP, Math.ceil(Math.max(...inRange) / step) * step);
  return { min, max: max > min ? max : Math.min(PRICE_CAP, min + step) };
}

/** Clamps a requested price into [0, PRICE_CAP]; non-numbers become undefined. */
export function clampPrice(v: number | undefined): number | undefined {
  if (v === undefined || !Number.isFinite(v)) return undefined;
  return Math.max(0, Math.min(PRICE_CAP, Math.round(v)));
}

export function priceRangeLabel(min?: number, max?: number): string {
  if (min !== undefined && max !== undefined) return `${formatINR(min)} – ${formatINR(max)}`;
  if (max !== undefined) return `Up to ${formatINR(max)}`;
  if (min !== undefined) return `From ${formatINR(min)}`;
  return 'Any price';
}

// ── Year / KM / Range / Body type ───────────────────────────────────────────
// One definition shared by the navbar (desktop + mobile), home page, footer and /explore.

const THIS_YEAR = new Date().getFullYear();
/** Oldest "& above" year offered. */
export const MIN_YEAR_OPTION = 2020;
export const YEAR_OPTIONS: number[] = Array.from(
  { length: Math.max(0, THIS_YEAR - MIN_YEAR_OPTION) },
  (_, i) => THIS_YEAR - 1 - i,
);

/** "… kms or less" thresholds. */
export const KM_OPTIONS: number[] = [5000, 10000, 20000];

/** Minimum certified range per charge ("100+ km" returns vehicles with ≥ 100 km). */
export const RANGE_OPTIONS: number[] = [80, 100, 150];

export type TwoWheelerStyleValue = 'SCOOTER' | 'BIKE';

export interface BodyType {
  slug: 'scooter' | 'bike';
  label: string;
  hint: string;
  category: VehicleCategory;
  style: TwoWheelerStyleValue;
  image?: string;
}

/**
 * Body types customers can filter by. Both are two-wheelers; the vehicle's
 * `twoWheelerStyle` decides which one it belongs to. Two-wheelers not yet marked
 * as Scooter or Bike in admin are treated as scooters.
 */
export const BODY_TYPES: BodyType[] = [
  { slug: 'scooter', label: 'Scooter', hint: 'Electric scooters', category: 'TWO_WHEELER', style: 'SCOOTER', image: '/category-images/2-wheeler-v2.webp' },
  { slug: 'bike', label: 'Bike', hint: 'Electric motorcycles', category: 'TWO_WHEELER', style: 'BIKE' },
];

/** Older links used category slugs; "2-wheeler" covered both scooters and bikes. */
const LEGACY_TYPE_SLUGS: Record<string, BodyType['slug'][]> = { '2-wheeler': ['scooter', 'bike'] };

/** Supported body-type slugs in a `type=` value; unsupported slugs are dropped. */
export function parseBodyTypeSlugs(value: string | undefined): { slugs: BodyType['slug'][]; dropped: string[] } {
  const slugs = new Set<BodyType['slug']>();
  const dropped: string[] = [];
  for (const raw of (value ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)) {
    const bt = BODY_TYPES.find((b) => b.slug === raw);
    if (bt) slugs.add(bt.slug);
    else if (LEGACY_TYPE_SLUGS[raw]) LEGACY_TYPE_SLUGS[raw].forEach((s) => slugs.add(s));
    else dropped.push(raw);
  }
  return { slugs: BODY_TYPES.map((b) => b.slug).filter((s) => slugs.has(s)), dropped };
}

/** Allowed brands with the models currently in inventory (shown when the catalogue is unavailable). */
export const FALLBACK_MAKES: MakeWithModels[] = ALLOWED_BRANDS.map((make) => ({ make, models: [] }));

export interface MakeWithModels { make: string; models: string[]; count?: number }

/** Data the navbar, home page and footer need for the Explore menus. */
export interface ExploreNavData { makes: MakeWithModels[]; priceBuckets: PriceBucket[] }

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest listings' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'year_desc', label: 'Year: Newest first' },
  { value: 'km_asc', label: 'KM Driven: Lowest first' },
] as const;

// ── Formatting helpers ───────────────────────────────────────────────────────

export function formatKm(km: number): string {
  return `${km.toLocaleString('en-IN')} km`;
}

/**
 * Indicative EMI only — assumes 10.5% p.a., 36 months and 20% down payment.
 * Actual terms depend on the financing partner and must be shown with EMI_DISCLAIMER.
 */
export function estimateEmi(price: number): number {
  const principal = price * 0.8;
  const r = 0.105 / 12;
  const n = 36;
  return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

export const EMI_DISCLAIMER =
  'Indicative EMI assumes 10.5% p.a. interest, a 36-month tenure and a 20% down payment. Actual terms depend on the financing partner.';

// ── URL helpers ──────────────────────────────────────────────────────────────

export type ExploreQuery = Partial<Record<
  'q' | 'minPrice' | 'maxPrice' | 'make' | 'model' | 'minYear' | 'maxKm' | 'type' | 'minRange' | 'sort',
  string | number
>>;

export function exploreHref(query: ExploreQuery = {}): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${EXPLORE_PATH}?${qs}` : EXPLORE_PATH;
}

export function priceHref(b: PriceBucket): string {
  return exploreHref({ minPrice: b.min, maxPrice: b.max });
}

export function bodyTypeHref(bt: BodyType): string {
  return exploreHref({ type: bt.slug });
}

/** Destination of "View all brands": every allowed brand at once. */
export const ALL_BRANDS_HREF = exploreHref({ make: ALLOWED_BRANDS.join(',') });
