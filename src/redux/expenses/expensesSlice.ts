import { createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import { sessionCleared } from '@/redux/auth/authThunks';
import { removeCategory } from '@/redux/categories/categoriesThunks';
import { ALL, type ExpenseFilters } from '@/types/expense';
import { currentMonthKey } from '@/utils/dates';
import type { ExpensesState } from './expensesTypes';
import {
  addExpense,
  editExpense,
  expensesSynced,
  expensesSyncFailed,
  loadExpenses,
  removeExpense,
} from './expensesThunks';

const defaultFilters = (): ExpenseFilters => ({
  month: currentMonthKey(),
  categoryId: ALL,
  paymentMethod: ALL,
  search: '',
});

const initialState: ExpensesState = {
  items: [],
  filters: defaultFilters(),
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
};

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    filtersChanged: (state, action: PayloadAction<Partial<ExpenseFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    filtersReset: (state) => {
      state.filters = { ...defaultFilters(), month: state.filters.month };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sessionCleared, () => ({ ...initialState, filters: defaultFilters() }))
      .addCase(loadExpenses.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadExpenses.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(loadExpenses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Could not load expenses.';
      })
      .addCase(expensesSynced, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.items = action.payload;
      })
      .addCase(expensesSyncFailed, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index === -1) state.items.push(action.payload);
        else state.items[index] = action.payload;
      })
      .addCase(editExpense.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(removeExpense.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(removeCategory.fulfilled, (state, action) => {
        const { categoryId, reassignToId } = action.payload;
        state.items.forEach((item) => {
          if (item.categoryId === categoryId) item.categoryId = reassignToId;
        });
        if (state.filters.categoryId === categoryId) state.filters.categoryId = ALL;
      })
      .addMatcher(
        isAnyOf(addExpense.pending, editExpense.pending, removeExpense.pending),
        (state) => {
          state.mutationStatus = 'loading';
        },
      )
      .addMatcher(
        isAnyOf(addExpense.rejected, editExpense.rejected, removeExpense.rejected),
        (state) => {
          state.mutationStatus = 'failed';
        },
      );
  },
});

export const { filtersChanged, filtersReset } = expensesSlice.actions;
export const expensesReducer = expensesSlice.reducer;
