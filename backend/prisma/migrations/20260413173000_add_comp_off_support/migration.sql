ALTER TYPE "LeaveType" ADD VALUE IF NOT EXISTS 'COMP_OFF';

ALTER TABLE "LeaveBalance"
ADD COLUMN "compOff" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "CompOffWorkLog" (
  "id" SERIAL NOT NULL,
  "userId" INTEGER NOT NULL,
  "organizationId" INTEGER NOT NULL,
  "workDate" TIMESTAMP(3) NOT NULL,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CompOffWorkLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CompOffWorkLog_userId_workDate_key"
ON "CompOffWorkLog"("userId", "workDate");

CREATE INDEX "CompOffWorkLog_organizationId_workDate_idx"
ON "CompOffWorkLog"("organizationId", "workDate");

ALTER TABLE "CompOffWorkLog"
ADD CONSTRAINT "CompOffWorkLog_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CompOffWorkLog"
ADD CONSTRAINT "CompOffWorkLog_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
