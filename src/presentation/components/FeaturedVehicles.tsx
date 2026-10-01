import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Vehicle } from "@/domain/entities/Vehicle";
import ExploreVehicleCard from "./ExploreVehicleCard";

export default function FeaturedVehicles({ vehicles }: { vehicles: Vehicle[] }) {
  if (vehicles.length === 0) return null;

  return (
    <section className="py-16 md:py-20 px-4 md:px-6 bg-gradient-to-b from-secondary/70 to-background border-y border-ink/[0.06]">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Just Arrived</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2 text-ink">Featured Certified EVs</h2>
            <p className="text-ink/60 mt-2">Inspected, refurbished and ready to drive home.</p>
          </div>
          <Link
            href="/explore"
            className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-primary/30 bg-white px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary hover:text-white transition-colors"
          >
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          {vehicles.map((v) => (
            <div key={v.id} className="snap-start shrink-0 w-[78%] sm:w-[46%] lg:w-[calc(25%-15px)]">
              <ExploreVehicleCard vehicle={v} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
