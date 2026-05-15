-- ZMR Mobility — Full schema migration (PostgreSQL)
-- Run: npx prisma migrate deploy

CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "range" INTEGER NOT NULL,
    "trueRange" INTEGER,
    "topSpeed" INTEGER NOT NULL,
    "batteryCap" DOUBLE PRECISION NOT NULL,
    "mainImage" TEXT NOT NULL,
    "sideImages" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "deposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "warranty" TEXT NOT NULL DEFAULT '',
    "kerbWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gvW" DOUBLE PRECISION,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "length" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "groundClearance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wheelbase" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "batteryType" TEXT NOT NULL DEFAULT '',
    "peakVoltage" INTEGER,
    "motorType" TEXT NOT NULL DEFAULT '',
    "peakPower" TEXT NOT NULL DEFAULT '',
    "peakTorque" TEXT NOT NULL DEFAULT '',
    "transmission" TEXT NOT NULL DEFAULT 'Auto',
    "gradability" DOUBLE PRECISION,
    "chargingTime" TEXT NOT NULL DEFAULT '',
    "fastChargingTime" TEXT,
    "chargerType" TEXT NOT NULL DEFAULT 'Normal',
    "onBoardCharger" BOOLEAN NOT NULL DEFAULT true,
    "payload" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "containerDims" TEXT,
    "overviewText" TEXT,
    "techSpecsText" TEXT,
    "performanceText" TEXT,
    "leasingInfoText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LeasePlan" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "tenure" INTEGER NOT NULL,
    "monthlyPrice" DOUBLE PRECISION NOT NULL,
    "deposit" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "LeasePlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "state" TEXT NOT NULL DEFAULT '',
    "city" TEXT NOT NULL DEFAULT '',
    "inquiryCategory" TEXT NOT NULL,
    "vehicleId" TEXT,
    "vehicleName" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImage" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorName" TEXT NOT NULL DEFAULT 'ZMR Mobility Team',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EvBrand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categories" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EvBrand_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EvBrandModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "photo" TEXT,
    "category" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EvBrandModel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SellApplication" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "sellerType" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "modelName" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "ownership" TEXT NOT NULL,
    "batteryCondition" TEXT NOT NULL,
    "vehicleCondition" TEXT NOT NULL,
    "hasAccident" BOOLEAN NOT NULL,
    "loanStatus" TEXT NOT NULL,
    "documents" TEXT NOT NULL DEFAULT '',
    "expectedPrice" DOUBLE PRECISION NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactCity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SellApplication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),
    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BuyingVehicle" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "range" INTEGER NOT NULL,
    "trueRange" INTEGER,
    "topSpeed" INTEGER NOT NULL,
    "batteryCap" DOUBLE PRECISION NOT NULL,
    "mainImage" TEXT NOT NULL,
    "sideImages" TEXT NOT NULL,
    "buyingPrice" DOUBLE PRECISION NOT NULL,
    "warranty" TEXT NOT NULL DEFAULT '',
    "kerbWeight" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gvW" DOUBLE PRECISION,
    "width" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "height" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "length" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "groundClearance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "wheelbase" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "batteryType" TEXT NOT NULL DEFAULT '',
    "peakVoltage" INTEGER,
    "motorType" TEXT NOT NULL DEFAULT '',
    "peakPower" TEXT NOT NULL DEFAULT '',
    "peakTorque" TEXT NOT NULL DEFAULT '',
    "transmission" TEXT NOT NULL DEFAULT 'Auto',
    "gradability" DOUBLE PRECISION,
    "chargingTime" TEXT NOT NULL DEFAULT '',
    "fastChargingTime" TEXT,
    "chargerType" TEXT NOT NULL DEFAULT 'Normal',
    "onBoardCharger" BOOLEAN NOT NULL DEFAULT true,
    "payload" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "containerDims" TEXT,
    "overviewText" TEXT,
    "techSpecsText" TEXT,
    "performanceText" TEXT,
    "buyingInfoText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "BuyingVehicle_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");
CREATE UNIQUE INDEX "SellApplication_applicationId_key" ON "SellApplication"("applicationId");
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

ALTER TABLE "LeasePlan" ADD CONSTRAINT "LeasePlan_vehicleId_fkey"
    FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EvBrandModel" ADD CONSTRAINT "EvBrandModel_brandId_fkey"
    FOREIGN KEY ("brandId") REFERENCES "EvBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
