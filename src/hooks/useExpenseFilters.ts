import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectExpenseFilters, selectHasActiveFilters } from '@/redux/expenses/expensesSelectors';
import { filtersChanged, filtersReset } from '@/redux/expenses/expensesSlice';
import type { ExpenseFilters } from '@/types/expense';

export const useExpenseFilters = () => {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectExpenseFilters);
  const hasActiveFilters = useAppSelector(selectHasActiveFilters);

  const setFilter = useCallback(
    <K extends keyof ExpenseFilters>(key: K, value: ExpenseFilters[K]) => {
      dispatch(filtersChanged({ [key]: value }));
    },
    [dispatch],
  );

  const resetFilters = useCallback(() => dispatch(filtersReset()), [dispatch]);

  return { filters, hasActiveFilters, setFilter, resetFilters };
};
