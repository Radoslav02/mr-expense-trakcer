import { createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '@/types/user';
import type { AuthState } from './authTypes';
import {
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  registerUser,
  resolveSession,
  sessionCleared,
  authErrorRaised,
} from './authThunks';

const initialState: AuthState = {
  user: null,
  initialized: false,
  status: 'idle',
  error: null,
};

const mergeUser = (current: AuthUser | null, next: AuthUser): AuthUser =>
  current?.uid === next.uid
    ? { ...next, displayName: next.displayName ?? current.displayName }
    : next;

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authErrorCleared: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sessionCleared, (state) => ({
        ...initialState,
        initialized: true,
        error: state.error,
      }))
      .addCase(authErrorRaised, (state, action) => {
        state.error = action.payload;
      })
      .addCase(resolveSession.fulfilled, (state, action) => {
        state.user = mergeUser(state.user, action.payload);
        state.initialized = true;
      })
      .addCase(resolveSession.rejected, (state, action) => {
        state.initialized = true;
        state.error = action.payload ?? 'Could not load your account.';
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload ?? 'Could not sign you out.';
      })
      .addMatcher(
        isAnyOf(registerUser.pending, loginWithEmail.pending, loginWithGoogle.pending),
        (state) => {
          state.status = 'loading';
          state.error = null;
        },
      )
      .addMatcher(
        isAnyOf(registerUser.fulfilled, loginWithEmail.fulfilled, loginWithGoogle.fulfilled),
        (state, action: PayloadAction<AuthUser>) => {
          state.status = 'succeeded';
          state.user = mergeUser(state.user, action.payload);
          state.initialized = true;
        },
      )
      .addMatcher(
        isAnyOf(registerUser.rejected, loginWithEmail.rejected, loginWithGoogle.rejected),
        (state, action) => {
          state.status = 'failed';
          state.error = typeof action.payload === 'string' ? action.payload : 'Sign-in failed.';
        },
      );
  },
});

export const { authErrorCleared } = authSlice.actions;
export const authReducer = authSlice.reducer;
