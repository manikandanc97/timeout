'use client';

import AddEmployeeModal from '@/components/employees/AddEmployeeModal';
import EmployeesFilterBar from '@/components/employees/EmployeesFilterBar';
import EmployeesNoAccess from '@/components/employees/EmployeesNoAccess';
import EmployeesPageHeader from '@/components/employees/EmployeesPageHeader';
import EmployeesPagination from '@/components/employees/EmployeesPagination';
import EmployeesSummaryCards from '@/components/employees/EmployeesSummaryCards';
import EmployeesTable from '@/components/employees/EmployeesTable';
import { useEmployeesDirectory } from '@/components/employees/useEmployeesDirectory';
import { useAuth } from '@/context/AuthContext';

export default function EmployeesPageClient() {
  const { user } = useAuth();
  const canView =
    user?.role === 'ADMIN' ||
    user?.role === 'MANAGER' ||
    user?.role === 'HR';
  const isAdmin = user?.role === 'ADMIN';

  const dir = useEmployeesDirectory(canView);

  if (!canView) {
    return <EmployeesNoAccess />;
  }

  return (
    <>
      <section className='relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-xl'>
        <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
        <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-100 blur-3xl' />

        <div className='relative z-10 flex min-h-0 flex-1 flex-col gap-3 p-4 sm:gap-4 sm:p-5'>
          <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-4'>
            <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-3'>
              <EmployeesPageHeader
                filteredCount={dir.filtered.length}
                totalCount={dir.employees.length}
                hasActiveFilters={dir.hasActiveFilters}
              />

              <section
                aria-labelledby='employees-heading'
                className='flex min-h-0 min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-sm sm:gap-3.5 sm:p-4'
              >
                <EmployeesFilterBar
                  searchTerm={dir.searchTerm}
                  onSearchChange={dir.setSearchTerm}
                  departmentFilter={dir.departmentFilter}
                  onDepartmentChange={dir.setDepartmentFilter}
                  teamFilter={dir.teamFilter}
                  onTeamChange={dir.setTeamFilter}
                  statusFilter={dir.statusFilter}
                  onStatusChange={dir.setStatusFilter}
                  departmentOptions={dir.departmentOptionsForFilter}
                  teamOptions={dir.teamOptionsForFilter}
                  hasActiveFilters={dir.hasActiveFilters}
                  onClearFilters={dir.clearFilters}
                  isAdmin={isAdmin}
                  onAddEmployee={() => dir.setAddOpen(true)}
                />

                <div className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-gray-50/40'>
                  <EmployeesTable
                    loading={dir.loadingList}
                    rows={dir.pageSlice}
                  />
                </div>

                <EmployeesPagination
                  visible={!dir.loadingList && dir.filtered.length > 0}
                  safePage={dir.safePage}
                  pageCount={dir.pageCount}
                  filteredLength={dir.filtered.length}
                  onPrev={() => dir.setPage((p) => Math.max(1, p - 1))}
                  onNext={() =>
                    dir.setPage((p) => Math.min(dir.pageCount, p + 1))
                  }
                />
              </section>
            </div>

            <EmployeesSummaryCards
              loading={dir.loadingList}
              summary={dir.summary}
            />
          </div>
        </div>
      </section>

      {isAdmin ? (
        <AddEmployeeModal
          open={dir.addOpen}
          onClose={() => dir.setAddOpen(false)}
          onCreated={() => void dir.loadEmployees()}
        />
      ) : null}
    </>
  );
}
