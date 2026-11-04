import { createAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk, requireUid } from '@/app/createAppAsyncThunk';
import type { AppThunk } from '@/app/store';
import { OTHER_CATEGORY_ID } from '@/constants/categories';
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  subscribeToCategories,
  updateCategory,
} from '@/services/categoriesService';
import type { Category, CategoryChanges, CategoryInput } from '@/types/category';
import { getErrorMessage } from '@/utils/errors';

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
  async (input: CategoryInput, { getState, rejectWithValue }) => {
    try {
      return await createCategory(requireUid(getState()), input);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not create the category.'));
    }
  },
);

export const editCategory = createAppAsyncThunk(
  'categories/edit',
  async (
    { id, changes }: { id: string; changes: CategoryChanges },
    { getState, rejectWithValue },
  ) => {
    try {
      return await updateCategory(requireUid(getState()), id, changes);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not update the category.'));
    }
  },
);

export const removeCategory = createAppAsyncThunk(
  'categories/remove',
  async (categoryId: string, { getState, rejectWithValue }) => {
    if (categoryId === OTHER_CATEGORY_ID) {
      return rejectWithValue('"Other" collects reassigned expenses, so it cannot be deleted.');
    }
    try {
      return await deleteCategory(requireUid(getState()), categoryId, OTHER_CATEGORY_ID);
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
    subscribeToCategories(
      uid,
      (data) => dispatch(categoriesSynced(data)),
      (error) =>
        dispatch(categoriesSyncFailed(getErrorMessage(error, 'Could not load categories.'))),
    );
