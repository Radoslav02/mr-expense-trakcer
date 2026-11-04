import {
  doc,
  getDoc,
  onSnapshot,
  writeBatch,
  type DocumentSnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { COLLECTIONS, PROFILE_FIELDS } from '@/constants/firestore';
import type { Category } from '@/types/category';
import type { Expense } from '@/types/expense';
import type { PartnerData, PartnerLink, PartnerProfile } from '@/types/partner';
import type { AuthUser } from '@/types/user';
import { normalizeEmail } from '@/utils/comparison';
import { subscribeToCategories } from './categoriesService';
import { subscribeToExpenses } from './expensesService';
import { combineLatest } from './firebase/combineLatest';
import { readString } from './firebase/converters';
import { db } from './firebase/firebase';
import { userDocRef } from './firebase/refs';
import { subscribeToSettings } from './settingsService';

const inviteRef = (email: string) => doc(db, COLLECTIONS.partnerInvites, normalizeEmail(email));

const toIncomingInvite = (snapshot: DocumentSnapshot): PartnerProfile | null => {
  const data = snapshot.data();
  if (!data) return null;
  const uid = readString(data, 'uid');
  const email = readString(data, 'email');
  if (!uid || !email) return null;
  return { uid, email, displayName: readString(data, 'displayName') || null };
};

const toPartnerEmail = (snapshot: DocumentSnapshot): string | null =>
  readString(snapshot.data() ?? {}, PROFILE_FIELDS.partnerEmail) || null;

export const fetchPartnerLink = async (uid: string, myEmail: string): Promise<PartnerLink> => {
  const [profile, invite] = await Promise.all([
    getDoc(userDocRef(uid)),
    getDoc(inviteRef(myEmail)),
  ]);
  return { partnerEmail: toPartnerEmail(profile), incoming: toIncomingInvite(invite) };
};

export const subscribeToPartnerLink = (
  uid: string,
  myEmail: string,
  onChange: (link: PartnerLink) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  combineLatest<{ partnerEmail: string | null; incoming: PartnerProfile | null }>(
    {
      partnerEmail: (emit) =>
        onSnapshot(userDocRef(uid), (snapshot) => emit(toPartnerEmail(snapshot)), onError),
      incoming: (emit) =>
        onSnapshot(inviteRef(myEmail), (snapshot) => emit(toIncomingInvite(snapshot)), onError),
    },
    onChange,
  );

export const subscribeToPartnerData = (
  partnerUid: string,
  onChange: (data: PartnerData) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  combineLatest<{ expenses: Expense[]; categories: Category[]; currency: string }>(
    {
      expenses: (emit) => subscribeToExpenses(partnerUid, emit, onError),
      categories: (emit) => subscribeToCategories(partnerUid, emit, onError),
      currency: (emit) =>
        subscribeToSettings(partnerUid, (settings) => emit(settings.currency), onError),
    },
    onChange,
  );

export const shareWithPartner = async (
  me: AuthUser,
  partnerEmail: string,
  previousPartnerEmail: string | null,
): Promise<string> => {
  if (!me.email) throw new Error('Your account has no email address, so it cannot be shared.');
  const email = normalizeEmail(partnerEmail);
  const batch = writeBatch(db);

  if (previousPartnerEmail && normalizeEmail(previousPartnerEmail) !== email) {
    batch.delete(inviteRef(previousPartnerEmail));
  }
  batch.set(userDocRef(me.uid), { [PROFILE_FIELDS.partnerEmail]: email }, { merge: true });
  batch.set(inviteRef(email), {
    uid: me.uid,
    email: normalizeEmail(me.email),
    displayName: me.displayName ?? '',
  });
  await batch.commit();
  return email;
};

export const stopSharing = async (uid: string, partnerEmail: string): Promise<void> => {
  const batch = writeBatch(db);
  batch.delete(inviteRef(partnerEmail));
  batch.set(userDocRef(uid), { [PROFILE_FIELDS.partnerEmail]: null }, { merge: true });
  await batch.commit();
};
