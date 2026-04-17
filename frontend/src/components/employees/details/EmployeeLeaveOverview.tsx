'use client';

type LeaveData = {
  leave: { pending: number; approved: number; rejected: number };
  leaveDaySummary?: {
    workedDays: number;
    appliedLeaveDays: number;
    approvedLeaveDays: number;
    pendingLeaveDays: number;
  };
};

type Props = {
  data: LeaveData | null;
  leaveMonthLabel: string | null;
};

export default function EmployeeLeaveOverview({ data, leaveMonthLabel }: Props) {
  return (
    <div className='mt-4 space-y-3'>
      {leaveMonthLabel ? (
        <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
          Monthly summary - {leaveMonthLabel}
        </p>
      ) : null}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <div className='rounded-lg border border-border border-l-4 border-l-sky-400 bg-muted/80 p-3 text-center'>
          <p className='text-xs uppercase text-muted-foreground'>Worked Days</p>
          <p className='mt-1 text-lg font-bold text-card-foreground'>{data?.leaveDaySummary?.workedDays ?? 0}</p>
        </div>
        <div className='rounded-lg border border-border border-l-4 border-l-indigo-400 bg-muted/80 p-3 text-center'>
          <p className='text-xs uppercase text-muted-foreground'>Leave Days</p>
          <p className='mt-1 text-lg font-bold text-card-foreground'>{data?.leaveDaySummary?.appliedLeaveDays ?? 0}</p>
        </div>
        <div className='rounded-lg border border-border border-l-4 border-l-emerald-400 bg-muted/80 p-3 text-center'>
          <p className='text-xs uppercase text-muted-foreground'>Approved Days</p>
          <p className='mt-1 text-lg font-bold text-card-foreground'>{data?.leaveDaySummary?.approvedLeaveDays ?? 0}</p>
        </div>
        <div className='rounded-lg border border-border border-l-4 border-l-amber-400 bg-muted/80 p-3 text-center'>
          <p className='text-xs uppercase text-muted-foreground'>Pending Days</p>
          <p className='mt-1 text-lg font-bold text-card-foreground'>{data?.leaveDaySummary?.pendingLeaveDays ?? 0}</p>
        </div>
      </div>

      <div className='rounded-lg border border-border bg-muted p-3'>
        <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>Overall Requests</p>
        <div className='mt-2 flex flex-wrap gap-2 text-xs'>
          <span className='rounded-full border border-warning-muted-foreground/30 bg-warning-muted px-2.5 py-1 text-warning-muted-foreground'>
            Pending: {data?.leave.pending ?? 0}
          </span>
          <span className='rounded-full border border-success-muted-foreground/30 bg-success-muted px-2.5 py-1 text-success-muted-foreground'>
            Approved: {data?.leave.approved ?? 0}
          </span>
          <span className='rounded-full border border-danger-muted-foreground/30 bg-danger-muted px-2.5 py-1 text-danger-muted-foreground'>
            Rejected: {data?.leave.rejected ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}
