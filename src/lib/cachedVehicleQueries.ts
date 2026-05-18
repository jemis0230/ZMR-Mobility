import { unstable_cache } from 'next/cache';
import { PrismaVehicleRepository } from '@/infrastructure/repositories/PrismaVehicleRepository';
import { PrismaBuyingVehicleRepository } from '@/infrastructure/repositories/PrismaBuyingVehicleRepository';

const vehicleRepo = new PrismaVehicleRepository();
const buyingRepo = new PrismaBuyingVehicleRepository();

// Filter options change only when vehicles are added/updated in admin.
// Cache per category for up to 1 hour; admin mutations call revalidateTag
// to bust these caches immediately on change.

export const getCachedLeasingFilterOptions = unstable_cache(
  async (category: string) => vehicleRepo.getFilterOptions(category),
  ['leasing-filter-options'],
  { tags: ['vehicle-filter-options', 'vehicle-filter-options-leasing'], revalidate: 3600 }
);

export const getCachedBuyingFilterOptions = unstable_cache(
  async (category: string) => buyingRepo.getFilterOptions(category),
  ['buying-filter-options'],
  { tags: ['vehicle-filter-options', 'vehicle-filter-options-buying'], revalidate: 3600 }
);
