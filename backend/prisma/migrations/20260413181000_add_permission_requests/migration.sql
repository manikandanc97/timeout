CREATE TYPE "PermissionType" AS ENUM ('LATE_LOGIN', 'EARLY_LOGOUT');

CREATE TABLE "PermissionRequest" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "organizationId" INTEGER NOT NULL,
  "type" "PermissionType" NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PermissionRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PermissionRequest_userId_date_idx"
ON "PermissionRequest"("userId", "date");

CREATE INDEX "PermissionRequest_organizationId_date_idx"
ON "PermissionRequest"("organizationId", "date");

ALTER TABLE "PermissionRequest"
ADD CONSTRAINT "PermissionRequest_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PermissionRequest"
ADD CONSTRAINT "PermissionRequest_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
