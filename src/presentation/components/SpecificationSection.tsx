'use client';

import { useState } from "react";
import { Battery, Settings2, Package, Maximize } from "lucide-react";
import { Vehicle } from "@/domain/entities/Vehicle";
import { isCargo, CHARGER_TYPE_DISPLAY, TRANSMISSION_DISPLAY } from "@/lib/constants";
import { formatMinutes } from "@/lib/formatTime";
import { motion, AnimatePresence } from "framer-motion";

interface SpecsProps {
  vehicle: Vehicle;
}

export default function SpecificationSection({ vehicle }: SpecsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const sections = [
    {
      title: "Dimensions",
      icon: Maximize,
      items: [
        { label: "Curb Weight", value: vehicle.curbWeightKg ? `${vehicle.curbWeightKg} kg` : null },
        { label: "Gross Vehicle Weight", value: vehicle.grossWeightKg ? `${vehicle.grossWeightKg} kg` : null },
        { label: "Overall Length", value: vehicle.lengthMm ? `${vehicle.lengthMm} mm` : null },
        { label: "Overall Width", value: vehicle.widthMm ? `${vehicle.widthMm} mm` : null },
        { label: "Overall Height", value: vehicle.heightMm ? `${vehicle.heightMm} mm` : null },
        { label: "Ground Clearance", value: vehicle.groundClearanceMm ? `${vehicle.groundClearanceMm} mm` : null },
        { label: "Wheelbase", value: vehicle.wheelbaseMm ? `${vehicle.wheelbaseMm} mm` : null },
      ].filter((item): item is { label: string; value: string } => item.value !== null),
    },
    {
      title: "Drivetrain",
      icon: Settings2,
      items: [
        { label: "Motor Type", value: vehicle.motorType?.name ?? null },
        { label: "Peak Power", value: vehicle.peakPowerKw != null ? `${vehicle.peakPowerKw} kW` : null },
        { label: "Peak Torque", value: vehicle.peakTorqueNm != null ? `${vehicle.peakTorqueNm} Nm` : null },
        { label: "Transmission", value: TRANSMISSION_DISPLAY[vehicle.transmission] ?? vehicle.transmission },
        { label: "Max Gradability", value: vehicle.gradabilityPct != null ? `${vehicle.gradabilityPct}%` : null },
      ].filter((item): item is { label: string; value: string } => item.value !== null && item.value !== ''),
    },
    {
      title: "Battery & Charging",
      icon: Battery,
      items: [
        { label: "Battery Capacity", value: `${vehicle.batteryCapKwh} kWh` },
        { label: "Battery Type", value: vehicle.batteryType?.name ?? null },
        { label: "Peak Voltage", value: vehicle.peakVoltageV ? `${vehicle.peakVoltageV} V` : null },
        { label: "Certified Range", value: `${vehicle.certifiedRangeKm} km` },
        { label: "Real-World Range", value: vehicle.realWorldRangeKm ? `${vehicle.realWorldRangeKm} km` : null },
        { label: "Charging Time", value: vehicle.chargingTimeMinutes ? formatMinutes(vehicle.chargingTimeMinutes) : null },
        { label: "Charger Type", value: CHARGER_TYPE_DISPLAY[vehicle.chargerType] ?? vehicle.chargerType },
        { label: "On-board Charger", value: vehicle.hasOnBoardCharger ? "Yes" : "No" },
      ].filter((item): item is { label: string; value: string } => item.value !== null && item.value !== ''),
    },
  ];

  if (isCargo(vehicle.category)) {
    sections.push({
      title: "Cargo",
      icon: Package,
      items: [
        { label: "Payload Capacity", value: vehicle.payloadKg ? `${vehicle.payloadKg} kg` : null },
        { label: "Cargo Volume", value: vehicle.cargoVolumeL ? `${vehicle.cargoVolumeL} L` : null },
        { label: "Container Dimensions", value: vehicle.containerDimensions ?? null },
      ].filter((item): item is { label: string; value: string } => item.value !== null),
    });
  }

  return (
    <div className="mt-16 space-y-8">
      <div className="flex flex-wrap gap-2 border-b border-ink/[0.08] pb-1">
        {sections.map((section, idx) => (
          <button
            key={section.title}
            onClick={() => setActiveTab(idx)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === idx ? 'text-primary' : 'text-ink/60 hover:text-ink/70'
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.title}
            {activeTab === idx && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-primary shadow-[0_0_15px_rgba(26,115,232,0.5)]"
              />
            )}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="glass-card p-8 md:p-12 border-ink/[0.08]"
          >
            <div className="grid md:grid-cols-2 gap-x-20 gap-y-6">
              {sections[activeTab].items.map((item) => (
                <div key={item.label} className="flex justify-between items-center py-4 border-b border-ink/[0.08] group hover:border-ink/10 transition-colors">
                  <span className="text-ink/60 font-medium group-hover:text-ink/70 transition-colors">{item.label}</span>
                  <span className="text-ink/85 font-bold tracking-tight">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
