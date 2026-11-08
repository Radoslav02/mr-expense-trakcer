import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Card } from '@/components/Card';
import { ROUTES } from '@/constants/routes';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useI18n } from '@/i18n';
import { selectBudgetProgress } from '@/redux/expenses/expensesSelectors';
import { formatPercent } from '@/utils/currency';
import type { BudgetLevel } from '@/utils/expenses';
import { cn } from '@/utils/cn';
import './BudgetProgress.css';

interface BudgetProgressProps {
  month: string;
}

const LEVEL_TEXT: Record<BudgetLevel, string> = {
  healthy: 'text-positive',
  warning: 'text-warning',
  exceeded: 'text-danger',
};

export const BudgetProgress = ({ month }: BudgetProgressProps) => {
  const { t } = useI18n();
  const progress = useAppSelector((state) => selectBudgetProgress(state, month));
  const { format } = useCurrencyFormatter();

  if (!progress) {
    return (
      <div className="budget-progress flex items-center gap-3 rounded-xl border border-dashed border-line px-5 py-4 text-sm text-ink-muted">
        <Target aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-subtle" />
        <p className="flex-1">{t.dashboard.budget.empty}</p>
        <Link
          to={ROUTES.settings}
          className="shrink-0 rounded font-medium text-accent hover:underline"
        >
          {t.dashboard.budget.setBudget}
        </Link>
      </div>
    );
  }

  const { budget, spent, remaining, ratio, level } = progress;
  const statusText =
    remaining >= 0
      ? t.dashboard.budget.left(format(remaining))
      : t.dashboard.budget.over(format(Math.abs(remaining)));

  return (
    <Card as="div" className="budget-progress">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="text-sm text-ink-muted">
          {t.dashboard.budget.monthly}{' '}
          <span className="tabular font-medium text-ink">
            {format(spent)}{' '}
            <span className="text-ink-subtle">{t.dashboard.budget.of(format(budget))}</span>
          </span>
        </p>
        <p className={cn('tabular text-sm font-medium', LEVEL_TEXT[level])}>
          {t.dashboard.budget.used(formatPercent(ratio))} · {statusText}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label={t.dashboard.budget.progressLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(Math.min(ratio, 1) * 100)}
        aria-valuetext={t.dashboard.budget.progressValue(formatPercent(ratio))}
        className="budget-progress__track mt-3 h-2 overflow-hidden rounded-full bg-sunken"
      >
        <div
          className={cn('budget-progress__fill h-full rounded-full', `is-${level}`)}
          style={{ '--progress': Math.min(ratio, 1) } as CSSProperties}
        />
      </div>
    </Card>
  );
};
