import { Pencil, Trash2, Users } from 'lucide-react';

import Button from '@/components/ui/Button';
import { formatPersonName } from '@/lib/personName';
import type { OrganizationEmployee } from '@/types/employee';
import EmptyState from '@/components/common/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

import { formatJoined, roleLabel } from './utils';

type Props = {
  loading: boolean;
  rows: OrganizationEmployee[];
  isAdmin?: boolean;
  currentUserId?: number;
  onEditEmployee?: (row: OrganizationEmployee) => void;
  onRequestDeleteEmployee?: (row: OrganizationEmployee) => void;
};

export default function EmployeesTable({
  loading,
  rows,
  isAdmin = false,
  currentUserId,
  onEditEmployee,
  onRequestDeleteEmployee,
}: Props) {
  const skeletonRows = Array.from({ length: 10 }, (_, index) => index);

  return (
    <div className='w-full min-w-0 overflow-x-auto'>
      <table className='w-full min-w-[940px] border-collapse text-left text-sm'>
        <thead className='sticky top-0 z-10'>
          <tr className='border-b border-border bg-muted/95 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm'>
              <th className='px-4 py-3.5 text-left'>Name</th>
              <th className='px-4 py-3.5 text-left'>Email</th>
              <th className='px-4 py-3.5 text-left'>Department</th>
              <th className='px-4 py-3.5 text-left'>Team</th>
              <th className='px-4 py-3.5 text-left'>Reporting manager</th>
              <th className='px-4 py-3.5 text-left'>Designation</th>
              <th className='px-4 py-3.5 text-left'>Status</th>
              <th className='px-4 py-3.5 text-left'>Joined</th>
              <th className='px-4 py-3.5 text-right'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              skeletonRows.map((rowIndex) => (
                <tr
                  key={`employee-skeleton-${rowIndex}`}
                  className='border-b border-border bg-card/90'
                >
                  <td className='px-4 py-2 align-top'>
                    <div className='flex items-center gap-3'>
                      <Skeleton className='h-9 w-9 shrink-0 rounded-full' />
                      <div className='space-y-1.5'>
                        <Skeleton className='h-3.5 w-28' />
                        <Skeleton className='h-2.5 w-18' />
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-2 align-top'>
                    <Skeleton className='h-3.5 w-40' />
                  </td>
                  <td className='px-4 py-2 align-top'>
                    <Skeleton className='h-3.5 w-24' />
                  </td>
                  <td className='px-4 py-2 align-top'>
                    <Skeleton className='h-3.5 w-20' />
                  </td>
                  <td className='px-4 py-2 align-top'>
                    <Skeleton className='h-3.5 w-28' />
                  </td>
                  <td className='px-4 py-2 align-top'>
                    <Skeleton className='h-3.5 w-22' />
                  </td>
                  <td className='px-4 py-2 align-top'>
                    <Skeleton className='h-6 w-18 rounded-md' />
                  </td>
                  <td className='px-4 py-2 align-top'>
                    <Skeleton className='h-3.5 w-18' />
                  </td>
                  <td className='px-4 py-2 text-right align-top'>
                    <div className='flex shrink-0 justify-end gap-0.5'>
                      <Skeleton className='h-8 w-8 rounded-lg' />
                      <Skeleton className='h-8 w-8 rounded-lg' />
                    </div>
                  </td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={9} className='p-8'>
                  <EmptyState
                    icon={Users}
                    title='No employees found'
                    description="We couldn't find any employees matching your current filters or search query."
                  />
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const dept = row.team?.department?.name ?? '—';
                const team = row.team?.name ?? '—';
                const isDeactivated = row.isActive === false;
                const statusLabel = isDeactivated
                  ? 'Deactivated'
                  : row.onLeaveToday
                    ? 'On leave'
                    : 'Active';
                const statusClass = isDeactivated
                  ? 'bg-muted text-muted-foreground ring-border'
                  : row.onLeaveToday
                    ? 'bg-warning-muted text-warning-muted-foreground ring-warning-muted-foreground/35'
                    : 'bg-success-muted text-success-muted-foreground ring-success-muted-foreground/30';
                return (
                  <tr
                    key={row.id}
                    className='border-b border-border transition-colors hover:bg-muted/60'
                  >
                    <td className='px-4 py-2 text-left align-top font-medium text-card-foreground'>
                      {formatPersonName(row.name) || '—'}
                    </td>
                    <td className='max-w-[200px] truncate px-4 py-2 text-left align-top text-muted-foreground'>
                      {row.email}
                    </td>
                    <td className='px-4 py-2 text-left align-top text-card-foreground/90'>
                      {dept}
                    </td>
                    <td className='px-4 py-2 text-left align-top text-card-foreground/90'>
                      {team}
                    </td>
                    <td className='wrap-break-word px-4 py-2 text-left align-top text-card-foreground/90'>
                      {formatPersonName(row.reportingManager?.name) || '—'}
                    </td>
                    <td className='whitespace-nowrap px-4 py-2 text-left align-top text-card-foreground/90'>
                      {row.designation?.trim() || roleLabel(row.role)}
                    </td>
                    <td className='px-4 py-2 text-left align-top'>
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td className='whitespace-nowrap px-4 py-2 text-left align-top text-card-foreground/90'>
                      {formatJoined(row.joiningDate ?? row.createdAt)}
                    </td>
                    <td className='px-4 py-2 text-right align-top'>
                      {isAdmin && onEditEmployee && onRequestDeleteEmployee ? (
                        <div className='flex shrink-0 justify-end gap-0.5'>
                          <Button
                            type='button'
                            variant='ghost'
                            aria-label={`Edit ${formatPersonName(row.name) || 'employee'}`}
                            onClick={() => onEditEmployee(row)}
                            className='rounded-lg! p-2! text-muted-foreground hover:bg-muted!'
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            aria-label={`Delete ${formatPersonName(row.name) || 'employee'}`}
                            disabled={row.id === currentUserId}
                            onClick={() => onRequestDeleteEmployee(row)}
                            className='rounded-lg! p-2! text-muted-foreground hover:bg-danger-muted! hover:text-danger-muted-foreground!'
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ) : (
                        <span className='text-xs text-muted-foreground'>—</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
      </table>
    </div>
  );
}
