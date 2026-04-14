-- Add organization-level admin settings fields
ALTER TABLE "Organization"
ADD COLUMN "phoneNumber" TEXT,
ADD COLUMN "officeAddress" TEXT,
ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'INR',
ADD COLUMN "dateFormat" TEXT NOT NULL DEFAULT 'DD/MM/YYYY',
ADD COLUMN "adminSettings" JSONB;

