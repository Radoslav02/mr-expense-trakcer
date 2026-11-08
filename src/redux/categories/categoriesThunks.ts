import { createAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk, requireUid } from '@/app/createAppAsyncThunk';
import type { AppThunk } from '@/app/store';
import { OTHER_CATEGORY_ID } from '@/constants/categories';
import {
  applyCategoryUpserts,
  createCategory,
  deleteCategory,
  fetchCategories,
  removeSyncedCategory,
  subscribeToMyCategories,
  updateCategory,
} from '@/services/categoriesService';
import type { Category, CategoryChanges, CategoryInput } from '@/types/category';
import { getErrorMessage } from '@/utils/errors';
import { isEmptyPlan, planCategorySync } from '@/utils/sharedCategories';

export const loadCategories = createAppAsyncThunk(
  'categories/load',
  async (_: void, { getState, rejectWithValue }) => {
    try {
      return await fetchCategories(requireUid(getState()));
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not load categories.'));
    }
  },
);

export const addCategory = createAppAsyncThunk(
  'categories/add',
  async (
    { input, isPrivate = false }: { input: CategoryInput; isPrivate?: boolean },
    { getState, rejectWithValue },
  ) => {
    try {
      return await createCategory(requireUid(getState()), input, isPrivate);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not create the category.'));
    }
  },
);

export const editCategory = createAppAsyncThunk(
  'categories/edit',
  async (
    { category, changes }: { category: Category; changes: CategoryChanges },
    { getState, rejectWithValue },
  ) => {
    try {
      return await updateCategory(requireUid(getState()), category, changes);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not update the category.'));
    }
  },
);

export const removeCategory = createAppAsyncThunk(
  'categories/remove',
  async (category: Category, { getState, rejectWithValue }) => {
    if (category.id === OTHER_CATEGORY_ID) {
      return rejectWithValue('"Other" collects reassigned expenses, so it cannot be deleted.');
    }
    try {
      return await deleteCategory(requireUid(getState()), category, OTHER_CATEGORY_ID);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not delete the category.'));
    }
  },
);

export const categoriesSynced = createAction<Category[]>('categories/synced');
export const categoriesSyncFailed = createAction<string>('categories/syncFailed');

export const startCategoriesSync =
  (uid: string): AppThunk<() => void> =>
  (dispatch) =>
    subscribeToMyCategories(
      uid,
      (data) => dispatch(categoriesSynced(data)),
      (error) =>
        dispatch(categoriesSyncFailed(getErrorMessage(error, 'Could not load categories.'))),
    );

let syncing = false;

/**
 * Brings my shared categories in line with my partner's: copies ones they added, applies their
 * edits and removes ones they deleted. Their app does the same with mine, so both lists match.
 * Each write updates the live listeners, which call this again until there's nothing left to do.
 */
export const syncSharedCategories = (): AppThunk => async (dispatch, getState) => {
  const state = getState();
  const uid = state.auth.user?.uid;
  const ready = state.categories.status === 'succeeded' && state.partner.dataStatus === 'succeeded';
  if (!uid || !ready || syncing) return;

  const plan = planCategorySync(state.categories.items, state.partner.categories);
  if (isEmptyPlan(plan)) return;

  syncing = true;
  try {
    await applyCategoryUpserts(uid, plan.upserts);
    for (const { category, deletedAt } of plan.removals) {
      await removeSyncedCategory(uid, category, deletedAt);
    }
    syncing = false;
    // Changes that arrived while this ran were skipped; pick them up now.
    dispatch(syncSharedCategories());
  } catch (error) {
    syncing = false;
    // Not worth interrupting anyone over: the next change from either side retries it.
    console.warn('Could not sync shared categories.', error);
  }
};
