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
  const errors: FormErrors<ExpenseFormValues> = {};
  const title = values.title.trim();
  const amount = parseAmount(values.amount);

  if (!title) errors.title = 'Give the expense a title.';
  else if (title.length > TITLE_MAX_LENGTH)
    errors.title = `Keep it under ${TITLE_MAX_LENGTH} characters.`;

  if (!values.amount.trim()) errors.amount = 'Enter an amount.';
  else if (!Number.isFinite(amount) || amount <= 0)
    errors.amount = 'Amount must be greater than 0.';

  if (!isValidDateKey(values.date)) errors.date = 'Pick a valid date.';
  if (!values.categoryId) errors.categoryId = 'Choose a category.';
  if (values.visibility === 'shared' && values.split && values.splitMode === 'custom') {
    const share = parseAmount(values.partnerShare);
    if (!values.partnerShare.trim()) errors.partnerShare = 'Enter the split amount.';
    else if (!Number.isFinite(share) || share <= 0)
      errors.partnerShare = 'Share must be greater than 0.';
    else if (!errors.amount && share > amount)
      errors.partnerShare = 'Share can’t be more than the amount.';
  }
  if (values.note.length > NOTE_MAX_LENGTH)
    errors.note = `Keep notes under ${NOTE_MAX_LENGTH} characters.`;

  return errors;
};

export const validateCategoryName = (
  name: string,
  takenNames: readonly string[],
): string | null => {
  const trimmed = name.trim();
  if (!trimmed) return 'Name the category.';
  if (trimmed.length > 32) return 'Keep it under 32 characters.';
  if (takenNames.some((taken) => taken.toLowerCase() === trimmed.toLowerCase())) {
    return 'A category with this name already exists.';
  }
  return null;
};

export const validateBudget = (value: string): string | null => {
  if (!value.trim()) return null;
  const amount = parseAmount(value);
  if (!Number.isFinite(amount) || amount <= 0)
    return 'Budget must be a positive number, or leave it empty.';
  return null;
};

export const validateIncome = (value: string): string | null => {
  if (!value.trim()) return null;
  const amount = parseAmount(value);
  if (!Number.isFinite(amount) || amount <= 0)
    return 'Income must be a positive number, or leave it empty.';
  return null;
};

export const hasErrors = <T>(errors: FormErrors<T>): boolean => Object.keys(errors).length > 0;
