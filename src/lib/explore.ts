import { CATEGORY_TO_SLUG, SLUG_TO_CATEGORY, TRANSMISSION_DISPLAY, type TransmissionType, type VehicleCategory } from '@/lib/constants';

// ── "Explore By" definitions ─────────────────────────────────────────────────
// Shared by the navbar mega-menu, the home page quick-filters and /explore.

export const EXPLORE_PATH = '/explore';

export interface PriceBucket { label: string; min?: number; max?: number }

export const PRICE_BUCKETS: PriceBucket[] = [
  { label: 'Under 1 Lakh', max: 100000 },
  { label: '1 - 2 Lakh', min: 100000, max: 200000 },
  { label: '2 - 3 Lakh', min: 200000, max: 300000 },
  { label: '3 - 5 Lakh', min: 300000, max: 500000 },
  { label: '5 - 8 Lakh', min: 500000, max: 800000 },
  { label: '8 - 12 Lakh', min: 800000, max: 1200000 },
  { label: 'Above 12 Lakh', min: 1200000 },
];

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

export const TRANSMISSION_OPTIONS = (Object.keys(TRANSMISSION_DISPLAY) as TransmissionType[]).map((t) => ({
  value: t,
  label: TRANSMISSION_DISPLAY[t],
}));

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

export function formatPriceShort(rs: number): string {
  if (rs >= 10000000) return `₹${(rs / 10000000).toFixed(2).replace(/\.?0+$/, '')} Cr`;
  if (rs >= 100000) return `₹${(rs / 100000).toFixed(2).replace(/\.?0+$/, '')} Lakh`;
  return `₹${rs.toLocaleString('en-IN')}`;
}

/** Indicative EMI: 10.5% p.a., 36 months, 20% down payment. */
export function estimateEmi(price: number): number {
  const principal = price * 0.8;
  const r = 0.105 / 12;
  const n = 36;
  return Math.round((principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
}

// ── URL helpers ──────────────────────────────────────────────────────────────

export type ExploreQuery = Partial<Record<
  'q' | 'minPrice' | 'maxPrice' | 'make' | 'model' | 'minYear' | 'maxKm' | 'type' | 'transmission' | 'minRange' | 'sort',
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
