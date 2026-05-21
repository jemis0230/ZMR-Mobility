'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminVehicleForm from '@/presentation/components/AdminVehicleForm';
import { Vehicle } from '@/domain/entities/Vehicle';
import { VEHICLE_CATEGORIES } from '@/lib/constants';
import { Car, AlertTriangle, Edit, Trash2, X, Filter } from 'lucide-react';
import { deleteVehicle } from './actions';

interface AdminVehiclesClientProps {
  initialVehicles: Vehicle[];
  dbError: boolean;
}

const CATEGORIES = ['All', ...VEHICLE_CATEGORIES];

export default function AdminVehiclesClient({
  initialVehicles,
  dbError
}: AdminVehiclesClientProps) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Sync local list whenever the server re-renders with fresh data (after router.refresh())
  useEffect(() => {
    setVehicles(initialVehicles);
  }, [initialVehicles]);

  // Filter vehicles
  const filteredVehicles = selectedCategory === "All" 
    ? vehicles 
    : vehicles.filter(v => v.category === selectedCategory);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this vehicle? This action cannot be undone.')) {
      setDeletingId(id);
      try {
        await deleteVehicle(id);
        setVehicles(prev => prev.filter(v => v.id !== id));
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete vehicle. Please try again.');
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Car className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vehicle Management</h1>
            <p className="text-white/40 text-sm">Add and manage your electric vehicle fleet catalog.</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 mr-4">
          <Filter className="w-4 h-4 text-white/40" />
          <span className="text-white/40 text-sm font-bold uppercase tracking-widest">Filter:</span>
        </div>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
              selectedCategory === cat
                ? "bg-primary border-primary text-background"
                : "bg-transparent border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-12">
        <div className="lg:col-span-1">
          {editingVehicle ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Edit Vehicle</h3>
                <button
                  onClick={() => setEditingVehicle(null)}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <AdminVehicleForm
                initialData={editingVehicle}
                onVehicleSaved={() => { setEditingVehicle(null); router.refresh(); }}
              />
            </div>
          ) : (
            <AdminVehicleForm onVehicleSaved={() => router.refresh()} />
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Current Inventory ({filteredVehicles.length})
            </h2>
          </div>
          
          {dbError && (
            <div className="glass-card p-6 border-red-500/20 bg-red-500/5 flex items-center gap-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-red-500 font-bold">Database Connection Error</p>
                <p className="text-white/40 text-sm">Please update your DATABASE_URL in the .env file.</p>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {filteredVehicles.map((v) => (
              <div key={v.id} className="glass-card p-6 flex flex-col gap-4 border-white/5 group hover:border-primary/20 transition-all">
                {v.mainImage && (
                  <div className="relative h-40 bg-white/5 rounded-lg overflow-hidden">
                    <img 
                      src={v.mainImage} 
                      alt={`${v.make} ${v.model}`} 
                      className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      {v.sideImages.length > 0 && (
                        <span className="bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold">
                          +{v.sideImages.length} Gallery
                        </span>
                      )}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold">{v.make} {v.model}</h3>
                  <p className="text-sm text-white/40">{v.category} • {v.range} KM Range</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-primary font-bold">₹{v.basePrice}/mo</span>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setEditingVehicle(v)}
                      className="flex items-center gap-1 text-xs text-white/50 hover:text-white hover:text-primary transition-colors"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(v.id)}
                      disabled={deletingId === v.id}
                      className="flex items-center gap-1 text-xs text-red-500/50 hover:text-red-500 transition-colors disabled:opacity-50"
                    >
                      {deletingId === v.id ? (
                        <span className="animate-pulse">Deleting...</span>
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
            ))}
            {!dbError && filteredVehicles.length === 0 && (
              <div className="col-span-2 py-20 text-center glass-card border-dashed border-white/10">
                <p className="text-white/20">No vehicles found for this category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
