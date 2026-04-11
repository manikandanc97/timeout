'use client';

import LeaveRequestsFilterBar from '@/components/leave/LeaveRequestsFilterBar';
import LeaveRequestsPageHeader from '@/components/leave/LeaveRequestsPageHeader';
import LeaveRequestsPagination from '@/components/leave/LeaveRequestsPagination';
import LeaveRequestsSummaryCards from '@/components/leave/LeaveRequestsSummaryCards';
import LeaveRequestsTable from '@/components/leave/LeaveRequestsTable';
import { useLeaveRequestsPage } from '@/components/leave/useLeaveRequestsPage';
import type { LeaveWithEmployee } from '@/types/leave';

type Props = {
  initialLeaves: LeaveWithEmployee[];
  canModerate: boolean;
};

export default function LeaveRequestsPageClient({
  initialLeaves,
  canModerate,
}: Props) {
  const req = useLeaveRequestsPage({ initialLeaves });

  return (
    <section className='relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-xl'>
      <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-100 blur-3xl' />

      <div className='relative z-10 flex min-h-0 flex-1 flex-col gap-3 p-4 sm:gap-4 sm:p-5'>
        <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-4'>
          <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-3'>
            <LeaveRequestsPageHeader
              filteredCount={req.filtered.length}
              totalCount={req.rows.length}
              hasActiveFilters={req.hasActiveFilters}
            />

            <section
              aria-labelledby='leave-requests-heading'
              className='flex min-h-0 min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-sm sm:gap-3.5 sm:p-4'
            >
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

              <div className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-gray-50/40'>
                <LeaveRequestsTable
                  rows={req.pageSlice}
                  canModerate={canModerate}
                  busyId={req.busyId}
                  onApproveReject={req.approveOrReject}
                />
              </div>

              <LeaveRequestsPagination
                visible={req.filtered.length > 0}
                safePage={req.safePage}
                pageCount={req.pageCount}
                filteredLength={req.filtered.length}
                pageSize={req.pageSize}
                onPrev={() => req.setPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  req.setPage((p) => Math.min(req.pageCount, p + 1))
                }
              />
            </section>
          </div>

          <LeaveRequestsSummaryCards summary={req.summary} />
        </div>
      </div>
    </section>
  );
}
