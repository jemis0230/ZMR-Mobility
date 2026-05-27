import { z } from 'zod';
import { VEHICLE_CATEGORIES, CHARGER_TYPES, TRANSMISSION_TYPES } from '@/lib/constants';

// ── Helpers for FormData string → number coercion ─────────────

const reqFloat = z
  .string()
  .min(1, 'This field is required')
  .refine((v) => !isNaN(parseFloat(v)), { message: 'Must be a valid number' })
  .transform((v) => parseFloat(v));

const reqInt = z
  .string()
  .min(1, 'This field is required')
  .refine((v) => Number.isInteger(Number(v)), { message: 'Must be a whole number' })
  .transform((v) => parseInt(v, 10));

const optFloat = z
  .string()
  .optional()
  .transform((v) => {
    if (!v || v.trim() === '') return null;
    const n = parseFloat(v);
    return isNaN(n) ? null : n;
  });

const optInt = z
  .string()
  .optional()
  .transform((v) => {
    if (!v || v.trim() === '') return null;
    const n = parseInt(v, 10);
    return isNaN(n) ? null : n;
  });

// Defaults to 0 when empty / NaN (for required-but-zero-allowed dimension fields)
const dimFloat = z
  .string()
  .optional()
  .transform((v) => {
    if (!v || v.trim() === '') return 0;
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  });

// Nullable optional string
const optStr = z.string().optional().transform((v) => v?.trim() || null);

// Non-nullable optional string — defaults to ""
const emptyStr = z.string().optional().transform((v) => v?.trim() ?? '');

// Optional FK id — empty string or absent → null
const optId = z.string().optional().transform((v) => v?.trim() || null);

// Checkbox boolean — FormData sends "on" when checked, absent when unchecked
const checkboxBool = z.string().optional().transform((v) => v === 'on' || v === 'true');

// ── Core vehicle schema ────────────────────────────────────────

export const VehicleFormSchema = z.object({
  // Basic
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  category: z.enum(VEHICLE_CATEGORIES, { message: 'Invalid category' }),
  warranty: emptyStr,

  // Visibility flags
  showInLeasing: checkboxBool,
  showInBuying: checkboxBool,
  showInRent: checkboxBool,

  // Buying pricing (flat price)
  buyingPrice: optFloat,

  // Performance
  certifiedRangeKm: reqInt,
  realWorldRangeKm: optInt,
  topSpeedKmh: reqInt,

  // Battery & Drivetrain
  batteryCapKwh: reqFloat,
  batteryTypeId: optId,
  peakVoltageV: optInt,
  motorTypeId: optId,
  peakPowerKw: optFloat,
  peakTorqueNm: optFloat,
  transmission: z
    .enum(TRANSMISSION_TYPES, { message: 'Invalid transmission type' })
    .optional()
    .transform((v) => v ?? 'AUTO'),
  gradabilityPct: optFloat,

  // Charging (submitted as total minutes from the time-picker UI)
  chargingTimeMinutes: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v.trim() === '') return 0;
      const n = parseInt(v, 10);
      return isNaN(n) ? 0 : n;
    }),
  chargerType: z
    .enum(CHARGER_TYPES, { message: 'Invalid charger type' })
    .optional()
    .transform((v) => v ?? 'NORMAL'),
  hasOnBoardCharger: checkboxBool,

  // Dimensions
  curbWeightKg: dimFloat,
  grossWeightKg: optFloat,
  widthMm: dimFloat,
  heightMm: dimFloat,
  lengthMm: dimFloat,
  groundClearanceMm: dimFloat,
  wheelbaseMm: dimFloat,

  // Cargo — nullable
  payloadKg: optFloat,
  cargoVolumeL: optFloat,
  containerDimensions: optStr,

  // Rich-text descriptions — nullable
  overview: optStr,
  techSpecs: optStr,
  performance: optStr,
  leasingInfo: optStr,
  buyingInfo: optStr,
  rentalInfo: optStr,
});

export type VehicleFormData = z.infer<typeof VehicleFormSchema>;

// ── LeasePlan schema ───────────────────────────────────────────

export const LeasePlanFormSchema = z.object({
  tenureMonths: reqInt,
  monthlyPriceRs: reqFloat,
  depositRs: reqFloat,
  isActive: checkboxBool,
});

export type LeasePlanFormData = z.infer<typeof LeasePlanFormSchema>;

// ── RentPlan schema ────────────────────────────────────────────

export const RentPlanFormSchema = z.object({
  durationDays: reqInt,
  pricePerDayRs: reqFloat,
  depositRs: reqFloat,
  isActive: checkboxBool,
});

export type RentPlanFormData = z.infer<typeof RentPlanFormSchema>;
