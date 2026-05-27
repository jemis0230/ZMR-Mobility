// ── Vehicle Category ───────────────────────────────────────────────────────────

export const VEHICLE_CATEGORIES = [
  'TWO_WHEELER',
  'THREE_WHEELER_CARGO',
  'THREE_WHEELER_PASSENGER',
  'FOUR_WHEELER_PASSENGER',
  'FOUR_WHEELER_CARGO',
] as const;

export type VehicleCategory = (typeof VEHICLE_CATEGORIES)[number];

export const CATEGORY_DISPLAY: Record<VehicleCategory, string> = {
  TWO_WHEELER:             '2 Wheeler',
  THREE_WHEELER_CARGO:     '3 Wheeler (Cargo)',
  THREE_WHEELER_PASSENGER: '3 Wheeler (Passenger)',
  FOUR_WHEELER_PASSENGER:  '4 Wheeler (Passenger)',
  FOUR_WHEELER_CARGO:      '4 Wheeler (Cargo)',
};

export const CATEGORY_TO_SLUG: Record<VehicleCategory, string> = {
  TWO_WHEELER:             '2-wheeler',
  THREE_WHEELER_CARGO:     '3-wheeler-cargo',
  THREE_WHEELER_PASSENGER: '3-wheeler-passenger',
  FOUR_WHEELER_PASSENGER:  '4-wheeler-passenger',
  FOUR_WHEELER_CARGO:      '4-wheeler-cargo',
};

export const SLUG_TO_CATEGORY: Record<string, VehicleCategory> = {
  '2-wheeler':             'TWO_WHEELER',
  '3-wheeler-cargo':       'THREE_WHEELER_CARGO',
  '3-wheeler-passenger':   'THREE_WHEELER_PASSENGER',
  '4-wheeler-passenger':   'FOUR_WHEELER_PASSENGER',
  '4-wheeler-cargo':       'FOUR_WHEELER_CARGO',
};

// backward-compat alias
export const CATEGORY_SLUG_MAP = SLUG_TO_CATEGORY;

export function isCargo(cat: VehicleCategory): boolean {
  return cat === 'THREE_WHEELER_CARGO' || cat === 'FOUR_WHEELER_CARGO';
}
export function is3Wheeler(cat: VehicleCategory): boolean {
  return cat === 'THREE_WHEELER_CARGO' || cat === 'THREE_WHEELER_PASSENGER';
}
export function is4Wheeler(cat: VehicleCategory): boolean {
  return cat === 'FOUR_WHEELER_PASSENGER' || cat === 'FOUR_WHEELER_CARGO';
}

// ── Charger Type ───────────────────────────────────────────────────────────────

export const CHARGER_TYPES = ['NORMAL', 'FAST', 'BOTH'] as const;
export type ChargerType = (typeof CHARGER_TYPES)[number];

export const CHARGER_TYPE_DISPLAY: Record<ChargerType, string> = {
  NORMAL: 'Normal Charging',
  FAST:   'Fast Charging',
  BOTH:   'Normal + Fast Charging',
};

// ── Transmission ──────────────────────────────────────────────────────────────

export const TRANSMISSION_TYPES = ['AUTO', 'MANUAL', 'SEMI_AUTO'] as const;
export type TransmissionType = (typeof TRANSMISSION_TYPES)[number];

export const TRANSMISSION_DISPLAY: Record<TransmissionType, string> = {
  AUTO:      'Automatic',
  MANUAL:    'Manual',
  SEMI_AUTO: 'Semi-Automatic',
};

// ── Lead / Inquiry ─────────────────────────────────────────────────────────────

export const INQUIRY_TYPES = [
  'VEHICLE_LEASING',
  'VEHICLE_RENTING',
  'VEHICLE_PURCHASE',
  'CORPORATE_ENTERPRISE',
  'FLEET_LOGISTICS',
  'DEALERSHIP_FRANCHISE',
  'B2B_PARTNERSHIP',
  'OTHER',
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number];

export const INQUIRY_TYPE_DISPLAY: Record<InquiryType, string> = {
  VEHICLE_LEASING:      'Vehicle Leasing',
  VEHICLE_RENTING:      'Vehicle Renting',
  VEHICLE_PURCHASE:     'Vehicle Purchase',
  CORPORATE_ENTERPRISE: 'Corporate / Enterprise',
  FLEET_LOGISTICS:      'Fleet / Logistics / Ride Hailing',
  DEALERSHIP_FRANCHISE: 'Dealership / Franchise',
  B2B_PARTNERSHIP:      'B2B Partnership',
  OTHER:                'Other',
};

export const LEAD_STATUSES = ['PENDING', 'CONTACTED', 'QUALIFIED', 'CLOSED_WON', 'CLOSED_LOST'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

// ── Sell ───────────────────────────────────────────────────────────────────────

export const SELL_STATUSES = ['NEW', 'REVIEWING', 'VALUED', 'ACCEPTED', 'REJECTED'] as const;
export type SellStatus = (typeof SELL_STATUSES)[number];

// ── Legacy aliases ─────────────────────────────────────────────────────────────

/** @deprecated use INQUIRY_TYPES */
export const INQUIRY_CATEGORIES = INQUIRY_TYPES;
/** @deprecated use InquiryType */
export type InquiryCategory = InquiryType;
