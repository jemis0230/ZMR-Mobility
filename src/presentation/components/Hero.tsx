"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Shield, Cpu, Leaf, Users, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CompanyRail from "./CompanyRail";
import CategoryModal from "./CategoryModal";
import CategorySection from "./CategorySection";
import dynamic from "next/dynamic";
const EVCircuitBackground = dynamic(() => import("./EVCircuitBackground"), { ssr: false });
const ElectricParticles = dynamic(() => import("./ElectricParticles"), { ssr: false });
import EVCityStrip from "./EVCityStrip";
import AnimatedCounter from "./AnimatedCounter";
import { useState, useEffect } from "react";

// ── Data ──────────────────────────────────────────────────────

const CYCLING_LABELS = [
  "for Gig Workers",
  "for Last-Mile Fleets",
  "for Businesses",
  "for the Planet",
  "for Women",
];

const heroSlides = [
  "/sampleVechiles/c12i-max6a0da949da693.webp",
  "/sampleVechiles/mahindra-treo-zor-46219.webp",
  "/sampleVechiles/mahindra-udo-exterior-227564.webp",
  "/sampleVechiles/ruv350695b9364c221b.webp",
];

const stats = [
  { value: 4,         suffix: "+",    label: "Cities Active", isNum: true  },
  { value: 2,         suffix: " Lac kg", label: "CO₂ Saved",   isNum: true  },
  { value: 176,       suffix: "L km", label: "Green KM",      isNum: true  },
];

const features = [
  {
    icon: Shield,
    title: "Premium Refurbished EVs",
    desc: "Every vehicle undergoes rigorous AI-powered diagnostics and refurbishment before it reaches you.",
    color: "from-blue-500/20 to-blue-600/5",
    accent: "text-blue-400",
  },
  {
    icon: Cpu,
    title: "IoT-Enabled Tracking",
    desc: "Real-time GPS, geo-fencing, battery health monitoring and remote mobilize/immobilize.",
    color: "from-primary/20 to-primary/5",
    accent: "text-primary",
  },
  {
    icon: Zap,
    title: "Easy Financing & Lease",
    desc: "Flexible EMIs with minimal down payment. Tailored for gig workers, fleets, and individuals.",
    color: "from-yellow-500/20 to-yellow-600/5",
    accent: "text-yellow-400",
  },
  {
    icon: Leaf,
    title: "24+ Month Warranty",
    desc: "18 months OEM + 6 months ZMR extended warranty. RSA, free charging hours & buyback included.",
    color: "from-emerald-500/20 to-emerald-600/5",
    accent: "text-emerald-400",
  },
];

const howItWorks = [
  { step: "01", title: "Browse & Select", desc: "Choose from our curated fleet of pre-owned EVs across 5 categories — from 2-wheelers to cargo vehicles." },
  { step: "02", title: "Submit Requirements", desc: "Share your use case, city, and fleet size. We'll match you with the perfect vehicle and lease plan." },
  { step: "03", title: "Quick KYC & Approval", desc: "100% paperless process. Get approved within 48 hours with minimal documentation." },
  { step: "04", title: "Vehicle Delivered!", desc: "Your IoT-enabled EV is delivered to your doorstep, fully serviced and ready to earn." },
];

const testimonials = [
  { name: "Ramesh Kumar",          role: "Delivery Partner, Lucknow",    text: "ZMR made it possible for me to get my first electric vehicle with minimal deposit. My fuel savings are incredible!", rating: 5 },
  { name: "Sunita Devi",           role: "Women Entrepreneur, Dehradun", text: "As a woman entrepreneur, ZMR's support has been exceptional. The IoT tracking gives me peace of mind every day.", rating: 5 },
  { name: "Fleet Manager, ID Fresh", role: "Corporate Client",           text: "Managing 50+ EVs has never been easier. Real-time monitoring and ZMR's response team is always available.", rating: 5 },
];


// ── Sub-components ────────────────────────────────────────────

function CyclingLabel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % CYCLING_LABELS.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="inline-flex items-center gap-1.5 text-white/50 text-3xl md:text-4xl font-bold overflow-hidden h-[1.2em]">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0,  opacity: 1 }}
          exit={{ y: -30,   opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="inline-block text-primary"
        >
          {CYCLING_LABELS[index]}
        </motion.span>
      </AnimatePresence>
      <span className="animate-cursor-blink text-primary/60">|</span>
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      {/* ─── HERO ─── */}
      <section className="relative min-h-[100svh] flex items-center pt-24 pb-16 px-6 overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[120px]" />
          {/* Desktop only — RAF loop + continuous animations hurt mobile GPU */}
          <div className="hidden lg:block">
            <EVCircuitBackground />
            <ElectricParticles />
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">

          {/* Left — Content */}
          <div className="space-y-8 z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-widest uppercase"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              India's Technology-First EV Asset Management
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight">
                Drive Electric.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-primary">
                  Own the Future.
                </span>
              </h1>
              <div className="mt-2">
                <CyclingLabel />
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-white/55 max-w-xl leading-relaxed"
            >
              ZMR Mobility is building trusted access to premium pre-owned IoT-enabled EVs for Bharat — making electric mobility <strong className="text-white">affordable, reliable, and accessible</strong> for fleet operators, gig workers, and women.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <button
                onClick={() => setIsModalOpen(true)}
                className="group bg-primary text-background px-8 py-4 rounded-2xl font-extrabold flex items-center justify-center gap-2 hover:scale-105 transition-all electric-glow text-sm"
              >
                Explore EV Fleet
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link
                href="/about"
                className="group bg-white/5 border border-white/10 hover:border-primary/40 hover:bg-white/10 px-8 py-4 rounded-2xl font-bold transition-all flex items-center gap-2 text-sm"
              >
                Learn About Us
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-primary" />
              </Link>
            </motion.div>

            {/* Animated mini stats */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center gap-8 pt-6 border-t border-white/5"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-black text-primary">
                    {s.isNum ? (
                      <AnimatedCounter target={s.value as number} suffix={s.suffix} duration={2000} />
                    ) : (
                      s.value
                    )}
                  </p>
                  <p className="text-[11px] text-white/40 uppercase tracking-widest mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Image with electric ring */}
          <motion.div
            initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mt-10 lg:mt-0"
          >
            <motion.div
              animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              {/* Electric ring wrapper */}
              <div className="animate-electric-ring rounded-3xl">
                <div className="relative rounded-3xl overflow-hidden border border-primary/30 shadow-2xl shadow-primary/10 h-[300px] md:h-[580px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={slideIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0"
                    >
                      <img
                        src={heroSlides[slideIndex]}
                        alt="ZMR Mobility EV"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                </div>
              </div>


              {/* Floating stat card — top right */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }}
                whileHover={{ scale: 1.05 }}
                className="hidden lg:block absolute -top-4 -right-6 glass-card p-4 border-accent/20 cursor-default"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  <p className="text-xs font-bold text-emerald-400">Live IoT Monitoring</p>
                </div>
                <p className="text-white/50 text-xs mt-1">360+ vehicles tracked</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-widest text-white/20">Scroll to Explore</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
        </motion.div>
      </section>

      {/* ─── EV CITY STRIP ─── */}
      <EVCityStrip />

      {/* ─── CATEGORY CARDS ─── */}
      <CategorySection />

      {/* ─── COMPANY LOGOS RAIL ─── */}
      <CompanyRail />

      {/* ─── FEATURES ─── */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Why ZMR Mobility</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3 mb-4">
              Everything You Need.<br />
              <span className="text-white/50 font-bold text-3xl">Nothing You Don't.</span>
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto">We've built an end-to-end platform so you focus on your work — we handle the vehicle, the tech, and the paperwork.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`glass-card p-7 border-white/5 hover:border-white/20 transition-all group bg-gradient-to-br ${f.color}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <f.icon className={`w-6 h-6 ${f.accent}`} />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-28 px-6 bg-gradient-to-br from-white/[0.02] to-transparent border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
            <span className="text-primary text-xs font-bold uppercase tracking-widest">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-black mt-3">
              From Browse to Drive — <span className="text-primary">in 48 Hours</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }} viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="relative text-center"
              >
                <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mb-6 hover:scale-110 transition-transform">
                  <span className="text-3xl font-black text-primary">{step.step}</span>
                </div>
                <h3 className="font-bold text-lg mb-3">{step.title}</h3>
                <p className="text-sm text-white/45 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 text-center">
            <button onClick={() => setIsModalOpen(true)} className="group inline-flex items-center gap-2 bg-primary text-background px-10 py-4 rounded-2xl font-extrabold hover:scale-105 transition-all electric-glow">
              Get Started Today
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── IMPACT BANNER ─── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass-card p-10 md:p-16 border-primary/10 bg-gradient-to-br from-primary/5 to-transparent relative overflow-hidden"
          >
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-[80px]" />
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-primary text-xs font-bold uppercase tracking-widest">Our Impact</span>
                <h2 className="text-4xl font-black mt-3 mb-4">Transforming Mobility<br />for <span className="text-primary">40 Million+</span> Indians</h2>
                <p className="text-white/50 leading-relaxed">Reducing carbon emissions, generating employment in clean mobility — especially across Tier-2 and Tier-3 cities, and empowering women entrepreneurs across India.</p>
                <Link href="/about" className="mt-6 inline-flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all">
                  Read Our Full Story <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-5">
                {[
                  { val: 2,      suffix: " Lac kg", label: "CO₂ Saved",   icon: "🌿" },
                  { val: 142666, suffix: " L",  label: "Fuel Saved",      icon: "⛽" },
                  { val: 51,     suffix: "",     label: "Women Operators", icon: "💪" },
                  { val: 6000,   suffix: " kg",  label: "Plastics Saved",  icon: "♻️" },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    whileHover={{ scale: 1.04 }}
                    className="glass-card p-5 border-white/5 text-center cursor-default"
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="font-black text-lg text-primary">
                      <AnimatedCounter target={item.val} suffix={item.suffix} duration={2200} />
                    </div>
                    <div className="text-xs text-white/40 mt-1">{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-28 px-6 bg-white/[0.02] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Testimonials</span>
            <h2 className="text-4xl font-black mt-3">Loved by Customers Across India</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="glass-card p-8 border-white/5 hover:border-primary/20 transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <p className="text-xs text-white/40">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Ready to Start?</span>
            <h2 className="text-5xl md:text-6xl font-black mt-4 mb-6 leading-tight">
              Your Electric Future<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Starts Today</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
              Join hundreds of businesses and individuals already saving on fuel, reducing emissions, and driving India's clean mobility revolution.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={() => setIsModalOpen(true)} className="group bg-primary text-background px-10 py-4 rounded-2xl font-extrabold hover:scale-105 transition-all electric-glow flex items-center gap-2">
                Browse EV Fleet
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link href="/about" className="group border border-white/15 hover:border-primary/40 text-white px-10 py-4 rounded-2xl font-bold transition-all hover:bg-white/5 flex items-center gap-2">
                Our Story
                <ChevronRight className="w-4 h-4 text-primary" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
