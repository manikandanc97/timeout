-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Department_organizationId_name_key" ON "Department"("organizationId", "name");

CREATE INDEX "Department_organizationId_idx" ON "Department"("organizationId");

ALTER TABLE "Department" ADD CONSTRAINT "Department_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Team: link to department (nullable until backfilled)
ALTER TABLE "Team" ADD COLUMN "departmentId" INTEGER;

-- One fallback department per org for existing teams
INSERT INTO "Department" ("name", "organizationId", "sortOrder")
SELECT 'General', o."id", 999
FROM "Organization" o;

UPDATE "Team" t
SET "departmentId" = d."id"
FROM "Department" d
WHERE d."organizationId" = t."organizationId"
  AND d."name" = 'General'
  AND t."departmentId" IS NULL;

ALTER TABLE "Team" ALTER COLUMN "departmentId" SET NOT NULL;

DROP INDEX IF EXISTS "Team_name_organizationId_key";

ALTER TABLE "Team" ADD CONSTRAINT "Team_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "Team_name_departmentId_key" ON "Team"("name", "departmentId");
