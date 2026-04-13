import { Pencil, Trash2 } from 'lucide-react';

import Button from '@/components/ui/Button';
import type { OrganizationEmployee } from '@/types/employee';

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
  return (
    <div className='min-h-0 flex-1 overflow-auto'>
      <table className='min-h-full w-full min-w-[940px] border-collapse text-left text-sm'>
        <thead className='sticky top-0 z-10'>
          <tr className='border-b border-gray-100 bg-gray-50/95 text-xs font-semibold uppercase tracking-wide text-gray-500 backdrop-blur-sm'>
              <th className='px-4 py-3 text-left'>Name</th>
              <th className='px-4 py-3 text-left'>Email</th>
              <th className='px-4 py-3 text-left'>Department</th>
              <th className='px-4 py-3 text-left'>Team</th>
              <th className='px-4 py-3 text-left'>Reporting manager</th>
              <th className='px-4 py-3 text-left'>Role</th>
              <th className='px-4 py-3 text-left'>Status</th>
              <th className='px-4 py-3 text-left'>Joined</th>
              <th className='px-4 py-3 text-right'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={9}
                  className='px-4 py-16 text-center align-middle text-sm text-gray-500 sm:py-24'
                >
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className='px-4 py-16 text-center align-middle text-sm text-gray-500 sm:py-24'
                >
                  No employees match your filters.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const dept = row.team?.department?.name ?? '—';
                const team = row.team?.name ?? '—';
                const statusLabel = row.onLeaveToday ? 'On leave' : 'Active';
                const statusClass = row.onLeaveToday
                  ? 'bg-amber-50 text-amber-800 ring-amber-200'
                  : 'bg-emerald-50 text-emerald-800 ring-emerald-200';
                return (
                  <tr
                    key={row.id}
                    className='border-b border-gray-50 transition-colors hover:bg-gray-50/60'
                  >
                    <td className='px-4 py-3 text-left align-top font-medium text-gray-900'>
                      {row.name}
                    </td>
                    <td className='max-w-[200px] truncate px-4 py-3 text-left align-top text-gray-600'>
                      {row.email}
                    </td>
                    <td className='px-4 py-3 text-left align-top text-gray-700'>
                      {dept}
                    </td>
                    <td className='px-4 py-3 text-left align-top text-gray-700'>
                      {team}
                    </td>
                    <td className='wrap-break-word px-4 py-3 text-left align-top text-gray-700'>
                      {row.reportingManager?.name ?? '—'}
                    </td>
                    <td className='whitespace-nowrap px-4 py-3 text-left align-top text-gray-700'>
                      {roleLabel(row.role)}
                    </td>
                    <td className='px-4 py-3 text-left align-top'>
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td className='whitespace-nowrap px-4 py-3 text-left align-top text-gray-700'>
                      {formatJoined(row.joiningDate ?? row.createdAt)}
                    </td>
                    <td className='px-4 py-3 text-right align-top'>
                      {isAdmin &&
                      onEditEmployee &&
                      onRequestDeleteEmployee ? (
                        <div className='flex shrink-0 justify-end gap-0.5'>
                          <Button
                            type='button'
                            variant='ghost'
                            aria-label={`Edit ${row.name}`}
                            onClick={() => onEditEmployee(row)}
                            className='!rounded-lg !p-2 text-gray-600 hover:!bg-gray-200'
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            aria-label={`Delete ${row.name}`}
                            disabled={row.id === currentUserId}
                            title={
                              row.id === currentUserId
                                ? 'You cannot delete your own account'
                                : undefined
                            }
                            onClick={() => onRequestDeleteEmployee(row)}
                            className='!rounded-lg !p-2 text-gray-600 hover:!bg-rose-50 hover:!text-rose-700'
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ) : (
                        <span className='text-xs text-gray-400'>—</span>
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
