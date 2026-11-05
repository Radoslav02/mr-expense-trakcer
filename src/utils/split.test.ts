import { describe, expect, it } from 'vitest';
import type { Expense } from '@/types/expense';
import { halfOf, isSplit, ownShare, splitBalance } from './split';
import { validateExpense, type ExpenseFormValues } from './validation';

const makeExpense = (overrides: Partial<Expense>): Expense => ({
  id: 'id',
  title: 'Dinner',
  amount: 100,
  categoryId: 'food',
  date: '2026-11-03',
  paymentMethod: 'card',
  createdAt: '2026-11-03T08:00:00.000Z',
  updatedAt: '2026-11-03T08:00:00.000Z',
  ...overrides,
});

describe('split utils', () => {
  it('knows when an expense is split and what the payer carries', () => {
    expect(isSplit(makeExpense({}))).toBe(false);
    expect(isSplit(makeExpense({ partnerShare: 40 }))).toBe(true);
    expect(ownShare(makeExpense({ partnerShare: 40 }))).toBe(60);
    expect(ownShare(makeExpense({}))).toBe(100);
    expect(halfOf(99.99)).toBe(50);
  });

  it('nets what each partner owes the other', () => {
    const balance = splitBalance(
      [makeExpense({ partnerShare: 50 }), makeExpense({ partnerShare: 10.1 }), makeExpense({})],
      [makeExpense({ amount: 300, partnerShare: 150 })],
    );
    expect(balance).toEqual({ owedToMe: 60.1, iOwe: 150, net: -89.9, meCount: 2, partnerCount: 1 });
  });
});

describe('validateExpense split', () => {
  const base: ExpenseFormValues = {
    title: 'Dinner',
    amount: '100',
    categoryId: 'food',
    date: '2026-11-03',
    note: '',
    paymentMethod: 'card',
    split: true,
    splitMode: 'custom',
    partnerShare: '',
  };

  it('requires a share between 0 and the amount for custom splits', () => {
    expect(validateExpense(base).partnerShare).toBeDefined();
    expect(validateExpense({ ...base, partnerShare: '120' }).partnerShare).toBeDefined();
    expect(validateExpense({ ...base, partnerShare: '100' }).partnerShare).toBeUndefined();
    expect(validateExpense({ ...base, partnerShare: '30,5' }).partnerShare).toBeUndefined();
  });

  it('ignores the share field for even splits and unsplit expenses', () => {
    expect(validateExpense({ ...base, splitMode: 'even' }).partnerShare).toBeUndefined();
    expect(validateExpense({ ...base, split: false }).partnerShare).toBeUndefined();
  });
});
