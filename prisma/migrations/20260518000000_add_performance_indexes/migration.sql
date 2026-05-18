-- Vehicle indexes for category-based filtering (most common query pattern)
CREATE INDEX "Vehicle_category_idx" ON "Vehicle"("category");
CREATE INDEX "Vehicle_make_idx" ON "Vehicle"("make");
CREATE INDEX "Vehicle_chargerType_idx" ON "Vehicle"("chargerType");
-- Compound indexes let groupBy(make WHERE category=?) use index-only scans
CREATE INDEX "Vehicle_category_make_idx" ON "Vehicle"("category", "make");
CREATE INDEX "Vehicle_category_chargerType_idx" ON "Vehicle"("category", "chargerType");

-- BuyingVehicle indexes (identical pattern to Vehicle)
CREATE INDEX "BuyingVehicle_category_idx" ON "BuyingVehicle"("category");
CREATE INDEX "BuyingVehicle_make_idx" ON "BuyingVehicle"("make");
CREATE INDEX "BuyingVehicle_chargerType_idx" ON "BuyingVehicle"("chargerType");
CREATE INDEX "BuyingVehicle_category_make_idx" ON "BuyingVehicle"("category", "make");
CREATE INDEX "BuyingVehicle_category_chargerType_idx" ON "BuyingVehicle"("category", "chargerType");

-- BlogPost indexes for listing queries (published=true ORDER BY createdAt)
CREATE INDEX "BlogPost_published_idx" ON "BlogPost"("published");
CREATE INDEX "BlogPost_category_idx" ON "BlogPost"("category");
CREATE INDEX "BlogPost_published_createdAt_idx" ON "BlogPost"("published", "createdAt");

-- Lead indexes for admin dashboard filtering by status
CREATE INDEX "Lead_status_idx" ON "Lead"("status");
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");
CREATE INDEX "Lead_status_createdAt_idx" ON "Lead"("status", "createdAt");
