import { Scale } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Card } from '@/components/Card';
import { Skeleton } from '@/components/Skeleton';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { selectPersonNames, selectSplitBalance } from '@/redux/partner/partnerSelectors';
import type { Person } from '@/types/partner';
import { PersonAvatar } from '../PersonAvatar';

interface SplitBalanceProps {
  month: string;
  loading: boolean;
}

const plural = (count: number) => `${count} split ${count === 1 ? 'expense' : 'expenses'}`;

interface CoveredRowProps {
  person: Person;
  name: string;
  label: string;
  amount: string;
  count: number;
}

const CoveredRow = ({ person, name, label, amount, count }: CoveredRowProps) => (
  <li className="flex items-center gap-3">
    <PersonAvatar person={person} name={name} size="sm" />
    <span className="min-w-0 flex-1">
      <span className="block truncate text-sm text-ink">{label}</span>
      <span className="block text-[0.8125rem] text-ink-subtle">{plural(count)}</span>
    </span>
    <span className="tabular shrink-0 text-sm font-medium text-ink">{amount}</span>
  </li>
);

export const SplitBalance = ({ month, loading }: SplitBalanceProps) => {
  const balance = useAppSelector((state) => selectSplitBalance(state, month));
  const names = useAppSelector(selectPersonNames);
  const { format } = useCurrencyFormatter();
  const hasSplits = balance.meCount + balance.partnerCount > 0;

  const headline =
    Math.abs(balance.net) < 0.01
      ? 'You’re even'
      : balance.net > 0
        ? `${names.partner} owes you ${format(balance.net)}`
        : `You owe ${names.partner} ${format(Math.abs(balance.net))}`;

  return (
    <Card title="Split balance" description="Shared costs this month, netted out">
      {loading ? (
        <Skeleton className="h-8 w-48" />
      ) : !hasSplits ? (
        <p className="flex items-center gap-2 text-sm text-ink-subtle">
          <Scale className="h-4 w-4 shrink-0" aria-hidden="true" />
          No split expenses this month. Turn on “Split with {names.partner}” when adding one.
        </p>
      ) : (
        <>
          <p
            aria-live="polite"
            className="tabular text-[1.375rem] font-semibold tracking-[-0.02em] text-ink"
          >
            {headline}
          </p>
          <ul className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
            <CoveredRow
              person="me"
              name={names.me}
              label={`You covered for ${names.partner}`}
              amount={format(balance.owedToMe)}
              count={balance.meCount}
            />
            <CoveredRow
              person="partner"
              name={names.partner}
              label={`${names.partner} covered for you`}
              amount={format(balance.iOwe)}
              count={balance.partnerCount}
            />
          </ul>
        </>
      )}
    </Card>
  );
};
