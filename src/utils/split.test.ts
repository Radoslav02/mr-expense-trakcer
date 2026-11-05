import { describe, expect, it } from 'vitest';
import type { Expense } from '@/types/expense';
import { categoryMapper, halfOf, isSplit, ownShare, personalExpenses, splitBalance } from './split';
import { sumAmounts } from './expenses';
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

describe('personalExpenses', () => {
  const mine = [
    makeExpense({ id: 'groceries', amount: 2000, partnerShare: 1000, categoryId: 'my-food' }),
    makeExpense({ id: 'coffee', amount: 300, categoryId: 'my-food' }),
  ];
  const theirs = [
    makeExpense({ id: 'rent', amount: 50000, partnerShare: 25000, categoryId: 'their-home' }),
    makeExpense({ id: 'shoes', amount: 8000, categoryId: 'their-clothes' }),
  ];
  const cat = (id: string, name: string) => ({ id, name, color: '#000', isDefault: false });
  const myCategories = [cat('my-food', 'Food'), cat('my-home', 'Home'), cat('other', 'Other')];
  const theirCategories = [cat('their-home', 'home'), cat('their-clothes', 'Clothes')];

  it('halves my split expenses and adds my half of theirs', () => {
    const view = personalExpenses(
      mine,
      theirs,
      categoryMapper(theirCategories, myCategories, 'other'),
    );
    expect(view.map((e) => [e.id, e.amount, e.categoryId])).toEqual([
      ['groceries', 1000, 'my-food'],
      ['coffee', 300, 'my-food'],
      ['shared:rent', 25000, 'my-home'],
    ]);
    expect(view[0].shared).toEqual({ total: 2000, paidByOther: false });
    expect(view[2].shared).toEqual({ total: 50000, paidByOther: true });
    expect(view[2].partnerShare).toBeUndefined();
    expect(sumAmounts(view)).toBe(26300);
  });

  it('falls back to the Other category when no name matches', () => {
    const map = categoryMapper(myCategories, theirCategories, 'other');
    expect(map('my-food')).toBe('my-food');
    expect(categoryMapper(myCategories, myCategories, 'other')('missing')).toBe('other');
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
