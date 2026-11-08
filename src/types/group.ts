/**
 * Someone in a group. Joined app users have a `uid`; invited people have an `email` until they
 * accept; name-only members have neither, and others add expenses for them.
 */
export interface GroupMember {
  id: string;
  name: string;
  uid?: string;
  email?: string;
}

export interface Group {
  id: string;
  name: string;
  currency: string;
  createdBy: string;
  /** Uids of joined app users: who can open the group. */
  memberIds: string[];
  /** Lowercased emails invited but not joined yet. */
  invitedEmails: string[];
  members: Record<string, GroupMember>;
  /** Show the fewest payments that settle everyone, instead of each person-to-person debt. */
  simplifyDebts: boolean;
  createdAt: string;
  updatedAt: string;
}

export type GroupSplitMode = 'equal' | 'exact';

export interface GroupExpense {
  id: string;
  title: string;
  amount: number;
  date: string;
  /** Member id of who paid. */
  paidBy: string;
  splitMode: GroupSplitMode;
  /** Member id → that person's part of the amount. Adds up to `amount`. */
  shares: Record<string, number>;
  note?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type GroupExpenseInput = Omit<GroupExpense, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'>;

/** Money paid back from one member to another to settle up. */
export interface GroupPayment {
  id: string;
  from: string;
  to: string;
  amount: number;
  date: string;
  createdBy: string;
  createdAt: string;
}

export type GroupPaymentInput = Pick<GroupPayment, 'from' | 'to' | 'amount' | 'date'>;

/** A member to add: an email invites an app user, a name alone adds a name-only member. */
export interface NewMember {
  name: string;
  email?: string;
}

/** One payment that moves money from `from` to `to`. */
export interface Transfer {
  from: string;
  to: string;
  amount: number;
}
