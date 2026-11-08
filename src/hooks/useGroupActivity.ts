import { useEffect, useState } from 'react';
import { getMessages } from '@/i18n';
import { subscribeToGroupActivity } from '@/services/groupsService';
import type { GroupExpense, GroupPayment } from '@/types/group';

interface GroupActivity {
  expenses: GroupExpense[];
  payments: GroupPayment[];
  loading: boolean;
  error: string | null;
}

/** Live expenses and payments of one group. */
export const useGroupActivity = (groupId: string | undefined): GroupActivity => {
  const [state, setState] = useState<GroupActivity>({
    expenses: [],
    payments: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!groupId) return;
    setState((current) => ({ ...current, loading: true, error: null }));
    return subscribeToGroupActivity(
      groupId,
      ({ expenses, payments }) => setState({ expenses, payments, loading: false, error: null }),
      () =>
        setState((current) => ({
          ...current,
          loading: false,
          error: getMessages().groups.errors.load,
        })),
    );
  }, [groupId]);

  return state;
};
