'use client';

import { useEffect, useRef } from 'react';

// ── Circuit trace paths (orthogonal PCB-style routes) ─────────
const TRACES = [
  { d: 'M 0 30 H 120 V 60 H 300 V 20 H 420', len: 520, delay: 0,    dur: 6 },
  { d: 'M 80 100 V 0', len: 100, delay: 1.2, dur: 4 },
  { d: 'M 0 80 H 60 V 140 H 200', len: 340, delay: 2.5, dur: 7 },
  { d: 'M 420 0 V 50 H 340 V 120 H 500 V 80 H 600', len: 480, delay: 0.8, dur: 5.5 },
  { d: 'M 500 140 V 60 H 460', len: 220, delay: 3.2, dur: 4.5 },
  { d: 'M 200 0 V 70 H 280 V 30 H 360', len: 320, delay: 1.8, dur: 6.5 },
  { d: 'M 0 110 H 40 V 80 H 160 V 140 H 240 V 100', len: 440, delay: 4,   dur: 5 },
  { d: 'M 320 140 V 110 H 400 V 90 H 480 V 140', len: 280, delay: 2.1, dur: 7.5 },
];

// Junction nodes (where traces meet)
const NODES = [
  { cx: 120, cy: 30 }, { cx: 120, cy: 60 }, { cx: 300, cy: 60 },
  { cx: 300, cy: 20 }, { cx: 80,  cy: 100 }, { cx: 60,  cy: 80 },
  { cx: 60,  cy: 140 }, { cx: 200, cy: 140 }, { cx: 340, cy: 50 },
  { cx: 340, cy: 120 }, { cx: 460, cy: 60 }, { cx: 280, cy: 70 },
  { cx: 280, cy: 30 }, { cx: 40,  cy: 80 }, { cx: 160, cy: 80 },
  { cx: 160, cy: 140 }, { cx: 240, cy: 100 }, { cx: 400, cy: 110 },
  { cx: 480, cy: 90 }, { cx: 360, cy: 30 },
];

// EV silhouette paths (simplified blueprint style)
const SILHOUETTES = [
  {
    // Electric scooter (top-right area)
    d: 'M 20 40 C 20 40 30 20 55 18 C 70 16 85 22 95 30 C 105 38 108 52 100 58 C 92 64 78 64 70 58 C 62 64 38 64 30 58 C 22 52 18 48 20 40 Z M 55 18 L 60 5 M 45 55 C 45 55 42 65 45 70 M 80 55 C 80 55 77 65 80 70',
    len: 280,
    delay: 0,
    dur: 18,
    x: '62%',
    y: '5%',
    scale: 1.8,
    opacity: 0.09,
  },
  {
    // Auto-rickshaw silhouette (bottom-left)
    d: 'M 10 50 H 80 C 80 50 90 50 90 40 V 20 C 90 10 80 8 70 8 H 30 C 20 8 10 10 10 20 V 50 Z M 25 50 C 25 58 18 65 12 65 C 6 65 0 58 0 50 C 0 42 6 35 12 35 C 18 35 25 42 25 50 Z M 75 50 C 75 58 68 65 62 65 C 56 65 50 58 50 50 C 50 42 56 35 62 35 C 68 35 75 42 75 50 Z M 30 8 V 50 M 60 8 V 50',
    len: 320,
    delay: 7,
    dur: 20,
    x: '2%',
    y: '55%',
    scale: 2.2,
    opacity: 0.07,
  },
  {
    // Sedan silhouette (top-left)
    d: 'M 5 40 H 130 M 5 40 C 5 40 10 55 20 55 H 110 C 120 55 130 40 130 40 M 25 40 C 30 25 40 15 55 15 H 75 C 90 15 100 25 105 40 M 30 55 C 30 63 24 68 18 68 C 12 68 5 63 5 55 C 5 47 11 42 18 42 C 24 42 30 47 30 55 Z M 110 55 C 110 63 104 68 98 68 C 92 68 85 63 85 55 C 85 47 91 42 98 42 C 104 42 110 47 110 55 Z',
    len: 360,
    delay: 14,
    dur: 22,
    x: '5%',
    y: '8%',
    scale: 2.5,
    opacity: 0.06,
  },
  {
    // Electric bolt / lightning (center-right)
    d: 'M 0 0 L -12 20 H 0 L -16 40 L 12 14 H 2 Z',
    len: 120,
    delay: 4,
    dur: 10,
    x: '88%',
    y: '40%',
    scale: 3,
    opacity: 0.12,
  },
];

export default function EVCircuitBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const targetRef = useRef({ rx: 0, ry: 0 });
  const currentRef = useRef({ rx: 0, ry: 0 });

  useEffect(() => {
    const MAX_DEG = 5;

    function onMouseMove(e: MouseEvent) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      // Normalize to [-1, 1]
      const nx = (e.clientX / w - 0.5) * 2;
      const ny = (e.clientY / h - 0.5) * 2;
      targetRef.current.rx = -ny * MAX_DEG;
      targetRef.current.ry = nx * MAX_DEG;
    }

    function tick() {
      const t = targetRef.current;
      const c = currentRef.current;
      // Lerp for smoothness
      c.rx += (t.rx - c.rx) * 0.05;
      c.ry += (t.ry - c.ry) * 0.05;

      if (containerRef.current) {
        const grid = containerRef.current.querySelector<HTMLElement>('[data-grid]');
        if (grid) {
          grid.style.transform = `rotateX(${c.rx}deg) rotateY(${c.ry}deg)`;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>

      {/* ── Layer 1: Mouse-reactive perspective grid ── */}
      <div
        className="absolute inset-0"
        style={{ perspective: '900px', perspectiveOrigin: '50% 50%' }}
      >
        <div
          data-grid
          className="absolute inset-[-20%]"
          style={{
            transformStyle: 'preserve-3d',
            willChange: 'transform',
            backgroundImage: [
              'linear-gradient(rgba(0,209,255,0.06) 1px, transparent 1px)',
              'linear-gradient(90deg, rgba(0,209,255,0.06) 1px, transparent 1px)',
            ].join(', '),
            backgroundSize: '72px 72px',
            transition: 'transform 0.1s linear',
          }}
        />
      </div>

      {/* ── Layer 2: SVG circuit traces with flowing current ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 600 150"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glowing gradient for the traveling current packet */}
          <linearGradient id="current-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(0,209,255,0)" />
            <stop offset="40%" stopColor="rgba(0,209,255,0)" />
            <stop offset="50%" stopColor="rgba(0,209,255,0.9)" />
            <stop offset="60%" stopColor="rgba(0,209,255,0)" />
            <stop offset="100%" stopColor="rgba(0,209,255,0)" />
          </linearGradient>
          <filter id="glow-sm">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {TRACES.map((tr, i) => (
          <g key={i}>
            {/* Static idle trace */}
            <path
              d={tr.d}
              fill="none"
              stroke="rgba(0,209,255,0.10)"
              strokeWidth="0.8"
            />
            {/* Animated current packet */}
            <path
              d={tr.d}
              fill="none"
              stroke="rgba(0,209,255,0.7)"
              strokeWidth="1.2"
              strokeDasharray={`${tr.len * 0.12} ${tr.len}`}
              filter="url(#glow-sm)"
              style={{
                animation: `circuit-flow ${tr.dur}s ${tr.delay}s linear infinite`,
                strokeDashoffset: tr.len,
              }}
            />
          </g>
        ))}

        {/* Junction nodes */}
        {NODES.map((n, i) => (
          <circle
            key={i}
            cx={n.cx}
            cy={n.cy}
            r="1.8"
            fill="rgba(0,209,255,0.5)"
            style={{
              animation: `node-pulse ${2.5 + (i % 4) * 0.4}s ${(i * 0.35) % 2.5}s ease-in-out infinite`,
              transformOrigin: `${n.cx}px ${n.cy}px`,
            }}
          />
        ))}
      </svg>

      {/* ── Layer 3: EV silhouette blueprints ── */}
      {SILHOUETTES.map((s, i) => (
        <div
          key={i}
          className="absolute"
          style={{ left: s.x, top: s.y }}
        >
          <svg
            viewBox="-10 -10 160 100"
            width={160 * s.scale}
            height={100 * s.scale}
            fill="none"
            stroke={`rgba(0,209,255,${s.opacity})`}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: 'visible' }}
          >
            <path
              d={s.d}
              strokeDasharray="1200"
              style={{
                animation: `ev-draw ${s.dur}s ${s.delay}s ease-in-out infinite`,
                strokeDashoffset: 1200,
              }}
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
