import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import { getMessages, selectLanguage } from '@/i18n';
import { OTHER_CATEGORY_ID, UNCATEGORIZED_COLOR } from '@/constants/categories';
import { MONTHS_IN_TREND } from '@/constants/expenses';
import { localizeCategory, selectCategories } from '@/redux/categories/categoriesSelectors';
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
import { categoryMapper, personalExpenses } from '@/utils/split';

export const selectExpenses = (state: RootState) => state.expenses.items;
export const selectExpensesStatus = (state: RootState) => state.expenses.status;
export const selectExpensesError = (state: RootState) => state.expenses.error;
export const selectExpenseFilters = (state: RootState) => state.expenses.filters;
export const selectExpensesMutating = (state: RootState) =>
  state.expenses.mutationStatus === 'loading';

const selectMonthArg = (_state: RootState, month: string) => month;
const selectPartnerExpenses = (state: RootState) => state.partner.expenses;
const selectPartnerCategoryDocs = (state: RootState) => state.partner.categories;
const selectPartnerCategories = createSelector(
  [selectPartnerCategoryDocs, selectLanguage],
  (categories) => categories.filter((category) => !category.deleted).map(localizeCategory),
);

/** Raw expense documents by id, for editing and deleting the stored record. */
export const selectExpenseRecords = createSelector(
  [selectExpenses],
  (expenses): Readonly<Record<string, (typeof expenses)[number]>> =>
    Object.fromEntries(expenses.map((expense) => [expense.id, expense])),
);

/** What I actually spend: my part of split expenses, including ones my partner paid for. */
export const selectMySpending = createSelector(
  [selectExpenses, selectPartnerExpenses, selectPartnerCategories, selectCategories],
  (mine, theirs, theirCategories, myCategories) =>
    personalExpenses(
      mine,
      theirs,
      categoryMapper(theirCategories, myCategories, OTHER_CATEGORY_ID),
    ),
);

/** My expenses my partner can see: what the Together tab compares, so both sides match. */
export const selectMySharedExpenses = createSelector([selectExpenses], (expenses) =>
  expenses.filter((expense) => !expense.isPrivate),
);

export const selectMySharedSpending = createSelector(
  [selectMySharedExpenses, selectPartnerExpenses, selectPartnerCategories, selectCategories],
  (mine, theirs, theirCategories, myCategories) =>
    personalExpenses(
      mine,
      theirs,
      categoryMapper(theirCategories, myCategories, OTHER_CATEGORY_ID),
    ),
);

export const selectFilteredExpenses = createSelector(
  [selectMySpending, selectExpenseFilters],
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
  [selectMySpending, selectMonthArg],
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
  [selectMySpending, selectCategories, selectMonthArg, selectLanguage],
  (expenses, categories, month) =>
    totalsByCategory(expensesInMonth(expenses, month), categories, {
      name: getMessages().common.uncategorized,
      color: UNCATEGORIZED_COLOR,
    }),
);

export const selectMonthlyTrend = createSelector(
  [selectMySpending, selectMonthArg],
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
