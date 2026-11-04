import type { AsyncStatus } from '@/types/async';
import type { UserSettings } from '@/types/user';

export type Theme = 'light' | 'dark';

export interface SettingsState {
  data: UserSettings;
  theme: Theme;
  status: AsyncStatus;
  saveStatus: AsyncStatus;
  error: string | null;
}
