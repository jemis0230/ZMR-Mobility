import { PrismaVehicleRepository } from "@/infrastructure/repositories/PrismaVehicleRepository";
import ImageGallery from "@/presentation/components/ImageGallery";
import SpecificationSection from "@/presentation/components/SpecificationSection";
import BuyEnquireButton from "@/presentation/components/BuyEnquireButton";
import VehicleSectionLinks from "@/presentation/components/VehicleSectionLinks";
import { Battery, Zap, Gauge, Shield, Clock, MapPin, CalendarDays, IndianRupee } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { slugifyVehicle, extractIdFromSlug } from "@/lib/vehicleSlug";
import { CATEGORY_TO_SLUG } from "@/lib/constants";
import type { Metadata } from "next";

const vehicleRepo = new PrismaVehicleRepository();

export const revalidate = 300;

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const id = extractIdFromSlug(params.id);
  const vehicle = await vehicleRepo.findById(id);
  if (!vehicle) return { title: "Vehicle Not Found" };

  const lowestPlan = vehicle.rentPlans.filter((p) => p.isActive).sort((a, b) => a.pricePerDayRs - b.pricePerDayRs)[0];
  const title = `${vehicle.make} ${vehicle.model} – Rent EV | ZMR Mobility`;
  const description = `Rent the ${vehicle.make} ${vehicle.model}${lowestPlan ? ` from ₹${lowestPlan.pricePerDayRs.toLocaleString('en-IN')}/day` : ''}. ${vehicle.certifiedRangeKm} km range, ${vehicle.batteryCapKwh} kWh battery. Available across 12+ Indian cities via ZMR Mobility.`;
  const url = `https://zmrmobility.in/rent/vehicles/detail/${slugifyVehicle(vehicle.make, vehicle.model, vehicle.id)}`;

  return {
    title,
    description,
    openGraph: { title, description, url, type: "website" },
    alternates: { canonical: url },
  };
}

export default async function RentVehicleDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = extractIdFromSlug(params.id);
  const vehicle = await vehicleRepo.findById(id);

  if (!vehicle) notFound();

  const expectedSlug = slugifyVehicle(vehicle.make, vehicle.model, vehicle.id);
  if (params.id !== expectedSlug) redirect(`/rent/vehicles/detail/${expectedSlug}`);

  const allImages = [vehicle.mainImage, ...vehicle.images.map((img) => img.url)];
  const vehicleType = vehicle.category === 'TWO_WHEELER' ? 'scooter' : vehicle.category.includes('THREE') ? 'rickshaw' : 'car';

  const activeRentPlans = vehicle.rentPlans
    .filter((p) => p.isActive)
    .sort((a, b) => a.durationDays - b.durationDays);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pt-24 pb-20 px-6 max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/rent/vehicles/${CATEGORY_TO_SLUG[vehicle.category] ?? '2-wheeler'}`} className="hover:text-primary transition-colors">Rent</Link>
          <span>/</span>
          <span className="text-white/60">{vehicle.make} {vehicle.model}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
          <div className="lg:sticky top-24">
            <ImageGallery images={allImages} />
            <div className="mt-6 md:mt-10 grid grid-cols-2 gap-3 md:gap-6">
              <div className="glass-card p-6 border-white/5">
                <Shield className="w-6 h-6 text-primary mb-3" />
                <h4 className="font-bold mb-1">Fully Insured</h4>
                <p className="text-xs text-white/40">All rental vehicles are comprehensively insured</p>
              </div>
              <div className="glass-card p-6 border-white/5">
                <Clock className="w-6 h-6 text-accent mb-3" />
                <h4 className="font-bold mb-1">Flexible Duration</h4>
                <p className="text-xs text-white/40">Rent by the day, week, or month</p>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold tracking-widest uppercase mb-4">
                Available for Rent
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
                {vehicle.make} <span className="text-primary">{vehicle.model}</span>
              </h1>
              <p className="text-white/40 leading-relaxed max-w-xl">
                The {vehicle.make} {vehicle.model} is an electric {vehicleType} available for daily rental through ZMR Mobility, India&apos;s trusted EV partner.
              </p>
            </div>

            {/* Rent Plans */}
            {activeRentPlans.length > 0 ? (
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">Available Rental Plans</p>
                <div className="grid gap-3">
                  {activeRentPlans.map((plan) => (
                    <div key={plan.id} className="glass-card p-5 border-primary/20 bg-primary/5 hover:border-primary/40 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-primary" />
                          <span className="font-bold text-white">{plan.durationDays} Day{plan.durationDays !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-primary italic">₹{plan.pricePerDayRs.toLocaleString('en-IN')}</span>
                          <span className="text-white/40 text-xs font-bold ml-1">/ day</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <IndianRupee className="w-3 h-3" />
                        <span>Refundable deposit: <strong className="text-white/60">₹{plan.depositRs.toLocaleString('en-IN')}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-white/30 text-xs">* Prices are exclusive of GST. Inclusive of insurance & roadside assistance.</p>
              </div>
            ) : (
              <div className="glass-card p-5 border-primary/20 bg-primary/5">
                <p className="text-white/40 text-sm text-center">Contact us for rental pricing details.</p>
              </div>
            )}

            {/* Specs Grid */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="glass-card p-3 md:p-4 border-white/5 text-center">
                <Gauge className="w-4 h-4 md:w-5 md:h-5 text-primary mx-auto mb-1 md:mb-2" />
                <p className="text-[9px] md:text-[10px] text-white/30 uppercase font-bold tracking-widest">Range</p>
                <p className="text-sm md:text-lg font-bold">{vehicle.certifiedRangeKm} km</p>
              </div>
              <div className="glass-card p-3 md:p-4 border-white/5 text-center">
                <Battery className="w-4 h-4 md:w-5 md:h-5 text-accent mx-auto mb-1 md:mb-2" />
                <p className="text-[9px] md:text-[10px] text-white/30 uppercase font-bold tracking-widest">Battery</p>
                <p className="text-sm md:text-lg font-bold">{vehicle.batteryCapKwh} kWh</p>
              </div>
              <div className="glass-card p-3 md:p-4 border-white/5 text-center">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-blue-400 mx-auto mb-1 md:mb-2" />
                <p className="text-[9px] md:text-[10px] text-white/30 uppercase font-bold tracking-widest">Top Speed</p>
                <p className="text-sm md:text-lg font-bold">{vehicle.topSpeedKmh} km/h</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-white/40">
              <MapPin className="w-5 h-5 text-primary" />
              <p className="text-sm">Available in <span className="text-white/80 font-bold">12+ Cities</span> including Delhi, Mumbai, and Bangalore.</p>
            </div>

            <div className="pt-4">
              <BuyEnquireButton vehicleId={vehicle.id} vehicleName={`${vehicle.make} ${vehicle.model}`} label="Enquire for Rent" />
              <VehicleSectionLinks vehicle={vehicle} currentSection="rent" />
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="mt-12 md:mt-24">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold">About the <span className="text-primary">{vehicle.make} {vehicle.model}</span></h2>
            <p className="text-white/40 mt-2 text-sm md:text-base">Everything you need to know about renting this electric vehicle</p>
          </div>
          <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
            {vehicle.overview && (
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Overview</h3>
                <p className="text-white/60 leading-relaxed text-base md:text-lg">{vehicle.overview}</p>
              </div>
            )}
            {vehicle.techSpecs && (
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Technical Specifications</h3>
                <p className="text-white/60 leading-relaxed text-base md:text-lg">{vehicle.techSpecs}</p>
              </div>
            )}
            {vehicle.performance && (
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Performance & Efficiency</h3>
                <p className="text-white/60 leading-relaxed text-base md:text-lg">{vehicle.performance}</p>
              </div>
            )}
            {vehicle.rentalInfo && (
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Rental Information</h3>
                <p className="text-white/60 leading-relaxed text-base md:text-lg">{vehicle.rentalInfo}</p>
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
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
