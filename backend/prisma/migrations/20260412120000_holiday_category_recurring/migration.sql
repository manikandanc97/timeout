-- CreateEnum
CREATE TYPE "HolidayCategory" AS ENUM ('PUBLIC', 'COMPANY', 'REGIONAL');

-- AlterTable
ALTER TABLE "Holiday" ADD COLUMN     "category" "HolidayCategory" NOT NULL DEFAULT 'PUBLIC',
ADD COLUMN     "recurring" BOOLEAN NOT NULL DEFAULT false;
