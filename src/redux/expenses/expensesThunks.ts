import { createAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk, requireUid } from '@/app/createAppAsyncThunk';
import type { AppThunk } from '@/app/store';
import {
  createExpense,
  deleteExpense,
  fetchExpenses,
  subscribeToMyExpenses,
  updateExpense,
} from '@/services/expensesService';
import type { Expense, ExpenseInput } from '@/types/expense';
import { getErrorMessage } from '@/utils/errors';

export const loadExpenses = createAppAsyncThunk(
  'expenses/load',
  async (_: void, { getState, rejectWithValue }) => {
    try {
      return await fetchExpenses(requireUid(getState()));
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not load expenses.'));
    }
  },
);

export const addExpense = createAppAsyncThunk(
  'expenses/add',
  async (input: ExpenseInput, { getState, rejectWithValue }) => {
    try {
      return await createExpense(requireUid(getState()), input);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not save the expense.'));
    }
  },
);

export const editExpense = createAppAsyncThunk(
  'expenses/edit',
  async (
    { expense, input }: { expense: Expense; input: ExpenseInput },
    { getState, rejectWithValue },
  ) => {
    try {
      return await updateExpense(requireUid(getState()), expense, input);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not update the expense.'));
    }
  },
);

export const removeExpense = createAppAsyncThunk(
  'expenses/remove',
  async (expense: Expense, { getState, rejectWithValue }) => {
    try {
      return await deleteExpense(requireUid(getState()), expense);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not delete the expense.'));
    }
  },
);

export const expensesSynced = createAction<Expense[]>('expenses/synced');
export const expensesSyncFailed = createAction<string>('expenses/syncFailed');

export const startExpensesSync =
  (uid: string): AppThunk<() => void> =>
  (dispatch) =>
    subscribeToMyExpenses(
      uid,
      (data) => dispatch(expensesSynced(data)),
      (error) => dispatch(expensesSyncFailed(getErrorMessage(error, 'Could not load expenses.'))),
    );
