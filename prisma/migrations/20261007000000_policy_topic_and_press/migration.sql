-- AlterTable
ALTER TABLE "Faq" ADD COLUMN "topic" TEXT;

-- CreateIndex
CREATE INDEX "Faq_topic_idx" ON "Faq"("topic");

-- CreateTable
CREATE TABLE "PressMention" (
    "id" TEXT NOT NULL,
    "publication" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PressMention_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PressMention_isActive_publishedAt_idx" ON "PressMention"("isActive", "publishedAt");
