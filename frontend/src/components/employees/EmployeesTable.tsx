import { Mail } from 'lucide-react';

import type { OrganizationEmployee } from '@/types/employee';

import {
  formatJoined,
  initialsFromName,
  roleLabel,
} from './utils';

type Props = {
  loading: boolean;
  rows: OrganizationEmployee[];
};

export default function EmployeesTable({ loading, rows }: Props) {
  return (
    <div className='min-h-0 flex-1 overflow-auto'>
      <table className='min-h-full w-full min-w-[880px] border-collapse text-left text-sm'>
        <thead className='sticky top-0 z-10'>
          <tr className='border-b border-gray-100 bg-gray-50/95 text-xs font-semibold uppercase tracking-wide text-gray-500 backdrop-blur-sm'>
              <th className='px-4 py-3'>Profile</th>
              <th className='px-4 py-3'>Name</th>
              <th className='px-4 py-3'>Email</th>
              <th className='px-4 py-3'>Department</th>
              <th className='px-4 py-3'>Team</th>
              <th className='px-4 py-3'>Role</th>
              <th className='px-4 py-3'>Status</th>
              <th className='px-4 py-3'>Joined</th>
              <th className='px-4 py-3 text-right'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={9}
                  className='px-4 py-12 text-center text-gray-500'
                >
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className='px-4 py-12 text-center text-gray-500'
                >
                  No employees match your filters.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const initials = initialsFromName(row.name);
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
                    <td className='px-4 py-3'>
                      <div
                        className='flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary text-xs'
                        aria-hidden
                      >
                        {initials}
                      </div>
                    </td>
                    <td className='px-4 py-3 font-medium text-gray-900'>
                      {row.name}
                    </td>
                    <td className='max-w-[200px] truncate px-4 py-3 text-gray-600'>
                      {row.email}
                    </td>
                    <td className='px-4 py-3 text-gray-700'>{dept}</td>
                    <td className='px-4 py-3 text-gray-700'>{team}</td>
                    <td className='whitespace-nowrap px-4 py-3 text-gray-700'>
                      {roleLabel(row.role)}
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td className='whitespace-nowrap px-4 py-3 text-gray-700'>
                      {formatJoined(row.createdAt)}
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <a
                        href={`mailto:${encodeURIComponent(row.email)}`}
                        className='inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50'
                      >
                        <Mail size={13} />
                        Email
                      </a>
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
