import { INDIA_MAP_PROJECTION } from "@/lib/indiaMapData";

export type PresenceStatus = "current" | "planned";

export interface PresenceLocation {
  city: string;
  state: string;
  status: PresenceStatus;
  /** City-centre coordinates (WGS84). */
  lat: number;
  lon: number;
  /** Only when the company has confirmed it. */
  launchYear?: number;
  /** Where this entry comes from, so it can be re-checked. */
  source: string;
}

const ABOUT_PLAN = "ZMR expansion plan published on the About page";

/**
 * ZMR locations shown on the "Our Presence Across India" map.
 * Only add a city once ZMR has confirmed it. Entries currently mirror the expansion
 * plan already published on the About page (2025 "Completed" → current presence;
 * 2027 "Next Phase" → planned). The 2026 "Current" phase and the 2027 entry "Kashmir"
 * (a region, not a city) are not shown until their status/city is confirmed.
 */
export const PRESENCE_LOCATIONS: PresenceLocation[] = [
  { city: "Lucknow", state: "Uttar Pradesh", status: "current", lat: 26.8467, lon: 80.9462, source: ABOUT_PLAN },
  { city: "Delhi NCR", state: "Delhi", status: "current", lat: 28.6139, lon: 77.209, source: ABOUT_PLAN },
  { city: "Dehradun", state: "Uttarakhand", status: "current", lat: 30.3165, lon: 78.0322, source: ABOUT_PLAN },
  { city: "Chennai", state: "Tamil Nadu", status: "current", lat: 13.0827, lon: 80.2707, source: ABOUT_PLAN },
  { city: "Bengaluru", state: "Karnataka", status: "current", lat: 12.9716, lon: 77.5946, source: ABOUT_PLAN },
  { city: "Kochi", state: "Kerala", status: "planned", launchYear: 2027, lat: 9.9312, lon: 76.2673, source: ABOUT_PLAN },
  { city: "Meerut", state: "Uttar Pradesh", status: "planned", launchYear: 2027, lat: 28.9845, lon: 77.7064, source: ABOUT_PLAN },
  { city: "Mysuru", state: "Karnataka", status: "planned", launchYear: 2027, lat: 12.2958, lon: 76.6394, source: ABOUT_PLAN },
  { city: "Chandigarh", state: "Chandigarh", status: "planned", launchYear: 2027, lat: 30.7333, lon: 76.7794, source: ABOUT_PLAN },
];

export const PRESENCE_STATUS_LABEL: Record<PresenceStatus, string> = {
  current: "Current presence",
  planned: "Planned for 2027",
};

/** Same projection the map paths were generated with (scripts/build-india-map.py). */
export function projectToMap(lat: number, lon: number): { x: number; y: number } {
  const p = INDIA_MAP_PROJECTION;
  return { x: (lon - p.minLon) * p.kx * p.scale + p.pad, y: (p.maxLat - lat) * p.scale + p.pad };
}
