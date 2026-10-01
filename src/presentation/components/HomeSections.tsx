"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Shield, Cpu, Leaf, Users, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CompanyRail from "./CompanyRail";
import CategoryModal from "./CategoryModal";
import FleetPickerModal from "./FleetPickerModal";
import CategorySection from "./CategorySection";
import AnimatedCounter from "./AnimatedCounter";
import { useState, useEffect } from "react";

// ── Data ──────────────────────────────────────────────────────




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
  { name: "Ramesh Kumar",            role: "Delivery Partner, Lucknow",    text: "ZMR made it possible for me to get my first electric vehicle with minimal deposit. My fuel savings are incredible!", rating: 5, photo: "/testimonials/client1.webp", date: "March 2025"   },
  { name: "Sunita Devi",             role: "Women Entrepreneur, Dehradun", text: "As a woman entrepreneur, ZMR's support has been exceptional. The IoT tracking gives me peace of mind every day.", rating: 5, photo: "/testimonials/client3.webp", date: "August 2025"  },
  { name: "Fleet Manager, ID Fresh", role: "Corporate Client",             text: "Managing 50+ EVs has never been easier. Real-time monitoring and ZMR's response team is always available.", rating: 5, photo: "/testimonials/client2.webp", date: "January 2026"  },
];


// ── Testimonials ──────────────────────────────────────────────

function TestimonialsSection() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((i) => (i + 1) % testimonials.length), 4500);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section className="py-28 px-6 bg-ink/[0.02] border-t border-ink/[0.08]">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-primary text-xs font-bold uppercase tracking-widest">Testimonials</span>
          <h2 className="text-4xl font-black mt-3">Loved by Customers Across India</h2>
        </motion.div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => {
            const isActive = active === i;
            const isHovered = hovered === i;
            return (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                onMouseEnter={() => { setPaused(true); setHovered(i); }}
                onMouseLeave={() => { setPaused(false); setHovered(null); }}
                onClick={() => setActive(i)}
                className={`glass-card transition-all duration-500 cursor-pointer relative overflow-hidden ${
                  isActive ? 'border-primary/40 shadow-[0_0_30px_-8px_rgba(26,115,232,0.25)]' : 'border-ink/[0.08] hover:border-primary/20'
                }`}
              >
                {/* Full-card photo overlay — fades in on hover */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      key="photo-overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.45, ease: 'easeInOut' }}
                      className="absolute inset-0 z-10 bg-[#0d1117]"
                    >
                      <Image src={t.photo} alt={t.name} fill className="object-contain" sizes="(max-width: 768px) 100vw, 33vw" />
                      {/* Dark gradient so name/role stay readable at bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                      {/* Name + role pinned to bottom */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex gap-1 mb-3">
                          {Array.from({ length: t.rating }).map((_, j) => (
                            <Star key={j} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                          ))}
                        </div>
                        <p className="font-black text-ink text-base leading-tight">{t.name}</p>
                        <p className="text-xs text-ink/70 mt-0.5">{t.role}</p>
                        <p className="text-[10px] text-primary font-bold mt-1">{t.date}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Card content (below photo overlay) */}
                <div className="p-8">
                  {/* Active glow bar */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} exit={{ scaleX: 0 }}
                        transition={{ duration: 4.5, ease: 'linear' }}
                        style={{ transformOrigin: 'left' }}
                        className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/80 to-primary/20"
                      />
                    )}
                  </AnimatePresence>

                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>

                  {/* Review text */}
                  <p className="text-ink/75 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>

                  {/* Footer: photo always shown in circle */}
                  <div className="flex items-center gap-3 pt-4 border-t border-ink/[0.08]">
                    <div className="relative w-11 h-11 rounded-full flex-shrink-0 overflow-hidden ring-2 ring-primary/30">
                      <Image src={t.photo} alt={t.name} fill className="object-cover" sizes="44px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{t.name}</p>
                      <p className="text-xs text-ink/60 truncate">{t.role}</p>
                      <p className="text-[10px] text-primary/70 font-semibold mt-0.5">{t.date}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); setPaused(true); setTimeout(() => setPaused(false), 6000); }}
              className={`rounded-full transition-all duration-300 ${active === i ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-ink/20 hover:bg-ink/40'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Main Component ────────────────────────────────────────────

export default function HomeSections() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFleetPickerOpen, setIsFleetPickerOpen] = useState(false);

  return (
    <>
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
              <span className="text-ink/65 font-bold text-3xl">Nothing You Don't.</span>
            </h2>
            <p className="text-ink/60 max-w-2xl mx-auto">We've built an end-to-end platform so you focus on your work — we handle the vehicle, the tech, and the paperwork.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }} viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                className={`glass-card p-7 border-ink/[0.08] hover:border-ink/15 transition-all group bg-gradient-to-br ${f.color}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-ink/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <f.icon className={`w-6 h-6 ${f.accent}`} />
                </div>
                <h3 className="font-bold text-ink text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-ink/60 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-28 px-6 bg-gradient-to-br from-ink/[0.02] to-transparent border-y border-ink/[0.08]">
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
                <p className="text-sm text-ink/60 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16 text-center">
            <button onClick={() => setIsFleetPickerOpen(true)} className="group inline-flex items-center gap-2 bg-primary text-white px-10 py-4 rounded-2xl font-extrabold hover:scale-105 transition-all electric-glow">
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
                <p className="text-ink/65 leading-relaxed">Reducing carbon emissions, generating employment in clean mobility — especially across Tier-2 and Tier-3 cities, and empowering women entrepreneurs across India.</p>
                <Link href="/about" className="mt-6 inline-flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all">
                  Read Our Full Story <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-5">
                {[
                  { val: 200,    suffix: " Ton",     label: "CO₂ Saved",   icon: "🌿" },
                  { val: 198,    suffix: " Lakh L", label: "Fuel Saved",         icon: "⛽" },
                  { val: 51,     suffix: "",       label: "Women Entrepreneurs", icon: "💪" },
                  { val: 6000,   suffix: " kg",  label: "Plastics Saved",  icon: "♻️" },
                ].map((item) => (
                  <motion.div
                    key={item.label}
                    whileHover={{ scale: 1.04 }}
                    className="glass-card p-5 border-ink/[0.08] text-center cursor-default"
                  >
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div className="font-black text-lg text-primary">
                      <AnimatedCounter target={item.val} suffix={item.suffix} duration={2200} />
                    </div>
                    <div className="text-xs text-ink/60 mt-1">{item.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <TestimonialsSection />

      {/* ─── CTA BANNER ─── */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Ready to Start?</span>
            <h2 className="text-5xl md:text-6xl font-black mt-4 mb-6 leading-tight">
              Your Electric Future<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Starts Today</span>
            </h2>
            <p className="text-ink/65 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
              Join hundreds of businesses and individuals already saving on fuel, reducing emissions, and driving India's clean mobility revolution.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={() => setIsFleetPickerOpen(true)} className="group bg-primary text-white px-10 py-4 rounded-2xl font-extrabold hover:scale-105 transition-all electric-glow flex items-center gap-2">
                Browse EV Fleet
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <Link href="/about" className="group border border-ink/15 hover:border-primary/40 text-ink px-10 py-4 rounded-2xl font-bold transition-all hover:bg-ink/5 flex items-center gap-2">
                Our Story
                <ChevronRight className="w-4 h-4 text-primary" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <CategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <FleetPickerModal isOpen={isFleetPickerOpen} onClose={() => setIsFleetPickerOpen(false)} />
    </>
  );
}
