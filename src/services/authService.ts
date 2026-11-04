import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { Timestamp, getDoc, writeBatch } from 'firebase/firestore';
import { DEFAULT_CATEGORIES } from '@/constants/categories';
import { DEFAULT_SETTINGS } from '@/constants/settings';
import type { AuthUser, EmailCredentials, RegistrationData } from '@/types/user';
import { auth, db } from './firebase/firebase';
import { categoryDocRef, userDocRef } from './firebase/refs';

const isStandaloneApp = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const toAuthUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
});

export const ensureUserInitialized = async (user: AuthUser): Promise<void> => {
  const profileRef = userDocRef(user.uid);
  const snapshot = await getDoc(profileRef);
  if (snapshot.exists()) return;

  const now = Timestamp.now();
  const batch = writeBatch(db);
  batch.set(profileRef, {
    displayName: user.displayName,
    email: user.email,
    ...DEFAULT_SETTINGS,
    createdAt: now,
  });
  DEFAULT_CATEGORIES.forEach(({ id, ...category }) => {
    batch.set(categoryDocRef(user.uid, id), { ...category, isDefault: true, createdAt: now });
  });
  await batch.commit();
};

export const registerWithEmail = async ({
  email,
  password,
  displayName,
}: RegistrationData): Promise<AuthUser> => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName });
  const authUser = { ...toAuthUser(user), displayName };
  await ensureUserInitialized(authUser);
  return authUser;
};

export const signInWithEmail = async ({ email, password }: EmailCredentials): Promise<AuthUser> => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return toAuthUser(user);
};

export const signInWithGoogle = async (): Promise<AuthUser> => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  if (isStandaloneApp()) return signInWithRedirect(auth, provider);
  const { user } = await signInWithPopup(auth, provider);
  const authUser = toAuthUser(user);
  await ensureUserInitialized(authUser);
  return authUser;
};

export const completeRedirectSignIn = async (): Promise<void> => {
  const result = await getRedirectResult(auth);
  if (result) await ensureUserInitialized(toAuthUser(result.user));
};

export const signOutUser = (): Promise<void> => signOut(auth);

export const subscribeToAuthChanges = (callback: (user: AuthUser | null) => void): (() => void) =>
  onAuthStateChanged(auth, (user) => callback(user ? toAuthUser(user) : null));
