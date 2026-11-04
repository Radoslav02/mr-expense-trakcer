import type { Category } from './category';
import type { Expense } from './expense';

export type Person = 'me' | 'partner';

export type PartnerLinkStatus = 'none' | 'pending' | 'connected';

export interface PartnerProfile {
  uid: string;
  email: string;
  displayName: string | null;
}

export interface PartnerLink {
  partnerEmail: string | null;
  incoming: PartnerProfile | null;
}

export interface PartnerData {
  expenses: Expense[];
  categories: Category[];
  currency: string;
}
