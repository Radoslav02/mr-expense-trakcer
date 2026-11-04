import { describe, expect, it } from 'vitest';
import type { Expense } from '@/types/expense';
import {
  buildSharedFeed,
  compareCategories,
  compareTrends,
  deriveLinkStatus,
  firstName,
  splitSpending,
} from './comparison';

const partner = { uid: 'p1', email: 'Ana@Example.com', displayName: 'Ana Petrović' };

describe('deriveLinkStatus', () => {
  it('is none without a partner email', () => {
    expect(deriveLinkStatus({ partnerEmail: null, incoming: partner })).toBe('none');
  });

  it('is pending until the partner shares back', () => {
    expect(deriveLinkStatus({ partnerEmail: 'ana@example.com', incoming: null })).toBe('pending');
  });

  it('is connected when both sides match, ignoring case', () => {
    expect(deriveLinkStatus({ partnerEmail: 'ana@example.com', incoming: partner })).toBe(
      'connected',
    );
  });
});

describe('comparison helpers', () => {
  it('derives a short name', () => {
    expect(firstName('Ana Petrović', null, 'Partner')).toBe('Ana');
    expect(firstName(null, 'marko@x.rs', 'Partner')).toBe('marko');
  });

  it('splits spending into shares', () => {
    expect(splitSpending(300, 100)).toMatchObject({ total: 400, meShare: 0.75, difference: 200 });
    expect(splitSpending(0, 0).meShare).toBe(0.5);
  });

  it('merges categories by name across both people', () => {
    const rows = compareCategories(
      [{ categoryId: 'a', name: 'Food', color: '#f00', total: 100 }],
      [
        { categoryId: 'b', name: 'food', color: '#0f0', total: 50 },
        { categoryId: 'c', name: 'Rent', color: '#00f', total: 500 },
      ],
    );
    expect(rows.map((row) => [row.name, row.me, row.partner])).toEqual([
      ['Rent', 0, 500],
      ['Food', 100, 50],
    ]);
  });

  it('zips monthly trends', () => {
    expect(
      compareTrends([{ month: '2026-10', total: 10 }], [{ month: '2026-10', total: 20 }]),
    ).toEqual([{ month: '2026-10', me: 10, partner: 20 }]);
  });

  it('builds one feed sorted newest first', () => {
    const make = (id: string, date: string): Expense => ({
      id,
      title: id,
      amount: 1,
      categoryId: 'x',
      date,
      paymentMethod: 'card',
      createdAt: `${date}T10:00:00.000Z`,
      updatedAt: `${date}T10:00:00.000Z`,
    });
    const feed = buildSharedFeed(
      { expenses: [make('mine', '2026-11-01')], categories: [] },
      { expenses: [make('theirs', '2026-11-03')], categories: [] },
    );
    expect(feed.map((item) => [item.owner, item.expense.id])).toEqual([
      ['partner', 'theirs'],
      ['me', 'mine'],
    ]);
  });
});
