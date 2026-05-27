-- ── Enums ────────────────────────────────────────────────────────────────────

CREATE TYPE "VehicleCategory" AS ENUM (
  'TWO_WHEELER',
  'THREE_WHEELER_CARGO',
  'THREE_WHEELER_PASSENGER',
  'FOUR_WHEELER_PASSENGER',
  'FOUR_WHEELER_CARGO'
);

CREATE TYPE "ChargerType" AS ENUM ('NORMAL', 'FAST', 'BOTH');

CREATE TYPE "TransmissionType" AS ENUM ('AUTO', 'MANUAL', 'SEMI_AUTO');

CREATE TYPE "InquiryType" AS ENUM (
  'VEHICLE_LEASING',
  'VEHICLE_RENTING',
  'VEHICLE_PURCHASE',
  'CORPORATE_ENTERPRISE',
  'FLEET_LOGISTICS',
  'DEALERSHIP_FRANCHISE',
  'B2B_PARTNERSHIP',
  'OTHER'
);

CREATE TYPE "LeadStatus" AS ENUM (
  'PENDING',
  'CONTACTED',
  'QUALIFIED',
  'CLOSED_WON',
  'CLOSED_LOST'
);

CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN');

CREATE TYPE "SellStatus" AS ENUM ('NEW', 'REVIEWING', 'VALUED', 'ACCEPTED', 'REJECTED');

-- ── BatteryType ───────────────────────────────────────────────────────────────

CREATE TABLE "BatteryType" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatteryType_pkey" PRIMARY KEY ("id")
);

-- ── MotorType ─────────────────────────────────────────────────────────────────

CREATE TABLE "MotorType" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MotorType_pkey" PRIMARY KEY ("id")
);

-- ── Vehicle ───────────────────────────────────────────────────────────────────

CREATE TABLE "Vehicle" (
    "id"               TEXT NOT NULL,
    "make"             TEXT NOT NULL,
    "model"            TEXT NOT NULL,
    "category"         "VehicleCategory" NOT NULL,
    "warranty"         TEXT NOT NULL DEFAULT '',
    "mainImage"        TEXT NOT NULL,

    "showInLeasing"    BOOLEAN NOT NULL DEFAULT false,
    "showInBuying"     BOOLEAN NOT NULL DEFAULT false,
    "showInRent"       BOOLEAN NOT NULL DEFAULT false,

    "buyingPrice"      DOUBLE PRECISION,

    "certifiedRangeKm" INTEGER NOT NULL,
    "realWorldRangeKm" INTEGER,
    "topSpeedKmh"      INTEGER NOT NULL,

    "batteryCapKwh"    DOUBLE PRECISION NOT NULL,
    "batteryTypeId"    TEXT,
    "peakVoltageV"     INTEGER,
    "motorTypeId"      TEXT,
    "peakPowerKw"      DOUBLE PRECISION,
    "peakTorqueNm"     DOUBLE PRECISION,
    "transmission"     "TransmissionType" NOT NULL DEFAULT 'AUTO',
    "gradabilityPct"   DOUBLE PRECISION,

    "chargingTimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "chargerType"         "ChargerType" NOT NULL DEFAULT 'NORMAL',
    "hasOnBoardCharger" BOOLEAN NOT NULL DEFAULT true,

    "curbWeightKg"      DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grossWeightKg"     DOUBLE PRECISION,
    "widthMm"           DOUBLE PRECISION NOT NULL DEFAULT 0,
    "heightMm"          DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lengthMm"          DOUBLE PRECISION NOT NULL DEFAULT 0,
    "groundClearanceMm" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wheelbaseMm"       DOUBLE PRECISION NOT NULL DEFAULT 0,

    "payloadKg"           DOUBLE PRECISION,
    "cargoVolumeL"        DOUBLE PRECISION,
    "containerDimensions" TEXT,

    "overview"    TEXT,
    "techSpecs"   TEXT,
    "performance" TEXT,
    "leasingInfo" TEXT,
    "buyingInfo"  TEXT,
    "rentalInfo"  TEXT,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- ── VehicleImage ──────────────────────────────────────────────────────────────

CREATE TABLE "VehicleImage" (
    "id"        TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "url"       TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "VehicleImage_pkey" PRIMARY KEY ("id")
);

-- ── LeasePlan ─────────────────────────────────────────────────────────────────

CREATE TABLE "LeasePlan" (
    "id"             TEXT NOT NULL,
    "vehicleId"      TEXT NOT NULL,
    "tenureMonths"   INTEGER NOT NULL,
    "monthlyPriceRs" DOUBLE PRECISION NOT NULL,
    "depositRs"      DOUBLE PRECISION NOT NULL,
    "isActive"       BOOLEAN NOT NULL DEFAULT true,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeasePlan_pkey" PRIMARY KEY ("id")
);

-- ── RentPlan ──────────────────────────────────────────────────────────────────

CREATE TABLE "RentPlan" (
    "id"            TEXT NOT NULL,
    "vehicleId"     TEXT NOT NULL,
    "durationDays"  INTEGER NOT NULL,
    "pricePerDayRs" DOUBLE PRECISION NOT NULL,
    "depositRs"     DOUBLE PRECISION NOT NULL,
    "isActive"      BOOLEAN NOT NULL DEFAULT true,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentPlan_pkey" PRIMARY KEY ("id")
);

-- ── Lead ──────────────────────────────────────────────────────────────────────

CREATE TABLE "Lead" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "phone"       TEXT NOT NULL,
    "email"       TEXT,
    "state"       TEXT NOT NULL DEFAULT '',
    "city"        TEXT NOT NULL DEFAULT '',
    "inquiryType" "InquiryType" NOT NULL,
    "vehicleId"   TEXT,
    "vehicleName" TEXT,
    "notes"       TEXT,
    "status"      "LeadStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- ── Faq ───────────────────────────────────────────────────────────────────────

CREATE TABLE "Faq" (
    "id"        TEXT NOT NULL,
    "question"  TEXT NOT NULL,
    "answer"    TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- ── BlogPost ──────────────────────────────────────────────────────────────────

CREATE TABLE "BlogPost" (
    "id"         TEXT NOT NULL,
    "title"      TEXT NOT NULL,
    "slug"       TEXT NOT NULL,
    "content"    TEXT NOT NULL,
    "excerpt"    TEXT,
    "coverImage" TEXT,
    "category"   TEXT NOT NULL,
    "tags"       TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "published"  BOOLEAN NOT NULL DEFAULT false,
    "authorName" TEXT NOT NULL DEFAULT 'ZMR Mobility Team',
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- ── EvBrand ───────────────────────────────────────────────────────────────────

CREATE TABLE "EvBrand" (
    "id"         TEXT NOT NULL,
    "name"       TEXT NOT NULL,
    "categories" "VehicleCategory"[] NOT NULL DEFAULT ARRAY[]::"VehicleCategory"[],
    "isActive"   BOOLEAN NOT NULL DEFAULT true,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvBrand_pkey" PRIMARY KEY ("id")
);

-- ── EvBrandModel ──────────────────────────────────────────────────────────────

CREATE TABLE "EvBrandModel" (
    "id"        TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "brandId"   TEXT NOT NULL,
    "photo"     TEXT,
    "category"  "VehicleCategory" NOT NULL,
    "isActive"  BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EvBrandModel_pkey" PRIMARY KEY ("id")
);

-- ── SellApplication ───────────────────────────────────────────────────────────

CREATE TABLE "SellApplication" (
    "id"               TEXT NOT NULL,
    "applicationId"    TEXT NOT NULL,
    "category"         "VehicleCategory" NOT NULL,
    "sellerType"       TEXT NOT NULL,
    "brandId"          TEXT NOT NULL,
    "brandName"        TEXT NOT NULL,
    "modelId"          TEXT NOT NULL,
    "modelName"        TEXT NOT NULL,
    "year"             INTEGER NOT NULL,
    "ownership"        TEXT NOT NULL,
    "batteryCondition" TEXT NOT NULL,
    "vehicleCondition" TEXT NOT NULL,
    "hasAccident"      BOOLEAN NOT NULL,
    "loanStatus"       TEXT NOT NULL,
    "documents"        TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "expectedPriceRs"  DOUBLE PRECISION NOT NULL,
    "contactName"      TEXT NOT NULL,
    "contactPhone"     TEXT NOT NULL,
    "contactEmail"     TEXT NOT NULL,
    "contactCity"      TEXT NOT NULL,
    "status"           "SellStatus" NOT NULL DEFAULT 'NEW',
    "adminNotes"       TEXT,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellApplication_pkey" PRIMARY KEY ("id")
);

-- ── AdminUser ─────────────────────────────────────────────────────────────────

CREATE TABLE "AdminUser" (
    "id"           TEXT NOT NULL,
    "email"        TEXT NOT NULL,
    "name"         TEXT NOT NULL DEFAULT '',
    "passwordHash" TEXT NOT NULL,
    "role"         "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "isActive"     BOOLEAN NOT NULL DEFAULT true,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,
    "lastLoginAt"  TIMESTAMP(3),

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- ── Unique constraints ────────────────────────────────────────────────────────

CREATE UNIQUE INDEX "BatteryType_name_key"         ON "BatteryType"("name");
CREATE UNIQUE INDEX "MotorType_name_key"           ON "MotorType"("name");
CREATE UNIQUE INDEX "BlogPost_slug_key"             ON "BlogPost"("slug");
CREATE UNIQUE INDEX "SellApplication_appId_key"   ON "SellApplication"("applicationId");
CREATE UNIQUE INDEX "AdminUser_email_key"          ON "AdminUser"("email");
CREATE UNIQUE INDEX "LeasePlan_vehicle_tenure_key" ON "LeasePlan"("vehicleId", "tenureMonths");
CREATE UNIQUE INDEX "RentPlan_vehicle_duration_key" ON "RentPlan"("vehicleId", "durationDays");

-- ── Indexes ───────────────────────────────────────────────────────────────────

CREATE INDEX "Vehicle_category_idx"           ON "Vehicle"("category");
CREATE INDEX "Vehicle_make_idx"               ON "Vehicle"("make");
CREATE INDEX "Vehicle_chargerType_idx"        ON "Vehicle"("chargerType");
CREATE INDEX "Vehicle_category_make_idx"      ON "Vehicle"("category", "make");
CREATE INDEX "Vehicle_showInLeasing_idx"      ON "Vehicle"("showInLeasing");
CREATE INDEX "Vehicle_showInBuying_idx"       ON "Vehicle"("showInBuying");
CREATE INDEX "Vehicle_showInRent_idx"         ON "Vehicle"("showInRent");
CREATE INDEX "Vehicle_batteryTypeId_idx"      ON "Vehicle"("batteryTypeId");
CREATE INDEX "Vehicle_motorTypeId_idx"        ON "Vehicle"("motorTypeId");
CREATE INDEX "VehicleImage_vehicleId_idx"     ON "VehicleImage"("vehicleId");
CREATE INDEX "LeasePlan_vehicleId_active_idx" ON "LeasePlan"("vehicleId", "isActive");
CREATE INDEX "RentPlan_vehicleId_active_idx"  ON "RentPlan"("vehicleId", "isActive");
CREATE INDEX "Lead_status_idx"                ON "Lead"("status");
CREATE INDEX "Lead_createdAt_idx"             ON "Lead"("createdAt");
CREATE INDEX "Lead_status_createdAt_idx"      ON "Lead"("status", "createdAt");
CREATE INDEX "BlogPost_published_idx"         ON "BlogPost"("published");
CREATE INDEX "BlogPost_category_idx"          ON "BlogPost"("category");
CREATE INDEX "BlogPost_published_createdAt_idx" ON "BlogPost"("published", "createdAt");
CREATE INDEX "EvBrandModel_brandId_idx"       ON "EvBrandModel"("brandId");

-- ── Foreign keys ──────────────────────────────────────────────────────────────

ALTER TABLE "VehicleImage" ADD CONSTRAINT "VehicleImage_vehicleId_fkey"
  FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LeasePlan" ADD CONSTRAINT "LeasePlan_vehicleId_fkey"
  FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RentPlan" ADD CONSTRAINT "RentPlan_vehicleId_fkey"
  FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EvBrandModel" ADD CONSTRAINT "EvBrandModel_brandId_fkey"
  FOREIGN KEY ("brandId") REFERENCES "EvBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_batteryTypeId_fkey"
  FOREIGN KEY ("batteryTypeId") REFERENCES "BatteryType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_motorTypeId_fkey"
  FOREIGN KEY ("motorTypeId") REFERENCES "MotorType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
