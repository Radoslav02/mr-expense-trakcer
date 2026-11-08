import type { Expense } from '@/types/expense';
import type { Category } from '@/types/category';
import { roundMoney } from './currency';

export const isSplit = (expense: Expense): boolean => (expense.partnerShare ?? 0) > 0;

/** What the person who paid actually carries after the partner's share is taken off. */
export const ownShare = (expense: Expense): number =>
  roundMoney(expense.amount - (expense.partnerShare ?? 0));

export const halfOf = (amount: number): number => roundMoney(amount / 2);

const sumPartnerShares = (expenses: readonly Expense[]): number =>
  roundMoney(expenses.reduce((total, expense) => total + (expense.partnerShare ?? 0), 0));

export interface SplitBalance {
  /** What the partner owes me for splits I paid for. */
  owedToMe: number;
  /** What I owe the partner for splits they paid for. */
  iOwe: number;
  /** Positive: the partner owes me. Negative: I owe the partner. */
  net: number;
  meCount: number;
  partnerCount: number;
}

export const splitBalance = (
  mine: readonly Expense[],
  theirs: readonly Expense[],
): SplitBalance => {
  const mySplits = mine.filter(isSplit);
  const theirSplits = theirs.filter(isSplit);
  const owedToMe = sumPartnerShares(mySplits);
  const iOwe = sumPartnerShares(theirSplits);
  return {
    owedToMe,
    iOwe,
    net: roundMoney(owedToMe - iOwe),
    meCount: mySplits.length,
    partnerCount: theirSplits.length,
  };
};

const nameKey = (name: string) => name.trim().toLowerCase();

/**
 * Maps a category id from one person's categories to the other's: the synced copy of the same
 * shared category first, then one with the same name, then their "Other" category, so a shared
 * expense lands in the same place on both sides.
 */
export const categoryMapper = (
  from: readonly Category[],
  to: readonly Category[],
  fallbackId: string,
  /**
   * `sharedKey`: when the other side has no copy yet, use the category's shared key instead of
   * the fallback. Synced copies take the shared key as their id, so it resolves once they sync.
   * Use this when writing to the other person's data; `fallback` when only displaying.
   */
  whenMissing: 'fallback' | 'sharedKey' = 'fallback',
): ((categoryId: string) => string) => {
  const live = to.filter((category) => !category.deleted);
  const byKey = new Map(live.map((category) => [category.sharedKey, category.id]));
  const byName = new Map(live.map((category) => [nameKey(category.name), category.id]));
  const fallback = live.some((category) => category.id === fallbackId) ? fallbackId : null;
  return (categoryId) => {
    const source = from.find((category) => category.id === categoryId);
    const match = source
      ? (byKey.get(source.sharedKey) ?? byName.get(nameKey(source.name)))
      : // Not one of theirs: it may already be the shared key of one of mine.
        byKey.get(categoryId);
    if (match) return match;
    if (source && whenMissing === 'sharedKey' && !source.isPrivate) return source.sharedKey;
    return fallback ?? categoryId;
  };
};

export const OTHER_PAID_PREFIX = 'shared:';

/**
 * One person's spending: their own expenses with split ones reduced to their part, plus their
 * part of the other person's split expenses.
 */
export const personalExpenses = (
  own: readonly Expense[],
  other: readonly Expense[],
  mapCategory: (categoryId: string) => string,
): Expense[] => [
  ...own.map((expense) =>
    isSplit(expense)
      ? {
          ...expense,
          amount: ownShare(expense),
          shared: { total: expense.amount, paidByOther: false },
        }
      : expense,
  ),
  ...other.filter(isSplit).map(({ partnerShare, ...expense }) => ({
    ...expense,
    id: `${OTHER_PAID_PREFIX}${expense.id}`,
    amount: partnerShare ?? 0,
    categoryId: mapCategory(expense.categoryId),
    shared: { total: expense.amount, paidByOther: true },
  })),
];
