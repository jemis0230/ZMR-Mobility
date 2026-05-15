// ─────────────────────────────────────────────────────────────────────────────
// Vehicle Categories
// ─────────────────────────────────────────────────────────────────────────────

export const VEHICLE_CATEGORIES = [
  '2 Wheeler',
  '3 Wheeler (Cargo)',
  '3 Wheeler (Passenger)',
  '4 Wheeler (Passenger)',
  '4 Wheeler (Cargo)',
] as const;

export type VehicleCategory = (typeof VEHICLE_CATEGORIES)[number];

/** URL slug → display name */
export const CATEGORY_SLUG_MAP: Record<string, VehicleCategory> = {
  '2-wheeler':            '2 Wheeler',
  '3-wheeler-cargo':      '3 Wheeler (Cargo)',
  '3-wheeler-passenger':  '3 Wheeler (Passenger)',
  '4-wheeler-passenger':  '4 Wheeler (Passenger)',
  '4-wheeler-cargo':      '4 Wheeler (Cargo)',
};

/** Display name → URL slug */
export const CATEGORY_TO_SLUG: Record<VehicleCategory, string> = {
  '2 Wheeler':              '2-wheeler',
  '3 Wheeler (Cargo)':      '3-wheeler-cargo',
  '3 Wheeler (Passenger)':  '3-wheeler-passenger',
  '4 Wheeler (Passenger)':  '4-wheeler-passenger',
  '4 Wheeler (Cargo)':      '4-wheeler-cargo',
};

// ─────────────────────────────────────────────────────────────────────────────
// Lead statuses
// ─────────────────────────────────────────────────────────────────────────────

export const LEAD_STATUSES = ['PENDING', 'CONTACTED', 'CLOSED'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

// ─────────────────────────────────────────────────────────────────────────────
// Sell application statuses
// ─────────────────────────────────────────────────────────────────────────────

export const SELL_STATUSES = ['NEW', 'REVIEWING', 'VALUED', 'CLOSED'] as const;
export type SellStatus = (typeof SELL_STATUSES)[number];

// ─────────────────────────────────────────────────────────────────────────────
// Lead inquiry categories
// ─────────────────────────────────────────────────────────────────────────────

export const INQUIRY_CATEGORIES = [
  'Vehicle Leasing',
  'Vehicle Purchase',
  'Corporate / Enterprise Requirement',
  'Fleet / Logistics / Ride Hailing',
  'Dealership / Franchise Inquiry',
  'B2B Partnership',
  'Other',
] as const;

export type InquiryCategory = (typeof INQUIRY_CATEGORIES)[number];
