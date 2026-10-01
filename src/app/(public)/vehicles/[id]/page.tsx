import { PrismaVehicleRepository } from "@/infrastructure/repositories/PrismaVehicleRepository";
import ImageGallery from "@/presentation/components/ImageGallery";
import SpecificationSection from "@/presentation/components/SpecificationSection";
import StartLeasingButton from "@/presentation/components/StartLeasingButton";
import VehicleSectionLinks from "@/presentation/components/VehicleSectionLinks";
import { Battery, Zap, Gauge, Shield, Clock, MapPin, CalendarDays, IndianRupee } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { slugifyVehicle, extractIdFromSlug } from "@/lib/vehicleSlug";
import { CATEGORY_TO_SLUG, CATEGORY_DISPLAY } from "@/lib/constants";
import type { Metadata } from "next";

const vehicleRepo = new PrismaVehicleRepository();

export const revalidate = 300;

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const id = extractIdFromSlug(params.id);
  const vehicle = await vehicleRepo.findById(id);
  if (!vehicle) return { title: "Vehicle Not Found" };

  const lowestPlan = vehicle.leasePlans.filter((p) => p.isActive).sort((a, b) => a.monthlyPriceRs - b.monthlyPriceRs)[0];
  const title = `${vehicle.make} ${vehicle.model} – Lease EV | ZMR Mobility`;
  const description = `Lease the ${vehicle.make} ${vehicle.model}${lowestPlan ? ` from ₹${lowestPlan.monthlyPriceRs.toLocaleString('en-IN')}/month` : ''}. ${vehicle.certifiedRangeKm} km range, ${vehicle.batteryCapKwh} kWh battery. Available across 12+ Indian cities via ZMR Mobility.`;
  const url = `https://zmrmobility.in/vehicles/${slugifyVehicle(vehicle.make, vehicle.model, vehicle.id)}`;

  return {
    title,
    description,
    openGraph: { title, description, url, type: "website" },
    alternates: { canonical: url },
  };
}

export default async function VehicleDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = extractIdFromSlug(params.id);
  const vehicle = await vehicleRepo.findById(id);

  if (!vehicle) notFound();

  const expectedSlug = slugifyVehicle(vehicle.make, vehicle.model, vehicle.id);
  if (params.id !== expectedSlug) redirect(`/vehicles/${expectedSlug}`);

  const allImages = [vehicle.mainImage, ...vehicle.images.map((img) => img.url)];

  const activeLeasePlans = vehicle.leasePlans
    .filter((p) => p.isActive)
    .sort((a, b) => a.tenureMonths - b.tenureMonths);

  const categoryLabel = CATEGORY_DISPLAY[vehicle.category] ?? vehicle.category;
  const vehicleType = vehicle.category === 'TWO_WHEELER' ? 'scooter' : vehicle.category.includes('THREE') ? 'rickshaw' : 'car';

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pt-24 lg:pt-36 pb-20 px-6 max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink/50 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/leasing/vehicles/${CATEGORY_TO_SLUG[vehicle.category] ?? '2-wheeler'}`} className="hover:text-primary transition-colors">Fleet</Link>
          <span>/</span>
          <span className="text-ink/70">{vehicle.make} {vehicle.model}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
          <div className="lg:sticky top-24">
            <ImageGallery images={allImages} />
            <div className="mt-6 md:mt-10 grid grid-cols-2 gap-3 md:gap-6">
              <div className="glass-card p-6 border-ink/[0.08]">
                <Shield className="w-6 h-6 text-primary mb-3" />
                <h4 className="font-bold mb-1">Standard Warranty</h4>
                <p className="text-xs text-ink/60">{vehicle.warranty || 'Contact us for details'}</p>
              </div>
              <div className="glass-card p-6 border-ink/[0.08]">
                <Clock className="w-6 h-6 text-accent mb-3" />
                <h4 className="font-bold mb-1">Fast Delivery</h4>
                <p className="text-xs text-ink/60">Vehicles delivered within 48 hours</p>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase mb-4">
                AIS156 Certified
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
                {vehicle.make} <span className="text-primary">{vehicle.model}</span>
              </h1>
              <p className="text-ink/60 leading-relaxed max-w-xl">
                The {vehicle.make} {vehicle.model} is an electric {vehicleType} available for lease through ZMR Mobility, India&apos;s trusted EV partner.
              </p>
            </div>

            {/* Lease Plans */}
            {activeLeasePlans.length > 0 ? (
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink/65">Available Lease Plans</p>
                <div className="grid gap-3">
                  {activeLeasePlans.map((plan) => (
                    <div key={plan.id} className="glass-card p-5 border-primary/20 bg-primary/5 hover:border-primary/40 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-primary" />
                          <span className="font-bold text-ink">{plan.tenureMonths} Month Lease</span>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-primary italic">₹{plan.monthlyPriceRs.toLocaleString('en-IN')}</span>
                          <span className="text-ink/60 text-xs font-bold ml-1">/ mo</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-ink/60">
                        <IndianRupee className="w-3 h-3" />
                        <span>One-time deposit: <strong className="text-ink/70">₹{plan.depositRs.toLocaleString('en-IN')}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-ink/50 text-xs">* Prices are exclusive of GST. Inclusive of insurance, maintenance & RSA.</p>
              </div>
            ) : (
              <div className="glass-card p-5 border-primary/20 bg-primary/5">
                <p className="text-ink/60 text-sm text-center">Contact us for leasing pricing.</p>
              </div>
            )}

            {/* Specs Grid */}
            <div className="grid grid-cols-3 gap-2 md:gap-4">
              <div className="glass-card p-3 md:p-4 border-ink/[0.08] text-center">
                <Gauge className="w-4 h-4 md:w-5 md:h-5 text-primary mx-auto mb-1 md:mb-2" />
                <p className="text-[9px] md:text-[10px] text-ink/50 uppercase font-bold tracking-widest">Range</p>
                <p className="text-sm md:text-lg font-bold">{vehicle.certifiedRangeKm} km</p>
              </div>
              <div className="glass-card p-3 md:p-4 border-ink/[0.08] text-center">
                <Battery className="w-4 h-4 md:w-5 md:h-5 text-accent mx-auto mb-1 md:mb-2" />
                <p className="text-[9px] md:text-[10px] text-ink/50 uppercase font-bold tracking-widest">Battery</p>
                <p className="text-sm md:text-lg font-bold">{vehicle.batteryCapKwh} kWh</p>
              </div>
              <div className="glass-card p-3 md:p-4 border-ink/[0.08] text-center">
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-blue-400 mx-auto mb-1 md:mb-2" />
                <p className="text-[9px] md:text-[10px] text-ink/50 uppercase font-bold tracking-widest">Top Speed</p>
                <p className="text-sm md:text-lg font-bold">{vehicle.topSpeedKmh} km/h</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-ink/60">
              <MapPin className="w-5 h-5 text-primary" />
              <p className="text-sm">Available in <span className="text-ink/85 font-bold">12+ Cities</span> including Delhi, Mumbai, and Bangalore.</p>
            </div>

            <div className="pt-4">
              <StartLeasingButton vehicleId={vehicle.id} vehicleName={`${vehicle.make} ${vehicle.model}`} />
              <VehicleSectionLinks vehicle={vehicle} currentSection="leasing" />
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="mt-12 md:mt-24">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold">About the <span className="text-primary">{vehicle.make} {vehicle.model}</span></h2>
            <p className="text-ink/60 mt-2 text-sm md:text-base">Everything you need to know about leasing this electric vehicle</p>
          </div>
          <div className="max-w-4xl mx-auto space-y-8 md:space-y-12">
            {vehicle.overview && (
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Overview</h3>
                <p className="text-ink/70 leading-relaxed text-base md:text-lg">{vehicle.overview}</p>
              </div>
            )}
            {vehicle.techSpecs && (
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Technical Specifications</h3>
                <p className="text-ink/70 leading-relaxed text-base md:text-lg">{vehicle.techSpecs}</p>
              </div>
            )}
            {vehicle.performance && (
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Performance & Efficiency</h3>
                <p className="text-ink/70 leading-relaxed text-base md:text-lg">{vehicle.performance}</p>
              </div>
            )}
            {vehicle.leasingInfo && (
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Leasing Information</h3>
                <p className="text-ink/70 leading-relaxed text-base md:text-lg">{vehicle.leasingInfo}</p>
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        <div className="mt-12 md:mt-24">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold">Detailed <span className="text-primary">Specifications</span></h2>
            <p className="text-ink/60 mt-2">Everything you need to know about the {vehicle.make} {vehicle.model}</p>
          </div>
          <SpecificationSection vehicle={vehicle} />
        </div>
      </div>
    </main>
  );
}
