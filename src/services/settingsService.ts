import {
  getDoc,
  onSnapshot,
  setDoc,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { DEFAULT_SETTINGS } from '@/constants/settings';
import type { PrivateFinance, UserSettings } from '@/types/user';
import { readNumber, readString } from './firebase/converters';
import { financeDocRef, userDocRef } from './firebase/refs';

const toSettings = (data: DocumentData | undefined): UserSettings =>
  data
    ? {
        currency: readString(data, 'currency', DEFAULT_SETTINGS.currency),
        monthlyBudget: readNumber(data, 'monthlyBudget'),
      }
    : DEFAULT_SETTINGS;

export const fetchSettings = async (uid: string): Promise<UserSettings> => {
  const snapshot = await getDoc(userDocRef(uid));
  return toSettings(snapshot.data());
};

export const subscribeToSettings = (
  uid: string,
  onChange: (settings: UserSettings) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(userDocRef(uid), (snapshot) => onChange(toSettings(snapshot.data())), onError);

export const saveSettings = async (uid: string, settings: UserSettings): Promise<UserSettings> => {
  await setDoc(userDocRef(uid), settings, { merge: true });
  return settings;
};

const toFinance = (data: DocumentData | undefined): PrivateFinance => ({
  monthlyIncome: data ? readNumber(data, 'monthlyIncome') : null,
});

/** Income lives in an owner-only document, so a partner never sees it. */
export const subscribeToFinance = (
  uid: string,
  onChange: (finance: PrivateFinance) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(financeDocRef(uid), (snapshot) => onChange(toFinance(snapshot.data())), onError);

export const saveFinance = async (
  uid: string,
  finance: PrivateFinance,
): Promise<PrivateFinance> => {
  await setDoc(financeDocRef(uid), finance, { merge: true });
  return finance;
};
