const MONTHS = {
  january: 0,
  jan: 0,
  february: 1,
  feb: 1,
  march: 2,
  mar: 2,
  april: 3,
  apr: 3,
  may: 4,
  june: 5,
  jun: 5,
  july: 6,
  jul: 6,
  august: 7,
  aug: 7,
  september: 8,
  sep: 8,
  sept: 8,
  october: 9,
  oct: 9,
  november: 10,
  nov: 10,
  december: 11,
  dec: 11,
};

const WEEKDAYS = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

const toIso = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const withDayMonth = (day, monthName) => {
  const now = new Date();
  const month = MONTHS[monthName];
  if (month == null) return null;
  let year = now.getFullYear();
  let date = new Date(year, month, day);
  if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    year += 1;
    date = new Date(year, month, day);
  }
  return toIso(date);
};

const parseRelativeWeekday = (modifier, weekdayName) => {
  const target = WEEKDAYS[weekdayName];
  if (target == null) return null;
  const now = new Date();
  const current = now.getDay();
  let diff = target - current;
  if (modifier === 'next') {
    diff = diff <= 0 ? diff + 7 : diff;
  } else if (modifier === 'this') {
    if (diff < 0) diff += 7;
  } else if (diff <= 0) {
    diff += 7;
  }
  const date = new Date(now);
  date.setDate(now.getDate() + diff);
  return toIso(date);
};

export const parseNaturalDate = (text) => {
  const value = String(text ?? '').toLowerCase();

  if (/\btomorrow\b/.test(value)) {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return toIso(date);
  }
  if (/\btoday\b/.test(value)) {
    return toIso(new Date());
  }

  const nextThisWeekday = value.match(/\b(next|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/);
  if (nextThisWeekday) {
    return parseRelativeWeekday(nextThisWeekday[1], nextThisWeekday[2]);
  }

  const monthPattern =
    '(?:january|jan|february|feb|march|mar|april|apr|may|june|jun|july|jul|august|aug|september|sept|sep|october|oct|november|nov|december|dec)';

  const dayMonth = value.match(
    new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?(?:\\s+of)?\\s+(${monthPattern})\\b`),
  );
  if (dayMonth) {
    return withDayMonth(Number(dayMonth[1]), dayMonth[2]);
  }

  const monthDay = value.match(
    new RegExp(`\\b(${monthPattern})\\s+(\\d{1,2})(?:st|nd|rd|th)?\\b`),
  );
  if (monthDay) {
    return withDayMonth(Number(monthDay[2]), monthDay[1]);
  }

  return null;
};
