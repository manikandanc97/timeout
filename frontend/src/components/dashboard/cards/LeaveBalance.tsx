"use client";

import React, { useRef, useState, useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { LeaveBalance as LeaveBalanceType } from "@/types/leave";

type Props = {
  balance: LeaveBalanceType;
};

const COLORS = ["#0E7490", "#14B8A6", "#22C55E", "#6366F1"];

type TooltipState = {
  visible: boolean;
  name: string;
  value: number;
  color: string;
};

const LeaveBalance = ({ balance }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const data = useMemo(
    () => [
      { name: "annual", value: balance.annual },
      { name: "Sick", value: balance.sick },
    ],
    [balance.annual, balance.sick],
  );

  const total = useMemo(
    () => data.reduce((sum, d) => sum + d.value, 0),
    [data],
  );

  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    name: "",
    value: 0,
    color: "",
  });

  const updateTooltipPosition = (clientX: number, clientY: number) => {
    if (!containerRef.current || !tooltipRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    tooltipRef.current.style.left = `${x}px`;
    tooltipRef.current.style.top = `${y}px`;
    tooltipRef.current.style.transform =
      x > rect.width / 2
        ? "translate(calc(-100% - 12px), -50%)"
        : "translate(12px, -50%)";
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateTooltipPosition(e.clientX, e.clientY);
  };

  const handleMouseLeave = () =>
    setTooltip((prev) => ({ ...prev, visible: false }));

  return (
    <div className="flex flex-col bg-white shadow-md p-5 rounded-2xl h-full">
      <h2 className="mb-4 font-semibold text-xl">Leave Balance</h2>

      <div
        ref={containerRef}
        className="relative flex-1 w-full min-h-[200px]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={70}
              outerRadius={95}
              dataKey="value"
              paddingAngle={2}
              stroke="none"
              onMouseEnter={(entry, index) =>
                setTooltip((prev) => ({
                  ...prev,
                  visible: true,
                  name: entry.name as string,
                  value: entry.value as number,
                  color: COLORS[index % COLORS.length],
                }))
              }
              onMouseLeave={() =>
                setTooltip((prev) => ({ ...prev, visible: false }))
              }
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
          <p className="text-gray-500 text-sm">
            {tooltip.visible ? tooltip.name : "Total"}
          </p>
          <h3 className="font-bold text-3xl">
            {tooltip.visible ? tooltip.value : total}
          </h3>
        </div>

        {tooltip.visible && (
          <div
            ref={tooltipRef}
            className="z-50 absolute flex items-center gap-2 bg-white shadow-lg px-3 py-2 border border-gray-100 rounded-xl text-sm whitespace-nowrap pointer-events-none"
            style={{ left: 0, top: 0 }}
          >
            <span
              className="rounded-full w-2.5 h-2.5 shrink-0"
              style={{ backgroundColor: tooltip.color }}
            />
            <span className="font-medium text-gray-600">
              {tooltip.name}
              <strong className="ml-2 text-gray-800">{tooltip.value}</strong>
            </span>
          </div>
        )}
      </div>

      <hr className="mt-4 mb-2 border-gray-300" />

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="rounded-full w-3 h-3"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveBalance;
