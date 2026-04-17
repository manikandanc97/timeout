'use client';

import { TEAMS_PAGE_SIZE } from '@/components/teams/constants';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import api from '@/services/api';
import type { OrgDepartment } from '@/types/organization';
import { Building2, Plus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import DepartmentsPagination from './DepartmentsPagination';
import DepartmentsTable from './DepartmentsTable';

type Props = {
  departments: OrgDepartment[];
  loading: boolean;
  isAdmin: boolean;
  departmentFilter: string;
  onFilterByDepartment: (departmentId: string) => void;
  onEdit: (department: OrgDepartment) => void;
  onStructureChanged: () => void;
  onAddDepartment?: () => void;
};

export default function DepartmentsPanel({
  departments,
  loading,
  isAdmin,
  departmentFilter,
  onFilterByDepartment,
  onEdit,
  onStructureChanged,
  onAddDepartment,
}: Props) {
  const [deleteTarget, setDeleteTarget] = useState<OrgDepartment | null>(null);
  const [deleteProcessing, setDeleteProcessing] = useState(false);
  const [deptPage, setDeptPage] = useState(1);

  useEffect(() => {
    setDeptPage(1);
  }, [departments]);

  const deptPageCount = Math.max(
    1,
    Math.ceil(departments.length / TEAMS_PAGE_SIZE),
  );
  const safeDeptPage = Math.min(deptPage, deptPageCount);
  const departmentsSlice = useMemo(() => {
    const start = (safeDeptPage - 1) * TEAMS_PAGE_SIZE;
    return departments.slice(start, start + TEAMS_PAGE_SIZE);
  }, [departments, safeDeptPage]);

  const showDeptPagination = departments.length > TEAMS_PAGE_SIZE;

  function requestDelete(d: OrgDepartment) {
    if (d.teams.length > 0) {
      toast.error(
        'This department still has teams. Remove or move those teams first.',
      );
      return;
    }
    setDeleteTarget(d);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteProcessing(true);
    try {
      await api.delete(`/organization/departments/${deleteTarget.id}`);
      toast.success('Department deleted');
      onStructureChanged();
      setDeleteTarget(null);
    } catch (error) {
      const axiosLike = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosLike.response?.data?.message ?? 'Could not delete department',
      );
    } finally {
      setDeleteProcessing(false);
    }
  }

  return (
    <section
      aria-labelledby='departments-panel-heading'
      className='flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl border border-border bg-card/95 p-3 shadow-sm sm:p-4'
    >
      <div className='mb-3 flex shrink-0 flex-wrap items-start justify-between gap-2'>
        <div className='flex min-w-0 flex-1 items-start gap-2.5'>
          <div className='grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'>
            <Building2 size={18} strokeWidth={2} />
          </div>
          <div className='min-w-0'>
            <h2
              id='departments-panel-heading'
              className='text-sm font-bold text-card-foreground'
            >
              Departments
            </h2>
            <p className='text-xs text-muted-foreground'>
              Click department to filter.
            </p>
          </div>
        </div>
        {isAdmin && onAddDepartment ? (
          <Button
            type='button'
            variant='outline'
            onClick={onAddDepartment}
            aria-label='Add department'
            className='inline-flex h-9! w-9! shrink-0 items-center justify-center rounded-xl! p-0! shadow-sm [&>svg]:block [&>svg]:shrink-0'
          >
            <Plus size={18} strokeWidth={2.5} className='text-primary' />
          </Button>
        ) : null}
      </div>

      <DepartmentsTable
        loading={loading}
        isAdmin={isAdmin}
        departments={departments}
        departmentsSlice={departmentsSlice}
        departmentFilter={departmentFilter}
        onFilterByDepartment={onFilterByDepartment}
        onEdit={onEdit}
        onDelete={requestDelete}
      />

      {showDeptPagination ? (
        <DepartmentsPagination
          safeDeptPage={safeDeptPage}
          deptPageCount={deptPageCount}
          departmentsLength={departments.length}
          onPrev={() => setDeptPage((p) => Math.max(1, p - 1))}
          onNext={() => setDeptPage((p) => Math.min(deptPageCount, p + 1))}
        />
      ) : null}

      <ConfirmModal
        open={deleteTarget != null}
        title='Confirm delete'
        message={
          deleteTarget
            ? `Delete department "${deleteTarget.name}"? This cannot be undone.`
            : ''
        }
        cancelLabel='Cancel'
        confirmLabel='Delete'
        isProcessing={deleteProcessing}
        onCancel={() => {
          if (!deleteProcessing) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
