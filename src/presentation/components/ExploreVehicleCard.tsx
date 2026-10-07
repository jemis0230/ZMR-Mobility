import Link from "next/link";
import { Gauge, ArrowRight, Zap, CalendarDays } from "lucide-react";
import type { Vehicle } from "@/domain/entities/Vehicle";
import { CATEGORY_DISPLAY } from "@/lib/constants";
import { slugifyVehicle } from "@/lib/vehicleSlug";
import { estimateEmi, formatINR } from "@/lib/explore";
import EVImage from "./EVImage";
import CompareButton from "./compare/CompareButton";

export default function ExploreVehicleCard({ vehicle, eager = false }: { vehicle: Vehicle; eager?: boolean }) {
  const href = `/buying/vehicles/detail/${slugifyVehicle(vehicle.make, vehicle.model, vehicle.id)}`;
  const name = `${vehicle.make} ${vehicle.model}`;
  const title = `${vehicle.manufactureYear ? `${vehicle.manufactureYear} ` : ""}${name}`;

  const specs = [
    vehicle.manufactureYear ? { icon: CalendarDays, label: String(vehicle.manufactureYear) } : null,
    vehicle.kmDriven != null ? { icon: Gauge, label: `${vehicle.kmDriven.toLocaleString("en-IN")} km` } : null,
    vehicle.certifiedRangeKm ? { icon: Zap, label: `${vehicle.certifiedRangeKm} km range` } : null,
  ].filter(Boolean) as { icon: typeof Gauge; label: string }[];

  return (
    <article className="group bg-white rounded-2xl border border-ink/10 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
      <Link href={href} className="relative block aspect-[4/3] bg-tint" tabIndex={-1} aria-hidden>
        {vehicle.mainImage ? (
          <EVImage
            src={vehicle.mainImage}
            alt=""
            eager={eager}
            className="w-full h-full"
            imgClassName="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Zap className="w-10 h-10 text-sage" /></div>
        )}
        <span className="absolute top-3 left-3 rounded-full bg-lime px-2.5 py-1 text-[11px] font-bold text-forest shadow-sm">
          {CATEGORY_DISPLAY[vehicle.category]}
        </span>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-forest text-[17px] leading-snug line-clamp-1">
          <Link href={href} className="hover:text-primary transition-colors">{title}</Link>
        </h3>

        <ul className="mt-2 mb-4 flex flex-wrap gap-1.5" aria-label="Key details">
          {specs.map((s) => (
            <li key={s.label} className="inline-flex items-center gap-1 rounded-md bg-tint px-2 py-1 text-[11px] font-semibold text-forest">
              <s.icon className="w-3 h-3 text-leaf" aria-hidden /> {s.label}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-4 border-t border-dashed border-ink/15 flex items-end justify-between gap-3">
          <div>
            {vehicle.buyingPrice ? (
              <>
                <p className="text-xl font-black text-forest">{formatINR(vehicle.buyingPrice)}</p>
                <p className="text-xs text-ink/75 mt-0.5">
                  Indicative EMI <span className="font-bold text-primary">{formatINR(estimateEmi(vehicle.buyingPrice))}/mo</span>
                </p>
              </>
            ) : (
              <p className="text-base font-bold text-forest">Price on request</p>
            )}
          </div>
          <Link
            href={href}
            aria-label={`View details: ${title}`}
            className="shrink-0 w-10 h-10 rounded-full bg-tint text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors"
          >
            <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>

        <div className="mt-3">
          <CompareButton item={{ id: vehicle.id, title: name, image: vehicle.mainImage }} />
        </div>
      </div>
    </article>
  );
}
