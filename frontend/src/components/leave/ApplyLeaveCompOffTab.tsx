'use client';

import Button from '../ui/Button';
import Input from '../ui/Input';

export type ApplyLeaveCompOffTabProps = {
  todayIso: string;
  compOffDate: string;
  setCompOffDate: (value: string) => void;
  compOffReason: string;
  setCompOffReason: (value: string) => void;
  compOffSubmitting: boolean;
  onCompOffApply: () => void | Promise<void>;
  onReset: () => void;
};

const ApplyLeaveCompOffTab = ({
  todayIso,
  compOffDate,
  setCompOffDate,
  compOffReason,
  setCompOffReason,
  compOffSubmitting,
  onCompOffApply,
  onReset,
}: ApplyLeaveCompOffTabProps) => {
  const canSubmitCompOff = Boolean(compOffDate) && Boolean(compOffReason.trim());

  return (
    <section className='rounded-2xl border border-border bg-card/90 p-4 shadow-sm backdrop-blur-sm md:p-5'>
      <div className='flex items-start justify-between gap-3'>
        <div>
          <h3 className='text-lg font-semibold text-card-foreground'>
            Add comp off credit
          </h3>
          <p className='text-xs text-muted-foreground'>
            Worked on Saturday/Sunday? Add one comp-off day for that date.
          </p>
        </div>
        <span className='rounded-full bg-indigo-500/15 px-2.5 py-1 text-[11px] font-semibold text-indigo-700'>
          +1 day / weekend date
        </span>
      </div>

    <div className='gap-3 grid sm:grid-cols-2 mt-4'>
      <Input
        id='comp-off-work-date'
        type='date'
        label='Worked on'
        max={todayIso}
        required
        value={compOffDate}
        onChange={(e) => setCompOffDate(e.target.value)}
      />
      <Input
        id='comp-off-reason'
        type='text'
        label='Reason'
        placeholder='e.g. Production release support'
        required
        value={compOffReason}
        onChange={(e) => setCompOffReason(e.target.value)}
      />
    </div>

    <div className='mt-3 flex flex-wrap items-center gap-3'>
      <Button
        type='button'
        variant='outline'
        onClick={onReset}
        disabled={compOffSubmitting}
        className='inline-flex justify-center items-center shadow-none px-5 py-2.5 text-sm font-semibold'
      >
        Reset
      </Button>
      <Button
        type='button'
        onClick={onCompOffApply}
        disabled={compOffSubmitting || !canSubmitCompOff}
        className='px-5 py-2.5 text-sm'
      >
        {compOffSubmitting ? 'Adding...' : 'Add comp off credit'}
      </Button>
    </div>
  </section>
  );
};

export default ApplyLeaveCompOffTab;
