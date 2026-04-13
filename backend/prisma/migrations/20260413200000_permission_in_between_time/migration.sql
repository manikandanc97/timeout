ALTER TYPE "PermissionType" ADD VALUE 'IN_BETWEEN_TIME';

ALTER TABLE "PermissionRequest" ADD COLUMN "startTimeMinutes" INTEGER,
ADD COLUMN "endTimeMinutes" INTEGER;
