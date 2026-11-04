import type { UserSettings } from '@/types/user';

export const DEFAULT_CURRENCY = 'RSD';

export const DEFAULT_SETTINGS: UserSettings = {
  currency: DEFAULT_CURRENCY,
  monthlyBudget: null,
};

export const CURRENCY_OPTIONS: readonly { code: string; label: string }[] = [
  { code: 'RSD', label: 'Serbian dinar (RSD)' },
  { code: 'EUR', label: 'Euro (EUR)' },
  { code: 'USD', label: 'US dollar (USD)' },
  { code: 'GBP', label: 'British pound (GBP)' },
  { code: 'CHF', label: 'Swiss franc (CHF)' },
  { code: 'BAM', label: 'Convertible mark (BAM)' },
  { code: 'HUF', label: 'Hungarian forint (HUF)' },
  { code: 'MKD', label: 'Macedonian denar (MKD)' },
];

export const BUDGET_THRESHOLDS = {
  warning: 0.75,
  exceeded: 1,
} as const;

export const STORAGE_KEYS = {
  theme: 'tally.theme',
} as const;

export const APP_NAME = 'M&R Expense Tracker';
export const APP_SHORT_NAME = 'M&R';
