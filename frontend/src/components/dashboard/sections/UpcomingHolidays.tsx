"use client";

import { CalendarDays } from "lucide-react";
import type { Holiday } from "@/types/holiday";

type Props = {
  holidays: Holiday[];
};

const UpcomingHolidays = ({ holidays = [] }: Props) => {
  return (
    <div className="flex flex-col bg-white shadow-md p-5 rounded-2xl h-full">
      <div className="flex items-center gap-2 mb-6">
        <div className="flex justify-center items-center bg-purple-50 rounded-lg w-8 h-8">
          <CalendarDays size={18} className="text-purple-500" />
        </div>
        <h2 className="font-semibold text-lg">Upcoming Holidays</h2>
      </div>

      <div className="flex flex-1 flex-col text-left">
        {holidays.length > 0 ? (
          <div className="space-y-1 text-left">
            {holidays.map((holiday) => (
              <div
                key={holiday.id}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-dashed border-gray-200 py-4 text-left last:border-0"
              >
                <span className="min-w-0 flex-1 font-medium text-gray-700 text-sm">
                  {holiday.name}
                </span>
                <span className="shrink-0 text-gray-500 text-sm">
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
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center text-gray-400">
            <CalendarDays size={32} className="mb-3 opacity-20" />
            <p className="text-sm">No upcoming holidays</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingHolidays;
