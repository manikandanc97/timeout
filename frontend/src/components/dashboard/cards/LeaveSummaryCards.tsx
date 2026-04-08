'use client';

import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, Tooltip, Cell } from 'recharts';
import { Baby, TrendingDown, TrendingUp } from 'lucide-react';

type Props = {
  balance: {
    sick: number;
    annual: number;
    maternity?: number;
    paternity?: number;
  };
  monthlyUsage?: {
    sick: number;
    annual: number;
    maternity?: number;
    paternity?: number;
  };
  chartData?: {
    annual: { month: string; value: number }[];
    sick: { month: string; value: number }[];
  };
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className='z-50 flex items-center gap-1.5 bg-gray-800 shadow-xl px-2.5 py-1.5 rounded-lg font-medium text-white text-xs whitespace-nowrap'>
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

const MiniChart = ({ color, data }: { color: string; data: any[] }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  console.log('mini chart data', data);

  return (
    <BarChart
      width={96}
      height={64}
      data={data}
      onMouseMove={(state: any) => {
        if (state?.isTooltipActive && state?.activeTooltipIndex != null) {
          setActiveIndex(state.activeTooltipIndex);
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
      className={`flex items-center gap-1.5 mt-3 w-fit px-2 py-1 rounded-lg text-xs font-medium ${
        hasUsed ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'
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
  <div className='flex justify-between items-start bg-white shadow-md p-5 rounded-2xl'>
    <div className='flex flex-col'>
      <p className='text-gray-500 text-sm'>{label}</p>

      <div className='flex items-baseline gap-2 mt-4'>
        <h2 className='font-bold text-4xl leading-none'>{count}</h2>
        <span className='text-gray-400 text-sm'>days remaining</span>
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
    maternity: 0,
    paternity: 0,
  };

  const thirdLeave = balance.maternity ?? balance.paternity ?? 0;
  const thirdLeaveLabel =
    balance.maternity !== undefined ? 'Maternity Leave' : 'Paternity Leave';
  const thirdUsed =
    balance.maternity !== undefined
      ? (usage.maternity ?? 0)
      : (usage.paternity ?? 0);

  return (
    <div className='gap-5 grid grid-cols-1 md:grid-cols-3'>
      <LeaveCard
        label='Annual Leave'
        count={balance.annual}
        used={usage.annual}
        right={<MiniChart color='#0E7490' data={chartData?.annual || []} />}
      />

      <LeaveCard
        label='Sick Leave'
        count={balance.sick}
        used={usage.sick}
        right={<MiniChart color='#14B8A6' data={chartData?.sick || []} />}
      />

      <LeaveCard
        label={thirdLeaveLabel}
        count={thirdLeave}
        used={thirdUsed}
        isOneTime={true}
        right={
          <div className='flex justify-center items-center bg-[#22C55E]/10 rounded-full w-14 h-14'>
            <Baby size={30} className='text-[#22C55E]' strokeWidth={1.5} />
          </div>
        }
      />
    </div>
  );
};

export default LeaveSummaryCards;
