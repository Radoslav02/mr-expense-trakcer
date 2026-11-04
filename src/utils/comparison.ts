import type { Category } from '@/types/category';
import type { Expense } from '@/types/expense';
import type { PartnerLink, PartnerLinkStatus, Person } from '@/types/partner';
import { roundMoney } from './currency';
import { sortByDateDesc, type CategoryTotal, type MonthTotal } from './expenses';

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const deriveLinkStatus = ({ partnerEmail, incoming }: PartnerLink): PartnerLinkStatus => {
  if (!partnerEmail) return 'none';
  return incoming && normalizeEmail(incoming.email) === normalizeEmail(partnerEmail)
    ? 'connected'
    : 'pending';
};

export const firstName = (displayName: string | null, email: string | null, fallback: string) =>
  displayName?.trim().split(/\s+/)[0] || email?.split('@')[0] || fallback;

export interface SpendingSplit {
  me: number;
  partner: number;
  total: number;
  meShare: number;
  partnerShare: number;
  difference: number;
}

export const splitSpending = (me: number, partner: number): SpendingSplit => {
  const total = roundMoney(me + partner);
  const meShare = total > 0 ? me / total : 0.5;
  return {
    me,
    partner,
    total,
    meShare,
    partnerShare: 1 - meShare,
    difference: roundMoney(me - partner),
  };
};

export interface CategoryComparisonRow {
  key: string;
  name: string;
  color: string;
  me: number;
  partner: number;
}

export const compareCategories = (
  mine: readonly CategoryTotal[],
  theirs: readonly CategoryTotal[],
): CategoryComparisonRow[] => {
  const rows = new Map<string, CategoryComparisonRow>();
  const add = (item: CategoryTotal, person: Person) => {
    const key = item.name.trim().toLowerCase();
    const row = rows.get(key) ?? { key, name: item.name, color: item.color, me: 0, partner: 0 };
    row[person] = roundMoney(row[person] + item.total);
    rows.set(key, row);
  };
  mine.forEach((item) => add(item, 'me'));
  theirs.forEach((item) => add(item, 'partner'));
  return [...rows.values()].sort((a, b) => b.me + b.partner - (a.me + a.partner));
};

export interface TrendComparisonPoint {
  month: string;
  me: number;
  partner: number;
}

export const compareTrends = (
  mine: readonly MonthTotal[],
  theirs: readonly MonthTotal[],
): TrendComparisonPoint[] =>
  mine.map(({ month, total }) => ({
    month,
    me: total,
    partner: theirs.find((item) => item.month === month)?.total ?? 0,
  }));

export interface FeedItem {
  owner: Person;
  expense: Expense;
  category?: Category;
}

const withOwner = (
  owner: Person,
  expenses: readonly Expense[],
  categories: readonly Category[],
): FeedItem[] =>
  expenses.map((expense) => ({
    owner,
    expense,
    category: categories.find((category) => category.id === expense.categoryId),
  }));

export const buildSharedFeed = (
  mine: { expenses: readonly Expense[]; categories: readonly Category[] },
  theirs: { expenses: readonly Expense[]; categories: readonly Category[] },
): FeedItem[] => {
  const items = [
    ...withOwner('me', mine.expenses, mine.categories),
    ...withOwner('partner', theirs.expenses, theirs.categories),
  ];
  const order = new Map(sortByDateDesc(items.map((item) => item.expense)).map((e, i) => [e, i]));
  return items.sort((a, b) => (order.get(a.expense) ?? 0) - (order.get(b.expense) ?? 0));
};
