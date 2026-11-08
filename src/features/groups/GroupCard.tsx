import { Link } from 'react-router-dom';
import { ChevronRight, Users } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { useGroupActivity } from '@/hooks/useGroupActivity';
import { useI18n } from '@/i18n';
import { selectAuthUser } from '@/redux/auth/authSelectors';
import type { Group } from '@/types/group';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/currency';
import { memberBalances } from '@/utils/groupBalances';
import { groupPath, myMemberId } from './groupUtils';

/** A group in the list, with where I stand in it. */
export const GroupCard = ({ group }: { group: Group }) => {
  const { t } = useI18n();
  const g = t.groups;
  const uid = useAppSelector(selectAuthUser)?.uid;
  const { expenses, payments, loading } = useGroupActivity(group.id);
  const myId = myMemberId(group, uid);
  const balance =
    myId && !loading
      ? (memberBalances(Object.keys(group.members), expenses, payments)[myId] ?? 0)
      : null;
  const count = Object.keys(group.members).length;

  const status =
    balance === null
      ? null
      : Math.abs(balance) < 0.005
        ? { text: g.card.settled, tone: 'text-ink-subtle' }
        : balance > 0
          ? {
              text: g.card.youAreOwed(formatCurrency(balance, group.currency)),
              tone: 'text-positive',
            }
          : { text: g.card.youOwe(formatCurrency(-balance, group.currency)), tone: 'text-danger' };

  return (
    <li>
      <Link
        to={groupPath(group.id)}
        aria-label={g.card.open(group.name)}
        className="flex min-w-0 items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 shadow-card transition-colors hover:bg-sunken/60"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          <Users aria-hidden="true" className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[0.9375rem] font-semibold text-ink">
            {group.name}
          </span>
          <span className="block truncate text-[0.8125rem] text-ink-subtle">
            {g.card.people(count)} · {group.currency}
          </span>
        </span>
        {status && (
          <span
            className={cn(
              'tabular shrink-0 whitespace-nowrap text-right text-sm font-medium',
              status.tone,
            )}
          >
            {status.text}
          </span>
        )}
        <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-subtle" />
      </Link>
    </li>
  );
};
