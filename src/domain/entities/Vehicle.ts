import { VehicleCategory, ChargerType, TransmissionType } from '@/lib/constants';

export type { VehicleCategory, ChargerType, TransmissionType };

export interface BatteryType {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
}

export interface MotorType {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
}

export interface VehicleImage {
  id: string;
  vehicleId: string;
  url: string;
  sortOrder: number;
}

export interface LeasePlan {
  id: string;
  vehicleId: string;
  tenureMonths: number;
  monthlyPriceRs: number;
  depositRs: number;
  isActive: boolean;
}

export interface RentPlan {
  id: string;
  vehicleId: string;
  durationDays: number;
  pricePerDayRs: number;
  depositRs: number;
  isActive: boolean;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: VehicleCategory;
  warranty: string;
  mainImage: string;

  // Visibility flags
  showInLeasing: boolean;
  showInBuying: boolean;
  showInRent: boolean;

  // Buying pricing (flat; leasing & rent pricing live in plan tables)
  buyingPrice?: number | null;

  // Pre-owned details
  manufactureYear?: number | null;
  kmDriven?: number | null;

  // Performance
  certifiedRangeKm: number;
  realWorldRangeKm?: number | null;
  topSpeedKmh: number;

  // Battery & Drivetrain
  batteryCapKwh: number;
  batteryTypeId: string | null;
  batteryType: { id: string; name: string } | null;
  peakVoltageV?: number | null;
  motorTypeId: string | null;
  motorType: { id: string; name: string } | null;
  peakPowerKw: number | null;
  peakTorqueNm: number | null;
  transmission: TransmissionType;
  gradabilityPct?: number | null;

  // Charging (stored as total minutes, e.g. 90 = 1h 30m)
  chargingTimeMinutes: number;
  chargerType: ChargerType;
  hasOnBoardCharger: boolean;

  // Dimensions
  curbWeightKg: number;
  grossWeightKg?: number | null;
  widthMm: number;
  heightMm: number;
  lengthMm: number;
  groundClearanceMm: number;
  wheelbaseMm: number;

  // Cargo-specific
  payloadKg?: number | null;
  cargoVolumeL?: number | null;
  containerDimensions?: string | null;

  // Rich-text descriptions
  overview?: string | null;
  techSpecs?: string | null;
  performance?: string | null;
  leasingInfo?: string | null;
  buyingInfo?: string | null;
  rentalInfo?: string | null;

  // Relations
  images: VehicleImage[];
  leasePlans: LeasePlan[];
  rentPlans: RentPlan[];
}
