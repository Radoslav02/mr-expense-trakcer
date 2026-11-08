import { collection, doc } from 'firebase/firestore';
import { COLLECTIONS, PRIVATE_DOCS } from '@/constants/firestore';
import { db } from './firebase';

export const userDocRef = (uid: string) => doc(db, COLLECTIONS.users, uid);

const categoriesCollection = (isPrivate?: boolean) =>
  isPrivate ? COLLECTIONS.privateCategories : COLLECTIONS.categories;

const expensesCollection = (isPrivate?: boolean) =>
  isPrivate ? COLLECTIONS.privateExpenses : COLLECTIONS.expenses;

export const categoriesRef = (uid: string, isPrivate?: boolean) =>
  collection(db, COLLECTIONS.users, uid, categoriesCollection(isPrivate));

export const categoryDocRef = (uid: string, categoryId: string, isPrivate?: boolean) =>
  doc(db, COLLECTIONS.users, uid, categoriesCollection(isPrivate), categoryId);

export const expensesRef = (uid: string, isPrivate?: boolean) =>
  collection(db, COLLECTIONS.users, uid, expensesCollection(isPrivate));

export const expenseDocRef = (uid: string, expenseId: string, isPrivate?: boolean) =>
  doc(db, COLLECTIONS.users, uid, expensesCollection(isPrivate), expenseId);

export const recurringRef = (uid: string) =>
  collection(db, COLLECTIONS.users, uid, COLLECTIONS.recurring);

export const recurringDocRef = (uid: string, recurringId: string) =>
  doc(db, COLLECTIONS.users, uid, COLLECTIONS.recurring, recurringId);

export const financeDocRef = (uid: string) =>
  doc(db, COLLECTIONS.users, uid, COLLECTIONS.private, PRIVATE_DOCS.finance);

export const MAX_BATCH_WRITES = 450;
