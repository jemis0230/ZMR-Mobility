import { INDIA_MAP_VIEWBOX, INDIA_STATE_PATHS } from "@/lib/indiaMapData";
import { PRESENCE_LOCATIONS, projectToMap } from "@/lib/presence";
import PresenceMapInteractive, { type MapPoint } from "./PresenceMapInteractive";

/** "Our Presence Across India" — map of current and planned ZMR cities. */
export default function PresenceMap({ id = "presence" }: { id?: string }) {
  const points: MapPoint[] = PRESENCE_LOCATIONS.map((l) => ({ ...l, ...projectToMap(l.lat, l.lon) }));
  const presentStates = new Set(PRESENCE_LOCATIONS.filter((l) => l.status === "current").map((l) => l.state));

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="py-16 md:py-24 px-4 md:px-6 bg-white scroll-mt-36">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-2xl">
          <p className="text-primary text-xs font-bold uppercase tracking-widest">Where we operate</p>
          <h2 id={`${id}-title`} className="text-3xl md:text-4xl font-black mt-2 text-forest">Our Presence Across India</h2>
          <p className="text-ink/80 mt-3">
            Cities where ZMR Mobility operates today and the cities planned for 2027. Select a marker or a city in the list for details.
          </p>
        </div>

        <PresenceMapInteractive points={points} viewBox={INDIA_MAP_VIEWBOX}>
          {/* State boundaries (static, server-rendered) */}
          <g>
            {INDIA_STATE_PATHS.map((s) => (
              <path
                key={s.name}
                d={s.d}
                className={presentStates.has(s.name) ? "fill-lime/50" : "fill-tint"}
                stroke="#2D473E"
                strokeOpacity={0.45}
                strokeWidth={0.6}
                strokeLinejoin="round"
              >
                <title>{s.name}</title>
              </path>
            ))}
          </g>
        </PresenceMapInteractive>

        <p className="mt-6 text-[11px] text-ink/60">
          Map: India state boundaries from{" "}
          <a href="https://github.com/datameet/maps" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">DataMeet India community</a>,{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">CC BY 4.0</a>{" "}
          (simplified for display). Markers show city locations, not service boundaries.
        </p>
      </div>
    </section>
  );
}
