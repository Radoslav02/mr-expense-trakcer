import type { RootState } from '@/app/store';

export const selectSettings = (state: RootState) => state.settings.data;
export const selectCurrency = (state: RootState) => state.settings.data.currency;
export const selectMonthlyBudget = (state: RootState) => state.settings.data.monthlyBudget;
export const selectTheme = (state: RootState) => state.settings.theme;
export const selectSettingsStatus = (state: RootState) => state.settings.status;
export const selectSettingsSaveStatus = (state: RootState) => state.settings.saveStatus;
export const selectSettingsError = (state: RootState) => state.settings.error;
