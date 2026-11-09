import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/Button';
import { useI18n } from '@/i18n';
import type { ExpensePeriod, PeriodValue } from '@/types/expense';
import { cn } from '@/utils/cn';
import {
  currentMonthKey,
  currentYearKey,
  shiftMonth,
  shiftWeek,
  shiftYear,
  weekStartKey,
} from '@/utils/dates';
import { currentPeriod, periodLabel } from '@/utils/expenses';

interface PeriodProps {
  value: PeriodValue;
  onChange: (next: PeriodValue) => void;
  className?: string;
}

const PERIODS: readonly ExpensePeriod[] = ['week', 'month', 'year'];

/** This week / This month / This year. Picking one jumps to the current one of that kind. */
export const PeriodChoice = ({ value, onChange, className }: PeriodProps) => {
  const { t } = useI18n();
  const f = t.expenses.filters;
  const names: Record<ExpensePeriod, string> = {
    week: f.thisWeek,
    month: f.thisMonth,
    year: f.thisYear,
  };

  return (
    <div
      role="group"
      aria-label={f.period}
      className={cn('grid shrink-0 grid-cols-3 rounded-lg bg-sunken p-0.5', className)}
    >
      {PERIODS.map((period) => (
        <button
          key={period}
          type="button"
          aria-pressed={value.period === period}
          onClick={() => onChange({ ...currentPeriod(), period })}
          className={cn(
            'h-9 whitespace-nowrap rounded-md px-3 text-[0.8125rem] font-medium transition-colors',
            value.period === period ? 'bg-accent text-accent-ink' : 'text-ink-muted hover:text-ink',
          )}
        >
          {names[period]}
        </button>
      ))}
    </div>
  );
};

/** ‹ 9 – 15 Nov › style navigation through the chosen kind of period. */
export const PeriodNavigator = ({ value, onChange, className }: PeriodProps) => {
  const { t } = useI18n();
  const f = t.expenses.filters;

  const isCurrent =
    value.period === 'week'
      ? value.week >= weekStartKey()
      : value.period === 'year'
        ? value.year >= currentYearKey()
        : value.month >= currentMonthKey();

  const shift = (amount: number) => {
    if (value.period === 'week') onChange({ ...value, week: shiftWeek(value.week, amount) });
    else if (value.period === 'year') onChange({ ...value, year: shiftYear(value.year, amount) });
    else onChange({ ...value, month: shiftMonth(value.month, amount) });
  };

  return (
    <div
      role="group"
      aria-label={f.period}
      className={cn(
        'month-picker inline-flex h-10 min-w-0 items-center rounded-lg border border-line bg-surface',
        className,
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        icon={<ChevronLeft />}
        onClick={() => shift(-1)}
        className="ml-1"
      >
        {f.previousPeriod}
      </Button>
      <span
        aria-live="polite"
        className="tabular min-w-[8.5rem] flex-1 truncate px-2 text-center text-sm font-medium text-ink"
      >
        {periodLabel(value)}
      </span>
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        icon={<ChevronRight />}
        onClick={() => shift(1)}
        disabled={isCurrent}
        className="mr-1"
      >
        {f.nextPeriod}
      </Button>
    </div>
  );
};
