import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import { OTHER_CATEGORY_ID, UNCATEGORIZED_COLOR } from '@/constants/categories';
import { MONTHS_IN_TREND } from '@/constants/expenses';
import { selectAuthUser } from '@/redux/auth/authSelectors';
import { selectCategories } from '@/redux/categories/categoriesSelectors';
import { selectMySharedExpenses, selectMySharedSpending } from '@/redux/expenses/expensesSelectors';
import { selectCurrency } from '@/redux/settings/settingsSelectors';
import {
  buildSharedFeed,
  compareCategories,
  compareTrends,
  deriveLinkStatus,
  firstName,
  splitSpending,
} from '@/utils/comparison';
import { lastMonthKeys } from '@/utils/dates';
import { categoryMapper, personalExpenses, sharedCosts } from '@/utils/split';
import { expensesInMonth, sumAmounts, totalsByCategory, totalsByMonth } from '@/utils/expenses';

const FALLBACK_CATEGORY = { name: 'Uncategorized', color: UNCATEGORIZED_COLOR };

const selectMonthArg = (_state: RootState, month: string) => month;

export const selectPartnerEmail = (state: RootState) => state.partner.partnerEmail;
export const selectIncomingInvite = (state: RootState) => state.partner.incoming;
export const selectPartnerStatus = (state: RootState) => state.partner.status;
export const selectPartnerDataStatus = (state: RootState) => state.partner.dataStatus;
export const selectPartnerError = (state: RootState) => state.partner.error;
export const selectPartnerCurrency = (state: RootState) => state.partner.currency;
export const selectPartnerMutating = (state: RootState) =>
  state.partner.mutationStatus === 'loading';
const selectPartnerExpenses = (state: RootState) => state.partner.expenses;
const selectPartnerCategoryDocs = (state: RootState) => state.partner.categories;
const selectPartnerCategories = createSelector([selectPartnerCategoryDocs], (categories) =>
  categories.filter((category) => !category.deleted),
);

/** What my partner actually spends: their part of split expenses, including ones I paid for. */
const selectPartnerSpending = createSelector(
  [selectPartnerExpenses, selectMySharedExpenses, selectCategories, selectPartnerCategories],
  (theirs, mine, myCategories, theirCategories) =>
    personalExpenses(
      theirs,
      mine,
      categoryMapper(myCategories, theirCategories, OTHER_CATEGORY_ID),
    ),
);

export const selectLinkStatus = createSelector(
  [selectPartnerEmail, selectIncomingInvite],
  (partnerEmail, incoming) => deriveLinkStatus({ partnerEmail, incoming }),
);

export const selectConnectedPartnerUid = createSelector(
  [selectLinkStatus, selectIncomingInvite],
  (status, incoming) => (status === 'connected' ? (incoming?.uid ?? null) : null),
);

export const selectPersonNames = createSelector(
  [selectAuthUser, selectIncomingInvite, selectPartnerEmail],
  (user, incoming, partnerEmail) => ({
    me: 'You',
    meFull: firstName(user?.displayName ?? null, user?.email ?? null, 'You'),
    partner: firstName(incoming?.displayName ?? null, incoming?.email ?? partnerEmail, 'Partner'),
  }),
);

export const selectCurrencyMismatch = createSelector(
  [selectCurrency, selectPartnerCurrency],
  (mine, theirs) => (theirs && theirs !== mine ? theirs : null),
);

export const selectSpendingSplit = createSelector(
  [selectMySharedSpending, selectPartnerSpending, selectMonthArg],
  (mine, theirs, month) => {
    const myMonth = expensesInMonth(mine, month);
    const theirMonth = expensesInMonth(theirs, month);
    return {
      ...splitSpending(sumAmounts(myMonth), sumAmounts(theirMonth)),
      meCount: myMonth.length,
      partnerCount: theirMonth.length,
    };
  },
);

export const selectCategoryComparison = createSelector(
  [
    selectMySharedSpending,
    selectCategories,
    selectPartnerSpending,
    selectPartnerCategories,
    selectMonthArg,
  ],
  (mine, myCategories, theirs, theirCategories, month) =>
    compareCategories(
      totalsByCategory(expensesInMonth(mine, month), myCategories, FALLBACK_CATEGORY),
      totalsByCategory(expensesInMonth(theirs, month), theirCategories, FALLBACK_CATEGORY),
    ),
);

export const selectTrendComparison = createSelector(
  [selectMySharedSpending, selectPartnerSpending, selectMonthArg],
  (mine, theirs, month) => {
    const months = lastMonthKeys(month, MONTHS_IN_TREND);
    return compareTrends(totalsByMonth(mine, months), totalsByMonth(theirs, months));
  },
);

export const selectSharedFeed = createSelector(
  [
    selectMySharedExpenses,
    selectCategories,
    selectPartnerExpenses,
    selectPartnerCategories,
    selectMonthArg,
  ],
  (mine, myCategories, theirs, theirCategories, month) =>
    buildSharedFeed(
      { expenses: expensesInMonth(mine, month), categories: myCategories },
      { expenses: expensesInMonth(theirs, month), categories: theirCategories },
    ),
);

export const selectSharedCosts = createSelector(
  [selectMySharedExpenses, selectPartnerExpenses, selectMonthArg],
  (mine, theirs, month) =>
    sharedCosts(expensesInMonth(mine, month), expensesInMonth(theirs, month)),
);
