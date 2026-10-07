'use client';

import { useState } from "react";
import { Battery, Settings2, Package, Maximize } from "lucide-react";
import { Vehicle } from "@/domain/entities/Vehicle";
import { isCargo, CHARGER_TYPE_DISPLAY, TRANSMISSION_DISPLAY } from "@/lib/constants";
import { formatMinutes } from "@/lib/formatTime";

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
      <div role="tablist" aria-label="Specifications" className="flex flex-wrap gap-2 border-b border-ink/10 pb-1">
        {sections.map((section, idx) => (
          <button
            key={section.title}
            type="button"
            role="tab"
            aria-selected={activeTab === idx}
            onClick={() => setActiveTab(idx)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
              activeTab === idx ? 'text-primary-dark' : 'text-ink/70 hover:text-forest'
            }`}
          >
            <section.icon className="w-4 h-4" />
            {section.title}
            {activeTab === idx && <span aria-hidden className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t" />}
          </button>
        ))}
      </div>

      <div className="min-h-[200px]">
        <div key={activeTab} role="tabpanel" className="glass-card p-8 md:p-12 animate-[fadeIn_.2s_ease]">
          {sections[activeTab].items.length === 0 ? (
            <p className="text-ink/75 text-center">Not provided for this vehicle yet — contact us for details.</p>
          ) : (
            <dl className="grid md:grid-cols-2 gap-x-20 gap-y-2">
              {sections[activeTab].items.map((item) => (
                <div key={item.label} className="flex justify-between items-center gap-4 py-4 border-b border-ink/10">
                  <dt className="text-ink/75 font-medium">{item.label}</dt>
                  <dd className="text-forest font-bold tracking-tight text-right">{item.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
