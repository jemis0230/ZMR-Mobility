import { BuyingVehicle } from "../../domain/entities/BuyingVehicle";
import { VehicleFilterParams, PaginatedResult } from "./IVehicleRepository";

export interface IBuyingVehicleRepository {
  findAll(): Promise<BuyingVehicle[]>;
  findByCategory(category: string): Promise<BuyingVehicle[]>;
  findByCategoryWithFilters(category: string, filters: VehicleFilterParams): Promise<PaginatedResult<BuyingVehicle>>;
  getFilterOptions(category: string): Promise<{ makes: string[]; chargerTypes: string[]; maxRange: number; maxPayload: number; maxVolume: number }>;
  findById(id: string): Promise<BuyingVehicle | null>;
  create(vehicle: Omit<BuyingVehicle, 'id'>): Promise<BuyingVehicle>;
  update(id: string, data: Partial<Omit<BuyingVehicle, 'id'>>): Promise<BuyingVehicle>;
  delete(id: string): Promise<void>;
}
