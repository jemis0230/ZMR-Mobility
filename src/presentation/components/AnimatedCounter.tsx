'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number; // ms
}

/**
 * Renders the real number on the server (good for SEO and no-JS), then counts up
 * only when the number scrolls into view later. Counters already visible on load,
 * or for users who prefer reduced motion, never animate.
 */
export default function AnimatedCounter({ target, suffix = '', prefix = '', duration = 1800 }: AnimatedCounterProps) {
  const [count, setCount] = useState(target);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

    let frame: number | null = null;
    let first = true;
    const io = new IntersectionObserver(([entry]) => {
      if (first) {
        first = false;
        if (entry.isIntersecting) { io.disconnect(); return; } // visible at load: keep final value
        setCount(0);
        return;
      }
      if (!entry.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        setCount(Math.round((1 - Math.pow(1 - progress, 3)) * target));
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, { rootMargin: '0px 0px -60px 0px' });

    io.observe(el);
    return () => { io.disconnect(); if (frame !== null) cancelAnimationFrame(frame); };
  }, [target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count}{suffix}
    </span>
  );
}
