import { createAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk, requireUid } from '@/app/createAppAsyncThunk';
import type { AppThunk } from '@/app/store';
import { fetchSettings, saveSettings, subscribeToSettings } from '@/services/settingsService';
import type { UserSettings } from '@/types/user';
import { getErrorMessage } from '@/utils/errors';

export const loadSettings = createAppAsyncThunk(
  'settings/load',
  async (_: void, { getState, rejectWithValue }) => {
    try {
      return await fetchSettings(requireUid(getState()));
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not load your settings.'));
    }
  },
);

export const updateSettings = createAppAsyncThunk(
  'settings/update',
  async (settings: UserSettings, { getState, rejectWithValue }) => {
    try {
      return await saveSettings(requireUid(getState()), settings);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, 'Could not save your settings.'));
    }
  },
);

export const settingsSynced = createAction<UserSettings>('settings/synced');
export const settingsSyncFailed = createAction<string>('settings/syncFailed');

export const startSettingsSync =
  (uid: string): AppThunk<() => void> =>
  (dispatch) =>
    subscribeToSettings(
      uid,
      (data) => dispatch(settingsSynced(data)),
      (error) =>
        dispatch(settingsSyncFailed(getErrorMessage(error, 'Could not load your settings.'))),
    );
