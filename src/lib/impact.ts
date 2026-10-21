// Fuel-saving ("petrol avoided") figure: formula, inputs and display formatting.
//
// Formula, summed per vehicle class so a scooter assumption is never applied to the
// whole fleet:
//
//   petrol avoided (litres) = Σ  eligible electric km of the class
//                                ÷ km per litre of a comparable petrol vehicle of that class
//
// 1 lakh litres = 100,000 litres (so "1.98 lakh L" is 198,000 litres).
//
// No verified inputs exist yet. The previously published "198 Lakh L" (19.8 million
// litres) was a hardcoded number with no recorded source. Next to the also-hardcoded
// "176 Lakh Km" it implies under 1 km per litre, which is not possible for a petrol
// vehicle. So FUEL_SAVINGS_INPUT stays null and the site shows no number until the
// team supplies the data listed in docs/IMPACT_METRICS.md.
//
// This file has no imports so its tests run directly with `node --test`.

export const LITRES_PER_LAKH = 100_000;

export type FleetSegment = {
  /** e.g. "Electric scooter (2W)" */
  vehicleClass: string;
  /** Electric kilometres in the reporting period for this class (from telematics/odometer records). */
  electricKm: number;
  /** Fuel efficiency of the comparable petrol vehicle for this class, in km per litre. */
  petrolKmPerLitre: number;
};

export type FuelSavingsInput = {
  segments: FleetSegment[];
  /** ISO dates of the reporting period. */
  periodFrom: string;
  periodTo: string;
  /** Which vehicles are counted, e.g. "ZMR-managed EVs in Lucknow, Dehradun, Chennai and Bangalore". */
  scope: string;
  /** Where the kilometres and efficiency values come from. */
  source: string;
  /** Who approved publishing the figure. */
  approvedBy: string;
};

/** Verified inputs for the public figure. null = not available, so nothing numeric is shown. */
export const FUEL_SAVINGS_INPUT: FuelSavingsInput | null = null;

/** Litres of petrol avoided, summed per vehicle class. Throws on missing or invalid inputs. */
export function estimatePetrolAvoidedLitres(segments: FleetSegment[]): number {
  if (!Array.isArray(segments) || segments.length === 0) throw new Error('At least one vehicle class is required.');
  let litres = 0;
  for (const s of segments) {
    if (!s || !s.vehicleClass) throw new Error('Each segment needs a vehicle class.');
    if (!Number.isFinite(s.electricKm) || s.electricKm < 0) throw new Error(`Invalid kilometres for ${s.vehicleClass}.`);
    if (!Number.isFinite(s.petrolKmPerLitre) || s.petrolKmPerLitre <= 0) throw new Error(`Invalid km/litre for ${s.vehicleClass}.`);
    litres += s.electricKm / s.petrolKmPerLitre;
  }
  return litres;
}

/**
 * Display format: below 1 lakh as Indian-grouped litres ("98,765 L"); from 1 lakh as
 * lakh litres with up to two decimals ("1.98 lakh L"). Input is always litres, so the
 * lakh conversion happens exactly once.
 */
export function formatLitres(litres: number): string {
  if (!Number.isFinite(litres) || litres < 0) throw new Error('Litres must be a non-negative number.');
  if (litres < LITRES_PER_LAKH) return `${Math.round(litres).toLocaleString('en-IN')} L`;
  const lakh = Math.round((litres / LITRES_PER_LAKH) * 100) / 100;
  return `${lakh.toFixed(2).replace(/\.?0+$/, '')} lakh L`;
}

export type PublicFuelSavings =
  | { available: true; litres: number; display: string; label: string; note: string }
  | { available: false; label: string; note: string };

/** What the website shows for fuel savings. */
export function publicFuelSavings(input: FuelSavingsInput | null = FUEL_SAVINGS_INPUT): PublicFuelSavings {
  if (!input) {
    return {
      available: false,
      label: 'Estimated petrol avoided',
      note: 'Figure being verified — every kilometre on a ZMR electric vehicle replaces petrol.',
    };
  }
  const litres = estimatePetrolAvoidedLitres(input.segments);
  return {
    available: true,
    litres,
    display: formatLitres(litres),
    label: 'Estimated petrol avoided',
    note: `Internal estimate for ${input.scope}, ${input.periodFrom} to ${input.periodTo}: electric km ÷ km per litre of a comparable petrol vehicle, per vehicle class.`,
  };
}
