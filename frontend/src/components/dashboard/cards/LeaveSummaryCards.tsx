'use client';

import React from 'react';
import { CalendarClock, TrendingDown, TrendingUp } from 'lucide-react';
import type {
  LeaveBalance,
  LeaveChartData,
  LeaveChartSeries,
  LeaveUsage,
} from '@/types/leave';

type Props = {
  balance: LeaveBalance;
  monthlyUsage?: LeaveUsage;
  chartData?: LeaveChartData;
};

const MiniChart = ({
  color,
  data,
}: {
  color: string;
  data: LeaveChartSeries;
}) => {
  const safeData = data.length > 0 ? data : [{ month: 'N/A', value: 0 }];
  const maxValue = Math.max(...safeData.map((item) => item.value), 1);
  const chartHeight = 64;
  const barWidth = 12;
  const gap = 8;
  const width = safeData.length * barWidth + Math.max(0, safeData.length - 1) * gap;

  return (
    <svg
      width={width}
      height={chartHeight}
      viewBox={`0 0 ${width} ${chartHeight}`}
      className='overflow-visible'
      aria-hidden
    >
      {safeData.map((item, index) => {
        const x = index * (barWidth + gap);
        const height = Math.max(6, (item.value / maxValue) * (chartHeight - 8));
        const y = chartHeight - height;

        return (
          <g key={`${item.month}-${index}`}>
            <title>{`${item.month}: ${item.value} ${item.value === 1 ? 'leave' : 'leaves'}`}</title>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={height}
              rx={4}
              fill={color}
              opacity={item.value === 0 ? 0.35 : 1}
            />
          </g>
        );
      })}
    </svg>
  );
};

const TrendBadge = ({
  used,
  isOneTime,
}: {
  used: number;
  isOneTime?: boolean;
}) => {
  const hasUsed = used > 0;
  return (
    <div
      className={`mt-3 flex w-fit items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ${
        hasUsed
          ? 'bg-danger-muted text-danger-muted-foreground'
          : 'bg-success-muted text-success-muted-foreground'
      }`}
    >
      {hasUsed ? (
        <>
          <TrendingDown size={13} strokeWidth={2.5} />
          <span>
            {isOneTime
              ? 'Used (Cannot be applied again)'
              : `${used} ${used === 1 ? 'leave' : 'leaves'} used this month`}
          </span>
        </>
      ) : (
        <>
          <TrendingUp size={13} strokeWidth={2.5} />
          <span>
            {isOneTime ? 'Not yet used' : 'No leaves used this month'}
          </span>
        </>
      )}
    </div>
  );
};

const LeaveCard = ({
  label,
  count,
  used,
  right,
  isOneTime,
}: {
  label: string;
  count: number;
  used: number;
  right: React.ReactNode;
  isOneTime?: boolean;
}) => (
  <div className='flex items-start justify-between rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-md'>
    <div className='flex flex-col'>
      <p className='text-sm text-muted-foreground'>{label}</p>

      <div className='mt-4 flex items-baseline gap-2'>
        <h2 className='text-4xl leading-none font-bold'>{count}</h2>
        <span className='text-sm text-muted-foreground'>days remaining</span>
      </div>

      <TrendBadge used={used} isOneTime={isOneTime} />
    </div>

    <div className='mt-1 shrink-0'>{right}</div>
  </div>
);

const LeaveSummaryCards = ({ balance, monthlyUsage, chartData }: Props) => {
  const usage = monthlyUsage ?? {
    sick: 0,
    annual: 0,
    compOff: 0,
    maternity: 0,
    paternity: 0,
  };

  return (
    <div className='relative'>
      <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
        <div>
          <LeaveCard
            label='Annual Leave'
            count={balance.annual}
            used={usage.annual}
            right={<MiniChart color='#0E7490' data={chartData?.annual || []} />}
          />
        </div>

        <div>
          <LeaveCard
            label='Sick Leave'
            count={balance.sick}
            used={usage.sick}
            right={<MiniChart color='#14B8A6' data={chartData?.sick || []} />}
          />
        </div>

        <div>
          <LeaveCard
            label='Comp Off'
            count={balance.compOff ?? 0}
            used={usage.compOff ?? 0}
            right={
              chartData?.compOff?.length ? (
                <MiniChart color='#4F46E5' data={chartData.compOff} />
              ) : (
                <div className='flex h-14 w-14 items-center justify-center rounded-full bg-muted'>
                  <CalendarClock
                    size={28}
                    className='text-primary'
                    strokeWidth={1.5}
                  />
                </div>
              )
            }
          />
        </div>
      </div>
    </div>
  );
};

export default LeaveSummaryCards;
