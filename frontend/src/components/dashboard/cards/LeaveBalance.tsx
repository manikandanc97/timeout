"use client";

import React, { useRef, useState } from "react";
import type { LeaveBalance as LeaveBalanceType } from "@/types/leave";

type Props = {
  balance: LeaveBalanceType;
};

const COLORS = ["#0E7490", "#14B8A6", "#6366F1"];

const LeaveBalance = ({ balance }: Props) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [activeSegment, setActiveSegment] = useState<{ name: string; value: number } | null>(null);

  const data = [
    { name: "Annual", value: balance.annual },
    { name: "Sick", value: balance.sick },
    { name: "Comp off", value: balance.compOff ?? 0 },
  ];
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  let progressOffset = 0;

  return (
    <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Leave Balance</h2>

      <div
        ref={containerRef}
        className="relative flex h-[240px] min-h-[200px] w-full min-w-0 items-center justify-center"
        onMouseLeave={() => {
          setTooltip(null);
          setActiveSegment(null);
        }}
      >
        <svg
          viewBox="0 0 220 220"
          className="h-full w-full max-w-[260px] -rotate-90"
          aria-hidden
        >
          <circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="color-mix(in srgb, var(--border) 75%, transparent)"
            strokeWidth="24"
          />
          {data.map((item, index) => {
            const segmentLength =
              total > 0 ? (item.value / total) * circumference : 0;
            const dashOffset = -progressOffset;
            progressOffset += segmentLength;

            return (
              <circle
                key={item.name}
                cx="110"
                cy="110"
                r={radius}
                fill="none"
                stroke={COLORS[index % COLORS.length]}
                strokeWidth="24"
                strokeLinecap="round"
                strokeDasharray={`${Math.max(segmentLength, 0)} ${circumference}`}
                strokeDashoffset={dashOffset}
                className="cursor-pointer transition-opacity duration-150"
                opacity={activeSegment && activeSegment.name !== item.name ? 0.4 : 1}
                onMouseEnter={(event) => {
                  const rect = containerRef.current?.getBoundingClientRect();

                  if (!rect) {
                    return;
                  }

                  setActiveSegment({ name: item.name, value: item.value });
                  setTooltip({
                    text: `${item.name}: ${item.value}`,
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
                    text: `${item.name}: ${item.value}`,
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top,
                  });
                }}
              />
            );
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {activeSegment ? activeSegment.name : "Total balance"}
          </p>
          <h3 className="text-3xl font-bold text-card-foreground">
            {activeSegment ? activeSegment.value : total}
          </h3>
        </div>

        {tooltip ? (
          <div
            className="pointer-events-none absolute z-50 rounded-lg border border-border bg-foreground px-2.5 py-1.5 text-xs whitespace-nowrap text-background shadow-lg"
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: "translate(-50%, calc(-100% - 8px))",
            }}
          >
            {tooltip.text}
            <div
              className="absolute h-2 w-2 rotate-45 bg-foreground"
              style={{
                left: "50%",
                bottom: "-4px",
                transform: "translateX(-50%)",
              }}
            />
          </div>
        ) : null}
      </div>

      <hr className="mb-2 mt-4 border-border" />

      <div className="mt-4 flex flex-wrap justify-center gap-4">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-muted-foreground">{item.name}</span>
            <span className="text-sm font-semibold text-card-foreground">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveBalance;
