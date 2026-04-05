"use client";

import { CalendarDays } from "lucide-react";

export type Holiday = {
  id: number;
  name: string;
  date: string;
};

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

      <div className="flex flex-col flex-1">
        {holidays.length > 0 ? (
          <div className="space-y-1">
            {holidays.map((holiday) => (
              <div
                key={holiday.id}
                className="flex justify-between items-center py-4 border-b border-dashed border-gray-200 last:border-0"
              >
                <span className="text-gray-700 font-medium text-sm flex-1">{holiday.name}</span>
                <span className="text-gray-500 text-sm flex-1 text-right">
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
          <div className="flex flex-col justify-center items-center flex-1 text-gray-400 py-10">
            <CalendarDays size={32} className="mb-3 opacity-20" />
            <p className="text-sm">No upcoming holidays</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingHolidays;
