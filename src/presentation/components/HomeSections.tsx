"use client";

import { useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Cpu, Wallet, Recycle, ChevronRight, Star } from "lucide-react";
import CompanyRail from "./CompanyRail";
import CategorySection from "./CategorySection";
import AnimatedCounter from "./AnimatedCounter";

// Only downloaded when a visitor opens it.
const FleetPickerModal = dynamic(() => import("./FleetPickerModal"), { ssr: false });

// ── Data (copy already published on the ZMR website) ─────────

const features = [
  {
    icon: Recycle,
    title: "Premium Refurbished EVs",
    desc: "Every vehicle undergoes rigorous AI-powered diagnostics and refurbishment before it reaches you.",
  },
  {
    icon: Cpu,
    title: "IoT-Enabled Tracking",
    desc: "Real-time GPS, geo-fencing, battery health monitoring and remote mobilize/immobilize.",
  },
  {
    icon: Wallet,
    title: "Easy Financing & Lease",
    desc: "Flexible EMIs with minimal down payment. Tailored for gig workers, fleets, and individuals.",
  },
  {
    icon: ShieldCheck,
    title: "Warranty & Ownership Support",
    desc: "Warranty, RC transfer, NOC, insurance and buyback terms — confirmed for your vehicle before you buy.",
    href: "/warranty-ownership",
  },
];

const howItWorks = [
  { step: "01", title: "Browse & Select", desc: "Choose from our curated fleet of pre-owned EVs across 5 categories — from 2-wheelers to cargo vehicles." },
  { step: "02", title: "Submit Requirements", desc: "Share your use case, city, and fleet size. We'll match you with the perfect vehicle and lease plan." },
  { step: "03", title: "Quick KYC & Approval", desc: "100% paperless process. Get approved within 48 hours with minimal documentation." },
  { step: "04", title: "Vehicle Delivered!", desc: "Your IoT-enabled EV is delivered to your doorstep, fully serviced and ready to earn." },
];

const impact = [
  { val: 200, suffix: " Ton", label: "CO₂ Saved" },
  { val: 198, suffix: " Lakh L", label: "Fuel Saved" },
  { val: 51, suffix: "", label: "Women Entrepreneurs" },
  { val: 6000, suffix: " kg", label: "Plastics Saved" },
];

const testimonials = [
  { name: "Ramesh Kumar", role: "Delivery Partner, Lucknow", text: "ZMR made it possible for me to get my first electric vehicle with minimal deposit. My fuel savings are incredible!", rating: 5, photo: "/testimonials/client1.webp", date: "March 2025" },
  { name: "Sunita Devi", role: "Women Entrepreneur, Dehradun", text: "As a woman entrepreneur, ZMR's support has been exceptional. The IoT tracking gives me peace of mind every day.", rating: 5, photo: "/testimonials/client3.webp", date: "August 2025" },
  { name: "Fleet Manager, ID Fresh", role: "Corporate Client", text: "Managing 50+ EVs has never been easier. Real-time monitoring and ZMR's response team is always available.", rating: 5, photo: "/testimonials/client2.webp", date: "January 2026" },
];

function SectionTitle({ eyebrow, title, sub, dark = false, id }: { eyebrow: string; title: ReactNode; sub?: string; dark?: boolean; id?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-12">
      <p className={`text-xs font-bold uppercase tracking-widest ${dark ? "text-lime" : "text-primary"}`}>{eyebrow}</p>
      <h2 id={id} className={`text-3xl md:text-4xl font-black mt-2 ${dark ? "text-cream" : "text-forest"}`}>{title}</h2>
      {sub && <p className={`mt-3 ${dark ? "text-cream/85" : "text-ink/75"}`}>{sub}</p>}
    </div>
  );
}

/**
 * Home page content sections, following the ZMR colour guide:
 * Tint (categories) → White (OEM partners) → Cream (Why ZMR) → White (How it works)
 * → Forest (Our impact) → Cream (Testimonials) → [policy slot] → Gradient (final CTA).
 */
export default function HomeSections({ policySlot }: { policySlot?: ReactNode }) {
  const [isFleetPickerOpen, setIsFleetPickerOpen] = useState(false);

  return (
    <>
      <CategorySection />
      <CompanyRail />

      {/* ─── WHY ZMR (Cream) ─── */}
      <section className="py-20 md:py-24 px-4 md:px-6 bg-cream" aria-labelledby="why-title">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            id="why-title"
            eyebrow="Why ZMR Mobility"
            title="Everything you need. Nothing you don't."
            sub="We've built an end-to-end platform so you focus on your work — we handle the vehicle, the tech, and the paperwork."
          />
          <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => {
              const body = (
                <>
                  <span className="w-12 h-12 rounded-2xl bg-tint flex items-center justify-center mb-5">
                    <f.icon className="w-6 h-6 text-leaf" aria-hidden />
                  </span>
                  <h3 className="font-bold text-forest text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-ink/80 leading-relaxed">{f.desc}</p>
                  {f.href && (
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">
                      Learn more <ChevronRight className="w-4 h-4" aria-hidden />
                    </span>
                  )}
                </>
              );
              return (
                <li key={f.title}>
                  {f.href ? (
                    <Link href={f.href} className="block h-full rounded-2xl bg-white border border-ink/10 p-7 shadow-card hover:shadow-card-hover hover:border-primary/40 transition-all">
                      {body}
                    </Link>
                  ) : (
                    <div className="h-full rounded-2xl bg-white border border-ink/10 p-7 shadow-card">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ─── HOW IT WORKS (White) ─── */}
      <section className="py-20 md:py-24 px-4 md:px-6 bg-white" aria-labelledby="how-title">
        <div className="max-w-7xl mx-auto">
          <SectionTitle id="how-title" eyebrow="How it works" title={<>From browse to drive — <span className="text-leaf">in 48 hours</span></>} />
          <div className="relative">
          <div aria-hidden className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-sage to-transparent" />
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {howItWorks.map((s) => (
              <li key={s.step} className="relative text-center">
                <span className="relative w-20 h-20 mx-auto rounded-3xl bg-tint border border-sage/40 flex items-center justify-center mb-5">
                  <span className="text-2xl font-black text-primary-dark">{s.step}</span>
                </span>
                <h3 className="font-bold text-lg text-forest mb-2">{s.title}</h3>
                <p className="text-sm text-ink/80 leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ol>
          </div>
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => setIsFleetPickerOpen(true)}
              className="group inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-extrabold transition-colors electric-glow"
            >
              Get started today
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden />
            </button>
          </div>
        </div>
      </section>

      {/* ─── OUR IMPACT (Forest, Cream text, Lime numbers) ─── */}
      <section id="impact" className="py-20 md:py-24 px-4 md:px-6 bg-forest text-cream focus-on-dark" aria-labelledby="impact-title">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-lime text-xs font-bold uppercase tracking-widest">Our impact</p>
            <h2 id="impact-title" className="text-3xl md:text-4xl font-black mt-2 text-cream">
              Transforming mobility for <span className="text-lime">40 Million+</span> Indians
            </h2>
            <p className="text-cream/85 mt-4 leading-relaxed">
              Reducing carbon emissions, generating employment in clean mobility — especially across Tier-2 and Tier-3 cities — and empowering women entrepreneurs across India.
            </p>
            <Link href="/about" className="mt-6 inline-flex items-center gap-2 text-lime font-bold text-sm hover:gap-3 transition-all">
              Read our full story <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
          <dl className="grid grid-cols-2 gap-4">
            {impact.map((item) => (
              <div key={item.label} className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center">
                <dd className="font-black text-2xl md:text-3xl text-lime">
                  <AnimatedCounter target={item.val} suffix={item.suffix} duration={2000} />
                </dd>
                <dt className="text-sm text-cream/85 mt-1">{item.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ─── TESTIMONIALS (Cream) ─── */}
      <section className="py-20 md:py-24 px-4 md:px-6 bg-cream" aria-labelledby="testimonials-title">
        <div className="max-w-7xl mx-auto">
          <SectionTitle id="testimonials-title" eyebrow="Testimonials" title="Loved by customers across India" />
          <ul className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <li key={t.name} className="rounded-2xl bg-white border border-ink/10 p-7 shadow-card flex flex-col">
                <div className="flex gap-1 mb-4" role="img" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-leaf fill-leaf" aria-hidden />
                  ))}
                </div>
                <blockquote className="text-forest leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</blockquote>
                <div className="mt-6 pt-5 border-t border-ink/10 flex items-center gap-3">
                  <span className="relative w-12 h-12 rounded-full overflow-hidden bg-tint shrink-0">
                    <Image src={t.photo} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block font-bold text-forest text-sm">{t.name}</span>
                    <span className="block text-xs text-ink/75">{t.role}</span>
                    <span className="block text-[11px] font-semibold text-primary mt-0.5">{t.date}</span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {policySlot}

      {/* ─── FINAL CTA (Gradient, Forest text & button) ─── */}
      <section className="py-20 md:py-24 px-4 md:px-6 bg-zmr-gradient" aria-labelledby="cta-title">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-green-900">Ready to start?</p>
          <h2 id="cta-title" className="text-4xl md:text-5xl font-black mt-3 text-forest leading-tight">
            Your electric future starts today
          </h2>
          <p className="text-green-900 mt-4 text-lg leading-relaxed">
            Join businesses and individuals already saving on fuel, reducing emissions, and driving India&apos;s clean mobility revolution.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={() => setIsFleetPickerOpen(true)}
              className="group inline-flex items-center gap-2 bg-forest hover:bg-green-900 text-cream px-8 py-4 rounded-2xl font-extrabold transition-colors"
            >
              Browse EV fleet
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden />
            </button>
            <Link href="/about" className="inline-flex items-center gap-2 rounded-2xl border-2 border-forest px-8 py-4 font-bold text-forest hover:bg-forest hover:text-cream transition-colors">
              Our story <ChevronRight className="w-4 h-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {isFleetPickerOpen && <FleetPickerModal isOpen onClose={() => setIsFleetPickerOpen(false)} />}
    </>
  );
}
