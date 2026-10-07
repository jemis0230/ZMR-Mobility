-- Additive only: no existing rows or columns are changed.

-- CreateEnum
CREATE TYPE "TwoWheelerStyle" AS ENUM ('SCOOTER', 'BIKE');

-- AlterEnum
ALTER TYPE "InquiryType" ADD VALUE 'TEST_DRIVE';

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN "twoWheelerStyle" "TwoWheelerStyle";

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "preferredDate" DATE;
