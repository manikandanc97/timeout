"use client";

import React, { useMemo, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type Props = {
  balance: {
    casual: number;
    sick: number;
    maternity?: number;
    paternity?: number;
  };
};

const COLORS = ["#0E7490", "#14B8A6", "#22C55E", "#6366F1"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="z-50 flex items-center gap-2 bg-white shadow-lg px-3 py-2 border border-gray-100 rounded-xl">
        <span
          className="rounded-full w-2.5 h-2.5 shrink-0"
          style={{ backgroundColor: data.fill || payload[0].fill }}
        />
        <p className="font-medium text-gray-600 text-sm whitespace-nowrap">
          {data.name}{" "}
          <strong className="ml-1 text-gray-800">
            {data.value.toLocaleString()}
          </strong>
        </p>
      </div>
    );
  }
  return null;
};

const LeaveBalance = ({ balance }: Props) => {
  const data = useMemo(() => {
    const orderedData = [
      {
        name: "Casual",
        value: balance.casual,
      },
      {
        name: "Sick",
        value: balance.sick,
      },
    ];

    return orderedData;
  }, [balance]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const [activeData, setActiveData] = useState<{
    name: string;
    value: number;
  } | null>(null);

  const [tooltipPosition, setTooltipPosition] = useState({
    x: 0,
    y: 0,
  });

  return (
    <div className="flex flex-col bg-white shadow-md p-5 rounded-2xl h-full">
      <h2 className="mb-4 font-semibold text-xl">Leave Balance</h2>

      <div className="relative flex-1 w-full min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={70}
              outerRadius={95}
              dataKey="value"
              paddingAngle={2}
              stroke="none"
              onMouseEnter={(_, index) => setActiveData(data[index])}
              onMouseLeave={() => setActiveData(null)}
              onMouseMove={(e: any) => {
                if (e?.chartX && e?.chartY) {
                  setTooltipPosition({
                    x: e.chartX,
                    y: e.chartY,
                  });
                }
              }}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
          <p className="text-gray-500 text-sm">
            {activeData ? activeData.name : "Total"}
          </p>

          <h3 className="font-bold text-3xl">
            {activeData ? activeData.value : total}
          </h3>
        </div>
      </div>

      <hr className="mt-4 mb-2 border-gray-300" />

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="rounded-full w-3 h-3"
              style={{
                backgroundColor: COLORS[index % COLORS.length],
              }}
            />
            <span className="text-sm">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveBalance;
