import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { PrismaVehicleRepository } from '@/infrastructure/repositories/PrismaVehicleRepository';
import type { VehicleCategory } from '@/lib/constants';
import type { ExploreFilterParams } from '@/application/repositories/IVehicleRepository';

const vehicleRepo = new PrismaVehicleRepository();

// Filter options change only when vehicles are added/updated in admin.
// Cache per category for up to 1 hour; admin mutations call revalidateTag
// to bust these caches immediately on change.

export const getCachedLeasingFilterOptions = unstable_cache(
  async (category: string) => vehicleRepo.getFilterOptions(category as VehicleCategory),
  ['leasing-filter-options'],
  { tags: ['vehicle-filter-options', 'vehicle-filter-options-leasing'], revalidate: 3600 }
);

export const getCachedBuyingFilterOptions = unstable_cache(
  async (category: string) => vehicleRepo.getFilterOptionsForBuying(category as VehicleCategory),
  ['buying-filter-options-v2'],
  { tags: ['vehicle-filter-options', 'vehicle-filter-options-buying'], revalidate: 3600 }
);

export const getCachedRentFilterOptions = unstable_cache(
  async (category: string) => vehicleRepo.getFilterOptionsForRent(category as VehicleCategory),
  ['rent-filter-options'],
  { tags: ['vehicle-filter-options', 'vehicle-filter-options-rent'], revalidate: 3600 }
);

// Make → models list for the navbar "Make and Model" mega-menu and /explore sidebar.
export const getCachedExploreMenuData = unstable_cache(
  async () => vehicleRepo.getExploreMenuData(),
  // Bump the version when the returned shape changes so stale cache entries are never reused.
  ['explore-menu-data-v4'],
  { tags: ['vehicle-filter-options', 'vehicle-filter-options-buying'], revalidate: 3600 }
);

// ── Public vehicle pages ──────────────────────────────────────
// Inventory shown to visitors (no personal data). Results are cached for up to 5 minutes,
// so most page views don't wait on the database (or wake it from idle); admin changes to a
// vehicle or its plans call revalidateTag(VEHICLE_DATA_TAG), which drops these entries —
// and the pages rendered from them — immediately.
export const VEHICLE_DATA_TAG = 'vehicle-filter-options';
const PUBLIC_VEHICLE_TTL = 300;

/** One page of the two-wheeler catalogue for a given filter set (/explore, home "Featured"). */
export const getCachedExplorePage = unstable_cache(
  async (filters: ExploreFilterParams) => vehicleRepo.findForExplore(filters),
  ['explore-page-v1'],
  { tags: [VEHICLE_DATA_TAG], revalidate: PUBLIC_VEHICLE_TTL }
);

const getCachedVehicle = unstable_cache(
  async (id: string) => vehicleRepo.findById(id),
  ['vehicle-by-id-v1'],
  { tags: [VEHICLE_DATA_TAG], revalidate: PUBLIC_VEHICLE_TTL }
);

/** Vehicle for a detail page; deduplicated between generateMetadata and the page. */
export const getPublicVehicle = cache((id: string) => getCachedVehicle(id));

export const getCachedVehiclesByIds = unstable_cache(
  async (ids: string[]) => vehicleRepo.findByIds(ids),
  ['vehicles-by-ids-v1'],
  { tags: [VEHICLE_DATA_TAG], revalidate: PUBLIC_VEHICLE_TTL }
);

/** Listed vehicles for pickers (compare page). */
export const getCachedVehicleSummaries = unstable_cache(
  async () => vehicleRepo.listSummaries(),
  ['vehicle-summaries-v1'],
  { tags: [VEHICLE_DATA_TAG], revalidate: PUBLIC_VEHICLE_TTL }
);
