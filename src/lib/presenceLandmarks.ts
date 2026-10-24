// Landmark photographs for the "Our Presence" city cards (shown faintly behind the
// city name on hover, keyboard focus and when a city is selected).
//
// Add a city only with a photo ZMR may use: the file goes in public/landmarks/
// (optimised, about 800 px wide, WebP or JPEG) and the entry records where it came
// from and under which licence, so the credit line under the section is accurate.
// Never point `src` at another website (no hotlinking). Cities without an entry
// still get the hover/selected styling, just without a photo.

export type Landmark = {
  /** Landmark name, used in the alt text and credit, e.g. "India Gate". */
  name: string;
  /** Local path under /public, e.g. "/landmarks/delhi-india-gate.webp". */
  src: string;
  /** Photographer / author as required by the licence. */
  credit: string;
  /** e.g. "CC BY-SA 4.0" or "Public domain". */
  license: string;
  /** Page the photo was taken from (licence evidence). */
  sourceUrl: string;
};

/** Keyed by the city name used in src/lib/presence.ts. */
export const PRESENCE_LANDMARKS: Partial<Record<string, Landmark>> = {
  // Intended landmarks, to be added once a licensed photo is available:
  // Lucknow — Rumi Darwaza · Delhi NCR — India Gate · Dehradun — Forest Research
  // Institute · Chennai — Kapaleeshwarar Temple · Bengaluru — Vidhana Soudha ·
  // Kochi — Chinese fishing nets · Meerut — Shaheed Smarak · Mysuru — Mysore Palace ·
  // Chandigarh — Open Hand Monument.
};
