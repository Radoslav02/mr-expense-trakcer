import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ToggleField } from '@/components/ToggleField';
import { useToast } from '@/hooks/useToast';
import { useI18n } from '@/i18n';
import { useAppDispatch } from '@/app/hooks';
import { updateGroupThunk } from '@/redux/groups/groupsThunks';
import type { Group, Transfer } from '@/types/group';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/currency';
import { MemberAvatar } from './MemberAvatar';

interface GroupBalancesProps {
  group: Group;
  transfers: readonly Transfer[];
  myId: string | null;
  onSettle: (transfer: Transfer | null) => void;
}

/** Who owes whom, with a shortcut to record the payment that settles each one. */
export const GroupBalances = ({ group, transfers, myId, onSettle }: GroupBalancesProps) => {
  const { t } = useI18n();
  const g = t.groups;
  const toast = useToast();
  const dispatch = useAppDispatch();
  const format = (amount: number) => formatCurrency(amount, group.currency);
  const nameOf = (id: string) => (id === myId ? t.common.you : (group.members[id]?.name ?? '?'));

  const setSimplify = async (simplifyDebts: boolean) => {
    try {
      await dispatch(updateGroupThunk({ groupId: group.id, changes: { simplifyDebts } })).unwrap();
    } catch {
      toast.error(g.errors.save);
    }
  };

  return (
    <Card
      title={g.balances.title}
      padded={false}
      actions={
        <Button size="sm" variant="secondary" onClick={() => onSettle(null)}>
          {g.balances.recordPayment}
        </Button>
      }
    >
      <div className="px-4 pb-4 pt-4 sm:px-5">
        {transfers.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0 text-positive" />
            {g.balances.allSettled}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {transfers.map((transfer) => {
              const involvesMe = transfer.from === myId || transfer.to === myId;
              const from = group.members[transfer.from] ?? { id: transfer.from, name: '?' };
              const to = group.members[transfer.to] ?? { id: transfer.to, name: '?' };
              return (
                <li
                  key={`${transfer.from}-${transfer.to}`}
                  className={cn(
                    'flex min-w-0 items-center gap-2 rounded-xl border border-line px-3 py-2.5',
                    involvesMe && 'border-accent/30 bg-accent-soft/30',
                  )}
                >
                  <span
                    className="flex min-w-0 flex-1 items-center gap-2 text-sm"
                    aria-label={g.balances.owes(
                      nameOf(transfer.from),
                      nameOf(transfer.to),
                      format(transfer.amount),
                    )}
                  >
                    <MemberAvatar member={from} size="sm" />
                    <span className="min-w-0 truncate font-medium text-ink">
                      {nameOf(transfer.from)}
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className="h-3.5 w-3.5 shrink-0 text-ink-subtle"
                    />
                    <MemberAvatar member={to} size="sm" className="hidden min-[400px]:flex" />
                    <span className="min-w-0 truncate font-medium text-ink">
                      {nameOf(transfer.to)}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'tabular shrink-0 whitespace-nowrap text-sm font-semibold',
                      transfer.from === myId ? 'text-danger' : 'text-ink',
                      transfer.to === myId && 'text-positive',
                    )}
                  >
                    {format(transfer.amount)}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSettle(transfer)}
                    className="shrink-0 px-2"
                  >
                    {g.balances.settle}
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      <div className="border-t border-line px-4 py-3 sm:px-5">
        <ToggleField
          label={g.balances.simplify}
          description={g.balances.simplifyHint}
          checked={group.simplifyDebts}
          onChange={(checked) => void setSimplify(checked)}
          className="border-0 p-0 [&.is-on]:bg-transparent"
        />
      </div>
    </Card>
  );
};
