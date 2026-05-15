import { Vehicle, LeasePlan } from "../../domain/entities/Vehicle";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface VehicleFilterParams {
  search?: string;
  makes?: string[];
  chargerTypes?: string[];
  minRange?: number;
  maxRange?: number;
  minPayload?: number;
  maxPayload?: number;
  minVolume?: number;
  maxVolume?: number;
  page?: number;
  pageSize?: number;
}

export interface IVehicleRepository {
  findAll(): Promise<Vehicle[]>;
  findByCategory(category: string): Promise<Vehicle[]>;
  findByCategoryWithFilters(category: string, filters: VehicleFilterParams): Promise<PaginatedResult<Vehicle>>;
  getFilterOptions(category: string): Promise<{ makes: string[], chargerTypes: string[], maxRange: number, maxPayload: number, maxVolume: number }>;
  findById(id: string): Promise<Vehicle | null>;
  findLeasePlansByVehicleId(vehicleId: string): Promise<LeasePlan[]>;
  create(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle>;
  addLeasePlan(plan: Omit<LeasePlan, 'id'>): Promise<LeasePlan>;
}
