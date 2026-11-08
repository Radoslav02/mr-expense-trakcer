import type { AsyncStatus } from '@/types/async';
import type { PrivateFinance, UserSettings } from '@/types/user';

export type Theme = 'light' | 'dark';

export interface SettingsState {
  data: UserSettings;
  finance: PrivateFinance;
  theme: Theme;
  status: AsyncStatus;
  saveStatus: AsyncStatus;
  error: string | null;
}
