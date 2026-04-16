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
      className={`flex min-w-0 flex-nowrap items-center gap-3 overflow-x-auto py-1.5 [scrollbar-width:thin] ${className}`.trim()}
    >
      {children}
      {actions ? <div className='ml-auto flex shrink-0 items-center gap-2'>{actions}</div> : null}
    </div>
  );
}
