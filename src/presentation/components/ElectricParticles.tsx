'use client';

import { motion } from 'framer-motion';

const PARTICLES = [
  { x: '8%',  y: '15%', size: 5, color: 'rgba(0,255,133,0.7)',  delay: 0,    dur: 3.2 },
  { x: '18%', y: '70%', size: 3, color: 'rgba(0,229,255,0.5)',  delay: 0.8,  dur: 4.5 },
  { x: '28%', y: '35%', size: 6, color: 'rgba(0,255,133,0.5)',  delay: 1.4,  dur: 2.8 },
  { x: '40%', y: '80%', size: 4, color: 'rgba(0,229,255,0.4)',  delay: 0.3,  dur: 5.1 },
  { x: '52%', y: '20%', size: 3, color: 'rgba(0,255,133,0.6)',  delay: 2.0,  dur: 3.7 },
  { x: '62%', y: '60%', size: 7, color: 'rgba(0,229,255,0.35)', delay: 0.6,  dur: 4.2 },
  { x: '72%', y: '40%', size: 4, color: 'rgba(0,255,133,0.55)', delay: 1.1,  dur: 3.0 },
  { x: '82%', y: '75%', size: 5, color: 'rgba(0,229,255,0.45)', delay: 1.7,  dur: 4.8 },
  { x: '90%', y: '25%', size: 3, color: 'rgba(0,255,133,0.4)',  delay: 0.4,  dur: 3.5 },
  { x: '14%', y: '50%', size: 4, color: 'rgba(0,229,255,0.6)',  delay: 2.3,  dur: 2.6 },
  { x: '35%', y: '55%', size: 6, color: 'rgba(0,255,133,0.45)', delay: 1.5,  dur: 5.0 },
  { x: '55%', y: '85%', size: 3, color: 'rgba(0,229,255,0.5)',  delay: 0.9,  dur: 3.9 },
  { x: '75%', y: '12%', size: 5, color: 'rgba(0,255,133,0.6)',  delay: 1.2,  dur: 4.1 },
  { x: '92%', y: '55%', size: 4, color: 'rgba(0,229,255,0.4)',  delay: 2.1,  dur: 2.9 },
  { x: '47%', y: '45%', size: 7, color: 'rgba(0,255,133,0.3)',  delay: 0.7,  dur: 4.6 },
  { x: '6%',  y: '88%', size: 3, color: 'rgba(0,229,255,0.55)', delay: 1.9,  dur: 3.3 },
  { x: '67%', y: '92%', size: 5, color: 'rgba(0,255,133,0.5)',  delay: 0.5,  dur: 4.0 },
  { x: '84%', y: '38%', size: 4, color: 'rgba(0,229,255,0.45)', delay: 1.6,  dur: 3.6 },
];

// Connection lines between nearby particles (hand-picked pairs)
const CONNECTIONS = [
  [0, 2], [1, 3], [2, 4], [4, 6], [6, 8],
  [9, 10], [11, 12], [13, 14], [15, 16], [5, 7],
];

export default function ElectricParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* SVG connection lines */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {CONNECTIONS.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={PARTICLES[a].x} y1={PARTICLES[a].y}
            x2={PARTICLES[b].x} y2={PARTICLES[b].y}
            stroke="rgba(0,255,133,0.12)"
            strokeWidth="1"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.5, 0] }}
            transition={{ duration: 4, delay: i * 0.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </svg>

      {/* Floating dots */}
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [0, -16, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: p.dur,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
