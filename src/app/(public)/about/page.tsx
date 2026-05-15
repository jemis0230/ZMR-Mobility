import Image from "next/image";
import { Zap, Target, Globe, Users, TrendingUp, Cpu, Shield, Leaf, ChevronRight, MapPin, Battery, Truck, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About Us | ZMR Mobility — Technology-First EV Asset Management",
  description: "ZMR Mobility is India's leading technology-first EV asset management company offering 360° solutions for electric vehicles including Sale, Lease, IoT, and Refinance.",
};

const stats = [
  { value: "360+", label: "EVs Managed", sub: "51 women operators" },
  { value: "₹141L", label: "Revenue", sub: "As on March 2026" },
  { value: "104L km", label: "Green KM", sub: "Carbon-free travel" },
  { value: "104,650 kg", label: "CO₂ Saved", sub: "Reducing emissions" },
  { value: "142,666 L", label: "Fuel Saved", sub: "Fossil fuel avoided" },
  { value: "6,000 kg", label: "Plastics Saved", sub: "Waste eliminated" },
];

const problems = [
  "High cost of new EVs for lower income groups, B2B fleets, retail individuals, and gig workers",
  "Minimal to zero financing available for India's burgeoning gig economy workforce",
  "No access to reliable, affordable aftersales & service ecosystem for fleets",
  "No visibility of vehicle assets/performance via IoT/Telematics",
  "Unreliable performance for second-hand EVs from unorganized markets",
  "Unpredictable battery behavior during long-term usage",
];

const solutions = [
  { icon: Shield, title: "Premium Pre-Owned EVs", desc: "Reliable, refurbished electric vehicles at affordable pricing for individuals and micro-entrepreneurs." },
  { icon: Cpu, title: "IoT Enabled Vehicles", desc: "GPS tracking, geo-fencing, mobilize/immobilize, and battery health monitoring on every vehicle." },
  { icon: Zap, title: "Easy Financing", desc: "Flexible, customized EMI solutions tailored for micro-entrepreneurs and retail customers." },
  { icon: Leaf, title: "Hassle-Free RC Transfer", desc: "We handle everything — RSA, easy buyback, extended warranty, and free charging up to 100 hours." },
  { icon: TrendingUp, title: "Customer Retention Focus", desc: "Convenience-first offerings and user-friendly options designed to minimize churn." },
  { icon: Battery, title: "Smart Refurbishment", desc: "Using AI, data science and tech to understand EV battery and BMS health comprehensively." },
];

const revenueStreams = [
  "Sale of Pre-Owned EVs",
  "Lease of Pre-Owned EVs",
  "Service & Repairs of Sold EVs",
  "Commission from Loan Disbursement",
  "Insurance Renewal Income",
  "Sale of Rare Earth Material",
];

const techHighlights = [
  { icon: Cpu, title: "AI-Powered Valuation", desc: "Not based only on age or odometer — we assess battery health, software diagnostics, range, and lifecycle data." },
  { icon: Globe, title: "IoT Integration", desc: "Smart IoT systems integrated in every refurbished vehicle for real-time asset tracking and health monitoring." },
  { icon: Shield, title: "24+ Month Warranty", desc: "18 months OEM warranty + 6 months ZMR extended warranty on all refurbished products." },
  { icon: Truck, title: "Doorstep Service", desc: "Complete doorstep inspection and delivery for ultimate customer convenience across cities." },
];

const expansionPlan = [
  {
    year: "2025", status: "Current", color: "primary",
    cities: ["Lucknow", "Dehradun"],
    targets: ["350+ EVs on road", "400+ jobs in cleantech"],
  },
  {
    year: "2026", status: "Next Phase", color: "accent",
    cities: ["Jaipur", "Agra", "Udaipur", "Bhopal", "Nagpur"],
    targets: ["2,000 vehicles", "2,400+ jobs in cleantech"],
  },
  {
    year: "2027", status: "Future", color: "white",
    cities: ["Kochi", "Meerut", "Mysore", "Chandigarh", "Kashmir"],
    targets: ["6,500 vehicles", "7,800+ jobs in cleantech"],
  },
];

const team = [
  {
    name: "Javed Ali",
    role: "Founder & Director",
    bio: "Graduate Engineer with 12+ Years of exposure in Automotive and EV sectors.",
    photo: "/profile-photos/javedAliProfilePhoto.jpeg",
    linkedin: "https://www.linkedin.com/in/javed-ali-5b563256/",
  },
  {
    name: "Juned Ali",
    role: "Co-Founder & Director",
    bio: "Graduate Engineer with 6+ Years of exposure in Growth & Investments.",
    photo: "/profile-photos/juanidAliProfilePhoto.jpeg",
    linkedin: "https://www.linkedin.com/in/juned-ali-52b84220b/",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-white overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/about-hero.png" alt="ZMR Mobility EV Fleet" fill className="object-cover opacity-25" priority />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>
        {/* Glowing orbs */}
        <div className="absolute top-32 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-xs font-bold uppercase tracking-widest mb-8">
            <Zap className="w-3 h-3 fill-current" /> Technology-First EV Asset Management
          </div>
          <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight mb-6">
            Accelerating India Towards<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Sustainable Mobility</span>
          </h1>
          <p className="text-xl text-white/60 max-w-3xl leading-relaxed mb-10">
            ZMR Mobility Private Limited is a technology-first EV asset management company leading the green movement in India's clean and sustainable mobility sector. We operate within the <span className="text-white font-semibold">Circular Economy</span> — offering 360° solutions for IoT in electric vehicles, including Sale, Lease, IoT, and Refinance.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="#solutions" className="flex items-center gap-2 bg-primary text-background font-bold px-8 py-3.5 rounded-full hover:scale-105 transition-transform electric-glow">
              Our Solutions <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#team" className="flex items-center gap-2 border border-white/20 text-white px-8 py-3.5 rounded-full hover:border-primary/50 hover:text-primary transition-colors">
              Meet the Team
            </a>
          </div>
        </div>
      </section>

      {/* Mission Banner */}
      <section className="py-16 px-6 bg-primary/5 border-y border-primary/10">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-2xl md:text-3xl font-bold leading-relaxed text-white/90 italic">
            "Spinny for EVs — Making electric mobility <span className="text-primary not-italic">affordable for Bharat</span>"
          </p>
          <p className="mt-4 text-white/50">Our mission: help build a carbon-free India by empowering individuals, businesses, and communities to adopt clean, efficient, and future-ready mobility.</p>
        </div>
      </section>

      {/* Live Stats */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Traction</span>
            <h2 className="text-4xl font-black mt-2">Real Impact, Real Numbers</h2>
            <p className="text-white/50 mt-3">Transforming mobility for 40+ million people in India.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {stats.map((s) => (
              <div key={s.value} className="glass-card p-6 text-center border-white/5 hover:border-primary/30 transition-colors group">
                <div className="text-3xl md:text-4xl font-black text-primary mb-1 group-hover:scale-105 transition-transform">{s.value}</div>
                <div className="text-sm font-bold text-white">{s.label}</div>
                <div className="text-xs text-white/40 mt-1">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-24 px-6 bg-secondary/10">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-red-400 text-xs font-bold uppercase tracking-widest">The Problem</span>
            <h2 className="text-4xl font-black mt-2 mb-6">What's Broken in India's EV Ecosystem</h2>
            <p className="text-white/50 leading-relaxed">India's EV revolution is real — but millions of people are being left behind due to systemic access problems that ZMR Mobility is built to solve.</p>
          </div>
          <div className="space-y-4">
            {problems.map((p, i) => (
              <div key={i} className="flex items-start gap-4 glass-card p-4 border-red-500/10 hover:border-red-500/30 transition-colors">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                </div>
                <p className="text-sm text-white/70 leading-relaxed">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Our Solutions</span>
            <h2 className="text-4xl font-black mt-2">Redefining the Pre-Owned EV Experience</h2>
            <p className="text-white/50 mt-3 max-w-2xl mx-auto">Simplifying EV ownership and driving inclusive growth — creating jobs for women, the gig economy, and underserved communities across India.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map((sol) => (
              <div key={sol.title} className="glass-card p-6 border-white/5 hover:border-primary/30 transition-all group hover:-translate-y-1">
                <div className="bg-primary/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <sol.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-white mb-2">{sol.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{sol.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Opportunity */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary/5 via-background to-accent/5 border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Market Overview</span>
            <h2 className="text-4xl font-black mt-2">The Sustainable Market Opportunity</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 border-primary/20 text-center">
              <div className="text-5xl font-black text-primary mb-2">$206B</div>
              <div className="font-bold mb-2">Indian EV Market by 2030</div>
              <div className="text-white/40 text-sm">From $4.27B in 2022 — a staggering 62.34% CAGR growth trajectory.</div>
            </div>
            <div className="glass-card p-8 border-accent/20 text-center">
              <div className="text-5xl font-black text-accent mb-2">17M</div>
              <div className="font-bold mb-2">Annual EV Sales by 2030</div>
              <div className="text-white/40 text-sm">India's EV adoption is accelerating rapidly across all vehicle segments.</div>
            </div>
            <div className="glass-card p-8 border-white/10 text-center">
              <div className="text-5xl font-black text-white mb-2">$14B</div>
              <div className="font-bold mb-2">Used EV Market by 2030</div>
              <div className="text-white/40 text-sm">From ~$1B in 2024, the used EV market is the biggest untapped opportunity in India.</div>
            </div>
          </div>

          <div className="mt-12 glass-card p-8 border-white/5">
            <h3 className="font-bold text-lg mb-6 text-white/80">ZMR Mobility's Customer Segments</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: "Individuals", pct: "26%", desc: "Personal use, office & college goers" },
                { label: "Fleet Companies", pct: "51%", desc: "3PL companies & large fleet operators" },
                { label: "Gig Economy", pct: "23%", desc: "Individual commercial gig workers" },
              ].map((c) => (
                <div key={c.label} className="text-center">
                  <div className="text-3xl font-black text-primary">{c.pct}</div>
                  <div className="font-bold mt-1">{c.label}</div>
                  <div className="text-xs text-white/40 mt-1">{c.desc}</div>
                </div>
              ))}
            </div>
            <p className="text-white/30 text-xs mt-6">Key clients include Bajaj Auto Limited, ID Fresh Foods, DS Group.</p>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Technology & Innovation</span>
            <h2 className="text-4xl font-black mt-2">Powered by AI, IoT & Data Science</h2>
            <p className="text-white/50 mt-3 max-w-2xl mx-auto">We leverage cutting-edge technology to assess, refurbish, and manage pre-owned EVs at scale — making them reliable and affordable.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {techHighlights.map((t) => (
              <div key={t.title} className="glass-card p-8 border-white/5 hover:border-primary/30 transition-all group flex gap-6 items-start">
                <div className="bg-primary/10 w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <t.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">{t.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 glass-card p-8 border-primary/10">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/40 mb-6">Revenue Streams</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {revenueStreams.map((r) => (
                <div key={r} className="flex items-center gap-3">
                  <ChevronRight className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-white/70">{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Expansion Plan */}
      <section className="py-24 px-6 bg-secondary/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Expansion Plan</span>
            <h2 className="text-4xl font-black mt-2">Scaling Across Bharat</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {expansionPlan.map((phase) => (
              <div key={phase.year} className={`glass-card p-8 border-${phase.color === 'primary' ? 'primary' : phase.color === 'accent' ? 'accent' : 'white'}/20 relative overflow-hidden`}>
                <div className={`absolute top-0 left-0 right-0 h-1 bg-${phase.color === 'primary' ? 'primary' : phase.color === 'accent' ? 'accent' : 'white/30'}`} />
                <div className="flex items-center justify-between mb-6">
                  <div className={`text-4xl font-black ${phase.color === 'primary' ? 'text-primary' : phase.color === 'accent' ? 'text-accent' : 'text-white/60'}`}>{phase.year}</div>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${phase.color === 'primary' ? 'bg-primary/10 text-primary' : phase.color === 'accent' ? 'bg-accent/10 text-accent' : 'bg-white/5 text-white/40'}`}>{phase.status}</span>
                </div>
                <div className="mb-4">
                  <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Cities</div>
                  <div className="flex flex-wrap gap-2">
                    {phase.cities.map(c => (
                      <span key={c} className="flex items-center gap-1 text-xs bg-white/5 px-2 py-1 rounded-full">
                        <MapPin className="w-2.5 h-2.5" /> {c}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-white/40 mb-2">Targets</div>
                  {phase.targets.map(t => (
                    <div key={t} className="flex items-center gap-2 text-sm text-white/70 mt-1">
                      <ChevronRight className="w-3 h-3 text-primary" /> {t}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-primary text-xs font-bold uppercase tracking-widest">The Team</span>
            <h2 className="text-4xl font-black mt-2">Built by Believers</h2>
            <p className="text-white/50 mt-3">Experienced automotive and EV industry veterans driving India's clean mobility revolution.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {team.map((member) => (
              <div key={member.name} className="glass-card p-8 border-white/5 hover:border-primary/30 transition-all text-center w-72 group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden mx-auto mb-4 ring-2 ring-white/10 group-hover:ring-primary/40 transition-all">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <h3 className="text-lg font-bold">{member.name}</h3>
                <p className="text-primary text-sm font-medium mt-1">{member.role}</p>
                <p className="text-white/40 text-sm mt-3 leading-relaxed">{member.bio}</p>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-white/40 hover:text-primary transition-colors border border-white/10 hover:border-primary/40 px-4 py-2 rounded-full"
                >
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  View on LinkedIn
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-primary/10 via-background to-background border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4">Ready to Go Electric?</h2>
          <p className="text-white/50 mb-10">Join hundreds of businesses and individuals already driving India's clean mobility future with ZMR Mobility.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/leasing" className="bg-primary text-background font-bold px-8 py-3.5 rounded-full hover:scale-105 transition-transform electric-glow flex items-center gap-2">
              Explore EV Leasing <ArrowRight className="w-4 h-4" />
            </a>
            <a href="/#procurement" className="border border-white/20 text-white px-8 py-3.5 rounded-full hover:border-primary/50 hover:text-primary transition-colors">
              Sell Your EV
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
