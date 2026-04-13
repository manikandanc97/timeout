CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

ALTER TABLE "CompOffWorkLog"
ADD COLUMN "status" "RequestStatus" NOT NULL DEFAULT 'PENDING';

ALTER TABLE "PermissionRequest"
ADD COLUMN "status" "RequestStatus" NOT NULL DEFAULT 'PENDING';
