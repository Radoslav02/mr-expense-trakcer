import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import type { Category } from '@/types/category';

/** Every category document, including tombstones of deleted shared ones. For syncing only. */
const selectCategoryDocs = (state: RootState) => state.categories.items;

export const selectCategories = createSelector([selectCategoryDocs], (categories) =>
  categories.filter((category) => !category.deleted),
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
