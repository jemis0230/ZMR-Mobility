"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, IndianRupee, Car, Tag, CalendarDays, Gauge } from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import {
  PRICE_BUCKETS, BODY_TYPES, YEAR_OPTIONS, KM_OPTIONS, FALLBACK_MAKES,
  exploreHref, priceHref, bodyTypeHref, type MakeWithModels,
} from "@/lib/explore";

const BRAND_LOGOS: Record<string, string> = {
  bajaj: "/companies/bajaj.webp",
  bgauss: "/companies/bgauss.webp",
  byd: "/companies/byd.webp",
  citroen: "/companies/citroen.webp",
  euler: "/companies/euler.webp",
  mg: "/companies/mg.webp",
  "montra electric": "/companies/montra_electric.webp",
  piaggio: "/companies/piaggio.webp",
  tata: "/companies/tataMotors-ezgif.com-png-to-webp-converter.webp",
  tvs: "/companies/tvs-ezgif.com-png-to-webp-converter.webp",
};

const TRUST_STATS = [
  { value: 4, suffix: "+", label: "Cities Active" },
  { value: 360, suffix: "+", label: "EVs Tracked Live" },
  { value: 200, suffix: " Ton", label: "CO₂ Saved" },
  { value: 176, suffix: " Lakh Km", label: "Green KM Driven" },
];

const TABS = [
  { key: "budget", label: "Budget", icon: IndianRupee },
  { key: "body", label: "Body Type", icon: Car },
  { key: "brand", label: "Brand", icon: Tag },
  { key: "year", label: "Year", icon: CalendarDays },
  { key: "km", label: "KM Driven", icon: Gauge },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function Tile({ href, title, sub }: { href: string; title: string; sub?: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white px-5 py-4 hover:border-primary/40 hover:shadow-card-hover transition-all"
    >
      <span>
        <span className="block text-[15px] font-bold text-ink group-hover:text-primary transition-colors">{title}</span>
        {sub && <span className="block text-xs text-ink/50 mt-0.5">{sub}</span>}
      </span>
      <ChevronRight className="w-4 h-4 text-ink/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

export function TrustBar() {
  return (
    <div className="relative z-10 -mt-8 px-4 md:px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 rounded-2xl bg-white border border-ink/[0.08] shadow-card divide-x divide-y md:divide-y-0 divide-ink/[0.08] overflow-hidden">
        {TRUST_STATS.map((s) => (
          <div key={s.label} className="px-5 py-4 text-center">
            <p className="text-xl md:text-2xl font-black text-primary">
              <AnimatedCounter target={s.value} suffix={s.suffix} duration={1800} />
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/55 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HomeExplore({ makes }: { makes: MakeWithModels[] }) {
  const [tab, setTab] = useState<TabKey>("budget");
  const brands = (makes.length > 0 ? makes : FALLBACK_MAKES).slice(0, 10);

  return (
    <section className="py-16 md:py-20 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Find your perfect EV</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2 text-ink">Explore Certified EVs</h2>
          </div>
          <Link href={exploreHref()} className="inline-flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all">
            View all EVs <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tabs */}
        <div role="tablist" className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setTab(t.key)}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                  active ? "bg-primary text-white shadow-md shadow-primary/25" : "bg-white border border-ink/10 text-ink/70 hover:border-primary/40 hover:text-primary"
                }`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Panels */}
        {tab === "budget" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRICE_BUCKETS.map((b) => <Tile key={b.label} href={priceHref(b)} title={b.label} sub="Certified EVs" />)}
            <Tile href={exploreHref({ sort: "price_asc" })} title="Lowest price first" sub="Best deals today" />
          </div>
        )}

        {tab === "body" && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {BODY_TYPES.map((bt) => (
              <Link
                key={bt.category}
                href={bodyTypeHref(bt.category)}
                className="group rounded-2xl border border-ink/10 bg-white overflow-hidden hover:border-primary/40 hover:shadow-card-hover transition-all"
              >
                <div className="relative aspect-[4/3] bg-gradient-to-b from-secondary to-white">
                  <Image src={bt.image} alt={bt.label} fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="px-4 py-3">
                  <p className="font-bold text-ink group-hover:text-primary transition-colors">{bt.label}</p>
                  <p className="text-xs text-ink/50">{bt.hint}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {tab === "brand" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {brands.map((b) => {
              const logo = BRAND_LOGOS[b.make.toLowerCase()];
              return (
                <Link
                  key={b.make}
                  href={exploreHref({ make: b.make })}
                  className="group flex flex-col items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-white px-4 py-5 hover:border-primary/40 hover:shadow-card-hover transition-all"
                >
                  <span className="relative h-10 w-24 flex items-center justify-center">
                    {logo ? (
                      <Image src={logo} alt={b.make} fill sizes="96px" className="object-contain" />
                    ) : (
                      <span className="text-2xl font-black text-primary/80">{b.make.slice(0, 1)}</span>
                    )}
                  </span>
                  <span className="text-sm font-bold text-ink group-hover:text-primary">{b.make}</span>
                  <span className="text-[11px] text-ink/45 line-clamp-1 text-center">{b.models.slice(0, 3).join(" · ")}</span>
                </Link>
              );
            })}
          </div>
        )}

        {tab === "year" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {YEAR_OPTIONS.map((y) => <Tile key={y} href={exploreHref({ minYear: y })} title={`${y} & above`} sub="Newer models" />)}
          </div>
        )}

        {tab === "km" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {KM_OPTIONS.map((km) => <Tile key={km} href={exploreHref({ maxKm: km })} title={`${km.toLocaleString("en-IN")} kms or less`} sub="Low-usage EVs" />)}
            <Tile href={exploreHref({ sort: "km_asc" })} title="Lowest KM first" sub="Almost new" />
          </div>
        )}
      </div>
    </section>
  );
}
