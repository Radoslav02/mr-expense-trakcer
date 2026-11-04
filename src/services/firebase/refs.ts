import { collection, doc } from 'firebase/firestore';
import { COLLECTIONS } from '@/constants/firestore';
import { db } from './firebase';

export const userDocRef = (uid: string) => doc(db, COLLECTIONS.users, uid);

export const categoriesRef = (uid: string) =>
  collection(db, COLLECTIONS.users, uid, COLLECTIONS.categories);

export const categoryDocRef = (uid: string, categoryId: string) =>
  doc(db, COLLECTIONS.users, uid, COLLECTIONS.categories, categoryId);

export const expensesRef = (uid: string) =>
  collection(db, COLLECTIONS.users, uid, COLLECTIONS.expenses);

export const expenseDocRef = (uid: string, expenseId: string) =>
  doc(db, COLLECTIONS.users, uid, COLLECTIONS.expenses, expenseId);

export const MAX_BATCH_WRITES = 450;
