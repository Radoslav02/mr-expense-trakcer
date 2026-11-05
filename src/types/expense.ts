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
}

export type ExpenseInput = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;

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
