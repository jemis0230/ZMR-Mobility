import { PrismaVehicleRepository } from "@/infrastructure/repositories/PrismaVehicleRepository";
import { Vehicle } from "@/domain/entities/Vehicle";
import AdminVehiclesClient from "./AdminVehiclesClient";

const vehicleRepo = new PrismaVehicleRepository();

export default async function AdminVehiclesPage() {
  let vehicles: Vehicle[] = [];
  let dbError = false;

  try {
    vehicles = await vehicleRepo.findAll();
  } catch (error) {
    console.error("Admin Page Fetch Error:", error);
    dbError = true;
  }

  return (
    <AdminVehiclesClient 
      initialVehicles={vehicles as any} 
      dbError={dbError} 
    />
  );
}
