'use client';

import type {
  LeavePolicyDocument,
  LeavePolicyIconKey,
  LeavePolicySection,
} from '@/types/leavePolicy';
import {
  BookOpen,
  CalendarClock,
  FileCheck,
  Scale,
  Users,
  type LucideIcon,
} from 'lucide-react';
import React from 'react';

const ICON_MAP: Record<LeavePolicyIconKey, LucideIcon> = {
  BookOpen,
  CalendarClock,
  FileCheck,
  Users,
  Scale,
};

function PolicyIcon({ name }: { name: LeavePolicyIconKey }) {
  const Icon = ICON_MAP[name] ?? BookOpen;
  return <Icon size={18} strokeWidth={2} aria-hidden />;
}

function TextBody({ body }: { body: string }) {
  const parts = body.split(/\n\n+/).filter(Boolean);
  if (parts.length <= 1) {
    return <p>{body}</p>;
  }
  return (
    <div className='space-y-3'>
      {parts.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}

function SectionBlock({ section }: { section: LeavePolicySection }) {
  return (
    <section className='border-b border-border pb-8 last:border-b-0 last:pb-0'>
      <h2 className='mb-3 flex items-center gap-3 text-base font-semibold text-card-foreground'>
        <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
          <PolicyIcon name={section.iconKey} />
        </span>
        {section.title}
      </h2>
      <div className='space-y-3 pl-[3.25rem] max-md:pl-0'>
        {section.kind === 'text' ? (
          <div className='space-y-3'>
            <TextBody body={section.body} />
          </div>
        ) : null}
        {section.kind === 'cards' ? (
          <div className='space-y-6'>
            {section.cards.map((c, i) => (
              <div key={`${c.title}-${i}`}>
                <h3 className='text-[15px] font-semibold text-card-foreground'>{c.title}</h3>
                <div className='mt-2'>
                  <TextBody body={c.body} />
                </div>
              </div>
            ))}
          </div>
        ) : null}
        {section.kind === 'list' ? (
          <ul className='list-disc space-y-2 pl-5'>
            {section.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

type Props = {
  document: LeavePolicyDocument;
};

export default function LeavePolicyDocumentView({ document }: Props) {
  return (
    <div className='mt-4 w-full space-y-8 text-sm leading-relaxed text-muted-foreground'>
      <p className='rounded-xl border border-primary/15 bg-linear-to-r from-primary/5 via-card to-accent/10 p-4 text-card-foreground/90'>
        {document.intro}
      </p>

      <div className='space-y-8'>
        {document.sections.map((section, idx) => (
          <SectionBlock key={`${section.kind}-${section.title}-${idx}`} section={section} />
        ))}
      </div>

      <p className='rounded-lg border border-border bg-muted px-4 py-3 text-xs text-muted-foreground'>
        {document.footer}
      </p>
    </div>
  );
}
