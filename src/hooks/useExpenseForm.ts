import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { OTHER_CATEGORY_ID } from '@/constants/categories';
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from '@/constants/expenses';
import { selectCategories } from '@/redux/categories/categoriesSelectors';
import { selectExpenseFilters } from '@/redux/expenses/expensesSelectors';
import { addExpense, editExpense } from '@/redux/expenses/expensesThunks';
import { editPartnerExpense } from '@/redux/partner/partnerThunks';
import { addRecurringExpense, editRecurring } from '@/redux/recurring/recurringSlice';
import type { Category } from '@/types/category';
import {
  ALL,
  type Expense,
  type ExpenseInput,
  type PaymentMethod,
  type RecurringExpense,
  type RecurringInput,
} from '@/types/expense';
import { roundMoney } from '@/utils/currency';
import { currentMonthKey, monthBounds, todayKey } from '@/utils/dates';
import { nextDueDate } from '@/utils/recurring';
import { categoryMapper, halfOf } from '@/utils/split';
import {
  hasErrors,
  parseAmount,
  validateExpense,
  type ExpenseFormValues,
  type FormErrors,
  type Visibility,
} from '@/utils/validation';
import { useToast } from './useToast';

const isPaymentMethod = (value: string): value is PaymentMethod =>
  PAYMENT_METHODS.includes(value as PaymentMethod);

const defaultDateFor = (month: string): string =>
  month === currentMonthKey() ? todayKey() : monthBounds(month).start;

type FormDefaults = Pick<ExpenseFormValues, 'categoryId' | 'date' | 'paymentMethod'>;

/** What the form is editing: a new expense, a saved one, or a recurring template. */
export type ExpenseFormTarget =
  | { kind: 'new' }
  | { kind: 'expense'; expense: Expense }
  /** One of my partner's shared expenses: it stays theirs, I can only change its details. */
  | { kind: 'partner'; expense: Expense }
  | { kind: 'recurring'; recurring: RecurringExpense };

type Splittable = Pick<Expense, 'amount' | 'partnerShare' | 'isPrivate'>;

const splitValues = ({ amount, partnerShare }: Splittable) =>
  partnerShare
    ? ({
        split: true,
        splitMode: partnerShare === halfOf(amount) ? 'even' : 'custom',
        partnerShare: String(partnerShare),
      } as const)
    : ({ split: false, splitMode: 'even', partnerShare: '' } as const);

const toFormValues = (target: ExpenseFormTarget, fallback: FormDefaults): ExpenseFormValues => {
  if (target.kind === 'new') {
    return {
      title: '',
      amount: '',
      note: '',
      ...splitValues({ amount: 0 }),
      visibility: 'shared',
      repeats: false,
      dayOfMonth: '',
      ...fallback,
    };
  }
  const source = target.kind === 'recurring' ? target.recurring : target.expense;
  return {
    title: source.title,
    amount: String(source.amount),
    categoryId: source.categoryId,
    date: target.kind === 'recurring' ? nextDueDate(target.recurring) : target.expense.date,
    note: source.note ?? '',
    paymentMethod: source.paymentMethod,
    ...splitValues(source),
    visibility: source.isPrivate ? 'private' : 'shared',
    repeats: false,
    dayOfMonth: target.kind === 'recurring' ? String(target.recurring.dayOfMonth) : '',
  };
};

const partnerShareOf = (values: ExpenseFormValues, amount: number): number | undefined => {
  if (values.visibility === 'private' || !values.split) return undefined;
  return values.splitMode === 'even'
    ? halfOf(amount)
    : roundMoney(parseAmount(values.partnerShare));
};

const toInput = (values: ExpenseFormValues, recurringId?: string): ExpenseInput => {
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
    isPrivate: values.visibility === 'private' || undefined,
    recurringId,
  };
};

const toRecurringInput = (values: ExpenseFormValues): RecurringInput => {
  const input = toInput(values);
  return {
    title: input.title,
    amount: input.amount,
    categoryId: input.categoryId,
    paymentMethod: input.paymentMethod,
    note: input.note,
    partnerShare: input.partnerShare,
    isPrivate: input.isPrivate,
    dayOfMonth: Number(values.dayOfMonth),
  };
};

/** A shared expense can't sit in a private category: the partner couldn't see it. */
const categoryFits = (categories: readonly Category[], id: string, visibility: Visibility) =>
  visibility === 'private' || !categories.find((category) => category.id === id)?.isPrivate;

const firstSharedCategory = (categories: readonly Category[]) =>
  categories.find((category) => !category.isPrivate)?.id ?? OTHER_CATEGORY_ID;

const SUCCESS: Record<ExpenseFormTarget['kind'], string> = {
  new: 'Expense added.',
  expense: 'Expense updated.',
  partner: 'Expense updated for both of you.',
  recurring: 'Recurring expense updated.',
};

export const useExpenseForm = (open: boolean, target: ExpenseFormTarget, onSaved: () => void) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const categories = useAppSelector(selectCategories);
  const partnerCategories = useAppSelector((state) => state.partner.categories);
  const filters = useAppSelector(selectExpenseFilters);
  // A partner's expense uses their category ids: show it with mine, save it back with theirs.
  const mapping = useMemo(
    () => ({
      toMine: categoryMapper(partnerCategories, categories, OTHER_CATEGORY_ID),
      toTheirs: categoryMapper(categories, partnerCategories, OTHER_CATEGORY_ID),
    }),
    [categories, partnerCategories],
  );
  const [values, setValues] = useState<ExpenseFormValues>(() =>
    toFormValues(
      { kind: 'new' },
      { categoryId: '', date: todayKey(), paymentMethod: DEFAULT_PAYMENT_METHOD },
    ),
  );
  const [errors, setErrors] = useState<FormErrors<ExpenseFormValues>>({});
  const targetKey =
    target.kind === 'new'
      ? 'new'
      : target.kind === 'recurring'
        ? `recurring:${target.recurring.id}`
        : `${target.kind}:${target.expense.id}`;

  useEffect(() => {
    if (!open) return;
    const filtered = filters.categoryId !== ALL ? filters.categoryId : null;
    const preferredCategory =
      filtered && categoryFits(categories, filtered, 'shared')
        ? filtered
        : firstSharedCategory(categories);
    const initial = toFormValues(target, {
      categoryId: preferredCategory,
      date: defaultDateFor(filters.month),
      paymentMethod: DEFAULT_PAYMENT_METHOD,
    });
    setValues(
      target.kind === 'partner'
        ? { ...initial, categoryId: mapping.toMine(initial.categoryId) }
        : initial,
    );
    setErrors({});
    // Reset only when the dialog opens or switches item, not when filters change underneath it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, targetKey]);

  const setField = <K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      // Making an expense shared moves it out of a private category.
      if (key === 'visibility' && !categoryFits(categories, next.categoryId, next.visibility)) {
        next.categoryId = firstSharedCategory(categories);
      }
      return next;
    });
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateExpense(values);
    if (!categoryFits(categories, values.categoryId, values.visibility)) {
      nextErrors.categoryId = 'Private categories are only for private expenses.';
    }
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;

    try {
      if (target.kind === 'recurring') {
        await dispatch(
          editRecurring({ id: target.recurring.id, input: toRecurringInput(values) }),
        ).unwrap();
      } else if (target.kind === 'partner') {
        const input = toInput({ ...values, visibility: 'shared' });
        await dispatch(
          editPartnerExpense({
            expense: target.expense,
            input: { ...input, categoryId: mapping.toTheirs(input.categoryId) },
          }),
        ).unwrap();
      } else if (target.kind === 'expense') {
        const input = toInput(values, target.expense.recurringId);
        await dispatch(editExpense({ expense: target.expense, input })).unwrap();
      } else if (values.repeats) {
        await dispatch(addRecurringExpense(toInput(values))).unwrap();
      } else {
        await dispatch(addExpense(toInput(values))).unwrap();
      }
      toast.success(
        target.kind === 'new' && values.repeats
          ? 'Expense added. It will repeat every month.'
          : SUCCESS[target.kind],
      );
      onSaved();
    } catch (message) {
      toast.error(String(message));
    }
  };

  return { values, errors, setField, handleSubmit };
};
