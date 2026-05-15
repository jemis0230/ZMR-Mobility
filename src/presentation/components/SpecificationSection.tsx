'use client';

import { useState } from "react";
import { 
  Battery, 
  Settings2, 
  Package, 
  Maximize,
} from "lucide-react";
import { Vehicle } from "@/domain/entities/Vehicle";
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
        { label: "Kerb Weight", value: `${vehicle.kerbWeight} kg` },
        { label: "Gross Vehicle Weight", value: vehicle.gvW ? `${vehicle.gvW} kg` : null },
        { label: "Overall Length", value: `${vehicle.length} mm` },
        { label: "Overall Width", value: `${vehicle.width} mm` },
        { label: "Overall Height", value: `${vehicle.height} mm` },
        { label: "Ground Clearance", value: `${vehicle.groundClearance} mm` },
        { label: "Wheelbase", value: `${vehicle.wheelbase} mm` },
      ].filter(item => item.value !== null) as { label: string; value: string }[]
    },
    {
      title: "Drivetrain",
      icon: Settings2,
      items: [
        { label: "Motor Type", value: vehicle.motorType },
        { label: "Peak Power", value: vehicle.peakPower },
        { label: "Peak Torque", value: vehicle.peakTorque },
        { label: "Transmission", value: vehicle.transmission },
        { label: "Max Gradability", value: vehicle.gradability ? `${vehicle.gradability}%` : null },
      ].filter(item => item.value !== null) as { label: string; value: string }[]
    },
    {
      title: "Charging",
      icon: Battery,
      items: [
        { label: "Battery Type", value: vehicle.batteryType },
        { label: "Peak Voltage", value: vehicle.peakVoltage ? `${vehicle.peakVoltage} V` : null },
        { label: "Battery Capacity", value: `${vehicle.batteryCap} kWh` },
        { label: "Certified Range", value: `${vehicle.range} KM` },
        { label: "True Range", value: vehicle.trueRange ? `${vehicle.trueRange} KM` : null },
        { label: "Charging Time", value: vehicle.chargingTime },
        { label: "Fast Charging", value: vehicle.fastChargingTime || null },
        { label: "Charger Type", value: vehicle.chargerType },
        { label: "On-board Charger", value: vehicle.onBoardCharger ? "Yes" : "No" },
      ].filter(item => item.value !== null) as { label: string; value: string }[]
    }
  ];

  if (vehicle.category.includes('Cargo')) {
    sections.push({
      title: "Cargo",
      icon: Package,
      items: [
        { label: "Payload Capacity", value: `${vehicle.payload} kg` },
        { label: "Cargo Volume", value: `${vehicle.volume} ft³` },
        { label: "Container Dims", value: vehicle.containerDims || "N/A" },
      ]
    });
  }

  return (
    <div className="mt-16 space-y-8">
      {/* Tab Triggers */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-1">
        {sections.map((section, idx) => (
          <button
            key={section.title}
            onClick={() => setActiveTab(idx)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === idx ? 'text-primary' : 'text-white/40 hover:text-white/60'
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.title}
            {activeTab === idx && (
              <motion.div 
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-1 bg-primary shadow-[0_0_15px_rgba(0,209,255,0.5)]"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="glass-card p-8 md:p-12 border-white/5"
          >
            <div className="grid md:grid-cols-2 gap-x-20 gap-y-6">
              {sections[activeTab].items.map((item) => (
                <div key={item.label} className="flex justify-between items-center py-4 border-b border-white/5 group hover:border-white/10 transition-colors">
                  <span className="text-white/40 font-medium group-hover:text-white/60 transition-colors">{item.label}</span>
                  <span className="text-white/80 font-bold tracking-tight">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

