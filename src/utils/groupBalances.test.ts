import { describe, expect, it } from 'vitest';
import type { GroupExpense, GroupPayment } from '@/types/group';
import {
  directTransfers,
  memberBalances,
  simplifiedTransfers,
  splitEqually,
  sumShares,
} from './groupBalances';

const expense = (paidBy: string, shares: Record<string, number>): GroupExpense => ({
  id: Math.random().toString(),
  title: 'x',
  amount: sumShares(shares),
  date: '2026-11-08',
  paidBy,
  splitMode: 'exact',
  shares,
  createdBy: 'u',
  createdAt: '',
  updatedAt: '',
});

const payment = (from: string, to: string, amount: number): GroupPayment => ({
  id: Math.random().toString(),
  from,
  to,
  amount,
  date: '2026-11-08',
  createdBy: 'u',
  createdAt: '',
});

describe('splitEqually', () => {
  it('gives leftover cents to the first members so parts add up', () => {
    expect(splitEqually(100, ['a', 'b', 'c'])).toEqual({ a: 33.34, b: 33.33, c: 33.33 });
    expect(sumShares(splitEqually(100, ['a', 'b', 'c']))).toBe(100);
    expect(splitEqually(10, [])).toEqual({});
  });
});

describe('balances', () => {
  it('nets out people covering each other', () => {
    // I paid 300 for me and Ana; Ana paid 200 for both of us.
    const expenses = [expense('me', { me: 150, ana: 150 }), expense('ana', { me: 100, ana: 100 })];
    expect(memberBalances(['me', 'ana'], expenses, [])).toEqual({ me: 50, ana: -50 });
    expect(simplifiedTransfers(memberBalances(['me', 'ana'], expenses, []))).toEqual([
      { from: 'ana', to: 'me', amount: 50 },
    ]);
    expect(directTransfers(expenses, [])).toEqual([{ from: 'ana', to: 'me', amount: 50 }]);
  });

  it('settles a chain with fewer payments when simplified', () => {
    // Ana owes Bob 10, Bob owes Cara 10 → simplified: Ana pays Cara 10.
    const expenses = [expense('bob', { ana: 10 }), expense('cara', { bob: 10 })];
    expect(directTransfers(expenses, [])).toHaveLength(2);
    expect(simplifiedTransfers(memberBalances(['ana', 'bob', 'cara'], expenses, []))).toEqual([
      { from: 'ana', to: 'cara', amount: 10 },
    ]);
  });

  it('counts payments back and reaches zero when everything is settled', () => {
    const expenses = [expense('me', { me: 50, ana: 50 })];
    const paid = [payment('ana', 'me', 50)];
    expect(memberBalances(['me', 'ana'], expenses, paid)).toEqual({ me: 0, ana: 0 });
    expect(simplifiedTransfers(memberBalances(['me', 'ana'], expenses, paid))).toEqual([]);
    expect(directTransfers(expenses, paid)).toEqual([]);
  });

  it('keeps cents exact with uneven splits', () => {
    const shares = splitEqually(100, ['me', 'ana', 'bob']);
    const balances = memberBalances(['me', 'ana', 'bob'], [expense('me', shares)], []);
    expect(Object.values(balances).reduce((a, b) => a + b, 0)).toBeCloseTo(0, 10);
    expect(simplifiedTransfers(balances)).toEqual([
      { from: 'ana', to: 'me', amount: 33.33 },
      { from: 'bob', to: 'me', amount: 33.33 },
    ]);
  });
});
