import { createAction, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { createAppAsyncThunk, requireUid } from '@/app/createAppAsyncThunk';
import type { AppThunk, RootState } from '@/app/store';
import { sessionCleared } from '@/redux/auth/authThunks';
import {
  addDueExpenses,
  createRecurringWithExpense,
  deleteRecurring,
  subscribeToRecurring,
  updateRecurring,
} from '@/services/recurringService';
import type { AsyncStatus } from '@/types/async';
import type { ExpenseInput, RecurringExpense, RecurringInput } from '@/types/expense';
import { getErrorMessage } from '@/utils/errors';
import { dueMonths } from '@/utils/recurring';

interface RecurringState {
  items: RecurringExpense[];
  status: AsyncStatus;
  mutationStatus: AsyncStatus;
  error: string | null;
}

const initialState: RecurringState = {
  items: [],
  status: 'idle',
  mutationStatus: 'idle',
  error: null,
};

export const recurringSynced = createAction<RecurringExpense[]>('recurring/synced');
export const recurringSyncFailed = createAction<string>('recurring/syncFailed');

/** Saves this month's expense and starts repeating it on the same day every month. */
export const addRecurringExpense = createAppAsyncThunk(
  'recurring/add',
  async (input: ExpenseInput, { getState, rejectWithValue }) => {
    try {
      await createRecurringWithExpense(requireUid(getState()), input);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not save the recurring expense.'));
    }
  },
);

export const editRecurring = createAppAsyncThunk(
  'recurring/edit',
  async ({ id, input }: { id: string; input: RecurringInput }, { getState, rejectWithValue }) => {
    try {
      await updateRecurring(requireUid(getState()), id, input);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not update the recurring expense.'));
    }
  },
);

export const stopRecurring = createAppAsyncThunk(
  'recurring/stop',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      await deleteRecurring(requireUid(getState()), id);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not stop the recurring expense.'));
    }
  },
);

const running = new Set<string>();

/** Adds any recurring expense that has come due. Safe to call often: it only writes when due. */
export const addDueRecurringExpenses = (): AppThunk => (_dispatch, getState) => {
  const state = getState();
  const uid = state.auth.user?.uid;
  if (!uid) return;
  state.recurring.items
    .filter((template) => !running.has(template.id) && dueMonths(template).length > 0)
    .forEach((template) => {
      running.add(template.id);
      addDueExpenses(uid, template.id)
        // Offline or a conflict: it's tried again the next time the app opens or syncs.
        .catch((error) => console.warn('Could not add a recurring expense.', error))
        .finally(() => running.delete(template.id));
    });
};

export const startRecurringSync =
  (uid: string): AppThunk<() => void> =>
  (dispatch) =>
    subscribeToRecurring(
      uid,
      (data) => {
        dispatch(recurringSynced(data));
        dispatch(addDueRecurringExpenses());
      },
      (error) =>
        dispatch(recurringSyncFailed(getErrorMessage(error, 'Could not load recurring expenses.'))),
    );

const recurringSlice = createSlice({
  name: 'recurring',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sessionCleared, () => initialState)
      .addCase(recurringSynced, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.items = action.payload;
      })
      .addCase(recurringSyncFailed, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(stopRecurring.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addMatcher(isAnyOf(addRecurringExpense.fulfilled, editRecurring.fulfilled), (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addMatcher(
        isAnyOf(addRecurringExpense.pending, editRecurring.pending, stopRecurring.pending),
        (state) => {
          state.mutationStatus = 'loading';
        },
      )
      .addMatcher(
        isAnyOf(addRecurringExpense.rejected, editRecurring.rejected, stopRecurring.rejected),
        (state) => {
          state.mutationStatus = 'failed';
        },
      );
  },
});

export const recurringReducer = recurringSlice.reducer;

export const selectRecurring = (state: RootState) => state.recurring.items;
export const selectRecurringStatus = (state: RootState) => state.recurring.status;
export const selectRecurringError = (state: RootState) => state.recurring.error;
export const selectRecurringMutating = (state: RootState) =>
  state.recurring.mutationStatus === 'loading';
