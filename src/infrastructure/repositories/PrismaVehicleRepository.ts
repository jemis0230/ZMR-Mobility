import { IVehicleRepository, ExploreFilterParams, ExploreMenuData, VehicleFilterParams, PaginatedResult, FilterOptions, VehicleCreateInput, VehicleUpdateInput } from "@/application/repositories/IVehicleRepository";
import { Vehicle, LeasePlan, RentPlan, VehicleImage } from "@/domain/entities/Vehicle";
import { VehicleCategory, ChargerType, TransmissionType } from "@/lib/constants";
import { Prisma, TransmissionType as PrismaTransmissionType, ChargerType as PrismaChargerType } from "@prisma/client";
import prisma from "@/lib/prisma";

type VehicleWithRelations = Prisma.VehicleGetPayload<{
  include: { images: true; leasePlans: true; rentPlans: true; batteryType: true; motorType: true };
}>;

const vehicleInclude = { images: true, leasePlans: true, rentPlans: true, batteryType: true, motorType: true } as const;

export class PrismaVehicleRepository implements IVehicleRepository {
  async findAll(): Promise<Vehicle[]> {
    const vehicles = await prisma.vehicle.findMany({ include: vehicleInclude });
    return vehicles.map((v) => this.mapToEntity(v));
  }

  async findByCategory(category: VehicleCategory): Promise<Vehicle[]> {
    const vehicles = await prisma.vehicle.findMany({ where: { category }, include: vehicleInclude });
    return vehicles.map((v) => this.mapToEntity(v));
  }

  // ── Leasing ──────────────────────────────────────────────────

  async findByCategoryWithFilters(category: VehicleCategory, filters: VehicleFilterParams): Promise<PaginatedResult<Vehicle>> {
    return this._findWithFilters({ category, showInLeasing: true }, filters, 'lease');
  }

  async getFilterOptions(category: VehicleCategory): Promise<FilterOptions> {
    return this._getFilterOptions({ category, showInLeasing: true });
  }

  // ── Buying ───────────────────────────────────────────────────

  async findByCategoryForBuying(category: VehicleCategory, filters: VehicleFilterParams): Promise<PaginatedResult<Vehicle>> {
    return this._findWithFilters({ category, showInBuying: true }, filters, 'buying');
  }

  async getFilterOptionsForBuying(category: VehicleCategory): Promise<FilterOptions> {
    return this._getFilterOptions({ category, showInBuying: true });
  }

  // ── Rent ─────────────────────────────────────────────────────

  async findByCategoryForRent(category: VehicleCategory, filters: VehicleFilterParams): Promise<PaginatedResult<Vehicle>> {
    return this._findWithFilters({ category, showInRent: true }, filters, 'rent');
  }

  async getFilterOptionsForRent(category: VehicleCategory): Promise<FilterOptions> {
    return this._getFilterOptions({ category, showInRent: true });
  }

  // ── Explore (all buying vehicles, cross-category) ────────────

  async findForExplore(filters: ExploreFilterParams): Promise<PaginatedResult<Vehicle>> {
    const {
      q, minPrice, maxPrice, makes, model, minYear, maxKm, categories, transmission, minRange,
      sortBy = 'newest', page = 1, pageSize = 12,
    } = filters;

    const and: Prisma.VehicleWhereInput[] = [{ showInBuying: true }];

    if (q && q.trim()) {
      const terms = q.trim().split(/\s+/).slice(0, 5);
      for (const term of terms) {
        and.push({
          OR: [
            { make: { contains: term, mode: 'insensitive' } },
            { model: { contains: term, mode: 'insensitive' } },
          ],
        });
      }
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      and.push({ buyingPrice: { ...(minPrice !== undefined ? { gte: minPrice } : {}), ...(maxPrice !== undefined ? { lte: maxPrice } : {}) } });
    }
    if (makes && makes.length > 0) and.push({ make: { in: makes, mode: 'insensitive' } });
    if (model) and.push({ model: { equals: model, mode: 'insensitive' } });
    if (minYear !== undefined) and.push({ manufactureYear: { gte: minYear } });
    if (maxKm !== undefined) and.push({ kmDriven: { lte: maxKm } });
    if (categories && categories.length > 0) and.push({ category: { in: categories } });
    if (transmission) and.push({ transmission: transmission as PrismaTransmissionType });
    if (minRange !== undefined) and.push({ certifiedRangeKm: { gte: minRange } });

    const where: Prisma.VehicleWhereInput = { AND: and };

    const orderBy: Prisma.VehicleOrderByWithRelationInput[] =
      sortBy === 'price_asc'  ? [{ buyingPrice: { sort: 'asc', nulls: 'last' } }] :
      sortBy === 'price_desc' ? [{ buyingPrice: { sort: 'desc', nulls: 'last' } }] :
      sortBy === 'year_desc'  ? [{ manufactureYear: { sort: 'desc', nulls: 'last' } }] :
      sortBy === 'km_asc'     ? [{ kmDriven: { sort: 'asc', nulls: 'last' } }] :
      [{ createdAt: 'desc' }];
    orderBy.push({ id: 'asc' });

    const skip = (page - 1) * pageSize;
    const [total, vehicles] = await Promise.all([
      prisma.vehicle.count({ where }),
      prisma.vehicle.findMany({ where, skip, take: pageSize, orderBy, include: vehicleInclude }),
    ]);

    return {
      data: vehicles.map((v) => this.mapToEntity(v)),
      total,
      page,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async getExploreMenuData(): Promise<ExploreMenuData> {
    const groups = await prisma.vehicle.groupBy({
      by: ['make', 'model'],
      where: { showInBuying: true },
      _count: { _all: true },
    });

    const byMake = new Map<string, { make: string; models: string[]; count: number }>();
    for (const g of groups) {
      const entry = byMake.get(g.make) ?? { make: g.make, models: [], count: 0 };
      entry.models.push(g.model);
      entry.count += g._count._all;
      byMake.set(g.make, entry);
    }

    return {
      makes: Array.from(byMake.values())
        .map((m) => ({ ...m, models: m.models.sort((a, b) => a.localeCompare(b)) }))
        .sort((a, b) => b.count - a.count || a.make.localeCompare(b.make)),
    };
  }

  // ── Shared helpers ───────────────────────────────────────────

  private async _findWithFilters(
    baseWhere: Prisma.VehicleWhereInput,
    filters: VehicleFilterParams,
    priceSection: 'lease' | 'buying' | 'rent'
  ): Promise<PaginatedResult<Vehicle>> {
    const {
      makes, chargerType,
      minRange, maxRange,
      minRealWorldRange, maxRealWorldRange,
      minSpeed, maxSpeed,
      minPayload, maxPayload,
      minVolume, maxVolume,
      sortBy,
      page = 1, pageSize = 6,
    } = filters;

    const where: Prisma.VehicleWhereInput = { ...baseWhere };

    if (makes && makes.length > 0) where.make = { in: makes };
    if (chargerType) where.chargerType = chargerType as PrismaChargerType;

    if (minRange !== undefined || maxRange !== undefined) {
      where.certifiedRangeKm = {};
      if (minRange !== undefined) where.certifiedRangeKm.gte = minRange;
      if (maxRange !== undefined) where.certifiedRangeKm.lte = maxRange;
    }
    if (minRealWorldRange !== undefined || maxRealWorldRange !== undefined) {
      where.realWorldRangeKm = {};
      if (minRealWorldRange !== undefined) where.realWorldRangeKm.gte = minRealWorldRange;
      if (maxRealWorldRange !== undefined) where.realWorldRangeKm.lte = maxRealWorldRange;
    }
    if (minSpeed !== undefined || maxSpeed !== undefined) {
      where.topSpeedKmh = {};
      if (minSpeed !== undefined) where.topSpeedKmh.gte = minSpeed;
      if (maxSpeed !== undefined) where.topSpeedKmh.lte = maxSpeed;
    }
    if (minPayload !== undefined || maxPayload !== undefined) {
      where.payloadKg = {};
      if (minPayload !== undefined) where.payloadKg.gte = minPayload;
      if (maxPayload !== undefined) where.payloadKg.lte = maxPayload;
    }
    if (minVolume !== undefined || maxVolume !== undefined) {
      where.cargoVolumeL = {};
      if (minVolume !== undefined) where.cargoVolumeL.gte = minVolume;
      if (maxVolume !== undefined) where.cargoVolumeL.lte = maxVolume;
    }

    // Price sort: fetch all matching vehicles, compute weighted price, sort in JS, then paginate
    if (sortBy === 'price_asc' || sortBy === 'price_desc') {
      const all = await prisma.vehicle.findMany({ where, include: vehicleInclude });
      const scored = all.map((v) => ({
        entity: this.mapToEntity(v),
        score: this._computeEffectivePrice(v, priceSection),
      }));
      scored.sort((a, b) => sortBy === 'price_asc' ? a.score - b.score : b.score - a.score);
      const total = scored.length;
      const skip = (page - 1) * pageSize;
      return {
        data: scored.slice(skip, skip + pageSize).map((s) => s.entity),
        total,
        page,
        totalPages: Math.ceil(total / pageSize) || 1,
      };
    }

    // Default: DB-level pagination, ordered by createdAt desc
    const skip = (page - 1) * pageSize;
    const [total, vehicles] = await Promise.all([
      prisma.vehicle.count({ where }),
      prisma.vehicle.findMany({ where, skip, take: pageSize, orderBy: { createdAt: 'desc' }, include: vehicleInclude }),
    ]);

    return {
      data: vehicles.map((v) => this.mapToEntity(v)),
      total,
      page,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  private _computeEffectivePrice(
    v: Prisma.VehicleGetPayload<{ include: typeof vehicleInclude }>,
    section: 'lease' | 'buying' | 'rent'
  ): number {
    if (section === 'buying') return v.buyingPrice ?? Infinity;

    if (section === 'lease') {
      const active = v.leasePlans.filter((p) => p.isActive);
      if (active.length === 0) return Infinity;
      const totalMonths = active.reduce((s, p) => s + p.tenureMonths, 0);
      const totalCost = active.reduce((s, p) => s + p.monthlyPriceRs * p.tenureMonths, 0);
      return totalCost / totalMonths;
    }

    // rent
    const active = v.rentPlans.filter((p) => p.isActive);
    if (active.length === 0) return Infinity;
    const totalDays = active.reduce((s, p) => s + p.durationDays, 0);
    const totalCost = active.reduce((s, p) => s + p.pricePerDayRs * p.durationDays, 0);
    return totalCost / totalDays;
  }

  private async _getFilterOptions(baseWhere: Prisma.VehicleWhereInput): Promise<FilterOptions> {
    const [makeGroups, chargerGroups, agg] = await Promise.all([
      prisma.vehicle.groupBy({ by: ['make'], where: baseWhere }),
      prisma.vehicle.groupBy({ by: ['chargerType'], where: baseWhere }),
      prisma.vehicle.aggregate({
        _max: { certifiedRangeKm: true, realWorldRangeKm: true, topSpeedKmh: true, payloadKg: true, cargoVolumeL: true },
        where: baseWhere,
      }),
    ]);

    return {
      makes: makeGroups.map((g) => g.make).filter(Boolean),
      chargerTypes: chargerGroups.map((g) => g.chargerType as ChargerType).filter(Boolean),
      maxRange: agg._max.certifiedRangeKm ?? 500,
      maxRealWorldRange: agg._max.realWorldRangeKm ?? 300,
      maxSpeed: agg._max.topSpeedKmh ?? 120,
      maxPayload: agg._max.payloadKg ?? 1000,
      maxVolume: agg._max.cargoVolumeL ?? 1000,
    };
  }

  // ── Single vehicle ───────────────────────────────────────────

  async findById(id: string): Promise<Vehicle | null> {
    const v = await prisma.vehicle.findUnique({ where: { id }, include: vehicleInclude });
    return v ? this.mapToEntity(v) : null;
  }

  // ── LeasePlan CRUD ───────────────────────────────────────────

  async findLeasePlansByVehicleId(vehicleId: string): Promise<LeasePlan[]> {
    const plans = await prisma.leasePlan.findMany({ where: { vehicleId }, orderBy: { tenureMonths: 'asc' } });
    return plans.map((p) => this.mapLeasePlan(p));
  }

  async addLeasePlan(plan: Omit<LeasePlan, 'id'>): Promise<LeasePlan> {
    const p = await prisma.leasePlan.create({ data: plan });
    return this.mapLeasePlan(p);
  }

  async updateLeasePlan(id: string, data: Partial<Omit<LeasePlan, 'id' | 'vehicleId'>>): Promise<LeasePlan> {
    const p = await prisma.leasePlan.update({ where: { id }, data });
    return this.mapLeasePlan(p);
  }

  async deleteLeasePlan(id: string): Promise<void> {
    await prisma.leasePlan.delete({ where: { id } });
  }

  // ── RentPlan CRUD ────────────────────────────────────────────

  async findRentPlansByVehicleId(vehicleId: string): Promise<RentPlan[]> {
    const plans = await prisma.rentPlan.findMany({ where: { vehicleId }, orderBy: { durationDays: 'asc' } });
    return plans.map((p) => this.mapRentPlan(p));
  }

  async addRentPlan(plan: Omit<RentPlan, 'id'>): Promise<RentPlan> {
    const p = await prisma.rentPlan.create({ data: plan });
    return this.mapRentPlan(p);
  }

  async updateRentPlan(id: string, data: Partial<Omit<RentPlan, 'id' | 'vehicleId'>>): Promise<RentPlan> {
    const p = await prisma.rentPlan.update({ where: { id }, data });
    return this.mapRentPlan(p);
  }

  async deleteRentPlan(id: string): Promise<void> {
    await prisma.rentPlan.delete({ where: { id } });
  }

  // ── Vehicle CRUD ─────────────────────────────────────────────

  async create(input: VehicleCreateInput): Promise<Vehicle> {
    const { imageUrls, transmission, chargerType, ...fields } = input;
    const v = await prisma.vehicle.create({
      data: {
        ...fields,
        transmission: transmission as PrismaTransmissionType,
        chargerType: chargerType as PrismaChargerType,
        images: {
          create: imageUrls.map((url, i) => ({ url, sortOrder: i })),
        },
      },
      include: vehicleInclude,
    });
    return this.mapToEntity(v);
  }

  async update(id: string, input: VehicleUpdateInput): Promise<Vehicle> {
    const { imageUrls, transmission, chargerType, ...fields } = input;

    const updateData: Prisma.VehicleUpdateInput = {
      ...fields,
      ...(transmission !== undefined ? { transmission: transmission as PrismaTransmissionType } : {}),
      ...(chargerType !== undefined ? { chargerType: chargerType as PrismaChargerType } : {}),
    };

    if (imageUrls !== undefined) {
      updateData.images = {
        deleteMany: {},
        create: imageUrls.map((url, i) => ({ url, sortOrder: i })),
      };
    }

    const v = await prisma.vehicle.update({
      where: { id },
      data: updateData,
      include: vehicleInclude,
    });
    return this.mapToEntity(v);
  }

  async delete(id: string): Promise<void> {
    await prisma.vehicle.delete({ where: { id } });
  }

  // ── Mappers ──────────────────────────────────────────────────

  private mapToEntity(v: VehicleWithRelations): Vehicle {
    return {
      id: v.id,
      make: v.make,
      model: v.model,
      category: v.category as VehicleCategory,
      warranty: v.warranty,
      mainImage: v.mainImage,

      showInLeasing: v.showInLeasing,
      showInBuying: v.showInBuying,
      showInRent: v.showInRent,

      buyingPrice: v.buyingPrice,
      manufactureYear: v.manufactureYear,
      kmDriven: v.kmDriven,

      certifiedRangeKm: v.certifiedRangeKm,
      realWorldRangeKm: v.realWorldRangeKm,
      topSpeedKmh: v.topSpeedKmh,

      batteryCapKwh: v.batteryCapKwh,
      batteryTypeId: v.batteryTypeId,
      batteryType: v.batteryType ? { id: v.batteryType.id, name: v.batteryType.name } : null,
      peakVoltageV: v.peakVoltageV,
      motorTypeId: v.motorTypeId,
      motorType: v.motorType ? { id: v.motorType.id, name: v.motorType.name } : null,
      peakPowerKw: v.peakPowerKw,
      peakTorqueNm: v.peakTorqueNm,
      transmission: v.transmission as TransmissionType,
      gradabilityPct: v.gradabilityPct,

      chargingTimeMinutes: v.chargingTimeMinutes,
      chargerType: v.chargerType as ChargerType,
      hasOnBoardCharger: v.hasOnBoardCharger,

      curbWeightKg: v.curbWeightKg,
      grossWeightKg: v.grossWeightKg,
      widthMm: v.widthMm,
      heightMm: v.heightMm,
      lengthMm: v.lengthMm,
      groundClearanceMm: v.groundClearanceMm,
      wheelbaseMm: v.wheelbaseMm,

      payloadKg: v.payloadKg,
      cargoVolumeL: v.cargoVolumeL,
      containerDimensions: v.containerDimensions,

      overview: v.overview,
      techSpecs: v.techSpecs,
      performance: v.performance,
      leasingInfo: v.leasingInfo,
      buyingInfo: v.buyingInfo,
      rentalInfo: v.rentalInfo,

      images: v.images.map((img): VehicleImage => ({
        id: img.id,
        vehicleId: img.vehicleId,
        url: img.url,
        sortOrder: img.sortOrder,
      })),

      leasePlans: v.leasePlans.map((p) => this.mapLeasePlan(p)),
      rentPlans: v.rentPlans.map((p) => this.mapRentPlan(p)),
    };
  }

  private mapLeasePlan(p: { id: string; vehicleId: string; tenureMonths: number; monthlyPriceRs: number; depositRs: number; isActive: boolean }): LeasePlan {
    return {
      id: p.id,
      vehicleId: p.vehicleId,
      tenureMonths: p.tenureMonths,
      monthlyPriceRs: p.monthlyPriceRs,
      depositRs: p.depositRs,
      isActive: p.isActive,
    };
  }

  private mapRentPlan(p: { id: string; vehicleId: string; durationDays: number; pricePerDayRs: number; depositRs: number; isActive: boolean }): RentPlan {
    return {
      id: p.id,
      vehicleId: p.vehicleId,
      durationDays: p.durationDays,
      pricePerDayRs: p.pricePerDayRs,
      depositRs: p.depositRs,
      isActive: p.isActive,
    };
  }
}
