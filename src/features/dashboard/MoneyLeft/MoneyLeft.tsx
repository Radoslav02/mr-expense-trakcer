import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Card } from '@/components/Card';
import { ROUTES } from '@/constants/routes';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useI18n } from '@/i18n';
import { selectMoneyLeft } from '@/redux/money/moneySelectors';
import { cn } from '@/utils/cn';
import type { BudgetLevel } from '@/utils/expenses';
import './MoneyLeft.css';

interface MoneyLeftProps {
  month: string;
}

const LEVEL_TEXT: Record<BudgetLevel, string> = {
  healthy: 'text-positive',
  warning: 'text-warning',
  exceeded: 'text-danger',
};

/** How much of this month's income is left, before and after the bills still to come. */
export const MoneyLeft = ({ month }: MoneyLeftProps) => {
  const { t } = useI18n();
  const copy = t.dashboard.moneyLeft;
  const money = useAppSelector((state) => selectMoneyLeft(state, month));
  const { format } = useCurrencyFormatter();

  if (!money) {
    return (
      <div className="money-left flex items-center gap-3 rounded-xl border border-dashed border-line px-5 py-4 text-sm text-ink-muted">
        <Wallet aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-subtle" />
        <p className="min-w-0 flex-1">{copy.empty}</p>
        <Link
          to={ROUTES.settings}
          className="shrink-0 rounded font-medium text-accent hover:underline"
        >
          {copy.addIncome}
        </Link>
      </div>
    );
  }

  const { income, spent, left, upcomingTotal, upcomingCount, leftAfterBills, level } = money;
  const clamp = (value: number) => Math.min(Math.max(value, 0), 1);

  return (
    <Card as="div" className="money-left">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <p className="text-sm text-ink-muted">{copy.title}</p>
          <p
            className={cn(
              'tabular mt-0.5 text-2xl font-semibold tracking-[-0.02em]',
              left < 0 ? 'text-danger' : 'text-ink',
            )}
          >
            {left < 0 ? `−${format(Math.abs(left))}` : format(left)}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:flex sm:gap-x-6">
          <div className="min-w-0">
            <dt className="text-ink-subtle">{copy.income}</dt>
            <dd className="tabular font-medium text-ink">{format(income)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-ink-subtle">{copy.spent}</dt>
            <dd className="tabular font-medium text-ink">{format(spent)}</dd>
          </div>
        </dl>
      </div>
      <div
        role="img"
        aria-label={`${copy.barLabel(format(spent), format(income))}${upcomingTotal > 0 ? copy.barUpcoming(format(upcomingTotal)) : ''}`}
        className="mt-4 flex h-2 overflow-hidden rounded-full bg-sunken"
      >
        <div
          className={cn('money-left__spent h-full', `is-${level}`)}
          style={{ '--part': clamp(money.spentRatio) } as CSSProperties}
        />
        {upcomingTotal > 0 && (
          <div
            className="money-left__upcoming h-full"
            style={{ '--part': clamp(upcomingTotal / income) } as CSSProperties}
          />
        )}
      </div>
      {upcomingCount > 0 && (
        <p className="mt-3 text-sm text-ink-muted">
          {copy.billsToCome(upcomingCount)} (
          <span className="tabular">{format(upcomingTotal)}</span>) ·{' '}
          <span className={cn('tabular font-medium', LEVEL_TEXT[level])}>
            {leftAfterBills < 0
              ? copy.shortAfterBills(format(Math.abs(leftAfterBills)))
              : copy.leftAfterBills(format(leftAfterBills))}
          </span>
        </p>
      )}
    </Card>
  );
};
