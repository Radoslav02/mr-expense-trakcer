import type { UserSettings } from '@/types/user';

export const DEFAULT_CURRENCY = 'RSD';

export const DEFAULT_SETTINGS: UserSettings = {
  currency: DEFAULT_CURRENCY,
  monthlyBudget: null,
};

/** Supported currencies; their labels live in `settings.currencies` in each dictionary. */
export const CURRENCY_CODES = ['RSD', 'EUR', 'USD', 'GBP', 'CHF', 'BAM', 'HUF', 'MKD'] as const;

export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const BUDGET_THRESHOLDS = {
  warning: 0.75,
  exceeded: 1,
} as const;

export const STORAGE_KEYS = {
  theme: 'tally.theme',
} as const;

export const APP_NAME = 'M&R Expense Tracker';
export const APP_SHORT_NAME = 'M&R';
