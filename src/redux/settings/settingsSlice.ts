import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_SETTINGS } from '@/constants/settings';
import { getMessages } from '@/i18n';
import { sessionCleared } from '@/redux/auth/authThunks';
import type { SettingsState, Theme } from './settingsTypes';
import {
  financeSynced,
  loadSettings,
  settingsSynced,
  settingsSyncFailed,
  updateSettings,
} from './settingsThunks';

const initialTheme = (): Theme =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
    ? 'dark'
    : 'light';

const initialState: SettingsState = {
  data: DEFAULT_SETTINGS,
  finance: { monthlyIncome: null },
  theme: initialTheme(),
  status: 'idle',
  saveStatus: 'idle',
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    themeChanged: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sessionCleared, (state) => ({ ...initialState, theme: state.theme }))
      .addCase(settingsSynced, (state, action) => {
        state.status = 'succeeded';
        state.error = null;
        state.data = action.payload;
      })
      .addCase(financeSynced, (state, action) => {
        state.finance = action.payload;
      })
      .addCase(settingsSyncFailed, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(loadSettings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? getMessages().settings.errors.load;
      })
      .addCase(updateSettings.pending, (state) => {
        state.saveStatus = 'loading';
      })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.saveStatus = 'succeeded';
        state.data = action.payload.settings;
        state.finance = action.payload.finance;
      })
      .addCase(updateSettings.rejected, (state) => {
        state.saveStatus = 'failed';
      });
  },
});

export const { themeChanged } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
