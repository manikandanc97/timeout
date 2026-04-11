'use client';

import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import api from '@/services/api';
import type { OrgDepartment } from '@/types/organization';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
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
      className='shrink-0 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-sm sm:p-4'
    >
      <div className='mb-3 flex flex-wrap items-start justify-between gap-2'>
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
              Click a department name to filter the teams table.{' '}
              {isAdmin
                ? 'Use edit or delete when the department has no teams.'
                : null}
            </p>
          </div>
        </div>
        {isAdmin && onAddDepartment ? (
          <Button
            type='button'
            variant='outline'
            onClick={onAddDepartment}
            aria-label='Add department'
            title='Add department'
            className='inline-flex !h-9 !w-9 shrink-0 items-center justify-center !rounded-xl !p-0 shadow-sm [&>svg]:block [&>svg]:shrink-0'
          >
            <Plus size={18} strokeWidth={2.5} className='text-primary' />
          </Button>
        ) : null}
      </div>

      <div className='overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/40'>
        <table className='w-full min-w-0 border-collapse text-left text-sm'>
          <thead>
            <tr className='border-b border-gray-100 bg-gray-50/95 text-xs font-semibold uppercase tracking-wide text-gray-500'>
              <th className='px-3 py-2.5'>Department</th>
              {isAdmin ? (
                <th className='px-3 py-2.5 text-right'>Actions</th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={isAdmin ? 2 : 1}
                  className='px-3 py-8 text-center text-gray-500'
                >
                  Loading departments…
                </td>
              </tr>
            ) : departments.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 2 : 1}
                  className='px-3 py-8 text-center text-gray-500'
                >
                  No departments yet.
                  {isAdmin ? ' Use + to add one.' : null}
                </td>
              </tr>
            ) : (
              departments.map((d) => {
                const activeFilter = departmentFilter === String(d.id);
                return (
                  <tr
                    key={d.id}
                    className='border-b border-gray-100/80 last:border-0'
                  >
                    <td className='px-3 py-2.5'>
                      <button
                        type='button'
                        onClick={() => onFilterByDepartment(String(d.id))}
                        className={`max-w-[220px] truncate text-left font-medium transition-colors hover:text-primary ${
                          activeFilter ? 'text-primary' : 'text-gray-800'
                        }`}
                      >
                        {d.name}
                        {activeFilter ? (
                          <span className='ml-1.5 text-xs font-normal text-primary'>
                            (filtered)
                          </span>
                        ) : null}
                      </button>
                    </td>
                    {isAdmin ? (
                      <td className='px-3 py-2.5 text-right'>
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
