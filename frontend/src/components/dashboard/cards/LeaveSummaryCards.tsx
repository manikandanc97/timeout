'use client';

import React, { useRef, useState } from 'react';
import { BarChart, Bar, Tooltip, Cell } from 'recharts';
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

type TooltipPayloadRow = {
  payload: { month: string; value: number };
  color?: string;
  fill?: string;
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadRow[];
};

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className='z-50 flex items-center gap-1.5 rounded-lg border border-border bg-foreground px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-background shadow-xl'>
        <span style={{ color: payload[0].color || payload[0].fill }}>
          {data.month}
        </span>
        <span>•</span>
        <span>
          {data.value} {data.value === 1 ? 'leave' : 'leaves'}
        </span>
      </div>
    );
  }
  return null;
};

const MiniChart = ({
  color,
  data,
}: {
  color: string;
  data: LeaveChartSeries;
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <BarChart
      width={96}
      height={64}
      data={data}
      onMouseMove={(state) => {
        if (state?.isTooltipActive && state?.activeTooltipIndex != null) {
          const idx = state.activeTooltipIndex;
          setActiveIndex(typeof idx === 'number' ? idx : null);
        } else {
          setActiveIndex(null);
        }
      }}
      onMouseLeave={() => setActiveIndex(null)}
    >
      <Tooltip
        content={<CustomTooltip />}
        cursor={{ fill: 'transparent' }}
        isAnimationActive={false}
      />

      <Bar dataKey='value' radius={[2, 2, 0, 0]} minPointSize={1}>
        {data.map((_, index) => (
          <Cell
            key={`cell-${index}`}
            fill={color}
            opacity={activeIndex == null || activeIndex === index ? 1 : 0.3}
            className='transition-all duration-300'
          />
        ))}
      </Bar>
    </BarChart>
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const usage = monthlyUsage ?? {
    sick: 0,
    annual: 0,
    compOff: 0,
    maternity: 0,
    paternity: 0,
  };

  return (
    <div className='relative'>
      <div
        ref={scrollRef}
        className='flex snap-x snap-mandatory gap-5 overflow-x-auto pb-1 [scrollbar-width:none] md:grid md:grid-cols-3 md:overflow-visible'
      >
        <div className='min-w-[280px] snap-start md:min-w-0'>
          <LeaveCard
            label='Annual Leave'
            count={balance.annual}
            used={usage.annual}
            right={<MiniChart color='#0E7490' data={chartData?.annual || []} />}
          />
        </div>

        <div className='min-w-[280px] snap-start md:min-w-0'>
          <LeaveCard
            label='Sick Leave'
            count={balance.sick}
            used={usage.sick}
            right={<MiniChart color='#14B8A6' data={chartData?.sick || []} />}
          />
        </div>

        <div className='min-w-[280px] snap-start md:min-w-0'>
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
