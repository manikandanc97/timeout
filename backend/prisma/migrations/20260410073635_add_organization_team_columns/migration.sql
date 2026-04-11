/*
  Warnings:

  - The values [CASUAL] on the enum `LeaveType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `startDate` on the `Leave` table. All the data in the column will be lost.
  - You are about to drop the column `endDate` on the `Leave` table. All the data in the column will be lost.
  - You are about to drop the column `casual` on the `LeaveBalance` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[date,organizationId]` on the table `Holiday` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `organizationId` to the `Holiday` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Leave` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Leave` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Leave` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "LeaveType_new" AS ENUM ('ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY');
ALTER TABLE "Leave" ALTER COLUMN "type" TYPE "LeaveType_new" USING ("type"::text::"LeaveType_new");
ALTER TYPE "LeaveType" RENAME TO "LeaveType_old";
ALTER TYPE "LeaveType_new" RENAME TO "LeaveType";
DROP TYPE "public"."LeaveType_old";
COMMIT;

-- DropIndex
DROP INDEX "Leave_startDate_idx";

-- DropIndex
DROP INDEX "Leave_userId_startDate_idx";

-- AlterTable
ALTER TABLE "Holiday" ADD COLUMN     "organizationId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Leave" DROP COLUMN "startDate",
DROP COLUMN "endDate",
ADD COLUMN     "approvedById" INTEGER,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "organizationId" INTEGER NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "teamId" INTEGER;

-- AlterTable
ALTER TABLE "LeaveBalance" DROP COLUMN "casual",
ADD COLUMN     "annual" INTEGER NOT NULL DEFAULT 12;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "organizationId" INTEGER NOT NULL,
ADD COLUMN     "teamId" INTEGER;

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "managerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_email_key" ON "Organization"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Team_name_organizationId_key" ON "Team"("name", "organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Holiday_date_organizationId_key" ON "Holiday"("date", "organizationId");

-- CreateIndex
CREATE INDEX "Leave_organizationId_idx" ON "Leave"("organizationId");

-- CreateIndex
CREATE INDEX "Leave_teamId_idx" ON "Leave"("teamId");

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leave" ADD CONSTRAINT "Leave_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holiday" ADD CONSTRAINT "Holiday_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
