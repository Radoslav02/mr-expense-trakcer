import { createAsyncThunk } from '@reduxjs/toolkit';
import { getMessages } from '@/i18n';
import type { AppDispatch, RootState } from './store';

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
}>();

export const requireUid = (state: RootState): string => {
  const uid = state.auth.user?.uid;
  if (!uid) throw new Error(getMessages().common.errors.signedOut);
  return uid;
};
