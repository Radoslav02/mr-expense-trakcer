import {
  Timestamp,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  writeBatch,
  type DocumentReference,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { OTHER_CATEGORY_ID, UNCATEGORIZED_COLOR } from '@/constants/categories';
import { EXPENSE_FIELDS } from '@/constants/firestore';
import type { Category, CategoryChanges, CategoryInput } from '@/types/category';
import type { CategoryUpsert } from '@/utils/sharedCategories';
import { combineLatest } from './firebase/combineLatest';
import { readString, toIsoString } from './firebase/converters';
import { db } from './firebase/firebase';
import {
  MAX_BATCH_WRITES,
  categoriesRef,
  categoryDocRef,
  expensesRef,
  recurringRef,
} from './firebase/refs';

/** Categories written before shared syncing had no `updatedAt`; they never win a conflict. */
const LEGACY_UPDATED_AT = new Date(0).toISOString();

const toCategory =
  (isPrivate: boolean) =>
  (snapshot: QueryDocumentSnapshot): Category => {
    const data = snapshot.data();
    const icon = readString(data, 'icon');
    return {
      id: snapshot.id,
      name: readString(data, 'name', 'Untitled'),
      color: readString(data, 'color', UNCATEGORIZED_COLOR),
      ...(icon ? { icon } : {}),
      isDefault: data.isDefault === true,
      sharedKey: readString(data, 'sharedKey') || snapshot.id,
      ...(isPrivate ? { isPrivate: true } : {}),
      ...(data.deleted === true ? { deleted: true } : {}),
      updatedAt: data.updatedAt ? toIsoString(data.updatedAt) : LEGACY_UPDATED_AT,
    };
  };

const categoriesQuery = (uid: string, isPrivate = false) =>
  query(categoriesRef(uid, isPrivate), orderBy('createdAt', 'asc'));

export const fetchCategories = async (uid: string): Promise<Category[]> => {
  const [shared, own] = await Promise.all([
    getDocs(categoriesQuery(uid)),
    getDocs(categoriesQuery(uid, true)),
  ]);
  return [...shared.docs.map(toCategory(false)), ...own.docs.map(toCategory(true))];
};

/** Shared categories, including tombstones of deleted ones. All a partner may read. */
export const subscribeToSharedCategories = (
  uid: string,
  onChange: (categories: Category[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(
    categoriesQuery(uid),
    (snapshot) => onChange(snapshot.docs.map(toCategory(false))),
    onError,
  );

/** My categories: shared (with tombstones) and private together. */
export const subscribeToMyCategories = (
  uid: string,
  onChange: (categories: Category[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  combineLatest<{ shared: Category[]; own: Category[] }>(
    {
      shared: (emit) => subscribeToSharedCategories(uid, emit, onError),
      own: (emit) =>
        onSnapshot(
          categoriesQuery(uid, true),
          (snapshot) => emit(snapshot.docs.map(toCategory(true))),
          onError,
        ),
    },
    ({ shared, own }) => onChange([...shared, ...own]),
  );

export const createCategory = async (
  uid: string,
  input: CategoryInput,
  isPrivate = false,
): Promise<Category> => {
  const now = Timestamp.now();
  const ref = doc(categoriesRef(uid, isPrivate));
  const payload = {
    name: input.name.trim(),
    color: input.color,
    ...(input.icon ? { icon: input.icon } : {}),
    isDefault: false,
    sharedKey: ref.id,
  };
  const batch = writeBatch(db);
  batch.set(ref, { ...payload, createdAt: now, updatedAt: now });
  await batch.commit();
  return {
    id: ref.id,
    ...payload,
    ...(isPrivate ? { isPrivate: true } : {}),
    updatedAt: now.toDate().toISOString(),
  };
};

export const updateCategory = async (
  uid: string,
  category: Category,
  changes: CategoryChanges,
): Promise<{ id: string; changes: CategoryChanges & { updatedAt: string } }> => {
  const now = Timestamp.now();
  const cleaned = changes.name ? { ...changes, name: changes.name.trim() } : changes;
  const batch = writeBatch(db);
  batch.update(categoryDocRef(uid, category.id, category.isPrivate), {
    ...cleaned,
    updatedAt: now,
  });
  await batch.commit();
  return { id: category.id, changes: { ...cleaned, updatedAt: now.toDate().toISOString() } };
};

/** Every document of mine that points at a category: both expense collections and templates. */
const linkedDocs = async (uid: string, categoryId: string): Promise<DocumentReference[]> => {
  const byCategory = where(EXPENSE_FIELDS.categoryId, '==', categoryId);
  const snapshots = await Promise.all([
    getDocs(query(expensesRef(uid), byCategory)),
    getDocs(query(expensesRef(uid, true), byCategory)),
    getDocs(query(recurringRef(uid), byCategory)),
  ]);
  return snapshots.flatMap((snapshot) => snapshot.docs.map((item) => item.ref));
};

/**
 * Hands the category's expenses to `reassignToId`, then removes it. A shared category is kept as
 * a tombstone so the partner's app removes its copy too instead of syncing it back.
 */
export const deleteCategory = async (
  uid: string,
  category: Category,
  reassignToId: string,
  /** When the deletion comes from the partner, keep their timestamp so both copies agree. */
  deletedAt?: string,
): Promise<{ categoryId: string; reassignToId: string; reassignedCount: number }> => {
  const linked = await linkedDocs(uid, category.id);
  const now = Timestamp.now();

  for (let index = 0; index < linked.length; index += MAX_BATCH_WRITES) {
    const batch = writeBatch(db);
    linked.slice(index, index + MAX_BATCH_WRITES).forEach((ref) => {
      batch.update(ref, { categoryId: reassignToId, updatedAt: now });
    });
    await batch.commit();
  }

  const finalBatch = writeBatch(db);
  const ref = categoryDocRef(uid, category.id, category.isPrivate);
  if (category.isPrivate) {
    finalBatch.delete(ref);
  } else {
    finalBatch.update(ref, {
      deleted: true,
      updatedAt: deletedAt ? Timestamp.fromDate(new Date(deletedAt)) : now,
    });
  }
  await finalBatch.commit();

  return { categoryId: category.id, reassignToId, reassignedCount: linked.length };
};

/** Applies the partner's shared categories to mine: new copies, edits and relinks. */
export const applyCategoryUpserts = async (
  uid: string,
  upserts: readonly CategoryUpsert[],
): Promise<void> => {
  for (let index = 0; index < upserts.length; index += MAX_BATCH_WRITES) {
    const batch = writeBatch(db);
    upserts.slice(index, index + MAX_BATCH_WRITES).forEach(({ id, fields, updatedAt, create }) => {
      batch.set(
        categoryDocRef(uid, id),
        {
          ...fields,
          // Copy the partner's timestamp rather than "now", so the two copies settle as equal.
          updatedAt: Timestamp.fromDate(new Date(updatedAt)),
          ...(create ? { createdAt: Timestamp.now(), isDefault: false } : {}),
        },
        { merge: true },
      );
    });
    await batch.commit();
  }
};

export const removeSyncedCategory = (uid: string, category: Category, deletedAt: string) =>
  category.id === OTHER_CATEGORY_ID
    ? Promise.resolve()
    : deleteCategory(uid, category, OTHER_CATEGORY_ID, deletedAt).then(() => undefined);
