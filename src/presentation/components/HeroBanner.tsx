"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, BadgeCheck } from "lucide-react";

type Slide = {
  eyebrow: string;
  title: [string, string];
  sub: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
  image: string;
  imagePosition: string;
  tone: "dark" | "light";
};

const SLIDES: Slide[] = [
  {
    eyebrow: "ZMR Certified Pre-owned EVs",
    title: ["Buy an electric vehicle", "you'll love to drive"],
    sub: "200+ point inspection, up to 24-month warranty and easy EMIs — delivered to your doorstep.",
    cta: { label: "View all EVs", href: "/explore" },
    secondary: { label: "Under 1 Lakh", href: "/explore?maxPrice=100000" },
    image: "/person_holding_key.webp",
    imagePosition: "object-[70%_30%]",
    tone: "dark",
  },
  {
    eyebrow: "Fleet Leasing",
    title: ["Power your last-mile", "fleet with EVs"],
    sub: "Flexible monthly plans with IoT tracking, maintenance and insurance included.",
    cta: { label: "Explore Leasing", href: "/leasing/vehicles/3-wheeler-cargo" },
    secondary: { label: "Cargo EVs", href: "/explore?type=3-wheeler-cargo" },
    image: "/sampleVechiles/mahindra-treo-zor-46219.webp",
    imagePosition: "object-[65%_50%]",
    tone: "dark",
  },
  {
    eyebrow: "Sell Your EV",
    title: ["Sell your EV", "at the right price"],
    sub: "Get a fair valuation in minutes. Free inspection and instant payment.",
    cta: { label: "Sell your EV", href: "/sell-ev" },
    image: "/sampleVechiles/c12i-max6a0da949da693.webp",
    imagePosition: "object-[80%_50%]",
    tone: "light",
  },
  {
    eyebrow: "Smart & Connected",
    title: ["IoT-enabled EVs,", "monitored 24×7"],
    sub: "Real-time GPS, battery health and geo-fencing on every vehicle we deliver.",
    cta: { label: "Know more", href: "/about" },
    image: "/about-hero.png",
    imagePosition: "object-center",
    tone: "dark",
  },
];

const INTERVAL = 6000;

export default function HeroBanner() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((dir: 1 | -1) => setIndex((i) => (i + dir + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go(1), INTERVAL);
    return () => clearInterval(id);
  }, [paused, go, index]);

  const slide = SLIDES[index];
  const dark = slide.tone === "dark";

  return (
    <section
      className="relative pt-16 lg:pt-[120px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="relative h-[520px] md:h-[460px] lg:h-[540px] overflow-hidden bg-primary-deep">
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0"
          >
            <Image
              src={slide.image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              className={`object-cover ${slide.imagePosition}`}
            />
            <div
              className={`absolute inset-0 ${
                dark
                  ? "bg-gradient-to-t md:bg-gradient-to-r from-[#0B2A5B]/95 via-[#0B2A5B]/70 md:via-[#0B2A5B]/55 to-transparent"
                  : "bg-gradient-to-t md:bg-gradient-to-r from-primary-50 via-primary-50/90 md:via-primary-50/70 to-transparent"
              }`}
            />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-16 flex items-end md:items-center pb-16 md:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="max-w-xl"
            >
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${
                  dark ? "bg-white/15 text-white" : "bg-primary/10 text-primary"
                }`}
              >
                <BadgeCheck className="w-3.5 h-3.5" /> {slide.eyebrow}
              </span>
              <h1 className={`mt-4 text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight ${dark ? "text-white" : "text-ink"}`}>
                {slide.title[0]}
                <br />
                <span className={dark ? "text-sky-300" : "text-primary"}>{slide.title[1]}</span>
              </h1>
              <p className={`mt-4 text-base md:text-lg max-w-md ${dark ? "text-white/80" : "text-ink/70"}`}>{slide.sub}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={slide.cta.href}
                  className="group inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-dark px-7 py-3.5 text-[15px] font-extrabold text-white shadow-lg shadow-primary/30 transition-colors"
                >
                  {slide.cta.label}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                {slide.secondary && (
                  <Link
                    href={slide.secondary.href}
                    className={`inline-flex items-center rounded-xl px-6 py-3.5 text-[15px] font-bold border transition-colors ${
                      dark ? "border-white/40 text-white hover:bg-white/10" : "border-ink/20 text-ink hover:bg-white"
                    }`}
                  >
                    {slide.secondary.label}
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Arrows */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous slide"
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-ink shadow-lg items-center justify-center hover:scale-105 transition-transform"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next slide"
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-ink shadow-lg items-center justify-center hover:scale-105 transition-transform"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-5 right-6 md:right-10 z-20 flex gap-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.eyebrow}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? `w-7 ${dark ? "bg-white" : "bg-primary"}` : `w-2 ${dark ? "bg-white/50 hover:bg-white/80" : "bg-ink/20 hover:bg-ink/40"}`
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
