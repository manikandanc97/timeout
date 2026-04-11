'use client';

import AddDepartmentModal from '@/components/teams/AddDepartmentModal';
import AddTeamModal from '@/components/teams/AddTeamModal';
import DepartmentsPanel from '@/components/teams/DepartmentsPanel';
import EditDepartmentModal from '@/components/teams/EditDepartmentModal';
import TeamsFilterBar from '@/components/teams/TeamsFilterBar';
import TeamsNoAccess from '@/components/teams/TeamsNoAccess';
import TeamsPageHeader from '@/components/teams/TeamsPageHeader';
import TeamsPagination from '@/components/teams/TeamsPagination';
import TeamsSummaryCards from '@/components/teams/TeamsSummaryCards';
import TeamsTable from '@/components/teams/TeamsTable';
import { useTeamsDirectory } from '@/components/teams/useTeamsDirectory';
import { useAuth } from '@/context/AuthContext';
import type { OrgDepartment } from '@/types/organization';
import { useState } from 'react';

export default function TeamPageClient() {
  const { user } = useAuth();
  const canView =
    user?.role === 'ADMIN' ||
    user?.role === 'MANAGER' ||
    user?.role === 'HR';
  const isAdmin = user?.role === 'ADMIN';

  const dir = useTeamsDirectory(canView);
  const [departmentToEdit, setDepartmentToEdit] = useState<OrgDepartment | null>(
    null,
  );

  if (!canView) {
    return <TeamsNoAccess />;
  }

  return (
    <>
      <section className='relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-xl'>
        <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
        <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-100 blur-3xl' />

        <div className='relative z-10 flex min-h-0 flex-1 flex-col gap-3 p-4 sm:gap-4 sm:p-5'>
          <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-4'>
            <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-3'>
              <TeamsPageHeader
                filteredCount={dir.filtered.length}
                totalCount={dir.teams.length}
                hasActiveFilters={dir.hasActiveFilters}
              />

              <div className='grid min-h-0 flex-1 grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,320px)_1fr] lg:items-stretch lg:gap-4'>
                <div className='flex min-h-0 min-w-0 flex-col'>
                  <DepartmentsPanel
                    departments={dir.departments}
                    loading={dir.structureLoading}
                    isAdmin={isAdmin}
                    departmentFilter={dir.departmentFilter}
                    onFilterByDepartment={dir.setDepartmentFilter}
                    onEdit={(d) => setDepartmentToEdit(d)}
                    onStructureChanged={() => {
                      void dir.loadStructure();
                      void dir.loadTeams();
                    }}
                    onAddDepartment={
                      isAdmin
                        ? () => dir.setAddDepartmentOpen(true)
                        : undefined
                    }
                  />
                </div>

                <section
                  aria-labelledby='teams-heading'
                  className='flex min-h-0 min-w-0 flex-col gap-3 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-sm sm:gap-3.5 sm:p-4'
                >
                  <TeamsFilterBar
                    searchTerm={dir.searchTerm}
                    onSearchChange={dir.setSearchTerm}
                    departmentFilter={dir.departmentFilter}
                    onDepartmentChange={dir.setDepartmentFilter}
                    departmentOptions={dir.departmentOptionsForFilter}
                    hasActiveFilters={dir.hasActiveFilters}
                    onClearFilters={dir.clearFilters}
                    isAdmin={isAdmin}
                    onAddTeam={() => dir.setAddOpen(true)}
                  />

                  <div className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-gray-50/40'>
                    <TeamsTable
                      loading={dir.loadingList}
                      rows={dir.pageSlice}
                    />
                  </div>

                  <TeamsPagination
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
            </div>

            <TeamsSummaryCards
              loading={dir.loadingList}
              summary={dir.summary}
            />
          </div>
        </div>
      </section>

      {isAdmin ? (
        <>
          <AddDepartmentModal
            open={dir.addDepartmentOpen}
            onClose={() => dir.setAddDepartmentOpen(false)}
            onCreated={() => {
              void dir.loadStructure();
              void dir.loadTeams();
            }}
          />
          <EditDepartmentModal
            open={departmentToEdit != null}
            department={departmentToEdit}
            onClose={() => setDepartmentToEdit(null)}
            onSaved={() => {
              void dir.loadStructure();
              void dir.loadTeams();
            }}
          />
          <AddTeamModal
            open={dir.addOpen}
            onClose={() => dir.setAddOpen(false)}
            departments={dir.departments}
            onCreated={() => {
              void dir.loadStructure();
              void dir.loadTeams();
            }}
          />
        </>
      ) : null}
    </>
  );
}
