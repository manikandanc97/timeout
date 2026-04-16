'use client';

import CommonPageShell from '@/components/common/CommonPageShell';
import DepartmentsPanel from '@/components/teams/DepartmentsPanel';
import TeamsFilterBar from '@/components/teams/TeamsFilterBar';
import TeamsNoAccess from '@/components/teams/TeamsNoAccess';
import TeamsPageHeader from '@/components/teams/TeamsPageHeader';
import { TEAMS_PAGE_SIZE } from '@/components/teams/constants';
import TeamsPagination from '@/components/teams/TeamsPagination';
import TeamsSummaryCards from '@/components/teams/TeamsSummaryCards';
import TeamsTable from '@/components/teams/TeamsTable';
import { useTeamsDirectory } from '@/components/teams/useTeamsDirectory';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import type { OrgDepartment } from '@/types/organization';
import type { OrganizationTeamRow } from '@/types/organizationTeam';
import { getApiErrorMessage } from '@/utils/apiError';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import toast from 'react-hot-toast';

const AddDepartmentModal = dynamic(
  () => import('@/components/teams/AddDepartmentModal'),
);
const EditDepartmentModal = dynamic(
  () => import('@/components/teams/EditDepartmentModal'),
);
const AddTeamModal = dynamic(() => import('@/components/teams/AddTeamModal'));
const EditTeamModal = dynamic(() => import('@/components/teams/EditTeamModal'));

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
  const [teamToEdit, setTeamToEdit] = useState<OrganizationTeamRow | null>(
    null,
  );
  const [teamToDelete, setTeamToDelete] = useState<OrganizationTeamRow | null>(
    null,
  );
  const [teamDeleteProcessing, setTeamDeleteProcessing] = useState(false);

  if (!canView) {
    return <TeamsNoAccess />;
  }

  return (
    <>
      <CommonPageShell className='min-h-0 flex-1' bodyClassName='min-h-0 flex-1 gap-3 p-4 sm:gap-4 sm:p-5'>
          <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-4'>
            <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-3'>
              <TeamsPageHeader
                filteredCount={dir.filtered.length}
                totalCount={dir.teams.length}
                hasActiveFilters={dir.hasActiveFilters}
              />

              <section
                aria-labelledby='teams-heading'
                className='flex min-h-0 min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-border bg-muted/25 p-3 shadow-sm sm:gap-3.5 sm:p-4'
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

                <div className='flex min-h-0 max-h-[min(56vh,32rem)] flex-1 flex-col overflow-hidden rounded-xl border border-border bg-muted/35 sm:max-h-[min(60vh,36rem)]'>
                  <TeamsTable
                    loading={dir.loadingList}
                    rows={dir.pageSlice}
                    isAdmin={isAdmin}
                    onEditTeam={
                      isAdmin ? (row) => setTeamToEdit(row) : undefined
                    }
                    onRequestDeleteTeam={
                      isAdmin ? (row) => setTeamToDelete(row) : undefined
                    }
                  />
                </div>

                <TeamsPagination
                  visible={
                    !dir.loadingList && dir.filtered.length > TEAMS_PAGE_SIZE
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

            <aside
              aria-label='Teams summary and departments'
              className='flex w-full min-h-0 shrink-0 flex-col gap-3 lg:min-h-0 lg:min-w-[20rem] lg:w-80 xl:min-w-[22rem] xl:w-[22rem]'
            >
              <TeamsSummaryCards
                loading={dir.loadingList}
                summary={dir.summary}
              />
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
            </aside>
          </div>
      </CommonPageShell>

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
          <EditTeamModal
            open={teamToEdit != null}
            team={teamToEdit}
            onClose={() => setTeamToEdit(null)}
            departments={dir.departments}
            onSaved={() => {
              void dir.loadStructure();
              void dir.loadTeams();
            }}
          />
          <ConfirmModal
            open={teamToDelete != null}
            title='Delete team'
            message={
              teamToDelete
                ? `Delete team “${teamToDelete.name}”? This cannot be undone.`
                : ''
            }
            cancelLabel='Cancel'
            confirmLabel='Delete'
            isProcessing={teamDeleteProcessing}
            onCancel={() => {
              if (!teamDeleteProcessing) setTeamToDelete(null);
            }}
            onConfirm={async () => {
              if (!teamToDelete || teamToDelete.employeeCount > 0) return;
              setTeamDeleteProcessing(true);
              try {
                await api.delete(`/organization/teams/${teamToDelete.id}`);
                toast.success('Team deleted');
                setTeamToDelete(null);
                void dir.loadStructure();
                void dir.loadTeams();
              } catch (error: unknown) {
                toast.error(getApiErrorMessage(error, 'Could not delete team'));
              } finally {
                setTeamDeleteProcessing(false);
              }
            }}
          />
        </>
      ) : null}
    </>
  );
}
