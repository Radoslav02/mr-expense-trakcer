import {
  addMonths,
  differenceInCalendarDays,
  endOfMonth,
  format,
  getDaysInMonth,
  isSameMonth,
  isToday,
  isValid,
  isYesterday,
  parseISO,
  startOfMonth,
} from 'date-fns';

const MONTH_KEY_FORMAT = 'yyyy-MM';
const DATE_KEY_FORMAT = 'yyyy-MM-dd';

export const toDateKey = (date: Date): string => format(date, DATE_KEY_FORMAT);

export const toMonthKey = (date: Date): string => format(date, MONTH_KEY_FORMAT);

export const todayKey = (): string => toDateKey(new Date());

export const currentMonthKey = (): string => toMonthKey(new Date());

export const monthKeyOf = (dateKey: string): string => dateKey.slice(0, MONTH_KEY_FORMAT.length);

export const monthStart = (monthKey: string): Date => parseISO(`${monthKey}-01`);

export const shiftMonth = (monthKey: string, amount: number): string =>
  toMonthKey(addMonths(monthStart(monthKey), amount));

export const isValidDateKey = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && isValid(parseISO(value));

export const formatMonthLabel = (monthKey: string): string =>
  format(monthStart(monthKey), 'MMMM yyyy');

export const formatShortMonth = (monthKey: string): string => format(monthStart(monthKey), 'MMM');

export const formatDayHeading = (dateKey: string): string => {
  const date = parseISO(dateKey);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'EEEE, d MMMM');
};

export const formatShortDate = (dateKey: string): string => format(parseISO(dateKey), 'd MMM yyyy');

export const lastMonthKeys = (endMonthKey: string, count: number): string[] =>
  Array.from({ length: count }, (_, index) => shiftMonth(endMonthKey, index - count + 1));

export const daysCountedInMonth = (monthKey: string, today: Date = new Date()): number => {
  const start = monthStart(monthKey);
  if (start > today) return 0;
  if (isSameMonth(start, today)) return differenceInCalendarDays(today, start) + 1;
  return getDaysInMonth(start);
};

export const monthBounds = (monthKey: string): { start: string; end: string } => {
  const start = startOfMonth(monthStart(monthKey));
  return { start: toDateKey(start), end: toDateKey(endOfMonth(start)) };
};

/** 1 → "1st", 22 → "22nd". */
export const ordinal = (day: number): string => {
  const tens = day % 100;
  if (tens >= 11 && tens <= 13) return `${day}th`;
  const suffix = ['th', 'st', 'nd', 'rd'][day % 10] ?? 'th';
  return `${day}${day % 10 > 3 ? 'th' : suffix}`;
};
