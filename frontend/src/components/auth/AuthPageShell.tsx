import React from 'react';

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  /** Optional icon or mark above the title (e.g. LogIn, UserPlus). */
  leading?: React.ReactNode;
  /** Tighter padding and top-aligned on small screens (long forms like register). */
  compact?: boolean;
  /** Card max width; default ~420px. Use e.g. max-w-lg for two-column forms. */
  maxWidthClassName?: string;
};

/**
 * Shared layout for login and register: ambient background + centered glassy card.
 * Uses theme primary / accent / background from globals.css.
 */
const AuthPageShell = ({
  title,
  subtitle,
  children,
  leading,
  compact = false,
  maxWidthClassName = 'max-w-[420px]',
}: AuthPageShellProps) => {
  const outer = compact
    ? 'relative flex min-h-dvh flex-col items-center justify-start overflow-x-hidden bg-background px-4 py-5 sm:justify-center sm:px-6 sm:py-8'
    : 'relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6 sm:py-12';

  return (
    <div className={outer}>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-15%,rgba(8,131,149,0.2),transparent)]'
      />
      <div
        aria-hidden
        className='pointer-events-none absolute -top-24 right-[-20%] h-[28rem] w-[28rem] rounded-full bg-accent/30 blur-3xl'
      />
      <div
        aria-hidden
        className='pointer-events-none absolute -bottom-32 left-[-25%] h-[26rem] w-[26rem] rounded-full bg-primary/15 blur-3xl'
      />

      <div className={`relative w-full ${maxWidthClassName}`}>
        {leading ? (
          <div
            className={
              compact
                ? 'mb-3 flex justify-center sm:mb-4'
                : 'mb-6 flex justify-center sm:mb-8'
            }
          >
            {leading}
          </div>
        ) : null}

        <div
          className={
            compact
              ? 'rounded-2xl border border-gray-200/90 bg-white/95 p-5 shadow-[0_25px_50px_-12px_rgba(8,131,149,0.12)] ring-1 ring-black/5 backdrop-blur-sm sm:rounded-3xl sm:p-6'
              : 'rounded-3xl border border-gray-200/90 bg-white/95 p-8 shadow-[0_25px_50px_-12px_rgba(8,131,149,0.12)] ring-1 ring-black/5 backdrop-blur-sm sm:p-10'
          }
        >
          <div className={compact ? 'space-y-1 text-center' : 'space-y-2 text-center'}>
            <h1
              className={
                compact
                  ? 'text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl'
                  : 'text-2xl font-semibold tracking-tight text-gray-900 sm:text-[1.75rem]'
              }
            >
              {title}
            </h1>
            <p
              className={
                compact
                  ? 'mx-auto max-w-md text-xs leading-snug text-gray-500 sm:text-sm'
                  : 'mx-auto max-w-sm text-sm leading-relaxed text-gray-500'
              }
            >
              {subtitle}
            </p>
          </div>
          <div className={compact ? 'mt-5' : 'mt-8'}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AuthPageShell;
