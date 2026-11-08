import type { GroupExpense, GroupPayment, Transfer } from '@/types/group';

/** All math runs in whole cents so balances always add up exactly. */
const toCents = (amount: number) => Math.round(amount * 100);
const fromCents = (cents: number) => cents / 100;

/**
 * Splits an amount evenly between members. Leftover cents go one each to the first members,
 * so the parts always add up to the amount (100 / 3 → 33.34, 33.33, 33.33).
 */
export const splitEqually = (
  amount: number,
  memberIds: readonly string[],
): Record<string, number> => {
  if (memberIds.length === 0) return {};
  const total = toCents(amount);
  const base = Math.floor(total / memberIds.length);
  const extra = total - base * memberIds.length;
  return Object.fromEntries(
    memberIds.map((id, index) => [id, fromCents(base + (index < extra ? 1 : 0))]),
  );
};

/** Sum of the parts, for checking an exact split adds up. */
export const sumShares = (shares: Record<string, number>): number =>
  fromCents(Object.values(shares).reduce((total, share) => total + toCents(share), 0));

/**
 * Each member's balance: positive means the group owes them, negative means they owe.
 * Paying for an expense or paying someone back raises it; a share of an expense or receiving
 * a payment lowers it. All balances add up to zero.
 */
export const memberBalances = (
  memberIds: readonly string[],
  expenses: readonly GroupExpense[],
  payments: readonly GroupPayment[],
): Record<string, number> => {
  const cents: Record<string, number> = Object.fromEntries(memberIds.map((id) => [id, 0]));
  const add = (id: string, value: number) => {
    cents[id] = (cents[id] ?? 0) + value;
  };
  expenses.forEach((expense) => {
    add(expense.paidBy, toCents(expense.amount));
    Object.entries(expense.shares).forEach(([id, share]) => add(id, -toCents(share)));
  });
  payments.forEach((payment) => {
    add(payment.from, toCents(payment.amount));
    add(payment.to, -toCents(payment.amount));
  });
  return Object.fromEntries(Object.entries(cents).map(([id, value]) => [id, fromCents(value)]));
};

const byAmountDesc = (a: Transfer, b: Transfer) => b.amount - a.amount;

/**
 * The fewest payments that settle everyone: the biggest debtor pays the biggest creditor,
 * repeatedly. If I covered Ana and Ana covered me, this nets it out.
 */
export const simplifiedTransfers = (balances: Record<string, number>): Transfer[] => {
  const debtors = Object.entries(balances)
    .map(([id, value]) => ({ id, cents: -toCents(value) }))
    .filter((entry) => entry.cents > 0)
    .sort((a, b) => b.cents - a.cents);
  const creditors = Object.entries(balances)
    .map(([id, value]) => ({ id, cents: toCents(value) }))
    .filter((entry) => entry.cents > 0)
    .sort((a, b) => b.cents - a.cents);

  const transfers: Transfer[] = [];
  let d = 0;
  let c = 0;
  while (d < debtors.length && c < creditors.length) {
    const amount = Math.min(debtors[d].cents, creditors[c].cents);
    transfers.push({ from: debtors[d].id, to: creditors[c].id, amount: fromCents(amount) });
    debtors[d].cents -= amount;
    creditors[c].cents -= amount;
    if (debtors[d].cents === 0) d += 1;
    if (creditors[c].cents === 0) c += 1;
  }
  return transfers.sort(byAmountDesc);
};

/**
 * Without simplifying: what each person owes each other person directly, from the expenses
 * they shared, less what they've paid back. Two people's debts to each other are netted.
 */
export const directTransfers = (
  expenses: readonly GroupExpense[],
  payments: readonly GroupPayment[],
): Transfer[] => {
  const owed = new Map<string, number>();
  const key = (from: string, to: string) => `${from}\u0000${to}`;
  const add = (from: string, to: string, cents: number) => {
    if (from === to || cents === 0) return;
    owed.set(key(from, to), (owed.get(key(from, to)) ?? 0) + cents);
  };
  expenses.forEach((expense) => {
    Object.entries(expense.shares).forEach(([id, share]) =>
      add(id, expense.paidBy, toCents(share)),
    );
  });
  payments.forEach((payment) => add(payment.to, payment.from, toCents(payment.amount)));

  const transfers: Transfer[] = [];
  const seen = new Set<string>();
  owed.forEach((cents, pair) => {
    const [from, to] = pair.split('\u0000');
    if (seen.has(pair)) return;
    seen.add(pair);
    seen.add(key(to, from));
    const net = cents - (owed.get(key(to, from)) ?? 0);
    if (net > 0) transfers.push({ from, to, amount: fromCents(net) });
    if (net < 0) transfers.push({ from: to, to: from, amount: fromCents(-net) });
  });
  return transfers.sort(byAmountDesc);
};

export const groupTransfers = (
  simplify: boolean,
  memberIds: readonly string[],
  expenses: readonly GroupExpense[],
  payments: readonly GroupPayment[],
): Transfer[] =>
  simplify
    ? simplifiedTransfers(memberBalances(memberIds, expenses, payments))
    : directTransfers(expenses, payments);
