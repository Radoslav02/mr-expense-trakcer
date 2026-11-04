import { createAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk, requireUid } from '@/app/createAppAsyncThunk';
import type { AppThunk, RootState } from '@/app/store';
import {
  fetchPartnerLink,
  shareWithPartner,
  stopSharing,
  subscribeToPartnerData,
  subscribeToPartnerLink,
} from '@/services/partnerService';
import type { PartnerData, PartnerLink } from '@/types/partner';
import { getErrorMessage, isPermissionDenied } from '@/utils/errors';

const requireUser = (state: RootState) => {
  const user = state.auth.user;
  if (!user?.email) throw new Error('Sign in with an email account to share spending.');
  return user;
};

export const partnerLinkSynced = createAction<PartnerLink>('partner/linkSynced');
export const partnerLinkSyncFailed = createAction<string>('partner/linkSyncFailed');
export const partnerDataSyncStarted = createAction('partner/dataSyncStarted');
export const partnerDataSynced = createAction<PartnerData>('partner/dataSynced');
export const partnerDataSyncFailed = createAction<string>('partner/dataSyncFailed');

export const startPartnerLinkSync =
  (uid: string, email: string): AppThunk<() => void> =>
  (dispatch) =>
    subscribeToPartnerLink(
      uid,
      email,
      (link) => dispatch(partnerLinkSynced(link)),
      (error) =>
        dispatch(
          partnerLinkSyncFailed(getErrorMessage(error, 'Could not check your partner link.')),
        ),
    );

export const startPartnerDataSync =
  (partnerUid: string): AppThunk<() => void> =>
  (dispatch) => {
    dispatch(partnerDataSyncStarted());
    return subscribeToPartnerData(
      partnerUid,
      (data) => dispatch(partnerDataSynced(data)),
      (error) =>
        dispatch(
          partnerDataSyncFailed(
            isPermissionDenied(error)
              ? 'Your partner isn’t sharing with you right now.'
              : getErrorMessage(error, 'Could not load your partner’s spending.'),
          ),
        ),
    );
  };

export const loadPartner = createAppAsyncThunk(
  'partner/load',
  async (_: void, { getState, rejectWithValue }) => {
    try {
      const user = requireUser(getState());
      return await fetchPartnerLink(user.uid, user.email ?? '');
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not check your partner link.'));
    }
  },
);

export const connectPartner = createAppAsyncThunk(
  'partner/connect',
  async (partnerEmail: string, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      return await shareWithPartner(requireUser(state), partnerEmail, state.partner.partnerEmail);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not share with your partner.'));
    }
  },
);

export const disconnectPartner = createAppAsyncThunk(
  'partner/disconnect',
  async (_: void, { getState, rejectWithValue }) => {
    const state = getState();
    const partnerEmail = state.partner.partnerEmail;
    if (!partnerEmail) return;
    try {
      await stopSharing(requireUid(state), partnerEmail);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not stop sharing.'));
    }
  },
);
