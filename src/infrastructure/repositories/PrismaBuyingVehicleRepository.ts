import { IBuyingVehicleRepository } from "@/application/repositories/IBuyingVehicleRepository";
import { VehicleFilterParams, PaginatedResult } from "@/application/repositories/IVehicleRepository";
import { BuyingVehicle } from "@/domain/entities/BuyingVehicle";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/prisma";

export class PrismaBuyingVehicleRepository implements IBuyingVehicleRepository {
  async findAll(): Promise<BuyingVehicle[]> {
    const vehicles = await prisma.buyingVehicle.findMany();
    return vehicles.map((v) => this.mapToEntity(v));
  }

  async findByCategory(category: string): Promise<BuyingVehicle[]> {
    const vehicles = await prisma.buyingVehicle.findMany({ where: { category } });
    return vehicles.map((v) => this.mapToEntity(v));
  }

  async findByCategoryWithFilters(category: string, filters: VehicleFilterParams): Promise<PaginatedResult<BuyingVehicle>> {
    const { search, makes, chargerTypes, minRange, maxRange, minPayload, maxPayload, minVolume, maxVolume, page = 1, pageSize = 6 } = filters;
    const skip = (page - 1) * pageSize;

    const where: Prisma.BuyingVehicleWhereInput = { category };

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
      prisma.buyingVehicle.count({ where }),
      prisma.buyingVehicle.findMany({ where, skip, take: pageSize }),
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
      prisma.buyingVehicle.groupBy({ by: ['make'], where: { category } }),
      prisma.buyingVehicle.groupBy({ by: ['chargerType'], where: { category } }),
      prisma.buyingVehicle.aggregate({ _max: { range: true, payload: true, volume: true }, where: { category } }),
    ]);

    return {
      makes: makeGroups.map((g) => g.make).filter(Boolean),
      chargerTypes: chargerGroups.map((g) => g.chargerType).filter(Boolean),
      maxRange: agg._max.range ?? 500,
      maxPayload: agg._max.payload ?? 1000,
      maxVolume: agg._max.volume ?? 0,
    };
  }

  async findById(id: string): Promise<BuyingVehicle | null> {
    const v = await prisma.buyingVehicle.findUnique({ where: { id } });
    return v ? this.mapToEntity(v) : null;
  }

  async create(vehicle: Omit<BuyingVehicle, 'id'>): Promise<BuyingVehicle> {
    const v = await prisma.buyingVehicle.create({
      data: {
        ...vehicle,
        sideImages: vehicle.sideImages.join(','),
      },
    });
    return this.mapToEntity(v);
  }

  async update(id: string, data: Partial<Omit<BuyingVehicle, 'id'>>): Promise<BuyingVehicle> {
    const { sideImages, ...rest } = data;
    const updateData: Prisma.BuyingVehicleUpdateInput = {
      ...rest,
      ...(Array.isArray(sideImages) ? { sideImages: sideImages.join(',') } : {}),
    };
    const v = await prisma.buyingVehicle.update({ where: { id }, data: updateData });
    return this.mapToEntity(v);
  }

  async delete(id: string): Promise<void> {
    await prisma.buyingVehicle.delete({ where: { id } });
  }

  private mapToEntity(v: Prisma.BuyingVehicleGetPayload<Record<string, never>>): BuyingVehicle {
    return {
      id: v.id,
      make: v.make,
      model: v.model,
      category: v.category as BuyingVehicle['category'],
      range: v.range,
      trueRange: v.trueRange,
      topSpeed: v.topSpeed,
      batteryCap: v.batteryCap,
      mainImage: v.mainImage,
      sideImages: v.sideImages ? v.sideImages.split(',').filter(Boolean) : [],
      buyingPrice: v.buyingPrice,
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
      buyingInfoText: v.buyingInfoText,
    };
  }
}
