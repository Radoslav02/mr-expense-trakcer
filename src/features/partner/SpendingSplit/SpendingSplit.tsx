import type { CSSProperties } from 'react';
import { useAppSelector } from '@/app/hooks';
import { Skeleton } from '@/components/Skeleton';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { selectPersonNames, selectSpendingSplit } from '@/redux/partner/partnerSelectors';
import type { Person } from '@/types/partner';
import { formatPercent } from '@/utils/currency';
import { PersonAvatar } from '../PersonAvatar';
import './SpendingSplit.css';

interface SpendingSplitProps {
  month: string;
  loading: boolean;
}

interface PersonTotalProps {
  person: Person;
  name: string;
  total: string;
  count: number;
  loading: boolean;
}

const PersonTotal = ({ person, name, total, count, loading }: PersonTotalProps) => (
  <div className={person === 'partner' ? 'text-right' : undefined}>
    <div className={`flex items-center gap-2 ${person === 'partner' ? 'justify-end' : ''}`}>
      <PersonAvatar person={person} name={name} size="sm" />
      <span className="text-sm font-medium text-ink-muted">{name}</span>
    </div>
    {loading ? (
      <Skeleton className={`mt-2 h-8 w-32 ${person === 'partner' ? 'ml-auto' : ''}`} />
    ) : (
      <>
        <p className="tabular mt-1.5 text-[1.625rem] font-semibold tracking-[-0.02em] text-ink">
          {total}
        </p>
        <p className="text-[0.8125rem] text-ink-subtle">
          {count} {count === 1 ? 'expense' : 'expenses'}
        </p>
      </>
    )}
  </div>
);

export const SpendingSplit = ({ month, loading }: SpendingSplitProps) => {
  const split = useAppSelector((state) => selectSpendingSplit(state, month));
  const names = useAppSelector(selectPersonNames);
  const { format } = useCurrencyFormatter();

  const verdict =
    split.total === 0
      ? 'Neither of you has spent anything this month yet.'
      : Math.abs(split.difference) < 0.01
        ? 'You spent exactly the same.'
        : split.difference > 0
          ? `You spent ${format(split.difference)} more than ${names.partner}.`
          : `${names.partner} spent ${format(Math.abs(split.difference))} more than you.`;

  return (
    <section
      aria-label="Who spent how much"
      className="spending-split rounded-xl border border-line bg-surface p-5 shadow-card"
    >
      <div className="grid grid-cols-2 gap-4">
        <PersonTotal
          person="me"
          name={names.me}
          total={format(split.me)}
          count={split.meCount}
          loading={loading}
        />
        <PersonTotal
          person="partner"
          name={names.partner}
          total={format(split.partner)}
          count={split.partnerCount}
          loading={loading}
        />
      </div>
      <div
        role="img"
        aria-label={`${names.me} ${formatPercent(split.meShare)}, ${names.partner} ${formatPercent(split.partnerShare)} of combined spending`}
        className="spending-split__bar mt-5 flex h-2.5 overflow-hidden rounded-full bg-sunken"
        style={{ '--me-share': split.total > 0 ? split.meShare : 0.5 } as CSSProperties}
      >
        <span className="spending-split__me" />
        <span className="spending-split__partner" />
      </div>
      <div className="tabular mt-2 flex justify-between text-xs text-ink-subtle">
        <span>{formatPercent(split.meShare)}</span>
        <span>Together {format(split.total)}</span>
        <span>{formatPercent(split.partnerShare)}</span>
      </div>
      <p className="mt-4 border-t border-line pt-4 text-sm text-ink-muted">
        {loading ? ' ' : verdict}
      </p>
    </section>
  );
};
