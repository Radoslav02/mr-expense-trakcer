export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  date: string;
  note?: string;
  paymentMethod: PaymentMethod;
  /** The partner's part of a shared (split) cost. Absent when the expense isn't split. */
  partnerShare?: number;
  /** Stored in the owner-only collection: the partner can't see it at all. */
  isPrivate?: boolean;
  /** Set when the expense was added by a monthly recurring expense. */
  recurringId?: string;
  /** Who last changed it, when that was the partner rather than the owner. */
  editedBy?: string;
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
  /** True when the other person bought it and this entry is my part of it. */
  paidByOther: boolean;
}

export type ExpenseInput = Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'shared' | 'editedBy'>;

/** A monthly template that adds an expense on `dayOfMonth` every month. */
export interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  categoryId: string;
  paymentMethod: PaymentMethod;
  note?: string;
  partnerShare?: number;
  isPrivate?: boolean;
  /** 1–31; months without that day use their last day. */
  dayOfMonth: number;
  /** The latest month (yyyy-MM) an expense was added for. */
  lastMonth: string;
  createdAt: string;
  updatedAt: string;
}

export type RecurringInput = Omit<RecurringExpense, 'id' | 'lastMonth' | 'createdAt' | 'updatedAt'>;

export const ALL = 'all';
export type AllOption = typeof ALL;

/** Which span of time the expense list shows. */
export type ExpensePeriod = 'week' | 'month' | 'year';

export interface ExpenseFilters {
  period: ExpensePeriod;
  /** Monday of the shown week (yyyy-MM-dd), when `period` is `week`. */
  week: string;
  /** The shown month (yyyy-MM), when `period` is `month`. */
  month: string;
  /** The shown year (yyyy), when `period` is `year`. */
  year: string;
  categoryId: string | AllOption;
  paymentMethod: PaymentMethod | AllOption;
  search: string;
}

export interface ExpenseDayGroup {
  date: string;
  total: number;
  expenses: Expense[];
}
