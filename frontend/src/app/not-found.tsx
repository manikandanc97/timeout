import AuthPageShell from '@/components/auth/AuthPageShell';
import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import React from 'react';

const primaryLinkClass =
  'inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-[15px] font-medium text-primary-foreground transition-colors duration-300 hover:bg-primary-dark sm:w-auto';

const outlineLinkClass =
  'inline-flex w-full items-center justify-center rounded-lg border border-border bg-transparent px-4 py-2.5 text-[15px] font-medium text-card-foreground transition-colors duration-300 hover:bg-muted sm:w-auto';

export default function NotFound() {
  return (
    <AuthPageShell
      title="We couldn’t find that page"
      subtitle="The link may be wrong or the page was moved. Check the URL or return to Timeout."
      leading={
        <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner ring-1 ring-primary/15'>
          <FileQuestion className='h-7 w-7' strokeWidth={1.75} aria-hidden />
        </div>
      }
    >
      <div className='flex flex-col gap-3 sm:flex-row sm:justify-center'>
        <Link href='/dashboard' className={primaryLinkClass}>
          Go to dashboard
        </Link>
        <Link href='/login' className={outlineLinkClass}>
          Sign in
        </Link>
      </div>
      <p className='mt-6 text-center text-xs font-medium tracking-wide text-muted-foreground'>
        404 — Not found
      </p>
    </AuthPageShell>
  );
}
