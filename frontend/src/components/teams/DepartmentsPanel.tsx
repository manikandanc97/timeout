'use client';

import { TEAMS_PAGE_SIZE } from '@/components/teams/constants';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import api from '@/services/api';
import type { OrgDepartment } from '@/types/organization';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

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
      className='flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-sm sm:p-4'
    >
      <div className='mb-3 flex shrink-0 flex-wrap items-start justify-between gap-2'>
        <div className='flex min-w-0 flex-1 items-start gap-2.5'>
          <div className='grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary'>
            <Building2 size={18} strokeWidth={2} />
          </div>
          <div className='min-w-0'>
            <h2
              id='departments-panel-heading'
              className='text-sm font-bold text-gray-900'
            >
              Departments
            </h2>
            <p className='text-xs text-gray-500'>
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
            className='inline-flex !h-9 !w-9 shrink-0 items-center justify-center !rounded-xl !p-0 shadow-sm [&>svg]:block [&>svg]:shrink-0'
          >
            <Plus size={18} strokeWidth={2.5} className='text-primary' />
          </Button>
        ) : null}
      </div>

      <div className='flex min-h-0 max-h-[min(56vh,32rem)] flex-1 flex-col overflow-y-auto overflow-x-hidden rounded-xl border border-gray-100 bg-gray-50/40 sm:max-h-[min(60vh,36rem)]'>
        <table className='w-full table-fixed border-collapse text-left text-sm'>
          <thead className='sticky top-0 z-10'>
            <tr className='border-b border-gray-100 bg-gray-50/95 text-xs font-semibold uppercase tracking-wide text-gray-500 backdrop-blur-sm'>
              <th className='min-w-0 px-2.5 py-2.5 text-left sm:px-3'>
                Department
              </th>
              {isAdmin ? (
                <th className='w-[5.5rem] px-2 py-2.5 text-right sm:w-24 sm:px-3'>
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={isAdmin ? 2 : 1}
                  className='px-3 py-16 text-center align-middle text-sm text-gray-500 sm:py-20'
                >
                  Loading departments…
                </td>
              </tr>
            ) : departments.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 2 : 1}
                  className='px-3 py-16 text-center align-middle text-sm text-gray-500 sm:py-20'
                >
                  No departments yet.
                  {isAdmin ? ' Use + to add one.' : null}
                </td>
              </tr>
            ) : (
              departmentsSlice.map((d) => {
                const activeFilter = departmentFilter === String(d.id);
                return (
                  <tr
                    key={d.id}
                    className='border-b border-gray-100/80 last:border-0'
                  >
                    <td className='min-w-0 px-2.5 py-2.5 text-left align-top sm:px-3'>
                      <button
                        type='button'
                        onClick={() => onFilterByDepartment(String(d.id))}
                        className={`w-full min-w-0 text-left text-sm font-medium leading-snug wrap-break-word transition-colors hover:text-primary ${
                          activeFilter ? 'text-primary' : 'text-gray-800'
                        }`}
                      >
                        <span className='block'>{d.name}</span>
                        {activeFilter ? (
                          <span className='mt-0.5 block text-xs font-normal text-primary'>
                            (filtered)
                          </span>
                        ) : null}
                      </button>
                    </td>
                    {isAdmin ? (
                      <td className='whitespace-nowrap px-2 py-2.5 text-right align-top sm:px-3'>
                        <div className='flex justify-end gap-1'>
                          <Button
                            type='button'
                            variant='ghost'
                            aria-label={`Edit ${d.name}`}
                            onClick={() => onEdit(d)}
                            className='!rounded-lg !p-2 text-gray-600 hover:!bg-gray-200'
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            aria-label={`Delete ${d.name}`}
                            onClick={() => requestDelete(d)}
                            className='!rounded-lg !p-2 text-gray-600 hover:!bg-rose-50 hover:!text-rose-700'
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showDeptPagination ? (
        <div className='mt-2 flex shrink-0 flex-col items-stretch justify-between gap-2 border-t border-gray-100 pt-2 sm:flex-row sm:items-center'>
          <p className='text-[11px] text-gray-500'>
            Showing{' '}
            <span className='font-semibold text-gray-700'>
              {(safeDeptPage - 1) * TEAMS_PAGE_SIZE + 1}
            </span>
            –
            <span className='font-semibold text-gray-700'>
              {Math.min(safeDeptPage * TEAMS_PAGE_SIZE, departments.length)}
            </span>{' '}
            of{' '}
            <span className='font-semibold text-gray-700'>
              {departments.length}
            </span>
          </p>
          <div className='flex items-center justify-center gap-1.5 sm:justify-end'>
            <button
              type='button'
              disabled={safeDeptPage <= 1}
              onClick={() => setDeptPage((p) => Math.max(1, p - 1))}
              className='inline-flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'
            >
              <ChevronLeft size={12} />
              Prev
            </button>
            <span className='text-[11px] font-medium text-gray-600'>
              {safeDeptPage} / {deptPageCount}
            </span>
            <button
              type='button'
              disabled={safeDeptPage >= deptPageCount}
              onClick={() =>
                setDeptPage((p) => Math.min(deptPageCount, p + 1))
              }
              className='inline-flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'
            >
              Next
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
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
