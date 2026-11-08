import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { PAYMENT_METHODS } from '@/constants/expenses';
import { useExpenseFilters } from '@/hooks/useExpenseFilters';
import { useI18n } from '@/i18n';
import { selectSortedCategories } from '@/redux/categories/categoriesSelectors';
import { ALL, type ExpensePeriod, type PaymentMethod } from '@/types/expense';
import { cn } from '@/utils/cn';
import {
  currentMonthKey,
  currentYearKey,
  shiftMonth,
  shiftWeek,
  shiftYear,
  weekStartKey,
} from '@/utils/dates';
import { periodLabel } from '@/utils/expenses';
import './ExpenseFilters.css';

const PERIODS: readonly ExpensePeriod[] = ['week', 'month', 'year'];

export const ExpenseFilters = () => {
  const { filters, setFilter, resetFilters } = useExpenseFilters();
  const categories = useAppSelector(selectSortedCategories);
  const { t } = useI18n();
  const f = t.expenses.filters;
  const [sheetOpen, setSheetOpen] = useState(false);

  const categoryOptions = useMemo(
    () => [
      { value: ALL, label: f.allCategories },
      ...categories.map((category) => ({ value: category.id, label: category.name })),
    ],
    [categories, f],
  );

  const paymentOptions = useMemo(
    () => [
      { value: ALL, label: f.anyPayment },
      ...PAYMENT_METHODS.map((method) => ({
        value: method,
        label: t.expenses.paymentMethods[method],
      })),
    ],
    [t, f],
  );

  const periodNames: Record<ExpensePeriod, string> = {
    week: f.thisWeek,
    month: f.thisMonth,
    year: f.thisYear,
  };

  /** Picking a period jumps to the current week, month or year. */
  const choosePeriod = (period: ExpensePeriod) => {
    setFilter('period', period);
    if (period === 'week') setFilter('week', weekStartKey());
    if (period === 'month') setFilter('month', currentMonthKey());
    if (period === 'year') setFilter('year', currentYearKey());
  };

  const isCurrent =
    filters.period === 'week'
      ? filters.week >= weekStartKey()
      : filters.period === 'year'
        ? filters.year >= currentYearKey()
        : filters.month >= currentMonthKey();

  const shift = (amount: number) => {
    if (filters.period === 'week') setFilter('week', shiftWeek(filters.week, amount));
    else if (filters.period === 'year') setFilter('year', shiftYear(filters.year, amount));
    else setFilter('month', shiftMonth(filters.month, amount));
  };

  // Search isn't counted: it stays on screen on phones.
  const activeCount =
    (filters.categoryId !== ALL ? 1 : 0) + (filters.paymentMethod !== ALL ? 1 : 0);
  const hasActiveFilters = activeCount > 0 || filters.search.trim() !== '';

  const periodNavigator = (
    <div
      role="group"
      aria-label={f.period}
      className="month-picker inline-flex h-10 min-w-0 items-center rounded-lg border border-line bg-surface"
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
        {periodLabel(filters)}
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

  const periodChoice = (
    <div
      role="group"
      aria-label={f.period}
      className="grid shrink-0 grid-cols-3 rounded-lg bg-sunken p-0.5"
    >
      {PERIODS.map((period) => (
        <button
          key={period}
          type="button"
          aria-pressed={filters.period === period}
          onClick={() => choosePeriod(period)}
          className={cn(
            'h-9 whitespace-nowrap rounded-md px-3 text-[0.8125rem] font-medium transition-colors',
            filters.period === period
              ? 'bg-accent text-accent-ink'
              : 'text-ink-muted hover:text-ink',
          )}
        >
          {periodNames[period]}
        </button>
      ))}
    </div>
  );

  const categorySelect = (className?: string) => (
    <Select
      label={f.category}
      hideLabel={!sheetOpen}
      value={filters.categoryId}
      options={categoryOptions}
      onChange={(event) => setFilter('categoryId', event.target.value)}
      wrapperClassName={cn('min-w-0', className)}
    />
  );

  const paymentSelect = (className?: string) => (
    <Select
      label={f.paymentMethod}
      hideLabel={!sheetOpen}
      value={filters.paymentMethod}
      options={paymentOptions}
      onChange={(event) => setFilter('paymentMethod', event.target.value as PaymentMethod)}
      wrapperClassName={cn('min-w-0', className)}
    />
  );

  const searchInput = (
    <Input
      label={f.search}
      hideLabel
      type="search"
      placeholder={f.searchPlaceholder}
      value={filters.search}
      onChange={(event) => setFilter('search', event.target.value)}
      leadingIcon={<Search />}
      wrapperClassName="min-w-0 flex-1"
    />
  );

  return (
    <div className="expense-filters flex min-w-0 flex-col gap-3">
      {/* Phones: search and a filter button; the rest lives in a sheet. */}
      <div className="flex min-w-0 flex-col gap-3 sm:hidden">
        <div className="flex min-w-0 gap-2">
          {searchInput}
          <Button
            variant="secondary"
            iconOnly
            icon={<SlidersHorizontal />}
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
            className="relative"
          >
            {activeCount > 0 ? f.openWithCount(activeCount) : f.open}
          </Button>
          {activeCount > 0 && (
            <span
              aria-hidden="true"
              className="pointer-events-none -ml-4 -mt-1 flex h-5 min-w-5 items-center justify-center self-start rounded-full bg-accent px-1 text-[0.6875rem] font-semibold text-accent-ink"
            >
              {activeCount}
            </span>
          )}
        </div>
        {periodNavigator}
      </div>

      {/* Wider screens: everything inline. */}
      <div className="hidden min-w-0 flex-col gap-3 sm:flex">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          {periodChoice}
          {periodNavigator}
        </div>
        <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-center">
          {searchInput}
          <div className="grid min-w-0 grid-cols-2 gap-3 lg:flex lg:shrink-0">
            {categorySelect('lg:w-44')}
            {paymentSelect('lg:w-40')}
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              icon={<X />}
              onClick={resetFilters}
              className="expense-filters__reset self-start lg:self-auto"
            >
              {f.clear}
            </Button>
          )}
        </div>
      </div>

      <Modal
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        size="sm"
        title={f.title}
        footer={
          <>
            {activeCount > 0 && (
              <Button variant="ghost" icon={<X />} onClick={resetFilters}>
                {f.clear}
              </Button>
            )}
            <Button onClick={() => setSheetOpen(false)}>{f.done}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4 pb-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">{f.period}</span>
            {periodChoice}
          </div>
          {categorySelect()}
          {paymentSelect()}
        </div>
      </Modal>
    </div>
  );
};
