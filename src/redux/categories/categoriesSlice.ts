import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { getMessages } from '@/i18n';
import { sessionCleared } from '@/redux/auth/authThunks';
import type { CategoriesState } from './categoriesTypes';
import {
  addCategory,
  categoriesSynced,
  categoriesSyncFailed,
  editCategory,
  loadCategories,
  removeCategory,
} from './categoriesThunks';

const initialState: CategoriesState = {
  items: [],
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sessionCleared, () => initialState)
      .addCase(loadCategories.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(loadCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? getMessages().categories.errors.load;
      })
      .addCase(categoriesSynced, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.items = action.payload;
      })
      .addCase(categoriesSyncFailed, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        if (!state.items.some((item) => item.id === action.payload.id)) {
          state.items.push(action.payload);
        }
      })
      .addCase(editCategory.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        const category = state.items.find((item) => item.id === action.payload.id);
        if (category) Object.assign(category, action.payload.changes);
      })
      .addCase(removeCategory.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        const removed = state.items.find((item) => item.id === action.payload.categoryId);
        // Shared categories stay as tombstones (see deleteCategory); private ones are gone.
        if (removed && !removed.isPrivate) removed.deleted = true;
        else state.items = state.items.filter((item) => item.id !== action.payload.categoryId);
      })
      .addMatcher(
        isAnyOf(addCategory.pending, editCategory.pending, removeCategory.pending),
        (state) => {
          state.mutationStatus = 'loading';
        },
      )
      .addMatcher(
        isAnyOf(addCategory.rejected, editCategory.rejected, removeCategory.rejected),
        (state) => {
          state.mutationStatus = 'failed';
        },
      );
  },
});

export const categoriesReducer = categoriesSlice.reducer;
