import type { PaymentMethod } from '@/types/expense';

/** Labels live in the dictionary: `t.expenses.paymentMethods[method]`. */
export const PAYMENT_METHODS: readonly PaymentMethod[] = ['card', 'cash', 'transfer', 'other'];

export const DEFAULT_PAYMENT_METHOD: PaymentMethod = 'card';

export const TITLE_MAX_LENGTH = 80;
export const NOTE_MAX_LENGTH = 300;

export const MONTHS_IN_TREND = 6;
