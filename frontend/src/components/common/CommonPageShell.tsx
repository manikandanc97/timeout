import type { PropsWithChildren } from 'react';

type CommonPageShellProps = PropsWithChildren<{
  className?: string;
  bodyClassName?: string;
}>;

export default function CommonPageShell({
  className = '',
  bodyClassName = '',
  children,
}: CommonPageShellProps) {
  return (
    <section
      className={`relative isolate flex flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-xl ${className}`.trim()}
    >
      <div className='pointer-events-none absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/8 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl' />
      <div className={`relative z-10 flex flex-col ${bodyClassName}`.trim()}>{children}</div>
    </section>
  );
}
