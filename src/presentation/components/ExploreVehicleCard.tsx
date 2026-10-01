import Link from "next/link";
import { BadgeCheck, Gauge, Settings2, ArrowRight, Zap } from "lucide-react";
import type { Vehicle } from "@/domain/entities/Vehicle";
import { CATEGORY_DISPLAY, TRANSMISSION_DISPLAY } from "@/lib/constants";
import { slugifyVehicle } from "@/lib/vehicleSlug";
import { estimateEmi } from "@/lib/explore";
import EVImage from "./EVImage";

export default function ExploreVehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const href = `/buying/vehicles/detail/${slugifyVehicle(vehicle.make, vehicle.model, vehicle.id)}`;
  const title = `${vehicle.manufactureYear ? `${vehicle.manufactureYear} ` : ""}${vehicle.make} ${vehicle.model}`;

  const specs = [
    vehicle.kmDriven != null && { icon: Gauge, label: `${vehicle.kmDriven.toLocaleString("en-IN")} km` },
    { icon: Settings2, label: TRANSMISSION_DISPLAY[vehicle.transmission] },
    { icon: Zap, label: `${vehicle.certifiedRangeKm} km range` },
  ].filter(Boolean) as { icon: typeof Gauge; label: string }[];

  return (
    <article className="group bg-white rounded-2xl border border-ink/[0.08] shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
      <Link href={href} className="relative block aspect-[4/3] bg-gradient-to-b from-secondary to-white">
        {vehicle.mainImage ? (
          <EVImage
            src={vehicle.mainImage}
            alt={title}
            className="w-full h-full"
            imgClassName="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Zap className="w-10 h-10 text-primary/20" /></div>
        )}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-accent shadow-sm">
          <BadgeCheck className="w-3.5 h-3.5" /> ZMR Certified
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-ink/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          {CATEGORY_DISPLAY[vehicle.category]}
        </span>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link href={href}>
          <h3 className="font-bold text-ink text-[17px] leading-snug group-hover:text-primary transition-colors line-clamp-1">{title}</h3>
        </Link>

        <div className="mt-2 mb-4 flex flex-wrap gap-1.5">
          {specs.map((s) => (
            <span key={s.label} className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-[11px] font-semibold text-ink/70">
              <s.icon className="w-3 h-3 text-primary" /> {s.label}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-dashed border-ink/10 flex items-end justify-between gap-3">
          <div>
            {vehicle.buyingPrice ? (
              <>
                <p className="text-xl font-black text-ink">₹{vehicle.buyingPrice.toLocaleString("en-IN")}</p>
                <p className="text-xs text-ink/55 mt-0.5">
                  EMI from <span className="font-bold text-primary">₹{estimateEmi(vehicle.buyingPrice).toLocaleString("en-IN")}/mo</span>
                </p>
              </>
            ) : (
              <p className="text-base font-bold text-ink">Price on request</p>
            )}
          </div>
          <Link
            href={href}
            aria-label={`View ${title}`}
            className="shrink-0 w-10 h-10 rounded-full bg-primary-50 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
