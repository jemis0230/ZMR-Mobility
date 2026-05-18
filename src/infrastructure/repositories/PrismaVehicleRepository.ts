import { IVehicleRepository, VehicleFilterParams, PaginatedResult } from "@/application/repositories/IVehicleRepository";
import { Vehicle, LeasePlan } from "@/domain/entities/Vehicle";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export class PrismaVehicleRepository implements IVehicleRepository {
  async findAll(): Promise<Vehicle[]> {
    const vehicles = await prisma.vehicle.findMany();
    return vehicles.map((v) => this.mapToEntity(v));
  }

  async findByCategory(category: string): Promise<Vehicle[]> {
    const vehicles = await prisma.vehicle.findMany({ where: { category } });
    return vehicles.map((v) => this.mapToEntity(v));
  }

  async findByCategoryWithFilters(category: string, filters: VehicleFilterParams): Promise<PaginatedResult<Vehicle>> {
    const { search, makes, chargerTypes, minRange, maxRange, minPayload, maxPayload, minVolume, maxVolume, page = 1, pageSize = 6 } = filters;
    const skip = (page - 1) * pageSize;

    const where: Prisma.VehicleWhereInput = { category };

    if (search) {
      where.OR = [
        { make: { contains: search } },
        { model: { contains: search } },
      ];
    }
    if (makes && makes.length > 0) where.make = { in: makes };
    if (chargerTypes && chargerTypes.length > 0) where.chargerType = { in: chargerTypes };

    if (minRange !== undefined || maxRange !== undefined) {
      where.range = {};
      if (minRange !== undefined) where.range.gte = minRange;
      if (maxRange !== undefined) where.range.lte = maxRange;
    }
    if (minPayload !== undefined || maxPayload !== undefined) {
      where.payload = {};
      if (minPayload !== undefined) where.payload.gte = minPayload;
      if (maxPayload !== undefined) where.payload.lte = maxPayload;
    }
    if (minVolume !== undefined || maxVolume !== undefined) {
      where.volume = {};
      if (minVolume !== undefined) where.volume.gte = minVolume;
      if (maxVolume !== undefined) where.volume.lte = maxVolume;
    }

    const [total, vehicles] = await Promise.all([
      prisma.vehicle.count({ where }),
      prisma.vehicle.findMany({ where, skip, take: pageSize }),
    ]);

    return {
      data: vehicles.map((v) => this.mapToEntity(v)),
      total,
      page,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async getFilterOptions(category: string): Promise<{ makes: string[]; chargerTypes: string[]; maxRange: number; maxPayload: number; maxVolume: number }> {
    const [makeGroups, chargerGroups, agg] = await Promise.all([
      prisma.vehicle.groupBy({ by: ['make'], where: { category } }),
      prisma.vehicle.groupBy({ by: ['chargerType'], where: { category } }),
      prisma.vehicle.aggregate({ _max: { range: true, payload: true, volume: true }, where: { category } }),
    ]);

    return {
      makes: makeGroups.map((g) => g.make).filter(Boolean),
      chargerTypes: chargerGroups.map((g) => g.chargerType).filter(Boolean),
      maxRange: agg._max.range ?? 500,
      maxPayload: agg._max.payload ?? 1000,
      maxVolume: agg._max.volume ?? 0,
    };
  }

  async findById(id: string): Promise<Vehicle | null> {
    const v = await prisma.vehicle.findUnique({ where: { id } });
    return v ? this.mapToEntity(v) : null;
  }

  async findLeasePlansByVehicleId(vehicleId: string): Promise<LeasePlan[]> {
    return prisma.leasePlan.findMany({ where: { vehicleId } });
  }

  async create(vehicle: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const v = await prisma.vehicle.create({
      data: {
        ...vehicle,
        sideImages: vehicle.sideImages.join(','),
      },
    });
    return this.mapToEntity(v);
  }

  async addLeasePlan(plan: Omit<LeasePlan, 'id'>): Promise<LeasePlan> {
    return prisma.leasePlan.create({ data: plan });
  }

  private mapToEntity(v: Prisma.VehicleGetPayload<Record<string, never>>): Vehicle {
    return {
      id: v.id,
      make: v.make,
      model: v.model,
      category: v.category as Vehicle['category'],
      range: v.range,
      trueRange: v.trueRange,
      topSpeed: v.topSpeed,
      batteryCap: v.batteryCap,
      mainImage: v.mainImage,
      sideImages: v.sideImages ? v.sideImages.split(',').filter(Boolean) : [],
      basePrice: v.basePrice,
      deposit: v.deposit,
      warranty: v.warranty,
      kerbWeight: v.kerbWeight,
      gvW: v.gvW,
      width: v.width,
      height: v.height,
      length: v.length,
      groundClearance: v.groundClearance,
      wheelbase: v.wheelbase,
      batteryType: v.batteryType,
      peakVoltage: v.peakVoltage,
      motorType: v.motorType,
      peakPower: v.peakPower,
      peakTorque: v.peakTorque,
      transmission: v.transmission,
      gradability: v.gradability,
      chargingTime: v.chargingTime,
      fastChargingTime: v.fastChargingTime,
      chargerType: v.chargerType,
      onBoardCharger: v.onBoardCharger,
      payload: v.payload,
      volume: v.volume,
      containerDims: v.containerDims,
      overviewText: v.overviewText,
      techSpecsText: v.techSpecsText,
      performanceText: v.performanceText,
      leasingInfoText: v.leasingInfoText,
    };
  }
}
