import { Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import HeroBanner from "@/presentation/components/HeroBanner";
import HomeExplore, { TrustBar } from "@/presentation/components/HomeExplore";
import FeaturedVehicles from "@/presentation/components/FeaturedVehicles";
import HomeSections from "@/presentation/components/HomeSections";
import PolicySection from "@/presentation/components/PolicySection";
import { PrismaVehicleRepository } from "@/infrastructure/repositories/PrismaVehicleRepository";
import { getCachedExploreMenuData } from "@/lib/cachedVehicleQueries";
import { getPolicyItems } from "@/app/actions/faqActions";
import { buildPriceBuckets } from "@/lib/explore";
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
  const [featured, menu, policyItems] = await Promise.all([
    vehicleRepo.findForExplore({ sortBy: 'newest', pageSize: 8 }).then((r) => r.data).catch(() => []),
    getCachedExploreMenuData().catch(() => ({ makes: [], prices: [] as number[] })),
    getPolicyItems(),
  ]);
  return {
    featured,
    makes: menu.makes.map(({ make, models }) => ({ make, models })),
    priceBuckets: buildPriceBuckets(menu.prices),
    policyItems,
  };
}

function FaqSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-16 rounded-2xl bg-tint" />
      ))}
    </div>
  );
}

export default async function Home() {
  const { featured, makes, priceBuckets, policyItems } = await loadHomeData();

  return (
    <main className="min-h-screen bg-cream">
      {/* Cream */}
      <HeroBanner />
      <TrustBar />
      {/* White */}
      <HomeExplore makes={makes} priceBuckets={priceBuckets} />
      {/* Cream, white cards */}
      <FeaturedVehicles vehicles={featured} />
      {/* Tint → White → Cream → White → Forest → Cream → [White policy] → Gradient */}
      <HomeSections
        policySlot={
          <div className="py-20 md:py-24 px-4 md:px-6 bg-white">
            <div className="max-w-7xl mx-auto">
              <PolicySection items={policyItems} showPageLink />
            </div>
          </div>
        }
      />

      {/* FAQ (White) */}
      <section id="faq" aria-labelledby="faq-title" className="py-20 md:py-24 px-4 md:px-6 bg-white border-t border-ink/10 scroll-mt-36">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <p className="text-primary text-xs font-bold uppercase tracking-widest">Support center</p>
              <h2 id="faq-title" className="text-4xl md:text-5xl font-black mt-3 mb-6 leading-tight text-forest">
                Frequently asked <span className="text-leaf">questions</span>
              </h2>
              <p className="text-ink/80 text-lg leading-relaxed mb-8">
                Answers about EV leasing, IoT tracking, warranty, ownership transfer and more — to help you make
                an informed decision for your mobility needs.
              </p>
              <div className="rounded-2xl bg-tint border border-ink/10 p-6">
                <h3 className="font-bold text-forest mb-2">Still have questions?</h3>
                <p className="text-sm text-ink/80 mb-4">Our team is here to help.</p>
                <a href="mailto:info@zmrmobility.in" className="text-primary font-bold text-sm hover:underline inline-flex items-center gap-2">
                  Contact our experts <ArrowRight className="w-4 h-4" aria-hidden />
                </a>
              </div>
            </div>

            <div className="lg:col-span-7">
              <Suspense fallback={<FaqSkeleton />}>
                <FaqSection />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Sell Your EV (Tint) */}
      <section id="procurement" aria-labelledby="sell-title" className="py-20 px-4 md:px-6 bg-tint">
        <div className="max-w-6xl mx-auto grid md:grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div>
            <p className="inline-block rounded-full bg-lime px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-forest">Used EV procurement</p>
            <h2 id="sell-title" className="text-3xl md:text-4xl font-black mt-4 text-forest leading-tight">
              Sell your EV at the <span className="text-leaf">right price</span>
            </h2>
            <p className="text-ink/80 mt-3 mb-7 text-lg max-w-lg">
              Get the best valuation for your used EV. Answer a few quick questions and our team will contact you with an offer.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sell-ev" className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-dark px-7 py-3.5 font-extrabold text-white transition-colors electric-glow">
                Start selling my EV <ArrowRight className="w-4 h-4" aria-hidden />
              </Link>
              <a href="tel:+919045222999" className="inline-flex items-center gap-2 rounded-xl border-2 border-forest/20 bg-white px-6 py-3.5 font-bold text-forest hover:border-primary transition-colors">
                <Phone className="w-4 h-4" aria-hidden /> Talk to an expert
              </a>
            </div>
          </div>
          <div className="relative hidden md:block aspect-[4/3] rounded-3xl overflow-hidden bg-white shadow-card">
            <Image src="/sampleVechiles/ruv350695b9364c221b.webp" alt="Electric scooter" fill sizes="(min-width: 1024px) 480px, 40vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* Contact (Cream, white fields) */}
      <section id="contact" aria-labelledby="contact-title" className="py-20 md:py-24 px-4 md:px-6 bg-cream scroll-mt-36">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary text-xs font-bold uppercase tracking-widest">Get in touch</p>
            <h2 id="contact-title" className="text-4xl font-black mt-3 mb-4 text-forest">Have a question? <span className="text-leaf">Let&apos;s talk.</span></h2>
            <p className="text-ink/80 max-w-xl mx-auto">
              Whether you&apos;re exploring EVs, need a fleet solution, or just want to know more — fill in your details and our team will reach out to you.
            </p>
          </div>
          <LeasingContactForm />
        </div>
      </section>
    </main>
  );
}
