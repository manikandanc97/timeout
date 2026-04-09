import type { Holiday } from '@/types/holiday';

export const startDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/** Local calendar day (no time) — same idea as backend `toLocalCalendarDate`. */
export const startOfLocalCalendarDay = (d: Date): Date => {
  if (Number.isNaN(d.getTime())) return d;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

const parseFormOrIsoToLocalDay = (value: string): Date => {
  const t = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) {
    const [y, m, d] = t.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return startOfLocalCalendarDay(new Date(value));
};

/**
 * Working days between two stored/API dates (matches backend getWorkingDays).
 * Use on leave history so "X days" matches balance deductions.
 */
export const workingDaysForLeaveRange = (
  fromIso?: string,
  toIso?: string,
  holidays: Holiday[] = [],
): number => {
  if (!fromIso || !toIso) return 0;
  const start = parseFormOrIsoToLocalDay(fromIso);
  const end = parseFormOrIsoToLocalDay(toIso);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  if (start > end) return 0;

  const holidaySet = new Set(
    holidays
      .map((h) => new Date(h.date))
      .filter((d) => !Number.isNaN(d.getTime()))
      .map((d) => startOfLocalCalendarDay(d).toDateString()),
  );

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dayOfWeek = cur.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidaySet.has(cur.toDateString());
    if (!isWeekend && !isHoliday) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
};

export const calculateLeaveDays = (
  startDate: string,
  endDate: string,
  holidays: Holiday[] = [],
) => {
  if (!startDate || !endDate)
    return { totalCalendar: 0, weekends: 0, holidayWeekdays: 0, workingDays: 0 };

  const start = parseFormOrIsoToLocalDay(startDate);
  const end = parseFormOrIsoToLocalDay(endDate);

  const holidaySet = new Set(
    holidays
      .map((h) => new Date(h.date))
      .filter((d) => !Number.isNaN(d.getTime()))
      .map((d) => startOfLocalCalendarDay(d).toDateString()),
  );

  let weekends = 0;
  let holidayWeekdays = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidaySet.has(current.toDateString());

    if (isWeekend) weekends++;
    else if (isHoliday) holidayWeekdays++;

    current.setDate(current.getDate() + 1);
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalCalendar =
    Math.floor(
      (end.getTime() - start.getTime()) / msPerDay,
    ) + 1;

  const workingDays = Math.max(
    0,
    totalCalendar - weekends - holidayWeekdays,
  );

  return { totalCalendar, weekends, holidayWeekdays, workingDays };
};
