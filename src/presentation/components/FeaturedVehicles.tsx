import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Vehicle } from "@/domain/entities/Vehicle";
import ExploreVehicleCard from "./ExploreVehicleCard";

/** Featured EVs (Cream section, white cards). */
export default function FeaturedVehicles({ vehicles }: { vehicles: Vehicle[] }) {
  if (vehicles.length === 0) return null;

  return (
    <section className="py-16 md:py-20 px-4 md:px-6 bg-cream" aria-labelledby="featured-title">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-primary text-xs font-bold uppercase tracking-widest">Just arrived</p>
            <h2 id="featured-title" className="text-3xl md:text-4xl font-black mt-2 text-forest">Featured EVs</h2>
            <p className="text-ink/80 mt-2">Recently listed pre-owned electric vehicles.</p>
          </div>
          <Link
            href="/explore"
            className="shrink-0 inline-flex items-center gap-1 rounded-xl border-2 border-primary/40 bg-white px-4 py-2.5 text-sm font-bold text-primary-dark hover:bg-primary hover:text-white hover:border-primary transition-colors"
          >
            View all <ChevronRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        <ul className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0" aria-label="Featured vehicles">
          {vehicles.map((v) => (
            <li key={v.id} className="snap-start shrink-0 w-[78%] sm:w-[46%] lg:w-[calc(25%-15px)]">
              <ExploreVehicleCard vehicle={v} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
