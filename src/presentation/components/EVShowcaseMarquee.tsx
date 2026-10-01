'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const VEHICLES = [
  { label: '2 Wheeler',          image: '/uploads/blogs/1778426491204-2WheelerZMR.webp' },
  { label: '3W Cargo',           image: '/uploads/blogs/1778425666410-3WheelerCargoZMR.webp' },
  { label: '4W Passenger',       image: '/uploads/blogs/1778426480501-4WheelerPassengerZMR.webp' },
  { label: '4W Cargo',           image: '/uploads/blogs/1778425885716-4WheelerCargoZMR.webp' },
  { label: '3W Passenger',       image: '/uploads/blogs/1778425567762-3WheelerPassengerZMR.webp' },
  { label: '4W Cargo',           image: '/uploads/blogs/1778426244187-4WheelerCargoZMR.webp' },
  { label: '3W Passenger',       image: '/uploads/blogs/1778426640748-3WheelerPassengerZMR.webp' },
  { label: '4W Cargo',           image: '/uploads/blogs/1778426145623-3WheelerPassengerZMR.webp' },
  { label: '4W Cargo (Heavy)',   image: '/uploads/blogs/1778425207313-4WheelerCargoZMR.webp' },
];

// Split into two interleaved rows for visual variety
const ROW_1 = [...VEHICLES, ...VEHICLES]; // duplicated for seamless loop
const ROW_2 = [...[...VEHICLES].reverse(), ...[...VEHICLES].reverse()];

function VehicleCard({ label, image }: { label: string; image: string }) {
  return (
    <div className="relative flex-shrink-0 w-[220px] h-[148px] mx-3 rounded-2xl overflow-hidden border border-ink/10 hover:border-primary/60 transition-colors duration-300 group"
      style={{ boxShadow: '0 0 18px rgba(26,115,232,0.08)' }}
    >
      {/* EV image */}
      <Image
        src={image}
        alt={label}
        fill
        sizes="220px"
        className="object-contain p-3 transition-transform duration-500 group-hover:scale-105"
      />
      {/* Dark gradient at bottom */}
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background/90 to-transparent" />
      {/* Label */}
      <span className="absolute bottom-2 left-3 text-[10px] font-bold uppercase tracking-widest text-primary/80">
        {label}
      </span>
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 30px rgba(26,115,232,0.08)' }}
      />
    </div>
  );
}

export default function EVShowcaseMarquee() {
  return (
    <section className="py-20 border-y border-ink/[0.08] overflow-hidden bg-gradient-to-b from-ink/[0.01] to-transparent">
      {/* Heading */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12 px-6"
      >
        <span className="text-primary text-xs font-bold uppercase tracking-widest">Our Fleet</span>
        <h2 className="text-3xl md:text-4xl font-black mt-2 text-ink">
          India's Growing <span className="text-primary">Clean Fleet</span>
        </h2>
        <p className="text-ink/60 mt-3 text-sm">Real vehicles. Real impact. Across India.</p>
      </motion.div>

      {/* Row 1 — scrolls left */}
      <div className="marquee-row relative mb-4">
        {/* Edge fade masks */}
        <div className="absolute left-0 top-0 h-full w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgb(244,248,254), transparent)' }}
        />
        <div className="absolute right-0 top-0 h-full w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, rgb(244,248,254), transparent)' }}
        />
        <div className="flex animate-marquee-left" style={{ width: 'max-content' }}>
          {ROW_1.map((v, i) => (
            <VehicleCard key={i} label={v.label} image={v.image} />
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="marquee-row relative">
        <div className="absolute left-0 top-0 h-full w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgb(244,248,254), transparent)' }}
        />
        <div className="absolute right-0 top-0 h-full w-24 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to left, rgb(244,248,254), transparent)' }}
        />
        <div className="flex animate-marquee-right" style={{ width: 'max-content' }}>
          {ROW_2.map((v, i) => (
            <VehicleCard key={i} label={v.label} image={v.image} />
          ))}
        </div>
      </div>
    </section>
  );
}
