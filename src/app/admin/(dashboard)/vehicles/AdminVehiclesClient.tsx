'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Vehicle } from '@/domain/entities/Vehicle';
import { VEHICLE_CATEGORIES, CATEGORY_DISPLAY } from '@/lib/constants';
import { Car, AlertTriangle, Edit, Trash2, Filter, Tag, Plus } from 'lucide-react';
import { api } from '@/lib/api-client';
import { PRICE_CAP } from '@/lib/explore';

interface AdminVehiclesClientProps {
  initialVehicles: Vehicle[];
  dbError: boolean;
}

const CATEGORIES = ['All', ...VEHICLE_CATEGORIES];
type SectionFilter = 'All' | 'Leasing' | 'Buying' | 'Rent';
const SECTIONS: SectionFilter[] = ['All', 'Leasing', 'Buying', 'Rent'];

export default function AdminVehiclesClient({ initialVehicles, dbError }: AdminVehiclesClientProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSection, setSelectedSection] = useState<SectionFilter>('All');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredVehicles = vehicles
    .filter((v) => selectedCategory === 'All' || v.category === selectedCategory)
    .filter((v) => {
      if (selectedSection === 'Leasing') return v.showInLeasing;
      if (selectedSection === 'Buying') return v.showInBuying;
      if (selectedSection === 'Rent') return v.showInRent;
      return true;
    });

  const getPriceDisplay = (v: Vehicle) => {
    if (selectedSection === 'Buying' && v.buyingPrice) return `₹${v.buyingPrice.toLocaleString('en-IN')}`;
    if (selectedSection === 'Rent') {
      const plan = v.rentPlans.filter((p) => p.isActive).sort((a, b) => a.pricePerDayRs - b.pricePerDayRs)[0];
      if (plan) return `₹${plan.pricePerDayRs.toLocaleString('en-IN')}/day`;
    }
    const lease = v.leasePlans.filter((p) => p.isActive).sort((a, b) => a.monthlyPriceRs - b.monthlyPriceRs)[0];
    if (lease) return `₹${lease.monthlyPriceRs.toLocaleString('en-IN')}/mo`;
    if (v.buyingPrice) return `₹${v.buyingPrice.toLocaleString('en-IN')}`;
    return '—';
  };

  const getSectionBadges = (v: Vehicle) => {
    const badges = [];
    if (v.showInLeasing) badges.push({ label: 'Lease', color: 'bg-primary/20 text-primary border-primary/30' });
    if (v.showInBuying) badges.push({ label: 'Buy', color: 'bg-lime/40 text-forest border-lime' });
    if (v.showInRent) badges.push({ label: 'Rent', color: 'bg-amber-100 text-amber-900 border-amber-300' });
    return badges;
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this vehicle? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.del(`/vehicles/${id}`);
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch {
      alert('Failed to delete vehicle. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Car className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vehicle Management</h1>
            <p className="text-ink/60 text-sm">Manage your unified electric vehicle catalog.</p>
          </div>
        </div>
        <Link
          href="/admin/vehicles/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all electric-glow"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <Tag className="w-4 h-4 text-ink/60" />
            <span className="text-ink/60 text-sm font-bold uppercase tracking-widest">Section:</span>
          </div>
          {SECTIONS.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                selectedSection === sec
                  ? 'bg-primary border-primary text-white'
                  : 'bg-transparent border-ink/10 text-ink/60 hover:border-ink/15 hover:text-ink/70'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <Filter className="w-4 h-4 text-ink/60" />
            <span className="text-ink/60 text-sm font-bold uppercase tracking-widest">Category:</span>
          </div>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                selectedCategory === cat
                  ? 'bg-ink/10 border-ink/25 text-ink'
                  : 'bg-transparent border-ink/10 text-ink/60 hover:border-ink/15 hover:text-ink/70'
              }`}
            >
              {cat === 'All' ? cat : CATEGORY_DISPLAY[cat as keyof typeof CATEGORY_DISPLAY] ?? cat}
            </button>
          ))}
        </div>
      </div>

      {/* DB error */}
      {dbError && (
        <div className="glass-card p-6 border-red-500/20 bg-red-500/5 flex items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <div>
            <p className="text-red-500 font-bold">Database Connection Error</p>
            <p className="text-ink/60 text-sm">Please update your DATABASE_URL in the .env file.</p>
          </div>
        </div>
      )}

      {/* Vehicles above the selling-price cap need a price review */}
      {(() => {
        const overCap = vehicles.filter((v) => v.showInBuying && v.buyingPrice != null && v.buyingPrice > PRICE_CAP);
        if (overCap.length === 0) return null;
        return (
          <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-bold flex items-center gap-2"><AlertTriangle className="w-4 h-4" aria-hidden /> {overCap.length} buying listing{overCap.length === 1 ? ' is' : 's are'} priced above ₹3,00,000</p>
            <p className="mt-1">The website&apos;s price filters stop at ₹3,00,000. These vehicles still appear in listings, but not under any price filter. Please confirm their prices: {overCap.map((v) => `${v.make} ${v.model} (₹${v.buyingPrice!.toLocaleString('en-IN')})`).join(', ')}.</p>
          </div>
        );
      })()}

      {/* Two-wheelers without a Scooter/Bike body type */}
      {(() => {
        const unset = vehicles.filter((v) => v.showInBuying && v.category === 'TWO_WHEELER' && !v.twoWheelerStyle);
        if (unset.length === 0) return null;
        return (
          <div role="status" className="rounded-xl border border-ink/15 bg-tint p-4 text-sm text-forest">
            <p className="font-bold">{unset.length} two-wheeler{unset.length === 1 ? ' has' : 's have'} no body type set</p>
            <p className="mt-1">The website&apos;s Body Type filter offers Scooter and Bike. Until you choose one, these vehicles are listed under Scooter: {unset.map((v) => `${v.make} ${v.model}`).join(', ')}. Edit a vehicle to set &quot;Body Type (Scooter / Bike)&quot;.</p>
          </div>
        );
      })()}

      {/* Count */}
      <p className="text-ink/60 text-sm font-medium">
        {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found
      </p>

      {/* Vehicle grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVehicles.map((v) => {
          const badges = getSectionBadges(v);
          return (
            <div
              key={v.id}
              className="glass-card p-5 flex flex-col gap-4 border-ink/[0.08] group hover:border-primary/20 transition-all"
            >
              {v.mainImage && (
                <div className="relative h-36 bg-ink/5 rounded-lg overflow-hidden">
                  <img
                    src={v.mainImage}
                    alt={`${v.make} ${v.model}`}
                    className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                  />
                  {v.images.length > 0 && (
                    <span className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold">
                      +{v.images.length} Gallery
                    </span>
                  )}
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-base font-bold leading-tight">{v.make} {v.model}</h3>
                <p className="text-xs text-ink/60 mt-0.5">{CATEGORY_DISPLAY[v.category]} · {v.certifiedRangeKm} km</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {badges.map((b) => (
                    <span key={b.label} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.color}`}>{b.label}</span>
                  ))}
                  {badges.length === 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-ink/10 text-ink/40">Not listed</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-ink/[0.08]">
                <span className="text-primary font-bold text-sm">{getPriceDisplay(v)}</span>
                {v.buyingPrice != null && v.buyingPrice > PRICE_CAP && (
                  <span
                    title="Buying price is above ₹3,00,000, the upper limit of the website's price filters. Please confirm the price."
                    className="ml-1 inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-bold"
                  >
                    <AlertTriangle className="w-3 h-3" aria-hidden /> Review price
                  </span>
                )}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/vehicles/${v.id}`}
                    className="flex items-center gap-1 text-xs text-ink/65 hover:text-primary transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(v.id)}
                    disabled={deletingId === v.id}
                    className="flex items-center gap-1 text-xs text-red-500/50 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    {deletingId === v.id ? (
                      <span className="animate-pulse">Deleting…</span>
                    ) : (
                      <>
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {!dbError && filteredVehicles.length === 0 && (
          <div className="col-span-full py-20 text-center glass-card border-dashed border-ink/10">
            <p className="text-ink/40">No vehicles found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
