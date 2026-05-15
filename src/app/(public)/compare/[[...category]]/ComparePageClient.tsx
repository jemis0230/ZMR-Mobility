'use client';

import { useState, useEffect } from 'react';
import CategorySelector from "@/presentation/components/CategorySelector";
import { PrismaVehicleRepository } from "@/infrastructure/repositories/PrismaVehicleRepository";
import Link from "next/link";

// Define Vehicle type locally for client
interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: string;
  range: number;
  trueRange: number | null;
  topSpeed: number;
  batteryCap: number;
  mainImage: string;
  sideImages: string[];
  basePrice: number;
  deposit: number;
  warranty: string;
  kerbWeight: number | null;
  gvW: number | null;
  width: number | null;
  height: number | null;
  length: number | null;
  groundClearance: number | null;
  wheelbase: number | null;
  batteryType: string | null;
  peakVoltage: string | null;
  motorType: string | null;
  peakPower: string | null;
  peakTorque: string | null;
  transmission: string | null;
  gradability: number | null;
  chargingTime: string | null;
  fastChargingTime: string | null;
  chargerType: string | null;
  onBoardCharger: boolean | null;
  payload: number | null;
  volume: number | null;
  containerDims: string | null;
  overviewText: string | null;
  techSpecsText: string | null;
  performanceText: string | null;
  leasingInfoText: string | null;
}

export default function ComparePageClient({ 
  params, 
  initialVehicles 
}: { 
  params: { category?: string[] };
  initialVehicles: any[];
}) {
  let categorySlug = params.category?.[0] || "2-wheeler";
  
  // Map slug to category name
  const categoryMapping: Record<string, string> = {
    "2-wheeler": "2 Wheeler",
    "3-wheeler-cargo": "3 Wheeler (Cargo)",
    "3-wheeler-passenger": "3 Wheeler (Passenger)",
    "4-wheeler-passenger": "4 Wheeler (Passenger)",
    "4-wheeler-cargo": "4 Wheeler (Cargo)",
  };
  
  const categoryName = categoryMapping[categorySlug] || "2 Wheeler";
  
  // State for selected vehicles
  const [selectedVehicle1Id, setSelectedVehicle1Id] = useState<string | null>(initialVehicles[0]?.id || null);
  const [selectedVehicle2Id, setSelectedVehicle2Id] = useState<string | null>(initialVehicles[1]?.id || null);
  
  // Get selected vehicles
  const selectedVehicle1 = initialVehicles.find(v => v.id === selectedVehicle1Id);
  const selectedVehicle2 = initialVehicles.find(v => v.id === selectedVehicle2Id);
  
  // Get comparison attributes
  const getComparisonAttributes = () => {
    const specs = [
      { label: "Monthly Lease", key: "basePrice", format: (v: any) => v ? `₹${v.toLocaleString()}` : "—" },
      { label: "Range", key: "range", format: (v: any) => v ? `${v} KM` : "—" },
      { label: "Top Speed", key: "topSpeed", format: (v: any) => v ? `${v} KM/H` : "—" },
      { label: "Battery Capacity", key: "batteryCap", format: (v: any) => v ? `${v} kWh` : "—" },
      { label: "Battery Type", key: "batteryType" },
      { label: "Motor Type", key: "motorType" },
      { label: "Peak Power", key: "peakPower" },
      { label: "Peak Torque", key: "peakTorque" },
      { label: "Transmission", key: "transmission" },
      { label: "Charging Time", key: "chargingTime" },
      { label: "Kerb Weight", key: "kerbWeight", format: (v: any) => v ? `${v} kg` : "—" },
      { label: "Ground Clearance", key: "groundClearance", format: (v: any) => v ? `${v} mm` : "—" },
      { label: "Warranty", key: "warranty" },
    ];
    
    if (categoryName.includes("Cargo")) {
      specs.push(
        { label: "Payload", key: "payload", format: (v: any) => v ? `${v} kg` : "—" },
        { label: "Cargo Volume", key: "volume", format: (v: any) => v ? `${v} ft³` : "—" }
      );
    }
    
    return specs;
  };
  
  const attributes = getComparisonAttributes();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Compare <span className="text-primary">{categoryName}</span>
          </h1>
          <p className="text-white/40 max-w-2xl mx-auto text-lg">
            Find the perfect electric {categoryName.toLowerCase()} by comparing specifications, performance, and pricing side by side.
          </p>
        </div>

        {/* Category Selector */}
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
            {/* Vehicle Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="glass-card p-8">
                <label className="text-white/40 text-sm font-bold uppercase tracking-widest mb-4 block">
                  Vehicle 1
                </label>
                <select
                  value={selectedVehicle1Id || ""}
                  onChange={(e) => setSelectedVehicle1Id(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 focus:outline-none focus:border-primary transition-colors"
                >
                  {initialVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="glass-card p-8">
                <label className="text-white/40 text-sm font-bold uppercase tracking-widest mb-4 block">
                  Vehicle 2
                </label>
                <select
                  value={selectedVehicle2Id || ""}
                  onChange={(e) => setSelectedVehicle2Id(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 focus:outline-none focus:border-primary transition-colors"
                >
                  {initialVehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedVehicle1 && selectedVehicle2 ? (
              <>
                {/* Vehicle Cards Header */}
                <div className="grid grid-cols-3 gap-8 mb-8">
                  <div className="opacity-50 flex items-end pb-8">
                    <span className="text-sm font-bold uppercase tracking-widest text-white/40">Specification</span>
                  </div>
                  {[selectedVehicle1, selectedVehicle2].map((vehicle) => (
                    <div key={vehicle.id} className="flex flex-col">
                      <div className="glass-card p-8 border-primary/10 text-center">
                        <div className="w-full aspect-video bg-white/5 rounded-xl overflow-hidden mb-6">
                          <img 
                            src={vehicle.mainImage} 
                            alt={vehicle.model}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight mb-2">
                          {vehicle.make} <span className="text-primary">{vehicle.model}</span>
                        </h3>
                        <div className="text-3xl font-black text-primary italic mb-4">
                          ₹{vehicle.basePrice.toLocaleString()}<span className="text-xs text-white/40 font-normal not-italic">/mo</span>
                        </div>
                        <Link href={`/vehicles/${vehicle.id}`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-white/80 transition-colors">
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comparison Table */}
                <div className="space-y-2">
                  {attributes.map((attr, idx) => {
                    const value1 = (selectedVehicle1 as any)[attr.key];
                    const value2 = (selectedVehicle2 as any)[attr.key];
                    const displayValue1 = attr.format 
                      ? attr.format(value1)
                      : (value1 || "—");
                    const displayValue2 = attr.format 
                      ? attr.format(value2)
                      : (value2 || "—");
                    
                    return (
                      <div key={idx} className="grid grid-cols-3 gap-8 items-center">
                        <div className="bg-white/5 p-6 rounded-xl border border-white/5">
                          <span className="text-sm font-bold uppercase tracking-widest text-white/40">{attr.label}</span>
                        </div>
                        <div className="p-6 text-center border border-white/5 rounded-xl">
                          <span className={`text-lg font-bold ${
                            (value1 && value2 && (typeof value1 === 'number' && typeof value2 === 'number' && value1 > value2)) ||
                            (value1 && !value2)
                              ? 'text-primary' 
                              : 'text-white/80'
                          }`}>{displayValue1}</span>
                        </div>
                        <div className="p-6 text-center border border-white/5 rounded-xl">
                          <span className={`text-lg font-bold ${
                            (value1 && value2 && (typeof value1 === 'number' && typeof value2 === 'number' && value2 > value1)) ||
                            (value2 && !value1)
                              ? 'text-primary' 
                              : 'text-white/80'
                          }`}>{displayValue2}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}
