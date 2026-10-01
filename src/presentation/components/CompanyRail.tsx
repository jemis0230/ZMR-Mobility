"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const companies = [
  { name: "Bajaj", logo: "/companies/bajaj.webp" },
  { name: "BGauss", logo: "/companies/bgauss.webp" },
  { name: "MG", logo: "/companies/mg.webp" },
  { name: "Montra Electric", logo: "/companies/montra_electric.webp" },
  { name: "Piaggio", logo: "/companies/piaggio.webp" },
  { name: "Tata Motors", logo: "/companies/tataMotors-ezgif.com-png-to-webp-converter.webp" },
  { name: "TVS", logo: "/companies/tvs-ezgif.com-png-to-webp-converter.webp" },
];

export default function CompanyRail() {
  // Triple the list for ultra-smooth infinite scroll and to handle wide screens
  const duplicatedCompanies = [...companies, ...companies, ...companies];

  return (
    <section className="py-16 bg-background relative overflow-hidden border-b border-ink/[0.08]">
      {/* Dynamic Background Beams */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
        <div className="absolute top-0 left-2/4 w-[1px] h-full bg-gradient-to-b from-transparent via-accent/30 to-transparent" />
        <div className="absolute top-0 left-3/4 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center text-center space-y-4"
        >
          <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full bg-ink/5 border border-ink/10 text-[10px] font-bold uppercase tracking-[0.2em] text-ink/60">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Trusted OEM Partners
          </div>
          <h2 className="text-xl md:text-2xl font-black text-ink/85">
            Powering Bharat's EV Revolution with <span className="text-primary">Industry Leaders</span>
          </h2>
        </motion.div>
      </div>

      {/* The Rail Container */}
      <div className="relative group">
        {/* Glass Edge Fades */}
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-background via-background/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-background via-background/80 to-transparent z-20 pointer-events-none" />

        {/* Infinite Scroller */}
        <div className="flex overflow-hidden relative">
          <motion.div
            className="flex items-center gap-16 md:gap-24 py-4 pr-16 md:pr-24"
            animate={{
              x: ["0%", "-33.333%"],
            }}
            transition={{
              duration: 40,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {duplicatedCompanies.map((company, index) => (
              <div
                key={index}
                className="relative flex items-center justify-center min-w-[120px] md:min-w-[160px] h-20 group/logo"
              >
                {/* Logo with interactive state */}
                <div className="relative z-10 grayscale opacity-70 group-hover/logo:grayscale-0 group-hover/logo:opacity-100 group-hover/logo:scale-110 transition-all duration-700 ease-out cursor-pointer">
                  <Image
                    src={company.logo}
                    alt={company.name}
                    width={180}
                    height={80}
                    className="max-w-[120px] md:max-w-[160px] max-h-[50px] object-contain mix-blend-multiply"
                  />
                </div>
                
                {/* Individual Hover Glow */}
                <div className="absolute inset-0 bg-primary/10 rounded-[3rem] blur-3xl opacity-0 group-hover/logo:opacity-100 transition-opacity duration-500 scale-150" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom Beam */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </section>
  );
}
