-- First-party blog article views (additive only; no existing table or data changes).
CREATE TABLE "BlogPageView" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'direct',

    CONSTRAINT "BlogPageView_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BlogPageView_viewedAt_idx" ON "BlogPageView"("viewedAt");

CREATE INDEX "BlogPageView_postId_viewedAt_idx" ON "BlogPageView"("postId", "viewedAt");

ALTER TABLE "BlogPageView" ADD CONSTRAINT "BlogPageView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
