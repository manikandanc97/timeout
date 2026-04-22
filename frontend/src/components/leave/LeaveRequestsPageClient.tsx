'use client';

import LeaveRequestsFilterBar from '@/components/leave/LeaveRequestsFilterBar';
import LeaveRequestsPageHeader from '@/components/leave/LeaveRequestsPageHeader';
import LeaveRequestsPagination from '@/components/leave/LeaveRequestsPagination';
import RequestCategoryTabs from '@/components/leave/RequestCategoryTabs';
import LeaveRequestsSummaryCards from '@/components/leave/LeaveRequestsSummaryCards';
import LeaveRequestsTable from '@/components/leave/LeaveRequestsTable';
import OtherRequestsSection from '@/components/leave/OtherRequestsSection';
import { useLeaveRequestsPage } from '@/components/leave/useLeaveRequestsPage';
import { useOtherLeaveRequests } from '@/components/leave/useOtherLeaveRequests';
import type { Holiday } from '@/types/holiday';
import type {
  CompOffRequestWithEmployee,
  LeaveWithEmployee,
  PermissionRequestWithEmployee,
} from '@/types/leave';
import type { RegularizationRequest } from '@/types/attendance';
import { subscribeDashboardRefresh } from '@/lib/dashboardRealtimeBus';
import { useCallback, useEffect } from 'react';

type Props = {
  initialLeaves: LeaveWithEmployee[];
  initialPermissionRequests: PermissionRequestWithEmployee[];
  initialCompOffRequests: CompOffRequestWithEmployee[];
  initialRegularizationRequests: RegularizationRequest[];
  holidays: Holiday[];
  canModerate: boolean;
};

export default function LeaveRequestsPageClient({
  initialLeaves,
  initialPermissionRequests,
  initialCompOffRequests,
  initialRegularizationRequests,
  holidays,
  canModerate,
}: Props) {
  const req = useLeaveRequestsPage({ initialLeaves });
  const { refetchLeaves } = req;
  const other = useOtherLeaveRequests({
    initialPermissionRequests,
    initialCompOffRequests,
    initialRegularizationRequests,
  });
  const { refetchOtherFeeds } = other;

  const refetchAllRequestFeeds = useCallback(async () => {
    await refetchLeaves();
    await refetchOtherFeeds();
  }, [refetchLeaves, refetchOtherFeeds]);

  useEffect(() => {
    return subscribeDashboardRefresh('leaveRequestsPage', () => {
      void refetchAllRequestFeeds();
    });
  }, [refetchAllRequestFeeds]);
  const tabSummary =
    other.activeTab === 'LEAVE'
      ? req.summary
      : other.activeTab === 'PERMISSION'
        ? other.permissionSummary
        : other.activeTab === 'COMP_OFF'
          ? other.compOffSummary
          : other.regularizationSummary;

  return (
    <section className='relative isolate flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl'>
      <div className='pointer-events-none absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/8 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl' />

      <div className='relative z-10 flex flex-col gap-3 p-4 sm:gap-4 sm:p-5'>
        <div className='flex min-w-0 flex-col gap-3'>
          <LeaveRequestsPageHeader
            filteredCount={req.filtered.length}
            totalCount={req.rows.length}
            hasActiveFilters={req.hasActiveFilters}
          />

          <LeaveRequestsSummaryCards summary={tabSummary} />

          <section
            aria-labelledby='requests-heading'
            className='flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-muted/25 p-3 shadow-sm sm:gap-3.5 sm:p-4'
          >
              <RequestCategoryTabs activeTab={other.activeTab} onTabChange={other.setActiveTab} />

              {other.activeTab === 'LEAVE' ? (
                <>
                  <LeaveRequestsFilterBar
                    searchTerm={req.searchTerm}
                    onSearchChange={req.setSearchTerm}
                    statusFilter={req.statusFilter}
                    onStatusChange={req.setStatusFilter}
                    typeFilter={req.typeFilter}
                    onTypeChange={req.setTypeFilter}
                    dateFrom={req.dateFrom}
                    onDateFromChange={req.setDateFrom}
                    dateTo={req.dateTo}
                    onDateToChange={req.setDateTo}
                    hasActiveFilters={req.hasActiveFilters}
                    onClearFilters={req.clearFilters}
                  />

                  <div className='flex min-h-124 w-full min-w-0 flex-col overflow-x-auto rounded-xl border border-border bg-muted/35'>
                    <LeaveRequestsTable
                      rows={req.pageSlice}
                      holidays={holidays}
                      canModerate={canModerate}
                      busyId={req.busyId}
                      onApproveReject={req.approveOrReject}
                    />
                  </div>

                  <LeaveRequestsPagination
                    visible={req.filtered.length > req.pageSize}
                    safePage={req.safePage}
                    pageCount={req.pageCount}
                    filteredLength={req.filtered.length}
                    pageSize={req.pageSize}
                    onPrev={() => req.setPage((p) => Math.max(1, p - 1))}
                    onNext={() =>
                      req.setPage((p) => Math.min(req.pageCount, p + 1))
                    }
                  />
                </>
              ) : (
                <OtherRequestsSection
                  activeTab={other.activeTab === 'PERMISSION' ? 'PERMISSION' : other.activeTab === 'COMP_OFF' ? 'COMP_OFF' : 'REGULARIZATION'}
                  canModerate={canModerate}
                  otherSearch={other.otherSearch}
                  otherDateFrom={other.otherDateFrom}
                  otherDateTo={other.otherDateTo}
                  hasOtherFilters={other.hasOtherFilters}
                  otherSlice={other.otherSlice}
                  otherFilteredLength={other.otherFilteredLength}
                  otherPageCount={other.otherPageCount}
                  safeOtherPage={other.safeOtherPage}
                  otherBusyKey={other.otherBusyKey}
                  setOtherSearch={other.setOtherSearch}
                  setOtherDateFrom={other.setOtherDateFrom}
                  setOtherDateTo={other.setOtherDateTo}
                  setOtherPage={other.setOtherPage}
                  clearOtherFilters={other.clearOtherFilters}
                  updatePermissionStatus={other.updatePermissionStatus}
                  updateCompOffStatus={other.updateCompOffStatus}
                  updateRegularizationStatus={other.updateRegularizationStatus}
                />
              )}
            </section>
        </div>
      </div>
    </section>
  );
}
