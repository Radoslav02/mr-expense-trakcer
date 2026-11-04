import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from './store';

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
}>();

export const requireUid = (state: RootState): string => {
  const uid = state.auth.user?.uid;
  if (!uid) throw new Error('You are signed out. Sign in again to continue.');
  return uid;
};
