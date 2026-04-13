-- Add optional admin/manager rejection note to leave records.
ALTER TABLE "Leave"
ADD COLUMN "rejectionReason" TEXT;
