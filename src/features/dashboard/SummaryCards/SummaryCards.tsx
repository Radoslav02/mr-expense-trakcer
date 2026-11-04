import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Skeleton } from '@/components/Skeleton';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { selectMonthSummary } from '@/redux/expenses/expensesSelectors';
import { formatPercent } from '@/utils/currency';
import { currentMonthKey, formatMonthLabel, formatShortDate, shiftMonth } from '@/utils/dates';
import { cn } from '@/utils/cn';
import './SummaryCards.css';

interface SummaryCardsProps {
  month: string;
  loading: boolean;
}

interface StatProps {
  label: string;
  value: string;
  detail: ReactNode;
  loading: boolean;
}

const Stat = ({ label, value, detail, loading }: StatProps) => (
  <div className="summary-cards__stat min-w-0 px-5 py-4">
    <dt className="text-[0.8125rem] text-ink-subtle">{label}</dt>
    {loading ? (
      <>
        <Skeleton className="mt-2 h-7 w-28" />
        <Skeleton className="mt-2 h-3.5 w-20" />
      </>
    ) : (
      <>
        <dd className="tabular mt-1 truncate text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">
          {value}
        </dd>
        <dd className="mt-0.5 truncate text-[0.8125rem] text-ink-subtle">{detail}</dd>
      </>
    )}
  </div>
);

const ChangeDetail = ({ change }: { change: number | null }) => {
  if (change === null) return <>No spending to compare</>;
  const increased = change > 0;
  const Icon = increased ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5',
        increased ? 'text-danger' : 'text-positive',
      )}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {formatPercent(Math.abs(change))} {increased ? 'more' : 'less'} than before
    </span>
  );
};

export const SummaryCards = ({ month, loading }: SummaryCardsProps) => {
  const summary = useAppSelector((state) => selectMonthSummary(state, month));
  const { format } = useCurrencyFormatter();
  const isCurrent = month === currentMonthKey();
  const previousLabel = formatMonthLabel(shiftMonth(month, -1));

  return (
    <dl className="summary-cards grid grid-cols-1 overflow-hidden rounded-xl border border-line bg-surface shadow-card sm:grid-cols-2 xl:grid-cols-4">
      <Stat
        loading={loading}
        label={isCurrent ? 'Spent this month' : `Spent in ${formatMonthLabel(month)}`}
        value={format(summary.total)}
        detail={`${summary.count} ${summary.count === 1 ? 'expense' : 'expenses'}`}
      />
      <Stat
        loading={loading}
        label={isCurrent ? 'Last month' : previousLabel}
        value={format(summary.previousTotal)}
        detail={<ChangeDetail change={summary.change} />}
      />
      <Stat
        loading={loading}
        label="Daily average"
        value={format(summary.dailyAverage)}
        detail={isCurrent ? 'Across days so far' : 'Across the whole month'}
      />
      <Stat
        loading={loading}
        label="Largest expense"
        value={summary.largest ? format(summary.largest.amount) : '—'}
        detail={
          summary.largest
            ? `${summary.largest.title} · ${formatShortDate(summary.largest.date)}`
            : 'Nothing recorded yet'
        }
      />
    </dl>
  );
};
