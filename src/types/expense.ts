export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  date: string;
  note?: string;
  paymentMethod: PaymentMethod;
  /** Amount the partner owes for this expense. Absent when the expense isn't split. */
  partnerShare?: number;
  createdAt: string;
  updatedAt: string;
  /**
   * Set only on derived entries for a split expense, where `amount` is this person's part.
   * Never stored.
   */
  shared?: SharedPortion;
}

export interface SharedPortion {
  /** The full price of the split expense. */
  total: number;
  /** True when the other person paid and this entry is the part owed to them. */
  paidByOther: boolean;
}

export type ExpenseInput = Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'shared'>;

export const ALL = 'all';
export type AllOption = typeof ALL;

export interface ExpenseFilters {
  month: string;
  categoryId: string | AllOption;
  paymentMethod: PaymentMethod | AllOption;
  search: string;
}

export interface ExpenseDayGroup {
  date: string;
  total: number;
  expenses: Expense[];
}
