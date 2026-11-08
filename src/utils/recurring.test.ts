import { describe, expect, it } from 'vitest';
import type { RecurringExpense } from '@/types/expense';
import { ordinal } from './dates';
import {
  MAX_CATCH_UP_MONTHS,
  dueDateIn,
  dueMonths,
  expenseFromTemplate,
  nextDueDate,
  ownPartOf,
  upcomingThisMonth,
} from './recurring';

const template = (overrides: Partial<RecurringExpense> = {}): RecurringExpense => ({
  id: 'rent',
  title: 'Rent',
  amount: 50000,
  categoryId: 'default-rent',
  paymentMethod: 'transfer',
  dayOfMonth: 5,
  lastMonth: '2026-10',
  createdAt: '2026-10-05T00:00:00.000Z',
  updatedAt: '2026-10-05T00:00:00.000Z',
  ...overrides,
});

describe('dueDateIn', () => {
  it('uses the last day when the month is shorter', () => {
    expect(dueDateIn('2026-02', 31)).toBe('2026-02-28');
    expect(dueDateIn('2028-02', 30)).toBe('2028-02-29');
    expect(dueDateIn('2026-11', 5)).toBe('2026-11-05');
  });
});

describe('dueMonths', () => {
  it('is empty before the due day and includes the month on it', () => {
    expect(dueMonths(template(), '2026-11-04')).toEqual([]);
    expect(dueMonths(template(), '2026-11-05')).toEqual(['2026-11']);
  });

  it('catches up on missed months, oldest first', () => {
    expect(dueMonths(template({ lastMonth: '2026-08' }), '2026-11-01')).toEqual([
      '2026-09',
      '2026-10',
    ]);
  });

  it('never catches up more than the cap', () => {
    expect(dueMonths(template({ lastMonth: '2020-01' }), '2026-11-30')).toHaveLength(
      MAX_CATCH_UP_MONTHS,
    );
  });

  it('is empty once this month was added', () => {
    expect(dueMonths(template({ lastMonth: '2026-11' }), '2026-11-30')).toEqual([]);
  });
});

describe('template helpers', () => {
  it('builds the month’s expense, dropping the split when private', () => {
    const shared = expenseFromTemplate(template({ partnerShare: 25000 }), '2026-11');
    expect(shared).toMatchObject({ date: '2026-11-05', partnerShare: 25000, recurringId: 'rent' });
    const own = expenseFromTemplate(template({ partnerShare: 25000, isPrivate: true }), '2026-11');
    expect(own.partnerShare).toBeUndefined();
  });

  it('counts only my part and finds what is still to come', () => {
    expect(ownPartOf(template({ partnerShare: 20000 }))).toBe(30000);
    expect(nextDueDate(template())).toBe('2026-11-05');
    const today = '2026-11-10';
    const later = template({ id: 'netflix', dayOfMonth: 20 });
    const done = template({ id: 'gym', dayOfMonth: 20, lastMonth: '2026-11' });
    const passed = template({ id: 'phone', dayOfMonth: 3 });
    expect(upcomingThisMonth([later, done, passed], today).map((item) => item.id)).toEqual([
      'netflix',
    ]);
  });
});

describe('ordinal', () => {
  it('handles the teens', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 31].map(ordinal)).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '12th',
      '13th',
      '21st',
      '22nd',
      '23rd',
      '31st',
    ]);
  });
});
