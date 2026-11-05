import type { Expense } from '@/types/expense';
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
