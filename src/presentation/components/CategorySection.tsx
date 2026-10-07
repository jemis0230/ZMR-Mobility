"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ShoppingBag, KeyRound, ChevronRight } from "lucide-react";

const categories = [
  { name: "2 Wheeler", slug: "2-wheeler", image: "/category-images/2-wheeler-v2.webp", description: "Electric scooters & e-bikes for personal and delivery use." },
  { name: "3 Wheeler (Cargo)", slug: "3-wheeler-cargo", image: "/category-images/3-wheeler-cargo-v2.webp", description: "Electric loaders for last-mile logistics." },
  { name: "3 Wheeler (Passenger)", slug: "3-wheeler-passenger", image: "/category-images/3-wheeler-passenger-v2.webp", description: "Eco-friendly auto-rickshaws for urban transport." },
  { name: "4 Wheeler (Passenger)", slug: "4-wheeler-passenger", image: "/category-images/4-wheeler-passenger-v2.webp", description: "Electric cars for personal and fleet use." },
  { name: "4 Wheeler (Cargo)", slug: "4-wheeler-cargo", image: "/category-images/4-wheeler-cargo-v2.webp", description: "Electric cargo vans for logistics." },
];

const MODES = [
  { key: "leasing", label: "Lease an EV", sub: "Monthly payments", icon: CalendarDays, eyebrow: "EV Leasing", cta: "Lease & drive" },
  { key: "buying", label: "Buy an EV", sub: "Full ownership", icon: ShoppingBag, eyebrow: "EV Buying", cta: "Browse & buy" },
  { key: "rent", label: "Rent an EV", sub: "Daily rentals", icon: KeyRound, eyebrow: "EV Rental", cta: "Rent & drive" },
] as const;

type Mode = (typeof MODES)[number]["key"];

/** Vehicle categories (Tint section). */
export default function CategorySection() {
  const [mode, setMode] = useState<Mode>("leasing");
  const current = MODES.find((m) => m.key === mode)!;

  return (
    <section className="py-20 px-4 md:px-6 bg-tint" aria-labelledby="categories-title">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <div role="group" aria-label="Choose how you want your EV" className="inline-flex flex-wrap gap-3 mb-8 justify-center">
            {MODES.map((m) => {
              const active = m.key === mode;
              return (
                <button
                  key={m.key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setMode(m.key)}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition-colors ${
                    active ? "bg-lime border-forest/30 text-forest shadow-sm" : "bg-white border-ink/15 text-forest hover:border-primary"
                  }`}
                >
                  <span className={`p-1.5 rounded-lg ${active ? "bg-white/60" : "bg-tint"}`}>
                    <m.icon className="w-4 h-4 text-forest" aria-hidden />
                  </span>
                  <span className="text-left">
                    <span className="block text-sm font-black">{m.label}</span>
                    <span className="block text-[11px] font-medium text-ink/75">{m.sub}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-primary text-xs font-bold uppercase tracking-widest">{current.eyebrow}</p>
          <h2 id="categories-title" className="text-3xl md:text-4xl font-black mt-2 text-forest">Select Your Vehicle Category</h2>
          <p className="text-ink/75 mt-3 text-sm">Choose the type of EV that best suits your needs.</p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <li key={cat.slug}>
              <Link
                href={`/${mode}/vehicles/${cat.slug}`}
                prefetch={false}
                className="group flex lg:flex-col items-center lg:items-stretch gap-4 h-full rounded-2xl bg-white border border-ink/10 p-3 lg:p-0 overflow-hidden hover:border-primary hover:shadow-card-hover lg:hover:-translate-y-1 transition-all"
              >
                <span className="relative block w-28 h-20 lg:w-full lg:h-auto lg:aspect-[4/3] shrink-0 bg-cream rounded-xl lg:rounded-none overflow-hidden">
                  <Image src={cat.image} alt="" fill sizes="(max-width: 1024px) 112px, 20vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </span>
                <span className="flex-1 lg:p-5">
                  <span className="block text-base lg:text-lg font-bold text-forest leading-tight">{cat.name}</span>
                  <span className="hidden sm:block text-xs text-ink/75 mt-1.5 leading-relaxed">{cat.description}</span>
                  <span className="mt-3 hidden lg:inline-flex items-center gap-1 text-primary text-xs font-bold uppercase tracking-widest">
                    {current.cta} <ChevronRight className="w-4 h-4" aria-hidden />
                  </span>
                </span>
                <ChevronRight className="lg:hidden w-5 h-5 text-sage shrink-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
