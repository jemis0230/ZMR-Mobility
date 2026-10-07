import { CATEGORY_TO_SLUG, SLUG_TO_CATEGORY, type VehicleCategory } from '@/lib/constants';

// ── "Explore By" definitions ─────────────────────────────────────────────────
// Shared by the navbar mega-menu, the home page quick-filters, the footer and /explore.

export const EXPLORE_PATH = '/explore';

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

const THIS_YEAR = new Date().getFullYear();
export const YEAR_OPTIONS: number[] = Array.from({ length: 8 }, (_, i) => THIS_YEAR - 1 - i);

export const KM_OPTIONS: number[] = [5000, 10000, 20000, 30000, 50000, 75000, 100000];

export const RANGE_OPTIONS: number[] = [100, 150, 200, 300, 400];

export interface BodyType { category: VehicleCategory; label: string; hint: string; image: string }

export const BODY_TYPES: BodyType[] = [
  { category: 'TWO_WHEELER', label: 'Scooter & Bike', hint: '2 Wheeler', image: '/category-images/2-wheeler.webp' },
  { category: 'THREE_WHEELER_PASSENGER', label: 'E-Rickshaw & Auto', hint: '3 Wheeler Passenger', image: '/category-images/3-wheeler-passenger.webp' },
  { category: 'THREE_WHEELER_CARGO', label: 'Cargo Loader', hint: '3 Wheeler Cargo', image: '/category-images/3-wheeler-cargo.webp' },
  { category: 'FOUR_WHEELER_PASSENGER', label: 'Car', hint: '4 Wheeler Passenger', image: '/category-images/4-wheeler-passenger.webp' },
  { category: 'FOUR_WHEELER_CARGO', label: 'Mini Truck', hint: '4 Wheeler Cargo', image: '/category-images/4-wheeler-cargo.webp' },
];

// Shown in the Make & Model menu when the catalogue has no buying vehicles yet.
export const FALLBACK_MAKES: MakeWithModels[] = [
  { make: 'Tata', models: ['Nexon EV', 'Tiago EV', 'Punch EV', 'Ace EV'] },
  { make: 'Mahindra', models: ['Treo', 'Treo Zor', 'XUV400'] },
  { make: 'Ather', models: ['450X', 'Rizta'] },
  { make: 'TVS', models: ['iQube'] },
  { make: 'MG', models: ['Comet EV', 'ZS EV', 'Windsor EV'] },
  { make: 'Bajaj', models: ['Chetak', 'RE E-TEC'] },
];

export interface MakeWithModels { make: string; models: string[] }

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

export function bodyTypeHref(category: VehicleCategory): string {
  return exploreHref({ type: CATEGORY_TO_SLUG[category] });
}

export function categoryFromTypeSlug(slug: string | undefined): VehicleCategory | undefined {
  return slug ? SLUG_TO_CATEGORY[slug] : undefined;
}
