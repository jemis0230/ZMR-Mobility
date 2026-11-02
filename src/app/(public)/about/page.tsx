import type { Metadata } from "next";
import { CUSTOMER_PHOTOS } from "@/lib/customerPhotos";
import PhotoLocation from "@/presentation/components/PhotoLocation";
import { publicFuelSavings } from "@/lib/impact";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Cpu, Shield, Zap, Battery, Gauge, FileCheck2, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Our Story | ZMR Mobility — Technology-First EV Asset Management",
  description:
    "ZMR Mobility is a technology-first EV asset management company offering solutions for electric vehicles — sale, lease, IoT and refinance — to make clean mobility accessible in India.",
  alternates: { canonical: "/about" },
};

// Content on this page restates what ZMR Mobility already publishes. Add new facts,
// numbers or commitments only once the company has confirmed them.

const problems = [
  "High cost of new EVs for lower-income groups, B2B fleets, retail individuals and gig workers",
  "Minimal to zero financing available for India's growing gig-economy workforce",
  "No access to a reliable, affordable after-sales and service ecosystem for fleets",
  "No visibility of vehicle assets or performance without IoT / telematics",
  "Unreliable performance of second-hand EVs bought from unorganised markets",
  "Unpredictable battery behaviour during long-term use",
];

const approach = [
  { icon: Shield, title: "Pre-owned EVs you can rely on", desc: "Refurbished electric vehicles at accessible prices for individuals and micro-entrepreneurs." },
  { icon: Gauge, title: "Valuation beyond the odometer", desc: "We look at battery health, software diagnostics, range and lifecycle data — not only age or kilometres." },
  { icon: Battery, title: "Battery-first refurbishment", desc: "Data and diagnostics help us understand each EV's battery and BMS health." },
  { icon: Cpu, title: "IoT-enabled vehicles", desc: "GPS tracking, geo-fencing, mobilise/immobilise and battery health monitoring." },
  { icon: Zap, title: "Flexible EMI options", desc: "Customised EMI options for micro-entrepreneurs and retail customers, through financing partners." },
  { icon: FileCheck2, title: "Ownership support", desc: "Help with RC transfer, NOC, insurance and warranty questions for the vehicle you choose." },
];

const fuel = publicFuelSavings();

// Figures as published by ZMR Mobility (also shown on the home page).
const impact = [
  { value: "176 Lakh Km", label: "Green kilometres travelled" },
  { value: "200 Ton", label: "CO₂ saved" },
  // Fuel: shown only when verified inputs exist (src/lib/impact.ts); the earlier
  // "198 Lakh L" had no recorded source and conflicts with the km figure.
  fuel.available ? { value: fuel.display, label: fuel.label } : { value: "Being verified", label: "Estimated petrol avoided" },
  { value: "6,000 kg", label: "Plastics saved" },
];

// Expansion plan as published by ZMR Mobility.
const journey = [
  { year: "2025", status: "Completed", cities: ["Lucknow", "NCR", "Dehradun", "Chennai", "Bangalore"] },
  { year: "2026", status: "Current", cities: ["Jaipur", "Agra", "Udaipur", "Bhopal", "Nagpur"] },
  { year: "2027", status: "Next phase", cities: ["Kochi", "Meerut", "Mysore", "Chandigarh", "Kashmir"] },
];

const customerPhotos = CUSTOMER_PHOTOS;

const team = [
  { name: "Javed Ali", role: "Founder & Director", photo: "/profile-photos/javedAliProfilePhoto.jpeg", linkedin: "https://www.linkedin.com/in/javed-ali-5b563256/" },
  { name: "Juned Ali", role: "Co-Founder", photo: "/profile-photos/juanidAliProfilePhoto.jpeg", linkedin: "https://www.linkedin.com/in/juned-ali-52b84220b/" },
];

function SectionHeading({ eyebrow, title, intro, id, light = false }: { eyebrow: string; title: string; intro?: string; id: string; light?: boolean }) {
  return (
    <div className="max-w-2xl">
      <p className={`text-xs font-bold uppercase tracking-widest ${light ? "text-lime" : "text-primary"}`}>{eyebrow}</p>
      <h2 id={id} className={`text-3xl md:text-4xl font-black mt-2 ${light ? "text-cream" : "text-forest"}`}>{title}</h2>
      {intro && <p className={`mt-3 leading-relaxed ${light ? "text-cream/85" : "text-ink/80"}`}>{intro}</p>}
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      {/* Hero */}
      <section className="pt-28 lg:pt-40 pb-14 md:pb-20 px-4 md:px-6 bg-cream">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.25fr_1fr] gap-10 lg:gap-16 items-center">
          <div>
            <p className="inline-flex items-center rounded-full bg-lime px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-forest">Our story</p>
            <h1 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-forest">
              Accelerating India towards <span className="text-leaf">sustainable mobility</span>
            </h1>
            <p className="mt-5 text-base md:text-lg leading-relaxed text-ink/80 max-w-2xl">
              ZMR Mobility Private Limited is a technology-first EV asset management company working in India&apos;s clean-mobility
              sector. We operate within the circular economy, offering solutions for electric vehicles across sale, lease, IoT and refinance.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/explore" className="group inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-dark px-7 py-3.5 font-extrabold text-white transition-colors electric-glow">
                Browse EVs <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
              </Link>
              <Link href="/#contact" className="inline-flex items-center rounded-xl border-2 border-forest/20 bg-white px-6 py-3.5 font-bold text-forest hover:border-primary transition-colors">
                Contact us
              </Link>
            </div>
          </div>
          <div className="rounded-3xl bg-white border border-ink/10 shadow-card p-8 md:p-12 flex items-center justify-center">
            <Image src="/zmr-logo-full.png" alt="ZMR Mobility logo" width={579} height={361} sizes="(min-width: 1024px) 420px, 80vw" priority className="w-full max-w-[420px] h-auto" />
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section aria-labelledby="who-title" className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <SectionHeading id="who-title" eyebrow="Who we are" title="Clean mobility, made accessible" />
          <div className="space-y-4 text-ink/80 leading-relaxed text-base md:text-lg">
            <p>
              Our mission is to help build a carbon-free India by empowering individuals, businesses and communities to adopt clean,
              efficient and future-ready mobility.
            </p>
            <p>
              We focus on making electric vehicles affordable and dependable — for individuals, gig-economy workers, micro-entrepreneurs
              and fleets — so that more people can take part in India&apos;s move to electric.
            </p>
          </div>
        </div>
      </section>

      {/* The problem */}
      <section aria-labelledby="problem-title" className="py-16 md:py-24 px-4 md:px-6 bg-tint">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            id="problem-title"
            eyebrow="The problem"
            title="What holds back EV adoption"
            intro="India's EV transition is under way, but many people are left out by gaps in access, finance and trust."
          />
          <ul className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {problems.map((p) => (
              <li key={p} className="rounded-2xl bg-white border border-ink/10 p-5 text-ink/85 leading-relaxed flex gap-3">
                <span aria-hidden className="mt-2 w-2 h-2 rounded-full bg-leaf shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Our approach */}
      <section id="solutions" aria-labelledby="approach-title" className="py-16 md:py-24 px-4 md:px-6 bg-white scroll-mt-36">
        <div className="max-w-7xl mx-auto">
          <SectionHeading
            id="approach-title"
            eyebrow="Our approach"
            title="Pre-owned electric mobility, done properly"
            intro="We use technology and data to assess, refurbish and manage pre-owned EVs — making them reliable and affordable."
          />
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {approach.map((a) => (
              <div key={a.title} className="rounded-2xl border border-ink/10 bg-cream p-6">
                <div className="w-11 h-11 rounded-xl bg-lime/50 flex items-center justify-center">
                  <a.icon className="w-5 h-5 text-forest" aria-hidden />
                </div>
                <h3 className="mt-4 font-bold text-forest">{a.title}</h3>
                <p className="mt-1.5 text-sm text-ink/80 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-ink/75">
            Terms for warranty, ownership transfer and financing depend on the vehicle — see{" "}
            <Link href="/warranty-ownership" className="font-semibold text-primary underline-offset-4 hover:underline">Warranty &amp; Ownership Support</Link>.
          </p>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" aria-labelledby="impact-title" className="py-16 md:py-24 px-4 md:px-6 bg-forest focus-on-dark scroll-mt-36">
        <div className="max-w-7xl mx-auto">
          <SectionHeading id="impact-title" eyebrow="Our impact" title="Impact so far" light />
          <dl className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {impact.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <dt className="text-sm text-cream/80">{s.label}</dt>
                <dd className="mt-1 text-2xl md:text-3xl font-black text-lime">{s.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-cream/70">Figures as reported by ZMR Mobility.</p>
        </div>
      </section>

      {/* Journey */}
      <section aria-labelledby="journey-title" className="py-16 md:py-24 px-4 md:px-6 bg-cream">
        <div className="max-w-7xl mx-auto">
          <SectionHeading id="journey-title" eyebrow="Our journey" title="Growing city by city" />
          <ol className="mt-10 grid md:grid-cols-3 gap-5">
            {journey.map((j) => (
              <li key={j.year} className="rounded-2xl bg-white border border-ink/10 p-6 shadow-card">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-3xl font-black text-forest">{j.year}</span>
                  <span className="rounded-full bg-tint px-3 py-1 text-xs font-bold text-forest">{j.status}</span>
                </div>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {j.cities.map((c) => (
                    <li key={c} className="inline-flex items-center gap-1 rounded-full bg-cream border border-ink/10 px-3 py-1 text-sm text-ink/85">
                      <MapPin className="w-3.5 h-3.5 text-leaf" aria-hidden /> {c}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <Link href="/#presence" className="mt-6 inline-flex items-center gap-2 min-h-[44px] font-bold text-primary hover:gap-3 transition-all">
            See our presence map <ArrowRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Customers */}
      <section aria-labelledby="customers-title" className="py-16 md:py-24 px-4 md:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionHeading id="customers-title" eyebrow="Our customers" title="Riding electric with ZMR" />
          <ul className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {customerPhotos.map((p) => (
              <li key={p.src}>
                <figure>
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-tint">
                    {/* Original photo files, shown whole and unmodified. */}
                    <Image src={p.src} alt={p.alt} fill unoptimized loading="lazy" className="object-contain" />
                  </div>
                  {p.location?.label && (
                    <figcaption className="mt-2 px-1"><PhotoLocation location={p.location} /></figcaption>
                  )}
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Team */}
      <section id="team" aria-labelledby="team-title" className="py-16 md:py-24 px-4 md:px-6 bg-tint scroll-mt-36">
        <div className="max-w-7xl mx-auto">
          <SectionHeading id="team-title" eyebrow="The team" title="Leadership" />
          <ul className="mt-10 flex flex-wrap gap-6">
            {team.map((m) => (
              <li key={m.name} className="w-full sm:w-72 rounded-2xl bg-white border border-ink/10 p-6 text-center">
                <div className="w-32 h-32 mx-auto rounded-2xl overflow-hidden">
                  <Image src={m.photo} alt={m.name} width={160} height={160} className="w-full h-full object-cover" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-forest">{m.name}</h3>
                <p className="text-sm text-primary font-medium">{m.role}</p>
                <a
                  href={m.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center justify-center min-h-[44px] rounded-full border border-ink/15 px-5 text-xs font-bold text-forest hover:border-primary"
                >
                  {m.name} on LinkedIn
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-zmr-gradient">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black text-forest">Ready to go electric?</h2>
          <p className="mt-3 text-green-900">Browse pre-owned electric scooters and bikes, or talk to our team.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/explore" className="inline-flex items-center gap-2 rounded-xl bg-forest px-7 py-3.5 font-extrabold text-cream hover:bg-green-900 transition-colors">
              Browse EVs <ArrowRight className="w-4 h-4" aria-hidden />
            </Link>
            <Link href="/#contact" className="inline-flex items-center rounded-xl border-2 border-forest/30 bg-white/70 px-6 py-3.5 font-bold text-forest hover:bg-white transition-colors">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
