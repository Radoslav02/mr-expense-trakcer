import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import type { Category } from '@/types/category';

export const selectCategories = (state: RootState) => state.categories.items;
export const selectCategoriesStatus = (state: RootState) => state.categories.status;
export const selectCategoriesError = (state: RootState) => state.categories.error;
export const selectCategoriesMutating = (state: RootState) =>
  state.categories.mutationStatus === 'loading';

export const selectCategoryMap = createSelector(
  [selectCategories],
  (categories): Readonly<Record<string, Category>> =>
    Object.fromEntries(categories.map((category) => [category.id, category])),
);

export const selectSortedCategories = createSelector([selectCategories], (categories) =>
  [...categories].sort((a, b) => a.name.localeCompare(b.name)),
);

export const selectCategoryNames = createSelector([selectCategories], (categories) =>
  categories.map((category) => category.name),
);
