'use client';

// ── Building data ──────────────────────────────────────────────
const BUILDINGS = [
  { x: 20,   y: 40,  w: 52,  h: 80,  cols: 4, rows: 5 },
  { x: 90,   y: 15,  w: 28,  h: 105, cols: 2, rows: 8 },
  { x: 135,  y: 55,  w: 68,  h: 65,  cols: 5, rows: 3 },
  { x: 260,  y: 28,  w: 82,  h: 92,  cols: 5, rows: 5 },
  { x: 360,  y: 58,  w: 42,  h: 62,  cols: 3, rows: 3 },
  { x: 415,  y: 10,  w: 35,  h: 110, cols: 2, rows: 9 },
  { x: 465,  y: 48,  w: 60,  h: 72,  cols: 4, rows: 4 },
  { x: 540,  y: 35,  w: 25,  h: 85,  cols: 2, rows: 6 },
  { x: 580,  y: 60,  w: 55,  h: 60,  cols: 4, rows: 3 },
  { x: 650,  y: 20,  w: 45,  h: 100, cols: 3, rows: 7 },
  { x: 712,  y: 50,  w: 70,  h: 70,  cols: 5, rows: 4 },
  { x: 800,  y: 30,  w: 38,  h: 90,  cols: 2, rows: 6 },
  { x: 855,  y: 12,  w: 30,  h: 108, cols: 2, rows: 8 },
  { x: 900,  y: 55,  w: 65,  h: 65,  cols: 4, rows: 3 },
  { x: 980,  y: 38,  w: 50,  h: 82,  cols: 3, rows: 5 },
  { x: 1045, y: 22,  w: 38,  h: 98,  cols: 2, rows: 7 },
  { x: 1100, y: 58,  w: 58,  h: 62,  cols: 4, rows: 3 },
  { x: 1175, y: 42,  w: 30,  h: 78,  cols: 2, rows: 5 },
  { x: 1220, y: 15,  w: 80,  h: 105, cols: 5, rows: 7 },
  { x: 1320, y: 48,  w: 45,  h: 72,  cols: 3, rows: 4 },
  { x: 1380, y: 28,  w: 32,  h: 92,  cols: 2, rows: 6 },
  { x: 1425, y: 62,  w: 60,  h: 58,  cols: 4, rows: 3 },
  { x: 1500, y: 35,  w: 42,  h: 85,  cols: 3, rows: 5 },
  { x: 1558, y: 50,  w: 50,  h: 70,  cols: 3, rows: 4 },
];

const DARK_BUILDINGS = new Set([1, 3, 6, 11, 15, 19, 21]);

const LAMP_X = [60, 260, 460, 660, 860, 1060, 1260];
const TREE_X = [140, 540, 940, 1180];

const STARS = [
  { left: '4%',  top: '8%',  size: 1.5, opacity: 0.7 },
  { left: '9%',  top: '22%', size: 1,   opacity: 0.5 },
  { left: '15%', top: '12%', size: 2,   opacity: 0.6 },
  { left: '22%', top: '5%',  size: 1,   opacity: 0.4 },
  { left: '31%', top: '18%', size: 1.5, opacity: 0.6 },
  { left: '40%', top: '9%',  size: 1,   opacity: 0.5 },
  { left: '48%', top: '20%', size: 2,   opacity: 0.4 },
  { left: '55%', top: '6%',  size: 1,   opacity: 0.7 },
  { left: '63%', top: '15%', size: 1.5, opacity: 0.5 },
  { left: '71%', top: '8%',  size: 1,   opacity: 0.6 },
  { left: '78%', top: '22%', size: 2,   opacity: 0.4 },
  { left: '84%', top: '10%', size: 1,   opacity: 0.7 },
  { left: '90%', top: '17%', size: 1.5, opacity: 0.5 },
  { left: '96%', top: '6%',  size: 1,   opacity: 0.6 },
];

// ── Window grid helper ─────────────────────────────────────────
function BuildingWindows({ b, idx }: { b: typeof BUILDINGS[0]; idx: number }) {
  const windows: React.ReactElement[] = [];
  const baseX = b.x + 7;
  const baseY = b.y + 8;
  let winIdx = 0;
  for (let col = 0; col < b.cols; col++) {
    for (let row = 0; row < b.rows; row++) {
      const isCyan = winIdx % 8 === 3;
      windows.push(
        <rect
          key={`${idx}-${col}-${row}`}
          x={baseX + col * 10}
          y={baseY + row * 13}
          width={5}
          height={4}
          fill={isCyan ? 'rgba(0,209,255,0.45)' : 'rgba(255,180,60,0.55)'}
        />
      );
      winIdx++;
    }
  }
  return <>{windows}</>;
}

// ── Buildings SVG (1600px wide, rendered ×2 for loop) ─────────
function BuildingsSVG() {
  return (
    <svg
      viewBox="0 0 1600 120"
      width="1600"
      height="100%"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Spire */}
      <polygon points="220,120 232,22 244,120" fill="#0b1220" />

      {/* Building bodies */}
      {BUILDINGS.map((b, i) => (
        <rect
          key={i}
          x={b.x} y={b.y} width={b.w} height={b.h}
          fill={DARK_BUILDINGS.has(i) ? '#0b1220' : '#0e1628'}
        />
      ))}

      {/* Windows */}
      {BUILDINGS.map((b, i) => (
        <BuildingWindows key={i} b={b} idx={i} />
      ))}

      {/* Ground baseline */}
      <rect x="0" y="118" width="1600" height="2" fill="#1a2535" />
    </svg>
  );
}

// ── Mid-ground SVG (1400px wide, rendered ×2 for loop) ────────
function MidGroundSVG() {
  return (
    <svg
      viewBox="0 0 1400 80"
      width="1400"
      height="100%"
      preserveAspectRatio="none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Street lamps */}
      {LAMP_X.map((lx) => (
        <g key={lx}>
          <line x1={lx} y1="12" x2={lx} y2="80" stroke="#2a2a2a" strokeWidth="2.5" />
          <path d={`M${lx - 13} 12 Q${lx} 3 ${lx + 13} 12`} stroke="#2a2a2a" strokeWidth="2" strokeLinecap="round" />
          <circle cx={lx} cy="7" r="10" fill="rgba(255,200,100,0.08)" />
          <ellipse
            cx={lx} cy="7" rx="3" ry="3"
            fill="rgba(255,200,100,0.5)"
            style={{ filter: 'drop-shadow(0 0 5px rgba(255,190,80,0.7))' }}
          />
        </g>
      ))}

      {/* Charging station at x=380 */}
      <rect x="370" y="20" width="22" height="58" rx="3" fill="#0d1f0d" stroke="#00D1FF" strokeWidth="1" />
      <rect x="368" y="18" width="26" height="6" rx="2" fill="#0a2a0a" stroke="#00D1FF" strokeWidth="0.8" />
      <path d="M375 24 Q366 34 370 48" stroke="#00D1FF" strokeWidth="1.2" strokeLinecap="round" />
      <path
        d="M380 30 L376 42 H382 L378 56"
        stroke="#70FF00"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="60"
        style={{ animation: 'bolt-draw 3s 0.5s ease-in-out infinite', strokeDashoffset: 60 }}
      />

      {/* Trees */}
      {TREE_X.map((tx) => (
        <g key={tx}>
          <line x1={tx} y1="50" x2={tx} y2="80" stroke="#1a3a0a" strokeWidth="3" />
          <ellipse cx={tx} cy="40" rx="15" ry="18" fill="#0a1a06" stroke="#1a3a0a" strokeWidth="1" />
        </g>
      ))}

      {/* Low wall */}
      <rect x="0" y="72" width="1400" height="8" fill="#1a1a1a" stroke="#222" strokeWidth="0.5" />
    </svg>
  );
}

// ── Scooter SVG (faces LEFT — for RTL) ────────────────────────
function ScooterSVG() {
  return (
    <svg viewBox="0 0 120 50" width="90" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 28 Q32 14 48 13 L78 13 Q92 13 96 22 L100 28 L96 32 Q88 38 78 38 L42 38 Q32 38 30 28Z"
        fill="#1a2a3a" stroke="#00D1FF" strokeWidth="1.2" />
      <path d="M62 13 Q66 6 74 6 Q82 7 84 13" fill="#122030" stroke="#00D1FF" strokeWidth="1" />
      <path d="M96 18 L102 10 M98 10 L106 10" stroke="#00D1FF" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="46" y="36" width="40" height="4" rx="2" fill="#0d1a28" stroke="#00D1FF" strokeWidth="0.8" />
      <circle cx="96" cy="38" r="9" fill="#0d0d0d" stroke="#00D1FF" strokeWidth="1.4" />
      <circle cx="96" cy="38" r="4" fill="none" stroke="#00D1FF" strokeWidth="0.8" opacity="0.5" />
      <circle cx="30" cy="38" r="9" fill="#0d0d0d" stroke="#00D1FF" strokeWidth="1.4" />
      <circle cx="30" cy="38" r="4" fill="none" stroke="#00D1FF" strokeWidth="0.8" opacity="0.5" />
      <ellipse cx="101" cy="24" rx="4" ry="3"
        fill="rgba(255,240,180,0.9)"
        style={{ filter: 'drop-shadow(0 0 4px rgba(255,240,180,0.9))' }}
      />
      <rect x="26" y="24" width="5" height="3" rx="1" fill="#FFA500"
        style={{ animation: 'indicator-blink 1.2s ease-in-out infinite' }}
      />
    </svg>
  );
}

// ── Auto-rickshaw SVG (faces LEFT — for RTL) ──────────────────
function AutoSVG() {
  return (
    <svg viewBox="0 0 120 50" width="110" height="46" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 18 Q22 10 32 9 L82 9 Q90 9 92 14 L98 22" stroke="#00D1FF" strokeWidth="1.2" />
      <rect x="20" y="18" width="10" height="20" rx="1" fill="#1a2a1a" stroke="#00D1FF" strokeWidth="1" />
      <path d="M30 9 L92 14 L98 22 L98 38 L20 38 L20 18 L30 9Z" fill="#122015" stroke="#00D1FF" strokeWidth="1.2" />
      <path d="M34 10 L88 14 L88 24 L34 24Z" fill="rgba(0,209,255,0.08)" stroke="#00D1FF" strokeWidth="0.8" />
      <rect x="22" y="19" width="8" height="12" rx="1" fill="rgba(0,209,255,0.06)" stroke="#00D1FF" strokeWidth="0.7" />
      <rect x="20" y="36" width="80" height="3" rx="1" fill="#0d1a10" stroke="#00D1FF" strokeWidth="0.8" />
      <circle cx="92" cy="40" r="8" fill="#0d0d0d" stroke="#00D1FF" strokeWidth="1.4" />
      <circle cx="92" cy="40" r="3.5" fill="none" stroke="#00D1FF" strokeWidth="0.7" opacity="0.5" />
      <circle cx="30" cy="40" r="8" fill="#0d0d0d" stroke="#00D1FF" strokeWidth="1.4" />
      <circle cx="30" cy="40" r="3.5" fill="none" stroke="#00D1FF" strokeWidth="0.7" opacity="0.5" />
      <ellipse cx="98" cy="26" rx="4" ry="3.5"
        fill="rgba(255,240,180,0.9)"
        style={{ filter: 'drop-shadow(0 0 5px rgba(255,240,180,0.9))' }}
      />
      <rect x="20" y="22" width="5" height="3" rx="1" fill="#FFA500"
        style={{ animation: 'indicator-blink 1.4s 0.3s ease-in-out infinite' }}
      />
      <path d="M40 18 L37 22 L40 22 L37 26" stroke="#00D1FF" strokeWidth="0.8" opacity="0.6" strokeLinecap="round" />
    </svg>
  );
}

// ── Sedan SVG (faces RIGHT — for LTR) ────────────────────────
function SedanSVG() {
  return (
    <svg viewBox="0 0 120 50" width="118" height="49" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 30 L8 36 L112 36 L112 30 Q108 24 100 24 L20 24 Q12 24 8 30Z"
        fill="#1a1a2a" stroke="#00D1FF" strokeWidth="1.2" />
      <path d="M28 24 Q32 12 46 11 L76 11 Q90 12 94 24" fill="#14142a" stroke="#00D1FF" strokeWidth="1.2" />
      <path d="M94 24 Q90 12 76 11 L76 24Z" fill="rgba(0,209,255,0.07)" stroke="#00D1FF" strokeWidth="0.8" />
      <path d="M28 24 Q32 12 46 11 L46 24Z" fill="rgba(0,209,255,0.07)" stroke="#00D1FF" strokeWidth="0.8" />
      <path d="M48 13 L74 13 L74 23 L48 23Z" fill="rgba(0,209,255,0.06)" stroke="#00D1FF" strokeWidth="0.7" />
      <line x1="60" y1="24" x2="60" y2="36" stroke="#00D1FF" strokeWidth="0.6" opacity="0.5" />
      <circle cx="90" cy="39" r="9.5" fill="#0d0d0d" stroke="#00D1FF" strokeWidth="1.4" />
      <circle cx="90" cy="39" r="4.5" fill="none" stroke="#00D1FF" strokeWidth="0.8" opacity="0.5" />
      <circle cx="28" cy="39" r="9.5" fill="#0d0d0d" stroke="#00D1FF" strokeWidth="1.4" />
      <circle cx="28" cy="39" r="4.5" fill="none" stroke="#00D1FF" strokeWidth="0.8" opacity="0.5" />
      <ellipse cx="110" cy="29" rx="5" ry="3.5"
        fill="rgba(255,240,180,0.95)"
        style={{ filter: 'drop-shadow(0 0 6px rgba(255,240,180,0.9))' }}
      />
      <rect x="8" y="28" width="5" height="4" rx="1"
        fill="rgba(255,80,80,0.7)"
        style={{ filter: 'drop-shadow(0 0 3px rgba(255,80,80,0.5))' }}
      />
      <rect x="110" y="32" width="5" height="3" rx="1" fill="#FFA500"
        style={{ animation: 'indicator-blink 1.1s 0.8s ease-in-out infinite' }}
      />
      <rect x="15" y="26" width="6" height="5" rx="1" fill="none" stroke="#00D1FF" strokeWidth="0.8" opacity="0.7" />
    </svg>
  );
}

// ── Cargo Van SVG (faces RIGHT — for LTR) ────────────────────
function CargoVanSVG() {
  return (
    <svg viewBox="0 0 120 50" width="130" height="54" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="10" width="98" height="28" rx="3" fill="#1a1a14" stroke="#00D1FF" strokeWidth="1.2" />
      <line x1="82" y1="10" x2="82" y2="38" stroke="#00D1FF" strokeWidth="0.8" opacity="0.7" />
      <path d="M82 10 Q88 6 98 8 L106 10" fill="#161610" stroke="#00D1FF" strokeWidth="1" />
      <path d="M84 11 Q90 8 100 10 L100 22 L84 22Z" fill="rgba(0,209,255,0.07)" stroke="#00D1FF" strokeWidth="0.8" />
      <line x1="8" y1="10" x2="8" y2="38" stroke="#00D1FF" strokeWidth="1.2" />
      <rect x="9" y="22" width="7" height="4" rx="1" fill="none" stroke="#00D1FF" strokeWidth="0.7" opacity="0.6" />
      <line x1="30" y1="10" x2="30" y2="38" stroke="#00D1FF" strokeWidth="0.5" opacity="0.3" />
      <line x1="55" y1="10" x2="55" y2="38" stroke="#00D1FF" strokeWidth="0.5" opacity="0.3" />
      <rect x="8" y="36" width="98" height="4" rx="1" fill="#0d0d0a" stroke="#00D1FF" strokeWidth="0.8" />
      <circle cx="96" cy="40" r="9" fill="#0d0d0d" stroke="#00D1FF" strokeWidth="1.4" />
      <circle cx="96" cy="40" r="4" fill="none" stroke="#00D1FF" strokeWidth="0.8" opacity="0.5" />
      <circle cx="22" cy="40" r="9" fill="#0d0d0d" stroke="#00D1FF" strokeWidth="1.4" />
      <circle cx="22" cy="40" r="4" fill="none" stroke="#00D1FF" strokeWidth="0.8" opacity="0.5" />
      <ellipse cx="108" cy="17" rx="5" ry="4"
        fill="rgba(255,240,180,0.9)"
        style={{ filter: 'drop-shadow(0 0 6px rgba(255,240,180,0.9))' }}
      />
      <rect x="8" y="14" width="4" height="6" rx="1"
        fill="rgba(255,80,80,0.65)"
        style={{ filter: 'drop-shadow(0 0 3px rgba(255,80,80,0.4))' }}
      />
      <text x="36" y="27" fontSize="6" fill="#00D1FF" opacity="0.35" fontFamily="monospace">ZMR</text>
      <rect x="108" y="20" width="6" height="4" rx="1" fill="#FFA500"
        style={{ animation: 'indicator-blink 1.3s 0.5s ease-in-out infinite' }}
      />
    </svg>
  );
}

// ── Main Component ─────────────────────────────────────────────

export default function EVCityStrip() {
  return (
    <div
      aria-hidden="true"
      className="w-full overflow-hidden relative"
      style={{ perspective: '800px' }}
    >
      {/* Top fade mask */}
      <div
        className="absolute top-0 left-0 right-0 z-30 pointer-events-none"
        style={{ height: 32, background: 'linear-gradient(to bottom, #0A0A0A, transparent)' }}
      />
      {/* Bottom fade mask */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none"
        style={{ height: 32, background: 'linear-gradient(to top, #0A0A0A, transparent)' }}
      />

      {/* Inner strip — slight 3D tilt */}
      <div
        className="w-full h-[140px] md:h-[200px] overflow-hidden relative"
        style={{ transform: 'rotateX(4deg)', transformOrigin: '50% 100%' }}
      >

        {/* ════ Layer 1: Sky ════ */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, #060c1f 0%, #0d1a35 60%, #111111 100%)' }}
        />

        {/* ════ Layer 2: Stars ════ */}
        <div className="absolute inset-0 pointer-events-none">
          {STARS.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white"
              style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: s.opacity }}
            />
          ))}
        </div>

        {/* ════ Layer 3: Buildings (scrolls slow) ════ */}
        <div className="absolute inset-x-0" style={{ top: 0, height: '58%', overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              width: '3200px',
              height: '100%',
              animation: 'city-scroll-slow 80s linear infinite',
              willChange: 'transform',
            }}
          >
            <BuildingsSVG />
            <BuildingsSVG />
          </div>
        </div>

        {/* ════ Layer 4: Mid-ground (scrolls medium) ════ */}
        <div className="absolute inset-x-0" style={{ top: '40%', height: '20%', overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              width: '2800px',
              height: '100%',
              animation: 'city-scroll-medium 45s linear infinite',
              willChange: 'transform',
            }}
          >
            <MidGroundSVG />
            <MidGroundSVG />
          </div>
        </div>

        {/* ════ Layer 5: Road surface ════ */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{ height: '42%', background: '#111111' }}
        >
          {/* Road top edge */}
          <div className="absolute top-0 left-0 right-0" style={{ height: 2, background: 'rgba(255,255,255,0.06)' }} />
          {/* Centre divider (yellow dashes) */}
          <div
            className="absolute left-0 right-0"
            style={{
              top: '48%',
              height: 2,
              backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,200,50,0.5) 0px, rgba(255,200,50,0.5) 20px, transparent 20px, transparent 40px)',
            }}
          />
        </div>

        {/* ════ Layer 6: Lane dashes (motion illusion) ════ */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none" style={{ height: '42%', overflow: 'hidden' }}>
          {/* Top lane — moves left */}
          <div
            style={{
              position: 'absolute',
              top: '20%',
              left: 0,
              width: '200%',
              height: 2,
              backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.22) 0px, rgba(255,255,255,0.22) 30px, transparent 30px, transparent 80px)',
              animation: 'city-lane-dash 3.5s linear infinite',
              willChange: 'transform',
            }}
          />
          {/* Bottom lane — moves right (reverse) */}
          <div
            style={{
              position: 'absolute',
              top: '72%',
              left: 0,
              width: '200%',
              height: 2,
              backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.22) 0px, rgba(255,255,255,0.22) 30px, transparent 30px, transparent 80px)',
              animation: 'city-lane-dash 3.5s linear infinite reverse',
              willChange: 'transform',
            }}
          />
        </div>

        {/* ════ Layer 7: Vehicles ════ */}

        {/* ── Scooter: RTL, top lane ── */}
        <div
          className="absolute flex items-center"
          style={{
            top: '58%',
            left: 0,
            animation: 'vehicle-rtl 16s 0s linear infinite',
            willChange: 'transform',
          }}
        >
          {/* Speed trail (to the left — behind the scooter) */}
          <div style={{
            width: 60, height: 10,
            background: 'linear-gradient(to left, rgba(0,209,255,0.18), transparent)',
            borderRadius: 2,
            marginRight: -2,
          }} />
          <ScooterSVG />
        </div>

        {/* ── Auto-rickshaw: RTL, top lane ── */}
        <div
          className="absolute flex items-center"
          style={{
            top: '55%',
            left: 0,
            animation: 'vehicle-rtl 22s 8s linear infinite',
            willChange: 'transform',
          }}
        >
          <div style={{
            width: 80, height: 14,
            background: 'linear-gradient(to left, rgba(0,209,255,0.15), transparent)',
            borderRadius: 2,
            marginRight: -2,
          }} />
          <AutoSVG />
        </div>

        {/* ── Sedan: LTR, bottom lane ── */}
        <div
          className="absolute flex items-center flex-row-reverse"
          style={{
            top: '68%',
            left: 0,
            animation: 'vehicle-ltr 13s 3s linear infinite',
            willChange: 'transform',
          }}
        >
          {/* Speed trail goes to the right (behind vehicle moving right) */}
          <div style={{
            width: 90, height: 12,
            background: 'linear-gradient(to right, rgba(0,209,255,0.18), transparent)',
            borderRadius: 2,
            marginLeft: -2,
          }} />
          <SedanSVG />
        </div>

        {/* ── Cargo Van: LTR, bottom lane ── */}
        <div
          className="absolute flex items-center flex-row-reverse"
          style={{
            top: '65%',
            left: 0,
            animation: 'vehicle-ltr 18s 11s linear infinite',
            willChange: 'transform',
          }}
        >
          <div style={{
            width: 100, height: 16,
            background: 'linear-gradient(to right, rgba(0,209,255,0.14), transparent)',
            borderRadius: 2,
            marginLeft: -2,
          }} />
          <CargoVanSVG />
        </div>

        {/* ════ Layer 8: Live label ════ */}
        <div
          className="absolute bottom-2 right-3 z-20 flex items-center gap-2 pointer-events-none"
        >
          <span
            className="rounded-full inline-block"
            style={{
              width: 7,
              height: 7,
              background: '#70FF00',
              animation: 'live-dot-pulse 1.8s ease-in-out infinite',
            }}
          />
          <span style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'monospace',
          }}>
            360+ EVs on the road — right now
          </span>
        </div>

      </div>
    </div>
  );
}
