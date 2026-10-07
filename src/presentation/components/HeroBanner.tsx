"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, Pause, Play } from "lucide-react";

type Slide = {
  eyebrow: string;
  title: [string, string];
  sub: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
  image: string;
  alt: string;
  imagePosition: string;
};

// Copy uses only information already published by ZMR Mobility.
const SLIDES: Slide[] = [
  {
    eyebrow: "Pre-owned EVs",
    title: ["Buy an electric vehicle", "you'll love to drive"],
    sub: "Browse electric scooters, e-rickshaws, cargo loaders and cars — compare up to 3 side by side and get help with warranty and ownership transfer.",
    cta: { label: "View all EVs", href: "/explore" },
    secondary: { label: "Compare EVs", href: "/compare" },
    image: "/hero-handover.webp",
    alt: "ZMR Mobility team handing over vehicle keys",
    imagePosition: "object-[60%_30%]",
  },
  {
    eyebrow: "Fleet Leasing",
    title: ["Power your last-mile", "fleet with EVs"],
    sub: "Flexible monthly leasing plans with IoT tracking for gig workers, businesses and fleets.",
    cta: { label: "Explore leasing", href: "/leasing/vehicles/3-wheeler-cargo" },
    secondary: { label: "Cargo EVs", href: "/explore?type=3-wheeler-cargo" },
    image: "/sampleVechiles/mahindra-treo-zor-46219.webp",
    alt: "Electric cargo three-wheeler on a city road",
    imagePosition: "object-[60%_50%]",
  },
  {
    eyebrow: "Sell Your EV",
    title: ["Sell your EV", "at the right price"],
    sub: "Answer a few quick questions and our team will contact you with an offer.",
    cta: { label: "Sell your EV", href: "/sell-ev" },
    image: "/sampleVechiles/c12i-max6a0da949da693.webp",
    alt: "Green electric scooter",
    imagePosition: "object-center",
  },
  {
    eyebrow: "Smart & Connected",
    title: ["IoT-enabled EVs,", "monitored 24×7"],
    sub: "Real-time GPS, geo-fencing and battery health monitoring on ZMR vehicles.",
    cta: { label: "Know more", href: "/about" },
    image: "/about-hero.webp",
    alt: "Illustration of connected electric vehicles",
    imagePosition: "object-center",
  },
];

const INTERVAL = 7000;

/** Home hero (Cream section) — lightweight CSS carousel. */
export default function HeroBanner() {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Slides whose images may load. Only the first loads up front (it's the LCP image).
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0]));
  const ref = useRef<HTMLElement>(null);

  const go = useCallback((i: number) => {
    const next = (i + SLIDES.length) % SLIDES.length;
    setMounted((m) => (m.has(next) ? m : new Set(m).add(next)));
    setIndex(next);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);

    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting));
    if (ref.current) io.observe(ref.current);
    const onVis = () => setOffscreen(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => { mq.removeEventListener("change", onChange); io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  const playing = !userPaused && !hoverPaused && !offscreen && !reducedMotion;

  useEffect(() => {
    if (!playing) return;
    // Warm the next slide's image shortly before it is shown.
    const preload = setTimeout(() => setMounted((m) => (m.has((index + 1) % SLIDES.length) ? m : new Set(m).add((index + 1) % SLIDES.length))), INTERVAL - 2000);
    const timer = setTimeout(() => go(index + 1), INTERVAL);
    return () => { clearTimeout(preload); clearTimeout(timer); };
  }, [playing, index, go]);

  const slide = SLIDES[index];

  return (
    <section
      ref={ref}
      className="relative bg-cream pt-[88px] lg:pt-[148px] pb-10 px-4 md:px-6"
      aria-roledescription="carousel"
      aria-label="Highlights"
      onMouseEnter={() => setHoverPaused(true)}
      onMouseLeave={() => setHoverPaused(false)}
      onFocus={() => setHoverPaused(true)}
      onBlur={() => setHoverPaused(false)}
    >
      <h1 className="sr-only">ZMR Mobility — buy, lease, rent and sell pre-owned electric vehicles</h1>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Image (fixed aspect ratio → no layout shift) */}
        <div className="relative order-1 lg:order-2 aspect-[16/10] lg:aspect-[5/4] rounded-3xl overflow-hidden bg-tint shadow-card">
          {SLIDES.map((s, i) =>
            mounted.has(i) ? (
              <Image
                key={s.image}
                src={s.image}
                alt={i === index ? s.alt : ""}
                aria-hidden={i !== index}
                fill
                priority={i === 0}
                fetchPriority={i === 0 ? "high" : "auto"}
                sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
                className={`object-cover ${s.imagePosition} transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
              />
            ) : null
          )}
        </div>

        {/* Text */}
        <div className="order-2 lg:order-1" aria-live={playing ? "off" : "polite"}>
          <div key={index} className="animate-[fadeIn_.45s_ease]" role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${SLIDES.length}`}>
            <p className="inline-flex items-center rounded-full bg-lime px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-forest">
              {slide.eyebrow}
            </p>
            <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-forest">
              {slide.title[0]}
              <br />
              <span className="text-leaf">{slide.title[1]}</span>
            </h2>
            <p className="mt-4 text-base md:text-lg max-w-lg text-ink/80">{slide.sub}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={slide.cta.href}
                className="group inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-dark px-7 py-3.5 text-[15px] font-extrabold text-white transition-colors electric-glow"
              >
                {slide.cta.label}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
              </Link>
              {slide.secondary && (
                <Link
                  href={slide.secondary.href}
                  className="inline-flex items-center rounded-xl border-2 border-forest/20 bg-white px-6 py-3.5 text-[15px] font-bold text-forest hover:border-primary transition-colors"
                >
                  {slide.secondary.label}
                </Link>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center gap-3">
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous slide" className="w-11 h-11 rounded-full bg-white border border-ink/15 text-forest flex items-center justify-center hover:border-primary">
              <ChevronLeft className="w-5 h-5" aria-hidden />
            </button>
            <div className="flex items-center">
              {SLIDES.map((s, i) => (
                <button
                  key={s.eyebrow}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Go to slide ${i + 1}: ${s.eyebrow}`}
                  aria-current={i === index}
                  className="w-6 h-11 flex items-center justify-center"
                >
                  <span className={`block h-2 rounded-full transition-all ${i === index ? "w-6 bg-primary" : "w-2 bg-forest/25"}`} />
                </button>
              ))}
            </div>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next slide" className="w-11 h-11 rounded-full bg-white border border-ink/15 text-forest flex items-center justify-center hover:border-primary">
              <ChevronRight className="w-5 h-5" aria-hidden />
            </button>
            {!reducedMotion && (
              <button
                type="button"
                onClick={() => setUserPaused((p) => !p)}
                aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
                className="w-11 h-11 rounded-full text-forest flex items-center justify-center hover:bg-white"
              >
                {userPaused ? <Play className="w-4 h-4" aria-hidden /> : <Pause className="w-4 h-4" aria-hidden />}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
