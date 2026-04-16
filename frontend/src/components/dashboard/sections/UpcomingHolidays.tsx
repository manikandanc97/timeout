"use client";

import { CalendarDays } from "lucide-react";
import type { Holiday } from "@/types/holiday";

type Props = {
  holidays: Holiday[];
};

const UpcomingHolidays = ({ holidays = [] }: Props) => {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-md">
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-icon-chip-calendar-bg">
          <CalendarDays size={18} className="text-icon-chip-calendar-fg" />
        </div>
        <h2 className="text-lg font-semibold">Upcoming Holidays</h2>
      </div>

      <div className="flex flex-1 flex-col text-left">
        {holidays.length > 0 ? (
          <div className="max-h-100 space-y-1 overflow-y-auto pr-1 text-left">
            {holidays.map((holiday) => (
              <div
                key={holiday.id}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-dashed border-border py-4 text-left last:border-0"
              >
                <span className="min-w-0 flex-1 text-sm font-medium">
                  {holiday.name}
                </span>
                <span className="shrink-0 text-sm text-muted-foreground">
                  {new Date(holiday.date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center text-muted-foreground">
            <CalendarDays size={32} className="mb-3 opacity-20" />
            <p className="text-sm">No upcoming holidays</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingHolidays;
