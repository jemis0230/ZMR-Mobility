import { z } from 'zod';
import { VEHICLE_CATEGORIES } from '@/lib/constants';

// ── Helpers for FormData string → number coercion ─────────────

const reqFloat = z.string().min(1).transform((v) => {
  const n = parseFloat(v);
  if (isNaN(n)) throw new Error('Must be a valid number');
  return n;
});

const reqInt = z.string().min(1).transform((v) => {
  const n = parseInt(v, 10);
  if (isNaN(n)) throw new Error('Must be a valid integer');
  return n;
});

const optFloat = z.string().optional().transform((v) => {
  if (!v || v.trim() === '') return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
});

const optInt = z.string().optional().transform((v) => {
  if (!v || v.trim() === '') return null;
  const n = parseInt(v, 10);
  return isNaN(n) ? null : n;
});

// Defaults to 0 when empty / NaN
const dimFloat = z.string().optional().transform((v) => {
  if (!v || v.trim() === '') return 0;
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
});

// Nullable optional string — for fields that are nullable in the DB
const optStr = z.string().optional().transform((v) => v?.trim() || null);

// Non-nullable optional string — for fields that default to "" in the DB
const emptyStr = z.string().optional().transform((v) => v?.trim() ?? '');

// ── Core vehicle schema (parses raw FormData string values) ────

export const VehicleFormSchema = z.object({
  // Basic
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  category: z.enum(VEHICLE_CATEGORIES, { message: 'Invalid category' }),
  range: reqInt,
  trueRange: optInt,
  topSpeed: reqInt,
  batteryCap: reqFloat,
  basePrice: reqFloat,
  deposit: reqFloat,
  warranty: z.string().min(1, 'Warranty is required'),

  // Dimensions
  kerbWeight: dimFloat,
  gvW: optFloat,
  width: dimFloat,
  height: dimFloat,
  length: dimFloat,
  groundClearance: dimFloat,
  wheelbase: dimFloat,

  // Drivetrain — non-nullable string fields
  batteryType: emptyStr,
  peakVoltage: optInt,
  motorType: emptyStr,
  peakPower: emptyStr,
  peakTorque: emptyStr,
  transmission: z.string().optional().transform((v) => v?.trim() || 'Auto'),
  gradability: optFloat,

  // Charging — non-nullable string fields
  chargingTime: emptyStr,
  fastChargingTime: optStr,
  chargerType: z.string().optional().transform((v) => v?.trim() || 'Normal Charging'),
  onBoardCharger: z.string().optional().transform((v) => v === 'true' || v === 'on'),

  // Cargo — nullable
  payload: optFloat,
  volume: optFloat,
  containerDims: optStr,

  // Descriptions — nullable
  overviewText: optStr,
  techSpecsText: optStr,
  performanceText: optStr,
  leasingInfoText: optStr,
});

export type VehicleFormData = z.infer<typeof VehicleFormSchema>;

// ── Lease plan schema ──────────────────────────────────────────

export const LeasePlanFormSchema = z.object({
  tenure: reqInt,
  monthlyPrice: reqFloat,
  deposit: reqFloat,
});

export type LeasePlanFormData = z.infer<typeof LeasePlanFormSchema>;
