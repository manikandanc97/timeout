-- Align DB with Holiday model (no category/recurring). Safe if columns/type never existed.
ALTER TABLE "Holiday" DROP COLUMN IF EXISTS "category";
ALTER TABLE "Holiday" DROP COLUMN IF EXISTS "recurring";
DROP TYPE IF EXISTS "HolidayCategory";
