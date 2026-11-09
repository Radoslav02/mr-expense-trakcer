import { createAction, createSelector, createSlice } from '@reduxjs/toolkit';
import { createAppAsyncThunk, requireUid } from '@/app/createAppAsyncThunk';
import type { AppThunk, RootState } from '@/app/store';
import { getMessages } from '@/i18n';
import { sessionCleared } from '@/redux/auth/authThunks';
import {
  deleteSaving,
  saveSaving,
  subscribeToMySavings,
  subscribeToSharedSavings,
} from '@/services/savingsService';
import type { AsyncStatus } from '@/types/async';
import { signedAmount, type Saving, type SavingInput } from '@/types/saving';
import { roundMoney } from '@/utils/currency';

interface SavingsState {
  items: Saving[];
  /** My partner's shared savings. */
  partnerItems: Saving[];
  status: AsyncStatus;
  error: string | null;
}

const initialState: SavingsState = { items: [], partnerItems: [], status: 'idle', error: null };

export const savingsSynced = createAction<Saving[]>('savings/synced');
export const partnerSavingsSynced = createAction<Saving[]>('savings/partnerSynced');
export const savingsSyncFailed = createAction<string>('savings/syncFailed');

export const startSavingsSync =
  (uid: string): AppThunk<() => void> =>
  (dispatch) =>
    subscribeToMySavings(
      uid,
      (savings) => dispatch(savingsSynced(savings)),
      () => dispatch(savingsSyncFailed(getMessages().savings.errors.load)),
    );

export const startPartnerSavingsSync =
  (partnerUid: string): AppThunk<() => void> =>
  (dispatch) => {
    const stop = subscribeToSharedSavings(
      partnerUid,
      (savings) => dispatch(partnerSavingsSynced(savings)),
      // Older rules may not let partners read savings yet; just show none.
      () => dispatch(partnerSavingsSynced([])),
    );
    return () => {
      stop();
      dispatch(partnerSavingsSynced([]));
    };
  };

export const saveSavingThunk = createAppAsyncThunk(
  'savings/save',
  async (
    { input, existing }: { input: SavingInput; existing?: Saving },
    { getState, rejectWithValue },
  ) => {
    try {
      await saveSaving(requireUid(getState()), input, existing);
    } catch {
      return rejectWithValue(getMessages().savings.errors.save);
    }
  },
);

export const deleteSavingThunk = createAppAsyncThunk(
  'savings/delete',
  async (saving: Saving, { getState, rejectWithValue }) => {
    try {
      await deleteSaving(requireUid(getState()), saving);
    } catch {
      return rejectWithValue(getMessages().savings.errors.delete);
    }
  },
);

const savingsSlice = createSlice({
  name: 'savings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sessionCleared, () => initialState)
      .addCase(savingsSynced, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.items = action.payload;
      })
      .addCase(partnerSavingsSynced, (state, action) => {
        state.partnerItems = action.payload;
      })
      .addCase(savingsSyncFailed, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const savingsReducer = savingsSlice.reducer;

export const selectSavings = (state: RootState) => state.savings.items;
export const selectPartnerSavings = (state: RootState) => state.savings.partnerItems;
export const selectSavingsStatus = (state: RootState) => state.savings.status;
export const selectSavingsError = (state: RootState) => state.savings.error;

/** Net balance: money put in minus money taken out. */
const sum = (savings: readonly Saving[]) =>
  roundMoney(savings.reduce((total, saving) => total + signedAmount(saving), 0));

export const selectSavingsTotals = createSelector(
  [selectSavings, selectPartnerSavings],
  (mine, theirs) => {
    const thisYear = String(new Date().getFullYear());
    const myShared = sum(mine.filter((saving) => !saving.isPrivate));
    return {
      mine: sum(mine),
      thisYear: sum(mine.filter((saving) => saving.date.startsWith(thisYear))),
      /** What we've both saved and share with each other. */
      together: roundMoney(myShared + sum(theirs)),
    };
  },
);
