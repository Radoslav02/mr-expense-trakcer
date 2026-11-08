import { createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import { sessionCleared } from '@/redux/auth/authThunks';
import type { PartnerLink } from '@/types/partner';
import type { PartnerState } from './partnerTypes';
import {
  connectPartner,
  disconnectPartner,
  editPartnerExpense,
  loadPartner,
  partnerDataSynced,
  partnerDataSyncFailed,
  partnerDataSyncStarted,
  partnerLinkSynced,
  partnerLinkSyncFailed,
} from './partnerThunks';

const initialState: PartnerState = {
  partnerEmail: null,
  incoming: null,
  expenses: [],
  categories: [],
  currency: null,
  status: 'idle',
  dataStatus: 'idle',
  mutationStatus: 'idle',
  error: null,
};

const applyLink = (state: PartnerState, action: PayloadAction<PartnerLink>) => {
  state.status = 'succeeded';
  state.error = null;
  state.partnerEmail = action.payload.partnerEmail;
  state.incoming = action.payload.incoming;
};

const partnerSlice = createSlice({
  name: 'partner',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sessionCleared, () => initialState)
      .addCase(partnerLinkSynced, applyLink)
      .addCase(loadPartner.fulfilled, applyLink)
      .addCase(loadPartner.pending, (state) => {
        state.error = null;
      })
      .addCase(partnerDataSyncStarted, (state) => {
        state.dataStatus = 'loading';
        state.error = null;
      })
      .addCase(partnerDataSynced, (state, action) => {
        state.dataStatus = 'succeeded';
        state.error = null;
        state.expenses = action.payload.expenses;
        state.categories = action.payload.categories;
        state.currency = action.payload.currency;
      })
      .addCase(partnerDataSyncFailed, (state, action) => {
        state.dataStatus = 'failed';
        state.error = action.payload;
      })
      .addCase(connectPartner.fulfilled, (state, action) => {
        state.mutationStatus = 'succeeded';
        state.partnerEmail = action.payload;
      })
      .addCase(disconnectPartner.fulfilled, (state) => ({
        ...initialState,
        status: state.status,
        incoming: state.incoming,
      }))
      .addMatcher(isAnyOf(partnerLinkSyncFailed, loadPartner.rejected), (state, action) => {
        state.status = 'failed';
        state.error =
          typeof action.payload === 'string'
            ? action.payload
            : 'Could not check your partner link.';
      })
      .addMatcher(editPartnerExpense.fulfilled.match, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addMatcher(
        isAnyOf(connectPartner.pending, disconnectPartner.pending, editPartnerExpense.pending),
        (state) => {
          state.mutationStatus = 'loading';
        },
      )
      .addMatcher(
        isAnyOf(connectPartner.rejected, disconnectPartner.rejected, editPartnerExpense.rejected),
        (state) => {
          state.mutationStatus = 'failed';
        },
      );
  },
});

export const partnerReducer = partnerSlice.reducer;
