/** Where an amount came from: what was left of a month's income, or any amount. */
export type SavingSource = 'leftover' | 'custom';

/** Money put aside, e.g. what was left after a month, moved to a savings account. */
export interface Saving {
  id: string;
  /** Where it's kept: "Savings account", "Cash at home". */
  title: string;
  amount: number;
  date: string;
  source: SavingSource;
  /** Stored in the owner-only collection: the partner can't see it. */
  isPrivate?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SavingInput = Pick<Saving, 'title' | 'amount' | 'date' | 'source' | 'isPrivate'>;
