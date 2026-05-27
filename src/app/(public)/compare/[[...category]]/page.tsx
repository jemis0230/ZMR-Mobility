import { PrismaVehicleRepository } from "@/infrastructure/repositories/PrismaVehicleRepository";
import { CATEGORY_SLUG_MAP } from "@/lib/constants";
import ComparePageClient from "./ComparePageClient";

const vehicleRepo = new PrismaVehicleRepository();

export const revalidate = 60;

export default async function ComparePage(props: { params: Promise<{ category?: string[] }> }) {
  const params = await props.params;
  const categorySlug = params.category?.[0] ?? "2-wheeler";
  const categoryName = CATEGORY_SLUG_MAP[categorySlug] ?? "2 Wheeler";
  const vehicles = await vehicleRepo.findByCategory(categoryName);

  return (
    <ComparePageClient
      params={params}
      initialVehicles={vehicles}
    />
  );
}
