"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, Pause, Play } from "lucide-react";

// ZMR customers' own photographs (public/customers). They are served unchanged — no
// resizing or re-encoding — and shown whole (object-contain) on a plain background so
// no one is cropped.
const PHOTOS = [
  { src: "/customers/zmr-customer-01.jpeg", alt: "A customer standing beside a red and black BGauss electric scooter" },
  { src: "/customers/zmr-customer-02.jpeg", alt: "A customer standing with a dark blue BGauss electric scooter" },
  { src: "/customers/zmr-customer-03.jpeg", alt: "A customer standing with a matte green BGauss electric scooter" },
  { src: "/customers/zmr-customer-04.jpeg", alt: "A customer standing behind a silver BGauss electric scooter" },
] as const;

/** Time each photo stays on screen while playing; photos cross-fade over 350 ms. */
const SLIDE_INTERVAL_MS = 2500;
const SWIPE_PX = 40;

/** Home hero (Cream section): headline + customer photo slideshow. */
export default function HeroBanner() {
  const [index, setIndex] = useState(0);
  // Bumped on every manual navigation so the autoplay countdown restarts in full.
  const [navTick, setNavTick] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [focusPaused, setFocusPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  // Photo 1 renders immediately; the rest are added once the page has loaded.
  const [loadAll, setLoadAll] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback((i: number) => {
    setIndex(((i % PHOTOS.length) + PHOTOS.length) % PHOTOS.length);
    setNavTick((t) => t + 1);
    setLoadAll(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onMotion = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onMotion);

    const onVis = () => setHidden(document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);

    // Fetch the remaining photos once the page itself has finished loading.
    const enable = () => setLoadAll(true);
    if (document.readyState === "complete") enable();
    else window.addEventListener("load", enable, { once: true });

    return () => {
      mq.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("load", enable);
    };
  }, []);

  const playing = !userPaused && !focusPaused && !hidden && !reducedMotion;

  // One timer at a time: it is recreated (and the old one cleared) whenever the slide,
  // a manual navigation or the play state changes.
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % PHOTOS.length), SLIDE_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [playing, index, navTick]);

  return (
    <section className="relative bg-cream pt-[88px] lg:pt-[148px] pb-10 px-4 md:px-6">
      <h1 className="sr-only">ZMR Mobility — buy, lease, rent and sell pre-owned electric vehicles</h1>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Customer photo slideshow */}
        <div
          className="order-1 lg:order-2"
          role="region"
          aria-roledescription="carousel"
          aria-label="ZMR customers with their electric scooters"
          // Pause while *keyboard* focus is inside; resume when it leaves (unless paused by the
          // user). Clicking or tapping a control focuses it too, but must not stall autoplay.
          onFocus={(e) => setFocusPaused((e.target as HTMLElement).matches(":focus-visible"))}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusPaused(false); }}
          onPointerDown={() => setFocusPaused(false)}
        >
          {/* Fixed frame per breakpoint, so photos of different proportions never shift the page. */}
          <div
            className="relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-auto lg:h-[min(600px,calc(100svh-200px))] lg:min-h-[440px] rounded-3xl overflow-hidden bg-tint shadow-card touch-pan-y"
            onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              touchX.current = null;
              if (Math.abs(dx) > SWIPE_PX) go(index + (dx < 0 ? 1 : -1));
            }}
          >
            {PHOTOS.map((p, i) =>
              i === 0 || loadAll ? (
                <Image
                  key={p.src}
                  src={p.src}
                  alt={i === index ? `${p.alt} (photo ${i + 1} of ${PHOTOS.length})` : ""}
                  aria-hidden={i !== index}
                  fill
                  // Serve the original JPEG bytes (no optimiser resizing / re-encoding).
                  unoptimized
                  priority={i === 0}
                  fetchPriority={i === 0 ? "high" : "low"}
                  className={`object-contain transition-opacity duration-[350ms] ease-out ${i === index ? "opacity-100" : "opacity-0"}`}
                />
              ) : null
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 flex items-center justify-center lg:justify-start gap-2">
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous photo" className="w-11 h-11 rounded-full bg-white border border-ink/15 text-forest flex items-center justify-center hover:border-primary">
              <ChevronLeft className="w-5 h-5" aria-hidden />
            </button>
            <div className="flex items-center">
              {PHOTOS.map((p, i) => (
                <button
                  key={p.src}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show photo ${i + 1} of ${PHOTOS.length}`}
                  aria-current={i === index}
                  className="w-8 h-11 flex items-center justify-center"
                >
                  <span className={`block h-2 rounded-full transition-all duration-300 ${i === index ? "w-6 bg-primary" : "w-2 bg-forest/25"}`} />
                </button>
              ))}
            </div>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next photo" className="w-11 h-11 rounded-full bg-white border border-ink/15 text-forest flex items-center justify-center hover:border-primary">
              <ChevronRight className="w-5 h-5" aria-hidden />
            </button>
            {!reducedMotion && (
              <button
                type="button"
                onClick={() => setUserPaused((p) => !p)}
                aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
                aria-pressed={userPaused}
                className="w-11 h-11 rounded-full text-forest flex items-center justify-center hover:bg-white"
              >
                {userPaused ? <Play className="w-4 h-4" aria-hidden /> : <Pause className="w-4 h-4" aria-hidden />}
              </button>
            )}
          </div>
        </div>

        {/* Headline */}
        <div className="order-2 lg:order-1">
          <p className="inline-flex items-center rounded-full bg-lime px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-forest">
            Pre-owned EVs
          </p>
          <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-black leading-[1.05] tracking-tight text-forest">
            Buy an electric vehicle
            <br />
            <span className="text-leaf">you&apos;ll love to drive</span>
          </h2>
          <p className="mt-4 text-base md:text-lg max-w-lg text-ink/80">
            Browse pre-owned electric scooters and bikes — compare up to 3 side by side and get help with warranty and ownership transfer.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/explore"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-dark px-7 py-3.5 text-[15px] font-extrabold text-white transition-colors electric-glow"
            >
              View all EVs
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden />
            </Link>
            <Link
              href="/compare"
              className="inline-flex items-center rounded-xl border-2 border-forest/20 bg-white px-6 py-3.5 text-[15px] font-bold text-forest hover:border-primary transition-colors"
            >
              Compare EVs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
