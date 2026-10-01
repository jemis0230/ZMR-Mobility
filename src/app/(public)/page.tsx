import { Suspense } from 'react';
import Image from 'next/image';
import HeroBanner from "@/presentation/components/HeroBanner";
import HomeExplore, { TrustBar } from "@/presentation/components/HomeExplore";
import FeaturedVehicles from "@/presentation/components/FeaturedVehicles";
import HomeSections from "@/presentation/components/HomeSections";
import { PrismaVehicleRepository } from "@/infrastructure/repositories/PrismaVehicleRepository";
import { getCachedExploreMenuData } from "@/lib/cachedVehicleQueries";
import LeasingContactForm from "@/presentation/components/LeasingContactForm";
import FaqSection from "./_components/FaqSection";

export const revalidate = 3600;

export const metadata = {
  title: "ZMR Mobility | India's Technology-First EV Asset Management Company",
  alternates: { canonical: "/" },
  description: "ZMR Mobility offers affordable, reliable electric vehicle leasing, IoT monitoring, and comprehensive aftersales support for individuals, gig workers, and B2B fleets across India.",
};

const vehicleRepo = new PrismaVehicleRepository();

// Home page data is best-effort: if the DB is unreachable (e.g. at image build time)
// the page still renders, just without the featured row / dynamic brand list.
async function loadHomeData() {
  const [featured, menu] = await Promise.all([
    vehicleRepo.findForExplore({ sortBy: 'newest', pageSize: 8 }).then((r) => r.data).catch(() => []),
    getCachedExploreMenuData().catch(() => ({ makes: [] })),
  ]);
  return { featured, makes: menu.makes.map(({ make, models }) => ({ make, models })) };
}

function FaqSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-14 rounded-xl bg-ink/5" />
      ))}
    </div>
  );
}

export default async function Home() {
  const { featured, makes } = await loadHomeData();

  return (
    <main className="min-h-screen bg-background">
      <HeroBanner />
      <TrustBar />
      <HomeExplore makes={makes} />
      <FeaturedVehicles vehicles={featured} />
      <HomeSections />

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 border-t border-ink/[0.08] scroll-mt-32">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-16 items-start">
              {/* Left Column */}
              <div className="lg:col-span-5">
                <span className="text-primary text-xs font-bold uppercase tracking-widest">Support Center</span>
                <h2 className="text-4xl md:text-5xl font-black mt-3 mb-6 leading-tight text-ink">
                  Frequently Asked <span className="text-primary">Questions</span>
                </h2>
                <p className="text-ink/65 text-lg leading-relaxed mb-8">
                  Got questions about EV leasing, IoT tracking, or our refurbishment process?
                  We've compiled answers to the most common queries to help you make
                  an informed decision for your mobility needs.
                </p>
                <div className="glass-card p-6 border-ink/[0.08] bg-ink/[0.02]">
                  <h4 className="font-bold text-ink mb-2">Still have questions?</h4>
                  <p className="text-sm text-ink/60 mb-4">Our team is here to help you drive into the future.</p>
                  <a href="mailto:info@zmrmobility.in" className="text-primary font-bold text-sm hover:underline flex items-center gap-2">
                    Contact our experts <span>→</span>
                  </a>
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-7">
                <Suspense fallback={<FaqSkeleton />}>
                  <FaqSection />
                </Suspense>
              </div>
            </div>
          </div>
        </section>

      {/* Sell Your EV */}
      <section id="procurement" className="py-20 px-4 md:px-6 border-t border-ink/[0.08]">
        <div className="max-w-6xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary-deep px-8 py-12 md:px-14 md:py-14 shadow-xl shadow-primary/20">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-white/10" />
          <div className="absolute right-24 -bottom-24 w-64 h-64 rounded-full bg-white/5" />
          <div className="relative grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
            <div>
              <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-white">Used EV Procurement</span>
              <h2 className="text-3xl md:text-4xl font-black mt-4 text-white leading-tight">
                Sell your EV at the <span className="text-sky-200">right price</span>
              </h2>
              <p className="text-white/80 mt-3 mb-7 text-lg max-w-lg">
                Get the best valuation for your used EV. Answer a few quick questions and our team will contact you with an offer.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="/sell-ev" className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-extrabold text-primary hover:bg-primary-50 transition-colors">
                  Start Selling My EV →
                </a>
                <a href="tel:+919045222999" className="inline-flex items-center rounded-xl border border-white/40 px-6 py-3.5 font-bold text-white hover:bg-white/10 transition-colors">
                  Talk to an expert
                </a>
              </div>
              <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white/85">
                <li>✓ Free inspection</li>
                <li>✓ Instant valuation</li>
                <li>✓ Same-day payment</li>
              </ul>
            </div>
            <div className="relative hidden md:block aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-2xl">
              <Image src="/sampleVechiles/ruv350695b9364c221b.webp" alt="Sell your electric scooter" fill sizes="40vw" className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form — above footer */}
      <section id="contact" className="py-24 px-6 bg-ink/[0.02] border-t border-ink/[0.08]">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Get in Touch</span>
            <h2 className="text-4xl font-black mt-3 mb-4">Have a Question? <span className="text-primary">Let's Talk.</span></h2>
            <p className="text-ink/65 max-w-xl mx-auto">
              Whether you're exploring EVs, need a fleet solution, or just want to know more — fill in your details and our team will reach out to you.
            </p>
          </div>
          <LeasingContactForm />
        </div>
      </section>
    </main>
  );
}
