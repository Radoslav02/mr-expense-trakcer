import {
  Timestamp,
  addDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { PAYMENT_METHODS } from '@/constants/expenses';
import { EXPENSE_FIELDS } from '@/constants/firestore';
import type { Expense, ExpenseInput, PaymentMethod } from '@/types/expense';
import {
  dateKeyToTimestamp,
  readNumber,
  readString,
  toDateKey,
  toIsoString,
} from './firebase/converters';
import { expenseDocRef, expensesRef } from './firebase/refs';

const isPaymentMethod = (value: unknown): value is PaymentMethod =>
  PAYMENT_METHODS.includes(value as PaymentMethod);

const toExpense = (snapshot: QueryDocumentSnapshot): Expense => {
  const data = snapshot.data();
  const note = readString(data, 'note');
  const partnerShare = readNumber(data, 'partnerShare');
  return {
    id: snapshot.id,
    title: readString(data, 'title'),
    amount: readNumber(data, 'amount') ?? 0,
    categoryId: readString(data, 'categoryId'),
    date: toDateKey(data.date),
    ...(note ? { note } : {}),
    paymentMethod: isPaymentMethod(data.paymentMethod) ? data.paymentMethod : 'other',
    ...(partnerShare && partnerShare > 0 ? { partnerShare } : {}),
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
};

const toFirestorePayload = (input: ExpenseInput) => ({
  title: input.title.trim(),
  amount: input.amount,
  categoryId: input.categoryId,
  date: dateKeyToTimestamp(input.date),
  note: input.note?.trim() ?? '',
  paymentMethod: input.paymentMethod,
  partnerShare: input.partnerShare ?? 0,
});

const normalizeInput = (input: ExpenseInput): ExpenseInput => {
  const note = input.note?.trim();
  return {
    ...input,
    title: input.title.trim(),
    note: note || undefined,
    partnerShare: input.partnerShare && input.partnerShare > 0 ? input.partnerShare : undefined,
  };
};

const expensesQuery = (uid: string) =>
  query(expensesRef(uid), orderBy(EXPENSE_FIELDS.date, 'desc'));

export const fetchExpenses = async (uid: string): Promise<Expense[]> => {
  const snapshot = await getDocs(expensesQuery(uid));
  return snapshot.docs.map(toExpense);
};

export const subscribeToExpenses = (
  uid: string,
  onChange: (expenses: Expense[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(expensesQuery(uid), (snapshot) => onChange(snapshot.docs.map(toExpense)), onError);

export const createExpense = async (uid: string, input: ExpenseInput): Promise<Expense> => {
  const now = Timestamp.now();
  const ref = await addDoc(expensesRef(uid), {
    ...toFirestorePayload(input),
    createdAt: now,
    updatedAt: now,
  });
  const iso = now.toDate().toISOString();
  return { id: ref.id, ...normalizeInput(input), createdAt: iso, updatedAt: iso };
};

export const updateExpense = async (
  uid: string,
  expense: Expense,
  input: ExpenseInput,
): Promise<Expense> => {
  const now = Timestamp.now();
  await updateDoc(expenseDocRef(uid, expense.id), { ...toFirestorePayload(input), updatedAt: now });
  return { ...expense, ...normalizeInput(input), updatedAt: now.toDate().toISOString() };
};

export const deleteExpense = async (uid: string, expenseId: string): Promise<string> => {
  await deleteDoc(expenseDocRef(uid, expenseId));
  return expenseId;
};
