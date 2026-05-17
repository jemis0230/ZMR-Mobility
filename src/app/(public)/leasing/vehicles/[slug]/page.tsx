import { PrismaVehicleRepository } from "@/infrastructure/repositories/PrismaVehicleRepository";
import VehicleCard from "@/presentation/components/VehicleCard";
import CategorySelector from "@/presentation/components/CategorySelector";
import VehicleFilterSidebar from "@/presentation/components/VehicleFilterSidebar";
import Pagination from "@/presentation/components/Pagination";
import { CATEGORY_SLUG_MAP } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const vehicleRepo = new PrismaVehicleRepository();

export default async function CategoryLeasingPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const categoryName = CATEGORY_SLUG_MAP[params.slug] ?? params.slug;
  
  // Parse search params into filter object
  const filters = {
    search: typeof searchParams.q === 'string' ? searchParams.q : undefined,
    makes: typeof searchParams.makes === 'string' ? searchParams.makes.split(',') : undefined,
    chargerTypes: typeof searchParams.chargerTypes === 'string' ? searchParams.chargerTypes.split(',') : undefined,
    minRange: typeof searchParams.minRange === 'string' ? parseInt(searchParams.minRange) : undefined,
    maxRange: typeof searchParams.maxRange === 'string' ? parseInt(searchParams.maxRange) : undefined,
    minPayload: typeof searchParams.minPayload === 'string' ? parseInt(searchParams.minPayload) : undefined,
    maxPayload: typeof searchParams.maxPayload === 'string' ? parseInt(searchParams.maxPayload) : undefined,
    minVolume: typeof searchParams.minVolume === 'string' ? parseInt(searchParams.minVolume) : undefined,
    maxVolume: typeof searchParams.maxVolume === 'string' ? parseInt(searchParams.maxVolume) : undefined,
    page: typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1,
    pageSize: 6,
  };

  // Fetch paginated vehicles and available filter options in parallel
  const [result, filterOptions] = await Promise.all([
    vehicleRepo.findByCategoryWithFilters(categoryName, filters),
    vehicleRepo.getFilterOptions(categoryName)
  ]);

  const { data: vehicles, total, page, totalPages } = result;
  
  // Create URLSearchParams instance for Pagination component
  const currentSearchParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === 'string') currentSearchParams.set(key, value);
    else if (Array.isArray(value)) currentSearchParams.set(key, value.join(','));
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30 hover:text-primary transition-colors mb-6">
              <ArrowLeft className="w-3 h-3" />
              Back to Home
            </Link>
            <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold tracking-tight">
              Lease <span className="text-primary">{categoryName}</span>
            </h1>
            <p className="text-white/40 max-w-xl text-sm md:text-lg">
              Explore our range of premium electric {categoryName.toLowerCase()}s designed for efficiency and sustainable growth.
            </p>
          </div>
          
          <div className="glass-card px-6 py-3 border-primary/20 bg-primary/5 shrink-0">
            <span className="text-primary font-bold">{total}</span>
            <span className="text-white/40 ml-2 text-sm font-medium uppercase tracking-wider">Models Found</span>
          </div>
        </div>

        <CategorySelector currentSlug={params.slug} mode="leasing" />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-1/4 shrink-0">
            <VehicleFilterSidebar options={filterOptions} />
          </div>

          {/* Vehicle Grid & Pagination */}
          <div className="w-full lg:w-3/4">
            {vehicles.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 xl:grid-cols-2 gap-6 md:gap-8">
                  {vehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </div>
                
                <Pagination 
                  currentPage={page} 
                  totalPages={totalPages} 
                  basePath={`/leasing/vehicles/${params.slug}`}
                  searchParams={currentSearchParams}
                />
              </>
            ) : (
              <div className="py-32 text-center glass-card border-dashed border-white/10">
                <h3 className="text-xl font-bold text-white/40 mb-2">No Vehicles Found</h3>
                <p className="text-white/20 text-sm">Try adjusting your filters or search query.</p>
                <Link href={`/leasing/vehicles/${params.slug}`} className="inline-block mt-6 text-primary font-bold hover:underline">
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
