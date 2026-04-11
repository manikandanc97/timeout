import { Mail } from 'lucide-react';

import type { OrganizationTeamRow } from '@/types/organizationTeam';

const SKELETON_ROWS = 6;

/** Pulse bars aligned to real column widths so loading matches the teams table layout. */
function TeamsTableSkeletonBody() {
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
          <tr
            key={i}
            className='border-b border-gray-50'
            aria-hidden
          >
            <td className='px-4 py-3'>
              {bar(`h-4 ${w('w-36', 'w-44', 'w-32')} max-w-full`)}
            </td>
            <td className='px-4 py-3'>
              {bar(`h-4 ${w('w-28', 'w-32', 'w-24')}`)}
            </td>
            <td className='px-4 py-3'>
              {bar(`h-4 ${w('w-32', 'w-40', 'w-28')}`)}
            </td>
            <td className='px-4 py-3'>
              {bar(`h-4 ${w('w-7', 'w-8', 'w-6')}`)}
            </td>
            <td className='px-4 py-3 text-right'>
              <div className='flex justify-end'>
                {bar(`h-8 ${w('w-[5.5rem]', 'w-24', 'w-[5.25rem]')} rounded-lg`)}
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
};

export default function TeamsTable({ loading, rows }: Props) {
  return (
    <div className='min-h-0 flex-1 overflow-auto'>
      <table className='min-h-full w-full min-w-[520px] border-collapse text-left text-sm'>
        <thead className='sticky top-0 z-10'>
          <tr className='border-b border-gray-100 bg-gray-50/95 text-xs font-semibold uppercase tracking-wide text-gray-500 backdrop-blur-sm'>
            <th className='px-4 py-3'>Team name</th>
            <th className='px-4 py-3'>Department</th>
            <th className='px-4 py-3'>Team lead</th>
            <th className='px-4 py-3'>Employee count</th>
            <th className='px-4 py-3 text-right'>Actions</th>
          </tr>
        </thead>
        <tbody aria-busy={loading} aria-label={loading ? 'Loading teams' : undefined}>
          {loading ? (
            <TeamsTableSkeletonBody />
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className='px-4 py-12 text-center text-gray-500'
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
                  <td className='px-4 py-3 font-medium text-gray-900'>
                    {row.name}
                  </td>
                  <td className='px-4 py-3 text-gray-700'>{row.departmentName}</td>
                  <td className='px-4 py-3 text-gray-700'>
                    {row.lead?.name ?? '—'}
                  </td>
                  <td className='tabular-nums px-4 py-3 text-gray-700'>
                    {row.employeeCount}
                  </td>
                  <td className='px-4 py-3 text-right'>
                    {row.lead ? (
                      <a
                        href={`mailto:${encodeURIComponent(row.lead.email)}`}
                        className='inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50'
                      >
                        <Mail size={13} />
                        Email lead
                      </a>
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
