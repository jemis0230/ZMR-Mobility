import { PrismaVehicleRepository } from "@/infrastructure/repositories/PrismaVehicleRepository";
import ImageGallery from "@/presentation/components/ImageGallery";
import SpecificationSection from "@/presentation/components/SpecificationSection";
import BuyEnquireButton from "@/presentation/components/BuyEnquireButton";
import VehicleSectionLinks from "@/presentation/components/VehicleSectionLinks";
import { Battery, Zap, Gauge, Shield, FileCheck2, MapPin, CalendarDays } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { slugifyVehicle, extractIdFromSlug } from "@/lib/vehicleSlug";
import { CATEGORY_TO_SLUG, CATEGORY_DISPLAY } from "@/lib/constants";
import { estimateEmi, formatINR, EMI_DISCLAIMER } from "@/lib/explore";
import { getPolicyItems } from "@/app/actions/faqActions";
import CompareButton from "@/presentation/components/compare/CompareButton";
import { VehiclePolicySummary } from "@/presentation/components/PolicySection";
import type { Metadata } from "next";

const vehicleRepo = new PrismaVehicleRepository();

export const revalidate = 300;

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params;
  const id = extractIdFromSlug(params.id);
  const vehicle = await vehicleRepo.findById(id);
  if (!vehicle) return { title: "Vehicle Not Found" };

  const title = `${vehicle.make} ${vehicle.model} – Buy EV | ZMR Mobility`;
  const description = `Buy the ${vehicle.make} ${vehicle.model}${vehicle.buyingPrice ? ` for ₹${vehicle.buyingPrice.toLocaleString('en-IN')}` : ''}. ${vehicle.certifiedRangeKm} km range, ${vehicle.batteryCapKwh} kWh battery. Available across 12+ Indian cities via ZMR Mobility.`;
  const url = `https://zmrmobility.in/buying/vehicles/detail/${slugifyVehicle(vehicle.make, vehicle.model, vehicle.id)}`;

  return {
    title,
    description,
    openGraph: { title, description, url, type: "website" },
    alternates: { canonical: url },
  };
}

export default async function BuyingVehicleDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = extractIdFromSlug(params.id);
  const vehicle = await vehicleRepo.findById(id);

  if (!vehicle) notFound();

  const expectedSlug = slugifyVehicle(vehicle.make, vehicle.model, vehicle.id);
  if (params.id !== expectedSlug) redirect(`/buying/vehicles/detail/${expectedSlug}`);

  const allImages = [vehicle.mainImage, ...vehicle.images.map((img) => img.url)];
  const policyItems = await getPolicyItems();
  const name = `${vehicle.make} ${vehicle.model}`;
  const vehicleType = vehicle.category === 'TWO_WHEELER' ? 'scooter' : vehicle.category.includes('THREE') ? 'rickshaw' : 'car';

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="pt-24 lg:pt-36 pb-20 px-6 max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink/50 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/buying/vehicles/${CATEGORY_TO_SLUG[vehicle.category] ?? '2-wheeler'}`} className="hover:text-primary transition-colors">Buy</Link>
          <span>/</span>
          <span className="text-ink/70">{vehicle.make} {vehicle.model}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
          <div className="lg:sticky top-24">
            <ImageGallery images={allImages} />
            <div className="mt-6 md:mt-10 grid grid-cols-2 gap-3 md:gap-6">
              <div className="glass-card p-5 md:p-6">
                <Shield className="w-6 h-6 text-leaf mb-3" aria-hidden />
                <h2 className="font-bold mb-1 text-base text-forest">Warranty</h2>
                <p className="text-xs text-ink/75">{vehicle.warranty?.trim() || 'Not provided — contact us to confirm'}</p>
              </div>
              <a href="#vehicle-policy-title" className="glass-card p-5 md:p-6 hover:border-primary/40 transition-colors">
                <FileCheck2 className="w-6 h-6 text-leaf mb-3" aria-hidden />
                <h2 className="font-bold mb-1 text-base text-forest">Ownership support</h2>
                <p className="text-xs text-ink/75">RC transfer, NOC, insurance &amp; buyback — see details below</p>
              </a>
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-lime text-forest text-[11px] font-bold tracking-widest uppercase">
                  {CATEGORY_DISPLAY[vehicle.category]}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-tint border border-ink/10 text-forest text-[11px] font-bold tracking-widest uppercase">
                  AIS156 Certified
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
                {vehicle.make} <span className="text-primary">{vehicle.model}</span>
              </h1>
              <p className="text-ink/60 leading-relaxed max-w-xl">
                The {vehicle.make} {vehicle.model} is an electric {vehicleType} available for purchase through ZMR Mobility, India&apos;s trusted EV partner.
              </p>
            </div>

            {(vehicle.manufactureYear || vehicle.kmDriven != null) && (
              <div className="flex flex-wrap gap-2 -mt-4">
                {vehicle.manufactureYear && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-ink/10 px-3 py-1.5 text-sm font-semibold text-ink/80">
                    <CalendarDays className="w-4 h-4 text-primary" /> {vehicle.manufactureYear} model
                  </span>
                )}
                {vehicle.kmDriven != null && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-ink/10 px-3 py-1.5 text-sm font-semibold text-ink/80">
                    <Gauge className="w-4 h-4 text-primary" /> {vehicle.kmDriven.toLocaleString('en-IN')} km driven
                  </span>
                )}
              </div>
            )}

            {/* Price Card */}
            <div className="glass-card p-5 md:p-8 bg-tint">
              {vehicle.buyingPrice ? (
                <>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl md:text-4xl font-black text-forest">{formatINR(vehicle.buyingPrice)}</span>
                    <span className="text-ink/75 font-bold mb-1 uppercase tracking-widest text-xs">Purchase Price</span>
                  </div>
                  <p className="text-ink/75 text-xs">* Prices are exclusive of GST. GST will be applicable on the final amount.</p>
                  <p className="mt-3 pt-3 border-t border-primary/20 text-sm text-ink/80">
                    Indicative EMI <span className="font-bold text-primary">{formatINR(estimateEmi(vehicle.buyingPrice))}/month</span>
                  </p>
                  <p className="text-[11px] text-ink/70 mt-1">{EMI_DISCLAIMER}</p>
                </>
              ) : (
                <p className="text-ink/60 text-sm text-center py-2">Contact us for pricing details.</p>
              )}
            </div>

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
                <Zap className="w-4 h-4 md:w-5 md:h-5 text-leaf mx-auto mb-1 md:mb-2" />
                <p className="text-[9px] md:text-[10px] text-ink/50 uppercase font-bold tracking-widest">Top Speed</p>
                <p className="text-sm md:text-lg font-bold">{vehicle.topSpeedKmh} km/h</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-ink/60">
              <MapPin className="w-5 h-5 text-primary" />
              <p className="text-sm">Contact us to confirm availability and delivery in your city.</p>
            </div>

            <div className="pt-4">
              <BuyEnquireButton vehicleId={vehicle.id} vehicleName={`${vehicle.make} ${vehicle.model}`} />
              <div className="mt-3">
                <CompareButton variant="block" item={{ id: vehicle.id, title: name, image: vehicle.mainImage }} />
              </div>
              <VehicleSectionLinks vehicle={vehicle} currentSection="buying" />
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="mt-12 md:mt-24">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold">About the <span className="text-primary">{vehicle.make} {vehicle.model}</span></h2>
            <p className="text-ink/60 mt-2 text-sm md:text-base">Everything you need to know about buying this electric vehicle</p>
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
            {vehicle.buyingInfo && (
              <div className="space-y-3">
                <h3 className="text-xl md:text-2xl font-bold tracking-tight">Buying Information</h3>
                <p className="text-ink/70 leading-relaxed text-base md:text-lg">{vehicle.buyingInfo}</p>
              </div>
            )}
          </div>
        </div>

        {/* Warranty & ownership */}
        <div className="mt-12 md:mt-24 max-w-5xl mx-auto">
          <VehiclePolicySummary items={policyItems} vehicleName={name} recordedWarranty={vehicle.warranty} />
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
