import Button from '@/components/ui/Button';
import type { OrgDepartment } from '@/types/organization';
import { Pencil, Trash2 } from 'lucide-react';

type Props = {
  loading: boolean;
  isAdmin: boolean;
  departments: OrgDepartment[];
  departmentsSlice: OrgDepartment[];
  departmentFilter: string;
  onFilterByDepartment: (departmentId: string) => void;
  onEdit: (department: OrgDepartment) => void;
  onDelete: (department: OrgDepartment) => void;
};

export default function DepartmentsTable({
  loading,
  isAdmin,
  departments,
  departmentsSlice,
  departmentFilter,
  onFilterByDepartment,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className='flex min-h-0 max-h-[min(56vh,32rem)] flex-1 flex-col overflow-y-auto overflow-x-hidden rounded-xl border border-border bg-muted/40 sm:max-h-[min(60vh,36rem)]'>
      <table className='w-full table-fixed border-collapse text-left text-sm'>
        <thead className='sticky top-0 z-10'>
          <tr className='border-b border-border bg-muted/95 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm'>
            <th className='min-w-0 px-2.5 py-2.5 text-left sm:px-3'>Department</th>
            {isAdmin ? <th className='w-22 px-2 py-2.5 text-right sm:w-24 sm:px-3'>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={isAdmin ? 2 : 1} className='px-3 py-16 text-center align-middle text-sm text-muted-foreground sm:py-20'>
                Loading departments…
              </td>
            </tr>
          ) : departments.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 2 : 1} className='px-3 py-16 text-center align-middle text-sm text-muted-foreground sm:py-20'>
                No departments yet.
                {isAdmin ? ' Use + to add one.' : null}
              </td>
            </tr>
          ) : (
            departmentsSlice.map((d) => {
              const activeFilter = departmentFilter === String(d.id);
              return (
                <tr key={d.id} className='border-b border-border/80 last:border-0'>
                  <td className='min-w-0 px-2.5 py-2.5 text-left align-top sm:px-3'>
                    <button
                      type='button'
                      onClick={() => onFilterByDepartment(String(d.id))}
                      className={`w-full min-w-0 text-left text-sm font-medium leading-snug wrap-break-word transition-colors hover:text-primary ${
                        activeFilter ? 'text-primary' : 'text-card-foreground'
                      }`}
                    >
                      <span className='block'>{d.name}</span>
                      {activeFilter ? <span className='mt-0.5 block text-xs font-normal text-primary'>(filtered)</span> : null}
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
                          className='rounded-lg! p-2! text-muted-foreground hover:bg-skeleton!'
                        >
                          <Pencil size={16} />
                        </Button>
                        <Button
                          type='button'
                          variant='ghost'
                          aria-label={`Delete ${d.name}`}
                          onClick={() => onDelete(d)}
                          className='rounded-lg! p-2! text-muted-foreground hover:bg-danger-muted! hover:text-danger-muted-foreground!'
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
  );
}
