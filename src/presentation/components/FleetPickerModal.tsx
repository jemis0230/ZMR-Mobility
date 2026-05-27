"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Zap, Package, Users, Car, CalendarDays, ShoppingBag, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Intent = "leasing" | "buying" | "rent";

const INTENTS = [
  {
    value: "leasing" as Intent,
    label: "Lease",
    icon: CalendarDays,
    desc: "Monthly EMIs, flexible terms",
    selectedCls: "border-primary/60 bg-primary/10 ring-2 ring-primary/20",
    idleCls: "border-white/10 bg-white/5 hover:border-primary/30 hover:bg-primary/5",
    textCls: "text-primary",
  },
  {
    value: "buying" as Intent,
    label: "Buy",
    icon: ShoppingBag,
    desc: "Own it outright, one-time purchase",
    selectedCls: "border-emerald-400/60 bg-emerald-400/10 ring-2 ring-emerald-400/20",
    idleCls: "border-white/10 bg-white/5 hover:border-emerald-400/30 hover:bg-emerald-400/5",
    textCls: "text-emerald-400",
  },
  {
    value: "rent" as Intent,
    label: "Rent",
    icon: Clock,
    desc: "Daily or weekly, no commitment",
    selectedCls: "border-orange-400/60 bg-orange-400/10 ring-2 ring-orange-400/20",
    idleCls: "border-white/10 bg-white/5 hover:border-orange-400/30 hover:bg-orange-400/5",
    textCls: "text-orange-400",
  },
];

const CATEGORIES = [
  { name: "2 Wheeler",       slug: "2-wheeler",            icon: Zap,     image: "/category-images/2-wheeler.webp",           desc: "Scooters & E-Bikes"    },
  { name: "3W Cargo",        slug: "3-wheeler-cargo",       icon: Package, image: "/category-images/3-wheeler-cargo.webp",     desc: "Cargo Loaders"         },
  { name: "3W Passenger",    slug: "3-wheeler-passenger",   icon: Users,   image: "/category-images/3-wheeler-passenger.webp", desc: "E-Rickshaws & Autos"   },
  { name: "4W Passenger",    slug: "4-wheeler-passenger",   icon: Car,     image: "/category-images/4-wheeler-passenger.webp", desc: "Electric Cars"         },
  { name: "4W Cargo",        slug: "4-wheeler-cargo",       icon: Package, image: "/category-images/4-wheeler-cargo.webp",     desc: "Cargo Vans"            },
];

const BASE_PATH: Record<Intent, string> = {
  leasing: "/leasing/vehicles",
  buying:  "/buying/vehicles",
  rent:    "/rent/vehicles",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function CategoryImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      sizes="(max-width: 640px) 80px, 120px"
      className="object-contain transition-transform duration-300 group-hover:scale-110"
      onError={() => setImgSrc("/sampleVechiles/c12i-max6a0da949da693.webp")}
    />
  );
}

export default function FleetPickerModal({ isOpen, onClose }: Props) {
  const [intent, setIntent] = useState<Intent | null>(null);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const w = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${w}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // Reset intent when modal closes
  useEffect(() => {
    if (!isOpen) setIntent(null);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Sheet — slides up on mobile, fades in center on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full sm:max-w-2xl bg-[#0d1117] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh] sm:max-h-[88vh]"
          >
            {/* Drag handle — mobile only */}
            <div className="sm:hidden w-10 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-7 pt-4 sm:pt-6 pb-3 shrink-0">
              <div>
                <h2 className="text-lg sm:text-2xl font-black text-white">Find Your EV</h2>
                <p className="text-white/40 text-xs sm:text-sm mt-0.5">Pick what you want, then choose a vehicle type.</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-5 sm:px-7 pb-6 sm:pb-8 space-y-6">

              {/* ── Step 1: Intent ── */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-3">
                  What are you looking for?
                </p>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {INTENTS.map(({ value, label, icon: Icon, desc, selectedCls, idleCls, textCls }) => {
                    const active = intent === value;
                    return (
                      <button
                        key={value}
                        onClick={() => setIntent(value)}
                        className={`relative flex flex-col items-center text-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-2xl border transition-all duration-200 ${active ? selectedCls : idleCls}`}
                      >
                        <div className={`p-2 sm:p-2.5 rounded-xl ${active ? "bg-white/10" : "bg-white/5"} transition-colors`}>
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${active ? textCls : "text-white/40"}`} />
                        </div>
                        <span className={`text-sm sm:text-base font-extrabold ${active ? textCls : "text-white/60"}`}>{label}</span>
                        <span className="hidden sm:block text-[10px] text-white/30 leading-tight">{desc}</span>
                        {active && (
                          <motion.div
                            layoutId="intent-indicator"
                            className="absolute inset-0 rounded-2xl pointer-events-none"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Divider ── */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <p className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${intent ? "text-white/30" : "text-white/15"}`}>
                  Now pick a vehicle type
                </p>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* ── Step 2: Category ── */}
              <div className={`grid grid-cols-1 sm:grid-cols-5 gap-2 sm:gap-3 transition-opacity duration-300 ${intent ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
                {CATEGORIES.map(({ name, slug, icon: Icon, image, desc }) => {
                  const href = intent ? `${BASE_PATH[intent]}/${slug}` : "#";
                  return (
                    <Link
                      key={slug}
                      href={href}
                      onClick={onClose}
                      className="group flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0 p-3 sm:p-4 rounded-2xl border border-white/8 bg-white/3 hover:border-primary/40 hover:bg-white/8 transition-all duration-200 sm:hover:-translate-y-1"
                    >
                      {/* Image */}
                      <div className="relative w-14 h-14 sm:w-full sm:h-20 shrink-0 sm:mb-3">
                        <CategoryImage src={image} alt={name} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 sm:flex-none">
                        <p className="text-sm font-bold text-white group-hover:text-primary transition-colors leading-tight">{name}</p>
                        <p className="text-[10px] text-white/35 mt-0.5">{desc}</p>
                      </div>

                      {/* Mobile arrow */}
                      <ArrowRight className="sm:hidden w-4 h-4 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />

                      {/* Desktop icon */}
                      <div className="hidden sm:flex mt-2 items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        Explore <ArrowRight className="w-3 h-3" />
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Hint when no intent selected */}
              {!intent && (
                <p className="text-center text-xs text-white/25">
                  ↑ Select Lease, Buy, or Rent above to browse vehicles
                </p>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
