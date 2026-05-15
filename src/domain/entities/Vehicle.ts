import { VehicleCategory } from '@/lib/constants';

export type { VehicleCategory };

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: VehicleCategory;
  range: number;
  trueRange?: number | null;
  topSpeed: number;
  batteryCap: number;
  mainImage: string;
  sideImages: string[];
  basePrice: number;
  deposit: number;
  warranty: string;

  // Dimensions
  kerbWeight: number;
  gvW?: number | null;
  width: number;
  height: number;
  length: number;
  groundClearance: number;
  wheelbase: number;

  // Drivetrain
  batteryType: string;
  peakVoltage?: number | null;
  motorType: string;
  peakPower: string;
  peakTorque: string;
  transmission: string;
  gradability?: number | null;

  // Charging
  chargingTime: string;
  fastChargingTime?: string | null;
  chargerType: string;
  onBoardCharger: boolean;

  // Cargo
  payload?: number | null;
  volume?: number | null;
  containerDims?: string | null;

  // Detailed descriptions
  overviewText?: string | null;
  techSpecsText?: string | null;
  performanceText?: string | null;
  leasingInfoText?: string | null;
}

export interface LeasePlan {
  id: string;
  vehicleId: string;
  tenure: number;
  monthlyPrice: number;
  deposit: number;
  isActive: boolean;
}
