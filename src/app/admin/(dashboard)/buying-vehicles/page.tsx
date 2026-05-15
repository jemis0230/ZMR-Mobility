import { PrismaBuyingVehicleRepository } from "@/infrastructure/repositories/PrismaBuyingVehicleRepository";
import { BuyingVehicle } from "@/domain/entities/BuyingVehicle";
import AdminBuyingVehiclesClient from "./AdminBuyingVehiclesClient";

const buyingVehicleRepo = new PrismaBuyingVehicleRepository();

export default async function AdminBuyingVehiclesPage() {
  let vehicles: BuyingVehicle[] = [];
  let dbError = false;

  try {
    vehicles = await buyingVehicleRepo.findAll();
  } catch (error) {
    console.error("Admin Buying Vehicles Page Fetch Error:", error);
    dbError = true;
  }

  return (
    <AdminBuyingVehiclesClient
      initialVehicles={vehicles}
      dbError={dbError}
    />
  );
}
