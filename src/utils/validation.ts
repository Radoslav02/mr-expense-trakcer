import { getMessages } from '@/i18n';
import { NOTE_MAX_LENGTH, TITLE_MAX_LENGTH } from '@/constants/expenses';
import { isValidDateKey } from './dates';

export interface ExpenseFormValues {
  title: string;
  amount: string;
  categoryId: string;
  date: string;
  note: string;
  paymentMethod: string;
  split: boolean;
  splitMode: SplitMode;
  partnerShare: string;
  visibility: Visibility;
  /** Creating only: also add it on the same day every month. */
  repeats: boolean;
  /** Editing a recurring expense: the day of the month it's added. */
  dayOfMonth: string;
}

export type SplitMode = 'even' | 'custom';

export type Visibility = 'shared' | 'private';

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export const parseAmount = (value: string): number => Number(value.replace(',', '.').trim());

export const validateExpense = (values: ExpenseFormValues): FormErrors<ExpenseFormValues> => {
  const v = getMessages().expenses.validation;
  const errors: FormErrors<ExpenseFormValues> = {};
  const title = values.title.trim();
  const amount = parseAmount(values.amount);

  if (!title) errors.title = v.titleRequired;
  else if (title.length > TITLE_MAX_LENGTH) errors.title = v.tooLong(TITLE_MAX_LENGTH);

  if (!values.amount.trim()) errors.amount = v.amountRequired;
  else if (!Number.isFinite(amount) || amount <= 0) errors.amount = v.amountPositive;

  if (!isValidDateKey(values.date)) errors.date = v.dateInvalid;
  if (!values.categoryId) errors.categoryId = v.categoryRequired;
  if (values.visibility === 'shared' && values.split && values.splitMode === 'custom') {
    const share = parseAmount(values.partnerShare);
    if (!values.partnerShare.trim()) errors.partnerShare = v.shareRequired;
    else if (!Number.isFinite(share) || share <= 0) errors.partnerShare = v.sharePositive;
    else if (!errors.amount && share > amount) errors.partnerShare = v.shareTooLarge;
  }
  if (values.note.length > NOTE_MAX_LENGTH) errors.note = v.noteTooLong(NOTE_MAX_LENGTH);

  return errors;
};

export const validateCategoryName = (
  name: string,
  takenNames: readonly string[],
): string | null => {
  const v = getMessages().categories.validation;
  const trimmed = name.trim();
  if (!trimmed) return v.nameRequired;
  if (trimmed.length > 32) return v.nameTooLong(32);
  if (takenNames.some((taken) => taken.toLowerCase() === trimmed.toLowerCase())) {
    return v.nameTaken;
  }
  return null;
};

export const validateBudget = (value: string): string | null => {
  if (!value.trim()) return null;
  const amount = parseAmount(value);
  if (!Number.isFinite(amount) || amount <= 0)
    return getMessages().settings.validation.budgetPositive;
  return null;
};

export const validateIncome = (value: string): string | null => {
  if (!value.trim()) return null;
  const amount = parseAmount(value);
  if (!Number.isFinite(amount) || amount <= 0)
    return getMessages().settings.validation.incomePositive;
  return null;
};

export const hasErrors = <T>(errors: FormErrors<T>): boolean => Object.keys(errors).length > 0;
