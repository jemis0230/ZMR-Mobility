'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Vehicle } from '@/domain/entities/Vehicle';
import { VEHICLE_CATEGORIES, CATEGORY_DISPLAY } from '@/lib/constants';
import { Car, AlertTriangle, Edit, Trash2, Filter, Tag, Plus } from 'lucide-react';
import { api } from '@/lib/api-client';

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
    if (v.showInBuying) badges.push({ label: 'Buy', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' });
    if (v.showInRent) badges.push({ label: 'Rent', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' });
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
            <p className="text-white/40 text-sm">Manage your unified electric vehicle catalog.</p>
          </div>
        </div>
        <Link
          href="/admin/vehicles/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-background font-bold rounded-xl hover:bg-primary/90 transition-all electric-glow"
        >
          <Plus className="w-4 h-4" />
          Add Vehicle
        </Link>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <Tag className="w-4 h-4 text-white/40" />
            <span className="text-white/40 text-sm font-bold uppercase tracking-widest">Section:</span>
          </div>
          {SECTIONS.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                selectedSection === sec
                  ? 'bg-primary border-primary text-background'
                  : 'bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 mr-4">
            <Filter className="w-4 h-4 text-white/40" />
            <span className="text-white/40 text-sm font-bold uppercase tracking-widest">Category:</span>
          </div>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                selectedCategory === cat
                  ? 'bg-white/10 border-white/30 text-white'
                  : 'bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
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
            <p className="text-white/40 text-sm">Please update your DATABASE_URL in the .env file.</p>
          </div>
        </div>
      )}

      {/* Count */}
      <p className="text-white/40 text-sm font-medium">
        {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? 's' : ''} found
      </p>

      {/* Vehicle grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredVehicles.map((v) => {
          const badges = getSectionBadges(v);
          return (
            <div
              key={v.id}
              className="glass-card p-5 flex flex-col gap-4 border-white/5 group hover:border-primary/20 transition-all"
            >
              {v.mainImage && (
                <div className="relative h-36 bg-white/5 rounded-lg overflow-hidden">
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
                <p className="text-xs text-white/40 mt-0.5">{CATEGORY_DISPLAY[v.category]} · {v.certifiedRangeKm} km</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {badges.map((b) => (
                    <span key={b.label} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${b.color}`}>{b.label}</span>
                  ))}
                  {badges.length === 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 text-white/20">Not listed</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-primary font-bold text-sm">{getPriceDisplay(v)}</span>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/vehicles/${v.id}`}
                    className="flex items-center gap-1 text-xs text-white/50 hover:text-primary transition-colors"
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
          <div className="col-span-full py-20 text-center glass-card border-dashed border-white/10">
            <p className="text-white/20">No vehicles found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
