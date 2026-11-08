import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import { getMessages, selectLanguage } from '@/i18n';
import type { Category } from '@/types/category';
import { en } from '@/i18n/en';

/**
 * Built-in categories that still have their original English name show in the current
 * language. A renamed one keeps whatever name it was given.
 */
export const localizeCategory = (category: Category): Category => {
  const original = en.categories.defaults[category.id];
  if (!original || category.name !== original) return category;
  return { ...category, name: getMessages().categories.defaults[category.id] ?? category.name };
};

/** Every category document, including tombstones of deleted shared ones. For syncing only. */
const selectCategoryDocs = (state: RootState) => state.categories.items;

export const selectCategories = createSelector(
  [selectCategoryDocs, selectLanguage],
  (categories) => categories.filter((category) => !category.deleted).map(localizeCategory),
);
export const selectCategoriesStatus = (state: RootState) => state.categories.status;
export const selectCategoriesError = (state: RootState) => state.categories.error;
export const selectCategoriesMutating = (state: RootState) =>
  state.categories.mutationStatus === 'loading';

export const selectCategoryMap = createSelector(
  [selectCategories],
  (categories): Readonly<Record<string, Category>> =>
    Object.fromEntries(categories.map((category) => [category.id, category])),
);

const byName = (a: Category, b: Category) => a.name.localeCompare(b.name);

export const selectSortedCategories = createSelector([selectCategories], (categories) =>
  [...categories].sort(byName),
);

/** Categories both partners see, for shared expenses. */
export const selectSharedCategories = createSelector([selectSortedCategories], (categories) =>
  categories.filter((category) => !category.isPrivate),
);

/** Categories only I see, for private expenses. */
export const selectPrivateCategories = createSelector([selectSortedCategories], (categories) =>
  categories.filter((category) => category.isPrivate),
);

export const selectCategoryNames = createSelector([selectCategories], (categories) =>
  categories.map((category) => category.name),
);
