"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Filter, X, Check, ArrowUpDown } from "lucide-react";
import { isCargo as isCargoCategory, CHARGER_TYPE_DISPLAY, CHARGER_TYPES, type VehicleCategory, type ChargerType } from "@/lib/constants";
import DualRangeSlider from "./DualRangeSlider";

interface FilterOptions {
  makes: string[];
  chargerTypes: ChargerType[];
  maxRange: number;
  maxRealWorldRange: number;
  maxSpeed: number;
  maxPayload: number;
  maxVolume: number;
}

interface VehicleFilterSidebarProps {
  options: FilterOptions;
  category: VehicleCategory;
  section: 'leasing' | 'buying' | 'rent';
}

const SORT_LABEL: Record<VehicleFilterSidebarProps['section'], { asc: string; desc: string }> = {
  leasing: { asc: 'Monthly Price: Low → High', desc: 'Monthly Price: High → Low' },
  buying:  { asc: 'Price: Low → High',         desc: 'Price: High → Low' },
  rent:    { asc: 'Daily Rate: Low → High',     desc: 'Daily Rate: High → Low' },
};

export default function VehicleFilterSidebar({ options, category, section }: VehicleFilterSidebarProps) {
  const isCargo = isCargoCategory(category);
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [makes, setMakes]             = useState<string[]>(sp.get("makes")?.split(",").filter(Boolean) ?? []);
  const [chargerType, setChargerType] = useState(sp.get("chargerType") ?? "");
  const [sortBy, setSortBy]           = useState(sp.get("sortBy") ?? "");

  const [minRange, setMinRange] = useState(Number(sp.get("minRange")) || 0);
  const [maxRange, setMaxRange] = useState(sp.has("maxRange") ? Number(sp.get("maxRange")) : options.maxRange);

  const [minRWR, setMinRWR] = useState(Number(sp.get("minRealWorldRange")) || 0);
  const [maxRWR, setMaxRWR] = useState(sp.has("maxRealWorldRange") ? Number(sp.get("maxRealWorldRange")) : options.maxRealWorldRange);

  const [minSpeed, setMinSpeed] = useState(Number(sp.get("minSpeed")) || 0);
  const [maxSpeed, setMaxSpeed] = useState(sp.has("maxSpeed") ? Number(sp.get("maxSpeed")) : options.maxSpeed);

  const [minPayload, setMinPayload] = useState(Number(sp.get("minPayload")) || 0);
  const [maxPayload, setMaxPayload] = useState(sp.has("maxPayload") ? Number(sp.get("maxPayload")) : options.maxPayload);

  const [minVolume, setMinVolume] = useState(Number(sp.get("minVolume")) || 0);
  const [maxVolume, setMaxVolume] = useState(sp.has("maxVolume") ? Number(sp.get("maxVolume")) : options.maxVolume);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMakes(sp.get("makes")?.split(",").filter(Boolean) ?? []);
    setChargerType(sp.get("chargerType") ?? "");
    setSortBy(sp.get("sortBy") ?? "");
    setMinRange(Number(sp.get("minRange")) || 0);
    setMaxRange(sp.has("maxRange") ? Number(sp.get("maxRange")) : options.maxRange);
    setMinRWR(Number(sp.get("minRealWorldRange")) || 0);
    setMaxRWR(sp.has("maxRealWorldRange") ? Number(sp.get("maxRealWorldRange")) : options.maxRealWorldRange);
    setMinSpeed(Number(sp.get("minSpeed")) || 0);
    setMaxSpeed(sp.has("maxSpeed") ? Number(sp.get("maxSpeed")) : options.maxSpeed);
    setMinPayload(Number(sp.get("minPayload")) || 0);
    setMaxPayload(sp.has("maxPayload") ? Number(sp.get("maxPayload")) : options.maxPayload);
    setMinVolume(Number(sp.get("minVolume")) || 0);
    setMaxVolume(sp.has("maxVolume") ? Number(sp.get("maxVolume")) : options.maxVolume);
  }, [sp, options]);

  const applyFilters = () => {
    const params = new URLSearchParams();

    if (makes.length > 0) params.set("makes", makes.join(","));
    if (chargerType) params.set("chargerType", chargerType);
    if (sortBy) params.set("sortBy", sortBy);

    if (minRange > 0 || maxRange < options.maxRange) {
      params.set("minRange", String(minRange));
      params.set("maxRange", String(maxRange));
    }
    if (minRWR > 0 || maxRWR < options.maxRealWorldRange) {
      params.set("minRealWorldRange", String(minRWR));
      params.set("maxRealWorldRange", String(maxRWR));
    }
    if (minSpeed > 0 || maxSpeed < options.maxSpeed) {
      params.set("minSpeed", String(minSpeed));
      params.set("maxSpeed", String(maxSpeed));
    }
    if (isCargo) {
      if (minPayload > 0 || maxPayload < options.maxPayload) {
        params.set("minPayload", String(minPayload));
        params.set("maxPayload", String(maxPayload));
      }
      if (minVolume > 0 || maxVolume < options.maxVolume) {
        params.set("minVolume", String(minVolume));
        params.set("maxVolume", String(maxVolume));
      }
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setIsOpen(false);
  };

  const clearFilters = () => {
    setMakes([]); setChargerType(""); setSortBy("");
    setMinRange(0); setMaxRange(options.maxRange);
    setMinRWR(0); setMaxRWR(options.maxRealWorldRange);
    setMinSpeed(0); setMaxSpeed(options.maxSpeed);
    setMinPayload(0); setMaxPayload(options.maxPayload);
    setMinVolume(0); setMaxVolume(options.maxVolume);
    router.push(pathname, { scroll: false });
    setIsOpen(false);
  };

  const hasActiveFilters =
    makes.length > 0 || chargerType !== "" || sortBy !== "" ||
    minRange > 0 || maxRange < options.maxRange ||
    minRWR > 0 || maxRWR < options.maxRealWorldRange ||
    minSpeed > 0 || maxSpeed < options.maxSpeed ||
    minPayload > 0 || maxPayload < options.maxPayload ||
    minVolume > 0 || maxVolume < options.maxVolume;

  const selectCls = "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer";

  const filterContent = (
    <div className="space-y-8 lg:sticky lg:top-32 pb-32 lg:pb-4">

      {hasActiveFilters && (
        <div className="flex justify-between items-center pb-4 border-b border-white/10">
          <span className="text-sm text-white/50">Filters Applied</span>
          <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline">Clear All</button>
        </div>
      )}

      {/* Sort */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-3 flex items-center gap-2">
          <ArrowUpDown className="w-3.5 h-3.5" /> Sort By
        </h3>
        <div className="relative">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={selectCls}>
            <option value="">Default</option>
            <option value="price_asc">{SORT_LABEL[section].asc}</option>
            <option value="price_desc">{SORT_LABEL[section].desc}</option>
          </select>
        </div>
      </div>

      {/* Brands */}
      {options.makes.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Brands</h3>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
            {options.makes.map((make) => (
              <label key={make} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/20 bg-white/5 group-hover:border-primary transition-colors shrink-0">
                  <input
                    type="checkbox"
                    className="opacity-0 absolute inset-0 cursor-pointer"
                    checked={makes.includes(make)}
                    onChange={() => setMakes(prev => prev.includes(make) ? prev.filter(m => m !== make) : [...prev, make])}
                  />
                  {makes.includes(make) && <div className="w-2.5 h-2.5 rounded-sm bg-primary" />}
                </div>
                <span className={`text-sm transition-colors ${makes.includes(make) ? "text-white font-medium" : "text-white/60 group-hover:text-white/90"}`}>
                  {make}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Charging Type */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-3">Charging Type</h3>
        <div className="relative">
          <select value={chargerType} onChange={(e) => setChargerType(e.target.value)} className={selectCls}>
            <option value="">All Types</option>
            {CHARGER_TYPES.map((type) => (
              <option key={type} value={type}>{CHARGER_TYPE_DISPLAY[type]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Certified Range */}
      <div className="pb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Certified Range (km)</h3>
        <DualRangeSlider
          min={0} max={options.maxRange} step={1}
          initialMin={minRange} initialMax={maxRange}
          onChangeComplete={(min, max) => { setMinRange(min); setMaxRange(max); }}
          formatLabel={(v) => `${v} km`}
        />
      </div>

      {/* Real World Range */}
      <div className="pb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Real World Range (km)</h3>
        <DualRangeSlider
          min={0} max={options.maxRealWorldRange} step={1}
          initialMin={minRWR} initialMax={maxRWR}
          onChangeComplete={(min, max) => { setMinRWR(min); setMaxRWR(max); }}
          formatLabel={(v) => `${v} km`}
        />
      </div>

      {/* Top Speed */}
      <div className="pb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Top Speed (km/h)</h3>
        <DualRangeSlider
          min={0} max={options.maxSpeed} step={1}
          initialMin={minSpeed} initialMax={maxSpeed}
          onChangeComplete={(min, max) => { setMinSpeed(min); setMaxSpeed(max); }}
          formatLabel={(v) => `${v} km/h`}
        />
      </div>

      {/* Payload — cargo only */}
      {isCargo && (
        <div className="pb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Payload Capacity (kg)</h3>
          <DualRangeSlider
            min={0} max={options.maxPayload} step={1}
            initialMin={minPayload} initialMax={maxPayload}
            onChangeComplete={(min, max) => { setMinPayload(min); setMaxPayload(max); }}
            formatLabel={(v) => `${v} kg`}
          />
        </div>
      )}

      {/* Cargo Volume — cargo only */}
      {isCargo && (
        <div className="pb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Cargo Volume (L)</h3>
          <DualRangeSlider
            min={0} max={options.maxVolume} step={1}
            initialMin={minVolume} initialMax={maxVolume}
            onChangeComplete={(min, max) => { setMinVolume(min); setMaxVolume(max); }}
            formatLabel={(v) => `${v} L`}
          />
        </div>
      )}

      <div className="mt-8">
        <button
          onClick={applyFilters}
          className="w-full flex items-center justify-center gap-2 bg-primary text-background font-extrabold py-3.5 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)]"
        >
          <Check className="w-5 h-5" />
          Apply Filters
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden w-full mb-6 flex items-center justify-center gap-2 glass-card py-3 px-4 border-white/10 hover:border-primary/50 transition-colors"
      >
        <Filter className="w-5 h-5 text-primary" />
        <span className="font-bold text-sm">Filters</span>
        {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary ml-1" />}
      </button>

      {/* Desktop */}
      <div className="hidden lg:block">{filterContent}</div>

      {/* Mobile drawer */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/80 lg:hidden" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md p-6 overflow-y-auto lg:hidden">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            {filterContent}
          </div>
        </>
      )}
    </>
  );
}
