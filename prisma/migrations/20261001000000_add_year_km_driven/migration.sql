-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN "manufactureYear" INTEGER,
ADD COLUMN "kmDriven" INTEGER;

-- CreateIndex
CREATE INDEX "Vehicle_buyingPrice_idx" ON "Vehicle"("buyingPrice");

-- CreateIndex
CREATE INDEX "Vehicle_manufactureYear_idx" ON "Vehicle"("manufactureYear");

-- CreateIndex
CREATE INDEX "Vehicle_kmDriven_idx" ON "Vehicle"("kmDriven");
