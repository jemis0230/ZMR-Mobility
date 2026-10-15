-- Blog authors, designations, types and managed tags.
-- Additive only: no existing rows or columns are removed. Legacy free-text tags are
-- copied into the new tag tables; legacy bylines (authorName) are left untouched.

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN "authorDesignation" TEXT,
ADD COLUMN "authorId" TEXT,
ADD COLUMN "publishedAt" TIMESTAMP(3),
ADD COLUMN "typeId" TEXT;

-- CreateTable
CREATE TABLE "BlogAuthor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogAuthor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameKey" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPostTag" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "BlogPostTag_pkey" PRIMARY KEY ("postId","tagId")
);

-- CreateTable
CREATE TABLE "BlogTagRedirect" (
    "fromSlug" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogTagRedirect_pkey" PRIMARY KEY ("fromSlug")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogAuthor_nameKey_key" ON "BlogAuthor"("nameKey");
CREATE UNIQUE INDEX "BlogType_nameKey_key" ON "BlogType"("nameKey");
CREATE UNIQUE INDEX "BlogType_slug_key" ON "BlogType"("slug");
CREATE UNIQUE INDEX "BlogTag_nameKey_key" ON "BlogTag"("nameKey");
CREATE UNIQUE INDEX "BlogTag_slug_key" ON "BlogTag"("slug");
CREATE INDEX "BlogPostTag_tagId_idx" ON "BlogPostTag"("tagId");
CREATE INDEX "BlogTagRedirect_tagId_idx" ON "BlogTagRedirect"("tagId");
CREATE INDEX "BlogPost_authorId_idx" ON "BlogPost"("authorId");
CREATE INDEX "BlogPost_typeId_idx" ON "BlogPost"("typeId");

-- AddForeignKey (authors and types in use cannot be deleted; tag links follow their post/tag)
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "BlogAuthor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "BlogType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlogPostTag" ADD CONSTRAINT "BlogPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "BlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlogTagRedirect" ADD CONSTRAINT "BlogTagRedirect_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "BlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Initial blog types (idempotent).
INSERT INTO "BlogType" ("id", "name", "nameKey", "slug", "updatedAt") VALUES
    ('blogtype_opinion', 'Opinion', 'opinion', 'opinion', CURRENT_TIMESTAMP),
    ('blogtype_explainer', 'Explainer', 'explainer', 'explainer', CURRENT_TIMESTAMP),
    ('blogtype_press', 'Press', 'press', 'press', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Existing published posts were shown with their creation date as the publish date.
UPDATE "BlogPost" SET "publishedAt" = "createdAt" WHERE "published" = true AND "publishedAt" IS NULL;

-- Copy legacy free-text tags into managed tags: trimmed, case-insensitively de-duplicated
-- (the earliest spelling wins), each with a unique URL-safe slug.
WITH raw AS (
    SELECT btrim(regexp_replace(t, '\s+', ' ', 'g')) AS name, p."createdAt"
    FROM "BlogPost" p, unnest(p."tags") AS t
), firsts AS (
    SELECT DISTINCT ON (lower(name)) name, lower(name) AS "nameKey"
    FROM raw WHERE name <> ''
    ORDER BY lower(name), "createdAt"
), slugged AS (
    SELECT name, "nameKey",
        COALESCE(NULLIF(btrim(regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'), '-'), ''), 'tag') AS base
    FROM firsts
), numbered AS (
    SELECT *, row_number() OVER (PARTITION BY base ORDER BY "nameKey") AS rn FROM slugged
)
INSERT INTO "BlogTag" ("id", "name", "nameKey", "slug", "updatedAt")
SELECT 'blogtag_' || md5("nameKey"), name, "nameKey",
    CASE WHEN rn = 1 THEN base ELSE base || '-' || rn END, CURRENT_TIMESTAMP
FROM numbered
ON CONFLICT DO NOTHING;

INSERT INTO "BlogPostTag" ("postId", "tagId")
SELECT DISTINCT p."id", bt."id"
FROM "BlogPost" p, unnest(p."tags") AS t
JOIN "BlogTag" bt ON bt."nameKey" = lower(btrim(regexp_replace(t, '\s+', ' ', 'g')))
ON CONFLICT DO NOTHING;
