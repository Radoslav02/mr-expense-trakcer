import {
  Timestamp,
  arrayRemove,
  arrayUnion,
  collection,
  deleteField,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  writeBatch,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import type {
  Group,
  GroupExpense,
  GroupExpenseInput,
  GroupMember,
  GroupPayment,
  GroupPaymentInput,
  NewMember,
} from '@/types/group';
import type { AuthUser } from '@/types/user';
import { normalizeEmail } from '@/utils/comparison';
import {
  dateKeyToTimestamp,
  readNumber,
  readString,
  toDateKey,
  toIsoString,
} from './firebase/converters';
import { db } from './firebase/firebase';
import { MAX_BATCH_WRITES } from './firebase/refs';

const GROUPS = 'groups';
const groupRef = (groupId: string) => doc(db, GROUPS, groupId);
const groupExpensesRef = (groupId: string) => collection(db, GROUPS, groupId, 'expenses');
const groupPaymentsRef = (groupId: string) => collection(db, GROUPS, groupId, 'payments');

const readStrings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

const readNumberMap = (value: unknown): Record<string, number> =>
  value && typeof value === 'object'
    ? Object.fromEntries(
        Object.entries(value as Record<string, unknown>).filter(
          (entry): entry is [string, number] => typeof entry[1] === 'number',
        ),
      )
    : {};

const toMembers = (value: unknown): Record<string, GroupMember> => {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(
    Object.entries(value as Record<string, DocumentData>).map(([id, data]) => {
      const uid = readString(data, 'uid');
      const email = readString(data, 'email');
      return [
        id,
        {
          id,
          name: readString(data, 'name', '?'),
          ...(uid ? { uid } : {}),
          ...(email ? { email } : {}),
        },
      ];
    }),
  );
};

const toGroup = (id: string, data: DocumentData): Group => ({
  id,
  name: readString(data, 'name'),
  currency: readString(data, 'currency', 'RSD'),
  createdBy: readString(data, 'createdBy'),
  memberIds: readStrings(data.memberIds),
  invitedEmails: readStrings(data.invitedEmails),
  members: toMembers(data.members),
  simplifyDebts: data.simplifyDebts !== false,
  createdAt: toIsoString(data.createdAt),
  updatedAt: toIsoString(data.updatedAt),
});

const toExpense = (id: string, data: DocumentData): GroupExpense => {
  const note = readString(data, 'note');
  return {
    id,
    title: readString(data, 'title'),
    amount: readNumber(data, 'amount') ?? 0,
    date: toDateKey(data.date),
    paidBy: readString(data, 'paidBy'),
    splitMode: data.splitMode === 'exact' ? 'exact' : 'equal',
    shares: readNumberMap(data.shares),
    ...(note ? { note } : {}),
    createdBy: readString(data, 'createdBy'),
    createdAt: toIsoString(data.createdAt),
    updatedAt: toIsoString(data.updatedAt),
  };
};

const toPayment = (id: string, data: DocumentData): GroupPayment => ({
  id,
  from: readString(data, 'from'),
  to: readString(data, 'to'),
  amount: readNumber(data, 'amount') ?? 0,
  date: toDateKey(data.date),
  createdBy: readString(data, 'createdBy'),
  createdAt: toIsoString(data.createdAt),
});

const byNewest = (a: Group, b: Group) => b.updatedAt.localeCompare(a.updatedAt);

/** Groups I've joined. */
export const subscribeToMyGroups = (
  uid: string,
  onChange: (groups: Group[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(
    query(collection(db, GROUPS), where('memberIds', 'array-contains', uid)),
    (snapshot) =>
      onChange(snapshot.docs.map((item) => toGroup(item.id, item.data())).sort(byNewest)),
    onError,
  );

/** Groups I've been invited to and haven't answered yet. */
export const subscribeToInvitations = (
  email: string,
  onChange: (groups: Group[]) => void,
  onError: (error: Error) => void,
): Unsubscribe =>
  onSnapshot(
    query(collection(db, GROUPS), where('invitedEmails', 'array-contains', normalizeEmail(email))),
    (snapshot) =>
      onChange(snapshot.docs.map((item) => toGroup(item.id, item.data())).sort(byNewest)),
    onError,
  );

export const subscribeToGroupActivity = (
  groupId: string,
  onChange: (activity: { expenses: GroupExpense[]; payments: GroupPayment[] }) => void,
  onError: (error: Error) => void,
): Unsubscribe => {
  let expenses: GroupExpense[] | null = null;
  let payments: GroupPayment[] | null = null;
  const emit = () => expenses && payments && onChange({ expenses, payments });
  const unsubscribes = [
    onSnapshot(
      query(groupExpensesRef(groupId), orderBy('date', 'desc')),
      (snapshot) => {
        expenses = snapshot.docs.map((item) => toExpense(item.id, item.data()));
        emit();
      },
      onError,
    ),
    onSnapshot(
      query(groupPaymentsRef(groupId), orderBy('date', 'desc')),
      (snapshot) => {
        payments = snapshot.docs.map((item) => toPayment(item.id, item.data()));
        emit();
      },
      onError,
    ),
  ];
  return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
};

export type { NewMember } from '@/types/group';

const newMemberId = () => `m_${doc(collection(db, GROUPS)).id}`;

const memberEntry = ({ name, email }: NewMember) => ({
  name: name.trim(),
  ...(email ? { email: normalizeEmail(email) } : {}),
});

export const createGroup = async (
  me: AuthUser,
  input: { name: string; currency: string; members: NewMember[] },
): Promise<string> => {
  const ref = doc(collection(db, GROUPS));
  const now = Timestamp.now();
  const members: Record<string, DocumentData> = {
    [me.uid]: { name: me.displayName || me.email?.split('@')[0] || '?', uid: me.uid },
  };
  input.members.forEach((member) => {
    members[newMemberId()] = memberEntry(member);
  });
  const batch = writeBatch(db);
  batch.set(ref, {
    name: input.name.trim(),
    currency: input.currency,
    createdBy: me.uid,
    memberIds: [me.uid],
    invitedEmails: input.members.flatMap((member) =>
      member.email ? [normalizeEmail(member.email)] : [],
    ),
    members,
    simplifyDebts: true,
    createdAt: now,
    updatedAt: now,
  });
  await batch.commit();
  return ref.id;
};

export const updateGroup = async (
  groupId: string,
  changes: Partial<Pick<Group, 'name' | 'currency' | 'simplifyDebts'>>,
): Promise<void> => {
  const batch = writeBatch(db);
  batch.update(groupRef(groupId), {
    ...changes,
    ...(changes.name ? { name: changes.name.trim() } : {}),
    updatedAt: Timestamp.now(),
  });
  await batch.commit();
};

export const addGroupMember = async (groupId: string, member: NewMember): Promise<void> => {
  const batch = writeBatch(db);
  batch.update(groupRef(groupId), {
    [`members.${newMemberId()}`]: memberEntry(member),
    ...(member.email ? { invitedEmails: arrayUnion(normalizeEmail(member.email)) } : {}),
    updatedAt: Timestamp.now(),
  });
  await batch.commit();
};

/** Only for members with no expenses or payments; the UI checks that first. */
export const removeGroupMember = async (groupId: string, member: GroupMember): Promise<void> => {
  const batch = writeBatch(db);
  batch.update(groupRef(groupId), {
    [`members.${member.id}`]: deleteField(),
    ...(member.uid ? { memberIds: arrayRemove(member.uid) } : {}),
    ...(member.email ? { invitedEmails: arrayRemove(member.email) } : {}),
    updatedAt: Timestamp.now(),
  });
  await batch.commit();
};

const invitedMember = (group: Group, email: string) =>
  Object.values(group.members).find((member) => !member.uid && member.email === email);

/** Joins a group I was invited to, taking over the member the invite created. */
export const acceptInvitation = async (group: Group, me: AuthUser): Promise<void> => {
  const email = normalizeEmail(me.email ?? '');
  const member = invitedMember(group, email);
  const batch = writeBatch(db);
  batch.update(groupRef(group.id), {
    memberIds: arrayUnion(me.uid),
    invitedEmails: arrayRemove(email),
    ...(member
      ? { [`members.${member.id}.uid`]: me.uid }
      : { [`members.${me.uid}`]: { name: me.displayName || email.split('@')[0], uid: me.uid } }),
    updatedAt: Timestamp.now(),
  });
  await batch.commit();
};

/** Says no: the invite is dropped and the person stays in the group as a name only. */
export const declineInvitation = async (group: Group, me: AuthUser): Promise<void> => {
  const email = normalizeEmail(me.email ?? '');
  const member = invitedMember(group, email);
  const batch = writeBatch(db);
  batch.update(groupRef(group.id), {
    invitedEmails: arrayRemove(email),
    ...(member ? { [`members.${member.id}.email`]: deleteField() } : {}),
    updatedAt: Timestamp.now(),
  });
  await batch.commit();
};

/** Leaves the group. I stay on its expenses as a name, so balances don't change. */
export const leaveGroup = async (group: Group, uid: string): Promise<void> => {
  const member = Object.values(group.members).find((item) => item.uid === uid);
  const batch = writeBatch(db);
  batch.update(groupRef(group.id), {
    memberIds: arrayRemove(uid),
    ...(member ? { [`members.${member.id}.uid`]: deleteField() } : {}),
    updatedAt: Timestamp.now(),
  });
  await batch.commit();
};

/** Deletes the group with all its expenses and payments. */
export const deleteGroup = async (groupId: string): Promise<void> => {
  const [expenses, payments] = await Promise.all([
    getDocs(groupExpensesRef(groupId)),
    getDocs(groupPaymentsRef(groupId)),
  ]);
  const refs = [...expenses.docs, ...payments.docs].map((item) => item.ref);
  for (let index = 0; index < refs.length; index += MAX_BATCH_WRITES) {
    const batch = writeBatch(db);
    refs.slice(index, index + MAX_BATCH_WRITES).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
  const batch = writeBatch(db);
  batch.delete(groupRef(groupId));
  await batch.commit();
};

const expensePayload = (input: GroupExpenseInput) => ({
  title: input.title.trim(),
  amount: input.amount,
  date: dateKeyToTimestamp(input.date),
  paidBy: input.paidBy,
  splitMode: input.splitMode,
  shares: input.shares,
  note: input.note?.trim() ?? '',
});

export const saveGroupExpense = async (
  groupId: string,
  uid: string,
  input: GroupExpenseInput,
  expenseId?: string,
): Promise<void> => {
  const now = Timestamp.now();
  const batch = writeBatch(db);
  if (expenseId) {
    batch.update(doc(groupExpensesRef(groupId), expenseId), {
      ...expensePayload(input),
      updatedAt: now,
    });
  } else {
    batch.set(doc(groupExpensesRef(groupId)), {
      ...expensePayload(input),
      createdBy: uid,
      createdAt: now,
      updatedAt: now,
    });
  }
  batch.update(groupRef(groupId), { updatedAt: now });
  await batch.commit();
};

export const deleteGroupExpense = async (groupId: string, expenseId: string): Promise<void> => {
  const batch = writeBatch(db);
  batch.delete(doc(groupExpensesRef(groupId), expenseId));
  batch.update(groupRef(groupId), { updatedAt: Timestamp.now() });
  await batch.commit();
};

export const recordGroupPayment = async (
  groupId: string,
  uid: string,
  input: GroupPaymentInput,
): Promise<void> => {
  const now = Timestamp.now();
  const batch = writeBatch(db);
  batch.set(doc(groupPaymentsRef(groupId)), {
    ...input,
    date: dateKeyToTimestamp(input.date),
    createdBy: uid,
    createdAt: now,
  });
  batch.update(groupRef(groupId), { updatedAt: now });
  await batch.commit();
};

export const deleteGroupPayment = async (groupId: string, paymentId: string): Promise<void> => {
  const batch = writeBatch(db);
  batch.delete(doc(groupPaymentsRef(groupId), paymentId));
  batch.update(groupRef(groupId), { updatedAt: Timestamp.now() });
  await batch.commit();
};
