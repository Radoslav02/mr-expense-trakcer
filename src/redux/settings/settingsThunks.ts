import { createAction } from '@reduxjs/toolkit';
import { createAppAsyncThunk, requireUid } from '@/app/createAppAsyncThunk';
import type { AppThunk } from '@/app/store';
import { getMessages } from '@/i18n';
import {
  fetchSettings,
  saveFinance,
  saveSettings,
  subscribeToFinance,
  subscribeToSettings,
} from '@/services/settingsService';
import type { PrivateFinance, UserSettings } from '@/types/user';
import { getErrorMessage } from '@/utils/errors';

export const loadSettings = createAppAsyncThunk(
  'settings/load',
  async (_: void, { getState, rejectWithValue }) => {
    try {
      return await fetchSettings(requireUid(getState()));
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, getMessages().settings.errors.load));
    }
  },
);

export const updateSettings = createAppAsyncThunk(
  'settings/update',
  async (
    { settings, finance }: { settings: UserSettings; finance: PrivateFinance },
    { getState, rejectWithValue },
  ) => {
    try {
      const uid = requireUid(getState());
      const [savedSettings, savedFinance] = await Promise.all([
        saveSettings(uid, settings),
        saveFinance(uid, finance),
      ]);
      return { settings: savedSettings, finance: savedFinance };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, getMessages().settings.errors.save));
    }
  },
);

export const settingsSynced = createAction<UserSettings>('settings/synced');
export const settingsSyncFailed = createAction<string>('settings/syncFailed');

export const financeSynced = createAction<PrivateFinance>('settings/financeSynced');

export const startSettingsSync =
  (uid: string): AppThunk<() => void> =>
  (dispatch) => {
    const onError = (error: Error) =>
      dispatch(settingsSyncFailed(getErrorMessage(error, getMessages().settings.errors.load)));
    const unsubscribes = [
      subscribeToSettings(uid, (data) => dispatch(settingsSynced(data)), onError),
      subscribeToFinance(uid, (data) => dispatch(financeSynced(data)), onError),
    ];
    return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
  };
