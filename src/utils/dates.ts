import {
  addMonths,
  addWeeks,
  addYears,
  endOfWeek,
  startOfWeek,
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

import { dateLocale, getMessages } from '@/i18n';

const MONTH_KEY_FORMAT = 'yyyy-MM';
const DATE_KEY_FORMAT = 'yyyy-MM-dd';

/** A date in the current language. Keys like `yyyy-MM-dd` use plain `format` instead. */
const localized = (date: Date, pattern: string): string =>
  format(date, pattern, { locale: dateLocale() });

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

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
  capitalize(localized(monthStart(monthKey), getMessages().common.dateFormats.month));

export const formatShortMonth = (monthKey: string): string =>
  capitalize(localized(monthStart(monthKey), getMessages().common.dateFormats.shortMonth));

export const formatDayHeading = (dateKey: string): string => {
  const date = parseISO(dateKey);
  const { common } = getMessages();
  if (isToday(date)) return common.today;
  if (isYesterday(date)) return common.yesterday;
  const { dayHeading, monthAfterDay } = common.dateFormats;
  // Put the inflected month in as quoted literal text, e.g. "EEEE, d. 'novembra'".
  const pattern = monthAfterDay
    ? dayHeading.replace('MMMM', `'${monthAfterDay[date.getMonth()]}'`)
    : dayHeading;
  return capitalize(localized(date, pattern));
};

export const formatShortDate = (dateKey: string): string =>
  localized(parseISO(dateKey), getMessages().common.dateFormats.shortDate);

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

const WEEK_OPTIONS = { weekStartsOn: 1 } as const;

/** Monday of the week a date falls in. */
export const weekStartKey = (date: Date = new Date()): string =>
  toDateKey(startOfWeek(date, WEEK_OPTIONS));

export const currentYearKey = (): string => format(new Date(), 'yyyy');

export const shiftWeek = (weekKey: string, amount: number): string =>
  toDateKey(addWeeks(parseISO(weekKey), amount));

export const shiftYear = (yearKey: string, amount: number): string =>
  format(addYears(parseISO(`${yearKey}-01-01`), amount), 'yyyy');

/** First and last day (yyyy-MM-dd) of the week starting on `weekKey`. */
export const weekBounds = (weekKey: string): { start: string; end: string } => ({
  start: weekKey,
  end: toDateKey(endOfWeek(parseISO(weekKey), WEEK_OPTIONS)),
});

/** "3 – 9 Nov", or "28 Oct – 3 Nov" across months. */
export const formatWeekLabel = (weekKey: string): string => {
  const { start, end } = weekBounds(weekKey);
  const pattern = getMessages().common.dateFormats.dayMonth;
  const from = parseISO(start);
  const to = parseISO(end);
  const sameMonth = from.getMonth() === to.getMonth();
  const startText = sameMonth
    ? format(from, pattern.startsWith('d.') ? 'd.' : 'd')
    : localized(from, pattern);
  return `${startText} – ${localized(to, pattern)}`;
};

/** 1 → "1st" in English, "1." in Serbian. */
export const ordinal = (day: number): string => getMessages().common.ordinal(day);
