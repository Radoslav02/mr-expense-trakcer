import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import { getMessages, selectLanguage } from '@/i18n';
import { OTHER_CATEGORY_ID, UNCATEGORIZED_COLOR } from '@/constants/categories';
import { MONTHS_IN_TREND } from '@/constants/expenses';
import { selectAuthUser } from '@/redux/auth/authSelectors';
import { localizeCategory, selectCategories } from '@/redux/categories/categoriesSelectors';
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
import { expensesInRange, sumAmounts, totalsByCategory, totalsByMonth } from '@/utils/expenses';

const fallbackCategory = () => ({
  name: getMessages().common.uncategorized,
  color: UNCATEGORIZED_COLOR,
});

const selectMonthArg = (_state: RootState, month: string) => month;
/** A `rangeKey` ("2026-11-01..2026-11-30"): the period the Together tab shows. */
const selectRangeArg = (_state: RootState, range: string) => range;

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
const selectPartnerCategories = createSelector(
  [selectPartnerCategoryDocs, selectLanguage],
  (categories) => categories.filter((category) => !category.deleted).map(localizeCategory),
);

/** What my partner actually spends: their part of split expenses, including ones I paid for. */
const selectPartnerSpending = createSelector(
  [selectPartnerExpenses, selectMySharedExpenses, selectCategories, selectPartnerCategories],
  (theirs, mine, myCategories, theirCategories) =>
    personalExpenses(
      theirs,
      mine,
      categoryMapper(myCategories, theirCategories, OTHER_CATEGORY_ID, 'sharedKey'),
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
  [selectAuthUser, selectIncomingInvite, selectPartnerEmail, selectLanguage],
  (user, incoming, partnerEmail) => {
    const { common } = getMessages();
    return {
      me: common.you,
      meFull: firstName(user?.displayName ?? null, user?.email ?? null, common.you),
      partner: firstName(
        incoming?.displayName ?? null,
        incoming?.email ?? partnerEmail,
        common.partner,
      ),
    };
  },
);

export const selectCurrencyMismatch = createSelector(
  [selectCurrency, selectPartnerCurrency],
  (mine, theirs) => (theirs && theirs !== mine ? theirs : null),
);

export const selectSpendingSplit = createSelector(
  [selectMySharedSpending, selectPartnerSpending, selectRangeArg],
  (mine, theirs, range) => {
    const myMonth = expensesInRange(mine, range);
    const theirMonth = expensesInRange(theirs, range);
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
    selectRangeArg,
    selectLanguage,
  ],
  (mine, myCategories, theirs, theirCategories, range) =>
    compareCategories(
      totalsByCategory(expensesInRange(mine, range), myCategories, fallbackCategory()),
      totalsByCategory(
        expensesInRange(theirs, range),
        // A shared category of mine they haven't synced yet: their expense holds its shared key.
        [
          ...theirCategories,
          ...myCategories
            .filter((category) => !category.isPrivate)
            .map((category) => ({ ...category, id: category.sharedKey })),
        ],
        fallbackCategory(),
      ),
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
    selectRangeArg,
  ],
  (mine, myCategories, theirs, theirCategories, range) =>
    buildSharedFeed(
      { expenses: expensesInRange(mine, range), categories: myCategories },
      { expenses: expensesInRange(theirs, range), categories: theirCategories },
    ),
);

export const selectSharedCosts = createSelector(
  [selectMySharedExpenses, selectPartnerExpenses, selectRangeArg],
  (mine, theirs, range) =>
    sharedCosts(expensesInRange(mine, range), expensesInRange(theirs, range)),
);

/**
 * How many shared expenses each of my categories holds, counting both of ours: my shared
 * expenses plus my partner's, matched to my copy of their category.
 */
export const selectSharedCategoryCounts = createSelector(
  [selectMySharedExpenses, selectPartnerExpenses, selectPartnerCategories, selectCategories],
  (mine, theirs, theirCategories, myCategories) => {
    const toMine = categoryMapper(theirCategories, myCategories, OTHER_CATEGORY_ID);
    const counts: Record<string, number> = {};
    const add = (categoryId: string) => {
      counts[categoryId] = (counts[categoryId] ?? 0) + 1;
    };
    mine.forEach((expense) => add(expense.categoryId));
    theirs.forEach((expense) => add(toMine(expense.categoryId)));
    return counts;
  },
);

/**
 * Every shared expense from both of us, for the Together export. The partner's carry the
 * matching category of mine, so one category list filters both.
 */
export const selectTogetherExpenses = createSelector(
  [selectMySharedExpenses, selectCategories, selectPartnerExpenses, selectPartnerCategories],
  (mine, myCategories, theirs, theirCategories) => {
    const toMine = categoryMapper(theirCategories, myCategories, OTHER_CATEGORY_ID);
    return [
      ...mine.map((expense) => ({ owner: 'me' as const, expense, categoryId: expense.categoryId })),
      ...theirs.map((expense) => ({
        owner: 'partner' as const,
        expense,
        categoryId: toMine(expense.categoryId),
      })),
    ];
  },
);
