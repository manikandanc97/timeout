-- Optional reporting manager (self-referential User)
ALTER TABLE "User" ADD COLUMN "reportingManagerId" INTEGER;

ALTER TABLE "User"
  ADD CONSTRAINT "User_reportingManagerId_fkey"
  FOREIGN KEY ("reportingManagerId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "User_reportingManagerId_idx" ON "User"("reportingManagerId");
