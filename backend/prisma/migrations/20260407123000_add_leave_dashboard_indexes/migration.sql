-- CreateIndex
CREATE INDEX "Leave_userId_status_idx" ON "Leave"("userId", "status");

-- CreateIndex
CREATE INDEX "Leave_userId_fromDate_idx" ON "Leave"("userId", "fromDate");

-- CreateIndex
CREATE INDEX "Leave_status_idx" ON "Leave"("status");

-- CreateIndex
CREATE INDEX "Leave_fromDate_idx" ON "Leave"("fromDate");
