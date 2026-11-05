import { useEffect, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { OTHER_CATEGORY_ID } from '@/constants/categories';
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from '@/constants/expenses';
import { selectCategories } from '@/redux/categories/categoriesSelectors';
import { selectExpenseFilters } from '@/redux/expenses/expensesSelectors';
import { addExpense, editExpense } from '@/redux/expenses/expensesThunks';
import { ALL, type Expense, type ExpenseInput, type PaymentMethod } from '@/types/expense';
import { roundMoney } from '@/utils/currency';
import { currentMonthKey, monthBounds, todayKey } from '@/utils/dates';
import { halfOf } from '@/utils/split';
import {
  hasErrors,
  parseAmount,
  validateExpense,
  type ExpenseFormValues,
  type FormErrors,
} from '@/utils/validation';
import { useToast } from './useToast';

const isPaymentMethod = (value: string): value is PaymentMethod =>
  PAYMENT_METHODS.includes(value as PaymentMethod);

const defaultDateFor = (month: string): string =>
  month === currentMonthKey() ? todayKey() : monthBounds(month).start;

type FormDefaults = Pick<ExpenseFormValues, 'categoryId' | 'date' | 'paymentMethod'>;

const NO_SPLIT = { split: false, splitMode: 'even', partnerShare: '' } as const;

const toFormValues = (expense: Expense | null, fallback: FormDefaults): ExpenseFormValues => {
  if (!expense) return { title: '', amount: '', note: '', ...NO_SPLIT, ...fallback };
  const share = expense.partnerShare;
  return {
    title: expense.title,
    amount: String(expense.amount),
    categoryId: expense.categoryId,
    date: expense.date,
    note: expense.note ?? '',
    paymentMethod: expense.paymentMethod,
    ...(share
      ? {
          split: true,
          splitMode: share === halfOf(expense.amount) ? 'even' : 'custom',
          partnerShare: String(share),
        }
      : NO_SPLIT),
  };
};

const partnerShareOf = (values: ExpenseFormValues, amount: number): number | undefined => {
  if (!values.split) return undefined;
  return values.splitMode === 'even'
    ? halfOf(amount)
    : roundMoney(parseAmount(values.partnerShare));
};

const toInput = (values: ExpenseFormValues): ExpenseInput => {
  const amount = roundMoney(parseAmount(values.amount));
  return {
    title: values.title.trim(),
    amount,
    categoryId: values.categoryId,
    date: values.date,
    note: values.note.trim() || undefined,
    paymentMethod: isPaymentMethod(values.paymentMethod)
      ? values.paymentMethod
      : DEFAULT_PAYMENT_METHOD,
    partnerShare: partnerShareOf(values, amount),
  };
};

export const useExpenseForm = (open: boolean, expense: Expense | null, onSaved: () => void) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const categories = useAppSelector(selectCategories);
  const filters = useAppSelector(selectExpenseFilters);
  const [values, setValues] = useState<ExpenseFormValues>(() =>
    toFormValues(null, {
      categoryId: '',
      date: todayKey(),
      paymentMethod: DEFAULT_PAYMENT_METHOD,
    }),
  );
  const [errors, setErrors] = useState<FormErrors<ExpenseFormValues>>({});

  useEffect(() => {
    if (!open) return;
    const preferredCategory =
      filters.categoryId !== ALL ? filters.categoryId : (categories[0]?.id ?? OTHER_CATEGORY_ID);
    setValues(
      toFormValues(expense, {
        categoryId: preferredCategory,
        date: defaultDateFor(filters.month),
        paymentMethod: DEFAULT_PAYMENT_METHOD,
      }),
    );
    setErrors({});
    // Reset only when the dialog opens or switches expense, not when filters change underneath it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, expense]);

  const setField = <K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateExpense(values);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    const input = toInput(values);
    try {
      if (expense) await dispatch(editExpense({ expense, input })).unwrap();
      else await dispatch(addExpense(input)).unwrap();
      toast.success(expense ? 'Expense updated.' : 'Expense added.');
      onSaved();
    } catch (message) {
      toast.error(String(message));
    }
  };

  return { values, errors, setField, handleSubmit };
};
