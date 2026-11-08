import { BUDGET_THRESHOLDS } from '@/constants/settings';
import type { Category } from '@/types/category';
import { ALL, type Expense, type ExpenseDayGroup, type ExpenseFilters } from '@/types/expense';
import {
  formatMonthLabel,
  formatWeekLabel,
  monthBounds,
  monthKeyOf,
  todayKey,
  weekBounds,
} from './dates';
import { roundMoney } from './currency';

export const sumAmounts = (expenses: readonly Expense[]): number =>
  roundMoney(expenses.reduce((total, expense) => total + expense.amount, 0));

export const sortByDateDesc = (expenses: readonly Expense[]): Expense[] =>
  [...expenses].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );

export const expensesInMonth = (expenses: readonly Expense[], monthKey: string): Expense[] =>
  expenses.filter((expense) => monthKeyOf(expense.date) === monthKey);

const matchesSearch = (expense: Expense, search: string): boolean => {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  return [expense.title, expense.note ?? ''].some((text) => text.toLowerCase().includes(query));
};

/** First and last day (yyyy-MM-dd) of the period the filters show. */
export const periodBounds = (filters: ExpenseFilters): { start: string; end: string } => {
  if (filters.period === 'week') return weekBounds(filters.week);
  if (filters.period === 'year')
    return { start: `${filters.year}-01-01`, end: `${filters.year}-12-31` };
  return monthBounds(filters.month);
};

const inPeriod = (date: string, filters: ExpenseFilters): boolean => {
  if (filters.period === 'month') return monthKeyOf(date) === filters.month;
  if (filters.period === 'year') return date.startsWith(`${filters.year}-`);
  const { start, end } = weekBounds(filters.week);
  return date >= start && date <= end;
};

/** "3 – 9 Nov", "November 2026" or "2026". */
export const periodLabel = (filters: ExpenseFilters): string =>
  filters.period === 'week'
    ? formatWeekLabel(filters.week)
    : filters.period === 'year'
      ? filters.year
      : formatMonthLabel(filters.month);

/** Today when it's in the shown period, otherwise the period's first day. */
export const defaultDateInPeriod = (filters: ExpenseFilters): string => {
  const today = todayKey();
  const { start, end } = periodBounds(filters);
  return today >= start && today <= end ? today : start;
};

export const filterExpenses = (expenses: readonly Expense[], filters: ExpenseFilters): Expense[] =>
  expenses.filter(
    (expense) =>
      inPeriod(expense.date, filters) &&
      (filters.categoryId === ALL || expense.categoryId === filters.categoryId) &&
      (filters.paymentMethod === ALL || expense.paymentMethod === filters.paymentMethod) &&
      matchesSearch(expense, filters.search),
  );

export const groupByDay = (expenses: readonly Expense[]): ExpenseDayGroup[] => {
  const groups = new Map<string, Expense[]>();
  sortByDateDesc(expenses).forEach((expense) => {
    const group = groups.get(expense.date) ?? [];
    group.push(expense);
    groups.set(expense.date, group);
  });
  return Array.from(groups, ([date, items]) => ({
    date,
    expenses: items,
    total: sumAmounts(items),
  }));
};

export interface CategoryTotal {
  categoryId: string;
  name: string;
  color: string;
  total: number;
}

export const totalsByCategory = (
  expenses: readonly Expense[],
  categories: readonly Category[],
  fallback: { name: string; color: string },
): CategoryTotal[] => {
  const totals = new Map<string, number>();
  expenses.forEach((expense) => {
    totals.set(expense.categoryId, (totals.get(expense.categoryId) ?? 0) + expense.amount);
  });
  return Array.from(totals, ([categoryId, total]) => {
    const category = categories.find((item) => item.id === categoryId);
    return {
      categoryId,
      name: category?.name ?? fallback.name,
      color: category?.color ?? fallback.color,
      total: roundMoney(total),
    };
  }).sort((a, b) => b.total - a.total);
};

export interface MonthTotal {
  month: string;
  total: number;
}

export const totalsByMonth = (
  expenses: readonly Expense[],
  months: readonly string[],
): MonthTotal[] =>
  months.map((month) => ({ month, total: sumAmounts(expensesInMonth(expenses, month)) }));

export const percentChange = (current: number, previous: number): number | null =>
  previous === 0 ? null : (current - previous) / previous;

export const largestExpense = (expenses: readonly Expense[]): Expense | null =>
  expenses.reduce<Expense | null>(
    (largest, expense) => (!largest || expense.amount > largest.amount ? expense : largest),
    null,
  );

export type BudgetLevel = 'healthy' | 'warning' | 'exceeded';

export const budgetLevel = (ratio: number): BudgetLevel => {
  if (ratio >= BUDGET_THRESHOLDS.exceeded) return 'exceeded';
  if (ratio >= BUDGET_THRESHOLDS.warning) return 'warning';
  return 'healthy';
};

export const countByCategory = (expenses: readonly Expense[], categoryId: string): number =>
  expenses.filter((expense) => expense.categoryId === categoryId).length;
