import type { AsyncStatus } from '@/types/async';
import type { Category } from '@/types/category';

export interface CategoriesState {
  items: Category[];
  status: AsyncStatus;
  mutationStatus: AsyncStatus;
  error: string | null;
}
