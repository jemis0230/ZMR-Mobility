'use client';

import { useState } from 'react';
import CategorySelector from "@/presentation/components/CategorySelector";
import Link from "next/link";
import { slugifyVehicle } from "@/lib/vehicleSlug";
import { CATEGORY_SLUG_MAP, CATEGORY_DISPLAY, isCargo } from "@/lib/constants";
import { Vehicle } from "@/domain/entities/Vehicle";
import { formatMinutes } from "@/lib/formatTime";

export default function ComparePageClient({
  params,
  initialVehicles,
}: {
  params: { category?: string[] };
  initialVehicles: Vehicle[];
}) {
  const categorySlug = params.category?.[0] || "2-wheeler";
  const category = CATEGORY_SLUG_MAP[categorySlug] ?? 'TWO_WHEELER';
  const categoryLabel = CATEGORY_DISPLAY[category] ?? categorySlug;
  const isCargoCategory = isCargo(category);

  const [selectedVehicle1Id, setSelectedVehicle1Id] = useState<string | null>(initialVehicles[0]?.id || null);
  const [selectedVehicle2Id, setSelectedVehicle2Id] = useState<string | null>(initialVehicles[1]?.id || null);

  const selectedVehicle1 = initialVehicles.find((v) => v.id === selectedVehicle1Id);
  const selectedVehicle2 = initialVehicles.find((v) => v.id === selectedVehicle2Id);

  const getLowestLeasePrice = (v: Vehicle) =>
    v.leasePlans.filter((p) => p.isActive).sort((a, b) => a.monthlyPriceRs - b.monthlyPriceRs)[0]?.monthlyPriceRs ?? null;

  const getComparisonAttributes = () => {
    const specs: Array<{ label: string; getValue: (v: Vehicle) => string }> = [
      { label: "Monthly Lease", getValue: (v) => { const p = getLowestLeasePrice(v); return p ? `₹${p.toLocaleString('en-IN')}` : "—"; } },
      { label: "Range", getValue: (v) => `${v.certifiedRangeKm} km` },
      { label: "Top Speed", getValue: (v) => `${v.topSpeedKmh} km/h` },
      { label: "Battery Capacity", getValue: (v) => `${v.batteryCapKwh} kWh` },
      { label: "Battery Type", getValue: (v) => v.batteryType?.name ?? "—" },
      { label: "Motor Type", getValue: (v) => v.motorType?.name ?? "—" },
      { label: "Peak Power", getValue: (v) => v.peakPowerKw != null ? `${v.peakPowerKw} kW` : "—" },
      { label: "Peak Torque", getValue: (v) => v.peakTorqueNm != null ? `${v.peakTorqueNm} Nm` : "—" },
      { label: "Transmission", getValue: (v) => v.transmission || "—" },
      { label: "Charging Time", getValue: (v) => formatMinutes(v.chargingTimeMinutes) },
      { label: "Curb Weight", getValue: (v) => v.curbWeightKg ? `${v.curbWeightKg} kg` : "—" },
      { label: "Ground Clearance", getValue: (v) => v.groundClearanceMm ? `${v.groundClearanceMm} mm` : "—" },
      { label: "Warranty", getValue: (v) => v.warranty || "—" },
    ];

    if (isCargoCategory) {
      specs.push(
        { label: "Payload", getValue: (v) => v.payloadKg ? `${v.payloadKg} kg` : "—" },
        { label: "Cargo Volume", getValue: (v) => v.cargoVolumeL ? `${v.cargoVolumeL} L` : "—" }
      );
    }

    return specs;
  };

  const attributes = getComparisonAttributes();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Compare <span className="text-primary">{categoryLabel}</span>
          </h1>
          <p className="text-white/40 max-w-2xl mx-auto text-lg">
            Find the perfect electric {categoryLabel.toLowerCase()} by comparing specifications, performance, and pricing side by side.
          </p>
        </div>

        <div className="mb-16">
          <CategorySelector currentSlug={categorySlug} baseHref="/compare" />
        </div>

        {initialVehicles.length < 2 ? (
          <div className="glass-card p-16 text-center border-dashed border-white/10">
            <h3 className="text-2xl font-bold text-white/40 mb-4">Not Enough Vehicles to Compare</h3>
            <p className="text-white/20 mb-8 max-w-md mx-auto">We need at least 2 vehicles in this category to show a comparison. Please check back soon or browse our fleet!</p>
            <Link href={`/leasing/vehicles/${categorySlug}`} className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-background px-8 py-3 rounded-full font-bold transition-all electric-glow">
              Browse Fleet
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="glass-card p-4 md:p-8">
                <label className="text-white/40 text-sm font-bold uppercase tracking-widest mb-4 block">Vehicle 1</label>
                <select
                  value={selectedVehicle1Id || ""}
                  onChange={(e) => setSelectedVehicle1Id(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 focus:outline-none focus:border-primary transition-colors"
                >
                  {initialVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
                  ))}
                </select>
              </div>

              <div className="glass-card p-4 md:p-8">
                <label className="text-white/40 text-sm font-bold uppercase tracking-widest mb-4 block">Vehicle 2</label>
                <select
                  value={selectedVehicle2Id || ""}
                  onChange={(e) => setSelectedVehicle2Id(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 focus:outline-none focus:border-primary transition-colors"
                >
                  {initialVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.make} {vehicle.model}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedVehicle1 && selectedVehicle2 && (
              <div className="overflow-x-auto -mx-6 px-6">
                <div className="min-w-[540px]">
                  <div className="grid grid-cols-3 gap-4 md:gap-8 mb-4 md:mb-8">
                    <div className="opacity-50 flex items-end pb-4 md:pb-8">
                      <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-white/40">Specification</span>
                    </div>
                    {[selectedVehicle1, selectedVehicle2].map((vehicle) => {
                      const leasePrice = getLowestLeasePrice(vehicle);
                      return (
                        <div key={vehicle.id} className="flex flex-col">
                          <div className="glass-card p-4 md:p-8 border-primary/10 text-center">
                            <div className="w-full aspect-video bg-white/5 rounded-xl overflow-hidden mb-3 md:mb-6">
                              <img src={vehicle.mainImage} alt={vehicle.model} className="w-full h-full object-contain p-2" />
                            </div>
                            <h3 className="text-sm md:text-xl font-bold tracking-tight mb-1 md:mb-2">
                              {vehicle.make} <span className="text-primary">{vehicle.model}</span>
                            </h3>
                            {leasePrice && (
                              <div className="text-xl md:text-3xl font-black text-primary italic mb-2 md:mb-4">
                                ₹{leasePrice.toLocaleString('en-IN')}<span className="text-[10px] md:text-xs text-white/40 font-normal not-italic">/mo</span>
                              </div>
                            )}
                            <Link href={`/vehicles/${slugifyVehicle(vehicle.make, vehicle.model, vehicle.id)}`} className="inline-flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary hover:text-white/80 transition-colors">
                              View Details
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-2">
                    {attributes.map((attr, idx) => {
                      const v1 = attr.getValue(selectedVehicle1);
                      const v2 = attr.getValue(selectedVehicle2);
                      return (
                        <div key={idx} className="grid grid-cols-3 gap-4 md:gap-8 items-center">
                          <div className="bg-white/5 p-3 md:p-6 rounded-xl border border-white/5">
                            <span className="text-[10px] md:text-sm font-bold uppercase tracking-widest text-white/40">{attr.label}</span>
                          </div>
                          <div className="p-3 md:p-6 text-center border border-white/5 rounded-xl">
                            <span className="text-sm md:text-lg font-bold text-white/80">{v1}</span>
                          </div>
                          <div className="p-3 md:p-6 text-center border border-white/5 rounded-xl">
                            <span className="text-sm md:text-lg font-bold text-white/80">{v2}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
