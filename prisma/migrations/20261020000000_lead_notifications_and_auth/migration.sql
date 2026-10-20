-- Lead notification outbox, rate-limit counters and session revocation.
-- Additive only: existing rows and columns are unchanged.

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('QUEUED', 'SENDING', 'ACCEPTED', 'DELIVERED', 'READ', 'FAILED', 'NOT_CONFIGURED');

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "sessionVersion" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "reference" TEXT,
ADD COLUMN     "source" TEXT;

-- CreateTable
CREATE TABLE "LeadNotification" (
    "id" TEXT NOT NULL,
    "leadId" TEXT,
    "sellApplicationId" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'QUEUED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedUntil" TIMESTAMP(3),
    "sentTo" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "providerMessageIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastError" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "LeadNotification_status_nextAttemptAt_idx" ON "LeadNotification"("status", "nextAttemptAt");

-- CreateIndex
CREATE UNIQUE INDEX "LeadNotification_leadId_channel_key" ON "LeadNotification"("leadId", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "LeadNotification_sellApplicationId_channel_key" ON "LeadNotification"("sellApplicationId", "channel");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_reference_key" ON "Lead"("reference");

-- AddForeignKey
ALTER TABLE "LeadNotification" ADD CONSTRAINT "LeadNotification_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNotification" ADD CONSTRAINT "LeadNotification_sellApplicationId_fkey" FOREIGN KEY ("sellApplicationId") REFERENCES "SellApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;
