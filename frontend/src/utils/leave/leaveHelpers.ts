import type { Holiday } from '@/types/holiday';

export const startDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const calculateLeaveDays = (
  startDate: string,
  endDate: string,
  holidays: Holiday[] = [],
) => {
  if (!startDate || !endDate)
    return { totalCalendar: 0, weekends: 0, holidayWeekdays: 0, workingDays: 0 };

  const start = new Date(startDate);
  const end = new Date(endDate);

  // Pre-normalize holiday date strings to local date strings for quick lookup
  const holidaySet = new Set(
    holidays
      .map((h) => new Date(h.date))
      .filter((d) => !Number.isNaN(d.getTime()))
      .map((d) => d.toDateString()),
  );

  let weekends = 0;
  let holidayWeekdays = 0;
  let current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidaySet.has(current.toDateString());

    if (isWeekend) weekends++;
    else if (isHoliday) holidayWeekdays++;

    current.setDate(current.getDate() + 1);
  }

  const totalCalendar =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const workingDays = Math.max(
    0,
    totalCalendar - weekends - holidayWeekdays,
  );

  return { totalCalendar, weekends, holidayWeekdays, workingDays };
};
