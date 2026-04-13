import { Pencil, Trash2 } from 'lucide-react';

import type { Holiday } from '@/types/holiday';

type Props = {
  loading: boolean;
  rows: Holiday[];
  canManage: boolean;
  onEdit: (h: Holiday) => void;
  onDelete: (h: Holiday) => void;
};

export default function HolidaysTable({
  loading,
  rows,
  canManage,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className='min-h-0 flex-1 overflow-auto'>
      <table className='w-full min-w-[420px] border-collapse text-left text-sm'>
        <thead className='sticky top-0 z-10'>
          <tr className='border-b border-gray-100 bg-gray-50/95 text-xs font-semibold uppercase tracking-wide text-gray-500 backdrop-blur-sm'>
            <th className='px-4 py-3.5 text-left'>Name</th>
            <th className='px-4 py-3.5 text-left'>Date</th>
            <th className='px-4 py-3.5 text-right'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={3}
                className='px-4 py-16 text-center align-middle text-sm text-gray-500 sm:py-24'
              >
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className='px-4 py-16 text-center align-middle text-sm text-gray-500 sm:py-24'
              >
                No holidays match your search.
              </td>
            </tr>
          ) : (
            rows.map((row) => {
              const dateStr = new Date(row.date).toLocaleDateString('en-US', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });
              return (
                <tr
                  key={row.id}
                  className='border-b border-gray-50 transition-colors hover:bg-gray-50/60'
                >
                  <td className='px-4 py-2 text-left align-middle font-medium text-gray-900'>
                    {row.name}
                  </td>
                  <td className='px-4 py-2 text-left align-middle text-gray-700'>
                    {dateStr}
                  </td>
                  <td className='px-4 py-2 text-right align-middle'>
                    {canManage ? (
                      <div className='inline-flex gap-0.5'>
                        <button
                          type='button'
                          onClick={() => onEdit(row)}
                          className='rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary'
                          aria-label={`Edit ${row.name}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type='button'
                          onClick={() => onDelete(row)}
                          className='rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600'
                          aria-label={`Delete ${row.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
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
