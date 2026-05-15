"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Filter, X, Check } from "lucide-react";
import DualRangeSlider from "./DualRangeSlider";

interface FilterOptions {
  makes: string[];
  chargerTypes: string[];
  maxRange: number;
  maxPayload: number;
  maxVolume: number;
}

interface VehicleFilterSidebarProps {
  options: FilterOptions;
}

const ALLOWED_CHARGER_TYPES = ["Normal Charging", "Fast Charging"];

export default function VehicleFilterSidebar({ options }: VehicleFilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for UI
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [makes, setMakes] = useState<string[]>(searchParams.get("makes")?.split(",") || []);
  const [chargerTypes, setChargerTypes] = useState<string[]>(searchParams.get("chargerTypes")?.split(",") || []);
  
  const [minRange, setMinRange] = useState(Number(searchParams.get("minRange")) || 0);
  const [maxRange, setMaxRange] = useState(searchParams.has("maxRange") ? Number(searchParams.get("maxRange")) : options.maxRange);
  
  const [minPayload, setMinPayload] = useState(Number(searchParams.get("minPayload")) || 0);
  const [maxPayload, setMaxPayload] = useState(searchParams.has("maxPayload") ? Number(searchParams.get("maxPayload")) : options.maxPayload);
  
  const [minVolume, setMinVolume] = useState(Number(searchParams.get("minVolume")) || 0);
  const [maxVolume, setMaxVolume] = useState(searchParams.has("maxVolume") ? Number(searchParams.get("maxVolume")) : options.maxVolume);
  
  const [isOpen, setIsOpen] = useState(false);

  // Sync state if URL changes from outside (e.g., clear filters or pagination)
  useEffect(() => {
    setSearch(searchParams.get("q") || "");
    setMakes(searchParams.get("makes")?.split(",") || []);
    setChargerTypes(searchParams.get("chargerTypes")?.split(",") || []);
    setMinRange(Number(searchParams.get("minRange")) || 0);
    setMaxRange(searchParams.has("maxRange") ? Number(searchParams.get("maxRange")) : options.maxRange);
    setMinPayload(Number(searchParams.get("minPayload")) || 0);
    setMaxPayload(searchParams.has("maxPayload") ? Number(searchParams.get("maxPayload")) : options.maxPayload);
    setMinVolume(Number(searchParams.get("minVolume")) || 0);
    setMaxVolume(searchParams.has("maxVolume") ? Number(searchParams.get("maxVolume")) : options.maxVolume);
  }, [searchParams, options]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (search) params.set("q", search);
    if (makes.length > 0) params.set("makes", makes.join(","));
    if (chargerTypes.length > 0) params.set("chargerTypes", chargerTypes.join(","));
    
    // Explicitly send both min and max if range is adjusted
    if (minRange > 0 || maxRange < options.maxRange) {
      params.set("minRange", minRange.toString());
      params.set("maxRange", maxRange.toString());
    }
    
    if (minPayload > 0 || maxPayload < options.maxPayload) {
      params.set("minPayload", minPayload.toString());
      params.set("maxPayload", maxPayload.toString());
    }

    if (minVolume > 0 || maxVolume < options.maxVolume) {
      params.set("minVolume", minVolume.toString());
      params.set("maxVolume", maxVolume.toString());
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setIsOpen(false);
  };

  const toggleMake = (make: string) => {
    setMakes(prev => prev.includes(make) ? prev.filter(m => m !== make) : [...prev, make]);
  };

  const toggleChargerType = (type: string) => {
    setChargerTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  };

  const clearFilters = () => {
    setSearch("");
    setMakes([]);
    setChargerTypes([]);
    setMinRange(0);
    setMaxRange(options.maxRange);
    setMinPayload(0);
    setMaxPayload(options.maxPayload);
    setMinVolume(0);
    setMaxVolume(options.maxVolume);
    router.push(pathname, { scroll: false });
    setIsOpen(false);
  };

  const hasActiveFilters = 
    search || 
    makes.length > 0 || 
    chargerTypes.length > 0 || 
    minRange > 0 || 
    maxRange < options.maxRange || 
    minPayload > 0 || 
    maxPayload < options.maxPayload || 
    minVolume > 0 || 
    maxVolume < options.maxVolume;

  const availableChargerTypes = ALLOWED_CHARGER_TYPES.filter(type => options.chargerTypes.includes(type));

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="lg:hidden w-full mb-6 flex items-center justify-center gap-2 glass-card py-3 px-4 border-white/10 hover:border-primary/50 transition-colors"
      >
        <Filter className="w-5 h-5 text-primary" />
        <span className="font-bold text-sm">Filters & Search</span>
      </button>

      {/* Sidebar Content */}
      <div className={`
        fixed inset-0 z-50 bg-background/95 backdrop-blur-md p-6 overflow-y-auto transition-transform duration-300 lg:translate-x-0 lg:static lg:bg-transparent lg:p-0 lg:block lg:z-auto lg:overflow-visible flex flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <h2 className="text-xl font-bold">Filters</h2>
          <button onClick={() => setIsOpen(false)} className="p-2 bg-white/5 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-8 lg:sticky lg:top-32 pb-32 lg:pb-4">
          {hasActiveFilters && (
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-sm text-white/50">Filters Applied</span>
              <button onClick={clearFilters} className="text-xs font-bold text-primary hover:underline">Clear All</button>
            </div>
          )}

          {/* Search */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Search</h3>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-white/40" />
              </div>
              <input
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-colors"
              />
            </div>
          </div>

          {/* Brands */}
          {options.makes.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Brands</h3>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {options.makes.map((make) => (
                  <label key={make} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/20 bg-white/5 group-hover:border-primary transition-colors">
                      <input 
                        type="checkbox" 
                        className="opacity-0 absolute inset-0 cursor-pointer"
                        checked={makes.includes(make)}
                        onChange={() => toggleMake(make)}
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

          {/* Charging Types */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-4">Charging Type</h3>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {ALLOWED_CHARGER_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded border border-white/20 bg-white/5 group-hover:border-primary transition-colors">
                    <input 
                      type="checkbox" 
                      className="opacity-0 absolute inset-0 cursor-pointer"
                      checked={chargerTypes.includes(type)}
                      onChange={() => toggleChargerType(type)}
                    />
                    {chargerTypes.includes(type) && <div className="w-2.5 h-2.5 rounded-sm bg-primary" />}
                  </div>
                  <span className={`text-sm transition-colors ${chargerTypes.includes(type) ? "text-white font-medium" : "text-white/60 group-hover:text-white/90"}`}>
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Range Dual Slider */}
          {options.maxRange > 0 && (
            <div className="pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Range (km)</h3>
              <DualRangeSlider
                min={0}
                max={options.maxRange}
                step={1}
                initialMin={minRange}
                initialMax={maxRange}
                onChangeComplete={(min, max) => {
                  setMinRange(min);
                  setMaxRange(max);
                }}
                formatLabel={(v) => `${v} km`}
              />
            </div>
          )}

          {/* Payload Dual Slider */}
          {options.maxPayload > 0 && (
            <div className="pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Payload (kg)</h3>
              <DualRangeSlider
                min={0}
                max={options.maxPayload}
                step={1}
                initialMin={minPayload}
                initialMax={maxPayload}
                onChangeComplete={(min, max) => {
                  setMinPayload(min);
                  setMaxPayload(max);
                }}
                formatLabel={(v) => `${v} kg`}
              />
            </div>
          )}

          {/* Volume Dual Slider */}
          {options.maxVolume > 0 && (
            <div className="pb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Cargo Volume (ft³)</h3>
              <DualRangeSlider
                min={0}
                max={options.maxVolume}
                step={0.1}
                initialMin={minVolume}
                initialMax={maxVolume}
                onChangeComplete={(min, max) => {
                  setMinVolume(min);
                  setMaxVolume(max);
                }}
                formatLabel={(v) => `${v} ft³`}
              />
            </div>
          )}

          {/* Apply Button */}
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
      </div>
      
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
