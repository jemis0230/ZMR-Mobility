import { unstable_cache } from 'next/cache';
import { PrismaVehicleRepository } from '@/infrastructure/repositories/PrismaVehicleRepository';
import type { VehicleCategory } from '@/lib/constants';

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
  ['buying-filter-options'],
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
  ['explore-menu-data-v2'],
  { tags: ['vehicle-filter-options', 'vehicle-filter-options-buying'], revalidate: 3600 }
);
