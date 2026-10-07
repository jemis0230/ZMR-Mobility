// Brands customers can pick in the Make & Model menus (navbar, mobile menu, home page,
// /explore and the buying category pages). Listings from other brands stay in the
// database and still appear in unfiltered results; they just aren't offered as choices.
export const ALLOWED_BRANDS = ['Ather', 'Bajaj', 'Hero', 'BGauss', 'TVS'] as const;
export type AllowedBrand = (typeof ALLOWED_BRANDS)[number];

/** "B-Gauss", "bgauss", "BGAUSS " → "bgauss". */
export function brandKey(make: string): string {
  return make.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Spellings of each brand's company name that admins may have entered.
const BRAND_ALIASES: Record<string, AllowedBrand> = {
  ather: 'Ather',
  atherenergy: 'Ather',
  bajaj: 'Bajaj',
  bajajauto: 'Bajaj',
  hero: 'Hero',
  heromotocorp: 'Hero',
  heroelectric: 'Hero',
  bgauss: 'BGauss',
  tvs: 'TVS',
  tvsmotor: 'TVS',
  tvsmotors: 'TVS',
  tvsmotorcompany: 'TVS',
};

/** The allowed brand a stored or requested make belongs to, if any. */
export function canonicalBrand(make: string | null | undefined): AllowedBrand | undefined {
  if (!make) return undefined;
  return BRAND_ALIASES[brandKey(make)];
}

/** Stored make values (any spelling) that belong to the given allowed brands. */
export function rawMakesForBrands(brands: readonly string[], storedMakes: readonly string[]): string[] {
  const wanted = new Set(brands.map((b) => canonicalBrand(b)).filter(Boolean));
  return storedMakes.filter((m) => wanted.has(canonicalBrand(m)));
}
