'use client';

import Link from "next/link";
import { Vehicle } from "@/domain/entities/Vehicle";
import { BuyingVehicle } from "@/domain/entities/BuyingVehicle";
import { Battery, Zap, Gauge, ArrowRight, Clock, Package } from "lucide-react";
import EVImage from "@/presentation/components/EVImage";
import { motion } from "framer-motion";

type AnyVehicle = Vehicle | BuyingVehicle;

interface VehicleCardProps {
  vehicle: AnyVehicle;
  mode?: 'leasing' | 'buying';
}

export default function VehicleCard({ vehicle, mode = 'leasing' }: VehicleCardProps) {
  const getCardSpecs = () => {
    switch (vehicle.category) {
      case "2 Wheeler":
        return [
          { label: "Range", value: `${vehicle.range} KM`, icon: Gauge, color: "text-primary" },
          { label: "Charging", value: vehicle.chargingTime, icon: Clock, color: "text-accent" },
          { label: "Battery", value: `${vehicle.batteryCap} kWh`, icon: Battery, color: "text-blue-400" },
        ];
      case "3 Wheeler (Cargo)":
      case "4 Wheeler (Cargo)":
        return [
          { label: "Payload", value: `${vehicle.payload || 0} KG`, icon: Package, color: "text-orange-400" },
          { label: "Range", value: `${vehicle.category.includes('4') ? vehicle.trueRange || vehicle.range : vehicle.range} KM`, icon: Gauge, color: "text-primary" },
          { label: "Charging", value: vehicle.category.includes('4') ? vehicle.fastChargingTime || vehicle.chargingTime : vehicle.chargingTime, icon: Zap, color: "text-accent" },
        ];
      case "3 Wheeler (Passenger)":
      case "4 Wheeler (Passenger)":
        return [
          { label: "Range", value: `${vehicle.range} KM`, icon: Gauge, color: "text-primary" },
          { label: "Charging", value: vehicle.category.includes('4') ? vehicle.fastChargingTime || vehicle.chargingTime : vehicle.chargingTime, icon: Zap, color: "text-accent" },
          { label: "Battery", value: `${vehicle.batteryCap} kWh`, icon: Battery, color: "text-blue-400" },
        ];
      default:
        return [
          { label: "Range", value: `${vehicle.range} KM`, icon: Gauge, color: "text-primary" },
          { label: "Speed", value: `${vehicle.topSpeed} KM/H`, icon: Zap, color: "text-accent" },
          { label: "Battery", value: `${vehicle.batteryCap} kWh`, icon: Battery, color: "text-blue-400" },
        ];
    }
  };

  const cardSpecs = getCardSpecs();

  const detailHref = mode === 'buying'
    ? `/buying/vehicles/detail/${vehicle.id}`
    : `/vehicles/${vehicle.id}`;

  const price = mode === 'buying'
    ? `₹${'buyingPrice' in vehicle ? (vehicle as BuyingVehicle).buyingPrice.toLocaleString() : '0'}`
    : `₹${'basePrice' in vehicle ? (vehicle as Vehicle).basePrice.toLocaleString() : '0'}/month`;

  const ctaLabel = mode === 'buying' ? 'View Details' : 'View Lease Plans';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
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
            <Zap className="w-12 h-12 text-[#00FF85]/10" />
          </div>
        )}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm border border-white/10 text-[10px] font-bold tracking-widest uppercase">
          {vehicle.category}
        </div>
      </Link>

      <div className="p-6 space-y-6 flex-1 flex flex-col">
        <div className="flex-1">
          <Link href={detailHref}>
            <h3 className="text-xl font-bold tracking-tight hover:text-primary transition-colors">{vehicle.make} {vehicle.model}</h3>
          </Link>
          <p className="text-white/40 text-sm italic">
            {mode === 'buying' ? 'Buy from ' : 'Starting from '}{price}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {cardSpecs.map((spec, idx) => (
            <div key={idx} className="bg-white/5 rounded-lg p-2 text-center">
              <spec.icon className={`w-4 h-4 mx-auto mb-1 ${spec.color}`} />
              <p className="text-[10px] text-white/40 uppercase tracking-tighter">{spec.label}</p>
              <p className="text-xs font-bold truncate">{spec.value}</p>
            </div>
          ))}
        </div>

        <Link
          href={detailHref}
          className="w-full py-3 rounded-xl bg-white/5 border border-white/10 font-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-background transition-all group/btn"
        >
          {ctaLabel}
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}


