import { describe, expect, it } from 'vitest';
import type { Expense } from '@/types/expense';
import { ALL } from '@/types/expense';
import {
  budgetLevel,
  expensesInRange,
  rangeKey,
  filterExpenses,
  groupByDay,
  largestExpense,
  percentChange,
  sumAmounts,
  totalsByCategory,
} from './expenses';
import { daysCountedInMonth, lastMonthKeys, shiftMonth } from './dates';
import { validateExpense } from './validation';

const makeExpense = (overrides: Partial<Expense>): Expense => ({
  id: 'id',
  title: 'Coffee',
  amount: 100,
  categoryId: 'food',
  date: '2026-11-03',
  paymentMethod: 'card',
  createdAt: '2026-11-03T08:00:00.000Z',
  updatedAt: '2026-11-03T08:00:00.000Z',
  ...overrides,
});

const expenses: Expense[] = [
  makeExpense({ id: 'a', amount: 120.5, date: '2026-11-03' }),
  makeExpense({ id: 'b', amount: 80, date: '2026-11-01', categoryId: 'bills', title: 'Phone' }),
  makeExpense({ id: 'c', amount: 900, date: '2026-10-15', note: 'flight deposit' }),
];

describe('expense utils', () => {
  it('sums amounts without float drift', () => {
    expect(sumAmounts([makeExpense({ amount: 0.1 }), makeExpense({ amount: 0.2 })])).toBe(0.3);
  });

  it('filters by month, category and search', () => {
    const base = {
      period: 'month',
      week: '2026-10-26',
      month: '2026-11',
      year: '2026',
      categoryId: ALL,
      paymentMethod: ALL,
      search: '',
    } as const;
    expect(filterExpenses(expenses, base).map((e) => e.id)).toEqual(['a', 'b']);
    expect(filterExpenses(expenses, { ...base, categoryId: 'bills' }).map((e) => e.id)).toEqual([
      'b',
    ]);
    expect(filterExpenses(expenses, { ...base, month: '2026-10', search: 'FLIGHT' })).toHaveLength(
      1,
    );
  });

  it('filters by week (Monday to Sunday) and by year', () => {
    const base = {
      period: 'week',
      week: '2026-10-12',
      month: '2026-11',
      year: '2026',
      categoryId: ALL,
      paymentMethod: ALL,
      search: '',
    } as const;
    expect(filterExpenses(expenses, base).map((e) => e.id)).toEqual(['c']);
    expect(filterExpenses(expenses, { ...base, week: '2026-10-19' })).toHaveLength(0);
    expect(filterExpenses(expenses, { ...base, period: 'year' })).toHaveLength(3);
    expect(filterExpenses(expenses, { ...base, period: 'year', year: '2025' })).toHaveLength(0);
  });

  it('keeps expenses inside a date range, both ends included', () => {
    const range = rangeKey({ start: '2026-10-15', end: '2026-11-01' });
    expect(range).toBe('2026-10-15..2026-11-01');
    expect(expensesInRange(expenses, range).map((e) => e.id)).toEqual(['b', 'c']);
  });

  it('groups by day newest first', () => {
    const groups = groupByDay(expenses);
    expect(groups.map((g) => g.date)).toEqual(['2026-11-03', '2026-11-01', '2026-10-15']);
  });

  it('totals by category, largest first', () => {
    const totals = totalsByCategory(expenses, [], { name: 'Other', color: '#000' });
    expect(totals[0]).toMatchObject({ categoryId: 'food', total: 1020.5 });
  });

  it('computes percent change and largest expense', () => {
    expect(percentChange(150, 100)).toBe(0.5);
    expect(percentChange(10, 0)).toBeNull();
    expect(largestExpense(expenses)?.id).toBe('c');
  });

  it('classifies budget levels', () => {
    expect(budgetLevel(0.5)).toBe('healthy');
    expect(budgetLevel(0.8)).toBe('warning');
    expect(budgetLevel(1)).toBe('exceeded');
  });
});

describe('date utils', () => {
  it('shifts months across years', () => {
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(lastMonthKeys('2026-02', 3)).toEqual(['2025-12', '2026-01', '2026-02']);
  });

  it('counts elapsed days for the current month only', () => {
    const today = new Date(2026, 10, 4);
    expect(daysCountedInMonth('2026-11', today)).toBe(4);
    expect(daysCountedInMonth('2026-10', today)).toBe(31);
    expect(daysCountedInMonth('2026-12', today)).toBe(0);
  });
});

describe('validateExpense', () => {
  it('flags every invalid field', () => {
    const errors = validateExpense({
      title: ' ',
      amount: '0',
      categoryId: '',
      date: 'nope',
      note: '',
      paymentMethod: 'card',
      split: false,
      splitMode: 'even',
      partnerShare: '',
      visibility: 'shared',
      repeats: false,
      dayOfMonth: '',
    });
    expect(Object.keys(errors).sort()).toEqual(['amount', 'categoryId', 'date', 'title']);
  });
});
