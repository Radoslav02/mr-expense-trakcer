/** Where an amount came from: what was left of a month's income, or any amount. */
export type SavingSource = 'leftover' | 'custom';

/** Money put into savings, or taken back out of them. */
export type SavingKind = 'deposit' | 'withdrawal';

/** Money put aside, e.g. what was left after a month, moved to a savings account. */
export interface Saving {
  id: string;
  /** Where it's kept: "Savings account", "Cash at home". */
  title: string;
  /** Always positive; `kind` says whether it adds to or takes from the balance. */
  amount: number;
  date: string;
  kind: SavingKind;
  source: SavingSource;
  /** Why money was taken out, e.g. "Lost wallet". */
  note?: string;
  /** Stored in the owner-only collection: the partner can't see it. */
  isPrivate?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SavingInput = Pick<
  Saving,
  'title' | 'amount' | 'date' | 'kind' | 'source' | 'note' | 'isPrivate'
>;

/** What an entry does to the balance: + for money put in, − for money taken out. */
export const signedAmount = (saving: Pick<Saving, 'amount' | 'kind'>): number =>
  saving.kind === 'withdrawal' ? -saving.amount : saving.amount;
