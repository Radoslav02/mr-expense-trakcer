import { createAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk } from '@/app/createAppAsyncThunk';
import type { AppThunk } from '@/app/store';
import {
  completeRedirectSignIn,
  ensureUserInitialized,
  registerWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  subscribeToAuthChanges,
} from '@/services/authService';
import type { AuthUser, EmailCredentials, RegistrationData } from '@/types/user';
import { getErrorMessage } from '@/utils/errors';

export const sessionCleared = createAction('auth/sessionCleared');
export const authErrorRaised = createAction<string>('auth/errorRaised');

export const resolveSession = createAppAsyncThunk(
  'auth/resolveSession',
  async (user: AuthUser, { rejectWithValue }) => {
    try {
      await ensureUserInitialized(user);
      return user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not load your account.'));
    }
  },
);

export const registerUser = createAppAsyncThunk(
  'auth/register',
  async (data: RegistrationData, { rejectWithValue }) => {
    try {
      return await registerWithEmail(data);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not create your account.'));
    }
  },
);

export const loginWithEmail = createAppAsyncThunk(
  'auth/loginWithEmail',
  async (credentials: EmailCredentials, { rejectWithValue }) => {
    try {
      return await signInWithEmail(credentials);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not sign you in.'));
    }
  },
);

export const loginWithGoogle = createAppAsyncThunk(
  'auth/loginWithGoogle',
  async (_: void, { rejectWithValue }) => {
    try {
      return await signInWithGoogle();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Google sign-in failed.'));
    }
  },
);

export const logoutUser = createAppAsyncThunk(
  'auth/logout',
  async (_: void, { rejectWithValue }) => {
    try {
      await signOutUser();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not sign you out.'));
    }
  },
);

export const startAuthListener = (): AppThunk<() => void> => (dispatch) => {
  completeRedirectSignIn().catch((error: unknown) => {
    dispatch(authErrorRaised(getErrorMessage(error, 'Google sign-in failed.')));
  });
  return subscribeToAuthChanges((user) => {
    if (user) void dispatch(resolveSession(user));
    else dispatch(sessionCleared());
  });
};
