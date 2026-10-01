import { PrismaVehicleRepository } from "@/infrastructure/repositories/PrismaVehicleRepository";
import VehicleCard from "./VehicleCard";

const vehicleRepo = new PrismaVehicleRepository();

export default async function VehicleGrid() {
  let vehicles = [];
  try {
    vehicles = await vehicleRepo.findAll();
  } catch (error) {
    console.error("Failed to fetch vehicles:", error);
    // Return empty array or show a message if DB is not connected
    return (
      <section id="fleet" className="py-24 px-6">
        <div className="max-w-7xl mx-auto text-center glass-card p-12 border-red-500/20">
          <p className="text-red-400 font-bold mb-2">Database Connection Error</p>
          <p className="text-ink/60 text-sm">Please check if your PostgreSQL database is running and DATABASE_URL is correct in .env</p>
        </div>
      </section>
    );
  }

  if (vehicles.length === 0) return null;

  return (
    <section id="fleet" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-bold">Our <span className="text-primary">EV Fleet</span></h2>
            <p className="text-ink/65 max-w-xl">
              Choose from a wide range of electric vehicles designed for performance, 
              efficiency, and sustainability.
            </p>
          </div>
          <div className="flex gap-2">
            {['All', '2-Wheeler', '3-Wheeler', '4-Wheeler'].map((cat) => (
              <button 
                key={cat}
                className="px-4 py-2 rounded-full bg-ink/5 border border-ink/10 text-xs font-bold hover:bg-ink/10 transition-all"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </div>
    </section>
  );
}
