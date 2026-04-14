import React from 'react';

type ReportTableSectionProps = {
  title: string;
  subtitle: string;
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
  emptyText?: string;
};

export default function ReportTableSection({
  title,
  subtitle,
  columns,
  rows,
  emptyText = 'No records found for selected filters.',
}: ReportTableSectionProps) {
  return (
    <section className='flex min-w-0 flex-col gap-3 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-sm sm:gap-3.5 sm:p-4'>
      <div>
        <h2 className='text-lg font-semibold text-gray-900'>{title}</h2>
        <p className='mt-1 text-sm text-gray-500'>{subtitle}</p>
      </div>
      <div className='flex w-full min-w-0 flex-col overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/40'>
        <div className='w-full min-w-0 overflow-x-auto'>
          <table className='w-full min-w-[980px] border-collapse text-left text-sm'>
            <thead className='sticky top-0 z-10'>
              <tr className='border-b border-gray-100 bg-gray-50/95 text-xs font-semibold uppercase tracking-wide text-gray-500 backdrop-blur-sm'>
                {columns.map((column) => (
                  <th key={column} className='px-4 py-3.5 text-left'>
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className='px-4 py-16 text-center text-sm text-gray-500'>
                    {emptyText}
                  </td>
                </tr>
              ) : (
                rows.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`} className='border-b border-gray-50 hover:bg-gray-50/60'>
                    {row.map((cell, cellIndex) => (
                      <td key={`cell-${rowIndex}-${cellIndex}`} className='px-4 py-2 align-top text-gray-700'>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
