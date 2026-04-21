-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'REVIEWED', 'APPROVED', 'PAID', 'VOID');

-- DropForeignKey
ALTER TABLE "HrPolicy" DROP CONSTRAINT "HrPolicy_organizationId_fkey";

-- DropIndex
DROP INDEX "Holiday_date_key";

-- AlterTable
ALTER TABLE "HrPolicy" ALTER COLUMN "title" SET DATA TYPE TEXT,
ALTER COLUMN "category" SET DATA TYPE TEXT,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Leave" ADD COLUMN     "balanceDeductedDays" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lopAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lopDays" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN     "resetPasswordToken" TEXT;

-- CreateTable
CREATE TABLE "SalaryStructure" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "yearlyGrossSalary" DOUBLE PRECISION,
    "basicSalary" DOUBLE PRECISION NOT NULL,
    "hra" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "allowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pf" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "professionalTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "esi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pfRate" DOUBLE PRECISION NOT NULL DEFAULT 12.0,
    "esiRate" DOUBLE PRECISION NOT NULL DEFAULT 0.75,
    "conveyance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "specialAllowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimeRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lopDays" INTEGER NOT NULL DEFAULT 0,
    "lopAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryStructure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payroll" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "yearlyGrossSalary" DOUBLE PRECISION NOT NULL,
    "basicSalary" DOUBLE PRECISION NOT NULL,
    "hra" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "allowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonus" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pf" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "professionalTax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "esi" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tds" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "incentives" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "overtimeAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reimbursements" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "settlementAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lopDays" INTEGER NOT NULL DEFAULT 0,
    "lopAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "netSalary" DOUBLE PRECISION NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "paidDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSettings" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'demo',
    "model" TEXT,
    "apiKey" TEXT,
    "baseUrl" TEXT,
    "systemPrompt" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiAuditLog" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "userName" TEXT NOT NULL,
    "userRole" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payload" JSONB,
    "result" JSONB,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HrDocumentChunk" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "hrPolicyId" INTEGER,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HrDocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PayrollApprovalLog" (
    "id" SERIAL NOT NULL,
    "payrollId" INTEGER NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "status" "PayrollStatus" NOT NULL,
    "comment" TEXT,
    "actorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PayrollApprovalLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "actorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SalaryStructure_organizationId_effectiveFrom_idx" ON "SalaryStructure"("organizationId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "SalaryStructure_userId_effectiveFrom_idx" ON "SalaryStructure"("userId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "Payroll_organizationId_month_year_idx" ON "Payroll"("organizationId", "month", "year");

-- CreateIndex
CREATE INDEX "Payroll_userId_month_year_idx" ON "Payroll"("userId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "Payroll_userId_month_year_key" ON "Payroll"("userId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "AiSettings_organizationId_key" ON "AiSettings"("organizationId");

-- CreateIndex
CREATE INDEX "AiAuditLog_organizationId_createdAt_idx" ON "AiAuditLog"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AiAuditLog_userId_createdAt_idx" ON "AiAuditLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "HrDocumentChunk_organizationId_idx" ON "HrDocumentChunk"("organizationId");

-- CreateIndex
CREATE INDEX "PayrollApprovalLog_payrollId_idx" ON "PayrollApprovalLog"("payrollId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId", "createdAt");

-- AddForeignKey
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryStructure" ADD CONSTRAINT "SalaryStructure_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrPolicy" ADD CONSTRAINT "HrPolicy_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiSettings" ADD CONSTRAINT "AiSettings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAuditLog" ADD CONSTRAINT "AiAuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiAuditLog" ADD CONSTRAINT "AiAuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrDocumentChunk" ADD CONSTRAINT "HrDocumentChunk_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HrDocumentChunk" ADD CONSTRAINT "HrDocumentChunk_hrPolicyId_fkey" FOREIGN KEY ("hrPolicyId") REFERENCES "HrPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollApprovalLog" ADD CONSTRAINT "PayrollApprovalLog_payrollId_fkey" FOREIGN KEY ("payrollId") REFERENCES "Payroll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayrollApprovalLog" ADD CONSTRAINT "PayrollApprovalLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
