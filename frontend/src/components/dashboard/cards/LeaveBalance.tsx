"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { Cell, Pie, PieChart } from "recharts";
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
  const [chartSize, setChartSize] = useState({ width: 320, height: 240 });

  const data = useMemo(
    () => [
      { name: "annual", value: balance.annual },
      { name: "Sick", value: balance.sick },
      { name: "Comp off", value: balance.compOff ?? 0 },
    ],
    [balance.annual, balance.sick, balance.compOff],
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

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const syncSize = () => {
      const nextWidth = Math.max(1, Math.floor(element.clientWidth));
      const nextHeight = Math.max(1, Math.floor(element.clientHeight));
      setChartSize({ width: nextWidth, height: nextHeight });
    };

    syncSize();

    const observer = new ResizeObserver(syncSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Leave Balance</h2>

      <div
        ref={containerRef}
        className="relative h-[240px] w-full min-h-[200px] min-w-0"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <PieChart width={chartSize.width} height={chartSize.height}>
          <Pie
            data={data}
            innerRadius={70}
            outerRadius={95}
            dataKey="value"
            paddingAngle={2}
            stroke="none"
            cx="50%"
            cy="50%"
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

        <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
          <p className="text-sm text-muted-foreground">
            {tooltip.visible ? tooltip.name : "Total"}
          </p>
          <h3 className="text-3xl font-bold text-card-foreground">
            {tooltip.visible ? tooltip.value : total}
          </h3>
        </div>

        {tooltip.visible && (
          <div
            ref={tooltipRef}
            className="pointer-events-none absolute z-50 flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm whitespace-nowrap text-muted-foreground shadow-lg"
            style={{ left: 0, top: 0 }}
          >
            <span
              className="rounded-full w-2.5 h-2.5 shrink-0"
              style={{ backgroundColor: tooltip.color }}
            />
            <span className="font-medium">
              {tooltip.name}
              <strong className="ml-2 text-card-foreground">{tooltip.value}</strong>
            </span>
          </div>
        )}
      </div>

      <hr className="mb-2 mt-4 border-border" />

      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="rounded-full w-3 h-3"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-muted-foreground">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveBalance;
