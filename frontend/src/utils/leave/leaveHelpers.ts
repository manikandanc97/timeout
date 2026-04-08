export const startDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const calculateLeaveDays = (startDate: string, endDate: string) => {
  if (!startDate || !endDate)
    return { totalCalendar: 0, weekends: 0, workingDays: 0 };

  const start = new Date(startDate);
  const end = new Date(endDate);

  let weekends = 0;
  let current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      weekends++;
    }
    current.setDate(current.getDate() + 1);
  }

  const totalCalendar =
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return { totalCalendar, weekends, workingDays: totalCalendar - weekends };
};
