import { PrismaVehicleRepository } from "@/infrastructure/repositories/PrismaVehicleRepository";
import { CATEGORY_SLUG_MAP } from "@/lib/constants";
import ComparePageClient from "./ComparePageClient";

const vehicleRepo = new PrismaVehicleRepository();

export const dynamic = 'force-dynamic';

export default async function ComparePage({ params }: { params: { category?: string[] } }) {
  const categorySlug = params.category?.[0] ?? "2-wheeler";
  const categoryName = CATEGORY_SLUG_MAP[categorySlug] ?? "2 Wheeler";
  const vehicles = await vehicleRepo.findByCategory(categoryName);
  
  // Convert to plain objects for client
  const plainVehicles = vehicles.map(v => ({
    ...v,
    sideImages: v.sideImages,
  }));

  return (
    <ComparePageClient 
      params={params} 
      initialVehicles={plainVehicles} 
    />
  );
}
