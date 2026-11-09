import {
  Timestamp,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  writeBatch,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import type { Saving, SavingInput } from '@/types/saving';
import { combineLatest } from './firebase/combineLatest';
import {
  dateKeyToTimestamp,
  readNumber,
  readString,
  toDateKey,
  toIsoString,
} from './firebase/converters';
import { db } from './firebase/firebase';

const SHARED = 'savings';
/** Owner-only: a partner can't read it. */
const PRIVATE = 'privateSavings';

const savingsRef = (uid: string, isPrivate?: boolean) =>
  collection(db, 'users', uid, isPrivate ? PRIVATE : SHARED);

const savingDocRef = (uid: string, id: string, isPrivate?: boolean) =>
  doc(savingsRef(uid, isPrivate), id);

const toSaving =
  (isPrivate: boolean) =>
  (id: string, data: DocumentData): Saving => ({
    id,
    title: readString(data, 'title'),
    amount: readNumber(data, 'amount') ?? 0,
    date: toDateKey(data.date),
    kind: data.kind === 'withdrawal' ? 'withdrawal' : 'deposit',
    source: data.source === 'leftover' ? 'leftover' : 'custom',
    ...(readString(data, 'note') ? { note: readString(data, 'note') } : {}),
    ...(isPrivate ? { isPrivate: true } : {}),
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  });

const byDateDesc = (a: Saving, b: Saving) =>
  b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);

const subscribe = (
  uid: string,
  isPrivate: boolean,
  onChange: (savings: Saving[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(
    query(savingsRef(uid, isPrivate), orderBy('date', 'desc')),
    (snapshot) => onChange(snapshot.docs.map((item) => toSaving(isPrivate)(item.id, item.data()))),
    onError,
  );

/** Someone else's savings: only the shared ones, which is all a partner may read. */
export const subscribeToSharedSavings = (
  uid: string,
  onChange: (savings: Saving[]) => void,
  onError: (error: Error) => void,
): Unsubscribe => subscribe(uid, false, onChange, onError);

/** My savings: shared and private together. */
export const subscribeToMySavings = (
  uid: string,
  onChange: (savings: Saving[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  combineLatest<{ shared: Saving[]; own: Saving[] }>(
    {
      shared: (emit) => subscribe(uid, false, emit, onError),
      own: (emit) => subscribe(uid, true, emit, onError),
    },
    ({ shared, own }) => onChange([...shared, ...own].sort(byDateDesc)),
  );

const payload = (input: SavingInput) => ({
  title: input.title.trim(),
  amount: input.amount,
  date: dateKeyToTimestamp(input.date),
  kind: input.kind,
  source: input.kind === 'withdrawal' ? 'custom' : input.source,
  note: input.note?.trim() ?? '',
});

export const saveSaving = async (
  uid: string,
  input: SavingInput,
  existing?: Saving,
): Promise<void> => {
  const now = Timestamp.now();
  const isPrivate = input.isPrivate === true;
  const batch = writeBatch(db);
  if (!existing) {
    batch.set(doc(savingsRef(uid, isPrivate)), {
      ...payload(input),
      createdAt: now,
      updatedAt: now,
    });
  } else if ((existing.isPrivate === true) === isPrivate) {
    batch.update(savingDocRef(uid, existing.id, isPrivate), { ...payload(input), updatedAt: now });
  } else {
    // Visibility changed: move it to the other collection, keeping its id.
    batch.delete(savingDocRef(uid, existing.id, existing.isPrivate));
    batch.set(savingDocRef(uid, existing.id, isPrivate), {
      ...payload(input),
      createdAt: Timestamp.fromDate(new Date(existing.createdAt)),
      updatedAt: now,
    });
  }
  await batch.commit();
};

export const deleteSaving = async (uid: string, saving: Saving): Promise<void> => {
  const batch = writeBatch(db);
  batch.delete(savingDocRef(uid, saving.id, saving.isPrivate));
  await batch.commit();
};
