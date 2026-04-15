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
    <div className='w-full min-w-0 overflow-x-auto'>
      <table className='w-full min-w-[420px] border-collapse text-left text-sm'>
        <thead className='sticky top-0 z-10'>
          <tr className='border-b border-border bg-muted/95 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm'>
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
                className='px-4 py-16 text-center align-middle text-sm text-muted-foreground sm:py-24'
              >
                Loading…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className='px-4 py-16 text-center align-middle text-sm text-muted-foreground sm:py-24'
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
                  className='border-b border-border transition-colors hover:bg-muted/60'
                >
                  <td className='px-4 py-2 text-left align-middle font-medium text-card-foreground'>
                    {row.name}
                  </td>
                  <td className='px-4 py-2 text-left align-middle text-card-foreground/90'>
                    {dateStr}
                  </td>
                  <td className='px-4 py-2 text-right align-middle'>
                    {canManage ? (
                      <div className='inline-flex gap-0.5'>
                        <button
                          type='button'
                          onClick={() => onEdit(row)}
                          className='rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary'
                          aria-label={`Edit ${row.name}`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type='button'
                          onClick={() => onDelete(row)}
                          className='rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-danger-muted hover:text-danger-muted-foreground'
                          aria-label={`Delete ${row.name}`}
                        >
                          <Trash2 size={16} />
                        </button>
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
