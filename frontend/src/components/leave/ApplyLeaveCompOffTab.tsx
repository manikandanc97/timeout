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
    <section className='bg-white/80 shadow-sm backdrop-blur-sm p-4 md:p-5 border border-gray-100 rounded-2xl'>
    <div className='flex justify-between items-start gap-3'>
      <div>
        <h3 className='font-semibold text-gray-900 text-lg'>
          Add comp off credit
        </h3>
        <p className='text-gray-500 text-xs'>
          Worked on Saturday/Sunday? Add one comp-off day for that date.
        </p>
      </div>
      <span className='bg-indigo-50 px-2.5 py-1 rounded-full font-semibold text-[11px] text-indigo-700'>
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
