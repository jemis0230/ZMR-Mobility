"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bike, Package, Users, Car, Truck, CalendarDays, ShoppingBag, KeyRound } from "lucide-react";

interface CategorySelectorProps {
  currentSlug: string;
  baseHref?: string;
  mode?: 'leasing' | 'buying' | 'rent';
}

const categories = [
  {
    name: "2 Wheeler",
    shortName: "2W",
    slug: "2-wheeler",
    icon: Bike,
    image: "/category-images/2-wheeler-v2.webp",
    fallbackImage: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "3 Wheeler Passenger",
    shortName: "3W (P)",
    slug: "3-wheeler-passenger",
    icon: Users,
    image: "/category-images/3-wheeler-passenger-v2.webp",
    fallbackImage: "https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "3 Wheeler Cargo",
    shortName: "3W (C)",
    slug: "3-wheeler-cargo",
    icon: Package,
    image: "/category-images/3-wheeler-cargo-v2.webp",
    fallbackImage: "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "4 Wheeler Passenger",
    shortName: "4W (P)",
    slug: "4-wheeler-passenger",
    icon: Car,
    image: "/category-images/4-wheeler-passenger-v2.webp",
    fallbackImage: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=400",
  },
  {
    name: "4 Wheeler Cargo",
    shortName: "4W (C)",
    slug: "4-wheeler-cargo",
    icon: Truck,
    image: "/category-images/4-wheeler-cargo-v2.webp",
    fallbackImage: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=400",
  },
];

function CategoryButtonImage({
  image,
  fallbackImage,
  alt,
}: {
  image: string;
  fallbackImage: string;
  alt: string;
}) {
  const [src, setSrc] = useState(image);

  return (
    <div className="relative h-full w-full">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="80px"
        onError={() => {
          if (src !== fallbackImage) setSrc(fallbackImage);
        }}
        className="object-contain"
      />
    </div>
  );
}

export default function CategorySelector({ currentSlug, baseHref = "/leasing/vehicles", mode }: CategorySelectorProps) {
  return (
    <div className="mb-8 w-full">
      {mode && (
        <div className="inline-flex gap-2 mb-5">
          <Link
            href={`/leasing/vehicles/${currentSlug}`}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
              mode === 'leasing'
                ? 'bg-primary/10 border-primary/60 text-ink shadow-[0_0_16px_rgba(139,172,104,0.15)]'
                : 'bg-ink/5 border-ink/10 text-ink/60 hover:border-ink/15 hover:text-ink/75'
            }`}
          >
            <CalendarDays className={`w-4 h-4 ${mode === 'leasing' ? 'text-primary' : 'text-ink/50'}`} />
            Lease an EV
          </Link>
          <Link
            href={`/buying/vehicles/${currentSlug}`}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
              mode === 'buying'
                ? 'bg-primary/10 border-primary/60 text-ink shadow-[0_0_16px_rgba(139,172,104,0.15)]'
                : 'bg-ink/5 border-ink/10 text-ink/60 hover:border-ink/15 hover:text-ink/75'
            }`}
          >
            <ShoppingBag className={`w-4 h-4 ${mode === 'buying' ? 'text-primary' : 'text-ink/50'}`} />
            Buy an EV
          </Link>
          <Link
            href={`/rent/vehicles/${currentSlug}`}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all ${
              mode === 'rent'
                ? 'bg-primary/10 border-primary/60 text-ink shadow-[0_0_16px_rgba(139,172,104,0.15)]'
                : 'bg-ink/5 border-ink/10 text-ink/60 hover:border-ink/15 hover:text-ink/75'
            }`}
          >
            <KeyRound className={`w-4 h-4 ${mode === 'rent' ? 'text-primary' : 'text-ink/50'}`} />
            Rent an EV
          </Link>
        </div>
      )}
      <span className="text-ink/60 text-xs font-bold uppercase tracking-widest block mb-3">Select Vehicle Category:</span>
      <div className="grid grid-cols-5 gap-1.5 md:gap-2 lg:gap-3">
        {categories.map((cat) => {
          const isActive = currentSlug === cat.slug;
          const activeClass = isActive
            ? "bg-primary/10 border-primary text-ink electric-glow"
            : "bg-ink/5 border-ink/[0.08] text-ink/65 hover:bg-ink/10 hover:border-ink/15 hover:text-ink/90";

          return (
            <Link
              key={cat.slug}
              href={`${baseHref}/${cat.slug}`}
              className={`rounded-xl transition-all border overflow-hidden group ${activeClass}`}
            >
              {/* Mobile: compact icon + label pill, no image */}
              <div className="lg:hidden flex flex-col items-center justify-center gap-1 py-2.5 px-1">
                <div className={`p-1.5 rounded-lg ${isActive ? "bg-primary/20" : "bg-ink/5"}`}>
                  <cat.icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-ink/60"}`} />
                </div>
                <p className="text-[10px] font-bold leading-tight text-center">{cat.shortName}</p>
              </div>

              {/* Desktop: image card */}
              <div className="hidden lg:flex items-center gap-3 p-2.5">
                <div className={`rounded-xl p-1.5 shrink-0 transition-colors ${isActive ? "bg-primary/20" : "bg-background/50 group-hover:bg-background/80"}`}>
                  <div className="relative h-14 w-20">
                    <CategoryButtonImage image={cat.image} fallbackImage={cat.fallbackImage} alt={cat.name} />
                  </div>
                </div>
                <div className="min-w-0 py-1">
                  <div className={`mb-0.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest ${isActive ? "text-primary" : "text-ink/50 group-hover:text-ink/65"}`}>
                    <cat.icon className="w-3 h-3" />
                    Category
                  </div>
                  <p className="text-sm lg:text-base font-bold leading-tight truncate">{cat.shortName}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
