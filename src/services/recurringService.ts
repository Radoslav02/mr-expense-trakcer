import {
  Timestamp,
  doc,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  writeBatch,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import type { ExpenseInput, RecurringExpense, RecurringInput } from '@/types/expense';
import { monthKeyOf, todayKey } from '@/utils/dates';
import { dueMonths, expenseFromTemplate, recurringExpenseId } from '@/utils/recurring';
import { isPaymentMethod, toExpensePayload } from './expensesService';
import { readNumber, readString, toIsoString } from './firebase/converters';
import { db } from './firebase/firebase';
import { expenseDocRef, recurringDocRef, recurringRef } from './firebase/refs';

const toRecurring = (id: string, data: DocumentData): RecurringExpense => {
  const note = readString(data, 'note');
  const partnerShare = readNumber(data, 'partnerShare');
  const isPrivate = data.isPrivate === true;
  return {
    id,
    title: readString(data, 'title'),
    amount: readNumber(data, 'amount') ?? 0,
    categoryId: readString(data, 'categoryId'),
    paymentMethod: isPaymentMethod(data.paymentMethod) ? data.paymentMethod : 'other',
    ...(note ? { note } : {}),
    ...(!isPrivate && partnerShare && partnerShare > 0 ? { partnerShare } : {}),
    ...(isPrivate ? { isPrivate: true } : {}),
    dayOfMonth: Math.min(Math.max(readNumber(data, 'dayOfMonth') ?? 1, 1), 31),
    lastMonth: readString(data, 'lastMonth'),
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
};

const toPayload = (input: RecurringInput) => ({
  title: input.title.trim(),
  amount: input.amount,
  categoryId: input.categoryId,
  paymentMethod: input.paymentMethod,
  note: input.note?.trim() ?? '',
  partnerShare: input.isPrivate ? 0 : (input.partnerShare ?? 0),
  isPrivate: input.isPrivate === true,
  dayOfMonth: input.dayOfMonth,
});

export const subscribeToRecurring = (
  uid: string,
  onChange: (templates: RecurringExpense[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(
    query(recurringRef(uid), orderBy('createdAt', 'asc')),
    (snapshot) => onChange(snapshot.docs.map((item) => toRecurring(item.id, item.data()))),
    onError,
  );

/** Saves the first expense and the template that repeats it every month, in one write. */
export const createRecurringWithExpense = async (
  uid: string,
  expense: ExpenseInput,
): Promise<void> => {
  const now = Timestamp.now();
  const templateRef = doc(recurringRef(uid));
  const month = monthKeyOf(expense.date);
  const batch = writeBatch(db);
  batch.set(templateRef, {
    ...toPayload({ ...expense, dayOfMonth: Number(expense.date.slice(8, 10)) }),
    lastMonth: month,
    createdAt: now,
    updatedAt: now,
  });
  batch.set(expenseDocRef(uid, recurringExpenseId(templateRef.id, month), expense.isPrivate), {
    ...toExpensePayload({ ...expense, recurringId: templateRef.id }),
    createdAt: now,
    updatedAt: now,
  });
  await batch.commit();
};

/** Changes apply to the months still to come; expenses already added stay as they are. */
export const updateRecurring = async (
  uid: string,
  recurringId: string,
  input: RecurringInput,
): Promise<void> => {
  const batch = writeBatch(db);
  batch.update(recurringDocRef(uid, recurringId), {
    ...toPayload(input),
    updatedAt: Timestamp.now(),
  });
  await batch.commit();
};

/** Stops future months. Expenses already added are kept. */
export const deleteRecurring = async (uid: string, recurringId: string): Promise<void> => {
  const batch = writeBatch(db);
  batch.delete(recurringDocRef(uid, recurringId));
  await batch.commit();
};

/**
 * Adds every month's expense that has come due since the template last ran. It's a transaction
 * on the template, so two devices opening the app at once can't both add the same month.
 */
export const addDueExpenses = async (
  uid: string,
  recurringId: string,
  today: string = todayKey(),
): Promise<number> =>
  runTransaction(db, async (transaction) => {
    const ref = recurringDocRef(uid, recurringId);
    const snapshot = await transaction.get(ref);
    const data = snapshot.data();
    if (!data) return 0;
    const template = toRecurring(snapshot.id, data);
    const months = dueMonths(template, today);
    if (months.length === 0) return 0;

    const now = Timestamp.now();
    months.forEach((month) => {
      transaction.set(
        expenseDocRef(uid, recurringExpenseId(template.id, month), template.isPrivate),
        {
          ...toExpensePayload(expenseFromTemplate(template, month)),
          createdAt: now,
          updatedAt: now,
        },
      );
    });
    transaction.update(ref, { lastMonth: months[months.length - 1] });
    return months.length;
  });
