import {
  Timestamp,
  addDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { UNCATEGORIZED_COLOR } from '@/constants/categories';
import { EXPENSE_FIELDS } from '@/constants/firestore';
import type { Category, CategoryChanges, CategoryInput } from '@/types/category';
import { readString } from './firebase/converters';
import { db } from './firebase/firebase';
import { MAX_BATCH_WRITES, categoriesRef, categoryDocRef, expensesRef } from './firebase/refs';

const toCategory = (snapshot: QueryDocumentSnapshot): Category => {
  const data = snapshot.data();
  const icon = readString(data, 'icon');
  return {
    id: snapshot.id,
    name: readString(data, 'name', 'Untitled'),
    color: readString(data, 'color', UNCATEGORIZED_COLOR),
    ...(icon ? { icon } : {}),
    isDefault: data.isDefault === true,
  };
};

const categoriesQuery = (uid: string) => query(categoriesRef(uid), orderBy('createdAt', 'asc'));

export const fetchCategories = async (uid: string): Promise<Category[]> => {
  const snapshot = await getDocs(categoriesQuery(uid));
  return snapshot.docs.map(toCategory);
};

export const subscribeToCategories = (
  uid: string,
  onChange: (categories: Category[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(categoriesQuery(uid), (snapshot) => onChange(snapshot.docs.map(toCategory)), onError);

export const createCategory = async (uid: string, input: CategoryInput): Promise<Category> => {
  const payload = { ...input, name: input.name.trim(), isDefault: false };
  const ref = await addDoc(categoriesRef(uid), { ...payload, createdAt: Timestamp.now() });
  return { id: ref.id, ...payload };
};

export const updateCategory = async (
  uid: string,
  categoryId: string,
  changes: CategoryChanges,
): Promise<{ id: string; changes: CategoryChanges }> => {
  const cleaned = changes.name ? { ...changes, name: changes.name.trim() } : changes;
  await updateDoc(categoryDocRef(uid, categoryId), cleaned);
  return { id: categoryId, changes: cleaned };
};

export const deleteCategory = async (
  uid: string,
  categoryId: string,
  reassignToId: string,
): Promise<{ categoryId: string; reassignToId: string; reassignedCount: number }> => {
  const linked = await getDocs(
    query(expensesRef(uid), where(EXPENSE_FIELDS.categoryId, '==', categoryId)),
  );
  const now = Timestamp.now();

  for (let index = 0; index < linked.docs.length; index += MAX_BATCH_WRITES) {
    const batch = writeBatch(db);
    linked.docs.slice(index, index + MAX_BATCH_WRITES).forEach((expense) => {
      batch.update(expense.ref, { categoryId: reassignToId, updatedAt: now });
    });
    await batch.commit();
  }

  const finalBatch = writeBatch(db);
  finalBatch.delete(categoryDocRef(uid, categoryId));
  await finalBatch.commit();

  return { categoryId, reassignToId, reassignedCount: linked.size };
};
