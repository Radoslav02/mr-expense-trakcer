import type { AsyncStatus } from '@/types/async';
import type { Category } from '@/types/category';
import type { Expense } from '@/types/expense';
import type { PartnerProfile } from '@/types/partner';

export interface PartnerState {
  partnerEmail: string | null;
  incoming: PartnerProfile | null;
  expenses: Expense[];
  categories: Category[];
  currency: string | null;
  status: AsyncStatus;
  dataStatus: AsyncStatus;
  mutationStatus: AsyncStatus;
  error: string | null;
}
