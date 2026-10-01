import { PrismaVehicleRepository } from "@/infrastructure/repositories/PrismaVehicleRepository";
import { getCachedBuyingFilterOptions } from "@/lib/cachedVehicleQueries";
import VehicleCard from "@/presentation/components/VehicleCard";
import CategorySelector from "@/presentation/components/CategorySelector";
import VehicleFilterSidebar from "@/presentation/components/VehicleFilterSidebar";
import Pagination from "@/presentation/components/Pagination";
import { CATEGORY_SLUG_MAP, CATEGORY_DISPLAY, type ChargerType } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const revalidate = 3600;

export async function generateStaticParams() {
  return Object.keys(CATEGORY_SLUG_MAP).map((slug) => ({ slug }));
}

const buyingVehicleRepo = new PrismaVehicleRepository();

export default async function CategoryBuyingPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const category = CATEGORY_SLUG_MAP[params.slug] ?? 'TWO_WHEELER';
  const categoryName = CATEGORY_DISPLAY[category] ?? params.slug;

  const sp = searchParams;
  const str = (k: string) => typeof sp[k] === 'string' ? sp[k] as string : undefined;
  const num = (k: string) => str(k) ? parseInt(str(k)!) : undefined;

  const filters = {
    makes: str('makes') ? str('makes')!.split(',') : undefined,
    chargerType: str('chargerType') as ChargerType | undefined,
    minRange: num('minRange'),
    maxRange: num('maxRange'),
    minRealWorldRange: num('minRealWorldRange'),
    maxRealWorldRange: num('maxRealWorldRange'),
    minSpeed: num('minSpeed'),
    maxSpeed: num('maxSpeed'),
    minPayload: num('minPayload'),
    maxPayload: num('maxPayload'),
    minVolume: num('minVolume'),
    maxVolume: num('maxVolume'),
    sortBy: str('sortBy') as 'price_asc' | 'price_desc' | undefined,
    page: str('page') ? parseInt(str('page')!) : 1,
    pageSize: 6,
  };

  const [result, filterOptions] = await Promise.all([
    buyingVehicleRepo.findByCategoryForBuying(category, filters),
    getCachedBuyingFilterOptions(category),
  ]);

  const { data: vehicles, total, page, totalPages } = result;

  const currentSearchParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === 'string') currentSearchParams.set(key, value);
    else if (Array.isArray(value)) currentSearchParams.set(key, value.join(','));
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pt-24 lg:pt-40 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink/50 hover:text-primary transition-colors mb-6">
              <ArrowLeft className="w-3 h-3" />
              Back to Home
            </Link>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold tracking-tight">
              Buy <span className="text-primary">{categoryName}</span>
            </h1>
            <p className="text-ink/60 max-w-xl text-sm md:text-lg">
              Own a premium electric {categoryName.toLowerCase()} — built for efficiency and sustainable growth.
            </p>
          </div>
          <div className="glass-card px-6 py-3 border-primary/20 bg-primary/5 shrink-0">
            <span className="text-primary font-bold">{total}</span>
            <span className="text-ink/60 ml-2 text-sm font-medium uppercase tracking-wider">Models Found</span>
          </div>
        </div>

        <CategorySelector currentSlug={params.slug} baseHref="/buying/vehicles" mode="buying" />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <div className="w-full lg:w-1/4 shrink-0">
            <VehicleFilterSidebar options={filterOptions} category={category} section="buying" />
          </div>
          <div className="w-full lg:w-3/4">
            {vehicles.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-6 md:gap-8">
                  {vehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} mode="buying" />
                  ))}
                </div>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  basePath={`/buying/vehicles/${params.slug}`}
                  searchParams={currentSearchParams}
                />
              </>
            ) : (
              <div className="py-32 text-center glass-card border-dashed border-ink/10">
                <h3 className="text-xl font-bold text-ink/60 mb-2">No Vehicles Found</h3>
                <p className="text-ink/40 text-sm">Try adjusting your filters.</p>
                <Link href={`/buying/vehicles/${params.slug}`} className="inline-block mt-6 text-primary font-bold hover:underline">
                  Clear All Filters
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
