import type { AsyncStatus } from '@/types/async';
import type { AuthUser } from '@/types/user';

export interface AuthState {
  user: AuthUser | null;
  initialized: boolean;
  status: AsyncStatus;
  error: string | null;
}
