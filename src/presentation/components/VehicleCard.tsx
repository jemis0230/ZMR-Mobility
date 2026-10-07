'use client';

import Link from "next/link";
import { Vehicle } from "@/domain/entities/Vehicle";
import { CATEGORY_DISPLAY, isCargo, is4Wheeler, CHARGER_TYPE_DISPLAY } from "@/lib/constants";
import { Battery, Zap, Gauge, ArrowRight, Clock, Package } from "lucide-react";
import EVImage from "@/presentation/components/EVImage";
import CompareButton from "@/presentation/components/compare/CompareButton";
import { slugifyVehicle } from "@/lib/vehicleSlug";
import { formatMinutes } from "@/lib/formatTime";

interface VehicleCardProps {
  vehicle: Vehicle;
  mode?: 'leasing' | 'buying' | 'rent';
}

export default function VehicleCard({ vehicle, mode = 'leasing' }: VehicleCardProps) {
  const getCardSpecs = () => {
    if (isCargo(vehicle.category)) {
      return [
        { label: "Payload", value: `${vehicle.payloadKg ?? 0} kg`, icon: Package, color: "text-orange-400" },
        { label: "Range", value: `${vehicle.realWorldRangeKm ?? vehicle.certifiedRangeKm} km`, icon: Gauge, color: "text-primary" },
        { label: "Charging", value: formatMinutes(vehicle.chargingTimeMinutes), icon: Zap, color: "text-accent" },
      ];
    }
    if (is4Wheeler(vehicle.category)) {
      return [
        { label: "Range", value: `${vehicle.certifiedRangeKm} km`, icon: Gauge, color: "text-primary" },
        { label: "Charging", value: formatMinutes(vehicle.chargingTimeMinutes), icon: Zap, color: "text-accent" },
        { label: "Battery", value: `${vehicle.batteryCapKwh} kWh`, icon: Battery, color: "text-leaf" },
      ];
    }
    return [
      { label: "Range", value: `${vehicle.certifiedRangeKm} km`, icon: Gauge, color: "text-primary" },
      { label: "Charging", value: formatMinutes(vehicle.chargingTimeMinutes), icon: Clock, color: "text-accent" },
      { label: "Battery", value: `${vehicle.batteryCapKwh} kWh`, icon: Battery, color: "text-leaf" },
    ];
  };

  const cardSpecs = getCardSpecs();

  const detailHref =
    mode === 'buying'
      ? `/buying/vehicles/detail/${slugifyVehicle(vehicle.make, vehicle.model, vehicle.id)}`
      : mode === 'rent'
      ? `/rent/vehicles/detail/${slugifyVehicle(vehicle.make, vehicle.model, vehicle.id)}`
      : `/vehicles/${slugifyVehicle(vehicle.make, vehicle.model, vehicle.id)}`;

  const lowestLeasePlan = vehicle.leasePlans
    .filter((p) => p.isActive)
    .sort((a, b) => a.monthlyPriceRs - b.monthlyPriceRs)[0];

  const lowestRentPlan = vehicle.rentPlans
    .filter((p) => p.isActive)
    .sort((a, b) => a.pricePerDayRs - b.pricePerDayRs)[0];

  const price =
    mode === 'buying'
      ? vehicle.buyingPrice
        ? `₹${vehicle.buyingPrice.toLocaleString('en-IN')}`
        : 'Price on request'
      : mode === 'rent'
      ? lowestRentPlan
        ? `₹${lowestRentPlan.pricePerDayRs.toLocaleString('en-IN')}/day`
        : 'Price on request'
      : lowestLeasePlan
      ? `₹${lowestLeasePlan.monthlyPriceRs.toLocaleString('en-IN')}/month`
      : 'Price on request';

  const ctaLabel = mode === 'buying' ? 'View Details' : mode === 'rent' ? 'View Rental Info' : 'View Lease Plans';

  return (
     <div
      className="glass-card overflow-hidden group hover:border-primary/40 transition-all flex flex-col h-full"
    >
      <Link href={detailHref} className="block relative h-56 overflow-hidden">
        {vehicle.mainImage ? (
          <EVImage
            src={vehicle.mainImage}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full"
            imgClassName="object-contain p-6 group-hover:scale-110 transition-transform duration-500"
            iconSize="lg"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
          />
        ) : (
          <div className="w-full h-full ev-shimmer-base flex items-center justify-center">
            <Zap className="w-12 h-12 text-[#577440]/10" />
          </div>
        )}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-ink/10 text-[10px] font-bold tracking-widest uppercase">
          {CATEGORY_DISPLAY[vehicle.category]}
        </div>
      </Link>

      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="flex-1">
          <Link href={detailHref}>
            <h3 className="text-xl font-bold tracking-tight hover:text-primary transition-colors">{vehicle.make} {vehicle.model}</h3>
          </Link>
          <p className="text-ink/60 text-sm italic">
            {mode === 'buying' ? 'Buy from ' : mode === 'rent' ? 'Rent from ' : 'Starting from '}{price}
          </p>
          {(vehicle.manufactureYear || vehicle.kmDriven != null) && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {vehicle.manufactureYear && (
                <span className="px-2.5 py-1 rounded-full bg-primary-50 text-primary text-[11px] font-bold">{vehicle.manufactureYear}</span>
              )}
              {vehicle.kmDriven != null && (
                <span className="px-2.5 py-1 rounded-full bg-primary-50 text-primary text-[11px] font-bold">{vehicle.kmDriven.toLocaleString('en-IN')} km</span>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {cardSpecs.map((spec, idx) => (
            <div key={idx} className="bg-ink/5 rounded-lg p-2 text-center">
              <spec.icon className={`w-4 h-4 mx-auto mb-1 ${spec.color}`} />
              <p className="text-[10px] text-ink/60 uppercase tracking-tighter">{spec.label}</p>
              <p className="text-xs font-bold truncate">{spec.value}</p>
            </div>
          ))}
        </div>

        <Link
          href={detailHref}
          className="w-full py-3 rounded-xl bg-tint border border-ink/15 text-forest font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all group/btn"
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" aria-hidden />
        </Link>
        <CompareButton variant="block" item={{ id: vehicle.id, title: `${vehicle.make} ${vehicle.model}`, image: vehicle.mainImage }} />
      </div>
    </div>
  );
}
