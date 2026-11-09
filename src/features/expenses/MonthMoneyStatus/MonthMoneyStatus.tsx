import type { CSSProperties } from 'react';
import { useAppSelector } from '@/app/hooks';
import { useCurrencyFormatter } from '@/hooks/useCurrencyFormatter';
import { useI18n } from '@/i18n';
import { selectMonthSummary } from '@/redux/expenses/expensesSelectors';
import { selectMonthlyBudget, selectMonthlyIncome } from '@/redux/settings/settingsSelectors';
import { cn } from '@/utils/cn';
import { formatPercent, roundMoney } from '@/utils/currency';
import { formatMonthLabel } from '@/utils/dates';
import { budgetLevel, type BudgetLevel } from '@/utils/expenses';

interface MonthMoneyStatusProps {
  month: string;
}

const FILL: Record<BudgetLevel, string> = {
  healthy: 'bg-positive',
  warning: 'bg-warning',
  exceeded: 'bg-danger',
};

const TEXT: Record<BudgetLevel, string> = {
  healthy: 'text-ink-muted',
  warning: 'text-warning',
  exceeded: 'text-danger',
};

interface RowProps {
  label: string;
  amounts: string;
  status: string;
  ratio: number;
  level: BudgetLevel;
}

const Row = ({ label, amounts, status, ratio, level }: RowProps) => (
  <div className="min-w-0">
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 text-sm">
      <p className="min-w-0 text-ink-muted">
        <span className="font-medium text-ink">{label}</span>{' '}
        <span className="tabular">{amounts}</span>
      </p>
      <p className={cn('tabular font-medium', TEXT[level])}>{status}</p>
    </div>
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(Math.min(ratio, 1) * 100)}
      aria-valuetext={status}
      className="mt-2 h-1.5 overflow-hidden rounded-full bg-sunken"
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', FILL[level])}
        style={{ width: `${Math.min(ratio, 1) * 100}%` } as CSSProperties}
      />
    </div>
  </div>
);

/**
 * Where the month stands: how much of the income is spent (and any deficit), and how close
 * spending is to the budget limit. Shows only what the person has set up.
 */
export const MonthMoneyStatus = ({ month }: MonthMoneyStatusProps) => {
  const { t } = useI18n();
  const m = t.expenses.money;
  const { format } = useCurrencyFormatter();
  const spent = useAppSelector((state) => selectMonthSummary(state, month).total);
  const income = useAppSelector(selectMonthlyIncome);
  const budget = useAppSelector(selectMonthlyBudget);

  if (!income && !budget) return null;

  const rows: RowProps[] = [];
  if (income) {
    const ratio = spent / income;
    const left = roundMoney(income - spent);
    rows.push({
      label: m.income,
      amounts: m.ofAmount(format(spent), format(income)),
      status:
        left < 0
          ? m.deficit(format(-left))
          : `${m.incomeSpent(formatPercent(ratio))} · ${m.left(format(left))}`,
      ratio,
      // Spending past the income is a deficit; nearly all of it spent is a warning.
      level: left < 0 ? 'exceeded' : ratio >= 0.9 ? 'warning' : 'healthy',
    });
  }
  if (budget) {
    const ratio = spent / budget;
    const left = roundMoney(budget - spent);
    const level = budgetLevel(ratio);
    rows.push({
      label: m.budget,
      amounts: m.ofAmount(format(spent), format(budget)),
      status:
        left < 0
          ? m.budgetOver(format(-left))
          : left === 0
            ? m.budgetReached
            : level === 'warning'
              ? m.budgetClose(format(left))
              : `${m.budgetUsed(formatPercent(ratio))} · ${m.left(format(left))}`,
      ratio,
      level,
    });
  }

  return (
    <section
      aria-label={formatMonthLabel(month)}
      className="flex flex-col gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 shadow-card sm:px-5"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-ink-subtle">
        {formatMonthLabel(month)}
      </p>
      {rows.map((row) => (
        <Row key={row.label} {...row} />
      ))}
    </section>
  );
};
