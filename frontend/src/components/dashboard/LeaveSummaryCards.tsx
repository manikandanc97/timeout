import React from "react";
import { ResponsiveContainer, BarChart, Bar, Tooltip } from "recharts";
import { Baby } from "lucide-react";

type Props = {
  balance: {
    sick: number;
    casual: number;
    maternity?: number;
    paternity?: number;
  };
};

const miniChartData = [
  { month: "Jan", value: 15 },
  { month: "Feb", value: 18 },
  { month: "Mar", value: 12 },
  { month: "Apr", value: 45 },
  { month: "May", value: 68 },
  { month: "Jun", value: 10 },
  { month: "Jul", value: 40 },
  { month: "Aug", value: 38 },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="z-50 bg-white shadow-lg border border-gray-100 rounded-xl min-w-[70px] overflow-hidden">
        <div className="bg-slate-50 px-2 py-1.5 border-b border-gray-100 text-center">
          <p className="font-semibold text-slate-500 text-xs">{data.month}</p>
        </div>
        <div className="flex justify-center items-center gap-2 px-3 py-2">
          <span
            className="shrink-0 rounded-full w-2.5 h-2.5"
            style={{ backgroundColor: payload[0].color || payload[0].fill }}
          />
          <p className="font-bold text-gray-800 text-sm">{data.value}</p>
        </div>
      </div>
    );
  }
  return null;
};

const MiniChart = ({ color }: { color: string }) => {
  return (
    <div className="w-24 h-16">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={miniChartData}>
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: "transparent" }} 
            isAnimationActive={false}
          />
          <Bar dataKey="value" radius={[2, 2, 0, 0]} fill={color} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const LeaveSummaryCards = ({ balance }: Props) => {
  const thirdLeave = balance.maternity ?? balance.paternity ?? 0;
  const thirdLeaveLabel =
    balance.maternity !== undefined ? "Maternity Leave" : "Paternity Leave";
  return (
    <div className="gap-5 grid grid-cols-1 md:grid-cols-3">
      <div className="flex justify-between items-center bg-white shadow-md p-5 rounded-2xl">
        <div>
          <p className="text-gray-500 text-sm">Casual Leave</p>
          <h2 className="mt-4 font-bold text-4xl">{balance.casual}</h2>
          <p className="mt-3 text-gray-500 text-sm">days remaining</p>
        </div>
        <MiniChart color="#0E7490" />
      </div>

      <div className="flex justify-between items-center bg-white shadow-md p-5 rounded-2xl">
        <div>
          <p className="text-gray-500 text-sm">Sick Leave</p>
          <h2 className="mt-4 font-bold text-4xl">{balance.sick}</h2>
          <p className="mt-3 text-gray-500 text-sm">days remaining</p>
        </div>

        <MiniChart color="#14B8A6" />
      </div>

      <div className="flex justify-between items-center bg-white shadow-md p-5 rounded-2xl">
        <div>
          <p className="text-gray-500 text-sm">{thirdLeaveLabel}</p>
          <h2 className="mt-4 font-bold text-4xl">{thirdLeave}</h2>
          <p className="mt-3 text-gray-500 text-sm">days remaining</p>
        </div>
        <div className="flex justify-center items-center bg-[#22C55E]/10 rounded-full w-14 h-14">
          <Baby size={30} className="text-[#22C55E]" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  );
};

export default LeaveSummaryCards;
