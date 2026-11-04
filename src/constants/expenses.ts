import type { PaymentMethod } from '@/types/expense';

export const PAYMENT_METHOD_LABELS: Readonly<Record<PaymentMethod, string>> = {
  card: 'Card',
  cash: 'Cash',
  transfer: 'Bank transfer',
  other: 'Other',
};

export const PAYMENT_METHODS = Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[];

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = 'card';

export const TITLE_MAX_LENGTH = 80;
export const NOTE_MAX_LENGTH = 300;

export const MONTHS_IN_TREND = 6;
