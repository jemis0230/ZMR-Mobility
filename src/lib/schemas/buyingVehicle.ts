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

const dimFloat = z.string().optional().transform((v) => {
  if (!v || v.trim() === '') return 0;
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
});

const optStr = z.string().optional().transform((v) => v?.trim() || null);
const emptyStr = z.string().optional().transform((v) => v?.trim() ?? '');

// ── Buying vehicle schema ──────────────────────────────────────

export const BuyingVehicleFormSchema = z.object({
  // Basic
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  category: z.enum(VEHICLE_CATEGORIES, { message: 'Invalid category' }),
  range: reqInt,
  trueRange: optInt,
  topSpeed: reqInt,
  batteryCap: reqFloat,
  buyingPrice: reqFloat,
  warranty: z.string().min(1, 'Warranty is required'),

  // Dimensions
  kerbWeight: dimFloat,
  gvW: optFloat,
  width: dimFloat,
  height: dimFloat,
  length: dimFloat,
  groundClearance: dimFloat,
  wheelbase: dimFloat,

  // Drivetrain
  batteryType: emptyStr,
  peakVoltage: optInt,
  motorType: emptyStr,
  peakPower: emptyStr,
  peakTorque: emptyStr,
  transmission: z.string().optional().transform((v) => v?.trim() || 'Auto'),
  gradability: optFloat,

  // Charging
  chargingTime: emptyStr,
  fastChargingTime: optStr,
  chargerType: z.string().optional().transform((v) => v?.trim() || 'Normal Charging'),
  onBoardCharger: z.string().optional().transform((v) => v === 'true' || v === 'on'),

  // Cargo
  payload: optFloat,
  volume: optFloat,
  containerDims: optStr,

  // Descriptions
  overviewText: optStr,
  techSpecsText: optStr,
  performanceText: optStr,
  buyingInfoText: optStr,
});

export type BuyingVehicleFormData = z.infer<typeof BuyingVehicleFormSchema>;
