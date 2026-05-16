import { PrismaVehicleRepository } from "@/infrastructure/repositories/PrismaVehicleRepository";
import ImageGallery from "@/presentation/components/ImageGallery";
import SpecificationSection from "@/presentation/components/SpecificationSection";
import StartLeasingButton from "@/presentation/components/StartLeasingButton";
import { Battery, Zap, Gauge, Shield, Clock, MapPin, IndianRupee } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";

const vehicleRepo = new PrismaVehicleRepository();

export const dynamic = 'force-dynamic';

export default async function VehicleDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const vehicle = await vehicleRepo.findById(params.id);

  if (!vehicle) {
    notFound();
  }

  const allImages = [vehicle.mainImage, ...vehicle.sideImages];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/#fleet" className="hover:text-primary transition-colors">Fleet</Link>
          <span>/</span>
          <span className="text-white/60">{vehicle.make} {vehicle.model}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
          {/* Left Column: Image Gallery */}
          <div className="lg:sticky top-24">
            <ImageGallery images={allImages} />

            <div className="mt-6 md:mt-10 grid grid-cols-2 gap-3 md:gap-6">
              <div className="glass-card p-6 border-white/5">
                <Shield className="w-6 h-6 text-primary mb-3" />
                <h4 className="font-bold mb-1">Standard Warranty</h4>
                <p className="text-xs text-white/40">3 years or 100,000 km inclusive</p>
              </div>
              <div className="glass-card p-6 border-white/5">
                <Clock className="w-6 h-6 text-accent mb-3" />
                <h4 className="font-bold mb-1">Fast Delivery</h4>
                <p className="text-xs text-white/40">Vehicles delivered within 48 hours</p>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Form */}
          <div className="space-y-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase mb-4">
                AIS156 Certified
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
                {vehicle.make} <span className="text-primary">{vehicle.model}</span>
              </h1>
              <p className="text-white/40 leading-relaxed max-w-xl">
                The {vehicle.make} {vehicle.model} is an electric {(() => {
                  if (vehicle.category === '2 Wheeler') return 'scooter';
                  if (vehicle.category.includes('3 Wheeler')) return 'rickshaw';
                  return 'car';
                })()} available for lease through ZMR Mobility, India's trusted EV partner.
              </p>
            </div>

            {/* Price Card */}
            <div className="glass-card p-5 md:p-8 border-primary/20 bg-primary/5 electric-glow">
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl md:text-4xl font-black text-primary italic">₹{vehicle.basePrice.toLocaleString()}</span>
                <span className="text-white/40 font-bold mb-1 uppercase tracking-widest text-xs">/ Monthly</span>
              </div>
              <p className="text-white/60 text-sm mb-6 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Inclusive of insurance, maintenance & RSA
              </p>
              <div className="h-px bg-white/10 w-full mb-6" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40 uppercase tracking-widest font-bold text-xs">One-time Deposit</span>
                <span className="font-bold">₹{(vehicle.basePrice * 3).toLocaleString()}</span>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="glass-card p-3 md:p-4 border-white/5 text-center">
                <Gauge className="w-4 h-4 md:w-5 md:h-5 text-primary mx-auto mb-1 md:mb-2" />
                <p className="text-[9px] md:text-[10px] text-white/30 uppercase font-bold tracking-widest">Range</p>
                <p className="text-sm md:text-lg font-bold">{vehicle.range} KM</p>
              </div>
              <div className="glass-card p-3 md:p-4 border-white/5 text-center">
                <Battery className="w-4 h-4 md:w-5 md:h-5 text-accent mx-auto mb-1 md:mb-2" />
                <p className="text-[9px] md:text-[10px] text-white/30 uppercase font-bold tracking-widest">Battery</p>
                <p className="text-sm md:text-lg font-bold">{vehicle.batteryCap} kWh</p>
              </div>
              <div className="glass-card p-3 md:p-4 border-white/5 text-center">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-blue-400 mx-auto mb-1 md:mb-2" />
                <p className="text-[9px] md:text-[10px] text-white/30 uppercase font-bold tracking-widest">Top Speed</p>
                <p className="text-sm md:text-lg font-bold">{vehicle.topSpeed} KM/H</p>
              </div>
            </div>

            {/* Locations */}
            <div className="flex items-center gap-3 text-white/40">
              <MapPin className="w-5 h-5 text-primary" />
              <p className="text-sm">Available in <span className="text-white/80 font-bold">12+ Cities</span> including Delhi, Mumbai, and Bangalore.</p>
            </div>

            {/* Start Leasing CTA */}
            <div className="pt-4">
              <StartLeasingButton
                vehicleId={vehicle.id}
                vehicleName={`${vehicle.make} ${vehicle.model}`}
              />
            </div>
          </div>
        </div>

        {/* Detailed Description Sections (Alt Mobility Style) */}
        <div className="mt-12 md:mt-24">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold">About the <span className="text-primary">{vehicle.make} {vehicle.model}</span></h2>
            <p className="text-white/40 mt-2 text-sm md:text-base">Everything you need to know about leasing this electric vehicle</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
            {vehicle.overviewText && (
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Overview</h3>
                <p className="text-white/60 leading-relaxed text-base md:text-lg">{vehicle.overviewText}</p>
              </div>
            )}

            {vehicle.techSpecsText && (
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Technical Specifications</h3>
                <p className="text-white/60 leading-relaxed text-base md:text-lg">{vehicle.techSpecsText}</p>
              </div>
            )}

            {vehicle.performanceText && (
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Performance & Efficiency</h3>
                <p className="text-white/60 leading-relaxed text-base md:text-lg">{vehicle.performanceText}</p>
              </div>
            )}

            {vehicle.leasingInfoText && (
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Leasing Information</h3>
                <p className="text-white/60 leading-relaxed text-base md:text-lg">{vehicle.leasingInfoText}</p>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Specifications Sections */}
        <div className="mt-12 md:mt-24">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold">Detailed <span className="text-primary">Specifications</span></h2>
            <p className="text-white/40 mt-2">Everything you need to know about the {vehicle.make} {vehicle.model}</p>
          </div>
          <SpecificationSection vehicle={vehicle} />
        </div>
      </div>
    </main>
  );
}
