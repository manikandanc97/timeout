import PageCard from '@/components/ui/PageCard';
import { BookOpen, CalendarClock, FileCheck, Scale, Users } from 'lucide-react';
import React from 'react';

const sections: {
  icon: React.ElementType;
  title: string;
  body: React.ReactNode;
}[] = [
  {
    icon: BookOpen,
    title: 'Purpose & scope',
    body: (
      <>
        <p>
          This policy explains how leave is earned, requested, approved, and
          recorded for employees. It applies to all full-time and part-time
          staff unless your employment contract or local law specifies
          otherwise. The company may update this policy; the version in the
          Timeout app is the one in effect.
        </p>
      </>
    ),
  },
  {
    icon: CalendarClock,
    title: 'Types of leave',
    body: (
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <div className='rounded-xl border border-gray-100 bg-gray-50/80 p-4'>
          <h3 className='font-semibold text-gray-900'>Annual leave</h3>
          <p className='mt-2'>
            For planned time away from work, rest, and personal commitments.
            Typically accrued over the calendar or financial year (as defined
            by your organisation). Requests should be submitted in advance and
            approved by your manager based on team coverage and business needs.
          </p>
        </div>
        <div className='rounded-xl border border-gray-100 bg-gray-50/80 p-4'>
          <h3 className='font-semibold text-gray-900'>Sick leave</h3>
          <p className='mt-2'>
            For illness, injury, or medical appointments. Short absences may be
            self-declared; longer or repeated absences may require a medical
            certificate or fit-to-work note at HR or manager request. Misuse of
            sick leave may lead to disciplinary action.
          </p>
        </div>
        <div className='rounded-xl border border-gray-100 bg-gray-50/80 p-4'>
          <h3 className='font-semibold text-gray-900'>Maternity leave</h3>
          <p className='mt-2'>
            For employees who are pregnant or have recently given birth,
            aligned with applicable employment and maternity-benefit laws in
            your country. Duration, pay, and notice rules follow statute and
            company guidelines; HR will confirm eligibility and paperwork.
          </p>
        </div>
        <div className='rounded-xl border border-gray-100 bg-gray-50/80 p-4'>
          <h3 className='font-semibold text-gray-900'>Paternity / partner leave</h3>
          <p className='mt-2'>
            For new parents to support their family around birth or adoption.
            Entitlement and duration are set by company policy and local law;
            apply through the same process as other leave types with reasonable
            advance notice where possible.
          </p>
        </div>
      </div>
    ),
  },
  {
    icon: FileCheck,
    title: 'Applying for leave',
    body: (
      <ul className='list-disc space-y-2 pl-5'>
        <li>
          Submit requests through <strong className='text-gray-800'>Timeout</strong>{' '}
          (Apply Leave) with start and end dates, leave type, and a clear
          reason where required.
        </li>
        <li>
          Plan annual leave ahead where you can; last-minute requests may be
          declined if coverage is insufficient.
        </li>
        <li>
          For emergencies, notify your manager (and HR if needed) as soon as
          possible, then record the absence in the system when you are able to.
        </li>
        <li>
          You can track status (pending, approved, rejected) under{' '}
          <strong className='text-gray-800'>My Leaves</strong>.
        </li>
      </ul>
    ),
  },
  {
    icon: Users,
    title: 'Approval & balancing',
    body: (
      <ul className='list-disc space-y-2 pl-5'>
        <li>
          Managers approve leave based on operational needs, fairness across the
          team, and policy rules. HR may be involved for long absences,
          statutory leave, or exceptions.
        </li>
        <li>
          Public holidays and weekly off-days are usually excluded when
          counting working days for leave, unless your contract says
          otherwise.
        </li>
        <li>
          Leave balances shown in Timeout reflect approved records; contact HR
          if you believe a balance is incorrect.
        </li>
      </ul>
    ),
  },
  {
    icon: Scale,
    title: 'General rules',
    body: (
      <ul className='list-disc space-y-2 pl-5'>
        <li>
          <strong className='text-gray-800'>Probation:</strong> leave during
          probation may be limited or require additional approval—follow your
          offer letter or HR guidance.
        </li>
        <li>
          <strong className='text-gray-800'>Carry forward & lapse:</strong>{' '}
          annual leave may be carried forward up to a cap defined by the
          company; unused leave may lapse at year-end unless policy allows
          encashment or special carry-over.
        </li>
        <li>
          <strong className='text-gray-800'>Concurrent leave:</strong> do not
          take other paid work or activities that conflict with the purpose of
          approved leave without prior approval.
        </li>
        <li>
          <strong className='text-gray-800'>Notice period / resignation:</strong>{' '}
          leave during notice may be restricted or subject to manager and HR
          approval.
        </li>
      </ul>
    ),
  },
];

const LeavePolicy = () => {
  return (
    <PageCard title='Leave Policy'>
      <div className='mt-4 w-full space-y-8 text-sm leading-relaxed text-gray-600'>
        <p className='rounded-xl border border-primary/15 bg-linear-to-r from-primary/5 via-white to-accent/10 p-4 text-gray-700'>
          The guidelines below reflect common corporate practice. Your
          organisation may define exact entitlements, blackout dates, and
          approval levels—always follow internal HR communications and your
          employment contract when they differ from this summary.
        </p>

        <div className='space-y-8'>
          {sections.map(({ icon: Icon, title, body }) => (
            <section
              key={title}
              className='border-b border-gray-100 pb-8 last:border-b-0 last:pb-0'
            >
              <h2 className='mb-3 flex items-center gap-3 text-base font-semibold text-gray-900'>
                <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                  <Icon size={18} strokeWidth={2} aria-hidden />
                </span>
                {title}
              </h2>
              <div className='space-y-3 pl-[3.25rem] max-md:pl-0'>{body}</div>
            </section>
          ))}
        </div>

        <p className='rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-500'>
          Questions? Contact your manager or HR. For system issues with
          Timeout, reach out to your IT or HR operations contact.
        </p>
      </div>
    </PageCard>
  );
};

export default LeavePolicy;
