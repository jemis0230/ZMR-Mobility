import { Vehicle, LeasePlan, RentPlan, type TwoWheelerStyle } from "../../domain/entities/Vehicle";
import { VehicleCategory, ChargerType } from "@/lib/constants";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface VehicleFilterParams {
  makes?: string[];
  chargerType?: ChargerType;        // single select
  minRange?: number;
  maxRange?: number;
  minRealWorldRange?: number;
  maxRealWorldRange?: number;
  minSpeed?: number;
  maxSpeed?: number;
  minPayload?: number;
  maxPayload?: number;
  minVolume?: number;
  maxVolume?: number;
  sortBy?: 'price_asc' | 'price_desc';
  page?: number;
  pageSize?: number;
}

export interface FilterOptions {
  makes: string[];
  chargerTypes: ChargerType[];
  maxRange: number;
  maxRealWorldRange: number;
  maxSpeed: number;
  maxPayload: number;
  maxVolume: number;
}

export interface ExploreFilterParams {
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  makes?: string[];
  model?: string;
  minYear?: number;
  maxKm?: number;
  categories?: VehicleCategory[];
  /** Two-wheeler body styles; unset two-wheelers count as scooters. */
  bodyStyles?: TwoWheelerStyle[];
  minRange?: number;
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'year_desc' | 'km_asc';
  page?: number;
  pageSize?: number;
}

export interface ExploreMenuData {
  makes: { make: string; models: string[]; count: number }[];
  /** Buying prices (₹) of listed vehicles at or below the selling-price cap. */
  prices: number[];
  /** Listed vehicles with no buying price. */
  unpricedCount: number;
  /** Listed vehicles priced above the cap — flagged for review. */
  overCapCount: number;
}

export interface IVehicleRepository {
  findAll(): Promise<Vehicle[]>;
  findByCategory(category: VehicleCategory): Promise<Vehicle[]>;

  // Leasing
  findByCategoryWithFilters(category: VehicleCategory, filters: VehicleFilterParams): Promise<PaginatedResult<Vehicle>>;
  getFilterOptions(category: VehicleCategory): Promise<FilterOptions>;

  // Buying
  findByCategoryForBuying(category: VehicleCategory, filters: VehicleFilterParams): Promise<PaginatedResult<Vehicle>>;
  getFilterOptionsForBuying(category: VehicleCategory): Promise<FilterOptions>;

  // Rent
  findByCategoryForRent(category: VehicleCategory, filters: VehicleFilterParams): Promise<PaginatedResult<Vehicle>>;
  getFilterOptionsForRent(category: VehicleCategory): Promise<FilterOptions>;

  // Explore (cross-category buying catalogue)
  findForExplore(filters: ExploreFilterParams): Promise<PaginatedResult<Vehicle>>;
  getExploreMenuData(): Promise<ExploreMenuData>;
  findByIds(ids: string[]): Promise<Vehicle[]>;

  findById(id: string): Promise<Vehicle | null>;

  // LeasePlan CRUD
  findLeasePlansByVehicleId(vehicleId: string): Promise<LeasePlan[]>;
  addLeasePlan(plan: Omit<LeasePlan, 'id'>): Promise<LeasePlan>;
  updateLeasePlan(id: string, data: Partial<Omit<LeasePlan, 'id' | 'vehicleId'>>): Promise<LeasePlan>;
  deleteLeasePlan(id: string): Promise<void>;

  // RentPlan CRUD
  findRentPlansByVehicleId(vehicleId: string): Promise<RentPlan[]>;
  addRentPlan(plan: Omit<RentPlan, 'id'>): Promise<RentPlan>;
  updateRentPlan(id: string, data: Partial<Omit<RentPlan, 'id' | 'vehicleId'>>): Promise<RentPlan>;
  deleteRentPlan(id: string): Promise<void>;

  create(data: VehicleCreateInput): Promise<Vehicle>;
  update(id: string, data: VehicleUpdateInput): Promise<Vehicle>;
  delete(id: string): Promise<void>;
}

export interface VehicleCreateInput {
  make: string;
  model: string;
  category: VehicleCategory;
  twoWheelerStyle?: TwoWheelerStyle | null;
  warranty: string;
  mainImage: string;
  imageUrls: string[];

  showInLeasing: boolean;
  showInBuying: boolean;
  showInRent: boolean;

  buyingPrice?: number | null;
  manufactureYear?: number | null;
  kmDriven?: number | null;

  certifiedRangeKm: number;
  realWorldRangeKm?: number | null;
  topSpeedKmh: number;

  batteryCapKwh: number;
  batteryTypeId?: string | null;
  peakVoltageV?: number | null;
  motorTypeId?: string | null;
  peakPowerKw?: number | null;
  peakTorqueNm?: number | null;
  transmission: string;
  gradabilityPct?: number | null;

  chargingTimeMinutes: number;
  chargerType: string;
  hasOnBoardCharger: boolean;

  curbWeightKg: number;
  grossWeightKg?: number | null;
  widthMm: number;
  heightMm: number;
  lengthMm: number;
  groundClearanceMm: number;
  wheelbaseMm: number;

  payloadKg?: number | null;
  cargoVolumeL?: number | null;
  containerDimensions?: string | null;

  overview?: string | null;
  techSpecs?: string | null;
  performance?: string | null;
  leasingInfo?: string | null;
  buyingInfo?: string | null;
  rentalInfo?: string | null;
}

export type VehicleUpdateInput = Partial<VehicleCreateInput>;
