-- Scope HR policies to an organization (multi-tenant safe RAG source).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'HrPolicy'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'HrPolicy' AND column_name = 'organizationId'
  ) THEN
    ALTER TABLE "HrPolicy" ADD COLUMN "organizationId" INTEGER;
    UPDATE "HrPolicy" hp
    SET "organizationId" = (SELECT o.id FROM "Organization" o ORDER BY o.id ASC LIMIT 1)
    WHERE hp."organizationId" IS NULL;
    ALTER TABLE "HrPolicy" ALTER COLUMN "organizationId" SET NOT NULL;
    ALTER TABLE "HrPolicy"
      ADD CONSTRAINT "HrPolicy_organizationId_fkey"
      FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS "HrPolicy_organizationId_idx" ON "HrPolicy"("organizationId");
  END IF;
END $$;
