import type { AsyncStatus } from '@/types/async';
import type { Expense, ExpenseFilters } from '@/types/expense';

export interface ExpensesState {
  items: Expense[];
  filters: ExpenseFilters;
  status: AsyncStatus;
  mutationStatus: AsyncStatus;
  error: string | null;
}
