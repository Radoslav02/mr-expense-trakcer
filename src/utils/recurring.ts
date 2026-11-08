import { getDaysInMonth } from 'date-fns';
import type { ExpenseInput, RecurringExpense } from '@/types/expense';
import { roundMoney } from './currency';
import { monthKeyOf, monthStart, shiftMonth, todayKey } from './dates';

/** How far back a long-unopened app catches up, so a forgotten template can't flood the list. */
export const MAX_CATCH_UP_MONTHS = 12;

const pad = (value: number) => String(value).padStart(2, '0');

/** The template's date in a month; months without that day use their last day. */
export const dueDateIn = (month: string, dayOfMonth: number): string =>
  `${month}-${pad(Math.min(dayOfMonth, getDaysInMonth(monthStart(month))))}`;

type Schedule = Pick<RecurringExpense, 'lastMonth' | 'dayOfMonth'>;

/** Months (oldest first) whose expense is due by `today` and hasn't been added yet. */
export const dueMonths = (template: Schedule, today: string = todayKey()): string[] => {
  const thisMonth = monthKeyOf(today);
  const months: string[] = [];
  let month = shiftMonth(template.lastMonth, 1);
  while (month <= thisMonth) {
    if (month < thisMonth || dueDateIn(month, template.dayOfMonth) <= today) months.push(month);
    month = shiftMonth(month, 1);
  }
  return months.slice(-MAX_CATCH_UP_MONTHS);
};

/** The next date this template adds an expense. */
export const nextDueDate = (template: Schedule): string =>
  dueDateIn(shiftMonth(template.lastMonth, 1), template.dayOfMonth);

/** Deterministic, so the same month's expense is never added twice. */
export const recurringExpenseId = (recurringId: string, month: string) => `${recurringId}-${month}`;

export const expenseFromTemplate = (template: RecurringExpense, month: string): ExpenseInput => ({
  title: template.title,
  amount: template.amount,
  categoryId: template.categoryId,
  date: dueDateIn(month, template.dayOfMonth),
  note: template.note,
  paymentMethod: template.paymentMethod,
  partnerShare: template.isPrivate ? undefined : template.partnerShare,
  isPrivate: template.isPrivate,
  recurringId: template.id,
});

/** What I carry myself: the full amount, or my part when it's split. */
export const ownPartOf = (template: Pick<RecurringExpense, 'amount' | 'partnerShare'>): number =>
  roundMoney(template.amount - (template.partnerShare ?? 0));

/** Templates that will still add an expense later this month. */
export const upcomingThisMonth = (
  templates: readonly RecurringExpense[],
  today: string = todayKey(),
): RecurringExpense[] => {
  const month = monthKeyOf(today);
  return templates.filter(
    (template) => template.lastMonth < month && dueDateIn(month, template.dayOfMonth) > today,
  );
};
