"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Battery, Users, TrendingUp, Shield, CalendarDays, ShoppingBag, KeyRound, ChevronRight } from "lucide-react";

const categories = [
  {
    name: "2 Wheeler",
    slug: "2-wheeler",
    icon: Zap,
    image: "/category-images/2-wheeler.webp",
    fallbackImage: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=400",
    description: "Electric Scooters & E-Bikes for personal & delivery use.",
  },
  {
    name: "3 Wheeler (Cargo)",
    slug: "3-wheeler-cargo",
    icon: Battery,
    image: "/category-images/3-wheeler-cargo.webp",
    fallbackImage: "https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&q=80&w=400",
    description: "Reliable electric loaders for last-mile logistics.",
  },
  {
    name: "3 Wheeler (Passenger)",
    slug: "3-wheeler-passenger",
    icon: Users,
    image: "/category-images/3-wheeler-passenger.webp",
    fallbackImage: "https://images.unsplash.com/photo-1567113463300-102a7eb3cb26?auto=format&fit=crop&q=80&w=400",
    description: "Eco-friendly auto-rickshaws for urban transport.",
  },
  {
    name: "4 Wheeler (Passenger)",
    slug: "4-wheeler-passenger",
    icon: TrendingUp,
    image: "/category-images/4-wheeler-passenger.webp",
    fallbackImage: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=400",
    description: "Premium electric cars for personal & fleet use.",
  },
  {
    name: "4 Wheeler (Cargo)",
    slug: "4-wheeler-cargo",
    icon: Shield,
    image: "/category-images/4-wheeler-cargo.webp",
    fallbackImage: "https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=400",
    description: "Heavy-duty electric cargo vans for logistics.",
  },
];

function CategoryCardImage({ image, fallbackImage, alt }: { image: string; fallbackImage: string; alt: string }) {
  const [src, setSrc] = useState(image);
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 20vw"
      onError={() => { if (src !== fallbackImage) setSrc(fallbackImage); }}
      className="object-contain transition-transform duration-500 group-hover:scale-110"
    />
  );
}

export default function CategorySection() {
  const [catMode, setCatMode] = useState<'leasing' | 'buying' | 'rent'>('leasing');

  return (
    <section className="py-20 px-6 border-y border-ink/[0.08] bg-ink/[0.02]">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          {/* Lease / Buy / Rent mode selector */}
          <div className="inline-flex flex-wrap gap-3 mb-8 justify-center">
            <button
              onClick={() => setCatMode('leasing')}
              className={`group flex items-center gap-3 px-6 py-3.5 rounded-2xl border transition-all duration-300 ${
                catMode === 'leasing'
                  ? 'bg-primary/10 border-primary/60 text-ink shadow-[0_0_24px_rgba(56,152,236,0.15)]'
                  : 'bg-ink/3 border-ink/10 text-ink/60 hover:border-ink/15 hover:text-ink/70'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${catMode === 'leasing' ? 'bg-primary/20' : 'bg-ink/5'}`}>
                <CalendarDays className={`w-4 h-4 ${catMode === 'leasing' ? 'text-primary' : 'text-ink/50'}`} />
              </div>
              <div className="text-left">
                <div className="text-sm font-black">Lease an EV</div>
                <div className="text-[11px] opacity-50 font-medium">Monthly payments</div>
              </div>
              {catMode === 'leasing' && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-1" />}
            </button>

            <button
              onClick={() => setCatMode('buying')}
              className={`group flex items-center gap-3 px-6 py-3.5 rounded-2xl border transition-all duration-300 ${
                catMode === 'buying'
                  ? 'bg-primary/10 border-primary/60 text-ink shadow-[0_0_24px_rgba(56,152,236,0.15)]'
                  : 'bg-ink/3 border-ink/10 text-ink/60 hover:border-ink/15 hover:text-ink/70'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${catMode === 'buying' ? 'bg-primary/20' : 'bg-ink/5'}`}>
                <ShoppingBag className={`w-4 h-4 ${catMode === 'buying' ? 'text-primary' : 'text-ink/50'}`} />
              </div>
              <div className="text-left">
                <div className="text-sm font-black">Buy an EV</div>
                <div className="text-[11px] opacity-50 font-medium">Full ownership</div>
              </div>
              {catMode === 'buying' && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-1" />}
            </button>

            <button
              onClick={() => setCatMode('rent')}
              className={`group flex items-center gap-3 px-6 py-3.5 rounded-2xl border transition-all duration-300 ${
                catMode === 'rent'
                  ? 'bg-primary/10 border-primary/60 text-ink shadow-[0_0_24px_rgba(56,152,236,0.15)]'
                  : 'bg-ink/3 border-ink/10 text-ink/60 hover:border-ink/15 hover:text-ink/70'
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${catMode === 'rent' ? 'bg-primary/20' : 'bg-ink/5'}`}>
                <KeyRound className={`w-4 h-4 ${catMode === 'rent' ? 'text-primary' : 'text-ink/50'}`} />
              </div>
              <div className="text-left">
                <div className="text-sm font-black">Rent an EV</div>
                <div className="text-[11px] opacity-50 font-medium">Daily rentals</div>
              </div>
              {catMode === 'rent' && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse ml-1" />}
            </button>
          </div>
          <span className="block text-primary text-xs font-bold uppercase tracking-widest">
            {catMode === 'leasing' ? 'EV Leasing' : catMode === 'buying' ? 'EV Buying' : 'EV Rental'}
          </span>
          <h2 className="text-3xl md:text-4xl font-black mt-2">Select Your <span className="text-primary">Vehicle Category</span></h2>
          <p className="text-ink/60 mt-3 text-sm">Choose the type of EV that best suits your needs.</p>
        </motion.div>

        <div className="flex flex-col lg:grid lg:grid-cols-5 gap-3 md:gap-5 w-full">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              viewport={{ once: true }}
            >
              <Link
                href={`/${catMode}/vehicles/${cat.slug}`}
                prefetch={false}
                className="group relative flex flex-row lg:flex-col h-[90px] lg:h-[340px] rounded-2xl lg:rounded-[2rem] glass-card overflow-hidden border border-ink/[0.08] hover:border-primary/40 transition-all duration-500 lg:hover:-translate-y-2 lg:hover:shadow-[0_15px_40px_-10px_rgba(56,152,236,0.25)] bg-ink/5 hover:bg-ink/10 w-full"
              >
                {/* Shimmer sweep on hover */}
                <div className="absolute inset-0 z-30 opacity-0 group-hover:opacity-100 overflow-hidden rounded-[inherit] pointer-events-none transition-opacity duration-300">
                  <div className="ev-shimmer-sweep" />
                </div>

                {/* Image */}
                <div className="absolute lg:inset-x-0 lg:top-0 inset-y-0 right-0 w-[45%] lg:w-full lg:h-[60%] p-2 lg:p-8 flex items-center justify-center">
                  <div className="relative w-full h-full opacity-80 group-hover:opacity-100 transition-opacity">
                    <CategoryCardImage image={cat.image} fallbackImage={cat.fallbackImage} alt={cat.name} />
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r lg:bg-gradient-to-t from-background/95 lg:from-background via-background/80 lg:via-background/20 to-transparent lg:to-transparent z-10" />

                <div className="absolute inset-0 z-20 flex flex-col justify-center lg:justify-end p-5 lg:p-6 w-[75%] lg:w-full">
                  <div className="flex items-center gap-2 mb-1 lg:mb-3 opacity-80 lg:opacity-100">
                    <div className="p-1.5 lg:p-2 rounded-lg bg-primary/20 lg:bg-ink/5 backdrop-blur-sm border border-primary/20 lg:border-ink/10 lg:group-hover:border-primary/30 lg:group-hover:bg-primary/20 transition-colors">
                      <cat.icon className="w-3.5 h-3.5 lg:w-5 lg:h-5 text-primary lg:text-ink lg:group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                  <h3 className="text-[15px] md:text-lg lg:text-xl font-bold text-ink leading-tight drop-shadow-md">{cat.name}</h3>
                  <p className="hidden lg:block text-xs text-ink/65 mt-3 line-clamp-2 leading-relaxed">{cat.description}</p>
                  <div className="hidden lg:flex mt-5 items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0 duration-500 ease-out">
                    {catMode === 'leasing' ? 'Lease & Drive' : catMode === 'buying' ? 'Browse & Buy' : 'Rent & Drive'} <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-ink/5 group-hover:bg-primary text-ink/65 group-hover:text-white transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
