import type { PropsWithChildren, ReactNode } from 'react';

type FilterBarShellProps = PropsWithChildren<{
  actions?: ReactNode;
  className?: string;
}>;

export default function FilterBarShell({
  children,
  actions,
  className = '',
}: FilterBarShellProps) {
  return (
    <div
      className={`flex min-w-0 flex-wrap items-center gap-3 py-1.5 sm:flex-nowrap sm:overflow-x-auto [scrollbar-width:thin] ${className}`.trim()}
    >
      {children}
      {actions ? (
        <div className='flex w-full flex-wrap items-center justify-end gap-2 sm:ml-auto sm:w-auto sm:shrink-0 sm:flex-nowrap'>
          {actions}
        </div>
      ) : null}
    </div>
  );
}
