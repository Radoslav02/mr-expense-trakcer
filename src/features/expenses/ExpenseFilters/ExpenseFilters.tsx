import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Modal } from '@/components/Modal';
import { Select } from '@/components/Select';
import { PAYMENT_METHODS } from '@/constants/expenses';
import { useExpenseFilters } from '@/hooks/useExpenseFilters';
import { useI18n } from '@/i18n';
import { selectSortedCategories } from '@/redux/categories/categoriesSelectors';
import { ALL, type PaymentMethod, type PeriodValue } from '@/types/expense';
import { cn } from '@/utils/cn';
import { PeriodChoice, PeriodNavigator } from '../PeriodPicker';
import './ExpenseFilters.css';

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

  const period: PeriodValue = filters;
  const setPeriod = (next: PeriodValue) => {
    setFilter('period', next.period);
    setFilter('week', next.week);
    setFilter('month', next.month);
    setFilter('year', next.year);
  };

  // Search isn't counted: it stays on screen on phones.
  const activeCount =
    (filters.categoryId !== ALL ? 1 : 0) + (filters.paymentMethod !== ALL ? 1 : 0);
  const hasActiveFilters = activeCount > 0 || filters.search.trim() !== '';

  const periodNavigator = <PeriodNavigator value={period} onChange={setPeriod} />;
  const periodChoice = <PeriodChoice value={period} onChange={setPeriod} />;

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
