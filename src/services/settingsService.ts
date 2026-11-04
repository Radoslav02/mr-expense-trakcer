import {
  getDoc,
  onSnapshot,
  setDoc,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { DEFAULT_SETTINGS } from '@/constants/settings';
import type { UserSettings } from '@/types/user';
import { readNumber, readString } from './firebase/converters';
import { userDocRef } from './firebase/refs';

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
