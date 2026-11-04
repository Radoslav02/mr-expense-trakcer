import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import { UNCATEGORIZED_COLOR } from '@/constants/categories';
import { MONTHS_IN_TREND } from '@/constants/expenses';
import { selectCategories } from '@/redux/categories/categoriesSelectors';
import { selectMonthlyBudget } from '@/redux/settings/settingsSelectors';
import { ALL } from '@/types/expense';
import { daysCountedInMonth, lastMonthKeys, shiftMonth } from '@/utils/dates';
import {
  budgetLevel,
  expensesInMonth,
  filterExpenses,
  groupByDay,
  largestExpense,
  percentChange,
  sumAmounts,
  totalsByCategory,
  totalsByMonth,
} from '@/utils/expenses';

export const selectExpenses = (state: RootState) => state.expenses.items;
export const selectExpensesStatus = (state: RootState) => state.expenses.status;
export const selectExpensesError = (state: RootState) => state.expenses.error;
export const selectExpenseFilters = (state: RootState) => state.expenses.filters;
export const selectExpensesMutating = (state: RootState) =>
  state.expenses.mutationStatus === 'loading';

const selectMonthArg = (_state: RootState, month: string) => month;

export const selectFilteredExpenses = createSelector(
  [selectExpenses, selectExpenseFilters],
  filterExpenses,
);

export const selectFilteredTotal = createSelector([selectFilteredExpenses], sumAmounts);

export const selectFilteredDayGroups = createSelector([selectFilteredExpenses], groupByDay);

export const selectHasActiveFilters = createSelector(
  [selectExpenseFilters],
  (filters) =>
    filters.categoryId !== ALL || filters.paymentMethod !== ALL || filters.search.trim() !== '',
);

export const selectExpenseCountsByCategory = createSelector([selectExpenses], (expenses) =>
  expenses.reduce<Record<string, number>>((counts, expense) => {
    counts[expense.categoryId] = (counts[expense.categoryId] ?? 0) + 1;
    return counts;
  }, {}),
);

export const selectMonthSummary = createSelector(
  [selectExpenses, selectMonthArg],
  (expenses, month) => {
    const current = expensesInMonth(expenses, month);
    const total = sumAmounts(current);
    const previousTotal = sumAmounts(expensesInMonth(expenses, shiftMonth(month, -1)));
    const days = daysCountedInMonth(month);
    return {
      total,
      count: current.length,
      previousTotal,
      change: percentChange(total, previousTotal),
      dailyAverage: days > 0 ? total / days : 0,
      largest: largestExpense(current),
    };
  },
);

export const selectCategoryTotalsForMonth = createSelector(
  [selectExpenses, selectCategories, selectMonthArg],
  (expenses, categories, month) =>
    totalsByCategory(expensesInMonth(expenses, month), categories, {
      name: 'Uncategorized',
      color: UNCATEGORIZED_COLOR,
    }),
);

export const selectMonthlyTrend = createSelector(
  [selectExpenses, selectMonthArg],
  (expenses, month) => totalsByMonth(expenses, lastMonthKeys(month, MONTHS_IN_TREND)),
);

export const selectBudgetProgress = createSelector(
  [selectMonthSummary, selectMonthlyBudget],
  (summary, budget) => {
    if (!budget) return null;
    const ratio = summary.total / budget;
    return {
      budget,
      spent: summary.total,
      remaining: budget - summary.total,
      ratio,
      level: budgetLevel(ratio),
    };
  },
);
