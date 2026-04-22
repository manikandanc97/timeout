'use client';

import React, { useRef, useState } from 'react';
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const safeData = data.length > 0 ? data : [{ month: 'N/A', value: 0 }];
  const maxValue = Math.max(...safeData.map((item) => item.value), 1);
  const chartHeight = 64;
  const barWidth = 8;
  const railHeight = 6;
  const gap = 10;
  const width = safeData.length * barWidth + Math.max(0, safeData.length - 1) * gap;

  return (
    <div
      ref={containerRef}
      className='relative w-full max-w-[152px]'
      onMouseLeave={() => setTooltip(null)}
    >
      <svg
        width='100%'
        height={chartHeight}
        viewBox={`0 0 ${width} ${chartHeight}`}
        preserveAspectRatio='xMaxYMid meet'
        className='h-16 w-full overflow-visible'
        aria-hidden
      >
        {safeData.map((item, index) => {
          const x = index * (barWidth + gap);
          const activeHeight =
            item.value > 0 ? Math.max(18, (item.value / maxValue) * (chartHeight - 8)) : 0;
          const activeY = chartHeight - activeHeight;
          const railY = chartHeight - railHeight;

          return (
            <g
              key={`${item.month}-${index}`}
              className='cursor-pointer'
              onMouseEnter={(event) => {
                const rect = containerRef.current?.getBoundingClientRect();

                if (!rect) {
                  return;
                }

                setTooltip({
                  text: `${item.month}: ${item.value} ${item.value === 1 ? 'leave' : 'leaves'}`,
                  x: event.clientX - rect.left,
                  y: event.clientY - rect.top,
                });
              }}
              onMouseMove={(event) => {
                const rect = containerRef.current?.getBoundingClientRect();

                if (!rect) {
                  return;
                }

                setTooltip({
                  text: `${item.month}: ${item.value} ${item.value === 1 ? 'leave' : 'leaves'}`,
                  x: event.clientX - rect.left,
                  y: event.clientY - rect.top,
                });
              }}
            >
              <rect
                x={x}
                y={railY}
                width={barWidth}
                height={railHeight}
                rx={railHeight / 2}
                fill={color}
                opacity={0.35}
              />
              {item.value > 0 ? (
                <rect
                  x={x}
                  y={activeY}
                  width={barWidth}
                  height={activeHeight}
                  rx={barWidth / 2}
                  fill={color}
                />
              ) : null}
            </g>
          );
        })}
      </svg>

      {tooltip ? (
        <div
          className='pointer-events-none absolute z-50 rounded-lg border border-border bg-foreground px-2.5 py-1.5 text-xs whitespace-nowrap text-background shadow-lg'
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, calc(-100% - 8px))',
          }}
        >
          {tooltip.text}
          <div
            className='absolute h-2 w-2 rotate-45 bg-foreground'
            style={{
              left: '50%',
              bottom: '-4px',
              transform: 'translateX(-50%)',
            }}
          />
        </div>
      ) : null}
    </div>
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
  <div className='flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-md sm:flex-row sm:items-start sm:justify-between'>
    <div className='min-w-0 flex-1'>
      <p className='text-sm text-muted-foreground'>{label}</p>

      <div className='mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1'>
        <h2 className='text-4xl leading-none font-bold'>{count}</h2>
        <span className='text-sm text-muted-foreground'>days remaining</span>
      </div>

      <TrendBadge used={used} isOneTime={isOneTime} />
    </div>

    <div className='mt-1 flex w-full justify-end overflow-hidden sm:w-auto sm:shrink-0'>
      {right}
    </div>
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
