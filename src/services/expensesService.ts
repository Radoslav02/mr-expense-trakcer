import {
  Timestamp,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { PAYMENT_METHODS } from '@/constants/expenses';
import { EXPENSE_FIELDS } from '@/constants/firestore';
import type { Expense, ExpenseInput, PaymentMethod } from '@/types/expense';
import { combineLatest } from './firebase/combineLatest';
import {
  dateKeyToTimestamp,
  readNumber,
  readString,
  toDateKey,
  toIsoString,
} from './firebase/converters';
import { db } from './firebase/firebase';
import { expenseDocRef, expensesRef } from './firebase/refs';

export const isPaymentMethod = (value: unknown): value is PaymentMethod =>
  PAYMENT_METHODS.includes(value as PaymentMethod);

const toExpense =
  (isPrivate: boolean) =>
  (snapshot: QueryDocumentSnapshot): Expense => {
    const data = snapshot.data();
    const note = readString(data, 'note');
    const partnerShare = readNumber(data, 'partnerShare');
    const recurringId = readString(data, 'recurringId');
    const editedBy = readString(data, 'editedBy');
    return {
      id: snapshot.id,
      title: readString(data, 'title'),
      amount: readNumber(data, 'amount') ?? 0,
      categoryId: readString(data, 'categoryId'),
      date: toDateKey(data.date),
      ...(note ? { note } : {}),
      paymentMethod: isPaymentMethod(data.paymentMethod) ? data.paymentMethod : 'other',
      // A private expense is never split: the partner couldn't see it to pay their part.
      ...(!isPrivate && partnerShare && partnerShare > 0 ? { partnerShare } : {}),
      ...(isPrivate ? { isPrivate: true } : {}),
      ...(recurringId ? { recurringId } : {}),
      ...(editedBy ? { editedBy } : {}),
      createdAt: toIsoString(data.createdAt),
      updatedAt: toIsoString(data.updatedAt),
    };
  };

/** The document fields for an expense, shared with recurring expenses that write them too. */
export const toExpensePayload = (input: ExpenseInput) => ({
  title: input.title.trim(),
  amount: input.amount,
  categoryId: input.categoryId,
  date: dateKeyToTimestamp(input.date),
  note: input.note?.trim() ?? '',
  paymentMethod: input.paymentMethod,
  partnerShare: input.isPrivate ? 0 : (input.partnerShare ?? 0),
  recurringId: input.recurringId ?? '',
});

const normalizeInput = (input: ExpenseInput): ExpenseInput => {
  const note = input.note?.trim();
  const isPrivate = input.isPrivate === true;
  return {
    ...input,
    title: input.title.trim(),
    note: note || undefined,
    partnerShare:
      !isPrivate && input.partnerShare && input.partnerShare > 0 ? input.partnerShare : undefined,
    isPrivate: isPrivate || undefined,
    recurringId: input.recurringId || undefined,
  };
};

const expensesQuery = (uid: string, isPrivate = false) =>
  query(expensesRef(uid, isPrivate), orderBy(EXPENSE_FIELDS.date, 'desc'));

const byDateDesc = (a: Expense, b: Expense) => b.date.localeCompare(a.date);

export const fetchExpenses = async (uid: string): Promise<Expense[]> => {
  const [shared, own] = await Promise.all([
    getDocs(expensesQuery(uid)),
    getDocs(expensesQuery(uid, true)),
  ]);
  return [...shared.docs.map(toExpense(false)), ...own.docs.map(toExpense(true))].sort(byDateDesc);
};

/** Someone else's expenses: only the shared collection, which is all a partner may read. */
export const subscribeToSharedExpenses = (
  uid: string,
  onChange: (expenses: Expense[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(
    expensesQuery(uid),
    (snapshot) => onChange(snapshot.docs.map(toExpense(false))),
    onError,
  );

/** My own expenses: shared and private together. */
export const subscribeToMyExpenses = (
  uid: string,
  onChange: (expenses: Expense[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  combineLatest<{ shared: Expense[]; own: Expense[] }>(
    {
      shared: (emit) => subscribeToSharedExpenses(uid, emit, onError),
      own: (emit) =>
        onSnapshot(
          expensesQuery(uid, true),
          (snapshot) => emit(snapshot.docs.map(toExpense(true))),
          onError,
        ),
    },
    ({ shared, own }) => onChange([...shared, ...own].sort(byDateDesc)),
  );

export const createExpense = async (uid: string, input: ExpenseInput): Promise<Expense> => {
  const now = Timestamp.now();
  const ref = doc(expensesRef(uid, input.isPrivate));
  const batch = writeBatch(db);
  batch.set(ref, { ...toExpensePayload(input), createdAt: now, updatedAt: now });
  await batch.commit();
  const iso = now.toDate().toISOString();
  return { id: ref.id, ...normalizeInput(input), createdAt: iso, updatedAt: iso };
};

export const updateExpense = async (
  uid: string,
  expense: Expense,
  input: ExpenseInput,
): Promise<Expense> => {
  const now = Timestamp.now();
  const wasPrivate = expense.isPrivate === true;
  const isPrivate = input.isPrivate === true;
  const batch = writeBatch(db);
  // Owner edits clear any "edited by partner" marker.
  const payload = { ...toExpensePayload(input), updatedAt: now, editedBy: uid };

  if (wasPrivate === isPrivate) {
    batch.update(expenseDocRef(uid, expense.id, isPrivate), payload);
  } else {
    // Visibility changed: move the document to the other collection, keeping its id.
    batch.delete(expenseDocRef(uid, expense.id, wasPrivate));
    batch.set(expenseDocRef(uid, expense.id, isPrivate), {
      ...payload,
      createdAt: Timestamp.fromDate(new Date(expense.createdAt)),
    });
  }
  await batch.commit();
  return {
    ...expense,
    ...normalizeInput(input),
    editedBy: uid,
    updatedAt: now.toDate().toISOString(),
  };
};

/**
 * Edits one of my partner's shared expenses. The security rules allow only these fields, and
 * only while we're connected; the expense stays theirs, in their collection.
 */
export const updatePartnerExpense = async (
  myUid: string,
  partnerUid: string,
  expenseId: string,
  input: ExpenseInput,
): Promise<void> => {
  const payload = toExpensePayload(input);
  const batch = writeBatch(db);
  batch.update(expenseDocRef(partnerUid, expenseId), {
    title: payload.title,
    amount: payload.amount,
    categoryId: payload.categoryId,
    date: payload.date,
    note: payload.note,
    paymentMethod: payload.paymentMethod,
    partnerShare: payload.partnerShare,
    updatedAt: Timestamp.now(),
    editedBy: myUid,
  });
  await batch.commit();
};

export const deleteExpense = async (uid: string, expense: Expense): Promise<string> => {
  const batch = writeBatch(db);
  batch.delete(expenseDocRef(uid, expense.id, expense.isPrivate));
  await batch.commit();
  return expense.id;
};
