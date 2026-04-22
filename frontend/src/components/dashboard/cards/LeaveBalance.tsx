"use client";

import React from "react";
import type { LeaveBalance as LeaveBalanceType } from "@/types/leave";

type Props = {
  balance: LeaveBalanceType;
};

const COLORS = ["#0E7490", "#14B8A6", "#6366F1"];

const LeaveBalance = ({ balance }: Props) => {
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

      <div className="relative flex h-[240px] min-h-[200px] w-full min-w-0 items-center justify-center">
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
              >
                <title>{`${item.name}: ${item.value}`}</title>
              </circle>
            );
          })}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground">Total balance</p>
          <h3 className="text-3xl font-bold text-card-foreground">{total}</h3>
        </div>
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
