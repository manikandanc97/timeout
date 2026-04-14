'use client';

import AddEmployeeModal from '@/components/employees/AddEmployeeModal';
import EditEmployeeModal from '@/components/employees/EditEmployeeModal';
import { EMPLOYEES_PAGE_SIZE } from '@/components/employees/constants';
import EmployeesFilterBar from '@/components/employees/EmployeesFilterBar';
import EmployeesNoAccess from '@/components/employees/EmployeesNoAccess';
import EmployeesPageHeader from '@/components/employees/EmployeesPageHeader';
import EmployeesPagination from '@/components/employees/EmployeesPagination';
import EmployeesSummaryCards from '@/components/employees/EmployeesSummaryCards';
import EmployeesTable from '@/components/employees/EmployeesTable';
import { useEmployeesDirectory } from '@/components/employees/useEmployeesDirectory';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import type { OrganizationEmployee } from '@/types/employee';
import { useState } from 'react';
import { toast } from 'sonner';

export default function EmployeesPageClient() {
  const { user } = useAuth();
  const canView =
    user?.role === 'ADMIN' ||
    user?.role === 'MANAGER' ||
    user?.role === 'HR';
  const isAdmin = user?.role === 'ADMIN';

  const dir = useEmployeesDirectory(canView);

  const [employeeToEdit, setEmployeeToEdit] =
    useState<OrganizationEmployee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] =
    useState<OrganizationEmployee | null>(null);
  const [employeeDeleteProcessing, setEmployeeDeleteProcessing] =
    useState(false);

  if (!canView) {
    return <EmployeesNoAccess />;
  }

  return (
    <>
      <section className='relative isolate flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-xl'>
        <div className='pointer-events-none absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/8 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl' />

        <div className='relative z-10 flex flex-col gap-3 p-4 sm:gap-4 sm:p-5'>
          <div className='flex min-w-0 flex-col gap-3'>
            <EmployeesPageHeader
              filteredCount={dir.filtered.length}
              totalCount={dir.employees.length}
              hasActiveFilters={dir.hasActiveFilters}
            />

            <EmployeesSummaryCards
              loading={dir.loadingList}
              summary={dir.summary}
            />

            <section
              aria-labelledby='employees-heading'
              className='flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-muted/25 p-3 shadow-sm sm:gap-3.5 sm:p-4'
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

              <div className='flex min-h-124 w-full min-w-0 flex-col overflow-x-auto rounded-xl border border-border bg-muted/35'>
                <EmployeesTable
                  loading={dir.loadingList}
                  rows={dir.pageSlice}
                  isAdmin={isAdmin}
                  currentUserId={user?.id}
                  onEditEmployee={
                    isAdmin ? (row) => setEmployeeToEdit(row) : undefined
                  }
                  onRequestDeleteEmployee={
                    isAdmin ? (row) => setEmployeeToDelete(row) : undefined
                  }
                />
              </div>

              <EmployeesPagination
                visible={
                  !dir.loadingList &&
                  dir.filtered.length > EMPLOYEES_PAGE_SIZE
                }
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
        </div>
      </section>

      {isAdmin ? (
        <AddEmployeeModal
          open={dir.addOpen}
          onClose={() => dir.setAddOpen(false)}
          onCreated={() => void dir.loadEmployees()}
        />
      ) : null}

      {isAdmin ? (
        <EditEmployeeModal
          open={employeeToEdit != null}
          employee={employeeToEdit}
          departments={dir.departments}
          onClose={() => setEmployeeToEdit(null)}
          onSaved={() => void dir.loadEmployees()}
        />
      ) : null}

      {isAdmin ? (
        <ConfirmModal
          open={employeeToDelete != null}
          title='Delete employee'
          message={
            employeeToDelete
              ? `Remove “${employeeToDelete.name}” from the organization? This cannot be undone.`
              : ''
          }
          confirmLabel='Delete'
          onCancel={() => {
            if (!employeeDeleteProcessing) setEmployeeToDelete(null);
          }}
          isProcessing={employeeDeleteProcessing}
          onConfirm={async () => {
            if (!employeeToDelete || employeeDeleteProcessing) return;
            if (employeeToDelete.id === user?.id) {
              toast.error('You cannot delete your own account');
              setEmployeeToDelete(null);
              return;
            }
            setEmployeeDeleteProcessing(true);
            try {
              await api.delete(
                `/organization/employees/${employeeToDelete.id}`,
              );
              toast.success('Employee removed');
              setEmployeeToDelete(null);
              void dir.loadEmployees();
            } catch (err: unknown) {
              const msg =
                (err as { response?: { data?: { message?: string } } })
                  ?.response?.data?.message ?? 'Could not delete employee';
              toast.error(msg);
            } finally {
              setEmployeeDeleteProcessing(false);
            }
          }}
        />
      ) : null}
    </>
  );
}
