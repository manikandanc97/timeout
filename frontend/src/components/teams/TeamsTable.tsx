import { Mail, Pencil, Trash2 } from 'lucide-react';

import Button from '@/components/ui/Button';
import type { OrganizationTeamRow } from '@/types/organizationTeam';

const SKELETON_ROWS = 6;

/** Pulse bars aligned to real column widths so loading matches the teams table layout. */
export function TeamsTableSkeletonBody() {
  const bar = (className: string) => (
    <div
      className={`animate-pulse rounded-md bg-gray-200/90 ${className}`}
      aria-hidden
    />
  );

  return (
    <>
      {Array.from({ length: SKELETON_ROWS }, (_, i) => {
        const w = (a: string, b: string, c: string) =>
          [a, b, c][i % 3] as string;
        return (
          <tr key={i} className='border-b border-gray-50' aria-hidden>
            <td className='px-4 py-3 align-middle'>
              {bar(`h-4 ${w('w-36', 'w-44', 'w-32')} max-w-full`)}
            </td>
            <td className='px-4 py-3 align-middle'>
              {bar(`h-4 ${w('w-28', 'w-32', 'w-24')}`)}
            </td>
            <td className='px-4 py-3 align-middle'>
              {bar(`h-4 ${w('w-32', 'w-40', 'w-28')}`)}
            </td>
            <td className='px-4 py-3 align-middle'>
              {bar(`h-4 ${w('w-7', 'w-8', 'w-6')}`)}
            </td>
            <td className='px-4 py-3 text-right align-middle'>
              <div className='flex justify-end'>
                {bar(`h-8 ${w('w-24', 'w-28', 'w-24')} rounded-lg`)}
              </div>
            </td>
          </tr>
        );
      })}
    </>
  );
}

type Props = {
  loading: boolean;
  rows: OrganizationTeamRow[];
  isAdmin?: boolean;
  onEditTeam?: (row: OrganizationTeamRow) => void;
  onRequestDeleteTeam?: (row: OrganizationTeamRow) => void;
};

export default function TeamsTable({
  loading,
  rows,
  isAdmin = false,
  onEditTeam,
  onRequestDeleteTeam,
}: Props) {
  return (
    <div className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden'>
      <table className='w-full table-fixed border-collapse text-left text-sm'>
        <thead className='sticky top-0 z-10'>
          <tr className='border-b border-gray-100 bg-gray-50/95 text-xs font-semibold uppercase tracking-wide text-gray-500 backdrop-blur-sm'>
            <th className='w-[22%] px-4 py-3 text-left'>Team name</th>
            <th className='w-[22%] px-4 py-3 text-left'>Department</th>
            <th className='w-[24%] whitespace-nowrap px-4 py-3 text-left'>
              Reporting manager
            </th>
            <th className='w-[14%] whitespace-nowrap px-2 py-3 text-left'>
              Employee count
            </th>
            <th className='w-[18%] whitespace-nowrap px-2 py-3 text-right'>
              Actions
            </th>
          </tr>
        </thead>
        <tbody
          aria-busy={loading}
          aria-label={loading ? 'Loading teams' : undefined}
        >
          {loading ? (
            <TeamsTableSkeletonBody />
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className='px-4 py-16 text-center align-middle text-sm text-gray-500 sm:py-24'
              >
                No teams match your filters.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              return (
                <tr
                  key={row.id}
                  className='border-b border-gray-50 transition-colors hover:bg-gray-50/60'
                >
                  <td className='wrap-break-word px-4 py-3 text-left align-top font-medium text-gray-900'>
                    {row.name}
                  </td>
                  <td className='wrap-break-word px-4 py-3 text-left align-top text-gray-700'>
                    {row.departmentName}
                  </td>
                  <td className='wrap-break-word px-4 py-3 text-left align-top text-gray-700'>
                    {row.lead?.name ?? '—'}
                  </td>
                  <td className='whitespace-nowrap px-2 py-3 pr-1 text-left align-top tabular-nums text-gray-700'>
                    {row.employeeCount}
                  </td>
                  <td className='px-2 py-3 pl-1 text-right align-top'>
                    <div className='flex flex-col items-end justify-end gap-1.5 sm:flex-row sm:flex-wrap sm:gap-1.5'>
                      {row.lead ? (
                        <a
                          href={`mailto:${encodeURIComponent(row.lead.email)}`}
                          className='inline-flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50'
                        >
                          <Mail size={13} />
                          Email lead
                        </a>
                      ) : null}
                      {isAdmin && onEditTeam && onRequestDeleteTeam ? (
                        <div className='flex shrink-0 justify-end gap-1'>
                          <Button
                            type='button'
                            variant='ghost'
                            aria-label={`Edit ${row.name}`}
                            onClick={() => onEditTeam(row)}
                            className='!rounded-lg !p-2 text-gray-600 hover:!bg-gray-200'
                          >
                            <Pencil size={16} />
                          </Button>
                          <span
                            className='inline-flex'
                            title={
                              row.employeeCount > 0
                                ? 'Reassign employees before deleting this team'
                                : undefined
                            }
                          >
                            <Button
                              type='button'
                              variant='ghost'
                              aria-label={`Delete ${row.name}`}
                              disabled={row.employeeCount > 0}
                              onClick={() => onRequestDeleteTeam(row)}
                              className='!rounded-lg !p-2 text-gray-600 hover:!bg-rose-50 hover:!text-rose-700'
                            >
                              <Trash2 size={16} />
                            </Button>
                          </span>
                        </div>
                      ) : null}
                      {!row.lead &&
                      !(isAdmin && onEditTeam && onRequestDeleteTeam) ? (
                        <span className='text-xs text-gray-400'>—</span>
                      ) : null}
                    </div>
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
